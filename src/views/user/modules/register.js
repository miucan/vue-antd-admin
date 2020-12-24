import { reactive } from "@vue/composition-api";
export default function useRegisterModule(obj) {
  const registerState = reactive(Object.assign({ passwords:"",},obj));
  function validateConfirePass(rule, value, callback) {
    if (value !== registerState.password) {
      callback(new Error("两次输入密码不一致!"));
    }
    callback();
  }

  return {
    registerState,
    validateConfirePass
  };
}