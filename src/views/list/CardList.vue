<template>
  <page-header-wrapper
    :tab-list="tabList"
    :tab-active-key="tabActiveKey"
    :tab-change="
      (key) => {
        this.tabActiveKey = key;
      }
    "
    content=""
  >
    <template v-slot:extraContent>
      <div style="width: 155px; margin-top: -20px">
        <img
          style="width: 100%"
          src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png"
        />
      </div>
    </template>

    <a-list
      rowKey="id"
      :grid="{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }"
      :dataSource="dataSource.items"
    >
      <a-list-item slot="renderItem" slot-scope="item, index">
        <template v-if="!item || item.id === undefined">
          <a-button class="new-btn" type="dashed" @click="handleAdd">
            <a-icon type="plus" />
            新增分类
          </a-button>
        </template>

        <template v-else>
          <a-card :hoverable="true">
            <a-card-meta>
              <a slot="title">{{ item.category_name }}</a>
              <el-collapse slot="description" accordion v-model="activeKey">
                <el-collapse-item title="查看分类" :name="index">
                  <a-row class="tab">
                    <a-col :span="12">
                      <el-input
                        class="input-new-tag"
                        v-if="presentInputState.visible"
                        v-model="presentInputState.inputValue"
                        :ref="`${presentInputState.ref}${index}`"
                        size="small"
                        @blur="resetInput(presentInputState)"
                        @keyup.enter.native="
                          handleInputConfirm(item.id, presentInputState, index)
                        "
                      />
                      <el-button
                        v-else
                        class="button-new-tag"
                        size="small"
                        @click="showInput(presentInputState, index)"
                        >+ 添加子分类
                      </el-button>
                    </a-col>
                    <a-col :span="12">
                      <el-input
                        class="input-new-tag"
                        v-if="selectInputState.visible"
                        v-model="selectInputState.inputValue"
                        :ref="`${selectInputState.ref}${index}`"
                        size="small"
                        @blur="resetInput(selectInputState)"
                        @keyup.enter.native="
                          handleInputConfirm(item.id, selectInputState, index)
                        "
                      />

                      <el-button
                        v-else
                        class="button-new-tag"
                        size="small"
                        @click="showInput(selectInputState, index)"
                        >+ 添加选中的子分类
                      </el-button>
                    </a-col>
                  </a-row>

                  <el-cascader-panel
                    @expand-change="changePanel($el, index)"
                    :key="cascaderKey"
                    style="overflow: auto"
                    :ref="`cascader${index}`"
                    :options="item.children"
                    :props="props"
                    size="mini"
                  >
                    <template slot-scope="{ node, data }" v-if="item.id > 0">
                      <span>{{ data.category_name }}</span>
                      <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                    </template>
                  </el-cascader-panel>
                </el-collapse-item>
              </el-collapse>
              <div class="meta-content" slot="description">
                {{ item.content }}
              </div>
            </a-card-meta>

            <template class="ant-card-actions" slot="actions">
              <a @click="handleEditClick(index, item)">开始编辑</a>
              <a-popconfirm
                title="   你确定要删除此分类吗?   "
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDeleteClick(index, item)"
              >
                <a href="#">删除</a>
              </a-popconfirm>
            </template>
          </a-card>
        </template>
      </a-list-item>
    </a-list>
    <category-form
      :title="titleState == 'edit' ? '修改分类' : '新建分类'"
      ref="createModal"
      :visible="visible"
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk()"
    />
    <step-by-step-modal ref="modal" @ok="handleOk" />
  </page-header-wrapper>
</template>

<script>
import {
  addChildrenCategory,
  addStartersCategory,
  deleteCategory,
  editFirstCategorys,
  getCategorys,
} from "@/api/news";
import { message } from "@/utils/message";
import StepByStepModal from "@/views/list/modules/StepByStepModal";
import CategoryForm from "@/views/list/modules/CategoryForm";
import { flattenItem } from "@/utils/util";
import { ref } from "@vue/composition-api";

