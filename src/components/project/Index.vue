<template>
  <div>
    <v-container>
      <v-row>
        <v-col v-for="project in store.projects" :key="project.id" cols="3">
          <v-card class="pa-5" title="Card title" subtitle="Subtitle" text="...">
            <v-card-actions>
              <v-btn>Click me</v-btn>
            </v-card-actions>
            <p>{{ project.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { baseStore } from '@/store/baseSore'

const store = baseStore()

onMounted(() => {
  store.getAllProjects()
})
</script>
