import request from '@/utils/request'

const userApi = {
  Login: '/auth/login',
  Logout: '/auth/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  twoStepCode: '/auth/2step-code',
  SendSms: '/account/sms',
  SendSmsErr: '/account/sms_err',
  // get my info
  UserInfo: '/user/info',
  UserMenu: '/user/nav'
}




// 获取验证码
export function getSMS(data){
  return request({
    url:'/getSms/',
    data,
    method: 'post'
  });
}

// export function getInfo () {
//   return request({
//     url: userApi.UserInfo,
//     method: 'get',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     }
//   })
// }

export function getCurrentUserNav () {
  return request({
    url: userApi.UserMenu,
    method: 'get'
  })
}



//注册账户
export function register(data){
  return request({
    url:'/register/',
    data
  });
}

// 登录账户
export function login(data){
  console.log(data);
  return request({
    url:'/login/',
    data,
    method: 'post'
  });
}