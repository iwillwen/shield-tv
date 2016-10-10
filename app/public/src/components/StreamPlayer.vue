<template>
  <el-row :gutter="10">
    <el-col :span="18">
      <div class="abp" @click.prevent="togglePlayback">
        <div id="comments-stage" class="container" ref="commentsStage"></div>
        <video ref="player" id="stream-player" class="video-js vjs-default-skin"
          controls preload="auto"
          data-setup='{"example_option":true}'>
          <source :src="rtmp" type="rtmp/mp4">
          <source :src="hls" type="application/x-mpegURL">
        </video>
      </div>
    </el-col>
    <el-col :span="6">
      <div id="comments-wrapper" ref="commentsWrapper">
        <ul id="comments">
          <li v-for="comment in comments">
            <span class="comment-nickname">{{comment.user.nickname}}</span>: {{comment.content}}
          </li>
        </ul>
      </div>
      <div id="comment-sender">
        <span id="comment-label">发送弹幕</span>
        <textarea id="content-textarea" v-model="content"></textarea>
        <el-button type="primary" icon="check" size="small" @click.native="newComment">发送</el-button>
        <div id="comment-sender-mask" v-if="!user">
          尚未登录
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import 'video.js/dist/video-js.min.css'
  import videojs from 'video.js'
  import 'videojs-contrib-hls'
  import CommentManager from '../assets/ccl'
  import 'comment-core-library/build/style.css'
  import 'whatwg-fetch'

  videojs.options.flash.swf = '/public/video-js.swf'

  export default {
    props: [ 'room' ],

    data() {
      return {
        content: '',

        comments: [
        ],

        player: null,
        cm: null,
        socket: null,

        user: null
      }
    },

    mounted() {
      if (this.$parent.$router.user) {
        this.user = this.$parent.$router.user
      }

      // Apply the player UI
      const width = this.$refs.player.offsetWidth
      const height = width / 16 * 9
      this.$refs.player.style.height = height + 'px'
      this.$refs.commentsWrapper.style.height = height - 100 + 'px'

      const options = {
        hls: {
          withCredentials: true
        }
      }

      // Stream Player
      const player = videojs(this.$refs.player, {
        html5: options,
        flash: options
      })
      this.player = player
      window.player = player


      // Comment render
      const CM = new CommentManager(this.$refs.commentsStage)
      this.cm = CM
      CM.init()
      CM.start()
      window.cm = CM

      if (this.room.active) {
        this.togglePlayback()
      }

      // WebSocket
      const socket = this.socket = new WebSocket(`ws://${location.host}/api/v1/comments`)
      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 0, // Handshake
          room: this.room._id
        }))
      }
      socket.onmessage = evt => {
        const { user: { nickname }, content } = JSON.parse(evt.data)

        this.handleComment(nickname, content)
      }
    },

    methods: {
      togglePlayback() {
        let timer = null
        if (this.player == null) return
        if (this.player.paused()) {
          if (this.cm != null) {
            timer = setInterval(() => {
              this.cm.time(Math.round(this.player.currentTime() * 1000))
            }, 10)
          }
          this.cm.startTimer()
          this.player.play()
        } else {
          if (this.cm != null) {
            this.cm.stopTimer()
            clearTimeout(timer)
          }
          this.player.pause()
        }
      },

      newComment() {
        const content = this.content
        this.content = ''

        // Send comment
        fetch('/api/v1/comments', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            room: this.room._id,
            content
          })
        })
      },

      // Handle comment from the 
      handleComment(nickname, content) {
        const stime = this.player.currentTime() * 1000 + 300

        // Render comment into the player
        this.cm.insert({
          mode: 1,
          size: 24,
          text: content,
          stime,
          color: 0xffffff
        })

        // Push comment into the list
        this.comments.push({
          user: { nickname: nickname },
          content: content
        })
      }
    },

    computed: {
      rtmp() {
        return `rtmp://${location.hostname}/live/${this.room.streamKey}`
      },
      hls() {
        return `http://${location.hostname}:8081/live/${this.room.streamKey}.m3u8`
      }
    }
  }
</script>

<style scoped>
  #stream-player {
    width: 100%;
  }

  #comments {
    list-style: none;
    padding: 0;
    margin: 10px;
  }

  #comments li {
    margin-bottom: 5px;
    color: #1F2D3D;
    font-size: 14px;
    overflow: hidden;
  }

  .comment-nickname {
    color: #20A0FF;
  }

  #comments-wrapper {
    position: relative;
    width: 100%;
    border: 1px solid #ECECEC;
    overflow-y: scroll;
  }

  #comment-sender {
    width: 100%;
    height: 100px;
    border: 1px solid #ECECEC;
    margin-top: -1px;
    position: relative;
  }

  #comment-sender #content-textarea {
    width: 100%;
    height: calc(100% - 24px);
    border: none;
    resize: none;
    outline: none;
    padding: 3px 10px;
  }

  #comment-sender .el-button {
    position: absolute;
    right: 0;
    bottom: 0;
  }

  #comment-label {
    font-size: 14px;
    padding: 8px;
    line-height: 24px;
    color: #99A9BF;
  }

  #comment-sender-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #FFF;
    opacity: 0.9;

    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
  }

  #comments-stage {
    position: absolute;
    top: 0;
    height: 85%;
  }
</style>