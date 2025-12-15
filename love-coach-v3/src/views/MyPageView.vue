<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import MainLayout from '../layouts/MainLayout.vue'
import DeleteAccountModal from '../components/DeleteAccountModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const showDeleteModal = ref(false)

// Mock Data for Tokens and Stats
const tokens = ref({
  toma: 120,
  belle: 50,
  chie: 30
})

const stats = ref({
  diet: 12,
  strength: 8,
  cardio: 15
})

const affinity = ref({
  toma: 80,
  belle: 45,
  chie: 20
})

// Animation State
const animatedStats = ref({
  diet: 0,
  strength: 0,
  cardio: 0
})

const animatedAffinity = ref({
  toma: 0,
  belle: 0,
  chie: 0
})

const animateValue = (targetRef, key, finalValue) => {
  let current = 0
  const step = finalValue / 50 // 50 frames
  const interval = setInterval(() => {
    current += step
    if (current >= finalValue) {
      current = finalValue
      clearInterval(interval)
    }
    targetRef.value[key] = Math.round(current)
  }, 20)
}

onMounted(() => {
  // Animate Stats
  animateValue(animatedStats, 'diet', stats.value.diet)
  animateValue(animatedStats, 'strength', stats.value.strength)
  animateValue(animatedStats, 'cardio', stats.value.cardio)

  // Animate Affinity
  animateValue(animatedAffinity, 'toma', affinity.value.toma)
  animateValue(animatedAffinity, 'belle', affinity.value.belle)
  animateValue(animatedAffinity, 'chie', affinity.value.chie)
})

const handleEditProfile = () => {
  router.push('/mypage/edit')
}

const handleDeleteAccount = () => {
  showDeleteModal.value = true
}

const handleDeleteCancel = () => {
  showDeleteModal.value = false
}

const handleDeleteConfirm = async () => {
  showDeleteModal.value = false
  // Simulate API call
  alert('탈퇴 처리가 완료되었습니다.')
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <MainLayout>
    <div class="p-6 md:p-10 max-w-6xl mx-auto space-y-12 animate-fade-in-up">
      
      <!-- Page Header -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="text-4xl font-bold text-soft-black mb-2">마이페이지</h1>
        <p class="text-gray-500">나의 정보를 관리하고 활동을 확인하세요!</p>
      </div>

      <!-- Header: Profile & Tokens -->
      <div class="flex flex-col lg:flex-row gap-8 items-center lg:items-start bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/50">
        <!-- Profile -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-pastel-red shadow-md bg-white">
            <img :src="CHAR_IMAGES.tomai" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">{{ authStore.user?.name || '사용자' }}</h2>
            <p class="text-gray-500 font-medium">LoveCoach Member</p>
          </div>
        </div>

        <!-- Tokens -->
        <div class="flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 lg:mt-0">
          <div class="bg-white/80 p-4 rounded-2xl shadow-sm border border-pastel-red/10 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
            <span class="text-3xl">🍅</span>
            <span class="font-bold text-gray-600 whitespace-nowrap">토마 토큰</span>
            <span class="text-2xl font-bold text-pastel-red">{{ tokens.toma }}</span>
          </div>
          <div class="bg-white/80 p-4 rounded-2xl shadow-sm border border-pastel-blue/10 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
            <span class="text-3xl">💪</span>
            <span class="font-bold text-gray-600 whitespace-nowrap">벨 토큰</span>
            <span class="text-2xl font-bold text-pastel-blue">{{ tokens.belle }}</span>
          </div>
          <div class="bg-white/80 p-4 rounded-2xl shadow-sm border border-pastel-yellow/10 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
            <span class="text-3xl">🏃‍♀️</span>
            <span class="font-bold text-gray-600 whitespace-nowrap">치이 토큰</span>
            <span class="text-2xl font-bold text-pastel-yellow">{{ tokens.chie }}</span>
          </div>
        </div>
      </div>

      <!-- Stats & Affinity Grid -->
      <div class="grid lg:grid-cols-2 gap-8">
        
        <!-- Activity Stats (Counters) -->
        <div class="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-lg border border-white/50 space-y-6">
          <h3 class="text-xl font-bold text-gray-700 flex items-center gap-2">
            <span>📊</span> 활동 요약
          </h3>
          
          <div class="flex flex-col gap-4 text-center">
            <!-- Diet -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-green/20 flex items-center justify-between px-6">
              <span class="text-sm font-bold text-gray-500">식단</span>
              <p class="text-2xl font-bold text-pastel-green">{{ animatedStats.diet }}<span class="text-sm text-gray-400 ml-1">일</span></p>
            </div>

            <!-- Strength -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-blue/20 flex items-center justify-between px-6">
              <span class="text-sm font-bold text-gray-500">근력</span>
              <p class="text-2xl font-bold text-pastel-blue">{{ animatedStats.strength }}<span class="text-sm text-gray-400 ml-1">일</span></p>
            </div>

            <!-- Cardio -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-yellow/20 flex items-center justify-between px-6">
              <span class="text-sm font-bold text-gray-500">유산소</span>
              <p class="text-2xl font-bold text-pastel-yellow">{{ animatedStats.cardio }}<span class="text-sm text-gray-400 ml-1">일</span></p>
            </div>
          </div>
        </div>

        <!-- NPC Affinity -->
        <div class="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-lg border border-white/50 space-y-6">
          <h3 class="text-xl font-bold text-gray-700 flex items-center gap-2">
            <span>💖</span> 호감도
          </h3>
          
          <div class="space-y-4">
            <!-- Toma -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-red/20">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-pastel-red/50">
                  <img :src="CHAR_IMAGES.toma" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-gray-700">토마</span>
                    <span class="font-bold text-xl text-pastel-red">{{ animatedAffinity.toma }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-pastel-red h-full rounded-full transition-all duration-300" :style="{ width: `${animatedAffinity.toma}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Belle -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-blue/20">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-pastel-blue/50">
                  <img :src="CHAR_IMAGES.belle" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-gray-700">벨</span>
                    <span class="font-bold text-xl text-pastel-blue">{{ animatedAffinity.belle }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-pastel-blue h-full rounded-full transition-all duration-300" :style="{ width: `${animatedAffinity.belle}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chie -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-yellow/20">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-pastel-yellow/50">
                  <img :src="CHAR_IMAGES.chie" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-gray-700">치이</span>
                    <span class="font-bold text-xl text-pastel-yellow">{{ animatedAffinity.chie }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-pastel-yellow h-full rounded-full transition-all duration-300" :style="{ width: `${animatedAffinity.chie}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- User Management -->
      <div class="flex justify-end gap-4 pt-8 border-t border-gray-200">
        <button 
          @click="handleEditProfile"
          class="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          회원정보 수정
        </button>
        <button 
          @click="handleDeleteAccount"
          class="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors"
        >
          회원탈퇴
        </button>
      </div>

    </div>

    <!-- Delete Account Modal -->
    <DeleteAccountModal 
      :show="showDeleteModal"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </MainLayout>
</template>
