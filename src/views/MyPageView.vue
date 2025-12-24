<script setup>
import { ref, onMounted, computed } from 'vue'
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

const activeTab = ref('activity')
const isSummaryView = ref(false) // 타임라인 vs 요약 보기 토글
const isLoading = ref(false)
const isSaving = ref(false)

// === 1. 프로필 수정 상태 ===
const editForm = ref({
    email: '',
    nickname: '',
    gender: 'M',
    birthDate: ''
})

// === 2. 알림 설정 상태 ===
const notifications = ref({
    push: true,
    email: false
})

// === 3. 앱 설정 상태 ===
const appSettings = ref({
    loadingScreen: true,
    completionAnim: true
})

// 메뉴 목록
const menuItems = [
    { id: 'activity', label: '내 활동', icon: '📊' },
    { id: 'edit', label: '개인 정보 수정', icon: '✏️' },
    { id: 'notification', label: '알림', icon: '🔔' },
    { id: 'help', label: '도움말', icon: '❓' },
    { id: 'settings', label: '설정', icon: '⚙️' },
    { id: 'info', label: '정보', icon: 'ℹ️' },
]

// 크레딧 표시
const credit = computed(() => authStore.user?.credit || 0)

// NPC 호감도 계산
const affinity = computed(() => {
  const npcs = npcStore.npcs || []
  const tomaData = npcs.find(n => n.name?.includes('토마') || n.npcId === 1)
  const belleData = npcs.find(n => n.name?.includes('벨') || n.npcId === 2)
  const chieData = npcs.find(n => n.name?.includes('치') || n.npcId === 3)
  
  return {
    toma: tomaData?.affectionScore || 0,
    belle: belleData?.affectionScore || 0,
    chie: chieData?.affectionScore || 0
  }
})

// === Mock Data for Timeline ===
const mockActivities = ref([
    {
        date: '2024년 5월 20일',
        items: [
            { type: 'achievement', title: '설레는 첫 만남', description: '토마와 첫 식단 상담을 완료했어요!', image: CHAR_IMAGES.toma },
        ]
    },
    {
        date: '2024년 5월 22일',
        items: [
            { type: 'achievement', title: '작심삼일 탈출', description: '3일 연속 기록 달성!', image: null },
            { type: 'gallery', title: '벨의 응원', description: '벨의 특별한 응원 메시지 카드를 획득했어요.', image: CHAR_IMAGES.belle }
        ]
    },
    {
        date: '2024년 5월 25일',
        items: [
            { type: 'achievement', title: '유산소 마스터 I', description: '유산소 운동 누적 5시간 달성', image: null }
        ]
    }
])

// === Mock Data for Summary Stats ===
const summaryStats = ref({
    totalAchievements: 12,
    totalGalleries: 5,
    dietLogs: 45,
    workoutLogs: 32,
    cardioLogs: 28,
    mostViewedGallery: '토마의 미소',
    mostViewedChar: 'toma'
})

onMounted(async () => {
    await npcStore.fetchNpcs()
    // 초기 폼 데이터 설정
    if (authStore.user) {
        editForm.value.email = authStore.user.email || ''
        editForm.value.nickname = authStore.user.name || ''
        editForm.value.gender = authStore.user.gender || 'M'
        editForm.value.birthDate = authStore.user.birthdate || '' // Note: store uses 'birthdate' (lowercase d) based on profile header code
    }
})

const toggleSummary = () => {
    isSummaryView.value = !isSummaryView.value
}

