<script setup>
import CharacterDialog from './components/CharacterDialog.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

// Import character image (using existing asset)
import mainCharacterBelle from '@/assets/images/belle.png'

const route = useRoute()
const showDialog = ref(false)

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
