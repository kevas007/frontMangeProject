<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer expand-on-hover rail>
        <v-list>
          <v-list-item
            v-if="user"
            :prepend-avatar="'https://randomuser.me/api/portraits/women/85.jpg'"
            :subtitle="user.email"
            :title="user.name"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-folder" title="My Files" value="myfiles"></v-list-item>
          <v-list-item prepend-icon="mdi-account-multiple" title="Shared with me" value="shared"></v-list-item>
          <v-list-item prepend-icon="mdi-star" title="Starred" value="starred"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <!-- Bouton Logout en bas -->
        <v-list v-if="isLoggedIn" class="logout-button">
          <v-list-item @click="store.logoutUser()" prepend-icon="mdi-logout" title="Se déconnecter"></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { baseStore } from '@/store/baseSore' // Correction de l'import

const store = baseStore()
const { user, isLoggedIn } = storeToRefs(store)

onMounted(() => {
  store.getToken()
  store.getUser() // Charge les infos de l'utilisateur
})
</script>

<style scoped>
.logout-button {
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>
