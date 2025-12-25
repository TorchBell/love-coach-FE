<script setup>
import { computed } from 'vue'

// TODO: 실제 프로젝트의 대표 일러스트로 교체 권장
const sectionImages = {
    all: 'https://picsum.photos/400/800?random=10',
    toma: 'https://picsum.photos/400/800?random=20',
    belle: 'https://picsum.photos/400/800?random=30',
    chie: 'https://picsum.photos/400/800?random=40',
}

defineProps({
  activeFilter: {
    type: String,
    activeTab: String // 호환성
  }
})

const emit = defineEmits(['update:filter'])

const filters = [
  { id: 'all', label: 'All', sub: 'Moment', image: sectionImages.all, color: 'text-gray-800' },
  { id: 'toma', label: 'Toma', sub: 'Story', image: sectionImages.toma, color: 'text-pastel-red' },
  { id: 'belle', label: 'Belle', sub: 'Story', image: sectionImages.belle, color: 'text-pastel-blue' },
  { id: 'chie', label: 'Chie', sub: 'Story', image: sectionImages.chie, color: 'text-pastel-yellow' },
]

const selectFilter = (id) => {
  emit('update:filter', id)
}
</script>

<template>
  <div class="h-full flex flex-col p-4 bg-gray-50 border-r border-gray-100 overflow-y-auto custom-scrollbar select-none">
    <!-- Header -->
    <div class="mb-4 px-2">
        <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Collections</h3>
    </div>

    <!-- Album Cards List -->
    <div class="flex flex-col gap-3 pb-4">
        <div 
          v-for="filter in filters" 
          :key="filter.id"
          @click="selectFilter(filter.id)"
          class="group relative w-full aspect-[3/2.2] rounded-xl cursor-pointer transition-all duration-500 perspective-1000"
          :class="activeFilter === filter.id ? 'z-10' : 'hover:z-10'"
        >
            <!-- Card Container -->
            <div class="w-full h-full relative rounded-xl overflow-hidden shadow-sm transition-all duration-500 ease-out transform-gpu"
                 :class="[
                    activeFilter === filter.id 
                        ? 'shadow-xl ring-2 ring-offset-2 ring-gray-200 scale-100' 
                        : 'shadow-md grayscale hover:grayscale-0 hover:scale-105 hover:-rotate-1'
                 ]"
            >
                <!-- Background Image -->
                <img :src="filter.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                <!-- Overlay gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>

                <!-- Text Content -->
                <div class="absolute bottom-0 left-0 w-full p-4 text-white transform transition-transform duration-300"
                     :class="activeFilter === filter.id ? 'translate-y-0' : 'translate-y-1 group-hover:translate-y-0'">
                    <span class="block text-[9px] font-medium tracking-[0.2em] uppercase opacity-70 mb-0.5">{{ filter.sub }}</span>
                    <h2 class="text-2xl font-serif italic font-black tracking-tighter leading-none">{{ filter.label }}</h2>
                    
                    <!-- Selected Indicator Line -->
                    <div class="h-0.5 bg-white mt-2 transition-all duration-500 ease-out"
                         :class="activeFilter === filter.id ? 'w-8 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-50'"></div>
                </div>
            </div>

            <!-- Active Glow (Behind) -->
            <div 
                class="absolute -inset-4 bg-pastel-red/20 blur-2xl rounded-full opacity-0 transition-opacity duration-500"
                :class="{ 'opacity-100': activeFilter === filter.id }"
                v-if="filter.id !== 'all'"
            ></div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.font-serif {
    font-family: 'Playfair Display', serif; /* 만약 폰트가 없다면 fallback serif */
}
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 9999px;
}
.perspective-1000 {
    perspective: 1000px;
}
</style>
