import Auth from '@aws-amplify/auth'
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js'

// TODO (abiro) move to config
// TODO (abiro) use dokknet-api.com once DNS cache is updated
const AUTH_API = 'https://mu6dcl77sd.execute-api.us-west-2.amazonaws.com/v1/auth'
const CLIENT_ID = '7b3vl6j8fqgm29tvq9uhlblakq'
const OTP_SESSION_TTL = 4 * 60 * 1000 // milliseconds
const USER_POOL_ID = 'us-west-2_NSgxjlgPx'

Auth.configure({
  region: 'us-west-2',
  userPoolId: USER_POOL_ID,
  userPoolWebClientId: CLIENT_ID,
  oauth: {
    options: { AdvancedSecurityDataCollectionFlag: true },
  },
})

interface OTPSession {
  username: string
  session: string
  // Milliseconds after epoch
  expiresAt: number
}

async function callAuthApi(session: CognitoUserSession, method: string,
                           path: string) {

  // TODO should use access token with custom scope, bc id token can not
  // be revoked.
  const token = session.getIdToken().getJwtToken()

  return new Promise((resolve, reject) => {
    // Fetch doesn't support setting cross-origin cookies.
    const xhr = new XMLHttpRequest()
    const url = AUTH_API + path
    xhr.open(method, url, true)
    xhr.withCredentials = true
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else {
          reject(xhr.statusText)
        }
      }
    }
    xhr.send(null)
  })
}

// Remove session cookie for user on the auth api domain.
// This cookie is used to authenticate the user for doc sites on the network.
async function clearAuthApiCookie(session: CognitoUserSession) {
  return callAuthApi(session, 'DELETE', '/session-cookie')
}

function clearOTPSession() {
  window.localStorage.removeItem('OTPSession')
}

// Generate length 32 secure random password in base-64 encoding
function generatePassword(): string {
  // 24 base-256 numbers are turned into 32 base-64
  const a = new Uint8Array(24)
  window.crypto.getRandomValues(a)
  return window.btoa(String.fromCharCode.apply(null, a))
}

// Set session cookie for user on the auth api domain.
// This cookie is used to authenticate the user for doc sites on the network.
async function setAuthApiCookie(session: CognitoUserSession) {
  return callAuthApi(session, 'GET', '/session-cookie')
}

async function signUp(email: string) {
  const params = {
    username: email,
    // Signup needs a password, but it can be never used.
    password: generatePassword(),
  }
  return await Auth.signUp(params)
}

function storeOTPSession(cognitoUser: CognitoUser) {
  // Session isn't exposed to TypeScript, but it's a public member in JS
  const session = (cognitoUser as any).Session
  const expiresAt = window.Date.now() + OTP_SESSION_TTL
  const otpSession: OTPSession = {
    session,
    expiresAt,
    username: cognitoUser.getUsername(),
  }
  const json = window.JSON.stringify(otpSession)
  window.localStorage.setItem('OTPSession', json)
}

export async function getUserName(): Promise<string> {
  const user = await Auth.currentUserPoolUser()
  return user.getUsername()
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    await Auth.currentSession()
    return true
  } catch {
    return false
  }
}

export function loadOTPSession(): CognitoUser {
  const raw = window.localStorage.getItem('OTPSession')
  if (!raw) {
    throw new Error('No OTP session')
  }
  const otpSession: OTPSession = window.JSON.parse(raw)
  if (otpSession.expiresAt < window.Date.now()) {
    clearOTPSession()
    throw new Error('Stored OTP session has expired')
  }
  const username = otpSession.username
  // Accessing private method of Auth here which is BAD, but it's still the
  // safest way to restore the OTP session from local storage, as there
  // is no interface that lets us do it.
  // (If we created a new user pool object here instead to pass to a
  // CognitoUser constructor that would likely result in hard to catch bugs,
  // as Auth can assume that all CognitoUsers passed to it come from its pool
  // object.)
  const user: CognitoUser = (Auth as any).createCognitoUser(username)
    // Session is not exposed to TypeScript, but it's a public member in the
    // JS code.
  ;(user as any).Session = otpSession.session
  return user
}

// Request one-time password over email
export async function requestOTP(email: string): Promise<void> {
  let cognitoUser
  try {
    cognitoUser = await Auth.signIn(email)
  } catch {
    // TODO (abiro) catch specific error
    // If it's first login, sign the user up first.
    await signUp(email)
    cognitoUser = await Auth.signIn(email)
  }
  storeOTPSession(cognitoUser)
}

// Submit one-time password to log in.
// Resolves if the user successfully authenticated and errors otherwise.
export async function signIn(otp: string): Promise<void> {
  const storedUser = loadOTPSession()
  const user = await Auth.sendCustomChallengeAnswer(storedUser, otp)
  clearOTPSession()
  const session = await Auth.userSession(user)
  try {
    await setAuthApiCookie(session)
  } catch (e) {
    // Make sure Cognito sign in + setting auth api cookie succeed or fail as a
    // unit.
    await Auth.signOut()
    throw e
  }
}

export async function signOut(): Promise<void> {
  const session = await Auth.currentSession()
  await clearAuthApiCookie(session)
  await Auth.signOut()
}