export default {
  name: "CardList",
  data() {
    // 选项卡
    this.tabList = [{ key: "tab1", tab: "快速开始" }];
    return {
      //  分类的数据
      dataSource: {
        items: [{}],
      },
      cascaderKey: 0,
      form: {
        category: ["1"],
      },
      radio1: "上海",
      // 控制是否显示
      visible: false,
      // 分类卡片
      activeKey: 0,
      // 加载动画状态
      confirmLoading: false,
      // 保存的form的数据
      mdl: null,
      // 当前选项卡
      tabActiveKey: "tab1",
      // 面板配置
      props: {
        label: "category_name",
        value: "id",
        checkStrictly: true,
      },
      // 当前标题
      titleState: "add",
      presentInputState: {
        visible: false,
        inputValue: "",
        ref: "savePresentInput",
      },
      selectInputState: {
        ref: "saveSelectInput",
        inputValue: "",
        visible: false,
      },
    };
  },
  components: {
    CategoryForm,
    StepByStepModal,
  },
  mounted() {
    this.init();
  },
  watch: {
    activeKey() {
      this.presentInputState.visible = false;
      this.presentInputState.inputValue = "";
      this.selectInputState.visible = false;
      this.selectInputState.inputValue = "";
    },
  },
  methods: {
    init() {
      this.getData();
      this.form = this.$refs.createModal.form;
    },
    // 获取所有分类数据
    getData() {
      this.$store.dispatch("info/getAllCategory").then((res) => {
        this.dataSource.items.push(...res.data);
      });
    },
    getSelectOption(index) {
      return this.$refs["cascader" + index].getCheckedNodes()[0];
    },
    changePanel($e, index) {
      let selectOption = this.getSelectOption(index);
      let menu = this.$refs["cascader" + index].$el;
      if (selectOption && selectOption.hasChildren && selectOption.parent) {
        this.$nextTick(() => {
          let space = this.$refs["cascader" + index].$children[
            this.$refs["cascader" + index].$children.length - 2
          ];
          space.$el.onclick = () => {
            menu.scrollLeft -= menu.clientWidth / 2;
          };
          menu.scrollLeft += menu.clientWidth;
        });
      }
    },
    // 监听编辑按钮的点击
    handleEditClick(index, item) {
      let selectOption = this.getSelectOption(index);
      let data = !selectOption ? item : selectOption.data;
      this.handleEdit(data);
    },
    // 监听删除按钮的点击
    handleDeleteClick(index, item) {
      let selectOption = this.getSelectOption(index);
      let unSelectOption = { data: { id: item.id } };
      let params = !selectOption ? unSelectOption : selectOption;
      this.removeCategory(params, index);
    },
    // 删除分类
    removeCategory(options, index) {
      deleteCategory({ categoryId: options.data.id }).then((res) => {
        if (!res.resCode) {
          if (options.level) {
            // 选择了分类
            if (options.parent) {
              // 获取到选中到父分类
              let item = flattenItem(this.dataSource.items[index], 0, options.level - 1);
              let pos = item[0].children.findIndex(
                (child) => child.id == options.data.id
              );
              item[0].children.splice(pos, 1);
            } else {
              // 删除一级子分类
              let pos = this.dataSource.items[index].children.findIndex(
                (child) => child.id == options.data.id
              );
              this.dataSource.items[index].children.splice(pos, 1);

              // 数据源发生变化 ，改变keyValue的值，达到重新渲染的效果
              this.cascaderKey++;
            }
          } else {
            // 没有选择分类，删除整个分类
            this.dataSource.items.splice(index, 1);
          }
          message(res.message);
        } else {
          message(res.message, "error");
        }
      });
    },
    // 监听添加按钮的点击
    handleAdd() {
      this.title = "add";
      this.mdl = null;
      this.visible = true;
    },
    // 执行更新状态
    handleEdit(item) {
      this.title = "edit";
      this.mdl = item;
      this.visible = true;
    },
    handleOk() {
      this.confirmLoading = true; // 开启加载动画
      this.form.validateFields((errors, values) => {
        if (!errors) {
          if (values.id > 0) {
            // 修改 e.g.
            this.edit(values);
          } else {
            // 添加
            this.add(values);
          }
        } else {
          this.confirmLoading = false; // 关闭加载动画
        }
      });
    },
    // 重置表单相关状态
    resetState() {
      this.visible = false;
      this.confirmLoading = false;
      // 重置表单数据
      this.form.resetFields();
    },
    edit(values) {
      editFirstCategorys({
        id: this.mdl.id,
        categoryName: values.category_name,
      }).then((res) => {
        if (!res.resCode) {
          message(res.message);
          this.mdl.category_name = res.data.data.categoryName;
          this.resetState();
        } else {
          message(res.message, "error");
        }
      });
    },
    add(values) {
      let data = { categoryName: values.category_name };
      this.addFirstCategory(data);
    },
    // 执行添加一级分类
    addFirstCategory(data) {
      addStartersCategory(data)
        .then((res) => {
          if (!res.resCode) {
            message(res.message);
            this.dataSource.items.push(res.data);
          } else {
            message("添加失败", "error");
          }
        })
        .finally((res) => {
          this.resetState();
        });
    },
    showInput(options, index) {
      options.visible = true;

      this.$nextTick((_) => {
        this.$refs[options.ref + index].$refs.input.focus();
      });
    },
    resetInput(options) {
      options.visible = false;
      options.inputValue = "";
    },
    handleInputConfirm(id, options, index) {
      let inputValue = options.inputValue;
      let data = null;
      if (options.ref == "savePresentInput") {
        // 添加当前子分类
        data = { categoryName: inputValue, parentId: id };
      } else {
        // 添加选中的子类
        let selectOption = this.getSelectOption(index);
        if (!selectOption) {
          // 没有选择
          $message("请先选择", "error");
          return;
        } else {
          data = {
            categoryName: inputValue,
            parentId: selectOption.data.id,
            level: selectOption.level,
          };
        }
      }

      this.addChildrenCategory(data, index);

      this.resetInput(options);
    },
    addChildrenCategory(data, index) {
      addChildrenCategory(data).then((res) => {
        if (!res.resCode) {
          message(res.message);
          if (data.level) {
            let item = flattenItem(this.dataSource.items[index], 0, data.level);
            let pos = item.findIndex((child) => child.id == data.parentId);
            if (!item[pos].children) {
              this.$set(item[pos], "children", []);
            }
            item[pos].children.push(res.data);
          } else {
            if (!this.dataSource.items[index].children) {
              this.$set(this.dataSource.items[index], "children", []);
            }
            this.dataSource.items[index].children.push(res.data);
          }
        } else {
          message("添加失败", "error");
        }
        this.resetState();
      });
    },
    handleCancel() {
      this.visible = false;
      this.form.resetFields();
      this.mdl = null;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/components/index.less";

.el-cascader-panel.is-bordered {
  border-top: 0 !important;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
}

.card-list {
  /deep/ .ant-card-body:hover {
    .ant-card-meta-title > a {
      color: @primary-color;
    }
  }

  /deep/ .ant-card-meta-title {
    margin-bottom: 12px;

    & > a {
      display: inline-block;
      max-width: 100%;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  /deep/ .meta-content {
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    height: 64px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    margin-bottom: 1em;
  }
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 48px;
}

.ant-card-actions {
  background: #f7f9fa;

  li {
    float: left;
    text-align: center;
    margin: 12px 0;
    color: rgba(0, 0, 0, 0.45);
    width: 50%;

    &:not(:last-child) {
      border-right: 1px solid #e8e8e8;
    }

    a {
      color: rgba(0, 0, 0, 0.45);
      line-height: 22px;
      display: inline-block;
      width: 100%;

      &:hover {
        color: @primary-color;
      }
    }
  }
}

.new-btn {
  background-color: #fff;
  border-radius: 2px;
  width: 100%;
  height: 40px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  width: 100%;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.tab div:first-child .button-new-tag {
  border-top-right-radius: 0;
}

.tab div:last-child > .button-new-tag {
  border-left: 0;
  border-top-left-radius: 0;
}

.input-new-tag {
  width: 100%;
  vertical-align: bottom;
}
</style>
