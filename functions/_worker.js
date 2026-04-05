// Cloudflare Pages SPA Routing Function
// 所有非静态资源请求直接返回 index.html

export async function onRequest(context) {
  const { request, next } = context
  const url = new URL(request.url)
  const pathname = url.pathname

  // 静态资源直接通过
  const isStaticAsset =
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|webp)$/i) ||
    pathname.startsWith('/assets/') ||
    pathname === '/favicon.svg'

  if (isStaticAsset) {
    return next()
  }

  // SPA fallback: 返回 index.html
  const response = await fetch(new Request(new URL('/index.html', url.origin), request))
  return new Response(response.body, {
    status: 200,
    headers: response.headers,
  })
}
