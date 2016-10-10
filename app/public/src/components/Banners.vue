<template>
  <div class="swiper-container">
      <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="banner in banners">
            <a :href="banner.url"><img :src="banner.image" :alt="banner.title"></a>
          </div>
      </div>
      <div class="swiper-pagination"></div>
  </div>
</template>

<script>
  import 'swiper/dist/css/swiper.min.css'
  import Swiper from 'swiper'

  export default {
    props: [ 'banners' ],

    mounted() {
      new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        slidesPerView: 'auto',
        centeredSlides: true,
        paginationClickable: true,
        loop: true,
        loopedSlides: this.banners.length,
        speed: 650,
        autoplay: 5000
      })
    }
  }
</script>

<style scoped>
  .swiper-container {
    width: calc(100% + 40px);
    margin: -20px;
    margin-bottom: 0;
    height: calc((100vw - 200px) * 0.8 * 0.8 / 16 * 9);
    background: #000;
  }

  .swiper-slide {
    width: 80%;
    opacity: 0.6;
    position: relative;
    transition: 0.65s opacity linear;
  }
  .swiper-slide.swiper-slide-active {
    opacity: 1;
  }

  .swiper-slide a {
    width: 100%;
    position: relative;
  }

  .swiper-slide a img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>