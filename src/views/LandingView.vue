<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import doorImage from '@/assets/images/door_final.png'

const router = useRouter()
const isFading = ref(false)
const showDoor = ref(false)

onMounted(() => {
  showDoor.value = true
})

const handleKnock = () => {
  // Mark as visited
  localStorage.setItem('hasVisitedDoor', 'true')
  
  // Trigger fade out to white
  isFading.value = true
  
  // Navigate after fade completes
  setTimeout(() => {
    router.push('/home')
  }, 1200)
}
</script>

<template>
  <div 
    v-if="showDoor"
    class="landing-container flex items-center justify-center min-h-screen bg-gradient-to-br from-pastel-pink via-cream to-pastel-blue overflow-hidden relative"
  >
    <!-- White Fade Overlay -->
    <Transition name="fade-white">
      <div 
        v-if="isFading" 
        class="absolute inset-0 bg-white z-50"
      ></div>
    </Transition>

    <div class="text-center z-10">
      <h1 class="text-5xl font-bold text-soft-black mb-12 font-pixel animate-pulse drop-shadow-lg">
        문을 두드려보세요
      </h1>
      
      <div 
        class="door-wrapper relative inline-block transition-all duration-500 hover:scale-105 cursor-fist filter drop-shadow-2xl"
        @dblclick="handleKnock"
      >
        <img 
          :src="doorImage" 
          alt="Entrance Door" 
          class="w-[28rem] md:w-[36rem] lg:w-[44rem] rounded-t-[2rem]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-t-[2rem] pointer-events-none"></div>
        
        <!-- Glow effect -->
        <div class="absolute inset-0 bg-white/30 blur-2xl opacity-50 -z-10 animate-pulse"></div>
      </div>
      
      <p class="mt-8 text-gray-600 text-lg font-medium animate-bounce">
        💭 더블클릭으로 노크하세요
      </p>
    </div>
  </div>
</template>

<style scoped>
.cursor-fist {
  cursor: url('../assets/images/cursor_fist.png') 16 16, pointer;
}

/* White fade animation */
.fade-white-enter-active {
  animation: fadeToWhite 1.2s ease-in-out;
}

@keyframes fadeToWhite {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

/* Background gradient animation */
.landing-container {
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
