import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const activeTab = ref('diet')
    const isSidebarOpen = ref(true)
    const showAiChat = ref(false)

    // 채팅창 전역 상태
    const isChatOpen = ref(false)
    const currentNpcId = ref(1) // 기본값 1 (토마)

    const setActiveTab = (tab) => {
        activeTab.value = tab
    }

    const toggleSidebar = () => {
        isSidebarOpen.value = !isSidebarOpen.value
    }

    const toggleAiChat = () => {
        showAiChat.value = !showAiChat.value
    }

    // 채팅창 열기 (NPC ID 지정 가능)
    const openChat = (npcId = 1) => {
        currentNpcId.value = npcId
        isChatOpen.value = true
        showAiChat.value = false // 채팅창 열리면 말풍선 닫기
    }

    // 채팅창 닫기
    const closeChat = () => {
        isChatOpen.value = false
    }

    return {
        activeTab,
        isSidebarOpen,
        showAiChat,
        isChatOpen,
        currentNpcId,
        setActiveTab,
        toggleSidebar,
        toggleAiChat,
        openChat,
        closeChat
    }
})
