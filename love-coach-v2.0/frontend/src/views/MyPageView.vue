<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNpcStore } from '@/stores/npcStore'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import MainLayout from '../layouts/MainLayout.vue'
import DeleteAccountModal from '../components/DeleteAccountModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const npcStore = useNpcStore()
const showDeleteModal = ref(false)

// 크레딧 표시 (authStore에서 가져오기)
const credit = computed(() => authStore.user?.credit || 0)

// NPC 호감도 (npcStore에서 가져오기)
const affinity = computed(() => {
  const npcs = npcStore.npcs || []
  // NPC ID별 호감도 매핑 (ID 1=토마, 2=벨, 3=치이 가정)
  const tomaData = npcs.find(n => n.name?.includes('토마') || n.npcId === 1)
  const belleData = npcs.find(n => n.name?.includes('벨') || n.npcId === 2)
  const chieData = npcs.find(n => n.name?.includes('치') || n.npcId === 3)
  
  return {
    toma: tomaData?.affectionScore || 0,
    belle: belleData?.affectionScore || 0,
    chie: chieData?.affectionScore || 0
  }
})

// 애니메이션 상태
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
  if (!targetRef.value) return 
  
  let current = targetRef.value[key] || 0
  const step = Math.max(1, (finalValue - current) / 30)
  
  const interval = setInterval(() => {
    current += step
    if (current >= finalValue) {
      current = finalValue
      clearInterval(interval)
    }
    if (targetRef.value) {
        targetRef.value[key] = Math.round(current)
    }
  }, 20)
}

onMounted(async () => {
  // NPC 데이터 로드
  await npcStore.fetchNpcs()
  
  // TODO: 실제 활동 통계 데이터 로드 필요 (현재는 더미 또는 0)
  // 임시 더미 데이터 (시각적 확인용)
  const stats = {
      diet: 12,
      strength: 8,
      cardio: 5
  }

  // 통계 애니메이션
  setTimeout(() => {
      animateValue(animatedStats, 'diet', stats.diet)
      animateValue(animatedStats, 'strength', stats.strength)
      animateValue(animatedStats, 'cardio', stats.cardio)
  }, 100)

  // 호감도 애니메이션 (데이터 로드 후)
  setTimeout(() => {
    animateValue(animatedAffinity, 'toma', affinity.value.toma)
    animateValue(animatedAffinity, 'belle', affinity.value.belle)
    animateValue(animatedAffinity, 'chie', affinity.value.chie)
  }, 100)
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
  const success = await authStore.deleteAccount()
  if (success) {
    alert('탈퇴 처리가 완료되었습니다.')
    router.push('/')
  } else {
    alert('탈퇴 처리에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>

<template>
  <MainLayout>
    <div class="p-6 md:p-10 max-w-6xl mx-auto space-y-12 animate-fade-in-up">
      
      <!-- 페이지 헤더 -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="text-4xl font-bold text-soft-black mb-2">마이페이지</h1>
        <p class="text-gray-500">나의 정보를 관리하고 활동을 확인하세요!</p>
      </div>

      <!-- 헤더: 프로필 & 크레딧 -->
      <div class="flex flex-col lg:flex-row gap-8 items-center lg:items-start bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/50">
        <!-- 프로필 -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-pastel-red shadow-md bg-white">
            <img :src="CHAR_IMAGES.tomai" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">{{ authStore.user?.name || '사용자' }}</h2>
            <p class="text-gray-500 font-medium">LoveCoach Member</p>
          </div>
        </div>

        <!-- 크레딧 표시 -->
        <div class="flex-1 w-full flex flex-col items-center justify-center mt-8 lg:mt-0">
          <div class="bg-white/80 p-6 rounded-2xl shadow-sm border border-pastel-red/10 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform w-full max-w-xs">
            <span class="text-4xl">💎</span>
            <span class="font-bold text-gray-600 whitespace-nowrap text-lg">보유 크레딧</span>
            <span class="text-3xl font-bold text-pastel-red">{{ credit }}</span>
          </div>
        </div>
      </div>

      <!-- 통계 & 호감도 그리드 -->
      <div class="grid lg:grid-cols-2 gap-8">
        
        <!-- 활동 통계 (카운터) -->
        <div class="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-lg border border-white/50 space-y-6">
          <h3 class="text-xl font-bold text-gray-700 flex items-center gap-2">
            <span>📊</span> 활동 요약
          </h3>
          
          <div class="flex flex-col gap-4 text-center">
            <!-- 식단 -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-green/20 flex items-center justify-between px-6">
              <span class="text-sm font-bold text-gray-500">식단</span>
              <p class="text-2xl font-bold text-pastel-green">{{ animatedStats?.diet || 0 }}<span class="text-sm text-gray-400 ml-1">일</span></p>
            </div>

            <!-- 근력 -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-blue/20 flex items-center justify-between px-6">
              <span class="text-sm font-bold text-gray-500">근력</span>
              <p class="text-2xl font-bold text-pastel-blue">{{ animatedStats?.strength || 0 }}<span class="text-sm text-gray-400 ml-1">일</span></p>
            </div>

            <!-- 유산소 -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-yellow/20 flex items-center justify-between px-6">
              <span class="text-sm font-bold text-gray-500">유산소</span>
              <p class="text-2xl font-bold text-pastel-yellow">{{ animatedStats?.cardio || 0 }}<span class="text-sm text-gray-400 ml-1">일</span></p>
            </div>
          </div>
        </div>

        <!-- NPC 호감도 -->
        <div class="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-lg border border-white/50 space-y-6">
          <h3 class="text-xl font-bold text-gray-700 flex items-center gap-2">
            <span>💖</span> 호감도
          </h3>
          
          <div class="space-y-4">
            <!-- 토마 -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-red/20">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-pastel-red/50">
                  <img :src="CHAR_IMAGES.toma" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-gray-700">토마</span>
                    <span class="font-bold text-xl text-pastel-red">{{ animatedAffinity?.toma || 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-pastel-red h-full rounded-full transition-all duration-300" :style="{ width: `${animatedAffinity?.toma || 0}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 벨 -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-blue/20">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-pastel-blue/50">
                  <img :src="CHAR_IMAGES.belle" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-gray-700">벨</span>
                    <span class="font-bold text-xl text-pastel-blue">{{ animatedAffinity?.belle || 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-pastel-blue h-full rounded-full transition-all duration-300" :style="{ width: `${animatedAffinity?.belle || 0}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 치이 -->
            <div class="bg-white/50 p-4 rounded-2xl border border-pastel-yellow/20">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-pastel-yellow/50">
                  <img :src="CHAR_IMAGES.chie" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-gray-700">치이</span>
                    <span class="font-bold text-xl text-pastel-yellow">{{ animatedAffinity?.chie || 0 }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-pastel-yellow h-full rounded-full transition-all duration-300" :style="{ width: `${animatedAffinity?.chie || 0}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- 사용자 관리 -->
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

    <!-- 회원탈퇴 모달 -->
    <DeleteAccountModal 
      :show="showDeleteModal"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </MainLayout>
</template>
