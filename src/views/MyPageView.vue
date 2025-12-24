<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNpcStore } from '@/stores/npcStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useGalleryStore } from '@/stores/galleryStore'
import { CHAR_IMAGES, UI_IMAGES } from '@/assets/dummy/index.js'
import MainLayout from '../layouts/MainLayout.vue'
import DeleteAccountModal from '../components/DeleteAccountModal.vue'
import ToastNotification from '../components/ToastNotification.vue'

const router = useRouter()
const authStore = useAuthStore()
const npcStore = useNpcStore()
const achievementStore = useAchievementStore()
const galleryStore = useGalleryStore()
const showDeleteModal = ref(false)

const activeTab = ref('activity')

// Toast State
const toast = ref({
    visible: false,
    message: '',
    type: 'error'
})

const showToast = (message, type = 'error') => {
    toast.value = {
        visible: true,
        message,
        type
    }
}

// 프로필 저장 핸들러
const handleSaveProfile = async () => {
  // 1. 기본 유효성 검사
  if (!editForm.value.nickname.trim()) {
    showToast('닉네임을 입력해주세요.')
    return
  }

  // 2. 현재 비밀번호 (필수) 검사
  if (!editForm.value.currentPassword) {
      showToast('정보를 수정하려면 현재 비밀번호를 입력해주세요.')
      return
  }

  // 3. 비밀번호 변경 모드일 때 추가 검사
  if (editForm.value.isPasswordChangeMode) {
      if (!editForm.value.newPassword) {
          showToast('새로운 비밀번호를 입력해주세요.')
          return
      }
      if (editForm.value.newPassword !== editForm.value.confirmPassword) {
          showToast('새로운 비밀번호가 일치하지 않습니다.')
          return
      }
      if (editForm.value.newPassword === editForm.value.currentPassword) {
          showToast('지금 사용 중인 비밀번호로는 변경할 수 없습니다!')
          return
      }
      if (editForm.value.newPassword.length < 4) {
           showToast('비밀번호는 최소 4자 이상이어야 합니다.')
           return
      }
  }

  isSaving.value = true
  
  try {
    // 4. Payload 구성 (백엔드 DTO: UserUpdateRequest 확인 후 키 매핑)
    // 백엔드는 nickname, gender, birthDate 수정 시에도 password(기존) 검증을 수행함.
    // 키 매핑: frontend 'currentPassword' -> backend 'password'
    //          frontend 'newPassword' -> backend 'newPassword'
    const payload = {
        nickname: editForm.value.nickname,
        gender: editForm.value.gender,
        birthDate: editForm.value.birthDate || null, // 빈 문자열은 null로 전송
        password: editForm.value.currentPassword, // 기존 비밀번호 (검증용 필수)
        
        // 비밀번호 변경 모드인 경우에만 newPassword 전송
        ...(editForm.value.isPasswordChangeMode ? { 
            newPassword: editForm.value.newPassword 
        } : {})
    }

    const success = await authStore.updateProfile(payload)
    
    if (success) {
        showToast('회원정보가 안전하게 저장되었습니다!', 'success')
        // 비밀번호 필드 및 모드 초기화
        editForm.value.currentPassword = ''
        editForm.value.newPassword = ''
        editForm.value.confirmPassword = ''
        editForm.value.isPasswordChangeMode = false
    } else {
        showToast('저장에 실패했습니다. 비밀번호를 확인해주세요.')
    }
  } catch (error) {
      console.error(error)
      // 400 에러 처리 (비밀번호 불일치 등)
      if (error.response && error.response.status === 400) {
           showToast('비밀번호가 일치하지 않거나 입력값이 올바르지 않습니다.')
      } else {
           showToast('오류가 발생했습니다.')
      }
  } finally {
      isSaving.value = false
  }
}
const isSummaryView = ref(false) // 타임라인 vs 요약 보기 토글
const isLoading = ref(false)
const isSaving = ref(false)

// --- 이미지 로딩 로직 (AchievementView & GalleryView 통일) ---
// 업적 아이콘
const achievementImages = import.meta.glob('@/assets/achievement/**/*.{png,jpg,jpeg,webp}', { eager: true })
const achievementPaths = Object.keys(achievementImages)

