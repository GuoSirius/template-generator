import { describe, it, expect } from 'vitest'
import { buildPreviewHtml, buildSnippetPreviewHtml } from '@/engines/preview-renderer'

// Template with <%= %> syntax (matches real project templates)
const TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title><%= title %></title>
  <meta name="description" content="<%= description %>">
  <meta name="keywords" content="<%= keywords %>">
</head>
<body><main>Content</main></body>
</html>`

describe('buildPreviewHtml', () => {
  it('should return HTML with doctype and html structure', () => {
    const html = buildPreviewHtml(TEMPLATE)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html')
    expect(html).toContain('</html>')
  })

  it('should render SEO title value in output', () => {
    const html = buildPreviewHtml(TEMPLATE, '', 'My Title', '', '')
    // The title gets rendered via lodash template into a <style> block
    expect(html).toContain('My Title')
  })

  it('should handle empty SEO fields without error', () => {
    const html = buildPreviewHtml(TEMPLATE, '', '', '', '')
    expect(html).toContain('<!DOCTYPE html>')
  })
})

describe('buildSnippetPreviewHtml', () => {
  it('should create complete HTML wrapping snippet content', () => {
    const html = buildSnippetPreviewHtml('<div class="hero">Hero Content</div>')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<div class="hero">Hero Content</div>')
    expect(html).toContain('</html>')
  })

  it('should embed custom CSS in style tag', () => {
    const html = buildSnippetPreviewHtml('<p>snippet</p>', '.s { color: red; }')
    expect(html).toContain('.s { color: red; }')
  })
})
