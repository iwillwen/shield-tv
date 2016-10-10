<template>
  <div id="host-application">
    <h1>我要当主播！</h1>

    <el-row>
      <el-col :span="16">
        <el-alert
          title="信息填写错误"
          type="error"
          show-icon
          v-if="alert">
        </el-alert>
        <span class="margin-10"></span>
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="个人姓名" prop="realname">
            <el-input v-model="form.realname" placeholder="请务必填写真实姓名，以便进行审核。"></el-input>
          </el-form-item>
          <el-form-item label="学院专业" prop="remark">
            <el-input v-model="form.remark" placeholder="如：15级应用统计学2班"></el-input>
          </el-form-item>
          <el-form-item label="联系方式" prop="contact">
            <el-input v-model="form.contact" placeholder="如：微信 XXXX、QQ 12345789"></el-input>
          </el-form-item>
          <el-form-item label="直播分类" prop="category">
            <el-select v-model="form.category" placeholder="请选择直播分类">
              <el-option v-for="category in categories" :label="category.title" :value="category.name"></el-option>
            </el-select>
            <div class="text">若不存在想要的分类，可以先选择一个相近的，然后通过在“<router-link to="/category/all">全部分类</router-link>”页面中提交创建分类请求，请求通过后可以自行在直播间设置中修改。</div>
          </el-form-item>
          <el-form-item label="直播内容简介">
            <el-input type="textarea" v-model="form.content"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="check" @click.native="submit">提交</el-button>
            <!-- <el-button @click.native.prevent="$refs.form.resetFields">重置</el-button> -->
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import 'whatwg-fetch'

  export default {
    data() {
      return {
        form: {
          realname: '',
          contact: '',
          remark: '',
          category: '',
          content: ''
        },

        alert: false,

        categories: [],

        rules: {
          realname: [
            { required: true, message: '请填写个人姓名', trigger: 'blur' }
          ],
          remark: [
            { required: true, message: '请填写学院专业', trigger: 'blur' }
          ],
          contact: [
            { required: true, message: '请填写联系方式', trigger: 'blur' }
          ],
          category: [
            { required: true, message: '请选择直播分类', trigger: 'blur' }
          ],
          content: [
            { required: true, message: '请填写直播内容简介', trigger: 'blur' }
          ]
        }
      }
    },

    mounted() {
      fetch('/api/v1/categories')
        .then(res => res.json())
        .then(data => this.categories = data.categories)
    },

    methods: {
      submit(evt) {
        this.$refs.form.validate(valid => {
          if (valid) {
            fetch('/api/v1/hostapplications', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify(this.form)
            })
              .then(res => res.json())
              .then(data => {
                this.$notify({
                  title: '申请成功',
                  message: '管理员会尽快审核，并通过你所留下的联系方式与你取得联系。',
                  type: 'success'
                })
                setTimeout(() => {
                  this.$router.push('/')
                }, 2000)
              })
          } else {
            this.alert = true
            setTimeout(() => this.alert = false, 2000)
          }
        })
      }
    }
  }
</script>

<style scoped>
  .text {
    line-height: 1.2rem;
    color: #999;
    margin: 5px 0;
  }
</style>