const findAchievementImage = (dbPath) => {
    if (!dbPath) return null
    if (dbPath.startsWith('http')) return dbPath
    
    // DB 경로 정규화
    const normalizedDbPath = dbPath.replace(/\\/g, '/')
    
    // 1. 경로 포함 여부 확인
    const match = achievementPaths.find(localPath => localPath.includes(normalizedDbPath))
    if (match) return achievementImages[match].default || achievementImages[match]
    
    // 2. 파일명만으로 Fallback
    const filename = normalizedDbPath.split('/').pop()
    const fallbackMatch = achievementPaths.find(localPath => localPath.endsWith(filename))
    if (fallbackMatch) return achievementImages[fallbackMatch].default || achievementImages[fallbackMatch]

    return null
}

// 갤러리 이미지
const galleryImages = import.meta.glob('@/assets/gallery/**/*.{png,jpg,jpeg,webp}', { eager: true })
const galleryPaths = Object.keys(galleryImages)

const findGalleryImage = (dbPath) => {
    if (!dbPath) return null
    if (dbPath.startsWith('http')) return dbPath
    
    // DB 경로 정규화
    const normalizedDbPath = dbPath.replace(/\\/g, '/')
    
    // 1. 경로 포함 여부 확인
    const match = galleryPaths.find(localPath => localPath.includes(normalizedDbPath))
    if (match) return galleryImages[match].default || galleryImages[match]
    
    // 2. 파일명만으로 Fallback
    const filename = normalizedDbPath.split('/').pop()
    const fallbackMatch = galleryPaths.find(localPath => localPath.endsWith(filename))
    if (fallbackMatch) return galleryImages[fallbackMatch].default || galleryImages[fallbackMatch]

    return null
}
// -----------------------------------------------------------

// ... (프로필, 알림, 앱 설정 상태 유지) ...
const editForm = ref({
    email: '',
    nickname: '',
    gender: 'M',
    birthDate: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isPasswordChangeMode: false
})

const notifications = ref({
    push: true,
    email: false
})

const appSettings = ref({
    loadingScreen: true,
    completionAnim: true
})

// 메뉴 목록
const menuItems = [
    { id: 'activity', label: '내 활동' },
    { id: 'edit', label: '개인 정보 수정' },
    { id: 'notification', label: '알림' },
    { id: 'help', label: '도움말' },
    { id: 'settings', label: '설정' },
    { id: 'info', label: '정보' },
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

// === Real Data for Timeline (from Achievement Store) ===
const timelineActivities = computed(() => {
    const list = achievementStore.achievements || []
    const galleryList = galleryStore.galleries || []

    // 완료된 업적만 필터링 (제목이 '잠겨 있는 업적'이 아닌 것)
    // 혹은 isAchieved 플래그 확인 (AchievementView 로직 참고)
    const completedList = list.filter(item => {
        // Robust check for locked achievement (ignoring spaces)
        const rawTitle = item.name || item.title || ''
        const normalizedTitle = rawTitle.replace(/\s+/g, '')
        const isUnlocked = normalizedTitle !== '잠겨있는업적'

        // isAchieved 플래그가 있다면 그것도 참고
        const achievedFlag = item.isAchieved === true || item.status === 'completed'
        
        // 둘 중 하나라도 만족하면 완료로 간주
        return isUnlocked || achievedFlag
    })

    // 날짜별 그룹핑
    const grouped = {}
    completedList.forEach(item => {
        // 날짜 포맷 (YYYY-MM-DD -> YYYY년 M월 D일)
        let dateStr = item.achievedAt || item.achieved_at || item.createdAt || '날짜 미상'
        try {
             const d = new Date(dateStr)
             if (!isNaN(d)) {
                 dateStr = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
             }
        } catch (e) { /* ignore */ }

        if (!grouped[dateStr]) grouped[dateStr] = []
        
        // 아이콘 매핑
        const mappedIcon = findAchievementImage(item.iconUrl || item.icon_url)

        // 보상 갤러리 확인
        let rewardGalleryImage = null
        const rgid = item.rewardGalleryId || item.reward_gallery_id
        if (rgid) {
            const linkedGallery = galleryList.find(g => (g.galleryId || g.gallery_id) === rgid)
            if (linkedGallery) {
                // 갤러리 이미지 매핑
                rewardGalleryImage = findGalleryImage(linkedGallery.imageUrl || linkedGallery.image_url)
            }
        }

        grouped[dateStr].push({
            type: 'achievement',
            title: item.name || item.title || '업적 달성',
            description: item.description || '새로운 업적을 달성했습니다!',
            image: mappedIcon, // 업적 아이콘
            rewardImage: rewardGalleryImage, // 보상 갤러리 이미지 (있을 경우)
            hasReward: !!rewardGalleryImage
        })
    })
    
    // 배열로 변환 및 최신순 정렬
    // 날짜 문자열 정렬이 까다로우니, 원본 키를 따로 관리하거나 역순 정렬
    // 여기서는 단순 역순 (최신 날짜가 위로 오게 하려면 키 정렬 필요)
    // 날짜 파싱 가능한 문자열이라 가정하고 정렬
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        if (a === '날짜 미상') return 1
        if (b === '날짜 미상') return -1
        // 한글 날짜 파싱해서 비교
        const parseKoDate = (s) => {
            const parts = s.match(/(\d+)년 (\d+)월 (\d+)일/)
            if (!parts) return 0
            return new Date(parts[1], parts[2]-1, parts[3]).getTime()
        }
        return parseKoDate(b) - parseKoDate(a)
    })

    return sortedKeys.map(date => ({
        date,
        items: grouped[date]
    }))
})


