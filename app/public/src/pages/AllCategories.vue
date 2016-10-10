<template>
  <div id="all-categories">
    <span class="margin-10"></span>
    <el-row>
      <el-col :offset="20" :span="4">
        <el-button type="primary" icon="plus" @click.native="showRequestDialog = true">创建分类</el-button>
      </el-col>
    </el-row>
    <block title="所有分类">
      <el-row :gutter="20" slot="content">
        <el-col :span="6" v-for="category in categories">
          <image-card
            :title="category.title"
            :url="`/category/${category.name}`"
            :image="category.icon"
            :subtitle="category.name">
          </image-card>
        </el-col>
      </el-row>
    </block>

    <el-dialog title="提交创建分类请求" v-model="showRequestDialog">
      <el-alert
        title="信息填写错误"
        type="error"
        show-icon
        v-if="showAlert">
      </el-alert>
      <span class="margin-10"></span>
      <el-form
        :model="requestForm"
        label-width="100px"
        :rules="rules"
        ref="requestForm">
        <el-form-item
          label="标题"
          prop="title">
          <el-row>
            <el-col :span="16">
              <el-input
                v-model="requestForm.title"
                placeholder="如：守望先锋、英雄联盟"
                auto-complete="off">
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="英文代号"
          prop="name">
          <el-row>
            <el-col :span="16">
              <el-input
                v-model="requestForm.name"
                placeholder="如：overwatch、lol"
                auto-complete="off">
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="封面">
          <el-row>
            <el-col :span="16">
              <el-input
                type="file"
                @change.native="handleFileSelect">
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click.native="showRequestDialog = false">取 消</el-button>
        <el-button @click.native="sendRequest" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import ImageCard from '../components/ImageCard.vue'
  import Block from '../components/Block.vue'

  import 'whatwg-fetch'

  export default {
    data() {
      return {
        showRequestDialog: false,
        categories: [],
        requestForm: {
          title: '',
          name: '',
          icon: ''
        },
        showAlert: false,

        rules: {
          title: [
            { required: true, message: '请输入标题', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入英文代号', trigger: 'blur' }
          ]
        }
      }
    },

    mounted() {
      fetch('/api/v1/categories')
        .then(res => res.json())
        .then(data => {
          this.categories = data.categories
        })
    },

    methods: {
      handleFileSelect(e) {
        e.preventDefault()
        const file = e.target.files[0]
        this.requestForm.icon = file
      },

      sendRequest() {
        const title = this.requestForm.title
        const name = this.requestForm.name
        const file = this.requestForm.icon

        const form = new FormData()
        form.append('title', title)
        form.append('name', name)
        form.append('file', file)

        fetch('/api/v1/categoryrequests', {
          method: 'post',
          credentials: 'include',
          body: form
        })
          .then(res => res.json())
          .then(data => {
            this.$refs.requestForm.resetFields()
            this.showRequestDialog = false
            this.$message({
              message: '提交成功',
              type: 'success'
            })
          })
          .catch(err => {
            this.$refs.requestForm.resetFields()
            this.showRequestDialog = false
            console.error(err)
            this.$notify({
              title: '出错',
              message: '数据传输中发生了错误',
              type: 'error'
            })
          })
      }
    },

    components: {
      ImageCard,
      Block
    }
  }
</script>

<style scoped>
  .el-col-6 {
    margin-bottom: 10px;
  }
</style>