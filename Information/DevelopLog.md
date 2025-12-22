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
