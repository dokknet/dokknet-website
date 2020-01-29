import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'

import { getUserName, loadOTPSession, requestOTP, signIn } from 'api/auth'
import useIsLoggedIn from 'hooks/is-logged-in'
import PageNav from 'components/PageNav'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'

const LoggedIn: React.FC = () => {
  const [userName, setUserName] = useState(undefined)

  useEffect(() => {
    getUserName().then(setUserName)
  }, [])

  return (
    <div className="text-center">
      <p>Logged in as:</p>
      <p className="font-weight-bold">{userName}</p>
    </div>
  )
}

interface RequestProps {
  requestedPass: boolean
  setRequestedPass: Dispatch<SetStateAction<boolean>>
  setShowError: Dispatch<SetStateAction<boolean>>
  userEmail?: string
}

const RequestOTP: React.FC<RequestProps> = props => {
  const { requestedPass, setRequestedPass, setShowError, userEmail } = props

  const [canSubmit, setCanSubmit] = useState(true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (requestedPass || !canSubmit) {
      return
    }
    setCanSubmit(false)
    const data = new FormData(e.currentTarget)
    const email = data.get('email').toString()
    requestOTP(email)
      .then(() => {
        setCanSubmit(true)
        setRequestedPass(true)
        setShowError(false)
      })
      .catch(err => {
        setCanSubmit(true)
        setRequestedPass(false)
        setShowError(true)
        console.error(err)
      })
  }

  return (
    <form className="mt-3" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="inputEmail">Request one-time password</label>
        <input
          name="email"
          type="email"
          id="inputEmail"
          className="form-control"
          defaultValue={userEmail}
          placeholder="Email address"
          autoFocus={!requestedPass}
          required
        />
        <small className="form-text text-muted">
          Your first login registers you automatically.
        </small>
      </div>
      {!requestedPass && (
        <Button
          type="submit"
          variant="outline-primary"
          className="float-right"
          disabled={!canSubmit}
        >
          Submit
        </Button>
      )}
    </form>
  )
}

interface SubmitProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
  setRequestedPass: Dispatch<SetStateAction<boolean>>
  setShowError: Dispatch<SetStateAction<boolean>>
}

const SubmitOTP: React.FC<SubmitProps> = props => {
  const { setIsLoggedIn, setRequestedPass, setShowError } = props

  const [canSubmit, setCanSubmit] = useState(true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) {
      return
    }
    setCanSubmit(false)

    const data = new FormData(e.currentTarget)
    const otp = data.get('otp').toString()
    signIn(otp)
      .then(() => {
        setCanSubmit(true)
        setIsLoggedIn(true)
        setShowError(false)
      })
      .catch(err => {
        setCanSubmit(true)
        setIsLoggedIn(false)
        setRequestedPass(false)
        setShowError(true)
        console.error(err)
      })
  }

  return (
    <form className="mt-3" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="inputEmail">
          Please enter the one-time password that was sent to your email
        </label>
        <input
          name="otp"
          type="text"
          id="inputOTP"
          className="form-control"
          placeholder="One-time password"
          autoComplete="off"
          autoCapitalize="none"
          autoFocus={true}
          required
        />
        <small className="form-text text-muted">
          If you haven't received the password, check your spam folder please.
        </small>
      </div>
      <Button
        variant="outline-secondary"
        disabled={!canSubmit}
        onClick={() => setRequestedPass(false)}
      >
        Reset
      </Button>
      <Button
        type="submit"
        variant="outline-primary"
        className="float-right"
        disabled={!canSubmit}
      >
        Submit
      </Button>
    </form>
  )
}

interface OTPFormProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
  setShowError: Dispatch<SetStateAction<boolean>>
}

const OTPForm: React.FC<OTPFormProps> = props => {
  const { setIsLoggedIn, setShowError } = props

  const [requestedPass, setRequestedPass] = useState(false)
  const [userEmail, setUserEmail] = useState(undefined)

  // Allow submitting otp if there is an otp session in local storage
  useEffect(() => {
    try {
      const user = loadOTPSession()
      if (user) {
        setRequestedPass(true)
        setUserEmail(user.getUsername())
      }
    } catch (e) {}
  }, [])

  return (
    <div>
      <RequestOTP
        userEmail={userEmail}
        requestedPass={requestedPass}
        setRequestedPass={setRequestedPass}
        setShowError={setShowError}
      />
      {requestedPass && (
        <SubmitOTP
          setIsLoggedIn={setIsLoggedIn}
          setRequestedPass={setRequestedPass}
          setShowError={setShowError}
        />
      )}
    </div>
  )
}

interface LoggedOutProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
}

const LoggedOut: React.FC<LoggedOutProps> = ({ setIsLoggedIn }) => {
  const [checkingOTPQuery, setCheckingOTPQuery] = useState(false)
  const [showError, setShowError] = useState(false)

  // TODO (abiro) factor out
  // Login user with OTP from query param if present.
  useEffect(() => {
    const searchParams = new window.URLSearchParams(window.location.search)
    const otp = searchParams.get('otp')

    // Can't put into Promise.finally, bc component might be unmounted by then.
    // Can't use hook cleanup, bc component may not be unmounted depending on
    // logic, but cleanup still needs to be executed.
    function cleanUp() {
      setCheckingOTPQuery(false)
      // Clear OTP query
      window.history.replaceState(null, null, window.location.pathname)
    }

    if (otp) {
      setCheckingOTPQuery(true)
      signIn(otp)
        .then(() => {
          cleanUp()
          setIsLoggedIn(true)
        })
        .catch(err => {
          cleanUp()
          setShowError(true)
          console.error(err)
        })
    }
  }, [])

  // TODO (abiro) remove warning once support case is resolved
  return (
    <div>
      <Alert variant="warning" className="text-center">
        Please check back tomorrow to test login. We are waiting for AWS Support to lift the SES sandbox and let us send login emails.
      </Alert>
      {checkingOTPQuery ? (
        <Alert variant="primary" className="text-center">
          Checking one-time password from link...
        </Alert>
      ) : (
        <OTPForm setIsLoggedIn={setIsLoggedIn} setShowError={setShowError} />
      )}
      {showError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setShowError(false)}
          className="mt-3"
        >
          There was an error signing you in. Please request a new one-time
          password and try again!
        </Alert>
      )}
    </div>
  )
}

const Login: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useIsLoggedIn()

  return (
    <div className="vh-100">
      <PageNav isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Container className="h-25" />
      <Container className="h-75">
        <Row>
          <Col xs={1} sm={2} md={3} lg={4} />
          <Col>
            <h1 className="h1 mb-5 text-center">Paywall Login</h1>
            {isLoggedIn ? (
              <LoggedIn />
            ) : (
              <LoggedOut setIsLoggedIn={setIsLoggedIn} />
            )}
          </Col>
          <Col xs={1} sm={2} md={3} lg={4} />
        </Row>
      </Container>
    </div>
  )
}

export default Login
