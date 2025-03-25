<template>
  <div class="add-project">
    <v-btn icon size="small" color="white" @click="openModal">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-dialog v-model="showModal" max-width="600">
      <v-card>
        <v-card-title>Créer un projet</v-card-title>
        <v-card-text>
          <v-text-field label="Nom" v-model="newProject.name" />
          <v-textarea label="Description" v-model="newProject.description" />
          <v-text-field label="Deadline" v-model="newProject.deadline" type="datetime-local" />

          <!-- Sélecteur multi-utilisateurs -->
          <v-select
            v-model="selectedUsers"
            :items="usersList"
            item-title="name"
            item-value="id"
            label="Utilisateurs assignés"
            multiple
            chips
            clearable
          />
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
import { ref, onMounted } from 'vue'
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

const usersList = ref<{ id: number; name: string }[]>([])
const selectedUsers = ref<number[]>([])

async function openModal() {
  showModal.value = true
  await fetchUsers()
}

async function fetchUsers() {
  try {
    const res = await fetch('http://localhost:8000/api/v1/users', {
      headers: {
        Authorization: `Bearer ${store.token}`,
        Accept: 'application/json',
      },
    })
    const data = await res.json()
    usersList.value = data.data // adapte si ta structure diffère
  } catch (e) {
    console.error('Erreur chargement utilisateurs', e)
  }
}

async function createProject() {
  if (!newProject.value.name || !props.state?.id || !newProject.value.deadline) {
    alert('Veuillez remplir tous les champs.')
    return
  }

  try {
    isCreating.value = true

    const formattedDeadline = newProject.value.deadline.replace('T', ' ') + ':00'

    await store.createProject({
      name: newProject.value.name,
      description: newProject.value.description,
      deadline: formattedDeadline,
      state_id: props.state.id,
      users: selectedUsers.value,
    })

    emit('created')
    showModal.value = false
    selectedUsers.value = []
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
