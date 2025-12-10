<script setup>
import { ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'

// Achievement Categories
const categories = ref([
  { id: 'unlocked', name: '달성 완료', icon: '🏆', count: 5 },
  { id: 'progress', name: '진행 중', icon: '⏳', count: 3 },
  { id: 'locked', name: '미달성', icon: '🔒', count: 12 }
])

const activeCategory = ref('unlocked')

// Achievement data (mock)
const achievements = ref({
  unlocked: [
    {
      id: 1,
      title: '첫 걸음',
      description: '첫 운동 완료하기',
      icon: '🎯',
      reward: '+50 XP',
      unlockedDate: '2024-01-15',
      // USER_TODO: Replace with achievement_1.png
      image: new URL('@/assets/images/toma.png', import.meta.url).href
    },
    {
      id: 2,
      title: '식단 기록가',
      description: '7일 연속 식단 기록하기',
      icon: '🍽️',
      reward: '+100 XP',
      unlockedDate: '2024-01-12',
      // USER_TODO: Replace with achievement_2.png
      image: new URL('@/assets/images/gallery_diet.png', import.meta.url).href
    },
    {
      id: 3,
      title: '얼리 버드',
      description: '아침 운동 완료하기',
      icon: '🌅',
      reward: '+75 XP',
      unlockedDate: '2024-01-10',
      // USER_TODO: Replace with achievement_3.png
      image: new URL('@/assets/images/belle.png', import.meta.url).href
    },
    {
      id: 4,
      title: '수분 충전',
      description: '하루 물 8잔 마시기',
      icon: '💧',
      reward: '+50 XP',
      unlockedDate: '2024-01-08',
      // USER_TODO: Replace with achievement_4.png
      image: new URL('@/assets/images/gallery_diet.png', import.meta.url).href
    },
    {
      id: 5,
      title: '마라토너',
      description: '총 42km 러닝 달성',
      icon: '🏃',
      reward: '+200 XP',
      unlockedDate: '2024-01-05',
      // USER_TODO: Replace with achievement_5.png
      image: new URL('@/assets/images/chie.png', import.meta.url).href
    }
  ],
  progress: [
    {
      id: 6,
      title: '근력왕',
      description: '근력 운동 50회 완료하기',
      icon: '💪',
      progress: 32,
      total: 50,
      // USER_TODO: Replace with progress_1.png
      image: new URL('@/assets/images/belle.png', import.meta.url).href
    },
    {
      id: 7,
      title: '다이어터',
      description: '5kg 감량하기',
      icon: '⚖️',
      progress: 3.2,
      total: 5,
      // USER_TODO: Replace with progress_2.png
      image: new URL('@/assets/images/toma.png', import.meta.url).href
    },
    {
      id: 8,
      title: '꾸준함의 미학',
      description: '30일 연속 접속하기',
      icon: '🔥',
      progress: 18,
      total: 30,
      // USER_TODO: Replace with progress_3.png
      image: new URL('@/assets/images/chie.png', import.meta.url).href
    }
  ],
  locked: [
    {
      id: 9,
      title: '???',
      hint: '운동 100회 완료 시 잠금 해제',
      icon: '❓'
    },
    {
      id: 10,
      title: '???',
      hint: '목표 체중 달성 시 잠금 해제',
      icon: '❓'
    },
    // ... more locked items
  ]
})
</script>

<template>
  <MainLayout>
    <template #default>
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-soft-black mb-4">나의 업적</h1>
        <p class="text-lg text-gray-500">도전을 완료하고 보상을 획득하세요!</p>
      </div>

      <!-- Category Tabs -->
      <div class="flex gap-4 mb-10">
        <button
          v-for="category in categories"
          :key="category.id"
          class="flex-1 py-4 px-6 rounded-2xl font-bold transition-all duration-300 border-2"
          :class="activeCategory === category.id 
            ? 'bg-gradient-to-r from-pastel-red to-pastel-yellow text-white border-transparent shadow-lg transform scale-105' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-pastel-red/50 hover:shadow-md'"
          @click="activeCategory = category.id"
        >
          <div class="flex items-center justify-center gap-3">
            <span class="text-2xl">{{ category.icon }}</span>
            <div class="text-left">
              <p class="text-sm">{{ category.name }}</p>
              <p class="text-xs opacity-75">({{ category.count }})</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Achievement Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Unlocked Achievements -->
        <template v-if="activeCategory === 'unlocked'">
          <div
            v-for="achievement in achievements.unlocked"
            :key="achievement.id"
            class="achievement-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-pastel-red/30 group"
          >
            <!-- Image -->
            <div class="h-48 overflow-hidden bg-gradient-to-br from-pastel-red/20 to-pastel-yellow/20 relative">
              <img 
                :src="achievement.image" 
                :alt="achievement.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <!-- Content -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-soft-black mb-2">{{ achievement.title }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ achievement.description }}</p>
              <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                <span class="text-xs text-pastel-red font-semibold">{{ achievement.reward }}</span>
                <span class="text-xs text-gray-400">{{ achievement.unlockedDate }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- In Progress Achievements -->
        <template v-if="activeCategory === 'progress'">
          <div
            v-for="achievement in achievements.progress"
            :key="achievement.id"
            class="achievement-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-pastel-yellow/30"
          >
            <!-- Image (desaturated) -->
            <div class="h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
              <img 
                :src="achievement.image" 
                :alt="achievement.title"
                class="w-full h-full object-cover opacity-60"
              />
            </div>
            <!-- Content -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-soft-black mb-2">{{ achievement.title }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ achievement.description }}</p>
              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>달성도</span>
                  <span class="font-bold text-pastel-yellow">{{ Math.round((achievement.progress / achievement.total) * 100) }}%</span>
                </div>
                <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-pastel-yellow to-pastel-red rounded-full transition-all duration-500"
                    :style="{ width: `${(achievement.progress / achievement.total) * 100}%` }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ achievement.progress }} / {{ achievement.total }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Locked Achievements -->
        <template v-if="activeCategory === 'locked'">
          <div
            v-for="achievement in achievements.locked"
            :key="achievement.id"
            class="achievement-card bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-300 group cursor-help"
            :title="achievement.hint"
          >
            <!-- Locked Image -->
            <div class="h-48 flex items-center justify-center bg-gray-300 relative">
              <div class="text-8xl opacity-30">🔒</div>
            </div>
            <!-- Content -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-gray-400 mb-2">{{ achievement.title }}</h3>
              <div class="text-xs text-gray-500 italic bg-gray-200 rounded-lg p-3 group-hover:bg-white group-hover:text-gray-700 transition-colors">
                <span class="font-semibold">힌트:</span> {{ achievement.hint }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
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
