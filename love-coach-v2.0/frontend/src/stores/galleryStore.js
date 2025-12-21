import { defineStore } from 'pinia'
import { ref } from 'vue'
import { galleryApi } from '@/api/galleryApi'

/**
 * 갤러리 상태 관리
 */
export const useGalleryStore = defineStore('gallery', () => {
    // State
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
            galleries.value = response.data || []
        } catch (err) {
            console.error('Failed to fetch galleries:', err)
            error.value = err.response?.data?.message || '갤러리를 불러오는데 실패했습니다.'
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
