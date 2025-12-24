# Love Coach Development Log

## 📅 2025-12-24 (Latest Updates)

### 1. 🎨 Design & UI Overhaul (Visual Refresh)
- **Global Background Color Update**:
  - Changed the primary application background from `Cream` to **Mint (#D2F9F2)** to create a more refreshing and sophisticated atmosphere.
  - Ensured color harmony by validating the complementary relationship between the new Mint background and Toma's Red theme.
- **Color Palette Refinement**:
  - Updated `tailwind.config.js` with a new, more sophisticated pastel palette to match the mint background.
  - Adjusted `pastel-red`, `pastel-yellow`, and `pastel-blue` to be slightly more vibrant and modern.
  - Applied global style changes in `src/style.css` and removed conflicting styles in `MainLayout.vue`.

### 2. 📝 Log Page Improvements (`LogView`)
- **Responsive Layout Implementation**:
  - Refactored `LogSidebar.vue` to support responsive design.
  - **Desktop (xl)**: Vertical sidebar layout.
  - **Mobile/Tablet**: Transforms into a horizontal top banner.
  - Updated `LogView.vue` to integrate the responsive sidebar behavior.
- **Workout Form UX Enhancement**:
  - Replaced the single dropdown list for muscle exercises with a **Cascading Dropdown** system.
  - **Step 1**: Select Body Part (e.g., Chest, Back, Legs).
  - **Step 2**: Select Specific Exercise (filtered by the selected part).
  - Implemented `uniqueParts` and `filteredExercises` computed properties for real-time filtering.

### 3. 👤 Profile Update Refactoring (`MyPageView`)
- **Backend Compliance Fix (400 Bad Request)**:
  - Resolved `400 Bad Request` errors during profile updates by strictly adhering to backend DTO requirements without modifying backend code.
- **Password Handling Logic**:
  - **Mandatory Validation**: Enforced `currentPassword` input for ALL profile updates.
  - **Change Password Toggle**: Added a checkbox to explicitly enable password changing mode.
  - **Conditional Logic**: Only send `newPassword` and validate it when the toggle is active.
  - **DTO Mapping**: Correctly mapped frontend fields to backend expectations (`editForm.currentPassword` → payload `password`).
- **Data Integrity**:
  - Fixed `birthDate` handling to send `null` instead of an empty string to prevent parsing errors.
- **UX Improvements**:
  - Replaced native `alert()` with a custom `ToastNotification` component for better user feedback.
  - Added real-time validation for password matching and minimum length.

---

## 📅 Prior Updates (Summary)

### 🔐 Authentication & Security
- **Refactoring to Session-based Auth**:
  - Removed JWT token handling logic from `axios.js`.
  - Configured `withCredentials: true` for CORS and session cookie support.
  - Simplified logic in `authStore.js` to rely on session status.

### 🏆 Gamification Features (MyPage & Achievement)
- **Timeline & History**:
  - Implemented `MyPageView` timeline to show achievements and activities.
  - Added logic to filter out "Locked Achievements" (????) from the public timeline.
- **Gallery Integration**:
  - Connected `GalleryStore` to fetch and display unlocked reward content.
  - Implemented dynamic image mapping for achievements and gallery items.
- **NPC Classification**:
  - Enhanced logic to correctly assign achievements to NPCs (Toma, Belle, Chie/Chii) based on item attributes.

### 🛠️ General Fixes
- **GameVision**: Resolved usability issues with room code entry and server connection.
- **Japanese Home Theme**: Overhauled the 3D game environment layout and assets.
- **Fitness App UI/UX**: Refined the 3-column layout and "Log" page structure.
