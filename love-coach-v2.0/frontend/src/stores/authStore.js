import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null)
    const isAuthenticated = computed(() => !!user.value)
    const isLoading = ref(false)
    const error = ref(null)

    /**
     * 로그인
     * @param {Object} credentials - { email, password }
     * @returns {Promise<boolean>}
     */
    const login = async (credentials) => {
        isLoading.value = true
        error.value = null
        try {
            const response = await authApi.login(credentials)
            user.value = response.data
            return true
        } catch (err) {
            console.error('Login failed:', err)
            if (err.code === 'ERR_NETWORK' || !err.response) {
                error.value = '서버에 연결할 수 없습니다. (Network Error)'
            } else {
                error.value = err.response?.data?.message || '로그인에 실패했습니다.'
            }
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 로그아웃
     */
    const logout = async () => {
        try {
            await authApi.logout()
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            user.value = null
        }
    }

    /**
     * 회원가입
     * @param {Object} userData - { email, password, nickname, gender, birthDate }
     * @returns {Promise<boolean>}
     */
    const signup = async (userData) => {
        isLoading.value = true
        error.value = null
        try {
            await authApi.signup(userData)
            // 회원가입 성공 후 자동 로그인 시도
            return await login({ email: userData.email, password: userData.password })
        } catch (err) {
            console.error('Signup failed:', err)
            error.value = err.response?.data?.message || '회원가입에 실패했습니다.'
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 사용자 정보 조회 (세션 기반 인증 확인)
     */
    const fetchUserProfile = async () => {
        try {
            const response = await authApi.getUserProfile()
            user.value = response.data
        } catch (err) {
            console.error('Failed to fetch user profile:', err)
            // 인증 실패시 user 초기화
            if (err.response?.status === 401) {
                user.value = null
            }
        }
    }

    /**
     * 사용자 정보 수정
     * @param {Object} data - 수정할 정보
     * @returns {Promise<boolean>}
     */
    const updateProfile = async (data) => {
        isLoading.value = true
        error.value = null
        try {
            const response = await authApi.updateUserProfile(data)
            user.value = response.data
            return true
        } catch (err) {
            console.error('Failed to update profile:', err)
            error.value = err.response?.data?.message || '정보 수정에 실패했습니다.'
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 회원 탈퇴
     * @returns {Promise<boolean>}
     */
    const deleteAccount = async () => {
        isLoading.value = true
        try {
            await authApi.deleteAccount()
            user.value = null
            return true
        } catch (err) {
            console.error('Failed to delete account:', err)
            error.value = err.response?.data?.message || '회원 탈퇴에 실패했습니다.'
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 크레딧 사용
     * @param {Object} request - { amount, description }
     * @returns {Promise<Object|null>}
     */
    const useCredit = async (request) => {
        try {
            const response = await authApi.useCredit(request)
            // 크레딧 사용 후 user 정보 갱신
            if (user.value && response.data.remainingCredit !== undefined) {
                user.value.credit = response.data.remainingCredit
            }
            return response.data
        } catch (err) {
            console.error('Failed to use credit:', err)
            error.value = err.response?.data?.message || '크레딧 사용에 실패했습니다.'
            return null
        }
    }

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,
        // Actions
        login,
        logout,
        signup,
        fetchUserProfile,
        updateProfile,
        deleteAccount,
        useCredit
    }
})
