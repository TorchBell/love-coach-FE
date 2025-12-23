# Develop Log

## 2025-12-12: Frontend Refactoring & Stabilization

### 1. Architecture Refactoring (Pinia & Axios)
- **State Management (Pinia)**:
  - Implemented `authStore` for user authentication and profile management.
  - Implemented `uiStore` for UI states (sidebar, tabs, modals).
  - Implemented `logStore` for diet, workout, and running logs, including dashboard statistics.
  - Replaced local state and complex props with store usage in `MainLayout`, `HomeView`, `LogView`, and `MyPageView`.
- **API Layer (Axios)**:
  - Configured global Axios instance in `src/api/axios.js`.
  - Created `authApi.js` and `logApi.js` with mock functions simulating server responses.
  - Aligned mock data fields with the database schema (e.g., `foodName`, `calory`, `part`, `exerciseName`).

### 2. Asset & Content Management
- **Centralized Assets**:
  - Created `src/assets/dummy/index.js` to manage all image paths in one place.
  - Updated all components to import images from this central file, facilitating future updates.
- **Text Externalization**:
  - Created `src/constants/text.js` to manage hardcoded text (dialogues, choices).
  - Refactored `HomeView.vue` to use these constants, complying with `WebVisionV2.md`.

### 3. Bug Fixes & Stabilization
- **Blank Screen Issue**:
  - Restored missing `<script setup>` block in `AchievementView.vue`.
  - Hardened `App.vue` and `LandingView.vue` against missing assets using optional chaining.
- **Syntax Errors**:
  - Fixed "Invalid end tag" errors in `AchievementView.vue` and `LogView.vue` by replacing invalid HTML nesting (`<button>` containing `<div>`) with `<div role="button">`.
- **Runtime Errors**:
  - Fixed `TypeError: Cannot create property 'value' on string 'initial'` in `PhotoCard.vue` by using `motionInstance.apply()` instead of direct mutation.

### 4. Verification
- Successfully built the project using `npm run build`.
- Verified that the UI/UX remains consistent with the original design while running on the new architecture.

## 2025-12-23: UI/UX Revamp - Gallery, Achievement & Quest Board

### 1. Gallery View Redesign (`GalleryView.vue`)
- **Layout Overhaul**:
  - Transformed from Sidebar layouts to a **combined Top-Bottom layout**.
  - **Top Bar**: Implemented `GalleryTopBar` with a 4-column grid layout for intuitive filter navigation (All, Toma, Belle, Chie).
  - **Main Content**: Split into Left (Large Preview) and Right (Vertical Carousel List) columns.
  - Utilized `MainLayout`'s new `hideSidebar` prop to maximize screen real estate ("Full Immersion" mode).
- **Dynamic Image Loading**:
  - Replaced hardcoded store data with **automatic asset loading** using Vite's `import.meta.glob`.
  - Images from `src/assets/gallery/common/{toma, belle, chie}` are now legally loaded and displayed without manual mapping.
- **Interactions & Visuals**:
  - **Card Flip**: Implemented 3D flip effect for showing "Secret Cuts" (backside of the card).
  - **Unlock System**: Integrated token-based unlock logic with visual lock overlays.
  - **Vertical Carousel**: Custom scrollable list on the right with a "View List" toggle for mobile/grid switching.

### 2. Achievement & Quest Board Revamp (`AchievementView.vue`)
- **Quest Board Component (`QuestBoard.vue`)**:
  - Designed a **"Daily Quest Bulletin Board"** with a game-like aesthetic (Tape, Post-it notes, handwritten fonts).
  - **Interactive Progress**:
    - "Complete" buttons activate when targets are met.
    - Clicking buttons fills a dynamic **Heart Gauge** at the top.
    - **Completion Stamp**: A circular `COMPLETE` stamp (image-based) appears when 100% progress is reached.
  - **Persistence**: Implemented `localStorage` logic to save daily quest status (resets automatically when the date changes).
- **Achievement Gallery**:
  - Refactored into a split layout (Left: Hall of Fame, Right: Quest Board).
  - **Dynamic Loading**: Applied the same `import.meta.glob` strategy to load achievement icons directly from assets.
  - **UI Polish**: Increased font sizes for readability and adjusted layout ratios (55% Achievement / 45% Quest Board) for better visual balance.

### 3. Technical Improvements
- **Vue 3 Composition API**: All new components use `<script setup>` for better performance and DX.
- **Tailwind CSS**: Extensive use of utility classes for complex layouts (Grid, Flex, Absolute positioning for overlays).
- **Error Fixes**: Resolved specific "Invalid end tag" parsing errors in Vue templates.
