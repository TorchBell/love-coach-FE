import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logApi } from '@/api/logApi'

export const useLogStore = defineStore('log', () => {
    const dietLogs = ref([])
    const workoutLogs = ref([])
    const runningLogs = ref([])
    const selectedDate = ref(new Date())
    const dashboardStats = ref({})

    // Getters (Computed)
    const formattedSelectedDate = computed(() => {
        const year = selectedDate.value.getFullYear()
        const month = selectedDate.value.getMonth() + 1
        const day = selectedDate.value.getDate()
        return `${year}년 ${month}월 ${day}일`
    })

    const filteredDietLogs = computed(() =>
        dietLogs.value.filter(log => log.date === selectedDate.value.toDateString())
    )
    const filteredWorkoutLogs = computed(() =>
        workoutLogs.value.filter(log => log.date === selectedDate.value.toDateString())
    )
    const filteredRunningLogs = computed(() =>
        runningLogs.value.filter(log => log.date === selectedDate.value.toDateString())
    )

    // Actions
    const setSelectedDate = (date) => {
        selectedDate.value = date
    }

    const fetchLogs = async () => {
        const dateStr = selectedDate.value.toDateString()
        try {
            const [dietRes, workoutRes, runningRes] = await Promise.all([
                logApi.getDietLogs(dateStr),
                logApi.getWorkoutLogs(dateStr),
                logApi.getRunningLogs(dateStr)
            ])

            // In a real app, we might append or replace. 
            // For this mock, we'll just set them if they are empty or merge.
            // To keep it simple and consistent with the mock API returning fixed data:
            if (dietLogs.value.length === 0) dietLogs.value = dietRes.data
            if (workoutLogs.value.length === 0) workoutLogs.value = workoutRes.data
            if (runningLogs.value.length === 0) runningLogs.value = runningRes.data

        } catch (error) {
            console.error('Failed to fetch logs:', error)
        }
    }

    const addDietLog = async (logData) => {
        try {
            const response = await logApi.addDietLog(logData)
            dietLogs.value.push(response.data)
        } catch (error) {
            console.error('Failed to add diet log:', error)
        }
    }

    const addWorkoutLog = async (logData) => {
        try {
            const response = await logApi.addWorkoutLog(logData)
            workoutLogs.value.push(response.data)
        } catch (error) {
            console.error('Failed to add workout log:', error)
        }
    }

    const addRunningLog = async (logData) => {
        try {
            const response = await logApi.addRunningLog(logData)
            runningLogs.value.push(response.data)
        } catch (error) {
            console.error('Failed to add running log:', error)
        }
    }

    const fetchDashboardStats = async (type) => {
        try {
            const response = await logApi.getDashboardStats(type)
            dashboardStats.value = response.data
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error)
        }
    }

    const achievements = ref({ unlocked: [], progress: [], locked: [] })

    const fetchAchievements = async () => {
        try {
            const response = await logApi.getAchievements()
            achievements.value = response.data
        } catch (error) {
            console.error('Failed to fetch achievements:', error)
        }
    }

    return {
        dietLogs,
        workoutLogs,
        runningLogs,
        selectedDate,
        formattedSelectedDate,
        filteredDietLogs,
        filteredWorkoutLogs,
        filteredRunningLogs,
        dashboardStats,
        setSelectedDate,
        fetchLogs,
        addDietLog,
        addWorkoutLog,
        addRunningLog,
        fetchDashboardStats,
        achievements,
        fetchAchievements
    }
})
