const { countText, transformText } = require('../../utils/text')

const SAMPLE = '最近把一直拖着没做的小工具完成了。它不复杂，却真的替我省下了每天重复操作的几分钟。很多事情不一定要等到准备充分才开始，先做出一个能用的版本，再慢慢把它变好。'

Page({
  data: {
    inputText: '',
    outputText: '',
    inputCount: 0,
    outputCount: 0,
    generating: false,
    showPrivacy: false,
    mode: 'balanced',
    modes: [
      {
        id: 'balanced',
        name: '轻处理',
        description: '只加入不可见分隔符，不改变原有段落和阅读效果',
        recommended: true
      },
      {
        id: 'paragraph',
        name: '自然分段',
        description: '在标点附近增加空行，适合较长的纯文字内容'
      },
      {
        id: 'strong',
        name: '加强处理',
        description: '分段并加入更多不可见符号，优先降低折叠概率'
      }
    ]
  },

  onLoad() {
    if (wx.onNeedPrivacyAuthorization) {
      this._privacyHandler = (resolve) => {
        this._resolvePrivacyAuthorization = resolve
        this.setData({ showPrivacy: true })
      }
      wx.onNeedPrivacyAuthorization(this._privacyHandler)
    }
  },

  onUnload() {
    if (this._privacyHandler && wx.offNeedPrivacyAuthorization) {
      wx.offNeedPrivacyAuthorization(this._privacyHandler)
    }
  },

  onInput(event) {
    const inputText = event.detail.value
    this.setData({
      inputText,
      inputCount: countText(inputText),
      outputText: '',
      outputCount: 0
    })
  },

  selectMode(event) {
    this.setData({
      mode: event.currentTarget.dataset.mode,
      outputText: '',
      outputCount: 0
    })
  },

  pasteText() {
    wx.getClipboardData({
      success: ({ data }) => {
        if (!data) {
          wx.showToast({ title: '剪贴板里没有文字', icon: 'none' })
          return
        }
        this.setData({
          inputText: data,
          inputCount: countText(data),
          outputText: '',
          outputCount: 0
        })
      },
      fail: () => wx.showToast({ title: '未能读取剪贴板', icon: 'none' })
    })
  },

  clearText() {
    this.setData({ inputText: '', inputCount: 0, outputText: '', outputCount: 0 })
  },

  useSample() {
    this.setData({ inputText: SAMPLE, inputCount: countText(SAMPLE) })
  },

  generate() {
    if (!this.data.inputText.trim()) {
      wx.showToast({ title: '请先输入文案', icon: 'none' })
      return
    }

    this.setData({ generating: true })
    const outputText = transformText(this.data.inputText, this.data.mode)
    this.setData({
      outputText,
      outputCount: countText(outputText),
      generating: false
    })

    wx.nextTick(() => wx.pageScrollTo({ selector: '.result-card', duration: 260 }))
  },

  copyResult() {
    wx.setClipboardData({
      data: this.data.outputText,
      success: () => wx.showToast({ title: '已复制', icon: 'success' }),
      fail: () => wx.showToast({ title: '复制失败，请长按结果复制', icon: 'none' })
    })
  },

  openPrivacyContract() {
    if (!wx.openPrivacyContract) {
      wx.showToast({ title: '当前微信版本暂不支持查看', icon: 'none' })
      return
    }
    wx.openPrivacyContract({
      fail: () => wx.showToast({ title: '隐私指引暂时无法打开', icon: 'none' })
    })
  },

  agreePrivacy() {
    if (this._resolvePrivacyAuthorization) {
      this._resolvePrivacyAuthorization({ buttonId: 'agree-btn', event: 'agree' })
      this._resolvePrivacyAuthorization = null
    }
    this.setData({ showPrivacy: false })
  },

  disagreePrivacy() {
    if (this._resolvePrivacyAuthorization) {
      this._resolvePrivacyAuthorization({ event: 'disagree' })
      this._resolvePrivacyAuthorization = null
    }
    this.setData({ showPrivacy: false })
  }
})
