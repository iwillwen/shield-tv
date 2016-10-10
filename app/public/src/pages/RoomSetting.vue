<template>
  <div id="host-room-setting" v-if="room">
    <h1>直播间设置</h1>

    <el-row :gutter="15">
      <el-col :span="16">
        <el-form ref="form" :model="room" label-width="100px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="room.title"></el-input>
          </el-form-item>
          </el-form-item>
          <el-form-item label="直播分类" prop="category">
            <el-select v-model="category" placeholder="请选择直播分类">
              <el-option v-for="category in categories" :label="category.title" :value="category.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="直播内容简介">
            <el-input type="textarea" v-model="room.description"></el-input>
          </el-form-item>
          <el-form-item label="直播密钥">
            <el-input
              v-model="room.streamKey"
              :disabled="true">
              <el-button
                slot="append"
                icon="document"
                type="info"
                :data-clipboard-text="room.streamKey">
              复制</el-button>
            </el-input>
            <div class="text">
            将该密钥复制到 OBS（Open Broadcast Software）软件的“广播设定”中“直播流”模式的“串流码”一栏中。<br>推流地址请填写 <el-tooltip :disabled="!copiedRTMPUrl" class="item" effect="dark" content="已复制" placement="top"><input type="text" class="fake-input" value="rtmp://shieldtv.lifemap.in/live" @click="foucsAndCopy" /></el-tooltip>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="edit" @click.native.prevent="update">更新</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="4">
        <div class="margin-10"></div>
        <div class="margin-10"></div>
        <div class="margin-10"></div>
        <div class="margin-10"></div>
        <span>弹幕查看工具，请用手机扫描以下二维码。</span>
        <br />
        <img :src="qrcode">
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import Clipboard from 'clipboard'
  import 'whatwg-fetch'
  import Vue from 'vue'

  export default {
    data() {
      return {
        room: null,
        category: '',
        categories: [],
        copiedRTMPUrl: false
      }
    },

    mounted() {
      const user = this.$router.user

      fetch('/api/v1/categories')
        .then(res => res.json())
        .then(data => {
          this.categories = data.categories
        })

      fetch(`/api/v1/rooms/${user.username}`)
        .then(res => res.json())
        .then(data => {
          this.room = data.room
          this.category = data.room.category.name

          Vue.nextTick(() => {
            const copyBtn = document.querySelector('.el-button[data-clipboard-text]')
            const clipboard = new Clipboard(copyBtn)

            clipboard.on('success', () => {
              this.$message({
                message: '已复制',
                type: 'success'
              })
            })
          })
        })
    },

    computed: {
      qrcode() {
        const danmuTool = `http://shieldtv.lifemap.in/public/danmu.html?id=${this.room._id}`

        return `http://tool.oschina.net/action/qrcode/generate///?data=${danmuTool}&output=image/png&error=L&type=0&margin=10&size=4`
      }
    },

    methods: {
      update() {
        const title = this.room.title
        const category = this.category
        const description = this.room.description

        fetch(`/api/v1/rooms/${this.room._id}`, {
          method: 'put',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            update: {
              title, description, category
            }
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.code === 0) {
              this.$notify({
                title: '成功',
                message: '直播间信息更新成功。',
                type: 'success'
              })
            }
          })
          .catch(err => {
            console.error(err)
            this.$notify({
              title: '出错',
              message: '直播间信息更新失败，请稍后再次尝试。',
              type: 'error'
            })
          })
      },

      foucsAndCopy(evt) {
        evt.target.select()
        document.execCommand('copy')
        this.copiedRTMPUrl = true

        setTimeout(() => {
          this.copiedRTMPUrl = false
        }, 1000)
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

  .fake-input {
    border: none;
    width: 200px;
    outline: none;
    color: #999;
  }
</style>