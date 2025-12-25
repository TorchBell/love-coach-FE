<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import GalleryTopBar from './gallery/GalleryTopBar.vue'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import { useAuthStore } from '@/stores/authStore'
import { useGalleryStore } from '@/stores/galleryStore'
import userTokenIcon from '@/assets/icons/user-token.png'

const authStore = useAuthStore()
const galleryStore = useGalleryStore()

// --- 데이터 로딩 (로컬 이미지 동적 로드 & 매핑) ---
const localImages = import.meta.glob('@/assets/gallery/**/*.{png,jpg,jpeg,webp}', { eager: true })
const localVideos = import.meta.glob('@/assets/gallery/sidecut/*.mp4', { eager: true })
// [FIX] 텍스트 파일 raw 로드 설정 명확화
const localTexts = import.meta.glob('@/assets/gallery/sidecut/*.txt', { as: 'raw', eager: true })

const localAssetPaths = Object.keys(localImages)
const localVideoPaths = Object.keys(localVideos)
const localTextPaths = Object.keys(localTexts)

// 텍스트 파일 내용 가져오기 & 닉네임 치환
const getProccessedText = (rawText) => {
    if (!rawText) return ''
    const nickname = authStore.user?.nickname || '사용자'
    // {{}} 또는 {{사용자}} 등을 닉네임으로 치환
    let processed = rawText.replace(/{{.*?}}/g, nickname)
    // 앞뒤 따옴표 제거 (json import 시 발생 가능)
    if (processed.startsWith('"') && processed.endsWith('"')) {
        processed = processed.slice(1, -1)
    }
    return processed
}

const findLocalImage = (dbPath) => {
    if (!dbPath) return null
    if (dbPath.startsWith('http')) return dbPath
    
    // DB 경로(예: gallery/common/toma/1.jpg)가 로컬 경로(예: .../assets/gallery/common/toma/1.jpg)에 포함되는지 확인
    const normalizedDbPath = dbPath.replace(/\\/g, '/')
    
    // 1. 경로 포함 여부 확인
    const match = localAssetPaths.find(localPath => localPath.includes(normalizedDbPath))
    if (match) return localImages[match].default || localImages[match]
    
    // 2. 파일명만으로 Fallback
    const filename = normalizedDbPath.split('/').pop()
    const fallbackMatch = localAssetPaths.find(localPath => localPath.endsWith(filename))
    if (fallbackMatch) return localImages[fallbackMatch].default || localImages[fallbackMatch]

    return null
}

const findLocalSidecut = (dbUrl) => {
    // 1. DB URL이 있으면 해당 파일명으로 매핑 시도
    let video = null
    let text = ''
    let isDummy = false

    if (dbUrl) {
        // DB URL에서 파일명 추출 (예: /gallery/sidecut/toma5.mp4 -> toma5)
        const filename = dbUrl.split('/').pop().split('.')[0]
        
        // 비디오 찾기 (파일명으로 검색)
        const vidPath = localVideoPaths.find(p => p.includes(filename))
        
        if (vidPath) {
            video = localVideos[vidPath].default || localVideos[vidPath]
        }

        // 같은 이름의 텍스트 파일 찾기
        const txtPath = localTextPaths.find(p => p.includes(filename))
        if (txtPath) {
            text = localTexts[txtPath]
        }
    }

    // 2. 비디오가 없으면 임시 데이터
    if (!video) {
        isDummy = true
        const dummyName = 'toma6'
        const vidPath = localVideoPaths.find(p => p.includes(dummyName))
        const txtPath = localTextPaths.find(p => p.includes(dummyName))
        
        if (vidPath) video = localVideos[vidPath].default || localVideos[vidPath]
        if (txtPath) text = localTexts[txtPath]
    }

    return { video, text, isDummy }
}

// 초기 데이터 로드
onMounted(async () => {
    await galleryStore.fetchGalleries()
    if (authStore.user) await authStore.fetchUserProfile() // 크레딧 정보 갱신
})

