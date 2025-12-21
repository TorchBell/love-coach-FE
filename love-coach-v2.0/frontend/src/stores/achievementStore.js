import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { achievementApi } from '@/api/achievementApi'

/**
 * 업적 상태 관리
 */
export const useAchievementStore = defineStore('achievement', () => {
    // 상태
    const achievements = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // Getters - 상태별 분류
    const completedAchievements = computed(() =>
        achievements.value.filter(a => a.isAchieved === true)
    )
    const inProgressAchievements = computed(() =>
        achievements.value.filter(a => a.isAchieved === false && a.progress > 0)
    )
    const lockedAchievements = computed(() =>
        achievements.value.filter(a => a.isAchieved === false && (!a.progress || a.progress === 0))
    )

    /**
     * 업적 목록 조회
     */
    const fetchAchievements = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await achievementApi.getAchievementList()
            achievements.value = response.data || []
        } catch (err) {
            console.error('Failed to fetch achievements:', err)
            error.value = err.response?.data?.message || '업적을 불러오는데 실패했습니다.'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 업적 상세 조회
     * @param {number} achievementId
     */
    const getAchievementDetail = async (achievementId) => {
        try {
            const response = await achievementApi.getAchievementDetail(achievementId)
            return response.data
        } catch (err) {
            console.error('Failed to fetch achievement detail:', err)
            return null
        }
    }

    return {
        achievements,
        isLoading,
        error,
        completedAchievements,
        inProgressAchievements,
        lockedAchievements,
        fetchAchievements,
        getAchievementDetail
    }
})
