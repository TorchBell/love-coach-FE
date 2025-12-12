import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const activeTab = ref('diet')
    const isSidebarOpen = ref(true)
    const showAiChat = ref(false)

    const setActiveTab = (tab) => {
        activeTab.value = tab
    }

    const toggleSidebar = () => {
        isSidebarOpen.value = !isSidebarOpen.value
    }

    const toggleAiChat = () => {
        showAiChat.value = !showAiChat.value
    }

    return {
        activeTab,
        isSidebarOpen,
        showAiChat,
        setActiveTab,
        toggleSidebar,
        toggleAiChat
    }
})