const galleryImages = computed(() => {
    const storeList = galleryStore.galleries || [] // 백엔드 데이터

    // DB 데이터를 UI 포맷으로 변환
    return storeList.map((item, index) => {
        // NPC ID 매핑
        let char = 'toma'
        
        // 1순위: URL 분석 (사용자 요청: URL에 토마/벨/치에가 명시되어 있음)
        const dbUrl = (item.imageUrl || item.image_url || '').toLowerCase()
        if (dbUrl.includes('toma')) char = 'toma'
        else if (dbUrl.includes('belle')) char = 'belle'
        else if (dbUrl.includes('chie') || dbUrl.includes('chii')) char = 'chie'
        else {
            // 2순위: NPC ID (없거나 URL로 판단 불가 시)
            const rawId = item.npcId !== undefined ? item.npcId : item.npc_id
            const nid = Number(rawId)
            
            if (nid === 1) char = 'toma'
            else if (nid === 2) char = 'belle'
            else if (nid === 3) char = 'chie'
            else {
                // 기본값 토마
            }
        }

        // 이미지 매핑
        const mainImg = findLocalImage(item.imageUrl || item.image_url) || CHAR_IMAGES[char]
        
        // Sidecut 매핑 (비디오/텍스트)
        // [FIX] 백엔드 응답 키가 'bcutImageUrl'로 확인됨
        const bCutUrl = item.bcutImageUrl || item.bCutImageUrl || item.b_cut_image_url
        const sidecutData = findLocalSidecut(bCutUrl)
        
        const isDummy = sidecutData.isDummy
        
        // 가격 정책: b_cut_image_url이 있으면 500, 없으면 9999 (준비중)
        const hasBCut = !!bCutUrl
        const price = hasBCut ? 500 : 9999

        return {
            id: item.galleryId || item.gallery_id || `local-${index}`,
            title: item.title || `${char.toUpperCase()} Moment`,
            image: mainImg,
            sidecutVideo: sidecutData.video,
            sidecutText: sidecutData.text,
            character: char,
            unlocked: item.isBOpened || false, // DB 해금 여부 (B-Cut 해금 여부)
            unlockCost: price,
            unlockCondition: item.unlockCondition || item.unlock_condition,
            createdAt: item.createdAt || new Date()
        }
    })
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
const debounceTimer = ref(null)

const toggleFlip = () => {
    // 잠금 여부와 관계없이 뒤집기 (뒷면에서 해금 UI 제공)
    showFlipped.value = !showFlipped.value
}

// --- Unlock Confirmation Modal Logic ---
const showConfirmModal = ref(false)
const unlockTargetImage = ref(null)
const showComingSoonModal = ref(false)
const isUnlocking = ref(false) // 중복 클릭 방지
const isSpinning = ref(false) // 해금 성공 시 회전 애니메이션

const openUnlockModal = (image) => {
    if (!authStore.user) {
        alert('로그인이 필요합니다.')
        return
    }
    
    // 9999 크래딧이면 "준비중" 모달 표시
    if (image.unlockCost === 9999) {
        showComingSoonModal.value = true
        return
    }
    
    if ((authStore.user.credit || 0) < image.unlockCost) {
        alert('크레딧이 부족합니다.')
        return
    }
    unlockTargetImage.value = image
    showConfirmModal.value = true
}

const closeComingSoonModal = () => {
    showComingSoonModal.value = false
}

const closeUnlockModal = () => {
    showConfirmModal.value = false
    unlockTargetImage.value = null
}

const confirmUnlock = async () => {
    if (!unlockTargetImage.value || isUnlocking.value) return
    
    isUnlocking.value = true
    const image = unlockTargetImage.value
    
    // 모달 닫기 (UX: 모달이 닫히고 카드가 회전하며 해금됨)
    closeUnlockModal()

    try {
        const success = await galleryStore.unlockGallery(image.id)
        
        if (success) {
            // 1. 회전 애니메이션 시작
            isSpinning.value = true
            
            // 2. 크레딧 갱신 (비동기)
            await authStore.fetchUserProfile()
            await galleryStore.fetchGalleries() // 목록 갱신

            // 3. 현재 보고 있는 이미지 상태 강제 업데이트 (Optimistic Update)
            if (previewImage.value && previewImage.value.id === image.id) {
                previewImage.value.unlocked = true
                // 스토어 갱신 후의 새 객체로 교체 (참조 유지 위함)
                const freshImage = galleryImages.value.find(img => img.id === image.id)
                if (freshImage) {
                    previewImage.value = freshImage
                }
            }

            // 4. 애니메이션 후 결과 보여주기
            setTimeout(() => {
                isSpinning.value = false
                showFlipped.value = true
            }, 1000) // 1초 동안 회전

        } else {
            alert('해금에 실패했습니다.')
        }
    } catch (e) {
        console.error(e)
        alert('오류가 발생했습니다.')
    } finally {
        isUnlocking.value = false
    }
}

// (Function replaced by openUnlockModal and confirmUnlock)


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
    if (!image) return
    selectedListId.value = image.id
    previewImage.value = image
    showFlipped.value = false
}

const handleListSelect = (image) => {
    if (selectedListId.value === image.id) return
    
    selectedListId.value = image.id // 리스트 UI 즉시 반영
    
    if (debounceTimer.value) clearTimeout(debounceTimer.value)
    
    // 0.8초 딜레이 후 프리뷰 업데이트
    debounceTimer.value = setTimeout(() => {
        updatePreview(image)
    }, 800)
}

// 초기 이미지 설정 (함수 정의 후 호출)
watch(filteredImages, (newImages) => {
    if (newImages.length > 0) {
        // 필터가 바뀌면 첫 번째 이미지를 선택하되, 애니메이션 없이 즉시 변경
        // 이미 선택된 게 리스트에 없다면 첫번째로
        const exists = newImages.find(img => img.id === selectedListId.value)
        if (!exists) {
            selectImageImmediate(newImages[0])
        }
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
// (중복 제거됨)

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
                        <div v-if="previewImage" class="relative w-full h-full transition-all duration-500 preserve-3d" :class="{ 'opacity-0 scale-95': isPreviewAnimating, 'rotate-y-180': showFlipped, 'animate-spin-y': isSpinning }">
                            
                                <!-- 앞면 (Normal) - 항상 보임 -->
                            <div class="absolute inset-0 backface-hidden flex items-center justify-center">
                                <img :src="previewImage.image" class="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg" alt="Preview" />
                                 <!-- Reflection Effect -->
                                 <div class="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-t from-white/50 to-transparent transform scale-y-[-1] opacity-20 blur-sm pointer-events-none"></div>

                                <!-- 잠금 상태 표시 (작게) - 이미지는 가리지 않음 -->
                                <div v-if="!previewImage.unlocked" class="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2">
                                    <span class="text-sm">🔒 Flip Locked</span>
                                </div>
                            </div>

                            <!-- 뒷면 (Sidecut) - 해금 시에만 접근 가능 -->
                            <!-- 뒷면 (Sidecut) - 해금 시에만 접근 가능 -->
                            <div class="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center bg-white rounded-2xl shadow-inner overflow-hidden">
                                <!-- 해금된 상태: 비디오만 (텍스트는 하단 바에 표시) -->
                                <div v-if="previewImage.unlocked" class="flex flex-col w-full h-full bg-black">
                                     <div class="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden">
                                        <video 
                                            v-if="previewImage.sidecutVideo && showFlipped"
                                            :src="previewImage.sidecutVideo"
                                            autoplay
                                            muted
                                            loop
                                            playsinline
                                            class="w-full h-full object-contain"
                                        ></video>
                                        <div v-else class="text-white text-sm">비디오를 찾을 수 없습니다.</div>
                                    </div>
                                </div>

                                <!-- 잠긴 상태: 해금 UI -->
                                <div v-else class="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-900 text-white space-y-6">
                                    <div class="text-center">
                                        <h3 class="text-xl font-bold mb-2">시크릿 컷 잠김</h3>
                                        <p class="text-gray-400 text-sm">해금하여 숨겨진 이야기를 확인하세요.</p>
                                    </div>
                                    
                                    <div class="bg-gray-800 rounded-xl px-6 py-4 flex items-center gap-3">
                                        <img :src="userTokenIcon" class="w-6 h-6 object-contain" />
                                        <span class="text-yellow-400 font-bold text-xl">{{ previewImage.unlockCost }}</span>
                                        <span class="text-gray-400 text-sm">크레딧 필요</span>
                                    </div>

                                    <button 
                                        @click.stop="openUnlockModal(previewImage)"
                                        :disabled="isUnlocking"
                                        class="w-full py-4 bg-gradient-to-r from-pastel-red to-pink-500 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span v-if="isUnlocking">해금 중...</span>
                                        <span v-else>해금하기</span>
                                    </button>
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
                    <div class="min-h-20 h-auto py-4 bg-white border-t border-gray-100 px-8 flex items-center justify-between flex-shrink-0 z-20">
                        <div v-if="previewImage" class="flex-1 mr-4">
                            <h3 class="text-xl md:text-2xl lg:text-3xl font-sans font-bold text-gray-800 mb-1 break-words whitespace-pre-wrap">
                                <span v-if="showFlipped && previewImage.unlocked" class="text-gray-800 font-handwriting">
                                    {{ getProccessedText(previewImage.sidecutText) || previewImage.title }}
                                </span>
                                <span v-else>
                                    {{ previewImage.title }}
                                </span>
                            </h3>
                        </div>
                        
                        <div v-if="previewImage" class="flex gap-3 flex-shrink-0">
                            <!-- 뒤집기 버튼 -->
                            <button @click="toggleFlip" class="px-4 py-1.5 md:px-6 md:py-2 rounded-full font-bold transition-all shadow-md hover:scale-105 flex items-center gap-2 text-xs md:text-sm lg:text-base bg-pastel-red text-white hover:bg-red-400 shadow-red-200">
                                <template v-if="showFlipped">
                                    <span>Return</span>
                                </template>
                                <template v-else-if="previewImage.unlocked">
                                    <span>Flip</span>
                                </template>
                                <template v-else>
                                    <img :src="userTokenIcon" class="w-5 h-5 object-contain" />
                                    <span>{{ previewImage.unlockCost }}</span>
                                </template>
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

                        <!-- 잠금 뱃지 (작게 표시) -->
                        <div v-if="!img.unlocked" class="absolute top-2 right-2 bg-black/80 text-white/90 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md backdrop-blur-sm border border-white/20">
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
                     <h2 class="text-3xl font-sans font-bold text-gray-900 tracking-tight flex items-center gap-2">
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
                        
                        <!-- Back (Hidden Info / Unlock) -->
            <div class="absolute inset-0 bg-white rounded-2xl shadow-xl backface-hidden rotate-y-180 flex flex-col overflow-hidden">
                <!-- 해금된 상태: 비디오 + 텍스트 -->
                <div v-if="img.unlocked" class="flex flex-col h-full">
                    <div class="w-full aspect-video bg-black flex items-center justify-center relative">
                         <!-- 비디오 플레이어 -->
                         <video 
                            v-if="img.sidecutVideo"
                            :src="img.sidecutVideo"
                            autoplay
                            muted
                            loop
                            playsinline
                            class="w-full h-full object-contain"
                         ></video>
                         <div v-else class="text-white text-sm">비디오를 찾을 수 없습니다.</div>
                    </div>
                    
                    <div class="flex-1 p-6 flex items-center justify-center bg-gray-50 overflow-y-auto">
                        <p class="text-gray-700 text-lg leading-relaxed font-medium whitespace-pre-wrap text-center font-handwriting">
                            {{ getProccessedText(img.sidecutText) }}
                        </p>
                    </div>
                </div>

                <!-- 잠긴 상태: 해금 UI -->
                <div v-else class="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900 text-white space-y-6">
                     <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                        <span class="text-3xl">🔒</span>
                     </div>
                     <div class="text-center">
                         <h3 class="text-xl font-bold mb-2">시크릿 컷 잠김</h3>
                         <p class="text-gray-400 text-sm">해금하여 숨겨진 이야기를 확인하세요.</p>
                     </div>
                     
                     <div class="bg-gray-800 rounded-xl px-6 py-4 flex items-center gap-3">
                        <span class="text-yellow-400 font-bold text-xl">🪙 {{ img.unlockCost }}</span>
                        <span class="text-gray-400 text-sm">크레딧 필요</span>
                     </div>

                     <button 
                        @click.stop="openUnlockModal(img)"
                        :disabled="isUnlocking"
                        class="w-full py-4 bg-gradient-to-r from-pastel-red to-pink-500 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        <span v-if="isUnlocking">...</span>
                        <span v-else>해금하기</span>
                     </button>
                     
                     <p v-if="img.unlockCost === 9999" class="text-xs text-gray-500 mt-4">* 아직 시크릿 컷이 준비되지 않았습니다</p>
                </div>
            </div>
                        <!-- Hover Info -->
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                            <h4 class="font-sans font-bold text-2xl mb-1">{{ img.title }}</h4>
                            <span class="text-[10px] tracking-widest border border-white/50 px-3 py-1 rounded-full uppercase">{{ img.unlocked ? 'Unlocked' : 'Flip Locked' }}</span>
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
                     <h2 class="text-3xl md:text-4xl lg:text-5xl font-sans font-bold mb-2">{{ modalImage.title }}</h2>
                     <p class="text-gray-400 mb-6 lg:mb-10 font-medium tracking-widest text-xs lg:text-sm uppercase">Captured Memory • {{ new Date(modalImage.createdAt).toLocaleDateString() }}</p>
                     
                     <div class="mt-auto space-y-4">
                         <div v-if="!modalImage.unlocked" class="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
                            <p class="text-xs lg:text-sm text-gray-300 mb-1">Unlock Cost</p>
                            <div class="flex items-center gap-2">
                                <span class="text-xl lg:text-2xl font-bold text-pastel-red">{{ modalImage.unlockCost }}</span>
                                <span class="text-xs lg:text-sm text-gray-400">Tokens required</span>
                            </div>
                         </div>

                         <button v-if="!modalImage.unlocked" @click="openUnlockModal(modalImage)" class="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-gray-200 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2">
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

    <!-- Unlock Confirmation Modal -->
    <Teleport to="body">
        <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" @click.self="closeUnlockModal">
            <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">시크릿 컷 해금</h3>
                <p class="text-gray-500 mb-6">숨겨진 이야기를 확인하시겠습니까?</p>
                
                <div class="bg-gray-50 rounded-2xl p-6 mb-8 flex items-center justify-between border border-gray-100">
                    <span class="text-gray-600 font-medium">필요 크레딧</span>
                    <div class="flex items-center gap-2">
                        <img :src="userTokenIcon" class="w-6 h-6 object-contain" />
                        <span class="text-2xl font-black text-pastel-red">{{ unlockTargetImage?.unlockCost }}</span>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button @click="closeUnlockModal" class="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        취소
                    </button>
                    <button @click="confirmUnlock" class="flex-1 py-4 bg-pastel-red text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-red-200 transition-all active:scale-95">
                        해금하기
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Coming Soon Modal -->
    <Teleport to="body">
        <div v-if="showComingSoonModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" @click.self="closeComingSoonModal">
            <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
                <div class="text-6xl mb-4">🛠️</div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">아직 준비중이에요!</h3>
                <p class="text-gray-500 mb-6">다음 패치에서 꼭 보여드릴게요 💖</p>
                <button @click="closeComingSoonModal" class="w-full py-4 bg-pastel-red text-white rounded-xl font-bold hover:brightness-110 transition-all">
                    알겠어요!
                </button>
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

.animate-spin-y { animation: spinY 0.6s ease-out; }
@keyframes spinY {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(180deg); } /* 360도 대신 180도로 변경하여 '뒤집힘' 상태로 자연스럽게 연결 */
}
</style>
