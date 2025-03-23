<template>
  <v-container fluid class="pa-0 d-flex align-center justify-center" style="height: 100vh">
    <v-card class="d-flex flex-column" style="width: 100vw; height: 100vh; border-radius: 0">
      <v-card-title class="text-h4 text-truncate">
        {{ store.projects[0]?.name || 'Chargement...' }}
      </v-card-title>

      <v-card-subtitle class="text-subtitle-1 text-grey">
        {{ store.projects[0]?.description || 'Pas de description' }}
      </v-card-subtitle>

      <v-card-text class="flex-grow-1 overflow-auto" style="font-size: 1.2rem; padding: 16px">
        <div v-if="store.projects[0]?.users?.length">
          <div v-for="user in store.projects[0].users" :key="user.id" class="mb-2">
            <span class="text-blue font-italic">{{ user.name }}</span>
          </div>
        </div>
        <div v-else>
          <em class="text-grey">Aucun utilisateur assigné</em>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 d-flex justify-end">
        <v-btn color="primary">Modifier</v-btn>
        <v-btn color="error" class="ml-2">Supprimer</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { baseStore } from '@/store/baseSore'

const store = baseStore()

onMounted(() => {
  store.getAllProjects()
})
</script>
