import api from './axios'

/**
 * NPC 및 대화 API
 * 백엔드 API: /api/npc
 */
export const npcApi = {
    /**
     * NPC 목록 조회 (호감도 포함)
     * GET /api/npc
     * @returns {Promise<{data: NpcInfoResponse[]}>}
     */
    async getNpcList() {
        return api.get('/npc')
    },

    /**
     * 대화 로그 조회
     * GET /api/npc/chat
     * @param {Object} params - { npcId, page, size }
     * @returns {Promise<{data: ChatLogResponse[]}>}
     */
    async getChatLog(params) {
        return api.get('/npc/chat', { params })
    },

    /**
     * NPC와 대화하기
     * POST /api/npc/chat
     * @param {Object} request - { npcId, message }
     * @returns {Promise<{data: ChatTalkResponse}>}
     */
    async sendChat(request) {
        return api.post('/npc/chat', request)
    }
}
