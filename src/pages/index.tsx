import React from 'react'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import PageNav from 'components/PageNav'

import useIsLoggedIn from 'hooks/is-logged-in'

export default () => {
  const [isLoggedIn, setIsLoggedIn] = useIsLoggedIn()

  return (
    <div className="vh-100">
      <PageNav isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Container>
        <Row>
          <Col md={1} lg={2} />
          <Col className="my-auto">
            <Alert variant="primary" className="text-center my-5">
              Request beta invite for your project{' '}
              <Alert.Link href="https://github.com/dokknet/dokknet/issues/1">
                here.
              </Alert.Link>
            </Alert>
          </Col>
          <Col md={1} lg={2} />
        </Row>
        <Row>
          <Col className="text-center">
            <h1 className="mb-5">Documentation Paywall Network</h1>
          </Col>
        </Row>
        <Row>
          <Col md={1} lg={2} />
          <Col className="text-justify">
            <p>
              Dokknet is a paywall-as-a-service for open source documentation
              sites. It provides central authentication, subscription management
              and payouts. Dokknet makes it{' '}
              <span className="font-weight-bold">
                easy for open source developers
              </span>{' '}
              to derive a regular income from their work and makes it{' '}
              <span className="font-weight-bold">easy for companies</span> to
              pay for their work.
            </p>
            <h3>How it works</h3>
            <p>
              New users don't notice the paywall, but if they return daily, they
              will be asked to sign up for a monthly subscription after a trial.
              Individual users pay a variable price with the option to pay $0
              and teams pay a fixed price per seat. Think of the paywall as a{' '}
              <span className="font-weight-bold">convenience tax</span> instead
              of a "wall". Read more about why a paywall is a good idea in{' '}
              <a
                className="text-muted"
                href="https://blog.agostbiro.com/?p=2878"
              >
                A New Open Source Business Model.
              </a>
            </p>
            <h3>Integration</h3>
            <p>
              Integrating the paywall on your site involves installing a plugin
              for your documentation framework and adding a middleware for your
              hosting solution. There is a kill switch in the middleware, so you
              can disable the paywall any time. Check out the{' '}
              <a className="text-muted" href="https://dokknet-example.com">
                example integration
              </a>{' '}
              or read more about the technical details in the{' '}
              <a
                className="text-muted"
                href="https://blog.agostbiro.com/?p=2904"
              >
                paywall design.
              </a>
            </p>
            <h3>Fees</h3>
            <p>
              Dokknet charges 3% of subscription revenues + Stripe fees. The
              long term goal is to provide the services at a flat 1% fee
              (including payment charges).
            </p>
            <h3>Status</h3>
            <p>
              Dokknet is currently a prototype with a beta version on the way.
              You can request a beta invite for your project{' '}
              <a
                className="text-muted"
                href="https://github.com/dokknet/dokknet/issues/1"
              >
                here.
              </a>
            </p>
            <h3>Forking</h3>
            <p>
              Dokknet is a{' '}
              <a
                className="text-muted"
                href="https://blog.agostbiro.com/?p=2901"
              >
                forkable company.
              </a>{' '}
              You can find forking instructions{' '}
              <a
                className="text-muted"
                href="https://github.com/dokknet/dokknet/blob/master/forking.md"
              >
                here.
              </a>
            </p>
          </Col>
          <Col md={1} lg={2} />
        </Row>
      </Container>
    </div>
  )
}
