const INVISIBLE = '\u2060'
const URL_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/gi

function countText(text) {
  return Array.from((text || '').replace(/[\s\u2060]/g, '')).length
}

function stripInvisible(text) {
  return (text || '').replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '')
}

function normalize(text) {
  return stripInvisible(text)
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
}

function insertInvisibleIntoPlainText(text, interval) {
  let visibleCount = 0
  let result = ''

  for (const char of Array.from(text)) {
    result += char
    if (/\s/.test(char)) continue
    visibleCount += 1
    if (visibleCount % interval === 0) result += INVISIBLE
  }

  return result
}

function insertInvisible(text, interval) {
  let cursor = 0
  let result = ''
  let match
  URL_PATTERN.lastIndex = 0

  while ((match = URL_PATTERN.exec(text)) !== null) {
    result += insertInvisibleIntoPlainText(text.slice(cursor, match.index), interval)
    result += match[0]
    cursor = match.index + match[0].length
  }

  result += insertInvisibleIntoPlainText(text.slice(cursor), interval)
  return result
}

function findBreakPosition(chars, maxLength) {
  const start = Math.max(1, Math.floor(maxLength * 0.58))
  const punctuation = /[。！？；!?;，,、：:]/
  for (let i = Math.min(maxLength, chars.length - 1); i >= start; i -= 1) {
    if (punctuation.test(chars[i])) return i + 1
  }
  return Math.min(maxLength, chars.length)
}

function splitParagraph(paragraph, maxLength) {
  const protectedSegments = []
  URL_PATTERN.lastIndex = 0
  const protectedParagraph = paragraph.trim().replace(URL_PATTERN, (segment) => {
    const placeholder = String.fromCharCode(0xE000 + protectedSegments.length)
    protectedSegments.push(segment)
    return placeholder
  })
  const chars = Array.from(protectedParagraph)
  const pieces = []

  while (chars.length > maxLength) {
    const position = findBreakPosition(chars, maxLength)
    pieces.push(chars.splice(0, position).join('').trim())
  }
  if (chars.length) pieces.push(chars.join('').trim())

  return pieces.join('\n\n').replace(/[\uE000-\uF8FF]/g, (placeholder) => {
    return protectedSegments[placeholder.charCodeAt(0) - 0xE000] || placeholder
  })
}

function addParagraphSpacing(text, maxLength) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => splitParagraph(paragraph, maxLength))
    .join('\n\n')
}

function transformText(text, mode) {
  const source = normalize(text).trim()
  if (!source) return ''

  if (mode === 'paragraph') return addParagraphSpacing(source, 68)
  if (mode === 'strong') return insertInvisible(addParagraphSpacing(source, 56), 8)
  return insertInvisible(source, 14)
}

module.exports = {
  INVISIBLE,
  countText,
  normalize,
  stripInvisible,
  transformText
}
