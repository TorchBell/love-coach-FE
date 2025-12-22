<script setup>
import { ref } from 'vue'
import { useMotion } from '@vueuse/motion'

const props = defineProps({
  image: String,
  title: String,
  description: String,
})

const cardRef = ref(null)

// 부드러운 호버 효과가 적용된 향상된 모션
const motionInstance = useMotion(cardRef, {
  initial: { scale: 1, y: 0 },
  hovered: { 
    scale: 1.03, 
    y: -6,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20
    }
  },
})
</script>

<template>
  <div 
    ref="cardRef"
    class="photo-card bg-white rounded-2xl p-2 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 border border-gray-100 hover:border-pastel-red/30 group"
    @mouseenter="motionInstance.apply('hovered')"
    @mouseleave="motionInstance.apply('initial')"
    @click="$emit('click')"
  >
    <!-- 이미지 컨테이너 -->
    <div class="relative w-full h-[60%] rounded-xl overflow-hidden bg-cream/30 mb-1">
      <img 
        :src="image" 
        :alt="title" 
        class="w-full h-full object-cover"
      />
      <!-- 호버 시 미묘한 오버레이 -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    <!-- 텍스트 내용 -->
    <div class="text-center px-1 h-[35%] flex flex-col justify-center">
      <h3 class="font-bold text-soft-black text-sm mb-0.5 truncate">
        {{ title }}
      </h3>
      <p class="text-gray-500 text-[10px] truncate">
        {{ description }}
      </p>
    </div>

    <!-- 하단 장식 라인 -->
    <div class="h-[5%] flex items-center justify-center">
      <div class="w-8 h-0.5 bg-gradient-to-r from-pastel-red to-pastel-yellow rounded-full"></div>
    </div>
  </div>
</template>

<style scoped>
.photo-card {
  width: 100%;
  /* flex-1을 사용하여 플렉스 컨테이너의 가용 공간을 자동으로 채움 */
  flex: 1;
  height: auto;
  min-height: 0; /* 필요시 줄어들도록 허용 */
}

.photo-card:active {
  transform: scale(0.98);
}
</style>
