<template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh">
    <v-card class="pa-5" style="width: 100%; max-width: 500px">
      <v-card-title class="text-h3 text-center mb-4">Login</v-card-title>
      <form @submit.prevent="store.loginUser">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="store.UserLogin.email" label="E-mail" />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="store.UserLogin.password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                hint="At least 8 characters"
                counter
                @click:append="showPassword = !showPassword"
                label="Password"
              />
            </v-col>

            <v-col cols="12">
              <div class="mt-4 d-flex justify-space-between align-center">
                <div>
                  <v-btn class="me-4" type="submit">Submit</v-btn>
                </div>
                <div>
                  <v-btn class="bg-blue" variant="text" to="/register">Register</v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import * as yup from 'yup'

import { useRouter } from 'vue-router'
import { baseStore } from '@/store/baseSore'

const store = baseStore()

const router = useRouter()

const showPassword = ref(false)

const schema = yup.object({
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

// Vérifie si l'utilisateur est déjà connecté dès le montage du composant
</script>
