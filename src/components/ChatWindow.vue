<script setup>
import { ref, watch, nextTick, onMounted, computed, onUnmounted, onBeforeUnmount } from 'vue'
import { useNpcStore } from '@/stores/npcStore'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import tomaIcon from '@/assets/smallIcon/toma.jpg'
import belleIcon from '@/assets/smallIcon/belle.jpg'
import chiiIcon from '@/assets/smallIcon/chii.jpg'

const props = defineProps({
  visible: Boolean,
  npcId: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['close'])

const npcStore = useNpcStore()

// NPC별 테마 및 정보
const NPC_INFO = {
  1: { 
    name: '토마', 
    color: 'bg-pastel-red', 
    headerColor: 'bg-pastel-red',
    bubbleColor: 'bg-pastel-red',
    dotColor: 'bg-pastel-red',
    icon: tomaIcon 
  },
  2: { 
    name: '벨', 
    color: 'bg-gray-800', 
    headerColor: 'bg-gray-800', 
    bubbleColor: 'bg-gray-800',
    dotColor: 'bg-gray-600',
    icon: belleIcon 
  },
  3: { 
    name: '치이', 
    color: 'bg-yellow-400', 
    headerColor: 'bg-yellow-400', 
    bubbleColor: 'bg-yellow-400',
    dotColor: 'bg-yellow-600',
    icon: chiiIcon 
  }
}

const currentNpc = computed(() => {
  const info = NPC_INFO[props.npcId]
  // 기본값(토마) 또는 완전한 fallback 객체 반환하여 렌더링 에러 방지
  return info || NPC_INFO[1] || {
    name: 'Unknown',
    color: 'bg-gray-200',
    headerColor: 'bg-gray-200',
    bubbleColor: 'bg-gray-200',
    dotColor: 'bg-gray-400',
    icon: ''
  }
})

// 상태 관리
const messageInput = ref('')
const chatContainer = ref(null)
const sentinel = ref(null) // 무한 스크롤용 감시 요소
const isLoadingMore = ref(false)
const currentPage = ref(1) // 백엔드 페이지는 1부터 시작
const hasMore = ref(true)
const isSending = ref(false)
const isInitialLoad = ref(true)

// 날짜/시간 포맷팅
const formatTime = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

const getDayString = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date)
}

// 날짜별 로그 그룹화
const groupedLogs = computed(() => {
  const groups = []
  let currentDate = ''
  
  npcStore.chatLogs.forEach(log => {
    // 타임스탬프 확인
    const ts = log.createdAt || new Date().toISOString()
    const dateObj = new Date(ts)
    const dateKey = dateObj.toDateString() // "Mon Dec 22 2025"
    
    if (dateKey !== currentDate) {
      groups.push({ type: 'date', date: getDayString(ts), id: `date-${ts}-${currentDate}` })
      currentDate = dateKey
    }
    
    // 사용자 메시지
    if (log.messageUser) {
      groups.push({
        type: 'message',
        isUser: true,
        text: log.messageUser,
        time: formatTime(ts),
        id: `user-${log.chatId || ts}`
      })
    }
    
    // AI 메시지
    if (log.messageAi) {
      groups.push({
        type: 'message',
        isUser: false,
        text: log.messageAi,
        time: formatTime(ts),
        id: `ai-${log.chatId || ts}`
      })
    }
  })
  
  return groups
})

// 스크롤 처리 - 바닥으로 빠르게 스크롤
const scrollToBottom = async (instant = false) => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: instant ? 'auto' : 'smooth'
    })
  }
}

// 무한 스크롤 로직
const loadMoreMessages = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  isLoadingMore.value = true
  const prevHeight = chatContainer.value?.scrollHeight || 0
  const prevScrollTop = chatContainer.value?.scrollTop || 0
  
  currentPage.value++
  // NPC ID 사용 (props)
  const newMessages = await npcStore.fetchChatLog(props.npcId, currentPage.value, 20)
  
  if (!newMessages || newMessages.length < 20) {
    hasMore.value = false
  }
  
  isLoadingMore.value = false
  
  // 사용자의 시각적 위치 유지를 위해 스크롤 위치 복원
  await nextTick()
  if (chatContainer.value) {
    const newHeight = chatContainer.value.scrollHeight
    chatContainer.value.scrollTop = newHeight - prevHeight + prevScrollTop
  }
}

