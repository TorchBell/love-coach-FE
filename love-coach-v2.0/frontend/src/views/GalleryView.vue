<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { CHAR_IMAGES, UI_IMAGES } from '@/assets/dummy/index.js'
import { useAuthStore } from '@/stores/authStore'
import { useGalleryStore } from '@/stores/galleryStore'

const authStore = useAuthStore()
const galleryStore = useGalleryStore()

// --- Gallery Images from Store ---
onMounted(() => {
  galleryStore.fetchGalleries()
})

const galleryImages = computed(() => {
    // Transform backend data to match frontend structure if necessary
    // Assuming backend returns similar structure or mapping is needed
    // For now, mapping known fields. If backend is different, adjustment needed.
    return galleryStore.galleries.map(item => ({
        id: item.galleryId || item.id,
        title: item.title,
        image: item.imagePath ? (CHAR_IMAGES[item.imagePath] || item.imagePath) : CHAR_IMAGES.toma, // Fallback logic
        gif: item.gifPath ? (CHAR_IMAGES[item.gifPath] || item.gifPath) : null,
        sidecut: item.sidecutPath ? (CHAR_IMAGES[item.sidecutPath] || item.sidecutPath) : null,
        character: item.characterType?.toLowerCase() || 'toma', // e.g., 'TOMA' -> 'toma'
        unlocked: item.isUnlocked,
        unlockCost: item.unlockCost || 10
    }))
})

// --- View Mode Toggle (Single Button) ---
const viewMode = ref('carousel') // 'carousel' or 'list'
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'carousel' ? 'list' : 'carousel'
}
const toggleButtonText = computed(() => viewMode.value === 'carousel' ? '📋 목록' : '📷 기본')

// --- Filter State ---
const activeFilter = ref('all')
const filterButtons = [
  { id: 'all', label: '전체', icon: '🎨' },
  { id: 'toma', label: '토마', icon: '🍅' },
  { id: 'belle', label: '벨', icon: '💪' },
  { id: 'chie', label: '치이', icon: '🏃' },
]

const filteredImages = computed(() => {
  if (activeFilter.value === 'all') return galleryImages.value
  return galleryImages.value.filter(img => img.character === activeFilter.value)
})

// --- Carousel State ---
const currentIndex = ref(0)
const selectedImage = ref(null)
const showSelectedImage = ref(false)
const isAnimatingOut = ref(false) // For exit animation
const isAnimatingIn = ref(false) // For enter animation
const showFlippedSidecut = ref(false)
let autoDisplayTimer = null

// --- Modal State (for List View) ---
const showModal = ref(false)
const modalImage = ref(null)
const showModalFlipped = ref(false)

// Reset index when filter changes
watch(activeFilter, () => {
  currentIndex.value = 0
  // Don't close immediately, let the timer handle update
  if (viewMode.value === 'carousel') {
    startAutoDisplayTimer()
  }
})

watch(viewMode, (newMode) => {
  if (newMode === 'carousel') {
    startAutoDisplayTimer()
  } else {
    clearAutoDisplayTimer()
  }
})

// --- Auto Display Timer (2 seconds) ---
const startAutoDisplayTimer = () => {
  clearAutoDisplayTimer()
  if (filteredImages.value.length === 0) return
  
  autoDisplayTimer = setTimeout(() => {
    if (filteredImages.value.length > 0) {
      triggerImageTransition()
    }
  }, 2000)
}

const clearAutoDisplayTimer = () => {
  if (autoDisplayTimer) {
    clearTimeout(autoDisplayTimer)
    autoDisplayTimer = null
  }
}

