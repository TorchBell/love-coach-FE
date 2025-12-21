import api from './axios'

/**
 * 인증 관련 API
 * 백엔드 API: /api/users
 */
export const authApi = {
    /**
     * 로그인
     * POST /api/users/login
     * @param {Object} credentials - { email, password }
     * @returns {Promise<{data: UserInfoResponse}>}
     */
    async login(credentials) {
        return api.post('/users/login', credentials)
    },

    /**
     * 로그아웃
     * GET /api/users/logout
     */
    async logout() {
        return api.get('/users/logout')
    },

    /**
     * 회원가입
     * POST /api/users/join
     * @param {Object} userData - { email, password, nickname, gender, birthDate }
     */
    async signup(userData) {
        return api.post('/users/join', userData)
    },

    /**
     * 사용자 정보 조회
     * GET /api/users/info
     * @returns {Promise<{data: UserInfoResponse}>}
     */
    async getUserProfile() {
        return api.get('/users/info')
    },

    /**
     * 사용자 정보 수정
     * PATCH /api/users
     * @param {Object} data - 수정할 사용자 정보
     * @returns {Promise<{data: UserInfoResponse}>}
     */
    async updateUserProfile(data) {
        return api.patch('/users', data)
    },

    /**
     * 회원 탈퇴
     * DELETE /api/users
     */
    async deleteAccount() {
        return api.delete('/users')
    },

    /**
     * 크레딧 사용
     * POST /api/users/credit-usage
     * @param {Object} request - { amount, description }
     * @returns {Promise<{data: CreditUsageResponse}>}
     */
    async useCredit(request) {
        return api.post('/users/credit-usage', request)
    }
}
