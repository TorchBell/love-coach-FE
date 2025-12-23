<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { CHAR_IMAGES, UI_IMAGES } from '@/assets/dummy/index.js'
import { useAuthStore } from '@/stores/authStore'
import { useGalleryStore } from '@/stores/galleryStore'

const authStore = useAuthStore()
const galleryStore = useGalleryStore()

// --- 스토어에서 갤러리 이미지 ---
onMounted(() => {
  galleryStore.fetchGalleries()
})

const galleryImages = computed(() => {
    // 필요시 백엔드 데이터를 프론트엔드 구조에 맞게 변환
    // 현재는 알려진 필드 매핑. 백엔드가 다르면 조정 필요.
    return galleryStore.galleries.map(item => ({
        id: item.galleryId || item.id,
        title: item.title,
        image: item.imagePath ? (CHAR_IMAGES[item.imagePath] || item.imagePath) : CHAR_IMAGES.toma, // 대체 로직
        gif: item.gifPath ? (CHAR_IMAGES[item.gifPath] || item.gifPath) : null,
        sidecut: item.sidecutPath ? (CHAR_IMAGES[item.sidecutPath] || item.sidecutPath) : null,
        character: item.characterType?.toLowerCase() || 'toma', // 예: 'TOMA' -> 'toma'
        unlocked: item.isUnlocked,
        unlockCost: item.unlockCost || 10
    }))
})

// --- 보기 모드 토글 (단일 버튼) ---
const viewMode = ref('carousel') // 'carousel' or 'list'
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'carousel' ? 'list' : 'carousel'
}
const toggleButtonText = computed(() => viewMode.value === 'carousel' ? '📋 목록' : '📷 기본')

// --- 필터 상태 ---
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

// --- 캐러셀 상태 ---
const currentIndex = ref(0)
const selectedImage = ref(null)
const showSelectedImage = ref(false)
const isAnimatingOut = ref(false) // 퇴장 애니메이션용
const isAnimatingIn = ref(false) // 입장 애니메이션용
const showFlippedSidecut = ref(false)
let autoDisplayTimer = null

// --- 모달 상태 (리스트 뷰용) ---
const showModal = ref(false)
const modalImage = ref(null)
const showModalFlipped = ref(false)

// 필터 변경 시 인덱스 초기화
watch(activeFilter, () => {
  currentIndex.value = 0
  // 즉시 닫지 않고 타이머가 업데이트하게 둠
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

// --- 자동 표시 타이머 (2초) ---
const startAutoDisplayTimer = () => {
  clearAutoDisplayTimer()
  if (filteredImages.value.length === 0) return
  
  autoDisplayTimer = setTimeout(() => {
    if (filteredImages.value.length > 0) {
      triggerImageTransition()
    }
  }, 800)
}

const clearAutoDisplayTimer = () => {
  if (autoDisplayTimer) {
    clearTimeout(autoDisplayTimer)
    autoDisplayTimer = null
  }
}

// 고품질 전환: 이전 이미지 퇴장 후 새 이미지 입장 애니메이션
const triggerImageTransition = () => {
  if (filteredImages.value.length === 0) return
  
  // 인덱스 안전성 확인
  if (currentIndex.value >= filteredImages.value.length) {
      currentIndex.value = 0
  }
  
  const newImage = filteredImages.value[currentIndex.value]
  if (!newImage) return // 추가 안전장치

  // 이미 이미지가 표시된 경우
  if (showSelectedImage.value && selectedImage.value) {
    // 같은 이미지라면 애니메이션 불필요
    if (selectedImage.value.id === newImage.id) return
    
    // 퇴장 애니메이션 시작
    isAnimatingOut.value = true
    
    // 퇴장 애니메이션 후, 입장 애니메이션과 함께 새 이미지로 전환
    setTimeout(() => {
      selectedImage.value = newImage
      showFlippedSidecut.value = false
      isAnimatingOut.value = false
      isAnimatingIn.value = true
      
      setTimeout(() => {
        isAnimatingIn.value = false
      }, 600)
    }, 400) // 퇴장 애니메이션 지속 시간
  } else {
    // 처음 표시 - 입장 애니메이션만
    selectedImage.value = newImage
    showSelectedImage.value = true
    showFlippedSidecut.value = false
    isAnimatingIn.value = true
    
    setTimeout(() => {
      isAnimatingIn.value = false
    }, 600)
  }
}

// 컴포넌트 준비 완료 시 타이머 시작
watch(filteredImages, (images) => {
  if (viewMode.value === 'carousel' && images.length > 0) {
    startAutoDisplayTimer()
  }
}, { immediate: true })

onUnmounted(() => {
  clearAutoDisplayTimer()
})

// --- 캐러셀 네비게이션 (클릭 존) ---
// V13: 회전 시 하단 이미지를 닫지 않음! 계속 표시.
const handleClickZone = (zone) => {
  if (filteredImages.value.length <= 1) return
  
  // 캐러셀 회전
  if (zone === 'left') {
    currentIndex.value = (currentIndex.value - 1 + filteredImages.value.length) % filteredImages.value.length
  } else {
    currentIndex.value = (currentIndex.value + 1) % filteredImages.value.length
  }
  
  // 타이머 재시작 - 0.8초 후 새로운 중앙 이미지가 하단 디스플레이 대체
  startAutoDisplayTimer()
}

// --- 리스트 뷰: 모달 열기 ---
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
      await authStore.fetchUserProfile() // 토큰 업데이트
  } else {
      alert('해금에 실패했습니다.')
  }
}

