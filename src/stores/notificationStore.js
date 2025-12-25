import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGalleryStore } from '@/stores/galleryStore'
import trophyIcon from '@/assets/icons/tomaAchievement.png'

// 로컬 이미지 동적 로드 (Vite Glob) - Assets 폴더 전체 스캔
const localImages = import.meta.glob('@/assets/**/*.{png,jpg,jpeg,webp}', { eager: true })
const localAssetPaths = Object.keys(localImages)

const findLocalImage = (dbPath) => {
    if (!dbPath) return null
    if (dbPath.startsWith('http')) return dbPath

    // DB 경로 정규화
    const normalizedDbPath = dbPath.replace(/\\/g, '/')

    // 1. 경로 포함 여부 확인
    const match = localAssetPaths.find(localPath => localPath.includes(normalizedDbPath))
    if (match) return localImages[match].default || localImages[match]

    // 2. 파일명만으로 Fallback
    const filename = normalizedDbPath.split('/').pop()
    const fallbackMatch = localAssetPaths.find(localPath => localPath.endsWith(filename))
    if (fallbackMatch) return localImages[fallbackMatch].default || localImages[fallbackMatch]

    return null
}

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([]) // { id, title, message, type, icon, image }
    const eventSource = ref(null)
    let nextId = 0

    const addNotification = (title, message = '', type = 'achievement', image = null) => {
        const id = nextId++
        notifications.value.push({ id, title, message, type, image })

        // 10초 후 자동 제거
        setTimeout(() => {
            removeNotification(id)
        }, 10000)
    }

    const removeNotification = (id) => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index !== -1) {
            notifications.value.splice(index, 1)
        }
    }

    const connect = () => {
        if (eventSource.value) return

        const sseUrl = '/api/notifications/subscribe'
        eventSource.value = new EventSource(sseUrl)
        const galleryStore = useGalleryStore()

        eventSource.value.onopen = () => {
            console.log('[SSE] Notification Connected')
        }

        eventSource.value.onerror = (err) => {
            if (eventSource.value.readyState !== EventSource.CLOSED) {
                // console.warn('[SSE] Error occurred', err)
                eventSource.value.close()
                eventSource.value = null
            }
        }

        // 1. 업적 달성 이벤트
        eventSource.value.addEventListener('achievement', (event) => {
            try {
                const data = JSON.parse(event.data)
                // AchievementResponse의 iconUrl을 이미지로 변환
                const resolvedImage = findLocalImage(data.iconUrl) || trophyIcon
                addNotification(data.title || '업적 달성!', '새로운 업적을 달성했습니다.', 'achievement', resolvedImage)
            } catch (e) {
                console.error('[SSE] Failed to parse achievement event', e)
            }
        })

        // 2. 갤러리 해금 이벤트
        eventSource.value.addEventListener('gallery', async (event) => {
            try {
                const data = JSON.parse(event.data)
                // data: { galleryId, isOpened, message }

                let resolvedImage = null

                // 갤러리 이미지 찾기 (Store에서 조회)
                if (data.galleryId) {
                    // 데이터가 없으면 로드 시도
                    if (!galleryStore.galleries || galleryStore.galleries.length === 0) {
                        try {
                            await galleryStore.fetchGalleries()
                        } catch (e) { /* ignore */ }
                    }

                    const galleryItem = galleryStore.galleries.find(g =>
                        (g.galleryId === data.galleryId) || (g.gallery_id === data.galleryId)
                    )

                    if (galleryItem) {
                        resolvedImage = findLocalImage(galleryItem.imageUrl || galleryItem.image_url)
                    }
                }

                addNotification('갤러리 획득!', data.message || '새로운 갤러리가 해금되었습니다.', 'gallery', resolvedImage)
            } catch (e) {
                console.error('[SSE] Failed to parse gallery event', e)
            }
        })

        // 3. 테스트/기타 알림
        eventSource.value.addEventListener('notification', (event) => {
            addNotification('알림', event.data, 'achievement')
        })
    }

    const disconnect = () => {
        if (eventSource.value) {
            eventSource.value.close()
            eventSource.value = null
        }
    }

    return {
        notifications,
        addNotification,
        removeNotification,
        connect,
        disconnect
    }
})
