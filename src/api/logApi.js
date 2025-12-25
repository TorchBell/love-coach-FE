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
     * 음식 상세 정보 조회
     * GET /api/food/detail/{foodId}
     * (NOTE: 백엔드 API 경로가 /food/{foodId}는 UserFood 조회일 가능성이 높음. 
     *  프론트 요청상 foodId로 음식검색이 필요하므로, /food/search?keyword=... 외에 ID 조회가 없다면
     *  백엔드 스펙에 따라 달라지겠지만, 여기서는 일반적인 REST 관례인 /food/detail/{foodId} 또는 /food/info/{foodId} 등을 시도해볼 수 있음.
     *  하지만 현재 정보로는 알 수 없으므로, 사용자 말대로 "음식검색으로" 찾는다면 searchFood를 써야할 수도 있음.
     *  그러나 ID로 검색하려면 정확한 ID 조회가 필요함. 
     *  일단 /food/search-by-id/{foodId} 같은 가상의 엔드포인트를 쓰거나, 
     *  기존 searchFood가 ID 검색도 지원하는지 확인 필요하지만,
     *  여기서는 안전하게 /food/public/{foodId} 혹은 /food/info/{foodId} 등을 가정하고 추가하되,
     *  만약 404가 뜨면 수정해야 함. 
     *  
     *  **Case 2**: /api/food/{foodId}가 UserFood가 아니라 Food 조회일 수도 있음. 
     *  하지만 getDietLogDetail(userFoodId)가 /api/food/{userFoodId}를 쓰고 있음. 명확한 충돌.
     *  
     *  따라서 /api/food/data/{foodId} 등으로 가정하거나, searchFood를 활용해야 함.
     *  만약 백엔드에 ID 조회 API가 없다면 searchFood로 이름을 검색해서 매칭해야 하는 비효율적인 상황임.
     *  
     *  사용자의 "user_food dto에 있는 foodId로 음식검색으로 이걸 전부 찾아서" 라는 말에 힌트가 있음.
     *  아마도 /api/food/search?foodId=... 는 아닐테고.
     *  
     *  일단 가장 가능성 높은 /api/food-info/{foodId} 로 시도해보고, 안되면 프론트 console 에러를 보고 수정하겠음.
     *  아니면 일단 logApi.js에 food 관련 public API가 있을 수 있음.
     * )
     * 
     * -> 일단 가장 안전한 방법은 없고, 코드를 수정해서라도 만들어야 함.
     * 여기서는 /food/search 를 쓸 수 밖에 없다면, response DTO 구조를 보고 판단해야함.
     * 
     * **Strategy**: 
     * 1. logApi에 getFoodInfo(foodId) 추가. (GET /api/food/info/{foodId} 가정)
     */
    async getFoodInfo(foodId) {
        // 임시 엔드포인트: 백엔드 구현에 따라 수정 필요
        return api.get(`/food/info/${foodId}`)
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
