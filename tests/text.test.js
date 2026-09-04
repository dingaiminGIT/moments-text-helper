const assert = require('assert')
const { countText, stripInvisible, transformText } = require('../utils/text')

const original = '这是一段用于测试的朋友圈长文案，希望处理之后原来的文字内容完全不变。'
const balanced = transformText(original, 'balanced')
assert.notStrictEqual(balanced, original, '轻处理应插入不可见字符')
assert.strictEqual(stripInvisible(balanced), original, '移除不可见字符后应等于原文')
assert.strictEqual(countText(balanced), countText(original), '字数统计不应包含不可见字符')

const withUrl = '项目地址 https://example.com/path?a=1&b=2 欢迎查看这个新工具。'
const protectedUrl = transformText(withUrl, 'strong')
assert.ok(protectedUrl.includes('https://example.com/path?a=1&b=2'), '链接内部不应插入字符')

const longPrefixWithUrl = `${'这是一段很长的开场内容。'.repeat(8)} https://example.com/a/very/long/path?x=123456789 文案结尾。`
const paragraphWithUrl = transformText(longPrefixWithUrl, 'paragraph')
assert.ok(paragraphWithUrl.includes('https://example.com/a/very/long/path?x=123456789'), '分段也不应拆开链接')

const longText = '第一句内容比较长，需要在合适的位置断开。'.repeat(8)
const paragraph = transformText(longText, 'paragraph')
assert.ok(paragraph.includes('\n\n'), '自然分段应为长文案增加空行')
assert.strictEqual(paragraph.replace(/\n/g, ''), longText, '自然分段不应改动原文内容')

assert.strictEqual(transformText('   ', 'balanced'), '', '空白输入应输出空字符串')

console.log('text utils: all tests passed')
