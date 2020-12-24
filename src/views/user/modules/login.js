import { reactive } from "@vue/composition-api";
export default function useLoginModule(){
  const loginState = reactive({
    username: "le.mail@qq.com",
    password: "llllllll1",
    checked: false,
    validateCode: "",
    isload:false
  });

  return {
    loginState,
  }
}