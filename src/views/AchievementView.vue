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

// --- 로컬 이미지 동적 로드 (Vite Glob Import) ---
const tomaImages = import.meta.glob('@/assets/achievement/common/toma/*.{png,jpg,jpeg,webp}', { eager: true })
const belleImages = import.meta.glob('@/assets/achievement/common/belle/*.{png,jpg,jpeg,webp}', { eager: true })
const chiiImages = import.meta.glob('@/assets/achievement/common/chii/*.{png,jpg,jpeg,webp}', { eager: true }) // 폴더명 chii 주의

// 이미지 경로 목록 추출 헬퍼
const extractImagePaths = (globResult) => {
    return Object.values(globResult).map(module => module.default || module)
}

const loadedImages = {
    toma: extractImagePaths(tomaImages),
    belle: extractImagePaths(belleImages),
    chie: extractImagePaths(chiiImages) // 탭 ID 'chie'에 매핑
}

// --- 스토어 대신 로컬 이미지로 구조 생성 ---
const characterAchievements = computed(() => {
  // 백엔드 연동 시: 여기에 백엔드 데이터(URL 포함)가 들어올 것임
  // 현재: 로컬 폴더의 이미지 개수만큼 아이템 생성
  
  const generateItems = (tabId) => {
      const images = loadedImages[tabId] || []
      const charName = tabs.find(t => t.id === tabId)?.name || 'Unknown'
      
      return images.map((imgSrc, index) => ({
          id: `${tabId}-${index}`,
          title: `${charName} 컬렉션 #${index + 1}`,
          description: `소중한 추억을 모아보세요!`,
          status: 'completed', // 갤러리에 있는 이미지는 모두 획득한 것으로 간주
          imageKey: null, // 직접 URL 사용
          imageUrl: imgSrc,
          reward: 100,
          hint: '열심히 운동하면 얻을 수 있어요!'
      }))
  }

  const tomaList = generateItems('toma')
  const belleList = generateItems('belle')
  const chieList = generateItems('chie')

  return {
    toma: {
      id: 'toma',
      name: '토마 (식단)',
      color: 'text-pastel-red',
      bgColor: 'bg-pastel-red',
      fillColor: 'rgba(255, 107, 107, 0.2)',
      total: tomaList.length,
      completed: tomaList.length, // 모두 획득 처리
      items: tomaList
    },
    belle: {
      id: 'belle',
      name: '벨 (근력)',
      color: 'text-pastel-blue',
      bgColor: 'bg-pastel-blue',
      fillColor: 'rgba(100, 149, 237, 0.2)',
      total: belleList.length,
      completed: belleList.length,
      items: belleList
    },
    chie: {
      id: 'chie',
      name: '치이 (유산소)',
      color: 'text-pastel-yellow',
      bgColor: 'bg-pastel-yellow',
      fillColor: 'rgba(253, 253, 150, 0.3)',
      total: chieList.length,
      completed: chieList.length,
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
                        <div class="h-full rounded-full transition-all duration-1000 shadow-sm" :class="characterAchievements[activeTab].bgColor" :style="{ width: `${(characterAchievements[activeTab].completed / characterAchievements[activeTab].total) * 100}%` }"></div>
                    </div>
                </div>

                <!-- Scrollable Grid -->
                <div class="flex-1 overflow-y-auto custom-scrollbar pr-3 -mr-3 space-y-4">
                     <div 
                        v-for="item in characterAchievements[activeTab].items" 
                        :key="item.id"
                        class="bg-gray-50 rounded-2xl p-5 border border-gray-100 transition-all hover:bg-white hover:shadow-lg flex gap-5 items-center group relative overflow-hidden"
                        :class="item.status === 'completed' ? 'opacity-100' : 'opacity-80'"
                      >
                        <!-- Completion Glow (Optional) -->
                        <div v-if="item.status === 'completed'" class="absolute -left-1 top-0 bottom-0 w-1 bg-pastel-green"></div>

                        <!-- Icon -->
                        <div class="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-white border-2 border-gray-100 relative shadow-md">
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
                            
                            <!-- Reward Badge (moved inline with title or below) -->
                            <!-- User asked for Title and Description to be visible. -->
                            <!-- Description -->
                            <p class="text-gray-600 text-base font-medium leading-snug line-clamp-2">
                                {{ item.status === 'locked' ? item.hint : item.description }}
                            </p>
                            
                            <!-- Reward -->
                            <div class="mt-1 flex items-center text-xs font-bold text-pink-500">
                                <span>💖 +{{ item.reward }} Tokens</span>
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
