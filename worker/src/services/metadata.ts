// src/utils/metadata.ts

/**
 * 获取网站元数据（使用正则表达式解析 HTML）
 * @param url - 目标 URL
 * @returns 包含 title、description、favicon 的对象
 */
export async function fetchWebsiteMetadata(url: string): Promise<{
  title?: string
  description?: string
  favicon?: string
}> {
  try {
    // 验证 URL 格式
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid URL protocol')
    }

    // 更真实的浏览器请求头
    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    }

    // 添加 Referer（可选，但有时有用）
    if (parsedUrl.hostname !== 'localhost' && !parsedUrl.hostname.endsWith('.local')) {
      headers['Referer'] = `${parsedUrl.protocol}//${parsedUrl.hostname}/`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // 检测是否被重定向到验证码页面
    if (html.includes('验证码') || html.includes('risk-captcha') || html.includes('验证')) {
      console.warn(`Detected captcha page for ${url}, returning fallback metadata`)
      return {
        title: parsedUrl.hostname,
        description: undefined,
        favicon: undefined,
      }
    }

    // 提取标题 - 按优先级顺序
    let title: string | undefined

    // 1. <title> 标签
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch && titleMatch[1]) {
      title = cleanText(titleMatch[1])
    }

    // 2. Open Graph title
    if (!title) {
      const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      if (ogTitleMatch && ogTitleMatch[1]) {
        title = cleanText(ogTitleMatch[1])
      }
    }

    // 3. h1 标签
    if (!title) {
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
      if (h1Match && h1Match[1]) {
        title = cleanText(h1Match[1])
      }
    }

    // 4. 默认使用域名
    if (!title) {
      title = parsedUrl.hostname
    }

    // 提取描述
    let description: string | undefined

    // 1. meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    if (descMatch && descMatch[1]) {
      description = cleanText(descMatch[1])
    }

    // 2. Open Graph description
    if (!description) {
      const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      if (ogDescMatch && ogDescMatch[1]) {
        description = cleanText(ogDescMatch[1])
      }
    }

    // 提取 favicon
    let favicon: string | undefined

    const faviconPatterns = [
      /<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+rel=["']shortcut icon["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+rel=["']mask-icon["'][^>]+href=["']([^"']+)["']/i,
    ]

    for (const pattern of faviconPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        favicon = match[1].trim()
        break
      }
    }

    // 处理相对路径
    if (favicon && !favicon.startsWith('http')) {
      try {
        favicon = new URL(favicon, parsedUrl).href
      } catch {
        favicon = undefined
      }
    }

    // 如果没有找到 favicon，尝试默认路径
    if (!favicon) {
      favicon = `${parsedUrl.origin}/favicon.ico`
    }

    return {
      title: title || undefined,
      description: description || undefined,
      favicon: favicon || undefined,
    }
  } catch (error) {
    console.error(`Failed to fetch metadata for ${url}:`, error)
    return {
      title: new URL(url).hostname,
      description: undefined,
      favicon: undefined,
    }
  }
}

/**
 * 清理文本内容，去除多余空白字符
 * @param text - 原始文本
 * @returns 清理后的文本
 */
function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}
