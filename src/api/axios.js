import axios from 'axios'

// axios 인스턴스 생성
const api = axios.create({
    baseURL: '/api', // Vite Proxy를 사용하기 위해 상대 경로 설정
    timeout: 40000, // AI 응답 대기를 위해 60초로 연장
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // [Session Auth] 토큰 관련 로직 제거됨

        // 디버깅: 전체 URL 출력
        const fullUrl = config.baseURL + config.url
        console.log('[axios] 요청 전체 URL:', fullUrl)
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
            console.warn('[Session] Unauthorized or Session Expired.')

            // 로그인 페이지나 홈이 아닌 경우에만 리다이렉트
            if (window.location.pathname !== '/home' && window.location.pathname !== '/') {
                alert('로그인이 필요하거나 세션이 만료되었습니다.')
                window.location.href = '/home'
            }
        }
        return Promise.reject(error)
    }
)

export default api
