<template>
  <v-dialog
    v-model="visible"
    max-width="900"
    persistent
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card
      v-if="store.currentProject"
      class="pa-6"
      style="max-height: 90vh; overflow-y: auto"
    >
      <v-card-title class="d-flex align-center justify-space-between">
        <span v-if="!isEditing" class="text-h5">{{ store.currentProject.name }}</span>
        <v-text-field v-if="isEditing" v-model="form.name" label="Nom du projet" dense />
        <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-subtitle>
        🗕️ Deadline :
        <template v-if="isEditing">
          <v-text-field v-model="form.deadline" type="datetime-local" dense class="mt-2" />
        </template>
        <template v-else>
          {{ formatDate(store.currentProject.deadline) }}
        </template>

        <div class="mt-3">
          <template v-if="isEditing">
            <v-select
              v-model="form.state_id"
              :items="store.states"
              item-title="name"
              item-value="id"
              label="État du projet"
              dense
            />
          </template>
          <template v-else>
            <v-chip
              :color="getStateColor(store.currentProject.state?.name || '')"
              text-color="white"
            >
              {{ getStateEmoji(store.currentProject.state?.name || '') }}
              {{ store.currentProject.state?.name }}
            </v-chip>
          </template>
        </div>
      </v-card-subtitle>

      <v-card-text>
        <!-- Description -->
        <div class="mb-4">
          <template v-if="isEditing">
            <v-textarea v-model="form.description" label="Description" rows="3" />
          </template>
          <template v-else>
            <p>{{ store.currentProject.description }}</p>
          </template>
        </div>

        <!-- Utilisateurs -->
        <div>
          <p class="font-weight-medium mb-2">👥 Utilisateurs assignés :</p>
          <template v-if="isEditing">
            <div class="d-flex gap-2 mb-2">
              <v-btn @click="selectAllUsers" color="primary">Tous</v-btn>
              <v-btn @click="clearSelectedUsers" color="secondary">Aucun</v-btn>
            </div>
            <v-select
              v-model="form.users"
              :items="store.user"
              item-title="name"
              item-value="id"
              label="Utilisateurs"
              multiple
              chips
            />
          </template>
          <template v-else>
            <ul v-if="store.currentProject.users?.length">
              <li v-for="user in store.currentProject.users" :key="user.id">
                {{ user.name }}
              </li>
            </ul>
            <em v-else>Aucun utilisateur assigné</em>
          </template>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="justify-end">
        <v-btn v-if="isEditing" color="success" @click="enregistrer">Enregistrer</v-btn>
        <v-btn v-if="isEditing" @click="annuler">Annuler</v-btn>
        <v-btn v-else color="primary" @click="activerEdition">Modifier</v-btn>
        <v-btn color="error" class="ml-2" @click="showConfirmDialog = true">Supprimer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Boîte de dialogue de confirmation -->
  <v-dialog v-model="showConfirmDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h6">❗ Confirmation</v-card-title>
      <v-card-text>
        Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="showConfirmDialog = false">Annuler</v-btn>
        <v-btn color="error" @click="supprimerEdition(store.currentProject.id)">
          Oui, supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { baseStore } from '@/store/baseSore'

const store = baseStore()

const props = defineProps<{ id: number; modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'updated'])

const visible = ref(props.modelValue)
const isEditing = ref(false)
const showConfirmDialog = ref(false)

const form = ref({
  name: '',
  description: '',
  deadline: '',
  state_id: null as number | null,
  users: [] as number[],
})

watch(() => props.modelValue, (val) => (visible.value = val))
watch(visible, (val) => emit('update:modelValue', val))

watch(() => props.id, async (newId) => {
  if (newId) await loadProject(newId)
})

async function loadProject(id: number) {
  form.value = { name: '', description: '', deadline: '', state_id: null, users: [] }
  await store.allState()
  await store.getAllUser()
  await store.getProject(id)

  if (store.currentProject) {
    form.value.name = store.currentProject.name
    form.value.description = store.currentProject.description
    form.value.deadline = store.currentProject.deadline
    form.value.state_id = store.currentProject.state_id
    form.value.users = store.currentProject.users?.map((u) => u.id) || []
  }
}

function activerEdition() {
  isEditing.value = true
}

function enregistrer() {
  store.updateProject(store.currentProject.id, {
    name: form.value.name,
    description: form.value.description,
    deadline: form.value.deadline,
    users: form.value.users || [],
    state_id: form.value.state_id!,
  })
  isEditing.value = false
  emit('updated')
}

function annuler() {
  isEditing.value = false
  if (store.currentProject) {
    form.value.name = store.currentProject.name
    form.value.description = store.currentProject.description
    form.value.deadline = store.currentProject.deadline
    form.value.state_id = store.currentProject.state_id
    form.value.users = store.currentProject.users?.map((u) => u.id) || []
  }
}

async function supprimerEdition(id: number) {
  try {
    await store.deleteProject(id)
    emit('updated')
    close()
  } catch (err) {
    alert('Erreur lors de la suppression.')
    console.error(err)
  } finally {
    showConfirmDialog.value = false
  }
}

function selectAllUsers() {
  form.value.users = store.user.map((u) => u.id)
}
function clearSelectedUsers() {
  form.value.users = []
}
function formatDate(date: string | null) {
  if (!date) return 'Non définie'
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}
function getStateColor(stateName: string): string {
  switch (stateName.toLowerCase()) {
    case 'initiation du projet': return 'grey'
    case 'planification': return 'blue'
    case 'exécution': return 'green'
    case 'suivi et contrôle': return 'pink'
    case 'clôture du projet': return 'orange'
    case 'annulé': return 'red'
    default: return 'primary'
  }
}
function getStateEmoji(stateName: string): string {
  switch (stateName.toLowerCase()) {
    case 'initiation du projet': return '⚪'
    case 'planification': return '🔵'
    case 'exécution': return '🟢'
    case 'suivi et contrôle': return '🟣'
    case 'clôture du projet': return '🟠'
    case 'annulé': return '🔴'
    default: return '❔'
  }
}
function close() {
  visible.value = false
}
</script>

<style scoped>
ul {
  padding-left: 1rem;
}
</style>
