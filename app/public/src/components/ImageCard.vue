<template>
  <el-card :body-style="{ padding: '0px' }">
    <router-link :to="url"><img v-lazy="lazyImage" class="image"></router-link>
    <div style="padding: 14px;">
      <span class="title">{{title}}</span>
      <div class="bottom clearfix">
        <span class="time" v-html="subtitle"></span>
        <el-button v-if="extLink" type="text" class="button">{{extLink.title}}</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
  export default {
    props: [ 'image', 'url', 'title', 'subtitle', 'extLink', 'placeholder' ],

    computed: {
      lazyImage() {
        const img = { src: this.image }
        if (this.placeholder) {
          img.error = this.placeholder
          img.loading = this.placeholder
        }

        return img
      }
    }
  }
</script>

<style scoped>
  .clearfix:before, .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both;
  }
  .text {
    font-size: 14px;
  }
  .time {
    font-size: 13px;
    color: #999;
  }
  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }
  .item {
    padding: 18px 0;
  }
  .button {
    padding: 0;
    float: right;
  }
  .image {
    width: 100%;

    display: block;
  }
  .clearfix {
  }

  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
    display: inline-block;
  }

  .el-card a {
    width: 100%;
    height: auto;
    padding-top: 75%;
    display: block;
    overflow: hidden;
    position: relative;
  }

  .el-card a img {
    object-fit: cover;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>