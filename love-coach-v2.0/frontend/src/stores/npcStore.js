import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { npcApi } from '@/api/npcApi'

/**
 * NPC 및 대화 상태 관리
 */
export const useNpcStore = defineStore('npc', () => {
    // State
    const npcs = ref([])
    const chatLogs = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // NPC ID별 호감도 맵
    const affinityMap = computed(() => {
        const map = {}
        npcs.value.forEach(npc => {
            map[npc.npcId] = npc.affectionScore || 0
        })
        return map
    })

    /**
     * NPC 목록 조회
     */
    const fetchNpcs = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await npcApi.getNpcList()
            npcs.value = response.data || []
        } catch (err) {
            console.error('Failed to fetch NPCs:', err)
            error.value = err.response?.data?.message || 'NPC 정보를 불러오는데 실패했습니다.'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 대화 로그 조회
     * @param {number} npcId
     */
    const fetchChatLog = async (npcId) => {
        try {
            const response = await npcApi.getChatLog({ npcId })
            chatLogs.value = response.data || []
        } catch (err) {
            console.error('Failed to fetch chat logs:', err)
            error.value = err.response?.data?.message || '대화 기록을 불러오는데 실패했습니다.'
        }
    }

    /**
     * NPC와 대화하기
     * @param {number} npcId
     * @param {string} message
     */
    const sendMessage = async (npcId, message) => {
        try {
            const response = await npcApi.sendChat({ npcId, message })
            // 대화 성공 시 로그에 추가
            if (response.data) {
                chatLogs.value.push({
                    messageUser: message,
                    messageAi: response.data.messageAi,
                    createdAt: new Date().toISOString()
                })
            }
            // NPC 정보 갱신 (호감도 변화 반영)
            await fetchNpcs()
            return response.data
        } catch (err) {
            console.error('Failed to send message:', err)
            error.value = err.response?.data?.message || '메시지 전송에 실패했습니다.'
            return null
        }
    }

    /**
     * 특정 NPC의 호감도 가져오기
     * @param {number} npcId
     */
    const getAffinity = (npcId) => {
        return affinityMap.value[npcId] || 0
    }

    return {
        npcs,
        chatLogs,
        isLoading,
        error,
        affinityMap,
        fetchNpcs,
        fetchChatLog,
        sendMessage,
        getAffinity
    }
})
