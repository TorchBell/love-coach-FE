<script setup>
import { ref, onMounted } from 'vue'
import PixelButton from './PixelButton.vue'
import { useMotion } from '@vueuse/motion'
import { useRouter } from 'vue-router'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import tomaIcon from '@/assets/smallIcon/toma.jpg'
import belleIcon from '@/assets/smallIcon/belle.jpg'
import chiiIcon from '@/assets/smallIcon/chii.jpg'

const router = useRouter()
const emit = defineEmits(['start'])

const show = ref(true)
const step = ref(1)
const displayedText = ref("")
const showChoices = ref(false)
const showNextButton = ref(false)

const dialogues = {
  1: "어서오세요! 오랜만이에요!! 또 볼 수 있었으면 좋겠다 생각했는데...",
  2: "오늘은 무엇을 하러 오셨나요?",
  3: "" // Choices step
}

const typeText = async (text) => {
  displayedText.value = ""
  showChoices.value = false
  showNextButton.value = false
  
  for (let i = 0; i < text.length; i++) {
    displayedText.value += text[i]
    await new Promise(r => setTimeout(r, 50))
  }
  
  if (step.value < 3) {
    showNextButton.value = true
  } else {
    showChoices.value = true
  }
}

const nextStep = () => {
  if (step.value < 3) {
    step.value++
    typeText(dialogues[step.value])
  }
}

const handleChoice = (choice) => {
  show.value = false
  setTimeout(() => {
    if (choice === 1) router.push({ path: '/log', query: { tab: 'diet' } })
    else if (choice === 2) router.push({ path: '/log', query: { tab: 'workout' } })
    else if (choice === 3) router.push({ path: '/log', query: { tab: 'running' } })
  }, 300)
}

onMounted(() => {
  setTimeout(() => typeText(dialogues[1]), 1000)
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
        <img :src="CHAR_IMAGES.toma" alt="Toma" class="w-full h-full object-contain pixelated" />
      </div>

      <h2 class="font-pixel text-2xl mb-4 text-vivid-red">Toma</h2>
      
      <div class="bg-white/90 backdrop-blur-sm border-2 border-dark p-4 mb-8 min-h-[100px] rounded-lg shadow-sm relative">
        <!-- Show last question if choices are active -->
        <p v-if="showChoices" class="font-pixel text-soft-black leading-relaxed text-lg font-medium">{{ dialogues[2] }}</p>
        <p v-else class="font-pixel text-soft-black leading-relaxed text-lg font-medium">{{ displayedText }}<span class="animate-pulse" v-if="!showNextButton">_</span></p>
        
        <!-- Manual Next Button -->
        <button 
          v-if="showNextButton"
          @click="nextStep"
          class="absolute bottom-2 right-2 text-pastel-red animate-bounce font-bold cursor-pointer hover:scale-110 transition-transform"
        >
          ▼ 대답하기
        </button>
      </div>

      <div class="flex flex-col gap-4" v-if="showChoices">
        <PixelButton variant="primary" @click="handleChoice(1)" class="text-white font-bold text-lg shadow-md bg-pastel-red hover:bg-pastel-red/80 border-2 border-white flex items-center justify-center gap-3">
          <img :src="tomaIcon" class="w-10 h-10 rounded-full border-2 border-white object-cover" />
          <span>1. 식단 등록하러 왔어</span>
        </PixelButton>
        <PixelButton variant="secondary" @click="handleChoice(2)" class="text-soft-black font-bold text-lg shadow-md bg-pastel-yellow hover:bg-pastel-yellow/80 border-2 border-white flex items-center justify-center gap-3">
          <img :src="belleIcon" class="w-10 h-10 rounded-full border-2 border-white object-cover" />
          <span>2. 근력운동 등록하러 왔어</span>
        </PixelButton>
        <PixelButton variant="accent" @click="handleChoice(3)" class="text-white font-bold text-lg shadow-md bg-pastel-blue hover:bg-pastel-blue/80 border-2 border-white flex items-center justify-center gap-3">
          <img :src="chiiIcon" class="w-10 h-10 rounded-full border-2 border-white object-cover" />
          <span>3. 유산소운동 등록하러 왔어</span>
        </PixelButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pixelated {
  image-rendering: pixelated;
}
</style>
