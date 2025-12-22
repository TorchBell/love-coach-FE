<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    default: ''
  },
  itemName: {
    type: String,
    default: ''
  },
  itemType: {
    type: String,
    default: 'diet' // 'diet', 'workout', 'running'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const typeLabels = {
  diet: '식단',
  workout: '근력 운동',
  running: '유산소 운동'
}

const typeColors = {
  diet: 'pastel-red',
  workout: 'pastel-yellow',
  running: 'pastel-blue'
}

const typeLabel = computed(() => typeLabels[props.itemType] || '기록')
const typeColor = computed(() => typeColors[props.itemType] || 'pastel-red')
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="$emit('cancel')"
      >
        <!-- 배경 (Backdrop) -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <!-- 모달 내용 -->
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          <!-- 아이콘이 있는 헤더 -->
          <div class="text-center mb-6">
            <div 
              class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl"
              :class="`bg-${typeColor}/20`"
            >
              <span v-if="itemType === 'diet'">🍽️</span>
              <span v-else-if="itemType === 'workout'">💪</span>
              <span v-else>👟</span>
            </div>
            <h3 class="text-2xl font-bold text-soft-black mb-2">삭제 확인</h3>
          </div>
          
          <!-- 내용 -->
          <div class="bg-gray-50 rounded-2xl p-5 mb-6 text-center">
            <p class="text-gray-500 text-sm mb-2">정말 다음 {{ typeLabel }}을 삭제하시겠습니까?</p>
            <p class="text-lg font-bold text-soft-black mb-1">{{ date }}</p>
            <p 
              class="text-xl font-bold"
              :class="`text-${typeColor}`"
            >
              {{ itemName }}
            </p>
          </div>
          
          <!-- 경고 -->
          <div class="bg-red-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span class="text-2xl">⚠️</span>
            <p class="text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</p>
          </div>
          
          <!-- 버튼 -->
          <div class="flex gap-3">
            <button 
              @click="$emit('cancel')"
              class="flex-1 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button 
              @click="$emit('confirm')"
              class="flex-1 py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-500/30"
            >
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
}

.modal-enter-to .relative,
.modal-leave-from .relative {
  transform: scale(1) translateY(0);
}
</style>