// HIGH QUALITY TRANSITION: Animate out old image, then animate in new image
const triggerImageTransition = () => {
  if (filteredImages.value.length === 0) return
  
  // Safety check for index
  if (currentIndex.value >= filteredImages.value.length) {
      currentIndex.value = 0
  }
  
  const newImage = filteredImages.value[currentIndex.value]
  if (!newImage) return // Extra safety

  // If there's already an image displayed
  if (showSelectedImage.value && selectedImage.value) {
    // If it's the same image, no need to animate
    if (selectedImage.value.id === newImage.id) return
    
    // Start exit animation
    isAnimatingOut.value = true
    
    // After exit animation, switch to new image with enter animation
    setTimeout(() => {
      selectedImage.value = newImage
      showFlippedSidecut.value = false
      isAnimatingOut.value = false
      isAnimatingIn.value = true
      
      setTimeout(() => {
        isAnimatingIn.value = false
      }, 600)
    }, 400) // Exit animation duration
  } else {
    // First time showing - just animate in
    selectedImage.value = newImage
    showSelectedImage.value = true
    showFlippedSidecut.value = false
    isAnimatingIn.value = true
    
    setTimeout(() => {
      isAnimatingIn.value = false
    }, 600)
  }
}

// Start timer when component is ready
watch(filteredImages, (images) => {
  if (viewMode.value === 'carousel' && images.length > 0) {
    startAutoDisplayTimer()
  }
}, { immediate: true })

onUnmounted(() => {
  clearAutoDisplayTimer()
})

// --- Carousel Navigation (Click Zones) ---
// V13: DON'T close bottom image when rotating! Keep it visible.
const handleClickZone = (zone) => {
  if (filteredImages.value.length <= 1) return
  
  // Rotate carousel
  if (zone === 'left') {
    currentIndex.value = (currentIndex.value - 1 + filteredImages.value.length) % filteredImages.value.length
  } else {
    currentIndex.value = (currentIndex.value + 1) % filteredImages.value.length
  }
  
  // Restart timer - after 2 seconds, the new center image will replace bottom display
  startAutoDisplayTimer()
}

// --- List View: Open Modal ---
const openModalFromList = (image) => {
  modalImage.value = image
  showModalFlipped.value = false
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  modalImage.value = null
  showModalFlipped.value = false
}

const toggleModalSidecut = () => {
  if (modalImage.value?.unlocked) {
    showModalFlipped.value = !showModalFlipped.value
  }
}

const handleModalUnlock = async (image) => {
  const userTokens = authStore.user?.credit || 0
  
  if (userTokens < image.unlockCost) {
    alert('토큰이 부족합니다!')
    return
  }
  
  if (!confirm(`${image.unlockCost} 토큰을 사용하여 사이드컷을 해금하시겠습니까?`)) {
    return
  }
  
  const result = await galleryStore.unlockGallery(image.id)
  if (result && result.success) {
      alert('🎉 사이드컷이 해금되었습니다!')
      await authStore.fetchUserProfile() // Update tokens
  } else {
      alert('해금에 실패했습니다.')
  }
}

// --- Close Selected Image ---
const closeSelectedImage = () => {
  isAnimatingOut.value = true
  setTimeout(() => {
    showSelectedImage.value = false
    selectedImage.value = null
    isAnimatingOut.value = false
    isAnimatingIn.value = false
    showFlippedSidecut.value = false
  }, 400)
}

// --- Sidecut Unlock System ---
const handleUnlock = async (image) => {
  const userTokens = authStore.user?.credit || 0
  
  if (userTokens < image.unlockCost) {
    alert('토큰이 부족합니다!')
    return
  }
  
  if (!confirm(`${image.unlockCost} 토큰을 사용하여 사이드컷을 해금하시겠습니까?`)) {
    return
  }
  
  const result = await galleryStore.unlockGallery(image.id)
  if (result && result.success) {
    alert('🎉 사이드컷이 해금되었습니다!')
    await authStore.fetchUserProfile() // Update tokens
  } else {
    alert('해금에 실패했습니다.')
  }
}

// --- Flip to Sidecut ---
const toggleSidecut = () => {
  if (selectedImage.value?.unlocked) {
    showFlippedSidecut.value = !showFlippedSidecut.value
  }
}

