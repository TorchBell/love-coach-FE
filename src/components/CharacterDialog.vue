<script setup>
import { ref, watch } from 'vue'
import { useMotion } from '@vueuse/motion'

const props = defineProps({
  visible: Boolean,
  text: String,
  characterImage: String
})

const dialogRef = ref(null)

// Typewriter effect logic could go here, but keeping it simple for now
</script>

<template>
  <div 
    v-if="visible"
    class="fixed bottom-8 right-8 z-50 flex items-end gap-4 max-w-lg"
    v-motion
    :initial="{ opacity: 0, y: 50 }"
    :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }"
    :leave="{ opacity: 0, y: 20 }"
  >
    <!-- Text Bubble -->
    <div class="bg-white p-6 rounded-2xl rounded-br-none shadow-soft border-2 border-pastel-blue/20 relative mb-4">
      <p class="text-soft-black font-medium leading-relaxed">{{ text }}</p>
      <!-- Triangle -->
      <div class="absolute -bottom-2 right-0 w-4 h-4 bg-white border-r-2 border-b-2 border-pastel-blue/20 transform rotate-45 translate-x-[-50%]"></div>
    </div>

    <!-- Character Portrait -->
    <div class="w-32 h-32 rounded-full border-4 border-white shadow-soft overflow-hidden bg-pastel-yellow/20 shrink-0">
      <img :src="characterImage" alt="Character" class="w-full h-full object-cover" />
    </div>
  </div>
</template>
