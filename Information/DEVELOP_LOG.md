# LoveNyam Development Log

## 📅 2025-12-21: Monthly Summary Statistics Feature

### 🎯 Objective
Add dynamic monthly statistics to the "이번 달 요약" (Monthly Summary) section in LogView:
- 총 섭취량 (Total Intake): Sum of all diet calories for the month
- 총 볼륨 (Total Volume): Sum of (weight × sets × reps) for all workouts
- 총 소모량 (Total Burned): Sum of all cardio calories burned

### 🛠️ Key Changes & Implementation Details

#### 1. logStore.js - Monthly Statistics Computed Properties
*   **Added three computed getters**:
    *   `monthlyTotalCaloriesIntake`: `sum(calory × quantity)` for all diet logs
    *   `monthlyTotalVolume`: `sum(weight × setCount × repsPerSet)` for all workout logs
    *   `monthlyTotalCaloriesBurned`: `sum(burnedKcal)` for all cardio logs
*   These computeds reactively update when:
    *   Monthly logs are fetched on page load
    *   New entries are added (triggering `fetchMonthlyLogs()`)
    *   Entries are modified or deleted

#### 2. LogView.vue - Dashboard Card Update
*   **Changed display from record counts to actual statistics**:
    *   Before: "식단 기록 X건", "근력 기록 X건", "유산소 기록 X건"
    *   After: "총 섭취량 X kcal", "총 볼륨 X kg", "총 소모량 X kcal"
*   **Added storeToRefs imports** for the three new computed properties
*   **Formatting**: Values displayed with `toLocaleString()` for thousands separators

### ✅ Verification Results
*   **Initial Load**: Statistics correctly calculated from backend monthly data
*   **Dynamic Update (Add)**: After adding a diet entry, "총 섭취량" immediately increased
*   **Dynamic Update (Delete)**: After deleting entry, value returned to original
*   **All three stats displayed**: With correct units (kcal, kg, kcal) and colors

### 📝 Files Modified
*   `frontend/src/stores/logStore.js` - Added monthly statistics computed properties
*   `frontend/src/views/LogView.vue` - Updated dashboard card display

---

## 📅 2025-12-21: Frontend Detail Fixes (Dialog, Edit, Delete)

### 🎯 Objective
Fix frontend UI/UX issues: Git conflict markers in CharacterDialog, remove icons from dialog choices, implement custom delete confirmation modal, enable food name editing in diet modification.

### 🛠️ Key Changes & Implementation Details

#### 1. CharacterDialog.vue - Git Conflict Resolution & Icon Removal
*   **Issue**: Git merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) were appearing in the dialog text.
*   **Issue**: Dialog choices displayed character icons next to text (e.g., "운동 기록하러 왔어" with a character icon).
*   **Solution**: 
    *   Completely rewrote `CharacterDialog.vue` to remove all conflict markers.
    *   Removed the `choiceIcons` object and related icon display logic.
    *   Choices now display as clean text only without any icons.

#### 2. Delete Confirmation Modal Component
*   **Goal**: Replace browser's default `confirm()` dialog with a custom, styled modal.
*   **Implementation**:
    *   Created new `DeleteConfirmModal.vue` component in `/src/components/`.
    *   Modal displays:
        *   Item type icon (🍽️ for diet, 💪 for workout, 👟 for running)
        *   Date of the record (e.g., "2025년 12월 21일")
        *   Item name (e.g., "닭가슴살 샐러드")
        *   Warning message: "이 작업은 되돌릴 수 없습니다."
        *   Cancel ("취소") and Confirm ("삭제하기") buttons
    *   Uses `Teleport` to render at body level for proper z-index stacking.
    *   Smooth enter/leave transitions for professional UX.

#### 3. LogView.vue - Edit & Delete Enhancements
*   **Delete Flow Refactor**:
    *   Replaced `confirm()` calls with `openDeleteModal()` function.
    *   Added `showDeleteModal`, `deleteTarget` reactive states.
    *   Integrated `DeleteConfirmModal` component with proper event handling.
*   **Food Name Edit Feature**:
    *   Added separate food search for edit mode (`editFoodSearchQuery`, `editFoodSearchResults`, `editSelectedFood`).
    *   `searchEditFood()` and `selectEditFood()` functions for changing food during edit.
    *   Edit panel now shows:
        *   Food search input: "음식 변경 (검색)" with placeholder "다른 음식으로 변경하려면 검색하세요"
        *   Current selected food display with name and calorie info.
        *   Quantity input field.

