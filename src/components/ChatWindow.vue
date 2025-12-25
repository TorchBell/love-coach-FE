<script setup>
import { ref, watch, nextTick, onMounted, computed, onUnmounted, onBeforeUnmount } from 'vue'
import { useNpcStore } from '@/stores/npcStore'
import { useUiStore } from '@/stores/uiStore'
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
const uiStore = useUiStore()

// NPC별 테마 및 정보
const NPC_INFO = {
  1: { 
    name: '토마', 
    color: 'bg-pastel-red', 
    headerColor: 'bg-pastel-red',
    bubbleColor: 'bg-pastel-red',
    dotColor: 'bg-pastel-red',
    ringColor: 'ring-pastel-red',
    borderColor: 'border-pastel-red',
    icon: tomaIcon 
  },
  2: { 
    name: '벨', 
    color: 'bg-gray-800', 
    headerColor: 'bg-gray-800', 
    bubbleColor: 'bg-gray-800',
    dotColor: 'bg-gray-600',
    ringColor: 'ring-gray-800',
    borderColor: 'border-gray-800',
    icon: belleIcon 
  },
  3: { 
    name: '치이', 
    color: 'bg-yellow-400', 
    headerColor: 'bg-yellow-400', 
    bubbleColor: 'bg-yellow-400',
    dotColor: 'bg-yellow-600',
    ringColor: 'ring-yellow-400',
    borderColor: 'border-yellow-400',
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
    ringColor: 'ring-gray-400',
    borderColor: 'border-gray-400',
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
  if (!props.npcId) {
    isLoadingMore.value = false
    return
  }
  
  const newMessages = await npcStore.fetchChatLog(props.npcId, currentPage.value, 20)
  
  if (!newMessages || newMessages.length < 20) {
    hasMore.value = false
  }
  
  isLoadingMore.value = false
  
  // 사용자의 시각적 위치 유지를 위해 스크롤 위치 복원
  await nextTick()
  if (chatContainer.value) {
    const newHeight = chatContainer.value.scrollHeight
    // 스크롤 탑 복원: 새 높이 - 예전 높이 + 예전 스크롤탑
    // 예: 1000 - 500 + 0 = 500. 즉 중간쯤으로 이동.
    chatContainer.value.scrollTop = newHeight - prevHeight + prevScrollTop
  }
}

// 무한 스크롤 감시자(Sentinel) 설정
let observer = null

const setupObserver = () => {
  if (observer) {
    observer.disconnect()
  }
  
  // 루트 요소(chatContainer)가 있을 때만 옵저버 설정
  // rootMargin: 상단 50px 미리 감지하여 로딩 시작
  observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && props.visible && !isInitialLoad.value) {
      await loadMoreMessages()
    }
  }, { 
    root: chatContainer.value, 
    threshold: 0.1,
    rootMargin: '50px 0px 0px 0px' 
  })
  
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

// 대화 로그 로드 함수
const loadLogs = async (shouldScrollToBottom = false) => {
    isInitialLoad.value = true
    currentPage.value = 1
    hasMore.value = true
    npcStore.clearChatLogs()
    
    if (!props.npcId) {
        console.error('[ChatWindow] No NPC ID provided')
        isInitialLoad.value = false
        return
    }

    try {
        const result = await npcStore.fetchChatLog(props.npcId, 1, 20)
        
        if (!result || result.length < 20) {
            hasMore.value = false
        }
        
        if (shouldScrollToBottom) {
            await nextTick()
            await scrollToBottom(true)
        }
    } catch (err) {
        console.error('[ChatWindow] Error fetching chat logs:', err)
    } finally {
        isInitialLoad.value = false
        // 초기 로드 후 관찰자 재설정
        await nextTick()
        setupObserver()
    }
}

