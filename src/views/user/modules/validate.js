import {  reactive } from "@vue/composition-api";
import { getSMS } from "@/api/login.js";
import { message } from "@/utils/message.js";


export default function useValidate(options,m,__this){
  // 验证码状态
    let loginButtonState = reactive({
        status: false,
        text: "获取验证码",
        init(text) {
          this.text = text;
          this.status = false;
        },
    });

  let registerButtonState = Object.assign({}, loginButtonState);



  // 开启定时器
  function countdown(obj, seconds) {
    let time = seconds;
    if (!time) {
      obj.init("重新发送");
      clearTimeout(timer);
      return;
    }
    let timer = setTimeout(() => {
      obj.text = time;
      countdown(obj, --time);
    }, 1000);
  }


  // 获取验证码
  let getCode = (value) => {
    options[m.value].validateField("username",(valid) => {
      if (!valid) {
        let currentButtonState =
          m.value == "login" ? loginButtonState : registerButtonState;
        currentButtonState.status = true;
        currentButtonState.isload = true;
        currentButtonState.text = "发送中";
          getSMS({ username: value, module: m.value }).then((res)=>{
            currentButtonState.isload = false;
            __this.$copyText(res.message.substr(-6,6)).then(function (e) {
               message(res.message+ '  (验证码已经复制到剪贴版)' );
            })
          })
          countdown(currentButtonState, 60);
      }
    });
  }

  return {
    loginButtonState,
    registerButtonState,
    countdown,
    getCode,
  }




}