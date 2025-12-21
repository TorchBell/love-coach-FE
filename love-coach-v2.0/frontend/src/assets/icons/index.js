// 커스텀 아이콘 임포트 - 메뉴 아이콘만
import TomaGalleryIcon from './toma-gallery.png'
import BelleLogIcon from './belle-log.png'
import ChiiAchievementIcon from './chii-achievement.png'
// import Logo from './logo.png'

export const ICONS = {
    // 메뉴 아이콘
    tomaGallery: TomaGalleryIcon,
    belleLog: BelleLogIcon,
    chiiAchievement: ChiiAchievementIcon,
    // 로고
    // logo: Logo,
}

// 아이콘 경로를 가져오는 헬퍼 함수
export const getIcon = (name) => {
    return ICONS[name] || null
}
