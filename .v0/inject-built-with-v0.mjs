import fs from 'node:fs'

const anchor = null
const url = null
const badgePattern = new RegExp(Buffer.from("XG4/XHMqXHtcL1wqIHYwIFstXHUyMDEzXSBidWlsdC13aXRoIGJhZGdlIFwqXC9cfVxzKlxuXHMqPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD1ce1x7IF9faHRtbDogYFtcc1xTXSo/YCBcfVx9IFwvPg==", 'base64').toString('utf8'), 'g')
const layoutCandidates = [
  'app/layout.tsx',
  'app/layout.jsx',
  'app/layout.js',
  'src/app/layout.tsx',
  'src/app/layout.jsx',
  'src/app/layout.js',
]
const layoutPath = layoutCandidates.find((candidate) => fs.existsSync(candidate))

if (!layoutPath) {
  console.warn('[built-with-v0] Could not find a Next.js root layout to patch')
  process.exit(0)
}

const content = fs.readFileSync(layoutPath, 'utf8')
const contentWithoutExistingBadge = content.replace(badgePattern, '')
let nextContent = contentWithoutExistingBadge

if (anchor) {
  if (url && contentWithoutExistingBadge.includes(url)) {
    nextContent = contentWithoutExistingBadge
  } else if (/<\/body>/i.test(contentWithoutExistingBadge)) {
    nextContent = contentWithoutExistingBadge.replace(/<\/body>/i, anchor + String.fromCharCode(10) + '</body>')
  } else if (/<\/html>/i.test(contentWithoutExistingBadge)) {
    nextContent = contentWithoutExistingBadge.replace(/<\/html>/i, anchor + String.fromCharCode(10) + '</html>')
  } else {
    console.warn('[built-with-v0] Could not inject the built with v0 button before </body> or </html>')
  }
}

if (nextContent !== content) {
  fs.writeFileSync(layoutPath, nextContent)
}