<template>
  <a-modal
    title="新建规则"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="
      () => {
        $emit('ok');
      }
    "
    @cancel="
      () => {
        $emit('cancel');
      }
    "
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item v-show="model && model.id > 0" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="标题">
          <a-input
            v-decorator="[
              'title',
              {
                rules: [
                  { required: true, min: 1, message: '请输入至少一个字符的标题！' },
                ],
              },
            ]"
          />
        </a-form-item>
        <a-form-item label="类型">
          <a-select
            placeholder="请选择"
            v-decorator="[
              'categoryId',
              {
                rules: [{ required: true, message: '请选择至少一个分类' }],
              },
            ]"
          >
            <a-select-option :value="item.id" v-for="item in options" :key="item.id">
              {{ item.category_name }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item label="描述">
          <a-input
            v-decorator="[
              'content',
              {
                rules: [
                  { required: true, min: 5, message: '请输入至少五个字符的规则描述！' },
                ],
              },
            ]"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from "lodash.pick";
// 表单字段
const fields = ["categoryId", "title", "imgUrl", "createDate", "content"];
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
    model: {
      type: Object,
      default: () => null,
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
      },
    };
    return {
      form: this.$form.createForm(this),
    };
  },
  created() {
    // 防止表单未注册
    fields.forEach((v) => this.form.getFieldDecorator(v));
    // 当 model 发生改变时，为表单设置值
    this.$watch("model", () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields));
    });
  },
};
</script>
