import api from './axios'

// Mock delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const authApi = {
    // Login
    async login(credentials) {
        // Mock implementation
        await delay(500)
        if (credentials.username === 'ssafy' && credentials.password === '1234') {
            return {
                data: {
                    accessToken: 'mock-access-token-12345',
                    user: {
                        id: 1,
                        name: '김싸피',
                        email: 'ssafy@example.com',
                        level: 5,
                        xp: 1250,
                        nextLevelXp: 1500,
                        joinDate: '2024-01-01',
                        streakDays: 7,
                        healthData: {
                            currentWeight: 70.5,
                            goalWeight: 65.0,
                            height: 175,
                            age: 28,
                            gender: 'Male'
                        },
                        stats: {
                            totalWorkouts: 45,
                            totalMeals: 135,
                            totalRuns: 28,
                            achievementsEarned: 8,
                            totalAchievements: 20
                        }
                    },
                },
            }
        }
        throw new Error('Invalid credentials')
    },

    // Logout
    async logout() {
        await delay(200)
        return { data: { success: true } }
    },

    // Get User Profile
    async getUserProfile() {
        await delay(300)
        return {
            data: {
                id: 1,
                name: '김싸피',
                email: 'ssafy@example.com',
                avatar: 'https://via.placeholder.com/150/FFB6C1/FFFFFF?text=JD',
            },
        }
    },

    // Update User Profile
    async updateUserProfile(data) {
        await delay(500)
        return { data: { success: true, user: data } }
    }
}
