<script setup>
import { computed } from 'vue'

const sectionImages = {
    all: 'src/assets/galleryCollection/all.png',
    toma: 'src/assets/galleryCollection/toma.png',
    belle: 'src/assets/galleryCollection/belle.png',
    chie: 'src/assets/galleryCollection/chie.png',
}

defineProps({
  activeFilter: String
})

const emit = defineEmits(['update:filter'])

const filters = [
  { id: 'all', label: 'All Moments', sub: 'Collection', image: sectionImages.all, color: 'from-gray-900 to-gray-800' },
  { id: 'toma', label: 'Toma Story', sub: 'Food', image: sectionImages.toma, color: 'from-pastel-red to-red-400' },
  { id: 'belle', label: 'Belle Story', sub: 'Muscle', image: sectionImages.belle, color: 'from-pastel-blue to-blue-400' },
  { id: 'chie', label: 'Chie Story', sub: 'Cardio', image: sectionImages.chie, color: 'from-pastel-yellow to-yellow-400' },
]
</script>

<template>
  <div class="w-full h-full mb-4">
    <div class="grid grid-cols-4 gap-4 h-full">
        <button 
            v-for="filter in filters" 
            :key="filter.id"
            @click="emit('update:filter', filter.id)"
            class="group relative w-full h-32 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1"
            :class="activeFilter === filter.id ? 'ring-4 ring-offset-2 ring-gray-200 scale-100 shadow-xl z-10' : 'opacity-80 hover:opacity-100 hover:shadow-lg'"
        >
            <!-- Background Image with dynamic zoom -->
            <img :src="filter.image" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r opacity-90 transition-opacity"
                 :class="[filter.color, activeFilter === filter.id ? 'opacity-90' : 'opacity-70 group-hover:opacity-80']"></div>

            <!-- Content -->
            <div class="relative z-10 w-full h-full flex flex-col justify-center items-center text-white pb-1">
                <span class="text-[8px] md:text-[10px] lg:text-xs font-bold tracking-widest uppercase opacity-70 mb-1">{{ filter.sub }}</span>
                <h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-serif italic font-black leading-tight">{{ filter.label }}</h2>
                
                <!-- Active Indicator -->
                <div class="mt-2 h-0.5 bg-white transition-all duration-500"
                     :class="activeFilter === filter.id ? 'w-12' : 'w-0 group-hover:w-8'"></div>
            </div>
            
            <!-- Check Icon if active -->
            <div v-if="activeFilter === filter.id" class="absolute top-2 right-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
        </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 9999px;
}
.font-serif {
    font-family: 'Playfair Display', serif;
}
</style>
