<script setup>
import CharacterDialog from './components/CharacterDialog.vue'
import ChatWindow from '@/components/ChatWindow.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'

const mainCharacterBelle = CHAR_IMAGES?.belle || ''

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()
const showDialog = ref(false)

// 앱 로드 시 세션 복구
onMounted(async () => {
  await authStore.fetchUserProfile()
})

// 다이얼로그 스크롤 감지 (자식 라우트에서 수신)
const handleScroll = (e) => {
  if (e && e.target) {
    const scrollPosition = e.target.scrollTop
    showDialog.value = scrollPosition > 100
  }
}

// 필요시 자식 컴포넌트에 handleScroll 노출
defineExpose({ handleScroll })
</script>

<template>
  <!-- IntroOverlay 제거됨 - 랜딩 페이지를 가리고 있었음 -->
  
  <!-- 캐릭터 다이얼로그 (스크롤 트리거) - 특정 라우트에서만 표시 -->
  <CharacterDialog 
    :visible="showDialog && route.name !== 'landing' && route.name !== 'home'" 
    text="Welcome! Let's start your fitness journey together! 💪" 
    :character-image="mainCharacterBelle"
  />

  <!-- 라우터 뷰 -->
  <router-view @scroll="handleScroll" />

  <!-- 전역 채팅 창 (랜딩, 회원가입 페이지 제외) -->
  <ChatWindow 
    v-if="!['landing', 'signup'].includes(route.name)"
    :visible="uiStore.isChatOpen"
    :npc-id="uiStore.currentNpcId"
    @close="uiStore.closeChat()"
  />
</template>
