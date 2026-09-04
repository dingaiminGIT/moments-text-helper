const assert = require('node:assert/strict')
const test = require('node:test')

let pageConfig
global.Page = (config) => {
  pageConfig = config
}

require('../pages/index/index')

test('复制成功后只显示轻提示，由用户决定下一步', () => {
  let clipboardOptions
  let toastOptions

  global.wx = {
    setClipboardData(options) {
      clipboardOptions = options
    },
    showToast(options) {
      toastOptions = options
    }
  }

  pageConfig.copyResult.call({ data: { outputText: '处理后的文案' } })
  assert.equal(clipboardOptions.data, '处理后的文案')

  clipboardOptions.success()
  assert.equal(toastOptions.title, '已复制')
  assert.equal(toastOptions.icon, 'success')
  assert.equal(global.wx.showModal, undefined)
  assert.equal(global.wx.exitMiniProgram, undefined)
})

test('复制失败时提示用户长按结果复制', () => {
  let clipboardOptions
  let toastOptions

  global.wx = {
    setClipboardData(options) {
      clipboardOptions = options
    },
    showToast(options) {
      toastOptions = options
    }
  }

  pageConfig.copyResult.call({ data: { outputText: '处理后的文案' } })
  clipboardOptions.fail()

  assert.equal(toastOptions.title, '复制失败，请长按结果复制')
  assert.equal(toastOptions.icon, 'none')
})
