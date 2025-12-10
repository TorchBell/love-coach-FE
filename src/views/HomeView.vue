<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import tomaImage from '@/assets/images/tomai.png'
import CharacterDialog from '../components/CharacterDialog.vue'

const router = useRouter()
const showDialog = ref(false)
const dialogText = ref("어서오세요!") // Updated greeting
const currentChoices = ref([])

// Updated menu items for left sidebar
const menuItems = [
  { id: 'gallery', label: '갤러리', path: '/gallery', icon: '🖼️' },
  { id: 'log', label: '기록', path: '/log', icon: '📝' },
  { id: 'achievement', label: '업적', path: '/achievement', icon: '🏆' },
  { id: 'mypage', label: '마이페이지', path: '/mypage', icon: '👤' },
]

const handleMenuClick = (path) => {
  router.push(path)
}

const openDialog = () => {
  showDialog.value = true
  dialogText.value = "무엇을 도와드릴까요?"
  currentChoices.value = dialogChoices
}

const handleChoice = (choiceId) => {
  console.log('Selected choice:', choiceId)
  currentChoices.value = []
  
  if (choiceId === 1) {
    dialogText.value = "식단 기록 페이지로 이동할게요!"
    setTimeout(() => {
      showDialog.value = false
      router.push({ path: '/log', query: { tab: 'diet' } })
    }, 1000)
  } else if (choiceId === 2) {
    dialogText.value = "운동 기록 페이지로 이동할게요!"
    setTimeout(() => {
      showDialog.value = false
      router.push({ path: '/log', query: { tab: 'workout' } })
    }, 1000)
  } else if (choiceId === 3) {
    dialogText.value = "러닝 기록 페이지로 이동할게요!"
    setTimeout(() => {
      showDialog.value = false
      router.push({ path: '/log', query: { tab: 'running' } })
    }, 1000)
  } else if (choiceId === 4) {
    dialogText.value = "그래, 천천히 생각해봐. 언제든 기다릴게."
    setTimeout(() => {
      showDialog.value = false
      setTimeout(() => {
        dialogText.value = "어서오세요!"
      }, 300)
    }, 1500)
  }
}

const dialogChoices = [
  { id: 1, text: "오늘 먹은 식단 기록할래" },
  { id: 2, text: "운동 기록하러 왔어" },
  { id: 3, text: "러닝 기록하러 왔어" },
  { id: 4, text: "지금은 좀 더 생각해봐야할 거 같아" }
]
</script>

<template>
  <div class="home-container min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink/30 relative overflow-hidden flex">
    
    <!-- Left Side: Large Navigation Menu -->
    <div class="w-1/3 z-20 flex flex-col justify-center pl-16 space-y-8">
      <h1 class="text-6xl font-bold text-pastel-red font-pixel mb-12 tracking-wider drop-shadow-sm">
        Love &<br>Nyam
      </h1>
      
      <nav class="flex flex-col space-y-6">
        <button 
          v-for="item in menuItems" 
          :key="item.id"
          @click="handleMenuClick(item.path)"
          class="group flex items-center space-x-6 text-3xl font-bold text-gray-500 hover:text-pastel-red transition-all duration-300 transform hover:translate-x-4 hover:scale-105"
        >
          <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-4xl filter drop-shadow-md">{{ item.icon }}</span>
          <span class="relative">
            {{ item.label }}
            <span class="absolute -bottom-2 left-0 w-0 h-1 bg-pastel-red transition-all duration-300 group-hover:w-full"></span>
          </span>
        </button>
      </nav>
    </div>

    <!-- Right Side: Character Area -->
    <div class="w-2/3 relative flex items-end justify-center z-10">
      <!-- Character Image (Toma) -->
      <img 
        :src="tomaImage" 
        alt="Toma" 
        class="h-[90vh] object-contain transform translate-y-4 transition-transform duration-700 hover:scale-105 filter drop-shadow-2xl"
      />

      <!-- Speech Bubble (Initial Greeting) - Moved to Right -->
      <div 
        v-if="!showDialog"
        class="absolute top-[25%] right-[15%] bg-white/95 backdrop-blur-sm p-8 rounded-3xl rounded-bl-none shadow-xl animate-float cursor-pointer hover:bg-pastel-pink/10 transition-all border-2 border-pastel-red/20 max-w-xs"
        @click="openDialog"
      >
        <p class="text-2xl font-bold text-soft-black leading-relaxed">{{ dialogText }}</p>
        <!-- Tail pointing to character -->
        <div class="absolute bottom-4 -left-3 w-6 h-6 bg-white/95 border-l-2 border-b-2 border-pastel-red/20 transform rotate-45"></div>
      </div>
      
      <!-- Chat Button (Floating) -->
      <button 
        @click="openDialog"
        class="absolute bottom-16 right-16 bg-gradient-to-r from-pastel-red to-pink-400 text-white px-10 py-5 rounded-full shadow-2xl hover:shadow-pastel-red/50 transition-all transform hover:scale-110 font-bold text-xl z-30 flex items-center gap-3 border-4 border-white/50"
      >
        <span class="text-2xl">💬</span>
        <span>대화하기</span>
      </button>
    </div>

    <!-- Dialog Overlay -->
    <CharacterDialog 
      :visible="showDialog" 
      :text="dialogText" 
      :character-image="tomaImage"
      :choices="currentChoices"
      @select="handleChoice"
    />
    
    <!-- Decorative elements -->
    <div class="absolute top-10 right-10 w-64 h-64 bg-pastel-yellow/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
    <div class="absolute bottom-10 left-10 w-80 h-80 bg-pastel-blue/10 rounded-full blur-3xl animate-pulse pointer-events-none" style="animation-delay: 1.5s;"></div>
  </div>
</template>

<style scoped>
.home-container {
  background-size: 200% 200%;
  animation: gradientShift 10s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes animate-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: animate-float 3s ease-in-out infinite;
}
</style>