// 무한 스크롤 감시자(Sentinel) 설정
let observer = null

const setupObserver = () => {
  if (observer) {
    observer.disconnect()
  }
  
  observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && props.visible && !isInitialLoad.value) {
      await loadMoreMessages()
    }
  }, { threshold: 0.1 })
  
  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
}

onMounted(() => {
  setupObserver()
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

// 가시성 감시 (창 열림/닫힘)
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    console.log('[ChatWindow] Opening, loading chat history...')
    // 초기화 및 초기 로드
    isInitialLoad.value = true
    currentPage.value = 1
    hasMore.value = true
    npcStore.clearChatLogs() // Use store method instead of direct assignment
    
    try {
      const result = await npcStore.fetchChatLog(props.npcId, 1, 20)
      console.log('[ChatWindow] Fetched logs:', result)
      
      // 20개 미만이면 더 이상 페이지 없음
      if (!result || result.length < 20) {
        hasMore.value = false
      }
      
      await scrollToBottom(true) // 즉시 스크롤
    } catch (err) {
      console.error('[ChatWindow] Error fetching chat logs:', err)
    }
    
    isInitialLoad.value = false
    
    // 초기 로드 후 관찰자 재설정
    await nextTick()
    setupObserver()
  }
})

const handleSend = async () => {
  if (!messageInput.value.trim() || isSending.value) return
  
  isSending.value = true
  const text = messageInput.value
  messageInput.value = ''
  
  // 1. 메시지 전송 요청 (await하지 않고 프로미스 저장)
  // npcStore.sendMessage 내부에서 chatLogs에 내 메시지를 즉시 push함
  const sendPromise = npcStore.sendMessage(props.npcId, text)
  
  // 2. UI 갱신 대기 후 스크롤 (내 메시지 + 로딩 인디케이터 보이기)
  await nextTick()
  await scrollToBottom(false)
  
  // 3. 응답 대기
  await sendPromise
  
  // 4. 전송 완료
  isSending.value = false
  await nextTick()
  await scrollToBottom(false) // AI 응답 후 다시 스크롤
}

// 창이 열릴 때 입력창 포커스
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const input = document.querySelector('.chat-input-field')
      if (input) input.focus()
    })
  }
})
</script>

