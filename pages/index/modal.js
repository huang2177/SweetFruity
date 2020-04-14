// 显示遮罩层
function showModal(that) {
  that.setData({
    hideModal: false
  })
  that.animation = wx.createAnimation()
  setTimeout(function() {
    fadeIn(that); //调用显示动画
  }, 200)
}

// 隐藏遮罩层
function hideModal(that) {
  that.animation = wx.createAnimation()
  fadeDown(that); //调用隐藏动画   
  setTimeout(function() {
    that.setData({
      hideModal: true
    })
  }, 200) //先执行下滑动画，再隐藏模块

}

//动画集
function fadeIn(that) {
  that.animation.translateY(0).step()
  that.setData({
    animationData: that.animation.export() //动画实例的export方法导出动画数据传递给组件的animation属性
  })
}

function fadeDown(that) {
  that.animation.translateY(800).step()
  that.setData({
    animationData: that.animation.export(),
  })
}

module.exports = {
  showModal: showModal,
  hideModal: hideModal
}