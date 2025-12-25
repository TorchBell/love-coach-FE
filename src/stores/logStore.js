import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logApi } from '@/api/logApi'
import { useAuthStore } from '@/stores/authStore'

/**
 * 20대 남녀 평균 체중 (통계 데이터)
 */
const STATISTICAL_WEIGHT = {
    MALE: 76.59,
    FEMALE: 58.17
};

/**
 * MET 기반 칼로리 계산 함수
 * 소모 칼로리(kcal) = (MET * 3.5 * 체중(kg) * 운동시간(분)) / 200
 */
const calculateCardioCalories = (gender, metValue, durationMinutes) => {
    const weight = gender === 'FEMALE' ? STATISTICAL_WEIGHT.FEMALE : STATISTICAL_WEIGHT.MALE;
    const met = Number(metValue) || 0;
    const duration = Number(durationMinutes) || 0;

    // 공식 적용
    const totalCalories = (met * 3.5 * weight * duration) / 200;
    return Math.round(totalCalories); // 정수로 반환
};

export const useLogStore = defineStore('log', () => {
    const authStore = useAuthStore()

    // 상태
    const dietLogs = ref([])
    const workoutLogs = ref([])
    const runningLogs = ref([])
    const selectedDate = ref(new Date())
    const isLoading = ref(false)
    const error = ref(null)

    // 음식 상세 정보 캐시 (foodId -> detail)
    const foodDetailsMap = ref({})

    // 운동 종목 목록 캐시
    const muscleExercises = ref([])
    const cardioExercises = ref([])

    // 캘린더 스탬프 상태
    const calendarLogStatus = ref({})

    // 계산된 속성 (Getters)
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
    // 월별 통계
    // ============================================

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

    /**
     * 월간 총 영양소 섭취량 (탄/단/지/당)
     * foodDetailsMap을 우선 참조하여 계산
     */
    const monthlyTotalNutrients = computed(() => {
        return dietLogs.value.reduce((acc, log) => {
            const quantity = Number(log.quantity) || 1

            // 1. 캐시된 음식 정보 확인
            const detail = foodDetailsMap.value[log.foodId]

            let c = 0, p = 0, f = 0, s = 0

            if (detail) {
                // API 응답 구조에 따라 조정
                c = Number(detail.carb) || Number(detail.carbohydrate) || 0
                p = Number(detail.protein) || 0
                f = Number(detail.fat) || 0
                s = Number(detail.sugar) || 0
            } else {
                // 2. 기존 DTO 필드 확인 (Fallback)
                c = Number(log.carb) || Number(log.carbohydrate) || 0
                p = Number(log.protein) || 0
                f = Number(log.fat) || 0
                s = Number(log.sugar) || 0

                // 3. food 객체 내부 확인
                if (log.food) {
                    if (c === 0) c = Number(log.food.carb) || Number(log.food.carbohydrate) || 0
                    if (p === 0) p = Number(log.food.protein) || 0
                    if (f === 0) f = Number(log.food.fat) || 0
                    if (s === 0) s = Number(log.food.sugar) || 0
                }
            }

            return {
                carbohydrate: acc.carbohydrate + (c * quantity),
                protein: acc.protein + (p * quantity),
                fat: acc.fat + (f * quantity),
                sugar: acc.sugar + (s * quantity)
            }
        }, { carbohydrate: 0, protein: 0, fat: 0, sugar: 0 })
    })

    /**
     * 월 별 총 섭취 칼로리 (kcal)
     * 영양소 기반 계산 (탄*4 + 단*4 + 지*9)
     * (추가: 만약 영양소가 0이면 log.calory 합산을 fallback으로 사용)
     */
    const monthlyTotalCaloriesIntake = computed(() => {
        const { carbohydrate, protein, fat } = monthlyTotalNutrients.value
        const nutrientsCal = (carbohydrate * 4) + (protein * 4) + (fat * 9)

        if (nutrientsCal > 0) return nutrientsCal

        // 영양소가 없으면 기존 calory 필드 합산 시도
        return dietLogs.value.reduce((total, log) => {
            const cal = Number(log.calory) || Number(log.calorie) || (log.food ? (Number(log.food.calory) || Number(log.food.calorie)) : 0) || 0
            const qty = Number(log.quantity) || 1
            return total + (cal * qty)
        }, 0)
    })

    /**
     * 식단 기록 일수 (날짜 포맷 정규화)
     * "2024-05-20", "2024-05-20T12:00:00", "2024-05-20 12:00:00" 모두 처리
     */
    const dietDaysCount = computed(() => {
        const dates = new Set(
            dietLogs.value
                .map(log => {
                    const d = log.date || log.registDate
                    if (!d) return null
                    // YYYY-MM-DD 추출 (길이가 충분하면 앞 10자리)
                    if (d.length >= 10) return d.substring(0, 10)
                    return d
                })
                .filter(d => !!d)
        )
        return dates.size
    })

    /**
     * RPG 스탯 계산 (STR - 근력)
     * 공식: 총 볼륨 / 30일 / 400
     */
    const strStat = computed(() => {
        return Math.floor(monthlyTotalVolume.value / 30 / 400)
    })

    /**
     * RPG 스탯 계산 (DEX - 민첩/유산소)
     * 공식: 총 운동시간(분) * 평균강도 / 100
     * 평균강도: METs 사용 (없으면 기본값 1)
     */
    const dexStat = computed(() => {
        const totalDuration = runningLogs.value.reduce((sum, log) => sum + (Number(log.durationMinutes) || 0), 0)

        if (totalDuration === 0) return 0

        // 가중 평균 강도 계산
        const weightedIntensitySum = runningLogs.value.reduce((sum, log) => {
            const duration = Number(log.durationMinutes) || 0
            // exercise 정보가 있으면 mets 사용, 없으면 대략 5(중강도)
            const exercise = cardioExercises.value.find(e => e.cardioExerciseId === log.cardioExerciseId)
            const intensity = exercise ? (exercise.mets || 5) : 5
            return sum + (duration * intensity)
        }, 0)

        const avgIntensity = weightedIntensitySum / totalDuration

        return Math.floor((totalDuration * avgIntensity) / 100)
    })

    /**
     * 일별 통계 데이터 (차트용)
     * 날짜별로 합산된 데이터를 반환 { 'YYYY-MM-DD': value, ... }
     */
    const dailyDietStats = computed(() => {
        const stats = {}
        dietLogs.value.forEach(log => {
            let date = log.date || log.registDate;
            if (!date) return
            if (date.length >= 10) date = date.substring(0, 10) // 정규화

            const qty = Number(log.quantity) || 1
            // foodDetailsMap 활용하여 정확한 칼로리 계산
            let cal = 0
            const detail = foodDetailsMap.value[log.foodId]
            if (detail) {
                const c = Number(detail.carb) || Number(detail.carbohydrate) || 0
                const p = Number(detail.protein) || 0
                const f = Number(detail.fat) || 0
                cal = (c * 4) + (p * 4) + (f * 9)
            } else {
                // Fallback
                cal = Number(log.calory) || Number(log.calorie) || (log.food ? (Number(log.food.calory) || Number(log.food.calorie)) : 0) || 0
            }
            if (!stats[date]) stats[date] = 0
            stats[date] += (cal * qty)
        })
        return stats
    })

    const dailyWorkoutStats = computed(() => {
        const stats = {}
        workoutLogs.value.forEach(log => {
            let date = log.date || log.registDate;
            if (!date) return
            if (date.length >= 10) date = date.substring(0, 10)

            const vol = (Number(log.weight) || 0) * (Number(log.setCount) || 0) * (Number(log.repsPerSet) || 0)
            if (!stats[date]) stats[date] = 0
            stats[date] += vol
        })
        return stats
    })

    const dailyRunningStats = computed(() => {
        const stats = {}
        runningLogs.value.forEach(log => {
            let date = log.date || log.registDate;
            if (!date) return
            if (date.length >= 10) date = date.substring(0, 10)

            const kcal = Number(log.burnedKcal) || 0
            if (!stats[date]) stats[date] = 0
            stats[date] += kcal
        })
        return stats
    })

    // 동작 (Actions)
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

            // [DISABLED] 음식 상세 정보 추가 로드 - 백엔드 API가 없어서 주석 처리
            // 추후 백엔드에 /api/food/info/{foodId} API가 구현되면 활성화
            /*
            const missingFoodIds = [...new Set(dietLogs.value
                .map(log => log.foodId)
                .filter(id => id && !foodDetailsMap.value[id])
            )]

            if (missingFoodIds.length > 0) {
                const detailPromises = missingFoodIds.map(id =>
                    logApi.getFoodInfo(id)
                        .then(res => ({ id, data: res.data }))
                        .catch(() => null)
                )

                const results = await Promise.all(detailPromises)

                results.forEach(res => {
                    if (res && res.data) {
                        foodDetailsMap.value[res.id] = res.data
                    }
                })
            }
            */

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
     * 운동 시간(분)만 입력받아 칼로리를 자동 계산함
     * @param {Object} logData - { cardioExerciseId, durationMinutes } (burnedKcal은 자동 계산)
     */
    const addRunningLog = async (logData) => {
        try {
            // 칼로리 자동 계산
            let burnedKcal = 0
            if (logData.cardioExerciseId && logData.durationMinutes) {
                const exercise = cardioExercises.value.find(e => e.cardioExerciseId === logData.cardioExerciseId)
                const mets = exercise ? (exercise.mets || 5) : 5 // 기본값 5
                const gender = authStore.user?.gender || 'MALE'
                burnedKcal = calculateCardioCalories(gender, mets, logData.durationMinutes)
            }

            await logApi.addRunningLog({
                ...logData,
                burnedKcal, // 계산된 칼로리 전송
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
            // 칼로리 자동 계산 (수정 시에도 시간/종목 변경 시 재계산)
            let burnedKcal = logData.burnedKcal // 기존 값 유지 우선 (만약 넘어왔다면)

            // 만약 시간이 변경되었거나 명시적으로 계산이 필요한 경우 로직 수행 가능
            if (logData.cardioExerciseId && logData.durationMinutes) {
                const exercise = cardioExercises.value.find(e => e.cardioExerciseId === logData.cardioExerciseId)
                const mets = exercise ? (exercise.mets || 5) : 5
                const gender = authStore.user?.gender || 'MALE'
                burnedKcal = calculateCardioCalories(gender, mets, logData.durationMinutes)
            }

            await logApi.updateRunningLog(cardioLogId, {
                ...logData,
                burnedKcal,
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
        // 상태
        dietLogs,
        workoutLogs,
        runningLogs,
        selectedDate,
        isLoading,
        error,
        muscleExercises,
        cardioExercises,
        calendarLogStatus,
        // 계산된 속성
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
        monthlyTotalNutrients,
        dietDaysCount,
        strStat,
        dexStat,
        dailyDietStats,
        dailyWorkoutStats,
        dailyRunningStats,
        // 동작
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
