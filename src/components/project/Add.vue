<template>
  <div class="add-project">
    <v-btn icon size="small" color="white" @click="showModal = true">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-dialog v-model="showModal" max-width="600">
      <v-card>
        <v-card-title>Créer un projet</v-card-title>
        <v-card-text>
          <v-text-field label="Nom" v-model="newProject.name" />
          <v-textarea label="Description" v-model="newProject.description" />
          <v-text-field label="Deadline" v-model="newProject.deadline" type="datetime-local" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showModal = false">Annuler</v-btn>
          <v-btn color="primary" :loading="isCreating" @click="createProject">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { baseStore } from '@/store/baseSore'

const store = baseStore()
const emit = defineEmits(['created'])

const props = defineProps<{
  state: { id: number; name: string }
}>()

const showModal = ref(false)
const isCreating = ref(false)

const newProject = ref({
  name: '',
  description: '',
  deadline: '',
})

async function createProject() {
  if (!newProject.value.name || !props.state?.id || !newProject.value.deadline) {
    alert('Veuillez remplir tous les champs.')
    return
  }

  try {
    isCreating.value = true

    // Corrige le format du datetime pour correspondre à ce que l’API attend
    const formattedDeadline = newProject.value.deadline.replace('T', ' ') + ':00'

    await store.createProject({
      name: newProject.value.name,
      description: newProject.value.description,
      deadline: formattedDeadline,
      state_id: props.state.id,
      users: [],
    })

    emit('created')
    showModal.value = false
    newProject.value = { name: '', description: '', deadline: '' }
  } catch (err) {
    console.error('❌ Erreur création projet:', err)
    alert('Erreur lors de la création du projet.')
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.add-project {
  position: absolute;
  top: 2px;
  right: 8px;
}
</style>
