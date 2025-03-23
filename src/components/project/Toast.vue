<template>
  <v-snackbar v-model="visible" :timeout="timeout" :color="color">
    {{ message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  message: string
  color?: string
  timeout?: number
}>()

const visible = ref(props.show)
const timeout = props.timeout ?? 3000
const color = props.color ?? 'success'

// Synchroniser props.show avec visible local
watch(
  () => props.show,
  (val) => {
    visible.value = val
  },
)
</script>