### ✅ Verification Results
*   **Dialog Icons**: ✅ Removed - Choices display as text only.
*   **Git Markers**: ✅ Removed - No conflict markers in dialog.
*   **Custom Delete Modal**: ✅ Working - Shows date, item name, warning; replaces browser alert.
*   **Edit Food Name**: ✅ Working - Food search available in edit panel.

### 📝 Files Modified
*   `frontend/src/components/CharacterDialog.vue` - Rewritten
*   `frontend/src/components/DeleteConfirmModal.vue` - New file
*   `frontend/src/views/LogView.vue` - Enhanced edit/delete functionality

---

## 📅 2025-12-21: Backend & Frontend Merge Complete & Log Features

### 🎯 Objective
Complete the integration of Vue.js frontend with Spring Boot backend, replacing all mock data with real API calls. Resolve critical bugs (Diet 500 Error) and enhance the LogView with Edit/Delete functionalities.

### 🛠️ Key Changes & Implementation Details

#### 1. Backend-Frontend Integration
*   **Goal**: Full data synchronization.
*   **Implementation**:
    *   Replaced `authApi`, `logApi`, `galleryApi` mock calls with real endpoints.
    *   Integrated `npcStore` for real-time chat with backend.
    *   **Critical Fix**: Resolved `500 Internal Server Error` on Diet Registration by fixing `achievementMapper.xml` (SQL column mismatch).

#### 2. LogView Enhancements (In Progress)
*   **Goal**: Add Update/Delete capabilities for Diet, Workout, and Cardio logs.
*   **Implementation**:
    *   **Store**: Adding `updateDietLog`, `updateWorkoutLog`, `updateRunningLog` actions.
    *   **UI**: Adding 'Edit' and 'Delete' buttons to log items. implementing inline editing state.

---

## 📅 2025-12-15: Responsive UI/UX Refinements (Mobile Optimization)

### 🎯 Objective
To ensure the application provides a seamless and visually consistent experience across all device sizes, specifically targeting "broken" layouts on smaller screens (mobile/tablet). Key areas of focus were `AchievementView`, `MyPageView`, and `LogView`.

### 🛠️ Key Changes & Implementation Details

#### 1. AchievementView (업적) Refinements
*   **Goal**: Fix tab text overflow and border cutting issues on small screens.
*   **Implementation**:
    *   **Tab Simplification**: Shortened tab names (e.g., '토마의 식단' → '식단') to reduce width requirements.
    *   **Responsive Tabs**: Implemented an "Icon-Only" mode for mobile screens. Text labels are hidden on `lg` breakpoints and below, leaving only the character avatar for a cleaner look.
    *   **Layout Fixes**: Added padding (`p-2`, `pt-2`) to the achievement list container to prevent shadows and borders from being cut off.
    *   **Scrollbar Adjustment**: Applied negative margins (`-mr-2`) to position the scrollbar gracefully without overlapping content.

#### 2. MyPageView (마이페이지) Responsive Overhaul
*   **Goal**: Resolve text stacking and poor visibility when the screen width is reduced.
*   **Implementation**:
    *   **Vertical Stacking Strategy**: Enforced a strict vertical layout for mobile/tablet (`lg` breakpoint).
        *   **Tokens**: Stacked vertically (1 column) below the profile instead of squeezing into a 3-column row.
        *   **Activity & Affinity**: Stacked vertically one below the other.
    *   **Component Redesign**:
        *   **Affinity Section**: Transformed from simple progress bars to detailed **Affinity Cards** containing the character's face, percentage text, and a progress bar for better mobile readability.
        *   **Token Cards**: Optimized padding and font sizes (`text-sm` on mobile) to maintain proportion.
    *   **Grid Optimization**: Switched from `md` (768px) to `lg` (1024px) triggers to ensure the layout remains comfortable (vertical) even on tablet-sized windows.

#### 3. LogView (기록) Scaling Fixes
*   **Goal**: Prevent images from becoming disproportionately large and ensure text scales properly on small screens.
*   **Implementation**:
    *   **Image Control**: Added `max-w-[200px]` to character images on mobile layouts to prevent them from filling the entire screen height/width.
    *   **Proportional Scaling**:
        *   **Badges**: Implemented responsive text sizing (`text-sm md:text-xl`) and padding (`px-4 py-1.5`) so the text tags shrink relative to the images.
        *   **Grid Layout**: Adjusted to `grid-cols-1` on mobile (with size limits) and `sm:grid-cols-3` for larger devices.

