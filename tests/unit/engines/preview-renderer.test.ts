import { describe, it, expect } from 'vitest'
import { buildPreviewHtml, buildSnippetPreviewHtml } from '@/engines/preview-renderer'

describe('buildPreviewHtml', () => {
  it('should build full HTML document', () => {
    const html = buildPreviewHtml('<p>content</p>')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<p>content</p>')
    expect(html).toContain('</html>')
  })

  it('should include SEO meta tags', () => {
    const html = buildPreviewHtml('<p>content</p>', '', 'My Title', 'My Desc', 'kw1,kw2')
    expect(html).toContain('<title>My Title</title>')
    expect(html).toContain('name="description" content="My Desc"')
    expect(html).toContain('name="keywords" content="kw1,kw2"')
  })

  it('should include custom CSS', () => {
    const html = buildPreviewHtml('<p>content</p>', 'body { color: red; }')
    expect(html).toContain('body { color: red; }')
  })

  it('should escape HTML in SEO fields', () => {
    const html = buildPreviewHtml('<p>content</p>', '', '<script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('buildSnippetPreviewHtml', () => {
  it('should build snippet preview HTML', () => {
    const html = buildSnippetPreviewHtml('<div>snippet</div>')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<div>snippet</div>')
  })

  it('should include custom CSS in snippet preview', () => {
    const html = buildSnippetPreviewHtml('<div>snippet</div>', '.test { color: blue; }')
    expect(html).toContain('.test { color: blue; }')
  })
})
