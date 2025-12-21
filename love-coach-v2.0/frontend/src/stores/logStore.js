import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logApi } from '@/api/logApi'

/**
 * 활동 기록 (식단, 근력, 유산소) 상태 관리
 */
export const useLogStore = defineStore('log', () => {
    // State
    const dietLogs = ref([])
    const workoutLogs = ref([])
    const runningLogs = ref([])
    const selectedDate = ref(new Date())
    const isLoading = ref(false)
    const error = ref(null)

    // 운동 종목 목록 캐시
    const muscleExercises = ref([])
    const cardioExercises = ref([])

    // Calendar Stamp State
    const calendarLogStatus = ref({})

    // Getters
    const currentYear = computed(() => selectedDate.value.getFullYear())
    const currentMonth = computed(() => selectedDate.value.getMonth() + 1)

    const formattedSelectedDate = computed(() => {
        const year = selectedDate.value.getFullYear()
        const month = selectedDate.value.getMonth() + 1
        const day = selectedDate.value.getDate()
        return `${year}년 ${month}월 ${day}일`
    })

    // 선택된 날짜 문자열 (YYYY-MM-DD)
    const selectedDateString = computed(() => {
        const d = selectedDate.value
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    })

    // 선택된 날짜의 로그만 필터링
    const filteredDietLogs = computed(() =>
        dietLogs.value.filter(log => log.date === selectedDateString.value)
    )
    const filteredWorkoutLogs = computed(() =>
        workoutLogs.value.filter(log => log.date === selectedDateString.value)
    )
    const filteredRunningLogs = computed(() =>
        runningLogs.value.filter(log => log.date === selectedDateString.value)
    )

    // ============================================
    // 월별 통계 (Monthly Statistics)
    // ============================================

    /**
     * 월별 총 섭취 칼로리 (kcal)
     * 계산: sum(calory * quantity) for all diet logs in the month
     */
    const monthlyTotalCaloriesIntake = computed(() => {
        return dietLogs.value.reduce((total, log) => {
            const calory = Number(log.calory) || 0
            const quantity = Number(log.quantity) || 1
            return total + (calory * quantity)
        }, 0)
    })

    /**
     * 월별 총 운동 볼륨 (kg)
     * 계산: sum(weight * setCount * repsPerSet) for all workout logs in the month
     */
    const monthlyTotalVolume = computed(() => {
        return workoutLogs.value.reduce((total, log) => {
            const weight = Number(log.weight) || 0
            const setCount = Number(log.setCount) || 0
            const repsPerSet = Number(log.repsPerSet) || 0
            return total + (weight * setCount * repsPerSet)
        }, 0)
    })

    /**
     * 월별 총 소모 칼로리 (kcal)
     * 계산: sum(burnedKcal) for all running/cardio logs in the month
     */
    const monthlyTotalCaloriesBurned = computed(() => {
        return runningLogs.value.reduce((total, log) => {
            const burnedKcal = Number(log.burnedKcal) || 0
            return total + burnedKcal
        }, 0)
    })

    // Actions
    const setSelectedDate = (date) => {
        selectedDate.value = date
    }

    /**
     * 캘린더 상태 업데이트 (스탬프용)
     */
    const updateCalendarStatus = (dateStr, type) => {
        if (!calendarLogStatus.value[dateStr]) {
            calendarLogStatus.value[dateStr] = []
        }
        if (!calendarLogStatus.value[dateStr].includes(type)) {
            calendarLogStatus.value[dateStr].push(type)
        }
    }

    /**
     * 월별 로그 데이터를 기반으로 캘린더 스탬프 상태 생성
     */
    const buildCalendarStatus = () => {
        calendarLogStatus.value = {}

        // 식단 로그
        dietLogs.value.forEach(log => {
            if (log.date) updateCalendarStatus(log.date, 'diet')
        })
        // 근력 로그
        workoutLogs.value.forEach(log => {
            if (log.date) updateCalendarStatus(log.date, 'workout')
        })
        // 유산소 로그
        runningLogs.value.forEach(log => {
            if (log.date) updateCalendarStatus(log.date, 'running')
        })
    }

    /**
     * 월별 모든 로그 조회
     */
    const fetchMonthlyLogs = async (year = currentYear.value, month = currentMonth.value) => {
        isLoading.value = true
        error.value = null
        try {
            const [dietRes, workoutRes, runningRes] = await Promise.all([
                logApi.getDietLogs(year, month),
                logApi.getWorkoutLogs(year, month),
                logApi.getRunningLogs(year, month)
            ])

            dietLogs.value = dietRes.data || []
            workoutLogs.value = workoutRes.data || []
            runningLogs.value = runningRes.data || []

            // 캘린더 스탬프 상태 업데이트
            buildCalendarStatus()
        } catch (err) {
            console.error('Failed to fetch logs:', err)
            error.value = err.response?.data?.message || '기록을 불러오는데 실패했습니다.'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 운동 종목 목록 로드
     */
    const fetchExercises = async () => {
        try {
            const [muscleRes, cardioRes] = await Promise.all([
                logApi.getMuscleExercises(),
                logApi.getCardioExercises()
            ])
            muscleExercises.value = muscleRes.data || []
            cardioExercises.value = cardioRes.data || []
        } catch (err) {
            console.error('Failed to fetch exercises:', err)
        }
    }

    /**
     * 식단 기록 추가
     * @param {Object} logData - { foodId, date, quantity }
     */
    const addDietLog = async (logData) => {
        try {
            await logApi.addDietLog({
                ...logData,
                date: selectedDateString.value
            })
            // 월별 로그 다시 조회
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to add diet log:', err)
            error.value = err.response?.data?.message || '식단 기록 추가에 실패했습니다.'
            return false
        }
    }

    /**
     * 근력 운동 기록 추가
     * @param {Object} logData - { muscleExerciseId, setCount, repsPerSet, weight }
     */
    const addWorkoutLog = async (logData) => {
        try {
            await logApi.addWorkoutLog({
                ...logData,
                date: selectedDateString.value
            })
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to add workout log:', err)
            error.value = err.response?.data?.message || '운동 기록 추가에 실패했습니다.'
            return false
        }
    }

    /**
     * 유산소 운동 기록 추가
     * @param {Object} logData - { cardioExerciseId, durationMinutes, burnedKcal }
     */
    const addRunningLog = async (logData) => {
        try {
            await logApi.addRunningLog({
                ...logData,
                date: selectedDateString.value
            })
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to add running log:', err)
            error.value = err.response?.data?.message || '유산소 기록 추가에 실패했습니다.'
            return false
        }
    }
    /**
     * 식단 기록 수정
     */
    const updateDietLog = async (userFoodId, logData) => {
        try {
            await logApi.updateDietLog(userFoodId, {
                ...logData,
                date: selectedDateString.value
            })
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to update diet log:', err)
            error.value = err.response?.data?.message || '식단 기록 수정에 실패했습니다.'
            return false
        }
    }

    /**
     * 근력 운동 기록 수정
     */
    const updateWorkoutLog = async (muscleLogId, logData) => {
        try {
            await logApi.updateWorkoutLog(muscleLogId, {
                ...logData,
                date: selectedDateString.value
            })
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to update workout log:', err)
            error.value = err.response?.data?.message || '운동 기록 수정에 실패했습니다.'
            return false
        }
    }

    /**
     * 유산소 운동 기록 수정
     */
    const updateRunningLog = async (cardioLogId, logData) => {
        try {
            await logApi.updateRunningLog(cardioLogId, {
                ...logData,
                date: selectedDateString.value
            })
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to update running log:', err)
            error.value = err.response?.data?.message || '유산소 기록 수정에 실패했습니다.'
            return false
        }
    }

    /**
     * 식단 기록 삭제
     */
    const deleteDietLog = async (userFoodId) => {
        try {
            await logApi.deleteDietLog(userFoodId)
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to delete diet log:', err)
            return false
        }
    }

    /**
     * 근력 운동 기록 삭제
     */
    const deleteWorkoutLog = async (muscleLogId) => {
        try {
            await logApi.deleteWorkoutLog(muscleLogId)
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to delete workout log:', err)
            return false
        }
    }

    /**
     * 유산소 운동 기록 삭제
     */
    const deleteRunningLog = async (cardioLogId) => {
        try {
            await logApi.deleteRunningLog(cardioLogId)
            await fetchMonthlyLogs()
            return true
        } catch (err) {
            console.error('Failed to delete running log:', err)
            return false
        }
    }

    return {
        // State
        dietLogs,
        workoutLogs,
        runningLogs,
        selectedDate,
        isLoading,
        error,
        muscleExercises,
        cardioExercises,
        calendarLogStatus,
        // Getters
        currentYear,
        currentMonth,
        formattedSelectedDate,
        selectedDateString,
        filteredDietLogs,
        filteredWorkoutLogs,
        filteredRunningLogs,
        monthlyTotalCaloriesIntake,
        monthlyTotalVolume,
        monthlyTotalCaloriesBurned,
        // Actions
        setSelectedDate,
        fetchMonthlyLogs,
        fetchExercises,
        addDietLog,
        addWorkoutLog,
        addRunningLog,
        updateDietLog,
        updateWorkoutLog,
        updateRunningLog,
        deleteDietLog,
        deleteWorkoutLog,
        deleteRunningLog
    }
})
