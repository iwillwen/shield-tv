<template>
  <div class="block">
    <h1 class="title">{{title}}</h1>
    <slot name="content"></slot>
  </div>
</template>

<script>
  export default {
    props: [ 'title' ]
  }
</script>

<style scoped>
  .block {
    padding-bottom: 10px;
  }

  .title {
    font-size: 20px;
    color: #1F2D3D;
  }
</style>