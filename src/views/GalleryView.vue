<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import GalleryTopBar from './gallery/GalleryTopBar.vue'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import { useAuthStore } from '@/stores/authStore'
import { useGalleryStore } from '@/stores/galleryStore'

const authStore = useAuthStore()
const galleryStore = useGalleryStore()

// --- 데이터 로딩 (로컬 이미지 동적 로드) ---
const tomaImages = import.meta.glob('@/assets/gallery/common/toma/*.{png,jpg,jpeg,webp}', { eager: true })
const belleImages = import.meta.glob('@/assets/gallery/common/belle/*.{png,jpg,jpeg,webp}', { eager: true })
const chiiImages = import.meta.glob('@/assets/gallery/common/chii/*.{png,jpg,jpeg,webp}', { eager: true })

const extractImagePaths = (globResult) => {
    return Object.values(globResult).map(module => module.default || module)
}

const loadedImages = {
    toma: extractImagePaths(tomaImages),
    belle: extractImagePaths(belleImages),
    chie: extractImagePaths(chiiImages) // 'chii' 폴더를 'chie' 캐릭터 코드로 매핑
}

const galleryImages = computed(() => {
    const allImages = []
    
    // 각 캐릭터별 이미지 매핑
    Object.entries(loadedImages).forEach(([char, images]) => {
        images.forEach((imgSrc, index) => {
            allImages.push({
                id: `${char}-${index}`,
                title: `${char.toUpperCase()} Moment #${index + 1}`,
                image: imgSrc,
                gif: null,
                sidecut: null,
                character: char,
                unlocked: true, // 로컬 파일은 모두 해금 상태로 가정
                unlockCost: 0,
                createdAt: new Date()
            })
        })
    })

    return allImages
})

// --- 상태 관리 ---
const activeFilter = ref('all')
const viewMode = ref('carousel') // 'carousel' | 'list'

// 필터링된 이미지
const filteredImages = computed(() => {
  if (activeFilter.value === 'all') return galleryImages.value
  return galleryImages.value.filter(img => img.character === activeFilter.value)
})

// --- Carousel Mode Logic (프리뷰 + 세로 리스트) ---
const previewImage = ref(null)
const selectedListId = ref(null)
const isPreviewAnimating = ref(false)
const showFlipped = ref(false) // Moved up here
let debounceTimer = null

const toggleFlip = () => {
    if (previewImage.value?.unlocked) {
        showFlipped.value = !showFlipped.value
    }
}


// --- Functions Defined Before Watcher ---
const updatePreview = (image) => {
    isPreviewAnimating.value = true
    setTimeout(() => {
        previewImage.value = image
        showFlipped.value = false
        setTimeout(() => {
             isPreviewAnimating.value = false
        }, 50)
    }, 300)
}

const selectImageImmediate = (image) => {
    selectedListId.value = image.id
    previewImage.value = image
    showFlipped.value = false
}

const handleListSelect = (image) => {
    if (selectedListId.value === image.id) return
    
    selectedListId.value = image.id // 리스트 UI 즉시 반영
    
    if (debounceTimer) clearTimeout(debounceTimer)
    
    // 0.8초 딜레이 후 프리뷰 업데이트
    debounceTimer = setTimeout(() => {
        updatePreview(image)
    }, 800)
}

// 초기 이미지 설정 (함수 정의 후 호출)
watch(filteredImages, (newImages) => {
    if (newImages.length > 0) {
        // 필터가 바뀌면 첫 번째 이미지를 선택하되, 애니메이션 없이 즉시 변경
        selectImageImmediate(newImages[0])
    } else {
        previewImage.value = null
        selectedListId.value = null
    }
}, { immediate: true })

// --- Grid Mode Logic ---
const showModal = ref(false)
const modalImage = ref(null)

const openModal = (image) => {
    modalImage.value = image
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    modalImage.value = null
}

const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'carousel' ? 'list' : 'carousel'
}

// --- Unlock Logic ---
const handleUnlock = async (image) => {
  const userTokens = authStore.user?.credit || 0
  if (userTokens < image.unlockCost) {
    alert('토큰이 부족합니다!')
    return
  }
  if (!confirm(`${image.unlockCost} 토큰을 사용하여 해금하시겠습니까?`)) return
  
  const result = await galleryStore.unlockGallery(image.id)
  if (result && result.success) {
      alert('🎉 해금되었습니다!')
      await authStore.fetchUserProfile()
  } else {
      alert('해금에 실패했습니다.')
  }
}

onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
})



// 자동 스크롤 (세로 캐러셀 효과) - 선택된 아이템이 가운데로 오도록
// (실제 구현은 ref 사용 복잡도가 있어 CSS scroll-smooth에 의존하거나 추후 고도화)

