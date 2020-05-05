// components/navigation.js
Component({
  properties: {
    title: { // 设置标题
      type: String,
      value: '果味缘(中海国际店)'
    },
    leftImgTap: { 
      type: Function,
      value: function (params) {}
    },
  },
  /* 组件的初始数据 */
  data: {
    type: "组件",
    bar_Height: wx.getSystemInfoSync().statusBarHeight // 获取手机状态栏高度
  },
  /* 组件的方法列表 */
  methods: {
    leftImgTap() { // 返回事件
      this.triggerEvent('leftImgTap', {})
    }
  }
})