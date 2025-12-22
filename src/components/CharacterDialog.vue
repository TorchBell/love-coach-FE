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
  enableInput: Boolean, // Will be used to show/hide "직접 대화" button instead of input
  showDirectChatButton: Boolean // New prop for showing direct chat button
})

const emit = defineEmits(['select', 'send', 'openChat'])

const inputValue = ref('')

const handleSend = () => {
  if (!inputValue.value.trim()) return
  emit('send', inputValue.value)
  inputValue.value = ''
}

const dialogRef = ref(null)

// 타이핑 효과 로직이 여기에 들어갈 수 있음, 현재는 간단하게 유지
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
    <!-- 선택지 컨테이너 (비주얼 노벨 스타일) - 아이콘 없음 -->
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

    <div class="flex items-end gap-4 w-full justify-end">
      <!-- 텍스트 버블 (향상된 비주얼 노벨 스타일) -->
      <div class="bg-white/95 backdrop-blur-md p-6 pb-8 rounded-3xl shadow-2xl border-4 border-pastel-blue/40 relative mb-4 flex-1 max-w-xl">
        <p class="text-soft-black font-medium leading-relaxed text-xl pr-16">{{ text }}</p>
        <!-- 삼각형 포인터 -->
        <div class="absolute -bottom-3 right-12 w-6 h-6 bg-white border-r-4 border-b-4 border-pastel-blue/40 transform rotate-45"></div>
        
        <!-- 직접 대화 버튼 (말풍선 안 오른쪽 아래) -->
        <button 
          v-if="showDirectChatButton"
          @click="$emit('openChat')"
          class="absolute bottom-2 right-4 text-sm text-pastel-red/80 hover:text-pastel-red font-bold hover:underline transition-colors flex items-center gap-1"
        >
          <span>💬</span>
          <span>직접 대화</span>
        </button>
      </div>

      <!-- 캐릭터 초상화 (크게) -->
      <div class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-pastel-yellow/30 to-pastel-pink/30 shrink-0">
        <img :src="characterImage" alt="Character" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>
