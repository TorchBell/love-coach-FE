<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import QuestBoard from './achievement/QuestBoard.vue'
import { CHAR_IMAGES, UI_IMAGES } from '@/assets/dummy/index.js'
import { useAuthStore } from '@/stores/authStore'
import { useAchievementStore } from '@/stores/achievementStore'

const authStore = useAuthStore()
const achievementStore = useAchievementStore()

// --- 업적 조회 ---
onMounted(() => {
  achievementStore.fetchAchievements()
})

// --- 탭 상태 ---
const activeTab = ref('toma') // 'toma', 'belle', 'chie'

const tabs = [
  { id: 'toma', name: '식단', color: 'bg-pastel-red', image: CHAR_IMAGES.toma, description: '토마와 함께!' },
  { id: 'belle', name: '근력', color: 'bg-pastel-yellow', image: CHAR_IMAGES.belle, description: '벨과 득근!' },
  { id: 'chie', name: '유산소', color: 'bg-pastel-blue', image: CHAR_IMAGES.chie, description: '치에와 질주!' }
]

// --- 스토어 데이터 연동 ---
const characterAchievements = computed(() => {
  const storeList = achievementStore.achievements || []
  
  // [DEBUG] 데이터 구조 확인용 로그
  if (storeList.length > 0) {
      console.log('Achievement Data Sample:', storeList[0])
  }

  // 타입 명칭 매핑 (영문 -> 한글)
  const formatType = (type) => {
      if (!type) return ''
      const t = type.toUpperCase()
      if (t.includes('DIET')) return '식단'
      if (t.includes('WORKOUT') || t.includes('MUSCLE')) return '근력'
      if (t.includes('CARDIO') || t.includes('RUN')) return '유산소'
      if (t.includes('LOGIN')) return '출석'
      return type
  }

  // NPC ID 추출 헬퍼 (엄격 모드 + 숫자 강제)
  const getNpcId = (obj) => {
      const rawId = obj.npcId !== undefined ? obj.npcId : obj.npc_id
      if (rawId != null) return Number(rawId)
      
      // 중첩 객체
      if (obj.npc?.npcId != null) return Number(obj.npc.npcId)
      if (obj.npc?.id != null) return Number(obj.npc.id)
      
      return null
  }

// --- 데이터 로딩 (로컬 이미지 동적 로드 & 매핑) ---
// 사용자 요청: 업적 아이콘은 src/assets/achievement 폴더에 위치함
const localImages = import.meta.glob('@/assets/achievement/**/*.{png,jpg,jpeg,webp}', { eager: true })
const localAssetPaths = Object.keys(localImages)

const findLocalImage = (dbPath) => {
    if (!dbPath) return null
    if (dbPath.startsWith('http')) return dbPath
    
    // DB 경로 정규화 (윈도우 역슬래시 대응)
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

  // 헬퍼: 백엔드 데이터를 UI 포맷으로 변환
  const mapToUiItem = (item) => {
      // 1. NPC ID 매핑 (1=토마, 2=벨, 3=치이)
      const nid = getNpcId(item)
      let tabId = 'toma' // Default fallback

      if (nid === 1) tabId = 'toma'
      else if (nid === 2) tabId = 'belle'
      else if (nid === 3) tabId = 'chie'
      else {
          console.warn('[Achievement] NPC ID Check Failed. Data:', item)
          // 분류 실패시 기본값(토마) 유지하여 화면엔 뜨게 함
      }

      // 2. 값 매핑 (SQL 컬럼명 고려)
      const targetValue = item.achievementValue || item.achievement_value || 0
      const currentValue = item.progress || 0
      
      // 3. 달성 여부 판단 (사용자 요청: 백엔드 구현 미완료로 인한 임시 로직)
      // "잠겨 있는 업적"이라는 이름이 아니면 모두 완료된 것으로 간주
      const rawTitle = item.name || item.title || '잠겨 있는 업적'
      // 공백 제거 및 정규화 비교
      const isAchieved = rawTitle.trim() !== '잠겨 있는 업적'

      const typeLabel = formatType(item.achievementType || item.achievement_type || '')
      
      // 이미지 매핑 (Local Asset 우선)
      const mappedImage = findLocalImage(item.iconUrl || item.icon_url)

      return {
          id: item.achievementId || item.achievement_id,
          // 완료된 경우 실제 타이틀 표시, 아니면 '???' (단, DB에서 이미 '잠겨 있는 업적'으로 오면 그걸 '???'로 치환)
          // 로직상 isAchieved가 false이면(즉 '잠겨 있는 업적'이면) ???로 표시
          title: isAchieved ? rawTitle : '???',
          // Description은 항상 노출
          description: item.description || '설명이 없습니다.',
          status: isAchieved ? 'completed' : 'locked',
          imageUrl: mappedImage || UI_IMAGES.galleryDiet, // 매핑된 이미지 없으면 기본값
          reward: item.rewardPoint || 100, // SQL에 없음, 기본값
          rewardGalleryId: item.rewardGalleryId || item.reward_gallery_id, // SQL: reward_gallery_id
          tabId: tabId,
          isAchieved: isAchieved,
          achievedAt: item.achievedAt || item.achieved_at, // 달성일
          
          progressText: `${typeLabel} (${currentValue}/${targetValue})`,
          progressPercent: targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0
      }
  }

  const allItems = storeList.map(mapToUiItem)

  // 5. 정렬: 미달성(locked)이 상단, 달성(completed)이 하단
  allItems.sort((a, b) => Number(a.isAchieved) - Number(b.isAchieved))

  const tomaList = allItems.filter(i => i.tabId === 'toma')
  const belleList = allItems.filter(i => i.tabId === 'belle')
  const chieList = allItems.filter(i => i.tabId === 'chie')

  return {
    toma: {
      id: 'toma',
      name: '토마 (식단)',
      color: 'text-pastel-red',
      bgColor: 'bg-pastel-red',
      fillColor: 'rgba(255, 107, 107, 0.2)',
      total: tomaList.length,
      completed: tomaList.filter(i => i.status === 'completed').length,
      items: tomaList
    },
    belle: {
      id: 'belle',
      name: '벨 (근력)',
      color: 'text-pastel-blue',
      bgColor: 'bg-pastel-blue',
      fillColor: 'rgba(100, 149, 237, 0.2)',
      total: belleList.length,
      completed: belleList.filter(i => i.status === 'completed').length,
      items: belleList
    },
    chie: {
      id: 'chie',
      name: '치이 (유산소)',
      color: 'text-pastel-yellow',
      bgColor: 'bg-pastel-yellow',
      fillColor: 'rgba(253, 253, 150, 0.3)',
      total: chieList.length,
      completed: chieList.filter(i => i.status === 'completed').length,
      items: chieList
    }
  }
})

// 이미지 헬퍼
const getAchievementImage = (key) => {
  if (!key) return UI_IMAGES.galleryDiet
  if (CHAR_IMAGES[key]) return CHAR_IMAGES[key]
  if (UI_IMAGES[key]) return UI_IMAGES[key]
  return UI_IMAGES.galleryDiet
}
// (Cleanup)
</script>

<template>
  <MainLayout :is-full-width="true" :hide-sidebar="true">
    <div class="h-full flex flex-col md:flex-row gap-8 p-8 overflow-hidden bg-gray-50/50 justify-center items-start">
        
        <!-- LEFT: Achievement Gallery (Expanded Ratio ~55%) -->
        <div class="w-full md:w-[55%] max-w-3xl flex flex-col h-full flex-shrink-0 transition-all duration-500">
            <!-- Header -->
            <div class="flex items-end justify-between mb-6 flex-shrink-0">
                <div>
                   <h1 class="text-4xl font-black text-gray-800 flex items-center gap-3">
                       <span>🏆</span> HALL OF FAME
                   </h1>
                   <p class="text-gray-500 text-sm font-bold tracking-widest mt-2 ml-1 uppercase">Achievement Collection</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="grid grid-cols-3 gap-4 mb-6 flex-shrink-0">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border flex items-center justify-center gap-3 group"
                  :class="activeTab === tab.id 
                    ? 'bg-white shadow-lg border-pastel-red ring-2 ring-pastel-red/10 scale-105' 
                    : 'bg-white/50 border-transparent hover:bg-white hover:shadow-md'"
                >
                  <div class="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all"
                       :class="activeTab === tab.id ? 'grayscale-0 border-pastel-red' : 'border-gray-200'">
                    <img :src="tab.image" class="w-full h-full object-cover" />
                  </div>
                  <span class="font-bold text-lg text-gray-700" :class="{ 'text-black': activeTab === tab.id }">{{ tab.name }}</span>
                </button>
            </div>

            <!-- Content Card (Full Height) -->
            <div class="flex-1 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col overflow-hidden relative">
                <!-- Inner Header -->
                <div class="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 class="text-2xl font-black flex items-center gap-3" :class="characterAchievements[activeTab].color">
                        {{ characterAchievements[activeTab].name }}
                        <span class="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold shadow-sm">{{ characterAchievements[activeTab].completed }}/{{ characterAchievements[activeTab].total }}</span>
                    </h2>
                    
                    <!-- Progress Bar -->
                    <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <div class="h-full rounded-full transition-all duration-1000 shadow-sm" :class="characterAchievements[activeTab].bgColor" :style="{ width: `${characterAchievements[activeTab].total > 0 ? (characterAchievements[activeTab].completed / characterAchievements[activeTab].total) * 100 : 0}%` }"></div>
                    </div>
                </div>

                <!-- Scrollable Grid -->
                <!-- 데이터가 없을 경우 처리 -->
                <div v-if="characterAchievements[activeTab].items.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <div class="text-4xl mb-2">📜</div>
                    <p>아직 등록된 업적이 없어요.</p>
                </div>

                <div v-else class="flex-1 overflow-y-auto custom-scrollbar pr-3 -mr-3 space-y-4">
                     <div 
                        v-for="item in characterAchievements[activeTab].items" 
                        :key="item.id"
                        class="bg-gray-50 rounded-2xl p-5 border border-gray-100 transition-all hover:bg-white hover:shadow-lg flex gap-5 items-center group relative overflow-hidden"
                        :class="item.status === 'completed' ? 'opacity-100' : 'opacity-90'"
                      >
                        <!-- Completion Glow (Optional) -->
                        <div v-if="item.status === 'completed'" class="absolute -left-1 top-0 bottom-0 w-1 bg-pastel-green"></div>

                        <!-- Icon -->
                        <div class="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-white border-2 border-gray-100 relative shadow-md">
                           <!-- DB 이미지(findLocalImage 결과) 우선 표시 -->
                           <img v-if="item.status === 'completed'" :src="item.imageUrl" class="w-full h-full object-cover" />
                           <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-3xl grayscale opacity-40">🔒</div>
                           
                           <!-- Check Badge -->
                           <div v-if="item.status === 'completed'" class="absolute bottom-0 right-0 bg-pastel-green text-white w-6 h-6 flex items-center justify-center rounded-tl-xl shadow-sm">
                               <span class="text-xs font-bold">✓</span>
                           </div>
                        </div>

                        <!-- Text Info -->
                        <div class="flex-1 min-w-0 flex flex-col justify-center h-full gap-1">
                            <!-- Title -->
                            <h3 class="font-black text-gray-800 text-lg leading-tight truncate">
                                {{ item.title }}
                            </h3>
                            
                            <!-- Description -->
                            <p class="text-gray-600 text-base font-medium leading-snug line-clamp-2">
                                {{ item.description }}
                            </p>
                            
                            <!-- Progress Bar & Text (Only if not completed) -->
                            <div v-if="item.status !== 'completed'" class="mt-2">
                                <div class="flex justify-between items-center text-xs font-bold text-gray-400 mb-1">
                                    <span>{{ item.progressText }}</span>
                                    <span>{{ Math.round(item.progressPercent) }}%</span> 
                                </div>
                                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                                     <div class="h-full bg-pastel-red rounded-full transition-all duration-500" :style="{ width: `${item.progressPercent}%` }"></div>
                                </div>
                            </div>

                            <!-- Reward (Only if completed or show always?) -->
                            <div v-else class="mt-1 flex items-center text-xs font-bold text-pink-500">
                                <span>💖 완료일: {{ item.achievedAt || '2024.12.24' }}</span>
                            </div>
                        </div>
                      </div>
                </div>
            </div>
        </div>

        <!-- RIGHT: Quest Board (Larger Width for Impact) -->
        <div class="flex-1 h-full max-w-2xl min-w-[350px] hidden md:block pb-4 pt-12">
            <QuestBoard />
        </div>
    </div>
  </MainLayout>
</template>


<style scoped>
.achievement-card {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
