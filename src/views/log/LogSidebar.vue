<template>
  <div class="w-full h-full flex flex-row lg:flex-col overflow-hidden lg:rounded-r-3xl rounded-b-3xl lg:rounded-bl-none border-b lg:border-b-0 lg:border-r border-gray-100 shadow-xl bg-white select-none">
    <!-- 세로/가로 등분 탭 -->
    <div 
      v-for="tab in tabs" 
      :key="tab.id"
      @click="emit('update:activeTab', tab.id)"
      class="relative flex-1 group cursor-pointer overflow-hidden transition-all duration-500 ease-out border-r last:border-r-0 lg:border-r-0 lg:border-b lg:last:border-b-0"
      :class="[
        activeTab === tab.id ? 'flex-[1.5]' : 'flex-1 hover:flex-[1.2]'
      ]"
    >
        <!-- 배경 이미지 (어둡게 처리) -->
        <div class="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
            <img :src="tab.image" class="w-full h-full object-cover grayscale transition-all duration-500" :class="activeTab === tab.id ? 'grayscale-0 blur-none' : 'grayscale group-hover:grayscale-0 group-hover:blur-[2px]'" />
            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" :class="activeTab === tab.id ? 'bg-black/10' : ''"></div>
        </div>

        <!-- 텍스트 컨텐츠 (중앙 정렬) -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center z-10 p-2 lg:p-4 transition-all duration-300 transform"
             :class="activeTab === tab.id ? 'scale-100 opacity-100' : 'scale-90 opacity-80 group-hover:scale-100 group-hover:opacity-100'"
        >
            <h2 class="text-base md:text-xl lg:text-2xl xl:text-3xl font-black text-white tracking-widest drop-shadow-lg uppercase font-eng mb-1">{{ tab.name }}</h2>
            <p class="text-[8px] md:text-[10px] lg:text-xs text-white/90 font-light tracking-[0.2em] border-t border-white/50 pt-1 lg:pt-2 px-2 lg:px-3 hidden sm:block">{{ tab.sub }}</p>
        </div>

        <!-- 활성 표시 바 (왼쪽/아래) -->
        <div class="absolute left-0 bottom-0 right-0 h-1 lg:h-auto lg:top-0 lg:bottom-0 lg:w-2 lg:right-auto transition-all duration-300"
             :class="[activeTab === tab.id ? tab.bg : 'bg-transparent']"></div>
             
        <!-- 활성 표시 오버레이 (전체) -->
        <div class="absolute inset-0 border-4 border-transparent transition-all duration-300 pointer-events-none"
             :class="[activeTab === tab.id ? tab.borderColor : '']"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { LOG_IMAGES } from '@/assets/dummy/index.js'

defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:activeTab'])

const tabs = [
  { 
    id: 'diet', 
    name: '식단', 
    sub: 'DIET PLAN',
    image: LOG_IMAGES.toma, 
    bg: 'bg-pastel-red',
    borderColor: 'border-pastel-red'
  },
  { 
    id: 'workout', 
    name: '근력', 
    sub: 'WORKOUT',
    image: LOG_IMAGES.belle,
    bg: 'bg-pastel-blue',
    borderColor: 'border-pastel-blue'
  },
  { 
    id: 'running', 
    name: '유산소', 
    sub: 'CARDIO RUN',
    image: LOG_IMAGES.chie,
    bg: 'bg-pastel-yellow',
    borderColor: 'border-pastel-yellow'
  }
]
</script>

<style scoped>
.font-eng {
    font-family: 'Outfit', sans-serif; /* 영문 폰트 예시 */
}
</style>
