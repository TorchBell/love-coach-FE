<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
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

// --- 스토어에서 계산된 업적 ---
const characterAchievements = computed(() => {
  const all = achievementStore.achievements || []
  
  // 업적 속성에 따른 분류 (타입 또는 키워드 가정)
  const tomaItems = all.filter(a => a.type === 'DIET' || a.name?.includes('식단') || a.description?.includes('식단') || a.achievementId < 10)
  const belleItems = all.filter(a => a.type === 'WORKOUT' || a.name?.includes('근력') || a.description?.includes('근력') || (a.achievementId >= 10 && a.achievementId < 20))
  const chieItems = all.filter(a => a.type === 'RUNNING' || a.name?.includes('러닝') || a.achievementId >= 20)

  const mapItem = (item) => ({
    id: item.achievementId,
    title: item.name,
    description: item.description,
    status: item.isAchieved ? 'completed' : (item.progress > 0 ? 'progress' : 'locked'),
    imageKey: item.isAchieved ? (item.imagePath || 'toma') : 'toma', // 대체 또는 매핑 필요
    reward: item.rewardToken || 0,
    progress: item.progress || 0,
    total: item.goal || 100, // 목표값 누락 시 기본값
    unit: '', // 백엔드에서 단위를 제공하지 않을 수 있음, 추론하거나 생략
    hint: item.description // 현재는 설명을 힌트로 사용
  })

  return {
    toma: {
      id: 'toma',
      name: '토마 (식단)',
      color: 'text-pastel-red',
      bgColor: 'bg-pastel-red',
      fillColor: 'rgba(255, 107, 107, 0.2)',
      total: tomaItems.length,
      completed: tomaItems.filter(i => i.isAchieved).length,
      items: tomaItems.map(mapItem)
    },
    belle: {
      id: 'belle',
      name: '벨 (근력)',
      color: 'text-pastel-blue',
      bgColor: 'bg-pastel-blue',
      fillColor: 'rgba(100, 149, 237, 0.2)',
      total: belleItems.length,
      completed: belleItems.filter(i => i.isAchieved).length,
      items: belleItems.map(mapItem)
    },
    chie: {
      id: 'chie',
      name: '치이 (유산소)',
      color: 'text-pastel-yellow',
      bgColor: 'bg-pastel-yellow',
      fillColor: 'rgba(253, 253, 150, 0.3)',
      total: chieItems.length,
      completed: chieItems.filter(i => i.isAchieved).length,
      items: chieItems.map(mapItem)
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
  <MainLayout>
    <!-- 페이지 헤더 -->
    <div class="text-center mb-8 animate-fade-in-up">
      <h1 class="text-4xl font-bold text-soft-black mb-2">업적 갤러리</h1>
      <p class="text-gray-500">나의 성장을 확인하고 호감도를 높여보세요!</p>
    </div>

    <div class="max-w-5xl mx-auto px-4">
      <!-- 가로형 캐릭터 탭 (상단) -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="relative overflow-hidden rounded-2xl p-2 md:p-4 transition-all duration-300 border-2 flex items-center justify-center gap-3"
          :class="activeTab === tab.id 
            ? 'bg-white shadow-lg scale-105 border-pastel-red' 
            : 'bg-white/60 border-transparent hover:bg-white hover:shadow-md'"
        >
          <!-- 캐릭터 아바타 -->
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 flex-shrink-0"
               :class="activeTab === tab.id ? 'border-pastel-red' : 'border-gray-200'">
            <img :src="tab.image" class="w-full h-full object-cover" />
          </div>
          
          <!-- 탭 정보 (작은 화면에서는 숨김) -->
          <div class="text-left flex-1 min-w-0 hidden lg:block">
            <h3 class="font-bold text-sm text-gray-800 truncate">{{ tab.name }}</h3>
            <p class="text-xs text-gray-400 truncate">{{ tab.description }}</p>
          </div>
          
          <!-- 아이콘 (활성 상태일 때만 표시 - 아주 작은 화면에서는 숨김 처리될 수 있음) -->
          <span v-if="activeTab === tab.id" class="text-xl flex-shrink-0 hidden sm:block">{{ tab.icon }}</span>
        </button>
      </div>

      <!-- 업적 콘텐츠 카드 -->
      <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
        
        <!-- 헤더 정보 -->
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 class="text-2xl font-bold" :class="characterAchievements[activeTab].color">
              {{ characterAchievements[activeTab].name }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <div class="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000"
                  :class="characterAchievements[activeTab].bgColor"
                  :style="{ width: `${(characterAchievements[activeTab].completed / characterAchievements[activeTab].total) * 100}%` }"
                ></div>
              </div>
              <p class="text-gray-500 text-sm">
                <span class="font-bold text-gray-800">{{ characterAchievements[activeTab].completed }}</span> / {{ characterAchievements[activeTab].total }}
              </p>
            </div>
          </div>
          <div class="text-4xl opacity-30">
            {{ activeTab === 'toma' ? '🍅' : activeTab === 'belle' ? '💪' : '🏃‍♀️' }}
          </div>
        </div>

        <!-- 업적 목록 (가독성을 위한 단일 컬럼) -->
        <div class="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide px-2 pt-2 pb-4 -mr-2 md:-mr-4 pr-2 md:pr-4">
          <div 
            v-for="item in characterAchievements[activeTab].items" 
            :key="item.id"
            class="bg-gray-50 rounded-xl p-4 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md flex gap-4 items-start group"
            :class="item.status === 'completed' ? 'ring-1 ring-pastel-green/30' : 'opacity-80'"
          >
            <!-- 이미지 -->
            <div class="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white relative border border-gray-200 shadow-sm">
              <img 
                v-if="item.status === 'completed'"
                :src="getAchievementImage(item.imageKey)" 
                class="w-full h-full object-cover"
              />
              <img 
                v-else-if="item.status === 'progress'"
                :src="getAchievementImage(item.imageKey)" 
                class="w-full h-full object-cover grayscale opacity-50"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-2xl text-gray-300">
                🔒
              </div>
              
              <!-- 완료 뱃지 -->
              <div v-if="item.status === 'completed'" class="absolute bottom-0 right-0 bg-pastel-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                ✓
              </div>
            </div>

            <!-- 내용 -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start gap-2 mb-1">
                <h3 class="font-bold text-gray-800">{{ item.title }}</h3>
                <div class="flex items-center gap-1 bg-pink-50 text-pink-500 px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 border border-pink-100">
                  <span>❤️</span>
                  <span>+{{ item.reward }}</span>
                </div>
              </div>
              
              <p class="text-sm text-gray-600 mb-2">
                {{ item.status === 'locked' ? item.hint : item.description }}
              </p>

              <!-- 텍스트가 포함된 진행률 바 (향상됨) -->
              <div v-if="item.status === 'progress'" class="mt-2">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs text-gray-500">진행 상황</span>
                  <span class="text-xs font-bold text-gray-700">
                    {{ item.progress }}{{ item.unit || '' }} / {{ item.total }}{{ item.unit || '' }}
                  </span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-pastel-yellow to-pastel-red rounded-full transition-all duration-500" 
                    :style="{ width: `${(item.progress / item.total) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- 상태 뱃지 -->
              <div v-if="item.status === 'completed'" class="mt-2">
                <span class="inline-flex items-center gap-1 text-xs font-bold text-pastel-green bg-pastel-green/10 px-2 py-1 rounded-full">
                  ✓ 완료됨
                </span>
              </div>
            </div>
          </div>
        </div>

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