// 가시성 및 NPC 변경 감시
watch([() => props.visible, () => props.npcId], async ([newVisible, newNpcId], [oldVisible, oldNpcId]) => {
  if (newVisible && (newVisible !== oldVisible || newNpcId !== oldNpcId)) {
    await loadLogs(true)
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
  <!-- Width increased to accommodate sidebar: w-[420px] md:w-[480px] -->
  <div 
    v-if="visible" 
    class="fixed bottom-4 right-4 md:bottom-12 md:right-12 h-[600px] max-h-[80vh] flex flex-row overflow-hidden z-[100] animate-slide-up rounded-[2.5rem] shadow-2xl border border-white/40 bg-white/80 backdrop-blur-xl w-auto max-w-[calc(100vw-2rem)]"
    @click.stop
  >
    <!-- 1. 사이드바 (NPC 선택) -->
    <aside class="w-[5.5rem] bg-indigo-50/50 backdrop-blur-3xl flex flex-col items-center py-6 gap-6 border-r border-white/40 z-20 shadow-[inset_-1px_0_0_rgba(255,255,255,0.3)]">
        <div 
          v-for="(info, id) in NPC_INFO" 
          :key="id"
          class="relative group cursor-pointer transition-transform duration-300"
          :class="props.npcId === Number(id) ? 'scale-110' : 'hover:scale-105'"
          @click="npcStore.fetchChatLog(Number(id)); uiStore.openChat(Number(id))"
        >
          <!-- Active Line Indicator -->
           <div 
            v-if="props.npcId === Number(id)"
            class="absolute -left-[1.8rem] top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            :class="info.headerColor.replace('bg-', 'bg-')"
           ></div>

          <!-- Avatar Container -->
          <div 
            class="w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg relative group-hover:shadow-xl"
            :class="props.npcId === Number(id) ? `${info.borderColor} ring-2 ring-offset-2 ring-offset-white/60 ${info.ringColor}` : 'border-white/50 opacity-60 hover:opacity-100 grayscale-[0.8] hover:grayscale-0'"
          >
            <img :src="info.icon" class="w-full h-full object-cover" />
            
            <!-- Active Glow Overlay -->
             <div v-if="props.npcId === Number(id)" class="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
          </div>
          
          <!-- Tooltip -->
           <span class="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 ml-1 tracking-wider transform translate-x-2 group-hover:translate-x-0">
            {{ info.name }}
           </span>
        </div>
    </aside>

    <!-- 2. 메인 채팅 영역 -->
    <div class="w-80 md:w-96 flex flex-col h-full bg-white relative">
        <!-- 헤더 -->
        <div class="p-4 text-white flex justify-between items-center shadow-sm relative overflow-hidden shrink-0 transition-colors duration-500" :class="currentNpc.headerColor">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div class="flex items-center gap-3 z-10">
            <!-- Header Icon (Small) -->
             <!-- 사이드바가 있으므로 헤더 아이콘은 생략하거나 작게 유지 -->
             <!-- 디자인 선택: 헤더는 이름 중심으로 깔끔하게 -->
            <div>
              <span class="font-bold text-lg tracking-wide block">
                 {{ currentNpc.name }}
              </span>
              <span class="text-xs text-white/80 font-light flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
          <button @click="$emit('close')" class="p-2 rounded-lg transition-all hover:scale-110 z-10 hover:bg-white/20 text-white/90 hover:text-white" title="닫기">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Messages Area -->
        <div 
          ref="chatContainer"
          class="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 relative scroll-smooth"
        >


          <!-- 상단 무한 스크롤 감시 요소 -->
          <div ref="sentinel" class="h-6 w-full flex justify-center items-center shrink-0 z-10 relative">
            <div v-if="isLoadingMore" class="flex items-center gap-2 text-xs text-gray-400">
              <span class="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></span>
              <span>이전 대화...</span>
            </div>
          </div>
          
          <!-- 빈 상태 -->
          <div v-if="groupedLogs.length === 0 && !isLoadingMore" class="flex flex-col items-center justify-center h-full text-gray-400 z-10 relative">
            <p class="text-xs font-medium">{{ currentNpc.name }}와(과) 대화를 시작하세요</p>
          </div>
          
          <div v-for="item in groupedLogs" :key="item.id" class="z-10 relative">
            <!-- 날짜 구분선 -->
            <div v-if="item.type === 'date'" class="flex items-center justify-center my-6">
              <div class="bg-gray-200/60 backdrop-blur-sm px-3 py-0.5 rounded-full text-[10px] text-gray-500 font-medium tracking-wide">
                {{ item.date }}
              </div>
            </div>
            
            <!-- 메시지 목록 -->
            <div 
              v-else 
              class="flex w-full group mb-1" 
              :class="item.isUser ? 'justify-end' : 'justify-start'"
            >
              <!-- 내 말풍선 -->
              <div 
                v-if="item.isUser"
                class="flex flex-col items-end max-w-[85%]"
              >
                 <div 
                   class="p-3 pl-4 rounded-2xl rounded-tr-sm shadow-sm text-white relative transition-transform hover:shadow-md"
                   :class="currentNpc.bubbleColor"
                 >
                   <p class="text-sm leading-relaxed">{{ item.text }}</p>
                 </div>
                 <span class="text-[10px] mt-1 text-gray-300 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">{{ item.time }}</span>
              </div>

              <!-- 상대방 말풍선 -->
              <div 
                v-else
                class="flex flex-col items-start max-w-[85%]"
              >
                <!-- NPC 이름 (처음 또는 날짜 바뀔 때만? 일단 항상 표시하거나 생략) -> 생략하고 시간만 -->
                <div class="flex items-end gap-2">
                   <!-- 아바타 (말풍선 옆 작게) -->
                   <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 self-start mt-1 mr-1 shadow-sm">
                      <img :src="currentNpc.icon" class="w-full h-full object-cover">
                   </div>
                   
                   <div class="flex flex-col text-left">
                       <span class="text-[10px] text-gray-500 ml-1 mb-0.5">{{ currentNpc.name }}</span>
                       <div 
                         class="p-3 rounded-2xl rounded-tl-sm shadow-sm bg-white text-gray-700 border border-gray-100 relative transition-transform hover:shadow-md"
                       >
                         <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ item.text }}</p>
                       </div>
                       <span class="text-[10px] mt-1 text-gray-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">{{ item.time }}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          
          <!-- 로딩 인디케이터 (AI 응답 대기 중) -->
          <div v-if="isSending" class="flex w-full justify-start animate-fade-in-up mt-2 z-10 relative">
             <div class="flex items-end gap-2 ml-1">
                 <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 self-start shadow-sm">
                      <img :src="currentNpc.icon" class="w-full h-full object-cover grayscale-[0.2]">
                   </div>
                 <div class="p-3 rounded-2xl rounded-tl-none shadow-sm bg-white border border-gray-100">
                    <div class="flex space-x-1 h-4 items-center px-1">
                      <div class="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400" style="animation-delay: 0s"></div>
                      <div class="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400" style="animation-delay: 0.1s"></div>
                      <div class="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
             </div>
          </div>
        </div>
        
        <!-- 입력 영역 -->
        <div class="p-3 bg-white border-t border-gray-100 shrink-0 z-20">
          <div class="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-gray-300 focus-within:bg-white transition-all shadow-inner">
            <input 
              v-model="messageInput"
              @keyup.enter="handleSend"
              type="text" 
              placeholder="메시지 보내기..."
              class="chat-input-field flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-gray-700 placeholder-gray-400"
              :disabled="isSending"
            />
            <button 
              @click="handleSend"
              :disabled="!messageInput.trim() || isSending"
              class="p-2 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm transform hover:scale-105 active:scale-95"
              :class="[currentNpc.headerColor]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
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