// 프로필 저장 핸들러
const handleSaveProfile = async () => {
  if (!editForm.value.nickname) {
    alert('닉네임을 입력해주세요.')
    return
  }

  isSaving.value = true
  
  try {
    const success = await authStore.updateProfile({
        name: editForm.value.nickname,
        gender: editForm.value.gender,
        birthDate: editForm.value.birthDate
    })
    
    if (success) {
        alert('회원정보가 안전하게 저장되었습니다! ✨')
    } else {
        alert('저장에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
      console.error(error)
      alert('오류가 발생했습니다.')
  } finally {
      isSaving.value = false
  }
}

const handleDeleteAccount = () => { showDeleteModal.value = true }
const handleDeleteCancel = () => { showDeleteModal.value = false }
const handleDeleteConfirm = async () => {
  showDeleteModal.value = false
  const success = await authStore.deleteAccount()
  if (success) {
    alert('탈퇴 처리가 완료되었습니다.')
    router.push('/')
  }
}
</script>

<template>
  <MainLayout :is-full-width="true" :hide-sidebar="true">
    <div class="flex h-full w-full bg-white overflow-hidden">
      
      <!-- LEFT: Dynamic Content Area -->
      <div class="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div class="max-w-4xl mx-auto h-full flex flex-col">
            
            <!-- Header for Content -->
            <div class="mb-10 flex justify-between items-end border-b border-gray-100 pb-6">
                <div>
                    <h1 class="text-3xl font-black text-gray-800 flex items-center gap-2">
                        <span class="text-4xl filter drop-shadow-sm">{{ menuItems.find(i => i.id === activeTab)?.icon }}</span>
                        {{ isSummaryView ? '활동 요약' : menuItems.find(i => i.id === activeTab)?.label }}
                    </h1>
                    <p class="text-gray-600 mt-2 ml-1 font-medium">
                        {{ isSummaryView ? '나의 모든 기록을 한눈에 확인해보세요.' : '나의 여정을 시간 순으로 확인해보세요.' }}
                    </p>
                </div>
                
                <!-- Summary Toggle Button (Heart) -->
                <button 
                    v-if="activeTab === 'activity'"
                    @click="toggleSummary"
                    class="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                    :class="isSummaryView ? 'bg-pastel-red shadow-lg shadow-pastel-red/30' : 'bg-gray-100 hover:bg-red-50'"
                >
                    <span class="text-2xl transition-transform duration-300 group-hover:scale-110" :class="isSummaryView ? 'text-white' : 'text-gray-400 group-hover:text-pastel-red'">
                        {{ isSummaryView ? '📋' : '❤️' }}
                    </span>
                    <span class="absolute -bottom-8 text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {{ isSummaryView ? '로그 보기' : '요약 보기' }}
                    </span>
                </button>
            </div>

            <!-- TAB CONTENT -->
            <div class="flex-1 pb-20">
                
                <!-- 1. 내 활동 (My Activity) -->
                <div v-if="activeTab === 'activity'">
                    
                    <!-- SUMMARY VIEW -->
                    <div v-if="isSummaryView" class="space-y-8 animate-fade-in-up">
                        <!-- Top Row: Counts -->
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div class="bg-gray-50 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100">
                                <span class="text-3xl">🏆</span>
                                <span class="text-sm text-gray-500 font-bold">완료 업적</span>
                                <span class="text-2xl font-black text-gray-800">{{ summaryStats.totalAchievements }}</span>
                            </div>
                            <div class="bg-gray-50 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100">
                                <span class="text-3xl">🖼️</span>
                                <span class="text-sm text-gray-500 font-bold">수집 갤러리</span>
                                <span class="text-2xl font-black text-gray-800">{{ summaryStats.totalGalleries }}</span>
                            </div>
                            <div class="bg-gray-50 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100 col-span-2 lg:col-span-2">
                                <span class="text-3xl">💕</span>
                                <span class="text-sm text-gray-500 font-bold">최애 갤러리</span>
                                <span class="text-xl font-black text-pastel-red truncate max-w-full px-2">{{ summaryStats.mostViewedGallery }}</span>
                            </div>
                        </div>

                        <!-- Middle Row: Logs -->
                        <div class="grid grid-cols-3 gap-4">
                            <div class="bg-pastel-green/10 p-4 rounded-2xl text-center border border-pastel-green/20">
                                <span class="block text-2xl mb-1">🥗</span>
                                <p class="text-xs font-bold text-gray-500 mb-1">식단</p>
                                <p class="text-xl font-black text-gray-800">{{ summaryStats.dietLogs }}회</p>
                            </div>
                            <div class="bg-pastel-blue/10 p-4 rounded-2xl text-center border border-pastel-blue/20">
                                <span class="block text-2xl mb-1">💪</span>
                                <p class="text-xs font-bold text-gray-500 mb-1">근력</p>
                                <p class="text-xl font-black text-gray-800">{{ summaryStats.workoutLogs }}회</p>
                            </div>
                            <div class="bg-pastel-yellow/10 p-4 rounded-2xl text-center border border-pastel-yellow/20">
                                <span class="block text-2xl mb-1">🏃‍♀️</span>
                                <p class="text-xs font-bold text-gray-500 mb-1">유산소</p>
                                <p class="text-xl font-black text-gray-800">{{ summaryStats.cardioLogs }}회</p>
                            </div>
                        </div>

                        <!-- Bottom Row: Affinity -->
                        <div class="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                            <h3 class="font-bold text-gray-700 mb-6 flex items-center gap-2">
                                <span class="text-red-500">❤️</span> 호감도 현황
                            </h3>
                            <div class="space-y-6">
                                <div v-for="(score, char) in affinity" :key="char" class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full overflow-hidden border-2 bg-gray-50"
                                         :class="char === 'toma' ? 'border-pastel-red' : char === 'belle' ? 'border-pastel-blue' : 'border-pastel-yellow'">
                                        <img :src="CHAR_IMAGES[char]" class="w-full h-full object-cover" />
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-bold text-gray-600 capitalize text-sm">{{ char }}</span>
                                            <span class="font-bold text-lg" :class="char === 'toma' ? 'text-pastel-red' : char === 'belle' ? 'text-pastel-blue' : 'text-pastel-yellow'">
                                                {{ score }}%
                                            </span>
                                        </div>
                                        <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div class="h-full rounded-full transition-all duration-500"
                                                 :class="char === 'toma' ? 'bg-pastel-red' : char === 'belle' ? 'bg-pastel-blue' : 'bg-pastel-yellow'"
                                                 :style="{ width: `${score}%` }"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TIMELINE VIEW -->
                    <div v-else class="space-y-12 pl-4">
                        <div v-for="(group, index) in mockActivities" :key="index" class="relative border-l-2 border-gray-200 pl-8 pb-4 last:border-l-0">
                            <!-- Date Marker -->
                            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-pastel-red border-2 border-white shadow-sm z-10"></div>
                            <h3 class="text-lg font-bold text-gray-500 mb-6 -mt-1.5">{{ group.date }}</h3>

                            <!-- Items -->
                            <div class="space-y-6">
                                <div v-for="(item, i) in group.items" :key="i" 
                                     class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                    <div class="flex flex-col md:flex-row gap-6">
                                        <!-- Optional Image -->
                                        <div v-if="item.image" class="w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 relative">
                                            <img :src="item.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>

                                        <!-- Content -->
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">{{ item.type }}</span>
                                                <h4 class="text-lg font-bold text-gray-800">{{ item.title }}</h4>
                                            </div>
                                            <p class="text-gray-600 text-sm leading-relaxed">{{ item.description }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Timeline End -->
                        <div class="relative pl-8 pt-4 filter grayscale opacity-50">
                            <div class="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-gray-300"></div>
                            <p class="text-sm text-gray-400">새로운 여정이 시작되었습니다...</p>
                        </div>
                    </div>
                </div>

                <!-- 2. 개인 정보 수정 (Edit Profile) -->
                <div v-else-if="activeTab === 'edit'" class="h-full">
                    <div class="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-lg border border-gray-100 max-w-2xl mx-auto">
                        <div class="text-center mb-8">
                            <span class="text-5xl mb-4 block filter drop-shadow-sm">✏️</span>
                            <h2 class="text-2xl font-black text-gray-800 mb-2">프로필 수정</h2>
                            <p class="text-gray-500">나만의 멋진 모습을 꾸며보세요!</p>
                        </div>

                        <div class="space-y-6">
                            <!-- Email -->
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">이메일 (변경 불가)</label>
                                <input 
                                    v-model="editForm.email" 
                                    type="email" 
                                    disabled
                                    class="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-2 border-gray-100 font-bold text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            <!-- Nickname -->
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">닉네임</label>
                                <input 
                                    v-model="editForm.nickname" 
                                    type="text" 
                                    class="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:ring-4 focus:ring-pastel-red/10 focus:outline-none transition-all font-bold text-gray-700 placeholder-gray-300"
                                    placeholder="닉네임을 입력하세요"
                                />
                            </div>

                            <!-- Gender -->
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">성별</label>
                                <div class="flex gap-3">
                                    <label class="flex-1 cursor-pointer">
                                        <input v-model="editForm.gender" type="radio" value="M" name="gender" class="peer sr-only" />
                                        <div class="py-3 text-center rounded-xl border-2 border-gray-200 bg-white peer-checked:bg-pastel-blue peer-checked:text-white peer-checked:border-pastel-blue transition-all font-bold text-gray-600 hover:border-pastel-blue/50">
                                            Male
                                        </div>
                                    </label>
                                    <label class="flex-1 cursor-pointer">
                                        <input v-model="editForm.gender" type="radio" value="F" name="gender" class="peer sr-only" />
                                        <div class="py-3 text-center rounded-xl border-2 border-gray-200 bg-white peer-checked:bg-pastel-red peer-checked:text-white peer-checked:border-pastel-red transition-all font-bold text-gray-600 hover:border-pastel-red/50">
                                            Female
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Birth Date -->
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">생년월일</label>
                                <input 
                                    v-model="editForm.birthDate" 
                                    type="date" 
                                    class="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:ring-4 focus:ring-pastel-red/10 focus:outline-none transition-all font-bold text-gray-700"
                                />
                            </div>

                            <!-- Save Button -->
                            <button 
                                @click="handleSaveProfile" 
                                :disabled="isSaving"
                                class="w-full mt-4 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {{ isSaving ? '저장 중...' : '변경사항 저장하기' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 3. 알림 (Notification) -->
                <div v-else-if="activeTab === 'notification'" class="h-full">
                    <div class="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 max-w-2xl mx-auto">
                        <h2 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <span class="text-3xl">🔔</span> 알림 설정
                        </h2>
                        
                        <div class="space-y-6">
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <h3 class="font-bold text-gray-800">앱 푸시 알림</h3>
                                    <p class="text-xs text-gray-500 mt-1">러브코치의 소식을 가장 먼저 받아보세요.</p>
                                </div>
                                <button 
                                    @click="notifications.push = !notifications.push"
                                    class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                                    :class="notifications.push ? 'bg-pastel-red' : 'bg-gray-300'"
                                >
                                    <span 
                                        class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                        :class="notifications.push ? 'translate-x-6' : 'translate-x-0'"
                                    ></span>
                                </button>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <h3 class="font-bold text-gray-800">이메일 알림</h3>
                                    <p class="text-xs text-gray-500 mt-1">주요 업데이트 내용을 메일로 보내드립니다.</p>
                                </div>
                                <button 
                                    @click="notifications.email = !notifications.email"
                                    class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                                    :class="notifications.email ? 'bg-pastel-red' : 'bg-gray-300'"
                                >
                                    <span 
                                        class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                        :class="notifications.email ? 'translate-x-6' : 'translate-x-0'"
                                    ></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. 도움말 (Help) -->
                <div v-else-if="activeTab === 'help'" class="h-full">
                    <div class="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-lg border border-gray-100 max-w-4xl mx-auto prose prose-gray prose-lg overflow-y-auto custom-scrollbar" style="max-height: 800px;">
                        <!-- Header -->
                        <div class="border-b-2 border-gray-100 pb-8 mb-10">
                            <span class="text-6xl mb-4 block">📘</span>
                            <h1 class="text-4xl font-black text-gray-800 m-0 mb-2">Love Coach 사용자 가이드</h1>
                            <p class="text-xl text-gray-500 font-bold m-0">건강한 라이프스타일을 위한 완벽한 매뉴얼</p>
                        </div>

                        <!-- 1. 소개 -->
                        <div class="mb-12">
                            <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                <span class="text-pastel-red">#</span> 앱 소개 (Introduction)
                            </h2>
                            <p class="text-gray-600 leading-relaxed">
                                <strong>Love Coach</strong>는 단순한 기록을 넘어, 사용자와 교감하며 성장하는 <strong>인터랙티브 헬스케어 서비스</strong>입니다. 하루하루의 식단과 운동을 기록하며 나만의 데이터를 쌓고, 매력적인 AI 코치들과 소통하며 동기부여를 얻으세요. 여러분의 모든 노력은 데이터로 저장되고, 아름다운 추억으로 보상받게 됩니다.
                            </p>
                        </div>

                        <!-- 2. 기록 가이드 -->
                        <div class="mb-12">
                            <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                <span class="text-pastel-blue">#</span> 기록하기 (Logging System)
                            </h2>
                            <p class="text-gray-600 mb-6">
                                가장 핵심적인 기능입니다. 우측 상단의 <strong>'기록'</strong> 탭이나 홈 화면에서 접근할 수 있습니다.
                            </p>
                            
                            <div class="space-y-6 pl-4 border-l-4 border-gray-100">
                                <div>
                                    <h3 class="text-lg font-bold text-gray-800 mb-2">🥗 식단 기록 (Diet Log)</h3>
                                    <p class="text-gray-600 text-sm mb-2">먹은 음식을 사진으로 찍거나 텍스트로 입력하세요.</p>
                                    <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        <li><strong>사진 분석</strong>: 음식 사진을 업로드하면 AI가 칼로리를 추정해줍니다.</li>
                                        <li><strong>상세 입력</strong>: 아침, 점심, 저녁, 간식으로 나누어 기록합니다.</li>
                                        <li><strong>피드백</strong>: 토마 코치가 영양 성분을 분석하고 조언을 건넸니다.</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 class="text-lg font-bold text-gray-800 mb-2">🏋️‍♀️ 운동 기록 (Workout Log)</h3>
                                    <p class="text-gray-600 text-sm mb-2">체계적인 근력 운동 관리를 도와줍니다.</p>
                                    <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        <li><strong>부위별 선택</strong>: 가슴, 등, 하체 등 타겟 부위를 설정하세요.</li>
                                        <li><strong>세트 관리</strong>: 중량(kg)과 반복 횟수(reps)를 세트별로 기록합니다.</li>
                                        <li><strong>볼륨 계산</strong>: 총 운동 볼륨을 자동으로 계산하여 성장을 시각화합니다.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 class="text-lg font-bold text-gray-800 mb-2">🏃 유산소 기록 (Cardio Log)</h3>
                                    <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        <li><strong>종목</strong>: 달리기, 자전거, 수영 등 다양한 유산소 활동 지원.</li>
                                        <li><strong>데이터</strong>: 거리(km), 시간(분), 소모 칼로리를 기록합니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- 3. 코치 시스템 -->
                        <div class="mb-12">
                            <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                <span class="text-pastel-yellow">#</span> AI 코치 (Your Partners)
                            </h2>
                            <p class="text-gray-600 mb-6">
                                각 분야의 전문가인 3명의 코치가 여러분을 기다리고 있습니다. 기록을 꾸준히 하면 <strong>'호감도'</strong>가 상승하며, 코치와의 관계가 깊어집니다.
                            </p>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-gray-50 p-4 rounded-xl">
                                    <span class="text-2xl mb-2 block">🍅</span>
                                    <h4 class="font-bold text-gray-800">토마 (Toma)</h4>
                                    <p class="text-xs text-gray-500">다정하고 꼼꼼한 식단 전문가. 영양 밸런스를 중요하게 생각합니다.</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-xl">
                                    <span class="text-2xl mb-2 block">💪</span>
                                    <h4 class="font-bold text-gray-800">벨 (Belle)</h4>
                                    <p class="text-xs text-gray-500">에너지 넘치는 헬스 트레이너. 득근을 위한 강력한 동기부여!</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-xl">
                                    <span class="text-2xl mb-2 block">🐤</span>
                                    <h4 class="font-bold text-gray-800">치이 (Chie)</h4>
                                    <p class="text-xs text-gray-500">귀엽고 활기찬 러닝 메이트. 함께 달리는 즐거움을 알려줍니다.</p>
                                </div>
                            </div>
                        </div>

                        <!-- 4. 갤러리/시스템 -->
                        <div class="mb-12">
                            <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                <span class="text-gray-400">#</span> 시스템 및 보상 (Rewards)
                            </h2>
                            <div class="space-y-4 text-gray-600">
                                <p>
                                    <strong>업적 시스템</strong><br/>
                                    특정 조건(예: 3일 연속 기록, 누적 운동 시간 달성)을 만족하면 '업적'이 달성됩니다. 업적 달성은 코칭 포인트와 함께 특별한 보상을 제공합니다.
                                </p>
                                <p>
                                    <strong>갤러리 카드</strong><br/>
                                    업적 달성 시, 해당 코치와의 특별한 순간이 담긴 일러스트 카드를 획득할 수 있습니다. 획득한 카드는 '갤러리' 탭에서 고화질로 감상할 수 있으며, 다운로드하여 소장할 수도 있습니다.
                                </p>
                                <p>
                                    <strong>호감도 레벨</strong><br/>
                                    호감도가 일정 수준에 도달하면 코치의 대화 패턴이 변화하고, 숨겨진 스토리가 공개됩니다. 꾸준함이 가장 빠른 지름길입니다.
                                </p>
                            </div>
                        </div>

                         <!-- 5. FAQ -->
                         <div class="mb-12">
                            <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                <span class="text-gray-400">#</span> 자주 묻는 질문 (FAQ)
                            </h2>
                            <div class="space-y-4">
                                <details class="group bg-gray-50 p-4 rounded-xl cursor-pointer">
                                    <summary class="font-bold text-gray-800 list-none flex justify-between items-center">
                                        Q. 기록을 수정하고 싶어요.
                                        <span class="transition-transform group-open:rotate-180">▼</span>
                                    </summary>
                                    <p class="text-sm text-gray-600 mt-2 pl-2 border-l-2 border-gray-300">
                                        기록 페이지의 달력에서 해당 날짜를 선택하면, 하단의 리스트에서 수정 또는 삭제가 가능합니다. 단, 자정이 지나면 수정이 불가능할 수 있습니다.
                                    </p>
                                </details>
                                <details class="group bg-gray-50 p-4 rounded-xl cursor-pointer">
                                    <summary class="font-bold text-gray-800 list-none flex justify-between items-center">
                                        Q. 알림이 오지 않아요.
                                        <span class="transition-transform group-open:rotate-180">▼</span>
                                    </summary>
                                    <p class="text-sm text-gray-600 mt-2 pl-2 border-l-2 border-gray-300">
                                        마이페이지 > 알림 탭에서 '앱 푸시 알림'이 켜져 있는지 확인해주세요. 또한 기기의 시스템 설정에서 알림 권한이 허용되어 있어야 합니다.
                                    </p>
                                </details>
                                <details class="group bg-gray-50 p-4 rounded-xl cursor-pointer">
                                    <summary class="font-bold text-gray-800 list-none flex justify-between items-center">
                                        Q. 탈퇴하면 데이터는 어떻게 되나요?
                                        <span class="transition-transform group-open:rotate-180">▼</span>
                                    </summary>
                                    <p class="text-sm text-gray-600 mt-2 pl-2 border-l-2 border-gray-300">
                                        회원 탈퇴 시 사용자의 모든 기록, 획득한 갤러리, 호감도 데이터는 즉시 영구 삭제되며 복구할 수 없습니다. 신중하게 결정해주세요.
                                    </p>
                                </details>
                            </div>
                        </div>

                        <div class="text-center pt-8 border-t border-gray-100 text-gray-400 text-sm">
                            <p>더 궁금한 점이 있으신가요?</p>
                            <p>support@lovecoach.com 으로 문의해주세요.</p>
                        </div>
                    </div>
                </div>

                <!-- 5. 설정 (Settings) -->
                <div v-else-if="activeTab === 'settings'" class="h-full">
                    <div class="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 max-w-2xl mx-auto">
                        <h2 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <span class="text-3xl">⚙️</span> 환경 설정
                        </h2>
                        
                        <div class="space-y-6">
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <h3 class="font-bold text-gray-800">로딩 애니메이션</h3>
                                    <p class="text-xs text-gray-500 mt-1">페이지 이동 시 귀여운 로딩 화면을 보여줍니다.</p>
                                </div>
                                <button 
                                    @click="appSettings.loadingScreen = !appSettings.loadingScreen"
                                    class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                                    :class="appSettings.loadingScreen ? 'bg-pastel-blue' : 'bg-gray-300'"
                                >
                                    <span 
                                        class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                        :class="appSettings.loadingScreen ? 'translate-x-6' : 'translate-x-0'"
                                    ></span>
                                </button>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <h3 class="font-bold text-gray-800">완료 이펙트</h3>
                                    <p class="text-xs text-gray-500 mt-1">기록 달성 시 축하 애니메이션을 재생합니다.</p>
                                </div>
                                <button 
                                    @click="appSettings.completionAnim = !appSettings.completionAnim"
                                    class="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
                                    :class="appSettings.completionAnim ? 'bg-pastel-blue' : 'bg-gray-300'"
                                >
                                    <span 
                                        class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm"
                                        :class="appSettings.completionAnim ? 'translate-x-6' : 'translate-x-0'"
                                    ></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 6. 정보 (Info) -->
                <div v-else class="h-full text-center">
                    <div class="max-w-xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl border-4 border-gray-50">
                        <div class="w-32 h-32 mx-auto bg-gray-900 rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-lg text-white font-black">
                            LC
                        </div>
                        <h2 class="text-3xl font-black text-gray-800 mb-2">Love Coach</h2>
                        <p class="text-gray-400 font-bold mb-10 text-sm tracking-wide uppercase">Version 1.0.0</p>

                        <div class="space-y-6 text-left">
                            <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span class="text-gray-400 font-bold text-sm">기획팀 (Planning)</span>
                                <span class="text-gray-800 font-bold">Team LoveCoach</span>
                            </div>
                            <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span class="text-gray-400 font-bold text-sm">원화팀 (Art)</span>
                                <span class="text-gray-800 font-bold">SSAFY Artists</span>
                            </div>
                            <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span class="text-gray-400 font-bold text-sm">개발자 (Dev)</span>
                                <span class="text-gray-800 font-bold">Fullstack Team</span>
                            </div>
                            <div class="flex justify-between items-center pt-2">
                                <span class="text-gray-400 font-bold text-sm">제작 (Produced by)</span>
                                <span class="text-pastel-red font-black text-lg">torchbell.co</span>
                            </div>
                        </div>

                        <div class="mt-12 text-xs text-gray-300 font-medium">
                            &copy; 2024 Love Coach. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- RIGHT: Fixed Sidebar Panel -->
      <div class="w-80 h-full bg-white border-l border-gray-200 flex-shrink-0 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-10">
        
        <!-- Profile Header -->
        <div class="p-8 flex flex-col items-center border-b border-gray-100">
            <div class="relative group cursor-pointer">
                <div class="w-28 h-28 rounded-full overflow-hidden border-[6px] border-white shadow-lg mb-4 ring-2 ring-gray-100 transition-transform group-hover:scale-105">
                     <img :src="CHAR_IMAGES.tomai" alt="Profile" class="w-full h-full object-cover" />
                </div>
                <div class="absolute bottom-2 right-2 bg-gray-900 text-white p-1.5 rounded-full shadow-md text-xs group-hover:bg-pastel-red transition-colors">
                    ✏️
                </div>
            </div>
            
            <h2 class="text-xl font-black text-gray-800 mb-1">{{ authStore.user?.name || '사용자' }}</h2>
            <p class="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{ authStore.user?.email || 'user@example.com' }}</p>
            
            <!-- User Details -->
            <div class="w-full mt-6 space-y-3">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400 font-bold">성별</span>
                    <span class="text-gray-700 font-bold">{{ authStore.user?.gender || '미설정' }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400 font-bold">생일</span>
                    <span class="text-gray-700 font-bold">{{ authStore.user?.birthdate || '미설정' }}</span>
                </div>
                <div class="flex justify-between items-center text-sm pt-3 border-t border-gray-100 mt-2">
                     <span class="text-gray-400 font-bold">크레딧</span>
                     <span class="text-pastel-red font-black">{{ credit }} 💎</span>
                </div>
            </div>
        </div>

        <!-- Navigation Menu -->
        <div class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <button 
                v-for="item in menuItems" 
                :key="item.id"
                @click="activeTab = item.id"
                class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-sm text-left group relative overflow-hidden"
                :class="activeTab === item.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
            >
                <span class="text-xl group-hover:scale-110 transition-transform">{{ item.icon }}</span>
                <span class="flex-1">{{ item.label }}</span>
                <span v-if="activeTab === item.id" class="text-xs opacity-70">●</span>
            </button>
        </div>

        <!-- Logout / Delete -->
        <div class="p-6 border-t border-gray-100 bg-gray-50">
             <button @click="handleDeleteAccount" class="w-full py-3 rounded-xl border border-red-100 text-red-400 text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-colors">
                회원 탈퇴
             </button>
        </div>

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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 9999px;
}

.striped-bar {
  background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
  background-size: 1rem 1rem;
}
</style>