<template>
  <!-- Bottom-right positioned chat window -->
  <div 
    v-if="visible" 
    class="fixed bottom-24 right-8 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-[100] animate-slide-up h-[600px] max-h-[80vh]"
    @click.stop
  >
    <!-- 헤더 -->
    <div class="p-4 text-white flex justify-between items-center shadow-md relative overflow-hidden" :class="currentNpc.headerColor">
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div class="flex items-center gap-3 z-10">
        <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden shrink-0">
           <img :src="currentNpc.icon" class="w-full h-full object-cover" />
        </div>
        <div>
          <span class="font-bold text-lg tracking-wide block">{{ currentNpc.name }}</span>
          <span class="text-xs text-white/80 font-light flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
      <button @click="$emit('close')" class="p-2 rounded-lg transition-all hover:scale-110 z-10" style="background: rgba(0,0,0,0.2); color: #fff;" title="닫기">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Messages Area -->
    <div 
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-cream/20 to-white"
    >
      <!-- 상단 무한 스크롤 감시 요소 -->
      <div ref="sentinel" class="h-6 w-full flex justify-center items-center">
        <div v-if="isLoadingMore" class="flex items-center gap-2 text-xs text-gray-400">
          <span class="w-4 h-4 border-2 border-pastel-red/30 border-t-pastel-red rounded-full animate-spin"></span>
          <span>이전 대화 불러오는 중...</span>
        </div>
        <div v-else-if="!hasMore && groupedLogs.length > 0" class="text-xs text-gray-400">
          대화의 시작입니다
        </div>
      </div>
      
      <!-- 빈 상태 -->
      <div v-if="groupedLogs.length === 0 && !isLoadingMore" class="flex flex-col items-center justify-center h-full text-gray-400">
        <span class="text-4xl mb-2">💬</span>
        <p class="text-sm">대화를 시작해보세요!</p>
      </div>
      
      <div v-for="item in groupedLogs" :key="item.id">
        <!-- 날짜 구분선 -->
        <div v-if="item.type === 'date'" class="flex items-center justify-center my-4">
          <div class="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500 font-medium shadow-sm">
            {{ item.date }}
          </div>
        </div>
        
        <!-- 메시지 목록 -->
        <div 
          v-else 
          class="flex w-full" 
          :class="item.isUser ? 'justify-end' : 'justify-start'"
        >
          <!-- 내 말풍선 -->
          <div 
            v-if="item.isUser"
            class="p-3 pl-4 rounded-2xl rounded-tr-none shadow-sm text-white max-w-[85%] relative"
            :class="currentNpc.bubbleColor"
          >
            <p class="text-sm leading-relaxed">{{ item.text }}</p>
            <!-- 말풍선 꼬리 -->
            <div class="absolute top-0 -right-2 w-4 h-4 border-t border-r transform rotate-45" :class="[currentNpc.bubbleColor, currentNpc.bubbleColor.replace('bg-', 'border-')]"></div>
            <span 
              class="text-[10px] mt-1 block text-white/70 text-right"
            >
              {{ item.time }}
            </span>
          </div>

          <!-- 상대방 말풍선 -->
          <div 
            v-else
            class="flex flex-col max-w-[85%]"
          >
            <!-- NPC 이름 -->
            <span class="text-[10px] text-gray-500 mb-1 ml-1" style="text-align: left;">{{ currentNpc.name }}</span>
            <div 
              class="p-3 rounded-2xl rounded-tl-none shadow-sm bg-white text-gray-800 border border-gray-100 relative"
            >
              <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ item.text }}</p>
              <span 
                class="text-[10px] mt-1 block text-gray-400"
              >
                {{ item.time }}
              </span>
              <!-- 말풍선 꼬리 -->
              <div class="absolute top-0 -left-2 w-4 h-4 bg-white border-l border-b border-gray-100 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>

      
      <!-- 로딩 인디케이터 (AI 응답 대기 중) -->
      <div v-if="isSending" class="flex w-full justify-start animate-fade-in-up mt-2">
        <div class="flex flex-col max-w-[70%]">
          <!-- NPC 이름 -->
          <span class="text-[10px] text-gray-500 mb-1 ml-1" style="text-align: left;">{{ currentNpc.name }}</span>
          <!-- 로딩 버블 -->
          <div class="p-3 rounded-2xl rounded-tl-none shadow-sm bg-white text-gray-800 border border-gray-100 relative w-fit">
            <div class="flex space-x-1 h-5 items-center">
              <div class="w-2 h-2 rounded-full animate-bounce" :class="currentNpc.dotColor" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 rounded-full animate-bounce" :class="currentNpc.dotColor" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 rounded-full animate-bounce" :class="currentNpc.dotColor" style="animation-delay: 0.2s"></div>
            </div>
            <!-- 말풍선 꼬리 -->
            <div class="absolute top-3 -left-2 w-4 h-4 bg-white border-l border-b border-gray-100 transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 입력 영역 -->
    <div class="p-3 bg-white border-t border-gray-100 shrink-0">
      <div class="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-pastel-red/50 focus-within:bg-white transition-all">
        <input 
          v-model="messageInput"
          @keyup.enter="handleSend"
          type="text" 
          placeholder="메시지를 입력하세요..."
          class="chat-input-field flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-gray-700 placeholder-gray-400"
          :disabled="isSending"
        />
        <button 
          @click="handleSend"
          :disabled="!messageInput.trim() || isSending"
          class="p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          :class="[currentNpc.headerColor, 'hover:opacity-90']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
