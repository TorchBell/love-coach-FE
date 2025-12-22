<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import CharacterDialog from '../components/CharacterDialog.vue'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useNpcStore } from '@/stores/npcStore'
import { ICONS } from '@/assets/icons/index.js'

import { DIALOG_TEXT, DIALOG_CHOICES } from '@/constants/text.js'

const router = useRouter()
const uiStore = useUiStore()
const authStore = useAuthStore()
const npcStore = useNpcStore()
const showDialog = ref(false)
const dialogText = ref('')
const currentChoices = ref([])

// 로그인 상태
const loginForm = ref({
  email: '',
  password: '',
})


const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    errorMessage.value = '아이디와 비밀번호를 입력해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const success = await authStore.login(loginForm.value)
  
  isLoading.value = false
  if (!success) {
    errorMessage.value = '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'
  } else {
    // 로그인 성공
    // if (authStore.user?.name) {
    //   dialogText.value = DIALOG_TEXT.GREETING_USER(authStore.user.name)
    // }
  }
}

onMounted(async () => {
  // if (authStore.user?.name) {
  //   dialogText.value = DIALOG_TEXT.GREETING_USER(authStore.user.name)
  // }
})

// --- [2. 현재 이미지 상태 관리] ---
// 초기에는 정지된 이미지로 설정
const currentTomaImage = ref(CHAR_IMAGES.tomai) 

// 마우스 이벤트 핸들러
const handleMouseOver = () => {
  currentTomaImage.value = `${CHAR_IMAGES.tomahi}?t=${new Date().getTime()}` // 마우스 올리면 GIF로 변경 (재생 강제)
}

const handleMouseOut = () => {
  currentTomaImage.value = CHAR_IMAGES.tomai // 마우스 떼면 정지 이미지로 변경
}

// 부드러운 상호작용을 위한 GIF 프리로드
onMounted(() => {
    const img = new Image()
    img.src = CHAR_IMAGES.tomahi
})

// 왼쪽 사이드바 메뉴 아이콘 업데이트
const menuItems = [
  { id: 'gallery', label: '갤러리', path: '/gallery' },
  { id: 'log', label: '기록', path: '/log' },
  { id: 'achievement', label: '업적', path: '/achievement' },
  { id: 'mypage', label: '마이페이지', path: '/mypage' },
  { id: 'logout', label: '로그아웃', path: '#' },
]

const handleMenuClick = async (item) => {
  if (item.id === 'logout') {
    await authStore.logout()
    // HomeView 유지, 반응형으로 로그인 폼 표시
    return
  }
  router.push(item.path)
}

const openDialog = () => {
  showDialog.value = true
  // 최근 대화 기록이 있는지 확인? 아니면 새로 시작/인사.
  // 현재는 더미 텍스트를 초기 인사로 사용하거나, 스토어에서 가져옴.
  dialogText.value = DIALOG_TEXT.ASK_HELP
  currentChoices.value = DIALOG_CHOICES // 네비게이션 단축키 유지
}

const openChatWindow = () => {
  uiStore.openChat(1) // 토마 ID 1
  showDialog.value = false // Close simple dialog if open
}

// 실제 대화 처리
const handleSendMessage = async (message) => {
  // 낙관적 UI 업데이트 또는 응답 대기?
  // 가능하다면 "생각 중..." 상태를 표시하거나 준비되면 텍스트 업데이트.
  
  // 현재는 토마(ID 1)를 기본 홈 캐릭터로 가정...
  // HomeView는 토마를 주로 다룸.
  const npcId = 1 
  
  const response = await npcStore.sendMessage(npcId, message)
  
  if (response && response.messageAi) {
      dialogText.value = response.messageAi
  } else {
      dialogText.value = "..." // Error or no response
  }
}

const handleChoice = (choiceId) => {
  // 기존 네비게이션 로직 유지
  if (choiceId === 1) { // 식단
    router.push({ path: '/log', query: { tab: 'diet' } })
  } else if (choiceId === 2) { // 운동
    router.push({ path: '/log', query: { tab: 'workout' } })
  } else if (choiceId === 3) { // 러닝
    router.push({ path: '/log', query: { tab: 'running' } })
  } else if (choiceId === 4) { // 닫기/생각
     showDialog.value = false
  }
}
</script>