// --- Carousel Item Positioning ---
const getCarouselItemStyle = (index) => {
  const total = filteredImages.value.length
  if (total === 0) return { opacity: 0 }
  
  let diff = index - currentIndex.value
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  
  const spacing = 160
  const translateX = diff * spacing
  const absDistance = Math.abs(diff)
  const scale = absDistance === 0 ? 1.15 : Math.max(0.65, 1 - absDistance * 0.12)
  const opacity = absDistance === 0 ? 1 : Math.max(0.4, 1 - absDistance * 0.2)
  const zIndex = 50 - absDistance * 10
  const blur = absDistance === 0 ? 0 : Math.min(absDistance * 1.5, 4)
  
  return {
    transform: `translateX(${translateX}px) scale(${scale})`,
    opacity,
    zIndex,
    filter: `blur(${blur}px)`,
  }
}

const isCenter = (index) => index === currentIndex.value
</script>

<template>
  <MainLayout>
    <!-- Page Header with Toggle Button -->
    <div class="flex justify-between items-start mb-6 px-4 max-w-6xl mx-auto">
      <div class="text-left animate-fade-in-up">
        <h1 class="text-4xl font-bold text-soft-black mb-2">갤러리</h1>
        <p class="text-gray-500">나의 추억들을 한 눈에 확인하세요!</p>
      </div>
      
      <!-- Single View Toggle Button (Top Right) -->
      <button 
        @click="toggleViewMode"
        class="px-5 py-2.5 rounded-full font-bold transition-all duration-300 flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 hover:border-pastel-red hover:text-pastel-red shadow-sm hover:shadow-md"
      >
        {{ toggleButtonText }}
      </button>
    </div>

    <div class="w-full px-4 max-w-6xl mx-auto">
      
      <!-- Character Filter Buttons -->
      <div class="flex justify-center gap-2 mb-8">
        <button 
          v-for="btn in filterButtons" 
          :key="btn.id"
          @click="activeFilter = btn.id"
          class="px-4 py-2 rounded-full font-bold transition-all duration-300 flex items-center gap-1.5 text-sm"
          :class="activeFilter === btn.id 
            ? 'bg-gray-800 text-white shadow-md' 
            : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'"
        >
          <span>{{ btn.icon }}</span>
          <span>{{ btn.label }}</span>
        </button>
      </div>
      
      <!-- ==================== CAROUSEL VIEW ==================== -->
      <div v-if="viewMode === 'carousel'" class="relative">
        
        <!-- Carousel Container -->
        <div class="relative h-[320px] mb-8 overflow-visible">
          
          <!-- Empty State -->
          <div v-if="filteredImages.length === 0" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-gray-400">
              <div class="text-6xl mb-4">📭</div>
              <p class="font-medium">해당 캐릭터의 이미지가 없습니다</p>
            </div>
          </div>
          
          <!-- Click Zones (Left/Right) -->
          <div v-if="filteredImages.length > 1" class="absolute inset-0 flex z-40">
            <div 
              @click="handleClickZone('left')"
              class="flex-1 cursor-pointer group"
            >
              <div class="h-full flex items-center justify-start pl-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center text-2xl text-gray-600 group-hover:scale-110 group-active:scale-95 transition-transform border border-gray-100">
                  ←
                </div>
              </div>
            </div>
            <div class="w-1/3"></div>
            <div 
              @click="handleClickZone('right')"
              class="flex-1 cursor-pointer group"
            >
              <div class="h-full flex items-center justify-end pr-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center text-2xl text-gray-600 group-hover:scale-110 group-active:scale-95 transition-transform border border-gray-100">
                  →
                </div>
              </div>
            </div>
          </div>
          
          <!-- Carousel Track -->
          <div v-if="filteredImages.length > 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              v-for="(item, index) in filteredImages" 
              :key="item.id"
              class="absolute transition-all duration-500 ease-out"
              :style="getCarouselItemStyle(index)"
            >
              <div 
                class="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 relative"
                :class="isCenter(index) ? 'border-pastel-red ring-4 ring-pastel-red/20' : 'border-white/80'"
              >
                <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
                
                <!-- Lock Indicator -->
                <div v-if="!item.unlocked" class="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-xs">
                  🔒
                </div>
              </div>
              
              <!-- Title (Center Only) -->
              <div 
                v-if="isCenter(index)"
                class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <p class="text-sm font-bold text-gray-700 bg-white/90 px-4 py-1.5 rounded-full shadow-md">
                  {{ item.title }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Dot Indicators -->
          <div v-if="filteredImages.length > 1" class="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            <button 
              v-for="(_, index) in filteredImages" 
              :key="'dot-' + index"
              @click="currentIndex = index; startAutoDisplayTimer()"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="isCenter(index) ? 'bg-pastel-red w-5' : 'bg-gray-300 hover:bg-gray-400'"
            ></button>
          </div>
        </div>
      </div>
      
      <!-- ==================== LIST VIEW ==================== -->
      <div v-else class="mb-8">
        
        <!-- Empty State -->
        <div v-if="filteredImages.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-gray-400 font-medium">해당 캐릭터의 이미지가 없습니다</p>
        </div>
        
        <!-- Image Grid -->
        <div v-else class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div 
            v-for="item in filteredImages" 
            :key="item.id"
            @click="openModalFromList(item)"
            class="relative aspect-square rounded-xl overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-pastel-red/50"
          >
            <!-- Static Image -->
            <img 
              :src="item.image" 
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            />
            
            <!-- GIF on Hover -->
            <img 
              :src="item.gif || item.image" 
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-2 left-2 right-2">
                <p class="text-white text-xs font-bold truncate">{{ item.title }}</p>
              </div>
            </div>
            
            <!-- Lock/Unlock Indicators -->
            <div v-if="!item.unlocked" class="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-sm shadow-md">
              🔒
            </div>
            <div v-else class="absolute top-2 right-2 w-7 h-7 bg-pastel-green/90 rounded-full flex items-center justify-center text-sm shadow-md">
              ✓
            </div>
          </div>
        </div>
      </div>
      
      <!-- ==================== SELECTED IMAGE DISPLAY (Bottom - Carousel Only) ==================== -->
      <div 
        v-if="viewMode === 'carousel' && showSelectedImage && selectedImage"
        class="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 mb-8 transition-all duration-300"
        :class="{
          'animate-fall-out': isAnimatingOut,
          'animate-fall-in': isAnimatingIn
        }"
      >
        <!-- Close Button -->
        <button 
          @click="closeSelectedImage"
          class="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all z-10"
        >
          ✕
        </button>
        
        <!-- Flip Card Container -->
        <div 
          class="relative max-w-xl mx-auto perspective-1000"
          :class="{ 'cursor-pointer': selectedImage.unlocked }"
          @click="toggleSidecut"
        >
          <div 
            class="flip-card-inner transition-transform duration-700 preserve-3d"
            :class="{ 'rotate-y-180': showFlippedSidecut }"
          >
            <!-- Front: Main Image -->
            <div class="backface-hidden">
              <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <img 
                  :src="selectedImage.image" 
                  :alt="selectedImage.title"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <!-- Back: Sidecut Image -->
            <div class="absolute inset-0 backface-hidden rotate-y-180">
              <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <img 
                  :src="selectedImage.sidecut || selectedImage.image" 
                  :alt="selectedImage.title + ' Sidecut'"
                  class="w-full h-full object-cover"
                />
                <div class="absolute top-4 left-4 bg-pastel-red text-white px-3 py-1 rounded-full text-sm font-bold">
                  ✨ 사이드컷
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Image Info & Actions -->
        <div class="mt-6 text-center">
          <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedImage.title }}</h3>
          
          <!-- Unlock Button (Not Unlocked) -->
          <div v-if="!selectedImage.unlocked" class="mt-4">
            <button 
              @click.stop="handleUnlock(selectedImage)"
              class="px-6 py-3 bg-gradient-to-r from-pastel-yellow to-pastel-red text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <span class="text-xl">🔓</span>
              <span>{{ selectedImage.unlockCost }} 토큰으로 사이드컷 해금</span>
            </button>
          </div>
          
          <!-- Sidecut Available (Unlocked) -->
          <div v-else class="mt-4">
            <p class="text-gray-500 text-sm mb-2">
              {{ showFlippedSidecut ? '👆 클릭하여 원본으로 돌아가기' : '👆 클릭하여 사이드컷 확인' }}
            </p>
            <div class="inline-flex items-center gap-2 text-pastel-green font-bold text-sm bg-pastel-green/10 px-4 py-2 rounded-full">
              <span>✓</span>
              <span>해금됨</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- ==================== MODAL (List View Only) ==================== -->
    <Teleport to="body">
      <div 
        v-if="showModal && modalImage"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="closeModal"
        ></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modal-in z-10">
          <!-- Close Button -->
          <button 
            @click="closeModal"
            class="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all z-10"
          >
            ✕
          </button>
          
          <!-- Flip Card Container -->
          <div 
            class="relative perspective-1000"
            :class="{ 'cursor-pointer': modalImage.unlocked }"
            @click="toggleModalSidecut"
          >
            <div 
              class="flip-card-inner transition-transform duration-700 preserve-3d"
              :class="{ 'rotate-y-180': showModalFlipped }"
            >
              <!-- Front: Main Image -->
              <div class="backface-hidden">
                <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    :src="modalImage.image" 
                    :alt="modalImage.title"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <!-- Back: Sidecut Image -->
              <div class="absolute inset-0 backface-hidden rotate-y-180">
                <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    :src="modalImage.sidecut || modalImage.image" 
                    :alt="modalImage.title + ' Sidecut'"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute top-4 left-4 bg-pastel-red text-white px-3 py-1 rounded-full text-sm font-bold">
                    ✨ 사이드컷
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Image Info & Actions -->
          <div class="mt-6 text-center">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ modalImage.title }}</h3>
            
            <!-- Unlock Button (Not Unlocked) -->
            <div v-if="!modalImage.unlocked" class="mt-4">
              <button 
                @click.stop="handleModalUnlock(modalImage)"
                class="px-6 py-3 bg-gradient-to-r from-pastel-yellow to-pastel-red text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <span class="text-xl">🔓</span>
                <span>{{ modalImage.unlockCost }} 토큰으로 사이드컷 해금</span>
              </button>
            </div>
            
            <!-- Sidecut Available (Unlocked) -->
            <div v-else class="mt-4">
              <p class="text-gray-500 text-sm mb-2">
                {{ showModalFlipped ? '👆 클릭하여 원본으로 돌아가기' : '👆 클릭하여 사이드컷 확인' }}
              </p>
              <div class="inline-flex items-center gap-2 text-pastel-green font-bold text-sm bg-pastel-green/10 px-4 py-2 rounded-full">
                <span>✓</span>
                <span>해금됨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
  </MainLayout>
</template>

<style scoped>
/* Perspective for 3D effects */
.perspective-1000 {
  perspective: 1000px;
}

.preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.flip-card-inner {
  transform-style: preserve-3d;
}

/* HIGH QUALITY FALL IN ANIMATION - Image drops from above and bounces slightly */
@keyframes fall-in {
  0% {
    opacity: 0;
    transform: translateY(-100px) scale(0.8) rotateX(15deg);
  }
  50% {
    opacity: 1;
    transform: translateY(15px) scale(1.02);
  }
  70% {
    transform: translateY(-5px) scale(0.99);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

.animate-fall-in {
  animation: fall-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* HIGH QUALITY FALL OUT ANIMATION - Image falls down and fades */
@keyframes fall-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(80px) scale(0.85) rotateX(-10deg);
  }
}

.animate-fall-out {
  animation: fall-out 0.4s ease-in forwards;
}
</style>
