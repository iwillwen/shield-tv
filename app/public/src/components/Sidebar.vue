<template>
  <el-menu id="main-sidebar" mode="vertical" theme="dark" default-active="1">
    <img id="logo" src="/public/images/light-logo.png" />
    <router-link to="/"><el-menu-item index="1">
      <i class="el-icon-star-on"></i>首页
    </el-menu-item></router-link>
    <el-submenu index="2" default-active="2-1">
      <template slot="title"><i class="el-icon-menu"></i>直播分类</template>
      <router-link to="/category/all"><el-menu-item index="2-1">全部分类</el-menu-item></router-link>
      <el-menu-item-group title="已关注分类" v-if="starredCategories.length > 0">
        <router-link
          v-for="(category, index) in starredCategories"
          :to="`/category/${category.name}`">
          <el-menu-item :index="`2-${(index + 2)}`">
            {{category.title}}
          </el-menu-item>
        </router-link>
      </el-menu-item-group>
      <el-menu-item-group title="热门分类">
        <router-link
          v-for="(category, index) in hotCategories"
          :to="`/category/${category.name}`">
          <el-menu-item :index="`2-${(index + starredCategories.length + 2)}`">
            {{category.title}}
          </el-menu-item>
        </router-link>
      </el-menu-item-group>
    </el-submenu>
    <router-link to="/host/application" v-if="user && !user.isHost">
      <el-menu-item index="3">
        <i class="el-icon-circle-check"></i>我要当主播！
      </el-menu-item>
    </router-link>
    <router-link to="/host/room" v-if="user && user.isHost">
      <el-menu-item index="3">
        <i class="el-icon-caret-right"></i>直播间设置
      </el-menu-item>
    </router-link>

    <div id="user-info-wrapper" v-if="user">
      <el-popover
        ref="logoutPopover"
        placement="top"
        trigger="click">
          <div id="logout"><el-button type="text" @click.native="logout">注销</el-button></div>
      </el-popover>
      <div id="user-info" v-popover:logoutPopover>
        <img :src="user.avatar">
        <span>{{user.nickname}}</span>
      </div>
    </div>
    <div v-else id="user-info" @click="showLogin">
      <img src="/public/images/default_avatar.png">
      <span>登陆/注册</span>
    </div>

    <el-dialog title="登录/注册" v-model="showLoginDialog">
      <el-alert
        title="信息填写错误"
        type="error"
        show-icon
        v-if="showAlert">
      </el-alert>
      <span class="margin-10"></span>
      <el-form
        :model="loginForm"
        label-width="80px"
        :rules="rules"
        ref="loginForm">
        <el-form-item
          label="用户名"
          prop="username">
          <el-row>
            <el-col :span="16">
              <el-input
                v-model="loginForm.username"
                auto-complete="off"
              ></el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
          minlength="6">
          <el-row>
            <el-col :span="16">
              <el-input
                type="password"
                v-model="loginForm.password"
                auto-complete="off"
              ></el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-if="isRegister" label="昵称" prop="nickname">
          <el-row>
            <el-col :span="16">
              <el-input
                v-model="loginForm.nickname"
                auto-complete="off"
              ></el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-if="isRegister" label="个人简介">
          <el-row>
            <el-col :span="16">
              <el-input
                type="textarea"
                v-model="loginForm.description"
                auto-complete="off"
              ></el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click.native="showLoginDialog = false">取 消</el-button>
        <el-button type="primary" @click.native="handleLogin">确 定</el-button>
      </span>
    </el-dialog>
  </el-menu>
</template>

<script>
  import 'whatwg-fetch'
  import min from 'min'

  export default {
    props: [ 'user' ],

    data() {
      return {
        showLoginDialog: false,
        isRegister: null,
        loginForm: {
          username: '',
          password: '',
          nickname: '',
          description: '我就是不想写~'
        },

        starredCategories: [],

        hotCategories: [
          { title: '守望先锋', name: 'overwatch' }
        ],

        loginRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ]
        },
        registerRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ],
          nickname: [
            { required: true, message: '请输入昵称', trigger: 'blur' }
          ]
        },
        showAlert: false
      }
    },

    computed: {
      rules() {
        return this.register ? this.registerRules : this.loginRules
      }
    },

    created() {
      let timer = null

      function checkUsername(username) {
        fetch(`/api/v1/users/${username}`)
          .then(res => res.json())
          .then(data => {
            this.isRegister = false
          })
          .catch(err => {
            this.isRegister = true
          })
      }

      this.$watch('loginForm.username', val => {
        if (!val) return

        if (timer) {
          clearTimeout(timer)
        }

        timer = setTimeout(() => {
          checkUsername.call(this, val)
        }, 200)
      })
    },

    mounted() {
      const unwatch = this.$watch('user', user => {
        unwatch()
        fetch('/api/v1/starredcategories', {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => {
            this.starredCategories = data.categories
          })
      })
    },

    methods: {
      showLogin() {
        this.showLoginDialog = true
      },

      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (!valid) {
            this.showAlert = true
            setTimeout(() => this.showAlert = false, 2000)
          } else {
            console.log(this.isRegister);
            if (!this.isRegister) {
              this.login(
                this.loginForm.username,
                this.loginForm.password
              )
            } else {
              this.register(
                this.loginForm.username,
                this.loginForm.password,
                this.loginForm.nickname,
                this.loginForm.description
              )
            }
          }
        })
      },

      login(username, password) {
        fetch('/api/v1/users/login', {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username,
            password
          })
        })
          .then(res => res.json())
          .then(data => {
            this.user = data.user
            return min.hmset('shield-tv:user', data.user)
          })
          .then(() => {
            this.showLoginDialog = false
            this.$message({
              message: '欢迎回来',
              type: 'success'
            })
          })
          .catch(err => {
            console.error(err)
            this.$notify({
              title: '出错',
              message: '数据传输中发生了错误',
              type: 'error'
            })
            this.$refs.loginForm.resetFields()
          })
      },

      register(username, password, nickname, description) {
        fetch('/api/v1/users', {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username,
            password,
            nickname,
            description
          })
        })
          .then(res => res.json())
          .then(data => {
            this.user = data.user
            return min.hmset('shield-tv:user', data.user)
          })
          .then(() => {
            this.showLoginDialog = false
            this.$message({
              message: '欢迎加入',
              type: 'success'
            })
          })
          .catch(err => {
            console.error(err)
            this.$notify({
              title: '出错',
              message: '数据传输中发生了错误',
              type: 'error'
            })
            this.$refs.loginForm.resetFields()
          })
      },

      logout() {
        this.$confirm('你确定要注销当前账户吗？', '注销', {
          type: 'warning'
        })
          .then(() => fetch('/api/v1/users/logout', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }))
          .then(res => res.json())
          .then(() => {
            return min.del('shield-tv:user')
          })
          .then(() => {
            this.user = null
            this.$message({
              message: '注销成功',
              type: 'success'
            })
            this.$refs.loginForm.resetFields()
          })
      }
    }
  }
</script>

<style scoped>
  #main-sidebar {
    width: 200px;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
  }

  #logo {
    width: 100%;
  }

  #user-info {
    width: 100%;
    padding: 10px 18px;

    position: absolute;
    bottom: 0;

    cursor: pointer;
  }

  #user-info img {
    width: 50px;
    display: inline-block;
    vertical-align: middle;
    border-radius: 25px;
  }

  #user-info span {
    color: #c0ccda;
    font-size: 14px;
    margin-left: 10px;
  }

  .el-menu a {
    text-decoration: none;
    color: inherit;
  }

  #logout button {
    width: 100%;
  }
</style>