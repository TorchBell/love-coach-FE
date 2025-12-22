<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import tomaIcon from '@/assets/smallIcon/toma.jpg'
import belleIcon from '@/assets/smallIcon/belle.jpg'
import chiiIcon from '@/assets/smallIcon/chii.jpg'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const authStore = useAuthStore()

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
  <div class="min-h-screen bg-cream font-sans overflow-hidden selection:bg-pastel-red selection:text-white">
    <!-- ... (상단 네비게이션, 메인 콘텐츠 생략) ... -->
    <nav class="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md shadow-sm z-50 flex items-center justify-between px-6 border-b border-pastel-red/10">
      <router-link to="/home" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span class="text-2xl">🥗</span>
        <h1 class="text-xl font-bold text-soft-black tracking-tight">LoveCoach</h1>
      </router-link>
      <div class="flex items-center gap-6 font-semibold text-gray-600">
        <router-link to="/home" class="hover:text-pastel-red transition-colors" active-class="text-pastel-red">홈</router-link>
        <router-link to="/gallery" class="hover:text-pastel-red transition-colors" active-class="text-pastel-red">갤러리</router-link>
        <router-link to="/log" class="hover:text-pastel-red transition-colors" active-class="text-pastel-red">기록</router-link>
        <router-link to="/achievement" class="hover:text-pastel-red transition-colors" active-class="text-pastel-red">업적</router-link>
        <router-link to="/mypage" class="hover:text-pastel-red transition-colors" active-class="text-pastel-red">마이페이지</router-link>
        <button @click="handleLogout" class="hover:text-pastel-red transition-colors font-bold">로그아웃</button>
      </div>
    </nav>

    <!-- 메인 콘텐츠 영역 -->
    <div class="pt-16 h-screen flex relative">
      <!-- 왼쪽 사이드바 (고정) -->
      <aside class="hidden md:block w-1/4 h-full fixed left-0 top-16 bottom-0 overflow-hidden bg-white/50 border-r border-pastel-red/10 z-40">
        <div class="h-full p-2 flex flex-col gap-2">
          <slot name="left-sidebar"></slot>
        </div>
      </aside>

      <!-- 중앙 콘텐츠 (스크롤 가능) -->
      <main class="w-full md:w-1/2 md:ml-[25%] h-full overflow-y-auto p-4 md:p-6 scrollbar-hide pb-24">
        <slot></slot>
        
        <!-- 푸터 -->
        <footer class="mt-12 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
          <p>&copy; 2025 LoveCoach. All rights reserved.</p>
          <p class="text-xs mt-2">오늘도 건강한 하루 되세요! 💪</p>
        </footer>
      </main>

      <!-- 오른쪽 사이드바 (고정) -->
      <aside class="hidden md:block w-1/4 h-full fixed right-0 top-16 bottom-0 overflow-hidden bg-white/50 border-l border-pastel-red/10 z-40">
        <div class="h-full p-2 flex flex-col gap-2">
          <slot name="right-sidebar"></slot>
        </div>
      </aside>
    </div>

    <!-- AI 어시스턴트 FAB (로고 클릭 시 채팅 열기) -->
    <div class="fixed bottom-8 right-8 z-50">
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
