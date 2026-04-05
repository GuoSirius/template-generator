// Cloudflare Pages SPA Routing Function
// This handles client-side routing by serving index.html for all non-asset requests

export async function onRequest({ request, next }) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Allow static assets through (JS, CSS, images, fonts)
  const isAsset =
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|webp)$/i.test(pathname) ||
    pathname.startsWith('/assets/')

  if (isAsset) {
    return next()
  }

  // For all other requests (including HTML pages), serve index.html
  const response = await next()

  // If the response is 404, return index.html instead
  if (response.status === 404) {
    const indexRequest = new Request(`${url.origin}/index.html`, request)
    return fetch(indexRequest)
  }

  return response
}
