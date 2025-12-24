<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'error', // 'success', 'error', 'info'
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

let timer = null

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div 
    class="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 animate-slide-down min-w-[320px]"
    :class="[
      type === 'error' ? 'bg-white border-2 border-red-100 text-red-600' : 
      type === 'success' ? 'bg-white border-2 border-pastel-green text-green-600' :
      'bg-white border-gray-200 text-gray-800'
    ]"
  >
    <!-- Icon -->
    <div 
      class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      :class="[
        type === 'error' ? 'bg-red-50' : 
        type === 'success' ? 'bg-green-50' : 
        'bg-gray-50'
      ]"
    >
      <span class="text-xl">{{ type === 'error' ? '🚫' : type === 'success' ? '✅' : 'ℹ️' }}</span>
    </div>

    <!-- Message -->
    <div class="flex-1">
      <h4 class="font-black text-sm uppercase tracking-wider opacity-50 mb-0.5">
        {{ type === 'error' ? 'System Alert' : type === 'success' ? 'Success' : 'Notice' }}
      </h4>
      <p class="font-bold text-sm">{{ message }}</p>
    </div>

    <!-- Close Button -->
    <button @click="$emit('close')" class="p-1 hover:bg-gray-100 rounded-full transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-40" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.animate-slide-down {
  animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}
</style>
