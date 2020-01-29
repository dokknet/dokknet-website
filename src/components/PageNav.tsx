import Navbar from 'react-bootstrap/Navbar'
import { Link } from '@reach/router'
import Nav from 'react-bootstrap/Nav'
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react'
import Container from 'react-bootstrap/Container'

import { isAuthenticated, signOut } from 'api/auth'

interface Props {
  isLoggedIn: boolean
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
}

const PageNav: React.FC<Props> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [logoutDisabled, setLogoutDisabled] = useState(false)

  function handleLogout(e: React.MouseEvent<HTMLAnchorElement>): void {
    e.preventDefault()
    setLogoutDisabled(true)
    signOut()
      .then(() => {
        setIsLoggedIn(false)
        setLogoutDisabled(false)
      })
      .catch(err => {
        // Can't use finally, bc component might be unmounted by the time
        // finally is called.
        setLogoutDisabled(false)
        console.error(err)
      })
  }

  useEffect(() => {
    isAuthenticated().then(loggedIn => {
      if (loggedIn) {
        setIsLoggedIn(true)
      }
    })
  }, [])

  return (
    <Container>
      <Navbar bg="white" variant="light" className="mb-auto">
        <Navbar.Brand as={Link} to="/">
          Dokknet
        </Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link target="_blank" href="https://dokknet-example.com/">
            Example
          </Nav.Link>
          <Nav.Link target="_blank" href="https://github.com/dokknet/dokknet/blob/master/forking.md">
            Fork
          </Nav.Link>
        </Nav>
        {isLoggedIn ? (
          <Nav.Link
            onClick={handleLogout}
            disabled={logoutDisabled}
            className="ml-auto pr-0"
            as={Link}
            to="#"
          >
            Logout
          </Nav.Link>
        ) : (
          <Nav.Link className="ml-auto pr-0" as={Link} to="/login">
            Login
          </Nav.Link>
        )}
      </Navbar>
    </Container>
  )
}

export default PageNav
