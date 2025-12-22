import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { npcApi } from '@/api/npcApi'

/**
 * NPC 및 대화 상태 관리
 */
export const useNpcStore = defineStore('npc', () => {
    // 상태
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
     * @param {number} npcId - NPC ID (필수)
     * @param {number} page - 1부터 시작 (백엔드 구현 기준)
     * @param {number} size - 페이지당 대화 수 (기본값: 20)
     */
    const fetchChatLog = async (npcId, page = 1, size = 20) => {
        isLoading.value = true
        console.log('[npcStore] fetchChatLog called with:', { npcId, page, size })
        try {
            const response = await npcApi.getChatLog(npcId, page, size)
            console.log('[npcStore] API raw response:', response)
            console.log('[npcStore] API response.data:', response.data)

            const rawLogs = response.data || []
            console.log('[npcStore] rawLogs length:', rawLogs.length)
            console.log('[npcStore] rawLogs sample:', rawLogs[0])

            // 필드명 정규화 (snake_case -> camelCase 변환)
            const newLogs = rawLogs.map(log => ({
                chatId: log.chatId || log.chat_id,
                messageUser: log.messageUser || log.message_user,
                messageAi: log.messageAi || log.message_ai,
                createdAt: log.createdAt || log.created_at,
                npcId: log.npcId || log.npc_id,
                usersId: log.usersId || log.users_id
            }))
            console.log('[npcStore] normalized newLogs sample:', newLogs[0])

            // Backend returns newest first, we need oldest first for display
            // 페이지 1이면 초기화, 그 외는 앞에 추가 (무한 스크롤 - 과거 기록 로드)
            if (page === 1) {
                chatLogs.value = [...newLogs].reverse() // 최신순 -> 과거순으로 뒤집기
            } else {
                // 이전 페이지 데이터를 앞에 추가
                chatLogs.value = [...newLogs.reverse(), ...chatLogs.value]
            }
            console.log('[npcStore] chatLogs after update:', chatLogs.value.length)

            return newLogs // 데이터 반환 (추가 로딩 여부 판단용)
        } catch (err) {
            console.error('[npcStore] Failed to fetch chat logs:', err)
            console.error('[npcStore] Error response:', err.response)
            error.value = err.response?.data?.message || '대화 기록을 불러오는데 실패했습니다.'
            return []
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 채팅 로그 초기화
     */
    const clearChatLogs = () => {
        chatLogs.value = []
    }

    /**
     * NPC와 대화하기
     * @param {number} npcId
     * @param {string} message
     */
    const sendMessage = async (npcId, message) => {
        console.log('[npcStore] sendMessage:', { npcId, message })

        // 1. 사용자 메시지 즉시 추가 (낙관적 업데이트)
        chatLogs.value.push({
            messageUser: message,
            messageAi: null,
            createdAt: new Date().toISOString()
        })

        try {
            const response = await npcApi.sendChat({ npcId, message })
            console.log('[npcStore] sendChat response:', response)

            // 2. 대화 성공 시 AI 응답 추가
            if (response.data && response.data.messageAi) {
                console.log('[npcStore] AI Response:', response.data)

                // 마지막 메시지(방금 사용자가 보낸 것)에 AI 응답을 합칠 수도 있고, 
                // 별도 버블로 띄울 수도 있는데, 현재 구조는 User/AI가 한 쌍임.
                // 하지만 UI상으로는 분리되어 보임.
                // 일단 새로운 로그로 AI 응답만 추가하는 방식으로 처리 (또는 기존 로그 업데이트)

                // 가장 최근 로그(방금 추가한 것)를 찾아서 AI 메시지 업데이트
                const lastLog = chatLogs.value[chatLogs.value.length - 1]
                if (lastLog && lastLog.messageUser === message) {
                    lastLog.messageAi = response.data.messageAi
                    lastLog.chatId = response.data.chatId // ID 업데이트
                } else {
                    // 혹시 순서가 꼬였다면 새로 추가
                    chatLogs.value.push({
                        messageUser: null,
                        messageAi: response.data.messageAi,
                        createdAt: new Date().toISOString()
                    })
                }
            }

            // NPC 정보 갱신
            await fetchNpcs()
            return response.data
        } catch (err) {
            console.error('Failed to send message:', err)
            error.value = err.response?.data?.message || '메시지 전송에 실패했습니다.'

            // 에러 시 방금 추가한 메시지에 에러 표시 또는 삭제
            // 여기서는 간단히 에러 상태만 남김
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
        getAffinity,
        clearChatLogs
    }
})
