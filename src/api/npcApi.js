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
     * GET /api/npc/chat?npcId={npcId}&page={page}&size={size}
     * @param {number} npcId - NPC ID (필수)
     * @param {number} page - 페이지 번호 (1부터 시작, 백엔드 기준)
     * @param {number} size - 페이지당 개수
     * @returns {Promise<{data: ChatLogResponse[]}>}
     */
    async getChatLog(npcId, page = 1, size = 20) {
        // URL에 직접 쿼리스트링 구성하여 npcId 확실히 전달
        const url = `/npc/chat?npcId=${npcId}&page=${page}&size=${size}`
        console.log('[npcApi] getChatLog URL:', url)
        return api.get(url)
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
