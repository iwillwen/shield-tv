<template>
  <div id="main">
    <banners :banners="banners"></banners>
    <block title="热门直播间">
      <el-row :gutter="20" slot="content">
        <el-col :span="6" v-for="room in rooms">
          <image-card
            :title="room.title"
            :url="`/room/${room.name}`"
            :image="room.screenshot"
            :subtitle="room.host.nickname"
            :ext-link="room.category">
          </image-card>
        </el-col>
      </el-row>
    </block>
    <block title="热门游戏">
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
  </div>
</template>

<script>
  import Banners from '../components/Banners.vue'
  import ImageCard from '../components/ImageCard.vue'
  import Block from '../components/Block.vue'

  export default {
    data() {
      return {
        rooms: [
          {
            _id: 'demo',
            title: 'DEMO',
            screenshot: '/public/images/upload/test.png',
            host: {
              nickname: 'demo'
            },
            category: {
              title: '守望先锋'
            }
          },
          {
            _id: 'demo',
            title: 'DEMO',
            screenshot: '/public/images/categories/overwatch.jpg',
            host: {
              nickname: 'demo'
            }
          },
          {
            _id: 'demo',
            title: 'DEMO',
            screenshot: '/public/images/categories/overwatch.jpg',
            host: {
              nickname: 'demo'
            }
          },
          {
            _id: 'demo',
            title: 'DEMO',
            screenshot: '/public/images/categories/overwatch.jpg',
            host: {
              nickname: 'demo'
            }
          },
          {
            _id: 'demo',
            title: 'DEMO',
            screenshot: '/public/images/categories/overwatch.jpg',
            host: {
              nickname: 'demo'
            }
          },
          {
            _id: 'demo',
            title: 'DEMO',
            screenshot: '/public/images/categories/overwatch.jpg',
            host: {
              nickname: 'demo'
            }
          }
        ],

        categories: [
          {
            _id: '57ed0e8cc43a26822fd28650',
            title: '守望先锋',
            name: 'overwatch',
            icon: 'http://localhost:7001/public/images/categories/overwatch.jpg'
          }
        ],

        banners: [
          {
            url: '###',
            image: '/public/images/categories/overwatch.jpg',
            title: "DEMO"
          },
          {
            url: '###',
            image: '/public/images/categories/overwatch.jpg',
            title: "DEMO"
          },
          {
            url: '###',
            image: '/public/images/categories/overwatch.jpg',
            title: "DEMO"
          }
        ]
      }
    },

    components: {
      ImageCard,
      Banners,
      Block
    }
  }
</script>

<style scoped>
  .block .el-col {
    padding-bottom: 15px;
  }
</style>