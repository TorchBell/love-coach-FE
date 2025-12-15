import api from './axios'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const logApi = {
    // --- Diet Logs (user_food) ---
    async getDietLogs(date) {
        await delay(300)
        return {
            data: [
                { id: 1, date: date, foodName: '오트밀, 사과 1개', calory: 350, quantity: 1 },
                { id: 2, date: date, foodName: '닭가슴살 샐러드', calory: 450, quantity: 1 },
            ]
        }
    },

    async addDietLog(logData) {
        await delay(300)
        return {
            data: {
                id: Date.now(),
                ...logData
            }
        }
    },

    // --- Workout Logs (muscle_log) ---
    async getWorkoutLogs(date) {
        await delay(300)
        return {
            data: [
                { id: 1, date: date, part: '하체', exerciseName: '스쿼트', setCount: 5, repsPerSet: 12, weight: 0, durationMinutes: 20 },
            ]
        }
    },

    async addWorkoutLog(logData) {
        await delay(300)
        return {
            data: {
                id: Date.now(),
                ...logData
            }
        }
    },

    // --- Running Logs (cardio_log) ---
    async getRunningLogs(date) {
        await delay(300)
        return {
            data: [
                { id: 1, date: date, exerciseType: '달리기', durationMinutes: 35, burnedKcal: 300 },
            ]
        }
    },

    async addRunningLog(logData) {
        await delay(300)
        return {
            data: {
                id: Date.now(),
                ...logData
            }
        }
    },

    // --- Dashboard Stats ---
    async getDashboardStats(type, month) {
        await delay(400)
        if (type === 'diet') {
            return { data: { title: '이번 달 식단', stats: [{ label: '평균 칼로리', value: '1,850' }, { label: '기록일', value: '15일' }] } }
        } else if (type === 'workout') {
            return { data: { title: '이번 달 운동', stats: [{ label: '총 시간', value: '12시간' }, { label: '소모 칼로리', value: '4,500' }] } }
        } else {
            return { data: { title: '이번 달 유산소', stats: [{ label: '총 소모 칼로리', value: '6,200kcal' }, { label: '총 운동 시간', value: '14시간' }] } }
        }
    },

    // --- Achievements ---
    async getAchievements() {
        await delay(300)
        return {
            data: {
                unlocked: [
                    { id: 1, title: '첫 걸음', description: '첫 운동 완료하기', icon: '🎯', reward: '+50 XP', unlockedDate: '2024-01-15', imageKey: 'toma' },
                    { id: 2, title: '식단 기록가', description: '7일 연속 식단 기록하기', icon: '🍽️', reward: '+100 XP', unlockedDate: '2024-01-12', imageKey: 'galleryDiet' },
                    { id: 3, title: '얼리 버드', description: '아침 운동 완료하기', icon: '🌅', reward: '+75 XP', unlockedDate: '2024-01-10', imageKey: 'belle' },
                    { id: 4, title: '수분 충전', description: '하루 물 8잔 마시기', icon: '💧', reward: '+50 XP', unlockedDate: '2024-01-08', imageKey: 'galleryDiet' },
                    { id: 5, title: '마라토너', description: '총 42km 러닝 달성', icon: '🏃', reward: '+200 XP', unlockedDate: '2024-01-05', imageKey: 'chie' }
                ],
                progress: [
                    { id: 6, title: '근력왕', description: '근력 운동 50회 완료하기', icon: '💪', progress: 32, total: 50, imageKey: 'belle' },
                    { id: 7, title: '다이어터', description: '5kg 감량하기', icon: '⚖️', progress: 3.2, total: 5, imageKey: 'toma' },
                    { id: 8, title: '꾸준함의 미학', description: '30일 연속 접속하기', icon: '🔥', progress: 18, total: 30, imageKey: 'chie' }
                ],
                locked: [
                    { id: 9, title: '???', hint: '운동 100회 완료 시 잠금 해제', icon: '❓' },
                    { id: 10, title: '???', hint: '목표 체중 달성 시 잠금 해제', icon: '❓' }
                ]
            }
        }
    }
}
