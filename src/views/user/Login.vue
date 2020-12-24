<template>
  <el-tabs v-model='module' type='border-card' :offset='5'>
    <el-tab-pane label='登录' name='login'>
      <el-form
        :model='loginState'
        :rules='rules'
        ref='login'
        label-width='80px'
        class='ruleForm'
      >
        <el-form-item label='邮箱' prop='username'>
          <el-input v-model='loginState.username'></el-input>
        </el-form-item>
        <el-form-item label='密码' prop='password'>
          <el-input v-model='loginState.password' show-password></el-input>
        </el-form-item>
        <el-form-item label='验证码' prop='validateCode'>
          <el-row :gutter='20'>
            <el-col :span='11'>
              <el-input
                v-model='loginState.validateCode'
                placeholder='请输入验证码'
                maxlength='6'
                show-word-limit
                @blur='filterSpecialChar(loginState)'
              >
              </el-input>
            </el-col>
            <el-col :span='8' :offset='5'>
              <el-button
                :loading="loginButtonState.isload"
                @click='getCode(loginState.username)'
                :disabled='loginButtonState.status'
              >{{ loginButtonState.text }}
              </el-button
              >
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model='loginState.checked'>保存密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type='primary' @click="submitForm('login')">登录</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <el-tab-pane label='注册' name='register'>
      <el-form
        :model='registerState'
        :rules='rules'
        ref='register'
        label-width='80px'
        class='ruleForm'
      >
        <el-form-item label='邮箱' prop='username'>
          <el-input v-model='registerState.username'></el-input>
        </el-form-item>
        <el-form-item label='密码' prop='password'>
          <el-input v-model='registerState.password' show-password></el-input>
        </el-form-item>
        <el-form-item label='确认密码' prop='passwords'>
          <el-input v-model='registerState.passwords' show-password></el-input>
        </el-form-item>
        <el-form-item label='验证码' prop='validateCode'>
          <el-row :gutter='20'>
            <el-col :span='12'>
              <el-input
                v-model='registerState.validateCode'
                placeholder='请输入验证码'
                maxlength='6'
                show-word-limit
                @blur='filterSpecialChar(registerState)'
              >
              </el-input>
            </el-col>
            <el-col :span='7' :offset='5'>
              <el-button
                :loading="true"
                @click='getCode(registerState.username)'
                :disabled='registerButtonState.status'
              >{{ registerButtonState.text }}
              </el-button
              >
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model='registerState.checked'>保存密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type='primary' @click="submitForm('register')">注册</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { ref, watch, getCurrentInstance, reactive, toRefs } from '@vue/composition-api'
import router from '@/router'
import useRegisterModule from './modules/register'
import useLoginModule from './modules/login'
import useShare from './modules/share'
import useValidate from './modules/validate'
import { mapActions } from 'vuex'

import { login, register } from '@/api/login'
import sha1 from 'js-sha1'
import { message } from '@/utils/message'
import { timeFix } from '@/utils/util'


export default {
  setup(props, context) {
    const __this = getCurrentInstance(),
      module = ref('login')

    // // 获取dom
    let state = reactive({
      login: '',
      register: ''
    })


    // 登录模块 数据和功能实现
    const { loginState } = useLoginModule()

    // 注册模块 数据和功能实现
    const { registerState, validateConfirePass } = useRegisterModule(loginState)


    // 验证规则
    let rules = {
      username: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        {
          pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
          message: '请输入正确的邮箱格式',
          trigger: 'blur'
        }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {
          pattern: /^(?!\D+$)(?![^a-zA-Z]+$)\S{6,20}$/,
          message: '密码由6到20位数字、字母组成',
          trigger: 'blur'
        }
      ],
      validateCode: [
        { required: true, message: '验证码不能为空', trigger: 'blur' },
        { pattern: /^[a-z0-9]{6}$/, message: '验证码必须为6位', trigger: 'blur' }
      ],
      passwords: [
        { required: true, message: '确认密码不能为空', trigger: 'blur' },
        {
          validator: validateConfirePass,
          message: '两次密码不一致',
          trigger: 'blur'
        }
      ]
    }


    // 验证码相关数据及代码
    let validateState = useValidate(state, module,__this)


    // 公共的逻辑数据部分
    let shareState = useShare(state, module, [loginState, registerState, __this])


    // 选项卡切换路由
    watch(
      () => module.value,
      (newValue, oldValue) => {
        router.push('/' + newValue)
      }
    )

    // 公共的逻辑部分

    //  登录/注册验证
    let submitForm = (formName) => {
      __this.$refs[module.value].validate(async (valid) => {
        if (valid) {
          let state = module.value == 'login' ? loginState : registerState
          let data = {
            username: state.username,
            password: sha1(state.password),
            code: state.validateCode,
            module: module.value
          }
          module.value == 'login' ? userLogin(data) : userRegister(data)

        } else {
          console.log('error submit!!')
          return false
        }
      })
    }

    // 注册
    let userRegister = async (data) => {
      let res = await register(data)
      message(res.message)
      router.push('/login')
    }

    // 登录
    let userLogin = data => {

      __this.Login(data).then(() => {
        __this.$success({
          title: '登录成功',
          onOk() {
            __this.$router.push({ path: '/dashboard/workplace' })
            setTimeout(() => {
              __this.$notification.success({
                message: '欢迎',
                description: `${timeFix()}，欢迎回来`
              })
            }, 1000)
          }
        })


      })


    }

    return {
      module,
      loginState,
      registerState,
      ...shareState,
      ...validateState,
      ...toRefs(state),
      rules,
      submitForm,
      ...mapActions(['Login', 'Logout'])
    }
  }
}
</script>

<style scoped lang='less'>
.el-button {
  width: 100%;
  display: block;
}

.el-form-item {
  width: 450px !important;

  .el-row {
    margin: 0 !important;

    .el-col {
      padding: 0 !important;
    }
  }
}

.el-tabs {
  width: 520px;
  position: absolute;
  right: 55px;
  opacity: 0.95;
}
</style>
