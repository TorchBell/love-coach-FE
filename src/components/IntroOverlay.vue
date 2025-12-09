<script setup>
import { ref, onMounted } from 'vue'
import PixelButton from './PixelButton.vue'
import { useMotion } from '@vueuse/motion'

const emit = defineEmits(['start'])

const show = ref(true)
const text = "Welcome to Love & Fitness! Are you ready to get fit with us?"
const displayedText = ref("")
const showButton = ref(false)

const typeText = async () => {
  for (let i = 0; i < text.length; i++) {
    displayedText.value += text[i]
    await new Promise(r => setTimeout(r, 50))
  }
  showButton.value = true
}

const handleStart = () => {
  show.value = false
  setTimeout(() => {
    emit('start')
  }, 500)
}

onMounted(() => {
  setTimeout(typeText, 1000)
})
</script>

<template>
  <div 
    v-if="show"
    class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }"
    :leave="{ opacity: 0 }"
  >
    <div class="bg-white border-4 border-dark p-8 max-w-2xl w-full mx-4 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative">
      <!-- Character Placeholder (Toma) -->
      <div class="absolute -top-24 right-8 w-32 h-32 animate-bounce">
        <img src="@/assets/images/toma.png" alt="Toma" class="w-full h-full object-contain pixelated" />
      </div>

      <h2 class="font-pixel text-2xl mb-4 text-vivid-red">Toma</h2>
      
      <div class="bg-dark p-4 mb-8 min-h-[100px]">
        <p class="font-pixel text-white leading-relaxed">{{ displayedText }}<span class="animate-pulse">_</span></p>
      </div>

      <div class="text-center" v-if="showButton">
        <PixelButton variant="primary" @click="handleStart">START GAME</PixelButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pixelated {
  image-rendering: pixelated;
}
</style>
