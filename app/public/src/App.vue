<template>
  <div id="app">
    <div id="content">
      <router-view></router-view>
    </div>
    <sidebar :user="user"></sidebar>
  </div>
</template>

<script>
  import Sidebar from './components/Sidebar.vue'
  import min from 'min'

  export default {
    data() {
      return {
        user: null
      }
    },

    mounted() {
      min.exists('shield-tv:user')
        .then(exists => {
          if (exists) {
            return min.hgetall('shield-tv:user')
              .then(user => {
                this.user = user
                this.$router.user = user
              })
          }
        })
        .catch(err => console.error(err))
    },

    components: {
      Sidebar
    }
  }
</script>

<style scoped>
  #content {
    padding: 20px;
    width: calc(100% - 200px);
    height: 100vh;
    position: fixed;
    right: 0;
    overflow-y: scroll;
  }
</style>