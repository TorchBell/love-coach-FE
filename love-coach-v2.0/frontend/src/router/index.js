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

    // Check if the route requires authentication
    if (to.meta.requiresAuth) {
        // If user data is not loaded yet (e.g., page refresh), try to fetch session
        if (!authStore.user) {
            await authStore.fetchUserProfile()
        }

        // After fetching, check authentication again
        if (!authStore.isAuthenticated) {
            // Only redirect and alert if actually not authenticated
            alert('로그인이 필요한 서비스입니다.')
            next('/home')
            return
        }
    }
    next()
})

export default router
