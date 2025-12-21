<template>
  <Teleport to="body">
    <div 
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- 배경 (Backdrop) -->
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="handleCancel"
      ></div>
      
      <!-- 모달 내용 -->
      <div class="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full z-10 animate-modal-in">
        <!-- 우는 캐릭터 이미지 -->
        <div class="flex justify-center mb-6">
          <div class="w-40 h-40 rounded-full overflow-hidden bg-cream border-4 border-pastel-red/30 shadow-lg">
            <img 
              :src="CHAR_IMAGES.tomahi" 
              alt="Sad Toma"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <!-- 경고 제목 -->
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-3">
          정말로 떠나시는 건가요?
        </h2>
        
        <!-- 경고 메시지 -->
        <div class="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p class="text-sm text-red-700 text-center font-medium leading-relaxed">
            회원탈퇴 시 <strong>모든 기록</strong>이 삭제되며,<br />
            토마, 벨, 치이와의 추억도 함께 사라집니다.<br class="mb-1" />
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        
        <!-- 버튼 -->
        <div class="flex gap-3">
          <button 
            @click="handleCancel"
            class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            취소
          </button>
          <button 
            @click="handleConfirm"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { CHAR_IMAGES } from '@/assets/dummy/index.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel', 'confirm'])

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
@keyframes modal-in {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-modal-in {
  animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
