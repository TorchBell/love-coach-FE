<script setup>
import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'
import { UI_IMAGES } from '@/assets/dummy/index.js'
import NowLoading from '../components/NowLoading.vue'

const router = useRouter()
const isFading = ref(false)
const showDoor = ref(false)
const showVideo = ref(false)
const videoRef = ref(null)
const cursorUrl = ref('auto')

onMounted(() => {
  if (UI_IMAGES?.cursorFist) {
    cursorUrl.value = `url('${UI_IMAGES.cursorFist}') 16 16, pointer`
  }
  showDoor.value = true
})

const handleKnock = () => {
  // 방문 기록 저장
  localStorage.setItem('hasVisitedDoor', 'true')
  
  // 흰색 페이드 아웃 시작
  isFading.value = true
  
  // 로딩 설정 확인
  const useLoading = localStorage.getItem('love_coach_loading_screen') !== 'false'

  if (useLoading) {
    // 1. 영상 재생 모드
    setTimeout(() => {
        showVideo.value = true
        // 컴포넌트 내부에서 autoplay
    }, 1000) // 페이드 효과(1.2s)와 얼추 맞춤


    // 4초 후 이동
    setTimeout(() => {
        router.push('/home')
    }, 5000) // 1s (Fade) + 4s (Video)

  } else {
    // 2. 즉시 이동 모드 (기존 로직)
    setTimeout(() => {
        router.push('/home')
    }, 1200)
  }
}
</script>

<template>
  <div 
    v-if="showDoor"
    class="landing-container flex items-center justify-center min-h-screen bg-gradient-to-br from-pastel-pink via-cream to-pastel-blue overflow-hidden relative"
  >
    <!-- 흰색 페이드 오버레이 -->
    <Transition name="fade-white">
      <div 
        v-if="isFading" 
        class="absolute inset-0 bg-white z-40"
      ></div>
    </Transition>

    <!-- 로딩 컴포넌트 -->
    <NowLoading :is-visible="showVideo" text="Entering..." />

    <div class="text-center z-10">
      <h1 class="text-5xl font-bold text-soft-black mb-12 font-pixel animate-pulse drop-shadow-lg">
        문을 두드려보세요
      </h1>
      
      <div 
        class="door-wrapper relative inline-block transition-all duration-500 hover:scale-105 cursor-fist filter drop-shadow-2xl"
        @dblclick="handleKnock"
      >
        <img 
          :src="UI_IMAGES?.doorFinal || ''" 
          alt="Entrance Door" 
          class="w-[28rem] md:w-[36rem] lg:w-[44rem] rounded-t-[2rem]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-t-[2rem] pointer-events-none"></div>
        
        <!-- 발광 효과 -->
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
  cursor: v-bind(cursorUrl);
}

/* 흰색 페이드 애니메이션 */
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

/* 배경 그라데이션 애니메이션 */
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
