import { createRouter, createWebHistory } from 'vue-router'
import GalleryView from '../views/GalleryView.vue'
import LogView from '../views/LogView.vue'
import MyPageView from '../views/MyPageView.vue'
import AchievementView from '../views/AchievementView.vue'

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
            component: GalleryView
        },
        {
            path: '/log',
            name: 'log',
            component: LogView
        },
        {
            path: '/mypage',
            name: 'mypage',
            component: MyPageView
        },
        {
            path: '/mypage/edit',
            name: 'editProfile',
            component: () => import('../views/EditProfileView.vue')
        },
        {
            path: '/achievement',
            name: 'achievement',
            component: AchievementView
        }
    ]
})

export default router
