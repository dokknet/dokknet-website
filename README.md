# Dokknet Website

Status: prototype

## Overview

This repository contains the Dokknet website, which provides a landing page, a paywall login page and a user dashboard for managing subscriptions (the dashboard is TODO).

The website is a progressive web application built with [react-static](https://github.com/react-static/react-static) and it's deployed with [Cloudflare Workers Sites](https://developers.cloudflare.com/workers/sites/).

## Development

### Prerequesities

1. Node 12 (recommended install via [Node Version Manager](https://github.com/nvm-sh/nvm)) 
1. The latest version of [yarn](https://yarnpkg.com/lang/en/).

### Run locally

From the repo root:

1. `yarn install`
2. `yarn start`

## Deployment

### Prerequisites

1. Development prerequisites.
1. A Cloudflare account with a domain added* and with Workers Unlimited enabled. Note your Cloudflare account id and zone id for later. (You can find them on the Overview page of the [Cloudflare Dashboard](https://dash.cloudflare.com/) for your domain on the right side towards the bottom of the page.)

\*It is not neccessary to set up a domain if you just want a dev deployment.
In this case you can use the Worker's subdomain that is added for you automatically.

### One-time setup

1. Create an A record for your domain pointing to 192.0.2.1. This is an illustrative IP address and Cloudflare will never proxy traffic to it as requests will be intercepted by the worker, but without an A record the DNS won't resolve.
1. Create an API token in the [your Cloudflare profile](https://dash.cloudflare.com/profile/api-tokens) (use "Edit Cloudflare Workers" template) and save it in a secure location (eg. password manager).
1. Edit the domains in `wrangler.toml` to your domains.

### Credentials

Provide Cloudflare credentials in the `CF_ACCOUNT_ID`, `CF_ZONE_ID` and `CF_API_TOKEN` environment variables.

### Deployment command

From the repo root:

1. `yarn install` 
1. `yarn deploy` to deploy to the development environment or `yarn deploy -e {production|staging}` to deploy to production/staging.

The `yarn deploy` command deploys to the dev environment by default. To deploy to production or staging, run `yarn deploy -e production` or `yarn deploy -e staging` instead.

