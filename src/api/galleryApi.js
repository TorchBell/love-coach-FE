import api from './axios'

/**
 * 갤러리 API
 * 백엔드 API: /api/gallery
 */
export const galleryApi = {
    /**
     * 갤러리 목록 조회
     * GET /api/gallery
     * @returns {Promise<{data: GalleryResponse[]}>}
     */
    async getGalleryList() {
        return api.get('/gallery')
    },

    /**
     * 갤러리 해금
     * PATCH /api/gallery/{galleryId}/unlock
     * @param {number} galleryId
     * @returns {Promise<{data: { success, message, ... }}>}
     */
    async unlockGallery(galleryId) {
        return api.patch(`/gallery/${galleryId}/unlock`)
    }
}
