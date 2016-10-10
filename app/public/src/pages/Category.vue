<template>
  <div id="category" v-if="category">
    <div id="category-header" :style="headerStyle">
      <el-row>
        <el-col :span="16" :offset="4">
          <h1>{{category.title}} {{category.name | toUpperCase}}</h1>
        </el-col>
        <el-col :span="4" v-if="logined">
          <div style="padding: 50px 0;">
            <el-button type="primary" @click.native="subscribe">
              <i class="el-icon-star-on"></i> 关注
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <span class="margin-10"></span>
    <el-row :gutter="20">
      <el-col :span="6" v-for="room in rooms">
        <image-card
          :title="room.title"
          :url="`/room/${room.name}`"
          :image="room.screenshot"
          :subtitle="subtitle(room)"
          :placeholder="room.category.icon"
          :ext-link="room.category">
        </image-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import 'whatwg-fetch'
  import ImageCard from '../components/ImageCard.vue'

  export default {
    data() {
      return {
        category: null,
        rooms: [],
        logined: false
      }
    },

    watch: {
      '$route': function(to, from) {
        const categoryName = to.params.name

        this.mountCategory(categoryName)
      }
    },

    mounted() {
      const categoryName = this.$route.params.name

      if (this.$router.user) {
        this.logined = true
      }

      this.mountCategory(categoryName)
    },

    methods: {
      mountCategory(categoryName) {
        fetch(`/api/v1/categories/${categoryName}`)
          .then(res => res.json())
          .then(data => {
            this.category = data.category
          })


        fetch(`/api/v1/categories/${categoryName}/rooms`)
          .then(res => res.json())
          .then(data => {
            this.rooms = data.rooms
          })
      },

      subscribe() {
        fetch(`/api/v1/starredcategories/${this.$route.params.name}`, {
          method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
          .then(res => res.json())
          .then(data => {
            this.$message({
              message: '关注成功',
              type: 'success'
            })
          })
      },

      subtitle(room) {
        let subtitle = ''

        if (room.active) {
          subtitle += '<i class="el-icon-caret-right" style="color: #13CE66" title="正在直播"></i> '
        }

        subtitle += room.host.nickname

        return subtitle
      }
    },

    computed: {
      headerStyle() {
        return {
          backgroundImage: `linear-gradient(to right, rgba(255,255,0,0) 0%, rgba(255,255,255, 0.5) 10%, rgba(255,255,255, 0.7) 15%, #FFF 20%), url(${this.category.icon || ''})`
        }
      }
    },

    components: {
      ImageCard
    }
  }
</script>

<style scoped>
  #category-header {
    height: 150px;
    display: block;
    border-top: 1px solid #EEE;
    border-bottom: 1px solid #EEE;
    background-size: auto 150px;
    background-position: top left;
    background-repeat-x: no-repeat;
  }

  #category-header h1 {
    line-height: 150px;
    margin: 0;
    font-size: 3rem;
  }
</style>