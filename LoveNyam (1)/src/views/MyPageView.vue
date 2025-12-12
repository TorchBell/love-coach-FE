<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { UI_IMAGES } from '@/assets/dummy/index.js'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Fallback data if user is not loaded
const defaultUser = {
  name: 'Guest',
  avatar: UI_IMAGES.defaultAvatar,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  joinDate: '-',
  streakDays: 0,
  healthData: {
    currentWeight: 0,
    goalWeight: 0,
    height: 0,
    age: 0,
    gender: '-'
  },
  stats: {
    totalWorkouts: 0,
    totalMeals: 0,
    totalRuns: 0,
    achievementsEarned: 0,
    totalAchievements: 0
  }
}

const userData = computed(() => user.value || defaultUser)
const healthData = computed(() => userData.value.healthData || defaultUser.healthData)
const stats = computed(() => userData.value.stats || defaultUser.stats)

// Calculated BMI
const bmi = computed(() => {
  const heightInMeters = healthData.value.height / 100
  if (heightInMeters === 0) return 0
  return (healthData.value.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
})

const bmiCategory = computed(() => {
  const value = parseFloat(bmi.value)
  if (value === 0) return { text: '-', color: 'text-gray-500' }
  if (value < 18.5) return { text: '저체중', color: 'text-blue-500' }
  if (value < 25) return { text: '정상', color: 'text-green-500' }
  if (value < 30) return { text: '과체중', color: 'text-yellow-500' }
  return { text: '비만', color: 'text-red-500' }
})

// Progress percentage
const progressToGoal = computed(() => {
  if (healthData.value.currentWeight === 0) return 0
  const progress = Math.abs(healthData.value.currentWeight - healthData.value.goalWeight)
  const total = Math.abs(70.5 - healthData.value.goalWeight) // Mock initial weight
  return Math.max(0, Math.min(100, ((total - progress) / total) * 100)).toFixed(0)
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.login({ username: 'ssafy', password: '1234' })
  }
})
</script>

