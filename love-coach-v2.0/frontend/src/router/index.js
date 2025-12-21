import { createRouter, createWebHistory } from 'vue-router'
import GalleryView from '../views/GalleryView.vue'
import LogView from '../views/LogView.vue'
import MyPageView from '../views/MyPageView.vue'
import AchievementView from '../views/AchievementView.vue'

import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: () => import('../views/LandingView.vue')
        },
        {
            path: '/home',
            name: 'home',
            component: () => import('../views/HomeView.vue')
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('../views/SignupView.vue')
        },
        {
            path: '/gallery',
            name: 'gallery',
            component: GalleryView,
            meta: { requiresAuth: true }
        },
        {
            path: '/log',
            name: 'log',
            component: LogView,
            meta: { requiresAuth: true }
        },
        {
            path: '/mypage',
            name: 'mypage',
            component: MyPageView,
            meta: { requiresAuth: true }
        },
        {
            path: '/mypage/edit',
            name: 'editProfile',
            component: () => import('../views/EditProfileView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/achievement',
            name: 'achievement',
            component: AchievementView,
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 라우트가 인증을 필요로 하는지 확인
    if (to.meta.requiresAuth) {
        // 사용자 데이터가 로드되지 않은 경우 (예: 페이지 새로고침), 세션 조회를 시도
        if (!authStore.user) {
            await authStore.fetchUserProfile()
        }

        // 조회 후 다시 인증 상태 확인
        if (!authStore.isAuthenticated) {
            // 실제로 인증되지 않은 경우에만 리다이렉트 및 알림
            alert('로그인이 필요한 서비스입니다.')
            next('/home')
            return
        }
    }
    next()
})

export default router
