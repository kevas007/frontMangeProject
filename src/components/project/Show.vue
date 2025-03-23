<template>
  <v-container fluid style="height: 100vh; width: 80vw">
    <v-card
      class="d-flex flex-column justify-space-between pa-6"
      style="height: 100vh; border-radius: 0"
      v-if="store.currentProject"
    >
      <!-- Header -->
      <div>
        <v-btn icon @click="retour">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-card-title class="text-h4 mt-2">
          <template v-if="isEditing">
            <v-text-field v-model="form.name" label="Nom du projet" dense hide-details />
          </template>
          <template v-else>
            {{ store.currentProject.name }}
          </template>
        </v-card-title>

        <v-card-subtitle class="mb-4">
          📅 Deadline :
          <template v-if="isEditing">
            <v-text-field
              v-model="form.deadline"
              label="Deadline"
              type="datetime-local"
              dense
              hide-details
              class="mt-2"
            />
          </template>
          <template v-else>
            {{ formatDate(store.currentProject.deadline) }}
          </template>

          <template v-if="isEditing">
            <v-select
              v-model="form.state_id"
              :items="store.states"
              item-title="name"
              item-value="id"
              label="Sélectionner l'état du projet"
              dense
              hide-details
              class="mt-5"
            />
          </template>
          <template v-else>
            <v-chip
              :color="getStateColor(store.currentProject.state?.name || '')"
              text-color="white"
              class="ma-2"
            >
              {{ getStateEmoji(store.currentProject.state?.name || '') }} État :
              {{ store.currentProject.state?.name || 'Non défini' }}
            </v-chip>
          </template>
        </v-card-subtitle>

        <v-card-text class="text-body-2">
          <template v-if="isEditing">
            <v-textarea v-model="form.description" label="Description" rows="3" />
          </template>
          <template v-else>
            <p>{{ store.currentProject.description }}</p>
          </template>

          <!-- Utilisateurs -->
          <div class="mt-4">
            <p class="font-weight-medium mb-2">👥 Utilisateurs assignés :</p>

            <template v-if="isEditing">
              <div class="d-flex flex-wrap gap-2 mb-2">
                <v-btn
                  color="primary mx-2"
                  @click="selectAllUsers"
                  :disabled="store.user.length === 0"
                >
                  Sélectionner tous
                </v-btn>
                <v-btn
                  color="secondary mx-2"
                  @click="clearSelectedUsers"
                  :disabled="form.users.length === 0"
                >
                  Désélectionner tous
                </v-btn>
              </div>

              <v-select
                v-model="form.users"
                :items="store.user"
                item-title="name"
                item-value="id"
                label="Sélectionner des utilisateurs"
                multiple
                chips
                :class="form.users.length ? 'highlight' : ''"
              />

              <transition name="fade">
                <div v-if="form.users.length" class="text-caption mt-1 text-primary">
                  {{ form.users.length }} utilisateur{{
                    form.users.length > 1 ? 's' : ''
                  }}
                  sélectionné{{ form.users.length > 1 ? 's' : '' }}
                </div>
              </transition>
            </template>

            <template v-else>
              <div v-if="store.currentProject.users?.length">
                <ul>
                  <li v-for="user in store.currentProject.users" :key="user.id">
                    <span class="text-blue font-italic">{{ user.name }}</span>
                  </li>
                </ul>
              </div>
              <div v-else>
                <em class="text-grey">Aucun utilisateur assigné</em>
              </div>
            </template>
          </div>
        </v-card-text>
      </div>

      <!-- Actions -->
      <v-card-actions class="justify-end">
        <v-btn v-if="isEditing" color="success" @click="enregistrer">Enregistrer</v-btn>
        <v-btn v-if="isEditing" class="ml-2" @click="annuler">Annuler</v-btn>
        <v-btn v-else color="primary" @click="activerEdition">Modifier</v-btn>
        <v-btn color="error" class="ml-2" @click="supprimerEdition(store.currentProject.id)">
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card>

    <div v-else class="text-center w-100 mt-10">
      <em>Chargement du projet...</em>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { baseStore } from '@/store/baseSore'

const store = baseStore()
const route = useRoute()
const router = useRouter()

const isEditing = ref(false)

const form = ref({
  name: '',
  description: '',
  deadline: '',
  state_id: null as number | null,
  users: [] as number[],
})

onMounted(async () => {
  const id = Number(route.params.id)
  await store.getAllUser()
  await store.allState()

  if (id) {
    await store.getProject(id)

    if (store.currentProject) {
      form.value.name = store.currentProject.name
      form.value.description = store.currentProject.description
      form.value.deadline = store.currentProject.deadline
      form.value.state_id = store.currentProject.state_id

      if (store.currentProject.users?.length) {
        form.value.users = store.currentProject.users.map((u) => u.id)
      } else {
        form.value.users = []
      }
    }
  }
})

function retour() {
  router.back()
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function activerEdition() {
  if (store.currentProject) {
    form.value.name = store.currentProject.name
    form.value.description = store.currentProject.description
    form.value.deadline = store.currentProject.deadline
    form.value.state_id = store.currentProject.state_id

    if (store.currentProject.users?.length) {
      form.value.users = store.currentProject.users.map((u) => u.id)
    } else {
      form.value.users = []
    }
  }
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
}

function annuler() {
  activerEdition()
  isEditing.value = false
}

function supprimerEdition(id: number) {
  store.deleteProject(id).then(() => {
    router.push('/')
  })
}

function selectAllUsers() {
  if (Array.isArray(store.user)) {
    form.value.users = store.user.map((user) => user.id)
  }
}

function clearSelectedUsers() {
  form.value.users = []
}
function getStateColor(stateName: string): string {
  switch (stateName.toLowerCase()) {
    case 'Initiation du projet':
      return 'grey'
    case 'Planification':
      return 'blue'
    case 'Exécution':
      return 'green'
    case 'annulé':
      return 'red'
    case 'Suivi et Contrôle':
      return 'pink'
    case 'Clôture du projet':
      return 'orange'
    default:
      return 'primary'
  }
}
function getStateEmoji(stateName: string): string {
  switch (stateName.toLowerCase()) {
    case 'initiation du projet':
      return '⚪'
    case 'planification':
      return '🔵'
    case 'exécution':
      return '🟢'
    case 'annulé':
      return '🔴'
    case 'suivi et contrôle':
      return '🟣'
    case 'clôture du projet':
      return '🟠'
    default:
      return '❔'
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.highlight :deep(.v-input) {
  border: 1px solid #2196f3 !important;
  box-shadow: 0 0 4px #2196f3;
  border-radius: 6px;
}
</style>
