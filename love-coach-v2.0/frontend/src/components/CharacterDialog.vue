<script setup>
import { ref, watch } from 'vue'
import { useMotion } from '@vueuse/motion'

const props = defineProps({
  visible: Boolean,
  text: String,
  characterImage: String,
  choices: {
    type: Array,
    default: () => []
  },
  enableInput: Boolean
})

const emit = defineEmits(['select', 'send'])

const inputValue = ref('')

const handleSend = () => {
  if (!inputValue.value.trim()) return
  emit('send', inputValue.value)
  inputValue.value = ''
}

const dialogRef = ref(null)

// Typewriter effect logic could go here, but keeping it simple for now
</script>

<template>
  <div 
    v-if="visible"
    class="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4 max-w-2xl w-full px-4"
    v-motion
    :initial="{ opacity: 0, y: 50 }"
    :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }"
    :leave="{ opacity: 0, y: 20 }"
  >
    <!-- Choices Container (VN Style) - No Icons -->
    <div v-if="choices && choices.length > 0" class="flex flex-col gap-3 mb-2 w-full items-end">
      <button 
        v-for="choice in choices" 
        :key="choice.id"
        @click="$emit('select', choice.id)"
        class="bg-gradient-to-r from-white to-cream hover:from-pastel-red hover:to-pink-400 hover:text-white text-soft-black px-8 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 hover:-translate-x-2 font-bold text-lg border-2 border-pastel-red/30 hover:border-white text-right min-w-[300px] backdrop-blur-sm"
      >
        <span>{{ choice.text }}</span>
      </button>
    </div>

    <!-- Chat Input -->
    <div v-if="enableInput" class="w-full max-w-xl mb-4 flex gap-2">
      <input 
        v-model="inputValue"
        @keyup.enter="handleSend"
        type="text" 
        placeholder="대화를 입력하세요..."
        class="flex-1 px-6 py-4 rounded-2xl border-2 border-pastel-red/30 focus:border-pastel-red shadow-lg bg-white/90 backdrop-blur-sm focus:outline-none transition-all"
      />
      <button 
        @click="handleSend"
        class="bg-pastel-red text-white px-6 rounded-2xl font-bold shadow-lg hover:bg-pastel-red/90 transition-all hover:scale-105"
      >
        전송
      </button>
    </div>

    <div class="flex items-end gap-4 w-full justify-end">
      <!-- Text Bubble (Enhanced VN Style) -->
      <div class="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-pastel-blue/40 relative mb-4 flex-1 max-w-xl">
        <p class="text-soft-black font-medium leading-relaxed text-xl">{{ text }}</p>
        <!-- Triangle pointer -->
        <div class="absolute -bottom-3 right-12 w-6 h-6 bg-white border-r-4 border-b-4 border-pastel-blue/40 transform rotate-45"></div>
      </div>

      <!-- Character Portrait (Larger) -->
      <div class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-pastel-yellow/30 to-pastel-pink/30 shrink-0">
        <img :src="characterImage" alt="Character" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>
