<template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh">
    <v-card class="pa-5" style="width: 100%; max-width: 500px">
      <v-card-title class="text-h3 text-center mb-4">Register</v-card-title>
      <form @submit.prevent="submit">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="name" :error-messages="nameError" label="Name" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="email" :error-messages="emailError" label="E-mail" />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                hint="At least 8 characters"
                counter
                @click:append="showPassword = !showPassword"
                :error-messages="passwordError"
                label="Password"
              />
            </v-col>

            <v-col cols="12">
              <div class="mt-4 d-flex justify-space-between align-center">
                <div>
                  <v-btn class="me-4" type="submit">Register</v-btn>
                  <v-btn variant="outlined" @click="handleReset">Clear</v-btn>
                </div>
                <div>
                  <v-btn color="blue" variant="text" to="/login">Login</v-btn>
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
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'
import { useRouter } from 'vue-router'
const showPassword = ref(false)
const router = useRouter()
const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

const { handleSubmit, handleReset } = useForm({ validationSchema: schema })

const { value: name, errorMessage: nameError } = useField('name')
const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')

// Vérifie si l'utilisateur est déjà connecté dès le montage du composant
onMounted(() => {
  const token = localStorage.getItem('userData')
  if (token) {
    router.push('/')
  }
})

const submit = handleSubmit(async (values) => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/auth/register', values)

    const token = response.data.token || response.data.access_token

    localStorage.setItem('userData', token)

    alert(response.data.message)
    router.push('/')
  } catch (error) {
    alert('Registration failed')
  }
})
</script>
