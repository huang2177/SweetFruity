//app.js
const CLOUND_ENV_RELEASE = 'dev-3i7nf'
const CLOUND_ENV_DEV = 'release-ca90l'

App({
  onLaunch: function () {
    wx.cloud.init({
      traceUser: true,
      env: CLOUND_ENV_RELEASE,
    })
  },
})