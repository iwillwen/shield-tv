<template>
  <div id="room" v-if="room">
    <el-row :gutter="15">
      <el-col :span="3">
        <img :src="host.avatar" :alt="host.nickname" id="host-avatar">
      </el-col>
      <el-col :span="16" v-if="room">
        <h2 id="room-title">{{room.title}}</h2>
        <i class="el-icon-caret-right" v-if="room.active" title="正在直播"></i>
        <i class="el-icon-time" v-else title="休息中"></i>
        <span id="host-nickname">{{host.nickname}}</span> <router-link :to="`/category/${category.name}`"><el-button type="text">{{category.title}}</el-button></router-link>
      </el-col>
    </el-row>
    <div class="margin-10"></div>
    <stream-player :room="room"></stream-player>
    <div class="margin-10"></div>
    <el-row>
      <el-col :span="18">
        <div id="room-description">
          <p>{{room.description}}</p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import 'whatwg-fetch'
  import min from 'min'

  import StreamPlayer from '../components/StreamPlayer.vue'

  export default {
    data() {
      return {
        room: null,
        host: null,
        category: null
      }
    },

    mounted() {
      const roomId = this.$route.params.id

      fetch(`/api/v1/rooms/${roomId}`)
        .then(res => res.json())
        .then(data => {
          this.host = data.room.host
          this.category = data.room.category
          this.room = data.room

          document.title = `${this.room.title} - 头盔TV`
        })
        .catch(err => {
          this.$notify({
            title: '出错',
            message: '数据加载出现了问题',
            type: 'error'
          })
        })
    },

    components: {
      StreamPlayer
    }
  }
</script>

<style scoped>
  #host-avatar {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 40px;
    border: 3px solid #20A0FF;
    float: right;
  }

  #room-title {
    color: #1F2D3D;
    margin: 0.7rem 0;
  }

  #host-nickname {
    color: #99A9BF;
  }

  .margin-20 {
    display: block;
    margin-bottom: 20px;
  }
  .margin-10 {
    display: block;
    margin-bottom: 10px;
  }

  .el-icon-caret-right, .el-icon-time {
    vertical-align: middle;
    height: 20px;
    color: #8492A6;
  }

  .el-icon-caret-right {
    color: #13CE66;
  }

  #room-description {
    width: 100%;
    min-height: 100px;
    padding: 15px;
    border: 1px solid #ECECEC;
  }

  #room-description p {
    padding: 0;
    margin: 0;
  }
</style>