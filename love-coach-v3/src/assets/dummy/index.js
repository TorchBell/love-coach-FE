import toma from '@/assets/images/toma.png'
import belle from '@/assets/images/belle.png'
import chie from '@/assets/images/chie.png'
import tomai from '@/assets/images/tomai.png'
import tomahi from '@/assets/images/tomahi.gif'
import galleryDiet from '@/assets/images/gallery_diet.png'
import doorFinal from '@/assets/images/door_final.png'

import logToma from '@/assets/logpage/toma.jpg'
import logBelle from '@/assets/logpage/belle.jpg'
import logChii from '@/assets/logpage/chii.jpg'

// TODO: Replace these with actual user images in the future
export const CHAR_IMAGES = {
    toma,
    belle,
    chie,
    tomai,
    tomahi,
}

export const LOG_IMAGES = {
    toma: logToma,
    belle: logBelle,
    chie: logChii,
}

export const UI_IMAGES = {
    galleryDiet,
    doorFinal,
    defaultAvatar: 'https://via.placeholder.com/150/FFB6C1/FFFFFF?text=JD',
}

export const ASSETS = {
    ...CHAR_IMAGES,
    ...UI_IMAGES,
    ...LOG_IMAGES,
}
