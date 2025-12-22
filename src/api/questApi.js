import api from './axios'

/**
 * 퀘스트 API
 * 백엔드 API: /api/quest
 */
export const questApi = {
    /**
     * 퀘스트 목록 조회
     * GET /api/quest
     * @returns {Promise<{data: QuestResponse[]}>}
     */
    async getQuestList() {
        return api.get('/quest')
    },

    /**
     * 퀘스트 상세 조회
     * GET /api/quest/{questId}
     * @param {number} questId
     * @returns {Promise<{data: QuestResponse}>}
     */
    async getQuestDetail(questId) {
        return api.get(`/quest/${questId}`)
    },

    /**
     * 퀘스트 수락
     * POST /api/quest/{questId}/accept
     * @param {number} questId
     * @returns {Promise<{data: { success, message, ... }}>}
     */
    async acceptQuest(questId) {
        return api.post(`/quest/${questId}/accept`)
    },

    /**
     * 퀘스트 완료
     * PATCH /api/quest/{questId}/complete
     * @param {number} questId
     * @returns {Promise<{data: { success, message, ... }}>}
     */
    async completeQuest(questId) {
        return api.patch(`/quest/${questId}/complete`)
    }
}
