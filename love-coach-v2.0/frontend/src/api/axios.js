import axios from 'axios'

// axios 인스턴스 생성
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // localStorage에서 토큰 가져오기 (존재하는 경우)
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

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // 전역 에러 처리 (예: 401 Unauthorized)
        if (error.response && error.response.status === 401) {
            // 로그인 페이지로 리다이렉트 또는 토큰 초기화
            console.warn('Unauthorized access. Redirecting to home...')
            // 사용자에게 알림을 표시할지 바로 리다이렉트할지 결정
            // 라우터 가드에서 알림이 발생할 수 있으므로 별개로 처리 가능
            // 하지만 API 401의 경우 바로 리다이렉트 처리
            window.location.href = '/home'
        }
        return Promise.reject(error)
    }
)

export default api