// === Mock Data for Summary Stats (placeholder - can be connected to real stats later) ===
const summaryStats = ref({
    totalAchievements: 12, // TODO: Compute from store
    totalGalleries: 5,
    dietLogs: 45,
    workoutLogs: 32,
    cardioLogs: 28,
    mostViewedGallery: '토마의 미소',
    mostViewedChar: 'toma'
})

onMounted(async () => {
    await npcStore.fetchNpcs()
    await achievementStore.fetchAchievements() // 업적 데이터 로드
    await galleryStore.fetchGalleries() // 갤러리 데이터 로드 (보상 이미지 매핑용)
    if (authStore.user) {
        editForm.value.email = authStore.user.email || ''
        editForm.value.nickname = authStore.user.nickname || authStore.user.name || ''
        editForm.value.gender = authStore.user.gender || 'M'
        editForm.value.birthDate = authStore.user.birthDate || '' 
    }
})

const toggleSummary = () => {
    isSummaryView.value = !isSummaryView.value
}

// 프로필 저장 핸들러


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
                                <span class="text-sm text-gray-500 font-bold">완료 업적</span>
                                <span class="text-2xl font-black text-gray-800">{{ summaryStats.totalAchievements }}</span>
                            </div>
                            <div class="bg-gray-50 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100">
                                <span class="text-sm text-gray-500 font-bold">수집 갤러리</span>
                                <span class="text-2xl font-black text-gray-800">{{ summaryStats.totalGalleries }}</span>
                            </div>
                            <div class="bg-gray-50 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100 col-span-2 lg:col-span-2">
                                <span class="text-sm text-gray-500 font-bold">최애 갤러리</span>
                                <span class="text-xl font-black text-pastel-red truncate max-w-full px-2">{{ summaryStats.mostViewedGallery }}</span>
                            </div>
                        </div>

                        <!-- Middle Row: Logs -->
                        <div class="grid grid-cols-3 gap-4">
                            <div class="bg-pastel-green/10 p-4 rounded-2xl text-center border border-pastel-green/20">
                                <p class="text-xs font-bold text-gray-500 mb-1">식단</p>
                                <p class="text-xl font-black text-gray-800">{{ summaryStats.dietLogs }}회</p>
                            </div>
                            <div class="bg-pastel-blue/10 p-4 rounded-2xl text-center border border-pastel-blue/20">
                                <p class="text-xs font-bold text-gray-500 mb-1">근력</p>
                                <p class="text-xl font-black text-gray-800">{{ summaryStats.workoutLogs }}회</p>
                            </div>
                            <div class="bg-pastel-yellow/10 p-4 rounded-2xl text-center border border-pastel-yellow/20">
                                <p class="text-xs font-bold text-gray-500 mb-1">유산소</p>
                                <p class="text-xl font-black text-gray-800">{{ summaryStats.cardioLogs }}회</p>
                            </div>
                        </div>

                        <!-- Bottom Row: Affinity -->
                        <div class="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                            <h3 class="font-bold text-gray-700 mb-6 flex items-center gap-2">
                                호감도 현황
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
                        <div v-for="(group, index) in timelineActivities" :key="index" class="relative border-l-2 border-gray-200 pl-8 pb-4 last:border-l-0">
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
                                            <p class="text-gray-600 text-sm leading-relaxed mb-4">{{ item.description }}</p>
                                            
                                            <!-- Reward Gallery Image (if exists) -->
                                            <div v-if="item.hasReward && item.rewardImage" class="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <p class="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                                                    갤러리 보상 획득
                                                </p>
                                                <div class="w-full h-48 rounded-lg overflow-hidden relative group/img cursor-pointer">
                                                    <img :src="item.rewardImage" class="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                                                </div>
                                            </div>
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

                            <!-- Password Change Section -->
                            <div class="pt-6 border-t border-gray-100 mt-6">
                                <h3 class="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                                    <span>🔒</span> 계정 보안 설정
                                </h3>
                                
                                <div class="space-y-4">
                                    <!-- Current Password (Always Required) -->
                                    <div>
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">현재 비밀번호 <span class="text-pastel-red">*</span></label>
                                        <input 
                                            v-model="editForm.currentPassword" 
                                            type="password" 
                                            placeholder="정보 수정을 위해 필수입니다"
                                            class="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:ring-4 focus:ring-pastel-red/10 focus:outline-none transition-all font-bold text-gray-700 placeholder-gray-300"
                                        />
                                    </div>

                                    <!-- Change Password Checkbox -->
                                    <div class="flex items-center gap-2 py-2">
                                        <input 
                                            type="checkbox" 
                                            id="changePasswordToggle" 
                                            v-model="editForm.isPasswordChangeMode"
                                            class="w-5 h-5 rounded border-gray-300 text-pastel-red focus:ring-pastel-red"
                                        />
                                        <label for="changePasswordToggle" class="text-sm font-bold text-gray-600 cursor-pointer select-none">
                                            비밀번호 변경하기
                                        </label>
                                    </div>

                                    <!-- New Password Fields (Conditional) -->
                                    <div v-if="editForm.isPasswordChangeMode" class="space-y-4 animate-fade-in-up">
                                        <div>
                                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">새로운 비밀번호</label>
                                            <input 
                                                v-model="editForm.newPassword" 
                                                type="password" 
                                                placeholder="새로운 비밀번호"
                                                class="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:ring-4 focus:ring-pastel-red/10 focus:outline-none transition-all font-bold text-gray-700 placeholder-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">새로운 비밀번호 확인</label>
                                            <input 
                                                v-model="editForm.confirmPassword" 
                                                type="password" 
                                                placeholder="한 번 더 입력하세요"
                                                class="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:ring-4 focus:ring-pastel-red/10 focus:outline-none transition-all font-bold text-gray-700 placeholder-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>
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
                            알림 설정
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
                                    <h4 class="font-bold text-gray-800">토마 (Toma)</h4>
                                    <p class="text-xs text-gray-500">다정하고 꼼꼼한 식단 전문가. 영양 밸런스를 중요하게 생각합니다.</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-xl">
                                    <h4 class="font-bold text-gray-800">벨 (Belle)</h4>
                                    <p class="text-xs text-gray-500">에너지 넘치는 헬스 트레이너. 득근을 위한 강력한 동기부여!</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-xl">
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
                            환경 설정
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

    <!-- Toast Notification -->
    <ToastNotification 
        v-if="toast.visible"
        :message="toast.message"
        :type="toast.type"
        @close="toast.visible = false"
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