<template>
  <MainLayout>
    <template #default>
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-soft-black mb-4">마이 페이지</h1>
        <p class="text-lg text-gray-500">나의 진행 상황과 계정을 관리하세요</p>
      </div>

      <!-- Profile Card -->
      <div class="bg-gradient-to-r from-pastel-red/10 to-pastel-blue/10 rounded-3xl p-8 mb-8 border-2 border-gray-100 shadow-soft">
        <div class="flex items-center gap-6 mb-6">
          <!-- Avatar -->
          <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-pastel-red shadow-lg">
            <img :src="userData.avatar" :alt="userData.name" class="w-full h-full object-cover" />
          </div>
          <!-- User Info -->
          <div class="flex-1">
            <h2 class="text-3xl font-bold text-soft-black mb-2">{{ userData.name }}</h2>
            <div class="flex items-center gap-4">
              <span class="px-3 py-1 bg-pastel-red/20 rounded-full text-sm font-semibold text-pastel-red">레벨 {{ userData.level }}</span>
              <span class="text-gray-500 text-sm">가입일: {{ userData.joinDate }}</span>
            </div>
          </div>
          <!-- Streak Badge -->
          <div class="bg-white rounded-2xl px-6 py-4 shadow-md text-center">
            <p class="text-4xl font-bold text-pastel-red">{{ userData.streakDays }}</p>
            <p class="text-xs text-gray-500 font-semibold">일 연속 🔥</p>
          </div>
        </div>

        <!-- XP Progress -->
        <div class="bg-white/80 rounded-xl p-4">
          <div class="flex justify-between text-sm font-semibold text-gray-700 mb-2">
            <span>경험치</span>
            <span class="text-pastel-red">{{ userData.xp }} / {{ userData.nextLevelXp }} XP</span>
          </div>
          <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-pastel-red to-pastel-yellow rounded-full transition-all duration-700"
              :style="{ width: `${(userData.xp / userData.nextLevelXp) * 100}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">레벨 {{ userData.level + 1 }}까지 {{ Math.round((userData.xp / userData.nextLevelXp) * 100) }}% 남음</p>
        </div>
      </div>

      <!-- Health Stats Dashboard -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <!-- Weight Progress -->
        <div class="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-soft">
          <h3 class="text-xl font-bold text-soft-black mb-4 flex items-center gap-2">
            <span>⚖️</span> 체중 변화
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500">현재</p>
                <p class="text-3xl font-bold text-pastel-blue">{{ healthData.currentWeight }} kg</p>
              </div>
              <div class="text-4xl">→</div>
              <div>
                <p class="text-sm text-gray-500">목표</p>
                <p class="text-3xl font-bold text-pastel-red">{{ healthData.goalWeight }} kg</p>
              </div>
            </div>
            <!-- Progress Bar -->
            <div>
              <div class="flex justify-between text-xs text-gray-600 mb-1">
                <span>목표 달성률</span>
                <span class="font-bold text-pastel-red">{{ progressToGoal }}%</span>
              </div>
              <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-pastel-blue to-pastel-red rounded-full transition-all duration-700"
                  :style="{ width: `${progressToGoal}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- BMI Calculator -->
        <div class="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-soft">
          <h3 class="text-xl font-bold text-soft-black mb-4 flex items-center gap-2">
            <span>📊</span> BMI 상태
          </h3>
          <div class="text-center mb-4">
            <p class="text-6xl font-bold text-pastel-yellow mb-2">{{ bmi }}</p>
            <p class="text-lg font-semibold" :class="bmiCategory.color">
              {{ bmiCategory.text }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-gray-50 rounded-lg p-2">
              <p class="text-gray-500">키</p>
              <p class="font-bold">{{ healthData.height }} cm</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-2">
              <p class="text-gray-500">나이</p>
              <p class="font-bold">{{ healthData.age }} 세</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-soft mb-8">
        <h3 class="text-xl font-bold text-soft-black mb-6 flex items-center gap-2">
          <span>🎯</span> 활동 요약
        </h3>
        <div class="grid grid-cols-4 gap-6">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-pastel-red/20 flex items-center justify-center">
              <span class="text-3xl">💪</span>
            </div>
            <p class="text-2xl font-bold text-soft-black mb-1">{{ stats.totalWorkouts }}</p>
            <p class="text-sm text-gray-500">운동 횟수</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-pastel-yellow/20 flex items-center justify-center">
              <span class="text-3xl">🍽️</span>
            </div>
            <p class="text-2xl font-bold text-soft-black mb-1">{{ stats.totalMeals }}</p>
            <p class="text-sm text-gray-500">식단 기록</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-pastel-blue/20 flex items-center justify-center">
              <span class="text-3xl">🏃</span>
            </div>
            <p class="text-2xl font-bold text-soft-black mb-1">{{ stats.totalRuns }}</p>
            <p class="text-sm text-gray-500">러닝 횟수</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-pastel-red/20 to-pastel-yellow/20 flex items-center justify-center">
              <span class="text-3xl">🏆</span>
            </div>
            <p class="text-2xl font-bold text-soft-black mb-1">{{ stats.achievementsEarned }}/{{ stats.totalAchievements }}</p>
            <p class="text-sm text-gray-500">달성 업적</p>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-soft">
        <h3 class="text-xl font-bold text-soft-black mb-6 flex items-center gap-2">
          <span>⚙️</span> 계정 설정
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <button class="py-4 px-6 bg-gradient-to-r from-pastel-red to-pastel-yellow text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            ✏️ 프로필 수정
          </button>
          <button class="py-4 px-6 bg-gradient-to-r from-pastel-blue to-pastel-red text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            🔒 비밀번호 변경
          </button>
          <button class="py-4 px-6 bg-gradient-to-r from-pastel-yellow to-pastel-blue text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            📊 건강 정보 업데이트
          </button>
          <button class="py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl hover:shadow-md transition-all duration-300">
            🗑️ 회원 탈퇴
          </button>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped>
</style>
