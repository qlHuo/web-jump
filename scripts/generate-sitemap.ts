import * as fs from 'fs'
import * as path from 'path'

const baseUrl = 'https://websites.holyer.site'
const routes = ['/', '/search']

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
  )
  .join('')}
</urlset>`

fs.writeFileSync(path.resolve('dist/sitemap.xml'), sitemap)
console.log('✅ sitemap.xml generated')
