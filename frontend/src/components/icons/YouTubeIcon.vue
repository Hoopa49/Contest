<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" :style="{ fill: color }">
    <path d="M21.582 7.15c-.239-2.79-1.881-3.17-3.582-3.35C15.8 3.5 13.6 3.5 12 3.5s-3.8 0-6 .3c-1.701.18-3.343.56-3.582 3.35C2.2 9.95 2.2 12 2.2 12s0 2.05.218 4.85c.239 2.79 1.881 3.17 3.582 3.35 2.2.3 4.4.3 6 .3s3.8 0 6-.3c1.701-.18 3.343-.56 3.582-3.35.218-2.8.218-4.85.218-4.85s0-2.05-.218-4.85zM10 15V9l5.5 3L10 15z"/>
  </svg>
</template>

<script>
export default {
  name: 'YouTubeIcon',
  props: {
    color: {
      type: String,
      default: 'currentColor'
    }
  }
}
</script> 