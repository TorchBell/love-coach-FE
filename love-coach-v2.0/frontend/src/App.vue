<script setup>
import CharacterDialog from './components/CharacterDialog.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'

const mainCharacterBelle = CHAR_IMAGES?.belle || ''

const route = useRoute()
const authStore = useAuthStore()
const showDialog = ref(false)

// Restore session on app load
onMounted(async () => {
  await authStore.fetchUserProfile()
})

// Scroll Detection for Dialog (listen from child routes)
const handleScroll = (e) => {
  if (e && e.target) {
    const scrollPosition = e.target.scrollTop
    showDialog.value = scrollPosition > 100
  }
}

// Expose handleScroll to child components if needed
defineExpose({ handleScroll })
</script>

<template>
  <!-- IntroOverlay removed - it was blocking the Landing page -->
  
  <!-- Character Dialog (Scroll Triggered) - Only show on specific routes -->
  <CharacterDialog 
    :visible="showDialog && route.name !== 'landing' && route.name !== 'home'" 
    text="Welcome! Let's start your fitness journey together! 💪" 
    :character-image="mainCharacterBelle"
  />

  <!-- Router View -->
  <router-view @scroll="handleScroll" />
</template>