<template>
  <div class="home-container min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink/30 relative overflow-hidden flex flex-col md:flex-row">
    
    <!-- 왼쪽 섹션 (로그인/네비게이션) -->
    <div 
        class="w-full md:w-1/3 z-20 flex flex-col justify-center px-8 md:pl-16 space-y-8 min-h-[50vh] md:min-h-screen bg-white/30 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none transition-all duration-500"
    >
      <h1 class="text-5xl md:text-6xl font-bold text-pastel-red font-pixel mb-8 md:mb-12 tracking-wider drop-shadow-sm text-center md:text-left">
        Love<br>Coach
      </h1>
      
      <!-- 로그인 폼 (비인증) -->
      <div v-if="!authStore.isAuthenticated" class="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border-2 border-pastel-red/20 w-full max-w-sm mx-auto md:mx-0 transform md:translate-x-12 transition-all">
        <h2 class="text-2xl font-bold text-gray-700 mb-6 text-center md:text-left">로그인</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-600 mb-1">아이디</label>
            <input 
              v-model="loginForm.email" 
              type="email" 
              class="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:outline-none transition-colors"
              placeholder="아이디를 입력하세요"
              @keyup.enter="handleLogin"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-600 mb-1">비밀번호</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              class="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:outline-none transition-colors"
              placeholder="비밀번호를 입력하세요"
              @keyup.enter="handleLogin"
            />
          </div>
          
          <p v-if="errorMessage" class="text-red-500 text-sm font-bold">{{ errorMessage }}</p>

          <button 
            @click="handleLogin" 
            :disabled="isLoading"
            class="w-full py-3 bg-pastel-red text-white rounded-xl font-bold shadow-md hover:bg-pastel-red/90 transition-all transform active:scale-95"
          >
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>

          <div class="text-center mt-4">
            <p class="text-gray-500 text-sm">
              아직 계정이 없으신가요? 
              <router-link to="/signup" class="text-pastel-red font-bold hover:underline">회원가입</router-link>
            </p>
          </div>
        </div>
      </div>

      <!-- 메뉴 아이템 (인증됨) -->
      <nav v-else class="flex flex-col space-y-6 items-center md:items-start">
        <button 
          v-for="item in menuItems" 
          :key="item.id"
          @click="handleMenuClick(item)"
          class="group flex items-center space-x-6 text-3xl font-bold text-gray-500 hover:text-pastel-red transition-all duration-300 transform hover:translate-x-4 hover:scale-105"
        >
          <!-- 갤러리 커스텀 아이콘 -->
          <img 
            v-if="item.id === 'gallery'"
            :src="ICONS.tomaGallery" 
            alt="gallery" 
            class="w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-300 filter drop-shadow-md transform group-hover:scale-125 group-hover:rotate-12 group-hover:animate-bounce"
          />
          <!-- 기록 커스텀 아이콘 -->
          <img 
            v-else-if="item.id === 'log'"
            :src="ICONS.belleLog" 
            alt="log" 
            class="w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-300 filter drop-shadow-md transform group-hover:scale-125 group-hover:-rotate-12 group-hover:animate-bounce"
          />
          <!-- 업적 커스텀 아이콘 -->
          <img 
            v-else-if="item.id === 'achievement'"
            :src="ICONS.chiiAchievement" 
            alt="achievement" 
            class="w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-300 filter drop-shadow-md transform group-hover:scale-125 group-hover:rotate-6 group-hover:animate-bounce"
          />
          <!-- 아이콘 없는 아이템을 위한 빈 공간 (정렬용) -->
          <div v-else class="w-12 h-12"></div>
          
          <span class="relative">
            {{ item.label }}
            <span class="absolute -bottom-2 left-0 w-0 h-1 bg-pastel-red transition-all duration-300 group-hover:w-full"></span>
          </span>
        </button>
      </nav>
    </div>

    <!-- 오른쪽 섹션 (캐릭터) -->
    <div class="w-full md:w-2/3 relative flex items-end justify-center z-10 h-[50vh] md:h-screen overflow-hidden">
      <img 
        :src="currentTomaImage" 
        alt="Toma" 
        class="h-full md:h-[90vh] object-contain transform translate-y-4 transition-transform duration-700 hover:scale-105 filter drop-shadow-2xl opacity-80 md:opacity-100"
        :class="{ 'opacity-100 scale-110 !translate-y-8': uiStore.isChatOpen && uiStore.currentNpcId === 1 }"
        @mouseover="handleMouseOver"
        @mouseout="handleMouseOut"
      />


      
      <!-- 대화하기 버튼 -->
      <button 
        v-if="authStore.isAuthenticated && !uiStore.isChatOpen"
        @click="openDialog"
        class="absolute bottom-16 right-16 bg-gradient-to-r from-pastel-red to-pink-400 text-white px-10 py-5 rounded-full shadow-2xl hover:shadow-pastel-red/50 transition-all transform hover:scale-110 font-bold text-xl z-30 flex items-center gap-3 border-4 border-white/50 hidden md:flex"
      >
        <span class="text-2xl">💬</span>
        <span>대화하기</span>
      </button>
    </div>

    <!-- 기존 Simple Dialog -->
    <CharacterDialog 
      :visible="showDialog && !uiStore.isChatOpen" 
      :text="dialogText" 
      :character-image="CHAR_IMAGES.tomai"
      :choices="currentChoices"
      :show-direct-chat-button="true"
      @select="handleChoice"
      @openChat="openChatWindow"
    />
    

    
    <div class="absolute top-10 right-10 w-64 h-64 bg-pastel-yellow/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
    <div class="absolute bottom-10 left-10 w-80 h-80 bg-pastel-blue/10 rounded-full blur-3xl animate-pulse pointer-events-none" style="animation-delay: 1.5s;"></div>


  </div>
</template>

<style scoped>
/* (스타일 시트 부분은 기존과 동일합니다) */
.home-container {
  background-size: 200% 200%;
  animation: gradientShift 10s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes animate-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: animate-float 3s ease-in-out infinite;
}
</style>