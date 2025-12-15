// Custom Icon Imports - Menu Icons Only
import TomaGalleryIcon from './toma-gallery.png'
import BelleLogIcon from './belle-log.png'
import ChiiAchievementIcon from './chii-achievement.png'
import Logo from './logo.png'

export const ICONS = {
    // Menu Icons
    tomaGallery: TomaGalleryIcon,
    belleLog: BelleLogIcon,
    chiiAchievement: ChiiAchievementIcon,
    // Logo
    logo: Logo,
}

// Helper function to get icon path
export const getIcon = (name) => {
    return ICONS[name] || null
}
