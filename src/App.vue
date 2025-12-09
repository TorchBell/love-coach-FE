<script setup>
import IntroOverlay from './components/IntroOverlay.vue'
import CharacterDialog from './components/CharacterDialog.vue'
import { ref } from 'vue'

// Import character image (using existing asset)
import mainCharacterBelle from '@/assets/images/belle.png'

const gameStarted = ref(false)
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
  <IntroOverlay @start="gameStarted = true" />
  
  <!-- Character Dialog (Scroll Triggered) -->
  <CharacterDialog 
    :visible="showDialog" 
    text="Welcome! Let's start your fitness journey together! 💪" 
    :character-image="mainCharacterBelle"
  />

  <!-- Router View -->
  <router-view @scroll="handleScroll" />
</template>
