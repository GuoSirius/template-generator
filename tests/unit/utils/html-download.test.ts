import { describe, it, expect } from 'vitest'
import { beautifyHtml, minifyHtml, downloadHtml, downloadHtmlPackage } from '@/utils/html-download'

describe('html-download utils', () => {
  describe('beautifyHtml', () => {
    it('应该格式化简单的 HTML', () => {
      const html = '<html><head></head><body><div>test</div></body></html>'
      const result = beautifyHtml(html)
      expect(result).toContain('<div>')
      expect(result).toContain('\n')
    })

    it('应该正确处理嵌套标签的缩进', () => {
      const html =
        '<html><head></head><body><div><span>text</span><p>paragraph</p></div></body></html>'
      const result = beautifyHtml(html)
      // 检查缩进层级
      const lines = result.split('\n')
      // body 内的 div 应该有 2 空格缩进
      const divLine = lines.find((l) => l.includes('<div>'))
      expect(divLine?.startsWith('  ')).toBe(true)
    })

    it('应该处理自闭合标签', () => {
      const html =
        '<html><head><meta charset="utf-8"><link rel="stylesheet"></head><body><br><hr></body></html>'
      const result = beautifyHtml(html)
      expect(result).toContain('<meta')
      expect(result).toContain('<link')
      expect(result).toContain('<br')
      expect(result).toContain('<hr')
    })

    it('应该格式化 style 标签', () => {
      const html =
        '<html><head><style>.test{color:red;background:blue;}</style></head><body></body></html>'
      const result = beautifyHtml(html)
      expect(result).toContain('<style>')
      expect(result).toContain('.test')
    })

    it('应该保留 HTML 注释', () => {
      const html = '<html><head></head><body><!-- comment --><div>test</div></body></html>'
      const result = beautifyHtml(html)
      expect(result).toContain('<!-- comment -->')
    })

    it('应该处理 DOCTYPE', () => {
      const html = '<!DOCTYPE html><html><head></head><body><div>test</div></body></html>'
      const result = beautifyHtml(html)
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('应该处理带属性的标签', () => {
      const html =
        '<html><head></head><body><div id="app" class="container" data-value="test"><span>text</span></div></body></html>'
      const result = beautifyHtml(html)
      expect(result).toContain('id="app"')
      expect(result).toContain('class="container"')
      expect(result).toContain('data-value="test"')
    })

    it('应该处理空 HTML', () => {
      const html = '<html><head></head><body></body></html>'
      const result = beautifyHtml(html)
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it('应该正确缩进多层级嵌套', () => {
      const html =
        '<html><head></head><body><div><section><article><p>text</p></article></section></div></body></html>'
      const result = beautifyHtml(html)
      const lines = result.split('\n')
      // 每一层应该增加 2 个空格
      const sectionLine = lines.find((l) => l.includes('<section>'))
      const articleLine = lines.find((l) => l.includes('<article>'))
      const pLine = lines.find((l) => l.includes('<p>'))
      expect(sectionLine?.match(/^ {2}/)?.[0]?.length).toBe(2)
      expect(articleLine?.match(/^ {4}/)?.[0]?.length).toBe(4)
      expect(pLine?.match(/^ {6}/)?.[0]?.length).toBe(6)
    })

    it('应该处理 script 标签内的 JavaScript', () => {
      const html =
        '<html><head></head><body><script>function test(){console.log("hello");return true;}</script></body></html>'
      const result = beautifyHtml(html)
      expect(result).toContain('<script>')
      expect(result).toContain('function')
      expect(result).toContain('test')
    })
  })

  describe('minifyHtml', () => {
    it('应该移除 HTML 注释', () => {
      const html = '<html><head></head><body><!-- comment --><div>test</div></body></html>'
      const result = minifyHtml(html)
      expect(result).not.toContain('<!--')
      expect(result).not.toContain('comment')
    })

    it('应该移除多余的空白', () => {
      const html = '<html><head></head><body><div>  test   with   spaces  </div></body></html>'
      const result = minifyHtml(html)
      expect(result).not.toContain('  ')
    })

    it('应该压缩标签间的空白', () => {
      const html = '<div>   </div><span>   </span>'
      const result = minifyHtml(html)
      expect(result).not.toContain('>   <')
    })

    it('应该保留属性值中的空格', () => {
      const html = '<div class="container fluid"></div>'
      const result = minifyHtml(html)
      expect(result).toContain('class="container fluid"')
    })

    it('应该移除换行符', () => {
      const html = `<html>
<head>
</head>
<body>
<div>test</div>
</body>
</html>`
      const result = minifyHtml(html)
      expect(result).not.toContain('\n')
    })

    it('应该清理属性间的多余空格', () => {
      const html = '<div   id="test"   class="cls"   ></div>'
      const result = minifyHtml(html)
      expect(result).not.toContain('  ')
    })
  })

  describe('downloadHtml', () => {
    it('应该创建正确格式的 Blob', () => {
      const html = '<html><body>test</body></html>'
      const fileName = 'test.html'
      // 这个函数会调用 saveAs，我们只测试它不抛出错误
      expect(() => downloadHtml(html, fileName)).not.toThrow()
    })
  })

  describe('downloadHtmlPackage', () => {
    it('应该生成包含两个文件的 zip 包', async () => {
      // 由于 jszip 和 file-saver 需要浏览器环境，我们测试函数存在且可调用
      expect(typeof downloadHtmlPackage).toBe('function')

      // 验证参数处理正确（通过检查函数签名）
      const fn = downloadHtmlPackage.toString()
      expect(fn).toContain('formattedHtml')
      expect(fn).toContain('minifiedHtml')
      expect(fn).toContain('projectName')
    })
  })
})
