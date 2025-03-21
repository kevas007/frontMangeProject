<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { baseStore } from '@/store/baseSore'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
const store = baseStore()
const { isLoggedIn } = storeToRefs(store)
onMounted(() => {
  store.getToken()
})
console.log(isLoggedIn)
</script>

<template>
  <Navbar v-if="isLoggedIn" class="nav" />
  <RouterView />
</template>

<style scoped>
.nav {
  z-index: 1;
}
</style>
