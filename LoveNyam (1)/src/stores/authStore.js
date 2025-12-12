import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('accessToken'))
    const isAuthenticated = computed(() => !!token.value)

    const login = async (credentials) => {
        try {
            const response = await authApi.login(credentials)
            token.value = response.data.accessToken
            user.value = response.data.user
            localStorage.setItem('accessToken', token.value)
            return true
        } catch (error) {
            console.error('Login failed:', error)
            return false
        }
    }

    const logout = async () => {
        try {
            await authApi.logout()
        } finally {
            token.value = null
            user.value = null
            localStorage.removeItem('accessToken')
        }
    }

    const fetchUserProfile = async () => {
        if (!token.value) return
        try {
            const response = await authApi.getUserProfile()
            // Merge with existing mock user data if needed, or just set it
            // For now, we assume login sets the full user object, but this refreshes it
            if (!user.value) user.value = response.data
        } catch (error) {
            console.error('Failed to fetch user profile:', error)
        }
    }

    return {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        fetchUserProfile
    }
})
