import api from './axios'

/**
 * 업적 API
 * 백엔드 API: /api/achievement
 */
export const achievementApi = {
    /**
     * 업적 목록 조회
     * GET /api/achievement
     * @returns {Promise<{data: AchievementResponse[]}>}
     */
    async getAchievementList() {
        return api.get('/achievement')
    },

    /**
     * 업적 상세 조회
     * GET /api/achievement/{achievementId}
     * @param {number} achievementId
     * @returns {Promise<{data: AchievementResponse}>}
     */
    async getAchievementDetail(achievementId) {
        return api.get(`/achievement/${achievementId}`)
    }
}
