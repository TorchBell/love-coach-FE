import axios from 'axios'

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (if exists)
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // Handle global errors (e.g., 401 Unauthorized)
        if (error.response && error.response.status === 401) {
            // Redirect to login or clear token
            console.warn('Unauthorized access. Redirecting to home...')
            // Alert user briefly? Or just redirect? User said "alert happens... then send to home"
            // If the alert comes from router guard, it might be separate.
            // But here on API 401, we should just redirect.
            window.location.href = '/home'
        }
        return Promise.reject(error)
    }
)

export default api