// --- 선택된 이미지 닫기 ---
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

// --- 사이드컷 해금 시스템 ---
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

// --- 사이드컷으로 뒤집기 ---
const toggleSidecut = () => {
  if (selectedImage.value?.unlocked) {
    showFlippedSidecut.value = !showFlippedSidecut.value
  }
}

// --- 캐러셀 아이템 배치 ---
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
    <!-- 토글 버튼이 포함된 페이지 헤더 -->
    <div class="flex justify-between items-start mb-6 px-4 max-w-6xl mx-auto">
      <div class="text-left animate-fade-in-up">
        <h1 class="text-4xl font-bold text-soft-black mb-2">갤러리</h1>
        <p class="text-gray-500">나의 추억들을 한 눈에 확인하세요!</p>
      </div>
      
      <!-- 싱글 뷰 토글 버튼 (우측 상단) -->
      <button 
        @click="toggleViewMode"
        class="px-5 py-2.5 rounded-full font-bold transition-all duration-300 flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 hover:border-pastel-red hover:text-pastel-red shadow-sm hover:shadow-md"
      >
        {{ toggleButtonText }}
      </button>
    </div>

    <div class="w-full px-4 max-w-6xl mx-auto">
      
      <!-- 캐릭터 필터 버튼 -->
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
      
      <!-- ==================== 캐러셀 뷰 ==================== -->
      <div v-if="viewMode === 'carousel'" class="relative">
        
        <!-- 캐러셀 컨테이너 -->
        <div class="relative h-[320px] mb-8 overflow-visible">
          
          <!-- 빈 상태 -->
          <div v-if="filteredImages.length === 0" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-gray-400">
              <div class="text-6xl mb-4">📭</div>
              <p class="font-medium">해당 캐릭터의 이미지가 없습니다</p>
            </div>
          </div>
          
          <!-- 클릭 존 (좌/우) -->
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
          
          <!-- 캐러셀 트랙 -->
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
                
                <!-- 잠금 표시 -->
                <div v-if="!item.unlocked" class="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-xs">
                  🔒
                </div>
              </div>
              
              <!-- 제목 (중앙만) -->
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
          
          <!-- 도트 인디케이터 -->
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
      
      <!-- ==================== 리스트 뷰 ==================== -->
      <div v-else class="mb-8">
        
        <!-- 빈 상태 (Empty State) -->
        <div v-if="filteredImages.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-gray-400 font-medium">해당 캐릭터의 이미지가 없습니다</p>
        </div>
        
        <!-- 이미지 그리드 -->
        <div v-else class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div 
            v-for="item in filteredImages" 
            :key="item.id"
            @click="openModalFromList(item)"
            class="relative aspect-square rounded-xl overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-pastel-red/50"
          >
            <!-- 정적 이미지 -->
            <img 
              :src="item.image" 
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            />
            
            <!-- 호버 시 GIF -->
            <img 
              :src="item.gif || item.image" 
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            
            <!-- 오버레이 -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-2 left-2 right-2">
                <p class="text-white text-xs font-bold truncate">{{ item.title }}</p>
              </div>
            </div>
            
            <!-- 잠금/해제 표시 -->
            <div v-if="!item.unlocked" class="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-sm shadow-md">
              🔒
            </div>
            <div v-else class="absolute top-2 right-2 w-7 h-7 bg-pastel-green/90 rounded-full flex items-center justify-center text-sm shadow-md">
              ✓
            </div>
          </div>
        </div>
      </div>
      
      <!-- ==================== 선택된 이미지 표시 (하단 - 캐러셀 전용) ==================== -->
      <div 
        v-if="viewMode === 'carousel' && showSelectedImage && selectedImage"
        class="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 mb-8 transition-all duration-300"
        :class="{
          'animate-fall-out': isAnimatingOut,
          'animate-fall-in': isAnimatingIn
        }"
      >
        <!-- 닫기 버튼 -->
        <button 
          @click="closeSelectedImage"
          class="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all z-10"
        >
          ✕
        </button>
        
        <!-- 플립 카드 컨테이너 -->
        <div 
          class="relative max-w-xl mx-auto perspective-1000"
          :class="{ 'cursor-pointer': selectedImage.unlocked }"
          @click="toggleSidecut"
        >
          <div 
            class="flip-card-inner transition-transform duration-700 preserve-3d"
            :class="{ 'rotate-y-180': showFlippedSidecut }"
          >
            <!-- 앞면: 메인 이미지 -->
            <div class="backface-hidden">
              <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <img 
                  :src="selectedImage.image" 
                  :alt="selectedImage.title"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <!-- 뒷면: 사이드컷 이미지 -->
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
        
        <!-- 이미지 정보 및 액션 -->
        <div class="mt-6 text-center">
          <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedImage.title }}</h3>
          
          <!-- 해금 버튼 (잠김 상태) -->
          <div v-if="!selectedImage.unlocked" class="mt-4">
            <button 
              @click.stop="handleUnlock(selectedImage)"
              class="px-6 py-3 bg-gradient-to-r from-pastel-yellow to-pastel-red text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <span class="text-xl">🔓</span>
              <span>{{ selectedImage.unlockCost }} 토큰으로 사이드컷 해금</span>
            </button>
          </div>
          
          <!-- 사이드컷 이용 가능 (해금됨) -->
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
    
    <!-- ==================== 모달 (리스트 뷰 전용) ==================== -->
    <Teleport to="body">
      <div 
        v-if="showModal && modalImage"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- 배경 (Backdrop) -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="closeModal"
        ></div>
        
        <!-- 모달 내용 -->
        <div class="relative bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modal-in z-10">
          <!-- 닫기 버튼 -->
          <button 
            @click="closeModal"
            class="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all z-10"
          >
            ✕
          </button>
          
          <!-- 플립 카드 컨테이너 -->
          <div 
            class="relative perspective-1000"
            :class="{ 'cursor-pointer': modalImage.unlocked }"
            @click="toggleModalSidecut"
          >
            <div 
              class="flip-card-inner transition-transform duration-700 preserve-3d"
              :class="{ 'rotate-y-180': showModalFlipped }"
            >
              <!-- 앞면: 메인 이미지 -->
              <div class="backface-hidden">
                <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    :src="modalImage.image" 
                    :alt="modalImage.title"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <!-- 뒷면: 사이드컷 이미지 -->
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
          
          <!-- 이미지 정보 및 액션 -->
          <div class="mt-6 text-center">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ modalImage.title }}</h3>
            
            <!-- 해금 버튼 (잠김 상태) -->
            <div v-if="!modalImage.unlocked" class="mt-4">
              <button 
                @click.stop="handleModalUnlock(modalImage)"
                class="px-6 py-3 bg-gradient-to-r from-pastel-yellow to-pastel-red text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <span class="text-xl">🔓</span>
                <span>{{ modalImage.unlockCost }} 토큰으로 사이드컷 해금</span>
              </button>
            </div>
            
            <!-- 사이드컷 이용 가능 (해금됨) -->
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
/* 3D 효과를 위한 원근감 설정 */
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

/* 고품질 입장 애니메이션 - 이미지가 위에서 떨어지며 약간 튀어오름 */
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

/* 고품질 퇴장 애니메이션 - 이미지가 아래로 떨어지며 사라짐 */
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
