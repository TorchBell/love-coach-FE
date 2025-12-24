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
        
        <!-- 입력 확인 -->
        <div class="mb-6">
            <label class="block text-xs font-bold text-gray-500 mb-2">아래 문구를 똑같이 입력해주세요</label>
            <div class="bg-gray-100 p-3 rounded-xl mb-3 text-xs text-gray-600 font-bold select-all">
                예 모든 내용을 확인하고 탈퇴하는 것에 동의합니다.
            </div>
            <input 
                v-model="confirmationText"
                type="text" 
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none text-sm font-bold"
                placeholder="문구를 입력하세요"
                @paste.prevent
            />
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
            :disabled="!isConfirmed"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel', 'confirm'])

const confirmationText = ref('')
const TARGET_TEXT = "예 모든 내용을 확인하고 탈퇴하는 것에 동의합니다."

const isConfirmed = computed(() => {
    return confirmationText.value === TARGET_TEXT
})

const handleCancel = () => {
  confirmationText.value = '' // Reset
  emit('cancel')
}

const handleConfirm = () => {
  if (isConfirmed.value) {
      emit('confirm')
      confirmationText.value = '' // Reset
  }
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
