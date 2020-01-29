import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

// TODO (abiro) unsafe-inline is required to make react-static work. Issue to
// for react-static builds that don't require unsafe-inline:
// https://github.com/react-static/react-static/issues/1362
// TODO (abiro) get domains from config
const connectDomains = DEBUG
  ? '*'
  : 'https://mu6dcl77sd.execute-api.us-west-2.amazonaws.com https://dokknet-api.com https://staging.dokknet-api.com https://cognito-idp.us-west-2.amazonaws.com/'

// Content security policy
// Cloudflare will reject header values with new line, hence the replace.
const CSP = `
default-src 'none'; 
prefetch-src 'self';
script-src 'self' 'unsafe-inline'; 
connect-src 'self' ${connectDomains};
img-src 'self'; 
style-src 'self' 'unsafe-inline';
base-uri 'self';
frame-ancestors 'none';
form-action 'self';
`.replace(/(?:\r\n|\r|\n)/g, ' ')

// HTTP Strict-Transport-Security
// 2 years and include in browsers preload list.
const HSTS = 'max-age=63072000; includeSubDomains; preload'

addEventListener('fetch', event => {
  try {
    const response = handleEvent(event).then(addSecurityHeaders)
    event.respondWith(response)
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    } else {
      event.respondWith(new Response('Internal Error', { status: 500 }))
    }
  }
})

function addSecurityHeaders(response) {
  response.headers.set('Content-Security-Policy', CSP)
  response.headers.set('Strict-Transport-Security', HSTS)
  return response
}

async function handleEvent(event) {
  const options = {}

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }
    return await getAssetFromKV(event, options)
  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        const notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req =>
            new Request(`${new URL(req.url).origin}/404.html`, req),
        })

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404,
        })
      } catch (e) {}
    } else {
      return new Response(e.message || e.toString(), { status: 500 })
    }
  }
}
