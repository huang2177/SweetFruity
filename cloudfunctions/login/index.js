const cloud = require('wx-server-sdk')

cloud.init({
  traceUser: true,
  env: 'dev-3i7nf',
})

exports.main = (event, context) => {
  return event.baseData.data.phoneNumber
}