<template>
  <v-container>
    <v-btn color="success" variant="elevated" prepend-icon="mdi-plus" class="mb-4" @click="ajouter">
      Ajouter
    </v-btn>

    <v-row v-if="store.projects.length">
      <v-col v-for="project in store.projects" :key="project.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-3">
          <!-- Barre colorée en haut -->
          <div
            :style="`height: 6px; width: 100%; background-color: ${getStateColor(project.state.name)}; border-radius: 4px 4px 0 0;`"
          ></div>

          <v-card-title>{{ project.name }}</v-card-title>

          <v-card-text class="flex-grow-1">
            <!-- Utilisateurs -->
            <div v-if="project.users && project.users.length">
              <p class="text-subtitle-2 font-weight-medium mb-2">Utilisateurs :</p>
              <ul class="pl-2">
                <li v-for="user in project.users" :key="user.id">
                  <span class="text-blue font-italic">{{ user.name }}</span>
                </li>
              </ul>
            </div>
            <div v-else class="mb-3">
              <em class="text-grey">Aucun utilisateur assigné</em>
            </div>

            <!-- État + Deadline -->
            <div class="mt-4">
              <p><strong>État :</strong> {{ project.state.name }}</p>
              <p><strong>Deadline :</strong> {{ formatDate(project.deadline) }}</p>
            </div>
          </v-card-text>

          <v-card-actions class="d-flex justify-space-between">
            <v-btn color="primary" @click="store.getProject(project.id)">Show</v-btn>
            <v-btn color="error" @click="openDialog(project.id)">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="text-center mt-10">
      <em>Aucun projet pour le moment.</em>
    </div>

    <!-- Dialogue de confirmation -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text> Êtes-vous sûr de vouloir supprimer ce projet ? </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn color="error" variant="elevated" @click="confirmDelete">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { baseStore } from '@/store/baseSore'
import router from '@/router'

const store = baseStore()
const dialog = ref(false)
const selectedProjectId = ref<number | null>(null)

onMounted(() => {
  store.getAllProjects()
})

function ajouter() {
  router.push('/ajouter')
}

function openDialog(id: number) {
  selectedProjectId.value = id
  dialog.value = true
}

function confirmDelete() {
  if (selectedProjectId.value !== null) {
    store.deleteProject(selectedProjectId.value)
  }
  dialog.value = false
}
function formatDate(dateString: string | null) {
  if (!dateString) return 'Aucune'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
function getStateColor(stateName: string): string {
  switch (stateName.toLowerCase()) {
    case 'initiation du projet':
      return 'grey'
    case 'planification':
      return 'blue'
    case 'exécution':
      return 'green'
    case 'annulé':
      return 'red'
    case 'suivi et contrôle':
      return 'pink'
    case 'clôture du projet':
      return 'orange'
    default:
      return 'primary'
  }
}

</script>
