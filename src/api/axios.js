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
        // localStorage에서 토큰 가져오기 (존재하는 경우)
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        // 디버깅: 전체 URL 출력
        const fullUrl = config.baseURL + config.url
        console.log('[axios] 요청 전체 URL:', fullUrl)
        console.log('[axios] 요청 params:', config.params)
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
            const token = localStorage.getItem('accessToken')

            // 토큰이 있는 상태에서 401이 떴다면 만료된 것이므로 삭제 및 이동
            if (token) {
                console.warn('Session expired. Clearing token...')
                localStorage.removeItem('accessToken')
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
                window.location.href = '/home'
            } else {
                // 토큰이 없는데 401이면 비로그인 접근
                console.warn('Unauthorized access without token.')
                // 이미 홈이 아니라면 홈으로 보냄 (무한 리로드 방지)
                if (window.location.pathname !== '/home') {
                    window.location.href = '/home'
                }
            }
        }
        return Promise.reject(error)
    }
)

export default api