</script>

<template>
  <MainLayout :is-full-width="true" :hide-sidebar="true">
    
    <!-- 메인 콘텐츠 영역 (전체 화면 사용) -->
    <div class="h-full relative overflow-hidden bg-white/50 backdrop-blur-sm p-6" :class="viewMode === 'carousel' ? 'flex gap-6' : 'flex flex-col'">
        
        <!-- ==================== Carousel Mode Structure ==================== -->
        <template v-if="viewMode === 'carousel'">
            <!-- LEFT COLUMN: Top Bar + Preview -->
            <div class="flex-1 flex flex-col gap-6 h-full min-w-0">
                
                <!-- 1. Top Collection Bar (Grid) -->
                <div class="flex-shrink-0 w-full">
                    <GalleryTopBar :active-filter="activeFilter" @update:filter="activeFilter = $event" />
                </div>

                <!-- 2. Preview Image (Big) -->
                <div class="flex-1 bg-white rounded-[2rem] shadow-2xl border border-gray-100 relative overflow-hidden group flex flex-col min-h-0">
                    <!-- 이미지 컨테이너 -->
                    <div class="flex-1 relative overflow-hidden bg-gray-50 perspective-1000 flex items-center justify-center p-8 bg-grid-pattern">
                        <div v-if="previewImage" class="relative w-full h-full transition-all duration-500 preserve-3d" :class="{ 'opacity-0 scale-95': isPreviewAnimating, 'rotate-y-180': showFlipped }">
                            
                            <!-- 앞면 (Normal) -->
                            <div class="absolute inset-0 backface-hidden flex items-center justify-center">
                                <img :src="previewImage.image" class="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg" alt="Preview" />
                                 <!-- Reflection Effect -->
                                 <div class="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-t from-white/50 to-transparent transform scale-y-[-1] opacity-20 blur-sm pointer-events-none"></div>

                                <!-- 잠금 오버레이 -->
                                <div v-if="!previewImage.unlocked" class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                    <div class="text-white text-center">
                                        <span class="text-6xl animate-bounce">🔒</span>
                                        <p class="font-bold mt-6 text-2xl tracking-[0.2em]">LOCKED</p>
                                    </div>
                                </div>
                            </div>

                            <!-- 뒷면 (Sidecut) -->
                            <div class="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center bg-white rounded-2xl shadow-inner">
                                <img :src="previewImage.sidecut || previewImage.image" class="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg" alt="Sidecut" />
                                <div class="absolute top-6 left-6 bg-pastel-red text-white px-5 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse flex items-center gap-2">
                                    <span>✨</span> SECRET CUT
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="text-gray-300 text-center flex flex-col items-center">
                            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">👆</div>
                            <p class="text-lg font-bold">Select a moment from the collection</p>
                        </div>
                    </div>

                    <!-- 하단 정보 및 액션 바 -->
                    <div class="h-20 bg-white border-t border-gray-100 px-8 flex items-center justify-between flex-shrink-0 z-20">
                        <div v-if="previewImage">
                            <h3 class="text-2xl font-serif font-black text-gray-900 mb-1 italic">{{ previewImage.title }}</h3>
                        </div>
                        
                        <div v-if="previewImage" class="flex gap-3">
                            <button v-if="!previewImage.unlocked" @click="handleUnlock(previewImage)" class="px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg hover:scale-105 hover:shadow-xl flex items-center gap-2">
                                <span>🔓</span>
                                <span>Unlock ({{ previewImage.unlockCost }})</span>
                            </button>
                            <button v-else @click="toggleFlip" class="px-6 py-2 rounded-full font-bold transition-all shadow-md hover:scale-105 flex items-center gap-2"
                                :class="showFlipped ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-pastel-red text-white hover:bg-red-400 shadow-red-200'">
                                <span>{{ showFlipped ? '↩️ Return' : '✨ Secret Cut' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: Vertical Carousel (Full Height) -->
            <div class="w-[280px] flex flex-col h-full bg-white/50 rounded-[2rem] border border-white/60 shadow-lg backdrop-blur-md flex-shrink-0">
                <div class="p-5 border-b border-gray-100 bg-white/80 flex justify-between items-center rounded-t-[2rem]">
                    <div>
                        <h3 class="font-black text-gray-800 text-xs tracking-[0.2em] uppercase">List</h3>
                        <p class="text-[10px] text-gray-400 mt-0.5">{{ filteredImages.length }} Items</p>
                    </div>
                    <!-- View Toggle Button (Text) -->
                     <button 
                        @click="toggleViewMode"
                        class="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-200 hover:text-gray-900 transition-all text-gray-500 text-xs font-bold flex items-center gap-1"
                    >
                        <span>🧱</span>
                        <span>목록</span>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar scroll-smooth">
                    <div 
                        v-for="(img, idx) in filteredImages" 
                        :key="img.id"
                        @click="handleListSelect(img)"
                        class="relative group cursor-pointer transition-all duration-500"
                        :class="[
                            selectedListId === img.id ? 'scale-100 z-10' : 'scale-95 opacity-70 hover:opacity-100 hover:scale-100'
                        ]"
                    >
                        <!-- 카드 디자인 -->
                        <div class="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg transition-all duration-300"
                             :class="selectedListId === img.id ? 'ring-4 ring-pastel-red ring-offset-2' : ''">
                            <img :src="img.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            
                            <!-- 오버레이 -->
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>

                            <!-- 선택됨 표시 (딜레이 중) -->
                            <div v-if="selectedListId === img.id && isPreviewAnimating" class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </div>

                        <!-- 잠금 뱃지 -->
                        <div v-if="!img.unlocked" class="absolute top-2 right-2 bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md backdrop-blur-sm">
                            🔒
                        </div>
                    </div>
                    
                    <!-- 하단 여백 -->
                    <div class="h-10"></div>
                </div>
            </div>
        </template>

        <!-- ==================== Grid View (Masonry) ==================== -->
        <template v-else>
             <!-- Grid Mode Header with Top Bar -->
             <div class="flex-shrink-0 w-full mb-6">
                 <!-- Header with Toggle Button -->
                <div class="flex justify-between items-center mb-4">
                     <h2 class="text-3xl font-serif font-black text-gray-900 italic tracking-tight flex items-center gap-2">
                        <span>🧱</span> Gallery Grid
                    </h2>
                    <button 
                        @click="toggleViewMode"
                        class="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all font-bold text-gray-700 text-sm"
                    >
                        📂 Return to List
                    </button>
                </div>
                
                <GalleryTopBar :active-filter="activeFilter" @update:filter="activeFilter = $event" />
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-20">
                    <div 
                        v-for="img in filteredImages" 
                        :key="img.id"
                        @click="openModal(img)"
                        class="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-2 cursor-zoom-in bg-white"
                    >
                        <img :src="img.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy"/>
                        
                        <!-- Hover Info -->
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                            <h4 class="font-serif font-black text-xl mb-1 italic">{{ img.title }}</h4>
                            <span class="text-[10px] tracking-widest border border-white/50 px-3 py-1 rounded-full uppercase">{{ img.unlocked ? 'Unlocked' : 'Locked' }}</span>
                        </div>

                        <!-- Lock Badge -->
                        <div v-if="!img.unlocked" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white text-sm">
                            🔒
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <!-- Modal (Grid View Only) -->
    <Teleport to="body">
        <div v-if="showModal && modalImage" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in" @click="closeModal">
             <!-- Modal Content -->
            <div class="bg-transparent w-full h-full max-w-7xl flex items-center justify-center gap-12" @click.stop>
                 <!-- 이미지 확대 -->
                 <div class="flex-[3] h-full flex items-center justify-center relative p-8">
                    <img :src="modalImage.image" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                 </div>
                 
                 <!-- 사이드바 (정보) -->
                 <div class="w-96 bg-white/10 backdrop-blur-lg border border-white/10 rounded-[2rem] p-8 h-auto max-h-[80vh] flex flex-col justify-center text-white shadow-2xl">
                     <h2 class="text-4xl font-serif font-black mb-2 italic">{{ modalImage.title }}</h2>
                     <p class="text-gray-400 mb-10 font-medium tracking-widest text-sm uppercase">Captured Memory • {{ new Date(modalImage.createdAt).toLocaleDateString() }}</p>
                     
                     <div class="mt-auto space-y-4">
                         <div v-if="!modalImage.unlocked" class="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
                            <p class="text-sm text-gray-300 mb-1">Unlock Cost</p>
                            <div class="flex items-center gap-2">
                                <span class="text-2xl font-bold text-pastel-red">{{ modalImage.unlockCost }}</span>
                                <span class="text-sm text-gray-400">Tokens required</span>
                            </div>
                         </div>

                         <button v-if="!modalImage.unlocked" @click="handleUnlock(modalImage)" class="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-gray-200 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2">
                             <span>🔓</span> Unlock Picture
                         </button>
                         <button @click="closeModal" class="w-full py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
                             Close View
                         </button>
                     </div>
                 </div>
            </div>
        </div>
    </Teleport>

  </MainLayout>
</template>

<style scoped>
.perspective-1000 { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar {
    width: 0px; /* 스크롤바 숨김 (깔끔하게) */
}
</style>
