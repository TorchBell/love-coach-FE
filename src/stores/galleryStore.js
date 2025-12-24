import { defineStore } from 'pinia'
import { ref } from 'vue'
import { galleryApi } from '@/api/galleryApi'

/**
 * 갤러리 상태 관리
 */
export const useGalleryStore = defineStore('gallery', () => {
    // 상태
    const galleries = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    /**
     * 갤러리 목록 조회
     */
    const fetchGalleries = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await galleryApi.getGalleryList()
            // 응답 구조 유연하게 처리
            if (Array.isArray(response.data)) {
                galleries.value = response.data
            } else if (response.data && Array.isArray(response.data.data)) {
                galleries.value = response.data.data
            } else {
                console.warn('[GalleryStore] Unexpected response structure:', response.data)
                galleries.value = []
            }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 갤러리 해금
     * @param {number} galleryId
     */
    const unlockGallery = async (galleryId) => {
        try {
            const response = await galleryApi.unlockGallery(galleryId)
            // 해금 성공 시 목록 새로고침
            await fetchGalleries()
            return response.data
        } catch (err) {
            console.error('Failed to unlock gallery:', err)
            error.value = err.response?.data?.message || '갤러리 해금에 실패했습니다.'
            return null
        }
    }

    return {
        galleries,
        isLoading,
        error,
        fetchGalleries,
        unlockGallery
    }
})
