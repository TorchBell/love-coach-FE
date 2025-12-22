import api from './axios'

/**
 * 활동 기록 API
 * 식단(Food), 근력(Muscle), 유산소(Cardio) 관련
 */
export const logApi = {
    // ==========================================
    // 식단 (Food) API - /api/food
    // ==========================================

    /**
     * 음식 검색
     * GET /api/food/search?keyword=xxx
     * @param {string} keyword
     * @returns {Promise<{data: FoodResponse[]}>}
     */
    async searchFood(keyword) {
        return api.get('/food/search', { params: { keyword } })
    },

    /**
     * 월별 식단 기록 조회
     * GET /api/food?year=YYYY&month=MM
     * @param {number} year
     * @param {number} month
     * @returns {Promise<{data: UserFoodResponse[]}>}
     */
    async getDietLogs(year, month) {
        return api.get('/food', { params: { year, month } })
    },

    /**
     * 식단 기록 상세 조회
     * GET /api/food/{userFoodId}
     * @param {number} userFoodId
     * @returns {Promise<{data: UserFoodResponse}>}
     */
    async getDietLogDetail(userFoodId) {
        return api.get(`/food/${userFoodId}`)
    },

    /**
     * 식단 기록 등록
     * POST /api/food
     * @param {Object} logData - { foodId, date, quantity }
     */
    async addDietLog(logData) {
        return api.post('/food', logData)
    },

    /**
     * 식단 기록 수정
     * PUT /api/food/{userFoodId}
     * @param {number} userFoodId
     * @param {Object} logData - { foodId, date, quantity }
     */
    async updateDietLog(userFoodId, logData) {
        return api.put(`/food/${userFoodId}`, logData)
    },

    /**
     * 식단 기록 삭제
     * DELETE /api/food/{userFoodId}
     * @param {number} userFoodId
     */
    async deleteDietLog(userFoodId) {
        return api.delete(`/food/${userFoodId}`)
    },

    // ==========================================
    // 근력 운동 (Muscle) API - /api/muscle-exercise
    // ==========================================

    /**
     * 근력 운동 종목 목록 조회
     * GET /api/muscle-exercise/exercises
     * @returns {Promise<{data: MuscleExerciseResponse[]}>}
     */
    async getMuscleExercises() {
        return api.get('/muscle-exercise/exercises')
    },

    /**
     * 월별 근력 운동 기록 조회
     * GET /api/muscle-exercise?year=YYYY&month=MM
     * @param {number} year
     * @param {number} month
     * @returns {Promise<{data: MuscleLogResponse[]}>}
     */
    async getWorkoutLogs(year, month) {
        return api.get('/muscle-exercise', { params: { year, month } })
    },

    /**
     * 근력 운동 기록 상세 조회
     * GET /api/muscle-exercise/{muscleLogId}
     * @param {number} muscleLogId
     * @returns {Promise<{data: MuscleLogResponse}>}
     */
    async getWorkoutLogDetail(muscleLogId) {
        return api.get(`/muscle-exercise/${muscleLogId}`)
    },

    /**
     * 근력 운동 기록 등록
     * POST /api/muscle-exercise
     * @param {Object} logData - { muscleExerciseId, date, setCount, repsPerSet, weight }
     */
    async addWorkoutLog(logData) {
        return api.post('/muscle-exercise', logData)
    },

    /**
     * 근력 운동 기록 수정
     * PUT /api/muscle-exercise/{muscleLogId}
     * @param {number} muscleLogId
     * @param {Object} logData
     */
    async updateWorkoutLog(muscleLogId, logData) {
        return api.put(`/muscle-exercise/${muscleLogId}`, logData)
    },

    /**
     * 근력 운동 기록 삭제
     * DELETE /api/muscle-exercise/{muscleLogId}
     * @param {number} muscleLogId
     */
    async deleteWorkoutLog(muscleLogId) {
        return api.delete(`/muscle-exercise/${muscleLogId}`)
    },

    // ==========================================
    // 유산소 운동 (Cardio) API - /api/cardio-exercise
    // ==========================================

    /**
     * 유산소 운동 종목 목록 조회
     * GET /api/cardio-exercise/exercises
     * @returns {Promise<{data: CardioExerciseResponse[]}>}
     */
    async getCardioExercises() {
        return api.get('/cardio-exercise/exercises')
    },

    /**
     * 월별 유산소 운동 기록 조회
     * GET /api/cardio-exercise?year=YYYY&month=MM
     * @param {number} year
     * @param {number} month
     * @returns {Promise<{data: CardioLogResponse[]}>}
     */
    async getRunningLogs(year, month) {
        return api.get('/cardio-exercise', { params: { year, month } })
    },

    /**
     * 유산소 운동 기록 상세 조회
     * GET /api/cardio-exercise/{cardioLogId}
     * @param {number} cardioLogId
     * @returns {Promise<{data: CardioLogResponse}>}
     */
    async getRunningLogDetail(cardioLogId) {
        return api.get(`/cardio-exercise/${cardioLogId}`)
    },

    /**
     * 유산소 운동 기록 등록
     * POST /api/cardio-exercise
     * @param {Object} logData - { cardioExerciseId, date, durationMinutes, burnedKcal }
     */
    async addRunningLog(logData) {
        return api.post('/cardio-exercise', logData)
    },

    /**
     * 유산소 운동 기록 수정
     * PUT /api/cardio-exercise/{cardioLogId}
     * @param {number} cardioLogId
     * @param {Object} logData
     */
    async updateRunningLog(cardioLogId, logData) {
        return api.put(`/cardio-exercise/${cardioLogId}`, logData)
    },

    /**
     * 유산소 운동 기록 삭제
     * DELETE /api/cardio-exercise/{cardioLogId}
     * @param {number} cardioLogId
     */
    async deleteRunningLog(cardioLogId) {
        return api.delete(`/cardio-exercise/${cardioLogId}`)
    }
}
