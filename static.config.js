import path from 'path'

import React from 'react'


function getCSPString(inlineScripts) {
  let scriptSources = ''
  for (let k in inlineScripts) {
    scriptSources += `'${inlineScripts[k].hash}'`
  }
  // TODO (abiro) remove style unsafe inline
  // Solution: https://github.com/reach/router/issues/63#issuecomment-575748441
  const csp = `
  default-src 'none'; 
  prefetch-src 'self';
  script-src 'self' ${scriptSources};
  connect-src 'self' https://api.dokknet.com https://cognito-idp.us-west-2.amazonaws.com;
  img-src 'self'; 
  style-src 'self' 'unsafe-inline';
  base-uri 'self';
  frame-ancestors 'none';
  form-action 'self';
  `.replace(/(?:\r\n|\r|\n)/g, ' ')

  return csp
}

export default {
  entry: 'index.tsx',
  plugins: [
    'react-static-plugin-typescript',
    [
      require.resolve('react-static-plugin-source-filesystem'),
      {
        location: path.resolve('./src/pages'),
      },
    ],
    require.resolve('react-static-plugin-reach-router'),
    require.resolve('react-static-plugin-sitemap'),
  ],
  Document: ({
               Html,
               Head,
               Body,
               children,
               state: {inlineScripts},
             }) => {
    return (
      <Html lang="en-US">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Body>{children}</Body>
      </Html>
    )
  }
}
