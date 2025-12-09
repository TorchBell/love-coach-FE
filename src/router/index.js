import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LogView from '../views/LogView.vue'
import MyPageView from '../views/MyPageView.vue'
import AchievementView from '../views/AchievementView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
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
            path: '/achievement',
            name: 'achievement',
            component: AchievementView
        }
    ]
})

export default router
