<script setup>
import { defineProps, onMounted, ref, defineEmits } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import trophyIcon from '@/assets/icons/tomaAchievement.png' 

const props = defineProps({
  id: { type: Number, required: true }, // ID required for close action
  title: { type: String, required: true },
  message: { type: String, default: '' },
  image: { type: String, default: null }, // Actual image URL/path
  type: { type: String, default: 'achievement' }, 
  icon: { type: String, default: null }, 
})

const notificationStore = useNotificationStore()
const visible = ref(false)

onMounted(() => {
  // 등장 애니메이션
  setTimeout(() => {
    visible.value = true
  }, 100)
  
  // notificationStore에서 자동 제거함 (10초)
})

const handleClose = () => {
    visible.value = false
    setTimeout(() => {
        notificationStore.removeNotification(props.id)
    }, 500) // Wait for exit animation
}
</script>

<template>
  <div 
    class="transition-all duration-500 transform w-[360px] pointer-events-auto"
    :class="[
      visible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
    ]"
  >
    <div class="bg-white/90 backdrop-blur-md rounded-[20px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white flex items-center gap-4 relative overflow-hidden group">
      
      <!-- Color Accent Bar -->
      <div class="absolute left-0 top-0 bottom-0 w-2" 
           :class="type === 'achievement' ? 'bg-pastel-red' : 'bg-pastel-blue'">
      </div>

      <!-- Image Area (Circular or Rounded Square) -->
      <div class="relative w-14 h-14 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center">
         <img :src="image || icon || trophyIcon" class="w-full h-full object-cover" />
      </div>

      <!-- Text Content -->
      <div class="flex-1 min-w-0 pr-6">
        <div class="flex items-center gap-2 mb-0.5">
             <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  :class="type === 'achievement' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'">
                 {{ type === 'achievement' ? 'Achievement' : 'Gallery' }}
             </span>
        </div>
        <p class="font-bold text-gray-800 text-sm leading-tight mb-1 truncate">{{ title }}</p>
        <p class="text-xs text-gray-500 font-medium truncate">{{ message }}</p>
      </div>

      <!-- Close Button -->
      <button 
        @click="handleClose"
        class="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors p-1 rounded-full hover:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Shine Effect (Subtle) -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shine {
    100% {
        transform: translateX(100%);
    }
}
.group-hover\:animate-shine:hover {
    animation: shine 1.5s;
}
</style>
