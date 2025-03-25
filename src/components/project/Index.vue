<template>
  <v-container fluid class="kanban-board">
    <v-row>
      <v-col v-for="state in store.states" :key="state.id" cols="12" sm="6" md="4" lg="3">
        <div class="kanban-column">
          <div
            class="kanban-header"
            :class="getStateColorClass(state.name)"
            style="position: relative"
          >
            {{ state.name }}
            <div><Add :state="state" @created="store.getAllProjects" /></div>
          </div>
          <Show
            v-if="selectedProjectId"
            v-model="showProjectModal"
            :id="selectedProjectId"
            @updated="store.getAllProjects"
          />

          <draggable
            :list="projectsByState(state.id)"
            :group="{ name: 'projects', pull: true, put: true }"
            class="kanban-dropzone"
            item-key="id"
            @change="(event) => onDrop(event, state)"
          >
            <template #item="{ element: project }">
              <div
                class="kanban-card"
                :class="{ dragging: draggingId === project.id }"
                @dblclick="openProject(project.id)"
              >
                <div class="kanban-card-title">{{ project.name }}</div>
                <div class="kanban-card-description">{{ project.description }}</div>
              </div>
            </template>
          </draggable>
        </div>
      </v-col>
    </v-row>

    <!-- Loader -->
    <v-overlay :model-value="isLoading" class="d-flex justify-center align-center" persistent>
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>

    <!-- Toast -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { baseStore } from '@/store/baseSore'
import Add from '@/components/project/Add.vue'

const store = baseStore()

const isLoading = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const draggingId = ref<number | null>(null)
import Show from '@/components/project/Show.vue'

const selectedProjectId = ref<number | null>(null)
const showProjectModal = ref(false)

function openProject(id: number) {
  selectedProjectId.value = id
  showProjectModal.value = true
}
onMounted(async () => {
  await store.allState()
  await store.getAllProjects()
})

function projectsByState(stateId: number) {
  return store.projects.filter((p) => p.state_id === stateId)
}

async function onDrop(event: any, newState: any) {
  const movedProject = event.added?.element || event.moved?.element || event.removed?.element

  console.log('📦 movedProject:', movedProject)
  console.log('📦 newState:', newState)

  if (!movedProject || !movedProject.id || !newState?.id) {
    console.warn('❌ Données manquantes dans onDrop')
    showSnackbar.value = true
    snackbarMessage.value = 'Erreur : données manquantes.'
    snackbarColor.value = 'error'
    return
  }

  if (movedProject.state_id !== newState.id) {
    try {
      isLoading.value = true
      draggingId.value = movedProject.id

      await store.updateProject(movedProject.id, {
        name: movedProject.name,
        description: movedProject.description,
        deadline: movedProject.deadline,
        users: movedProject.users?.map((u: any) => u.id) || [],
        state_id: newState.id,
      })

      await store.getAllProjects()

      snackbarMessage.value = `Projet déplacé vers "${newState.name}"`
      snackbarColor.value = 'success'
    } catch (error) {
      console.error('❌ Erreur lors du drag & drop :', error)
      snackbarMessage.value = 'Erreur lors de la mise à jour du projet.'
      snackbarColor.value = 'error'
    } finally {
      showSnackbar.value = true
      isLoading.value = false
      draggingId.value = null
    }
  }
}

function getStateColorClass(stateName: string): string {
  switch (stateName.toLowerCase()) {
    case 'initiation du projet':
      return 'state-grey'
    case 'planification':
      return 'state-blue'
    case 'exécution':
      return 'state-green'
    case 'suivi et contrôle':
      return 'state-pink'
    case 'clôture du projet':
      return 'state-orange'
    case 'annulé':
      return 'state-red'
    default:
      return 'state-default'
  }
}
</script>

<style scoped>
.kanban-board {
  background-color: #121212;
  padding: 20px;
  min-height: 100vh;
}
.kanban-column {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  min-height: 400px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.kanban-header {
  font-weight: bold;
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  color: white;
  margin-bottom: 12px;
}
.kanban-dropzone {
  min-height: 200px;
  padding: 8px;
  border-radius: 6px;
  background-color: #fafafa;
  transition:
    background-color 0.2s ease,
    border 0.2s ease;
  border: 2px solid transparent;
}
.kanban-card {
  background-color: white;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: grab;
}
.kanban-card.dragging {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  opacity: 0.85;
}
.kanban-card-title {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: larger;
  color: #121212;
}
.kanban-card-description {
  font-size: 0.875rem;
  color: #666;
}
.state-grey {
  background-color: #9e9e9e;
}
.state-blue {
  background-color: #2196f3;
}
.state-green {
  background-color: #4caf50;
}
.state-pink {
  background-color: #e91e63;
}
.state-orange {
  background-color: #ff9800;
}
.state-red {
  background-color: #f44336;
}
.state-default {
  background-color: #607d8b;
}
</style>
