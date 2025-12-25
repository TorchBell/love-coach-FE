<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import tomaIcon from '@/assets/smallIcon/toma.jpg'
import belleIcon from '@/assets/smallIcon/belle.jpg'
import chiiIcon from '@/assets/smallIcon/chii.jpg'
import userDefaultIcon from '@/assets/icons/user-default.png'
import userTokenIcon from '@/assets/icons/user-token.png'
import { useLogStore } from '@/stores/logStore'
import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const authStore = useAuthStore()
const logStore = useLogStore()
const showProfileMenu = ref(false)

// Data fetching for stats
onMounted(async () => {
  await Promise.all([
    logStore.fetchMonthlyLogs(),
    logStore.fetchExercises()
  ])
})

const props = defineProps({
  isFullWidth: {
    type: Boolean,
    default: false
  },
  hideSidebar: {
    type: Boolean,
    default: false
  }
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/home')
}

// AI 캐릭터에 따른 ID 매핑
const getNpcId = (char) => {
  if (char === 'toma') return 1
  if (char === 'belle') return 2
  if (char === 'chie') return 3 // 치에/치이
  return 1
}

// AI 어시스턴트 로직
const aiCharacter = computed(() => {
  if (route.path === '/log') {
    const tab = route.query.tab
    if (tab === 'workout') return 'belle'
    if (tab === 'running') return 'chie'
    return 'toma' // 식단의 기본값은 토마
  }
  // 홈 페이지 또는 기타: 가장 높은 업적 캐릭터 기본값 (Mock: 토마)
  return 'toma'
})

const getAiImage = (char) => {
  if (char === 'belle') return belleIcon
  if (char === 'chie') return chiiIcon // MainLayout은 'chie'를 사용하지만 파일명은 'chii'
  return tomaIcon
}

// 탭/페이지 변경 시 열려있는 채팅창 동기화
watch(aiCharacter, (newChar) => {
    if (uiStore.isChatOpen) {
        const npcId = getNpcId(newChar)
        uiStore.openChat(npcId)
    }
})

const handleFabClick = () => {
    const npcId = getNpcId(aiCharacter.value)
    uiStore.openChat(npcId)
}

</script>

<template>
  <div class="min-h-screen bg-mint-bg font-sans overflow-hidden selection:bg-pastel-red selection:text-white">
    <!-- ... (상단 네비게이션, 메인 콘텐츠 생략) ... -->
    <nav class="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md shadow-sm z-50 flex items-center justify-between px-6 border-b border-pastel-red/10">
      
      <!-- Left: Profile & RPG Stats -->
      <div class="flex items-center gap-6">
        <!-- Profile (Clickable for Menu) -->
        <div class="relative">
            <button @click="showProfileMenu = !showProfileMenu" class="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
                <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                     <img :src="userDefaultIcon" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col items-start">
                    <span class="text-base font-black text-gray-800 leading-none">{{ authStore.user?.nickname || authStore.user?.name || 'Player' }}</span>
                </div>
            </button>

            <!-- Dropdown Menu -->
            <div v-if="showProfileMenu" class="absolute top-12 left-0 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-down">
                <router-link to="/mypage" @click="showProfileMenu = false" class="block px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-pastel-red transition-colors">
                    마이페이지
                </router-link>
                <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    로그아웃
                </button>
            </div>
        </div>

        <!-- Vertical Divider -->
        <div class="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

        <!-- RPG Stats HUD (Moved to Left) -->
        <div class="flex items-center gap-4 md:gap-6">
            
            <!-- HP Bar -->
            <div class="hidden sm:flex flex-col w-32">
                <div class="flex justify-between text-[10px] font-bold text-gray-400 mb-0.5 px-0.5">
                    <span>HP</span>
                    <span class="text-pastel-red">1500 / 1500</span>
                </div>
                <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300 shadow-inner relative">
                    <!-- Glossy Effect -->
                     <div class="absolute top-0 left-0 w-full h-1 bg-white/30 z-10"></div>
                    <div class="h-full bg-gradient-to-r from-red-500 to-pastel-red w-full"></div>
                </div>
            </div>

            <!-- Stats (STR / DEX) -->
            <div class="hidden md:flex items-center gap-4 bg-gray-100/80 px-4 py-1.5 rounded-lg border border-gray-200">
                <!-- STR -->
                 <div class="flex items-center gap-1.5" title="Strength (Total Volume / 30 / 400)">
                    <div class="flex flex-col items-end leading-none">
                        <span class="text-[8px] md:text-[10px] font-bold text-gray-400">STR</span>
                        <span class="text-xs md:text-sm font-black text-gray-800">{{ logStore.strStat }}</span>
                    </div>
                </div>
                <div class="w-px h-6 bg-gray-300"></div>
                <!-- DEX -->
                 <div class="flex items-center gap-1.5" title="Dexterity (Total Time * Avg Intensity / 100)">
                    <div class="flex flex-col items-end leading-none">
                        <span class="text-[8px] md:text-[10px] font-bold text-gray-400">DEX</span>
                        <span class="text-xs md:text-sm font-black text-gray-800">{{ logStore.dexStat }}</span>
                    </div>
                </div>
            </div>

            <!-- Currency (Token) -->
            <div class="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 shadow-sm transition-transform hover:scale-105 cursor-help" title="Health Tokens">
                <img :src="userTokenIcon" class="w-5 h-5 md:w-6 md:h-6 drop-shadow-sm" />
                <span class="text-xs md:text-sm font-black text-yellow-600">{{ authStore.user?.credit || 0 }}</span>
            </div>
        </div>
      </div>

      <!-- Right: Navigation Links (Moved to Right) -->
      <div class="hidden md:flex items-center gap-6 lg:gap-12 font-bold text-gray-500 text-sm lg:text-base">
        <router-link to="/home" class="hover:text-pastel-red transition-all px-2" active-class="text-pastel-red scale-105">홈</router-link>
        <router-link to="/gallery" class="hover:text-pastel-red transition-all px-2" active-class="text-pastel-red scale-105">갤러리</router-link>
        <router-link to="/log" class="hover:text-pastel-red transition-all px-2" active-class="text-pastel-red scale-105">기록</router-link>
        <router-link to="/achievement" class="hover:text-pastel-red transition-all px-2" active-class="text-pastel-red scale-105">업적</router-link>
        <router-link to="/mypage" class="hover:text-pastel-red transition-all px-2" active-class="text-pastel-red scale-105">마이페이지</router-link>
      </div>

    </nav>

    <!-- 메인 콘텐츠 영역 -->
    <div class="pt-16 h-screen flex relative">
      <!-- 왼쪽 사이드바 (고정) -->
      <!-- 사이드바 (hideSidebar가 false일 때만 표시) -->
      <aside 
        v-if="!hideSidebar"
        class="hidden md:block h-full fixed left-0 top-16 bottom-0 overflow-hidden bg-white/50 border-r border-pastel-red/10 z-40 transition-all duration-300"
        :class="isFullWidth ? 'w-64' : 'w-1/4'"
      >
        <div class="h-full p-2 flex flex-col gap-2">
          <slot name="left-sidebar"></slot>
        </div>
      </aside>

      <!-- 중앙 콘텐츠 (스크롤 가능) -->
      <main 
        class="w-full h-full overflow-y-auto p-4 md:p-6 scrollbar-hide pb-24 transition-all duration-300 relative"
        :class="[
            hideSidebar ? 'w-full' : (isFullWidth ? 'md:w-[calc(100%-16rem)] md:ml-64' : 'md:w-1/2 md:ml-[25%]')
        ]"
      >
        <slot></slot>
        
        <!-- 푸터 -->
        <footer class="mt-12 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
          <p>&copy; 2025 LoveCoach. All rights reserved.</p>
          <p class="text-xs mt-2">오늘도 건강한 하루 되세요!</p>
        </footer>
      </main>

      <!-- 우측 사이드바 (고정) - isFullWidth 아닐 때만 표시 -->
      <aside 
        v-if="!isFullWidth"
        class="hidden md:block w-1/4 h-full fixed right-0 top-16 bottom-0 overflow-hidden bg-white border-l border-pastel-red/10 z-40"
      >
        <div class="h-full p-2 flex flex-col gap-2">
          <slot name="right-sidebar"></slot>
        </div>
      </aside>
    </div>

    <!-- AI 어시스턴트 FAB (로고 클릭 시 채팅 열기) -->
    <div class="fixed bottom-8 right-8 z-50 pointer-events-auto">
      <button 
        @click="handleFabClick"
        class="w-16 h-16 rounded-full bg-white shadow-lg border-4 border-pastel-red overflow-hidden hover:scale-110 transition-transform duration-300"
        title="대화하기"
      >
        <img :src="getAiImage(aiCharacter)" alt="AI Assistant" class="w-full h-full object-cover" />
      </button>
      
      <!-- 안내 말풍선 (채팅이 닫혀있고, 최초 진입 시 잠깐 보여줄 수 있음 - 여기서는 간단히 제거 혹은 유지) -->
      <!-- 사용자가 '이걸 누르면 채팅창을 열게' 해달라고 했으므로 말풍선 로직은 단순화하거나 FAB hover 시 보여주는 툴팁으로 대체 가능하지만, 일단 FAB 클릭 연동이 핵심 -->
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