### 🐛 Challenges & Solutions

#### Breakpoint "Squashing"
*   **Issue**: The standard `md` breakpoint (768px) was too late to switch layouts, causing a "squashed" 3-column look on intermediate sizes (800px~1000px).
*   **Solution**: Moved major layout shifts to the `lg` breakpoint (1024px). This forces the clean vertical layout to appear earlier (on tablets and small desktop windows), preserving readability.

#### Text vs. Image Scaling
*   **Issue**: When images shrank, the fixed pixel-size text remained large, breaking the visual hierarchy.
*   **Solution**: Utilized Tailwind's responsive text utilities (`text-sm md:text-lg`) to ensure text elements scale in harmony with their containers.

### 📝 Next Steps
*   Continue monitoring specific UI components for edge-case styling issues.
*   Verify cross-browser compatibility for the new flex/grid layouts.

---

## 📅 2024-11-28: UI/UX Overhaul & Visual Novel Integration

### 🎯 Objective
To transform the existing fitness application into a high-quality "Visual Novel (VN)" style experience, focusing on emotional connection, immersive aesthetics, and intuitive navigation.

### 🛠️ Key Changes & Implementation Details

#### 1. Landing Page (The Entry)
*   **Goal**: Create a memorable first impression that feels like "entering" a new world.
*   **Implementation**:
    *   **Visuals**: Integrated a high-quality, large pastel-style door asset (`door_final.png`) to match the VN aesthetic.
    *   **Interaction**: Implemented a double-click "knock" mechanic with a custom "fist" cursor (`cursor_fist.png`).
    *   **Animation**: Added a smooth white fade-out animation upon knocking to simulate opening the door.
    *   **Logic**: Used `localStorage` to ensure this entry sequence only happens **once** per user, preventing repetitive friction on subsequent visits.

#### 2. Home Screen (The Hub)
*   **Goal**: A clean, immersive hub where the user interacts with the main character, Toma.
*   **Implementation**:
    *   **Layout Refactor**: Moved from a top-heavy layout to a split-screen design.
        *   **Left**: Large, stylish navigation menu (Gallery, Log, Achievement, MyPage).
        *   **Right**: Full-height character portrait of Toma.
    *   **Dialogue System**:
        *   Implemented a VN-style speech bubble that doesn't obscure the character.
        *   Added a "Chat" button that triggers a 4-choice dialogue menu.
        *   **Routing**: Choices 1-3 intelligently route to specific tabs in the Log page (Diet, Workout, Running). Choice 4 allows graceful exit.
    *   **Navigation**: Removed the standard top navigation bar to enhance immersion.

#### 3. Gallery (The Archive)
*   **Goal**: Preserve the original card-based layout for viewing collections and history.
*   **Implementation**:
    *   Restored the previous "Home" layout as the new "Gallery" view.
    *   **Navigation**: Added a consistent top navigation bar here (and on other sub-pages) to ensure users can easily return to the Home hub.
    *   **Fixes**: Resolved syntax errors in the Vue template that were causing build failures.

### 🐛 Challenges & Solutions

#### Build Errors
*   **Issue**: `npm run build` failed due to missing asset references (`door_pastel_large.png`) and syntax errors in `GalleryView.vue`.
*   **Solution**:
    *   Verified asset existence and correctly copied the generated `door_pastel_large` to `door_final.png`.
    *   Rewrote the `GalleryView.vue` template to ensure all HTML tags were properly closed and structured.

#### Navigation Loops
*   **Issue**: The "Home" link in the top navigation bar was pointing to `/` (Landing), causing a redirect loop or re-triggering the door animation.
*   **Solution**: Updated `MainLayout.vue` to point the "Home" link explicitly to `/home`.

#### Asset Quality
*   **Issue**: The initial door asset was too small and didn't match the "pastel VN" vibe.
*   **Solution**: Generated and integrated a larger, higher-quality pastel door asset.

### 📸 Verification
*   **Browser Testing**: Verified the entire flow (Landing -> Home -> Gallery -> Home) using a browser subagent.
*   **Build**: Confirmed `npm run build` passes successfully.

### 📝 Next Steps
*   Populate the Gallery with real user data.
*   Refine the "Log" page to fully support the 3-tab structure (Diet, Workout, Running).
*   Implement the actual "Achievement" unlocking logic.
