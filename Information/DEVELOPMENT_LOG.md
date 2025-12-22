 # Love & Fitness 개발 로그

**프로젝트**: Love & Fitness (러브앤핏) - 캐릭터 기반 피트니스 트래킹 웹 앱  
**개발 기간**: 2025-01-21  
**최종 상태**: ✅ UI 리팩토링 완료 (2025-01-21 20:53)

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [완성된 기능](#완성된-기능)
4. [파일 구조](#파일-구조)
5. [주요 컴포넌트 상세](#주요-컴포넌트-상세)
6. [라우팅 구조](#라우팅-구조)
7. [디자인 시스템](#디자인-시스템)
8. [백엔드 엔티티](#백엔드-엔티티)
9. [다음 개발 시 참고사항](#다음-개발-시-참고사항)

---

## 프로젝트 개요

**컨셉**: 귀여운 캐릭터들과 함께하는 게임형 피트니스 트래킹 앱

**주요 특징**:
- 🎨 소프트 라운드 디자인 (파스텔 컬러)
- 👥 3명의 캐릭터 (Toma, Belle, Chie)
- 📊 실시간 건강 데이터 추적
- 🏆 업적 및 레벨 시스템
- 💪 식단, 운동, 러닝 통합 관리

---

## 기술 스택

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.x
- **Router**: Vue Router 4
- **Animations**: @vueuse/motion
- **Language**: JavaScript

### Backend
- **Framework**: Spring Boot 3.x
- **ORM**: JPA/Hibernate
- **Database**: (설정 필요)
- **Language**: Java 17+

---

## 완성된 기능

### ✅ Phase 1: 코어 레이아웃
- [x] 고정 사이드바 (왼쪽/오른쪽 280px)
- [x] 스크롤 가능한 중앙 갤러리
- [x] 상단 네비게이션 바 (언더라인 애니메이션)
- [x] PhotoCard 컴포넌트 (8개 배치)

### ✅ Phase 2: 메인 페이지 (/)
- [x] 8개 아이템 갤러리 (Hall of Fame)
- [x] 클릭-투-스크롤 기능
- [x] 확대된 이미지 카드 (600x400px)
- [x] 프로그레스 바 및 통계

### ✅ Phase 3: 로그 페이지 (/log)
- [x] 3-캐릭터 탭 네비게이션
- [x] DietLogTab - 칼로리 추적, 식사 유형 선택
- [x] WorkoutLogTab - 세트/렙/무게 추적
- [x] RunningLogTab - 거리/시간/페이스 계산

### ✅ Phase 4: 업적 페이지 (/achievement)
- [x] 3단계 시스템 (잠금해제/진행중/잠금)
- [x] 프로그레스 바 (진행중 업적)
- [x] 힌트 시스템 (잠긴 업적)
- [x] 20개 업적 데이터

### ✅ Phase 5: 마이페이지 (/mypage)
- [x] 프로필 카드 (레벨/XP 시스템)
- [x] 체중 진행상황 추적
- [x] BMI 계산기
- [x] 활동 요약 통계
- [x] 계정 설정 버튼

### ✅ Phase 6: 백엔드
- [x] 15개 JPA 엔티티 생성
- [x] DB 스키마 동기화 (datacode.dbml 기반)

---

## 파일 구조

```
LoveNyam/
├── backend/
│   └── src/main/java/com/lovenyam/
│       └── entity/
│           ├── User.java
│           ├── Npc.java
│           ├── UserNpcStatus.java
│           ├── Food.java
│           ├── Menu.java
│           ├── MenuFood.java
│           ├── Exercise.java
│           ├── WorkoutLog.java
│           ├── WorkoutSet.java
│           ├── BodyLog.java
│           ├── Achievement.java
│           ├── UserAchievement.java
│           ├── Gallery.java
│           ├── UserGallery.java
│           └── ChatLog.java
│
└── frontend/
    └── src/
        ├── assets/
        │   └── images/
        │       ├── toma.png
        │       ├── belle.png
        │       └── chie.png
        │
        ├── components/
        │   ├── IntroOverlay.vue
        │   ├── CharacterDialog.vue
        │   ├── PhotoCard.vue
        │   └── tabs/
        │       ├── DietLogTab.vue
        │       ├── WorkoutLogTab.vue
        │       └── RunningLogTab.vue
        │
        ├── layouts/
        │   └── MainLayout.vue
        │
        ├── views/
        │   ├── HomeView.vue
        │   ├── LogView.vue
        │   ├── AchievementView.vue
        │   └── MyPageView.vue
        │
        ├── router/
        │   └── index.js
        │
        ├── App.vue
        ├── main.js
        └── style.css
```

---

## 주요 컴포넌트 상세

### 1. MainLayout.vue

**역할**: 전체 페이지 레이아웃 제공

**구조**:
```
┌──────────────────────────────────────┐
│  Top Navigation (Fixed, h-16, z-50)  │
├────────┬──────────────────┬───────────┤
│  Left  │   Center         │   Right   │
│ Sidebar│   Gallery        │  Sidebar  │
│ (Fixed)│  (Scrollable)    │  (Fixed)  │
│ 280px  │   flex-1         │  280px    │
│        │                  │           │
│ 4 Cards│  Slot Content    │  4 Cards  │
│        │                  │           │
└────────┴──────────────────┴───────────┘
```

**핵심 코드**:
```vue
<!-- Left Sidebar -->
<aside class="fixed left-0 top-16 w-[280px] h-[calc(100vh-4rem)] 
              bg-gradient-to-b from-cream/40 to-cream/20 
              border-r border-gray-200/50 overflow-y-auto z-30">
  <slot name="left"></slot>
</aside>

<!-- Center Content -->
<main class="flex-1 ml-[280px] mr-[280px] min-h-screen bg-white">
  <slot></slot>
</main>

<!-- Right Sidebar -->
<aside class="fixed right-0 top-16 w-[280px] h-[calc(100vh-4rem)]">
  <slot name="right"></slot>
</aside>
```

**중요 포인트**:
- `position: fixed` 사용으로 스크롤 시 사이드바 고정
- 중앙 콘텐츠는 `ml-[280px] mr-[280px]`로 마진 확보
- `z-30` 설정으로 레이어 순서 관리

---

### 2. HomeView.vue

**역할**: 메인 갤러리 페이지

**갤러리 아이템** (8개):
1. **Diet Master** - 식단 추적
2. **Workout Champion** - 운동 기록
3. **Body Transformation** - 체중 관리
4. **Hydration Hero** - 수분 섭취
5. **Running Legend** - 러닝 기록
6. **Shopping Spree** - 아이템 수집
7. **Achievement Hunter** - 업적 달성
8. **Fitness Journey** - 종합 진행상황

**스크롤 투 섹션 구현**:
```javascript
const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
```

**갤러리 카드 디자인**:
- 이미지 영역: `h-96` (384px)
- 이미지 크기: `w-80 h-80` (320x320px)
- 호버 효과: `group-hover:scale-105`
- 배지: 좌상단에 번호 표시
- 프로그레스 바: 60-100% 랜덤 진행도

---

### 3. PhotoCard.vue

**역할**: 사이드바용 Polaroid 스타일 카드

**스펙**:
- 최대 너비: 260px
- 종횡비: 3:4
- 이미지 높이: 192px (h-48)
- 텍스트 영역: 중앙 정렬

**애니메이션**:
```javascript
const { variant } = useMotion(cardRef, {
  initial: { scale: 1, y: 0 },
  hovered: { scale: 1.03, y: -6 }
})
```

**호버 효과**:
- 상승: -6px
- 확대: 1.03배
- 테두리: `border-pastel-red/30`
- 그림자: `shadow-xl`

---

### 4. LogView.vue

**역할**: 활동 로그 페이지 (식단/운동/러닝)

**캐릭터 탭 구조**:
```vue
<div class="grid grid-cols-3 gap-6">
  <!-- Toma - Diet Log -->
  <div class="character-tab" :class="active && 'scale-105'">
    <img src="toma.png" class="w-32 h-32 rounded-full" />
    <h3>Toma</h3>
    <p>Diet Log</p>
  </div>
  
  <!-- Belle - Workout Log -->
  <!-- Chie - Running Log -->
</div>
```

**탭 전환 로직**:
```javascript
const activeTab = ref('diet')
const setActiveTab = (tabId) => {
  activeTab.value = tabId
}
```

**비활성 탭 스타일**:
- `grayscale` 필터 적용
- `opacity-60`
- 호버 시 `grayscale-0`, `opacity-100`

**활성 탭 스타일**:
- 풀 컬러
- `scale-105` 확대
- 체크마크 배지 표시
- 컬러별 링: `ring-pastel-red` / `ring-pastel-yellow` / `ring-pastel-blue`

---

### 5. DietLogTab.vue

**주요 기능**:

1. **일일 목표 프로그레스**
   - 목표: 2000 kcal
   - 현재: 1520 kcal
   - 진행률: 76%
   - 그라디언트 바: `from-pastel-red to-pastel-yellow`

2. **매크로 영양소**
   ```vue
   <div class="grid grid-cols-3 gap-4">
     <div>Protein: 50g</div>
     <div>Carbs: 105g</div>
     <div>Fat: 16g</div>
   </div>
   ```

3. **식사 유형 선택**
   - Breakfast 🌅
   - Lunch ☀️
   - Dinner 🌙
   - Snacks 🍪

4. **음식 목록**
   - 각 아이템: 이름, 칼로리, 단백질, 탄수화물, 지방
   - 호버 시 삭제 버튼 표시

---

### 6. WorkoutLogTab.vue

**주요 기능**:

1. **운동 요약**
   - 총 운동 수
   - 총 세트 수
   - 운동 시간

2. **세트 추적 테이블**
   ```vue
   <div class="grid grid-cols-12 gap-3">
     <div class="col-span-2">Set 1</div>
     <div class="col-span-4">
       <input v-model="weight" placeholder="Weight (kg)" />
     </div>
     <div class="col-span-1">×</div>
     <div class="col-span-3">
       <input v-model="reps" placeholder="Reps" />
     </div>
     <div class="col-span-2">
       <button>✓</button>
     </div>
   </div>
   ```

3. **완료 상태 관리**
   - 완료된 세트: `bg-pastel-yellow/10`
   - 미완료: `bg-gray-50`
   - 토글 버튼: ○ ↔ ✓

---

### 7. RunningLogTab.vue

**주요 기능**:

1. **입력 폼**
   - 거리 (km): `step="0.1"`
   - 시간 (시:분:초): 3개 입력창
   - 날짜 선택

2. **자동 계산**
   ```javascript
   const pace = computed(() => {
     const totalMinutes = hours.value * 60 + minutes.value + seconds.value / 60
     const paceMinutes = Math.floor(totalMinutes / distance.value)
     const paceSeconds = Math.round(((totalMinutes / distance.value) % 1) * 60)
     return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`
   })
   
   const calories = computed(() => {
     return Math.round(distance.value * 60) // 1km당 60kcal
   })
   ```

3. **러닝 히스토리**
   - 날짜, 거리, 시간, 페이스 표시
   - 그리드 레이아웃 (4열)

---

### 8. AchievementView.vue

**3단계 시스템**:

#### 잠금 해제 (Unlocked)
```vue
<div class="achievement-card border-transparent hover:border-pastel-red/30">
  <img :src="achievement.image" class="w-full h-48 object-cover" />
  <h3>{{ achievement.title }}</h3>
  <p>{{ achievement.description }}</p>
  <span>{{ achievement.reward }}</span>
  <span>{{ achievement.unlockedDate }}</span>
</div>
```

#### 진행 중 (In Progress)
```vue
<div class="achievement-card border-pastel-yellow/30">
  <img :src="image" class="opacity-60 grayscale" />
  
  <!-- 프로그레스 바 -->
  <div class="w-full bg-gray-200 h-2 rounded-full">
    <div class="bg-gradient-to-r from-pastel-yellow to-pastel-red"
         :style="{ width: `${(progress/total)*100}%` }">
    </div>
  </div>
  
  <p>{{ progress }} / {{ total }}</p>
</div>
```

#### 잠김 (Locked)
```vue
<div class="achievement-card bg-gray-200 cursor-help" :title="hint">
  <div class="text-8xl opacity-30">🔒</div>
  <h3 class="text-gray-400">???</h3>
  <div class="bg-gray-200 group-hover:bg-white">
    <span>Hint:</span> {{ hint }}
  </div>
</div>
```

**카테고리 탭**:
- Unlocked 🏆 (5개)
- In Progress ⏳ (3개)
- Locked 🔒 (12개)

---

### 9. MyPageView.vue

**섹션 구성**:

#### 1. 프로필 카드
```vue
<div class="profile-card">
  <img :src="avatar" class="w-24 h-24 rounded-full ring-4 ring-pastel-red" />
  <h2>{{ name }}</h2>
  <span class="level-badge">Level {{ level }}</span>
  <div class="streak-badge">{{ streakDays }} Day Streak 🔥</div>
  
  <!-- XP 프로그레스 -->
  <div class="progress-bar">
    {{ xp }} / {{ nextLevelXp }} XP
  </div>
</div>
```

#### 2. 체중 진행상황
```vue
<div class="grid grid-cols-2 gap-6">
  <div>
    <p>Current: {{ currentWeight }} kg</p>
    <p>Goal: {{ goalWeight }} kg</p>
    <div class="progress-bar" :style="{ width: `${progressToGoal}%` }"></div>
  </div>
</div>
```

#### 3. BMI 계산기
```javascript
const bmi = computed(() => {
  const heightInMeters = height / 100
  return (currentWeight / (heightInMeters ** 2)).toFixed(1)
})

const bmiCategory = computed(() => {
  if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-500' }
  if (bmi < 25) return { text: 'Normal', color: 'text-green-500' }
  if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-500' }
  return { text: 'Obese', color: 'text-red-500' }
})
```

#### 4. 활동 요약
```vue
<div class="grid grid-cols-4 gap-6">
  <div>💪 {{ totalWorkouts }} Workouts</div>
  <div>🍽️ {{ totalMeals }} Meals Logged</div>
  <div>🏃 {{ totalRuns }} Runs</div>
  <div>🏆 {{ achievementsEarned }}/{{ totalAchievements }}</div>
</div>
```

#### 5. 계정 설정 버튼
- Edit Profile ✏️
- Change Password 🔒
- Update Health Info 📊
- Delete Account 🗑️

---

## 라우팅 구조

### router/index.js

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LogView from '../views/LogView.vue'
import MyPageView from '../views/MyPageView.vue'
import AchievementView from '../views/AchievementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/log', name: 'log', component: LogView },
    { path: '/mypage', name: 'mypage', component: MyPageView },
    { path: '/achievement', name: 'achievement', component: AchievementView }
  ]
})

export default router
```

**네비게이션 링크**:
```vue
<router-link to="/" active-class="text-pastel-red">Home</router-link>
<router-link to="/log" active-class="text-pastel-red">Log</router-link>
<router-link to="/achievement">Achievements</router-link>
<router-link to="/mypage">My Page</router-link>
```

---

## 디자인 시스템

### tailwind.config.js

```javascript
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pastel-red': '#FFB6C1',
        'pastel-yellow': '#FFD700',
        'pastel-blue': '#87CEEB',
        'cream': '#FFF8DC',
        'soft-black': '#2C2C2C',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
```

### 컬러 팔레트

| 이름 | HEX | 용도 |
|------|-----|------|
| pastel-red | #FFB6C1 | Toma, Diet, 기본 액센트 |
| pastel-yellow | #FFD700 | Belle, Workout |
| pastel-blue | #87CEEB | Chie, Running |
| cream | #FFF8DC | 배경, 카드 |
| soft-black | #2C2C2C | 텍스트 |

### 타이포그래피

```css
/* 제목 */
.text-5xl font-bold tracking-tight

/* 서브타이틀 */
.text-xl font-semibold

/* 본문 */
.text-base text-gray-600

/* 작은 텍스트 */
.text-sm text-gray-500
```

### 그림자

```css
/* 소프트 */
shadow-soft: 0 4px 20px rgba(0,0,0,0.08)

/* 중간 */
shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1)

/* 큰 */
shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1)

/* 매우 큰 */
shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25)
```

### 애니메이션

```css
/* 표준 트랜지션 */
transition-all duration-300

/* 긴 트랜지션 */
transition-all duration-500

/* 매우 긴 트랜지션 */
transition-all duration-700
```

---

## 백엔드 엔티티

### 1. User.java
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue
    private Long userId;
    private String username;
    private String email;
    private String password;
    private Integer height;
    private Integer age;
    private String gender;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 2. Npc.java
```java
@Entity
@Table(name = "npcs")
public class Npc {
    @Id @GeneratedValue
    private Long npcId;
    private String name;
    private String imageUrl;
    private String dialogType;
}
```

### 3. UserNpcStatus.java
```java
@Entity
@Table(name = "user_npc_status")
public class UserNpcStatus {
    @Id @GeneratedValue
    private Long statusId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "npc_id")
    private Npc npc;
    
    private Integer affectionLevel;
    private LocalDate lastInteraction;
}
```

### 4. Food.java
```java
@Entity
@Table(name = "foods")
public class Food {
    @Id @GeneratedValue
    private Long foodId;
    private String name;
    private Integer calories;
    private Double protein;
    private Double carbs;
    private Double fat;
}
```

### 5. Menu.java
```java
@Entity
@Table(name = "menus")
public class Menu {
    @Id @GeneratedValue
    private Long menuId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private LocalDate date;
    private String mealType; // BREAKFAST, LUNCH, DINNER, SNACK
    private Integer totalCalories;
    
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL)
    private List<MenuFood> menuFoods;
}
```

### 6. MenuFood.java
```java
@Entity
@Table(name = "menu_foods")
public class MenuFood {
    @Id @GeneratedValue
    private Long menuFoodId;
    
    @ManyToOne
    @JoinColumn(name = "menu_id")
    private Menu menu;
    
    @ManyToOne
    @JoinColumn(name = "food_id")
    private Food food;
    
    private Double quantity;
}
```

### 7. Exercise.java
```java
@Entity
@Table(name = "exercises")
public class Exercise {
    @Id @GeneratedValue
    private Long exerciseId;
    private String name;
    private String category; // STRENGTH, CARDIO, FLEXIBILITY
    private String muscleGroup;
}
```

### 8. WorkoutLog.java
```java
@Entity
@Table(name = "workout_logs")
public class WorkoutLog {
    @Id @GeneratedValue
    private Long workoutId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;
    
    private LocalDate date;
    private Integer durationMinutes;
    
    @OneToMany(mappedBy = "workoutLog", cascade = CascadeType.ALL)
    private List<WorkoutSet> sets;
}
```

### 9. WorkoutSet.java
```java
@Entity
@Table(name = "workout_sets")
public class WorkoutSet {
    @Id @GeneratedValue
    private Long setId;
    
    @ManyToOne
    @JoinColumn(name = "workout_id")
    private WorkoutLog workoutLog;
    
    private Integer setNumber;
    private Double weight;
    private Integer reps;
}
```

### 10. BodyLog.java
```java
@Entity
@Table(name = "body_logs")
public class BodyLog {
    @Id @GeneratedValue
    private Long logId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private LocalDate date;
    private Double weight;
    private Double bodyFatPercentage;
    private Double muscleMass;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 11. Achievement.java
```java
@Entity
@Table(name = "achievements")
public class Achievement {
    @Id @GeneratedValue
    private Long achievementId;
    private String name;
    private String description;
    private String condition;
    private Integer rewardXp;
}
```

### 12. UserAchievement.java
```java
@Entity
@Table(name = "user_achievements")
public class UserAchievement {
    @Id @GeneratedValue
    private Long userAchievementId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "achievement_id")
    private Achievement achievement;
    
    private LocalDateTime unlockedAt;
    private Double progress;
}
```

### 13. Gallery.java
```java
@Entity
@Table(name = "galleries")
public class Gallery {
    @Id @GeneratedValue
    private Long galleryId;
    private String name;
    private String imageUrl;
    private String unlockCondition;
}
```

### 14. UserGallery.java
```java
@Entity
@Table(name = "user_galleries")
public class UserGallery {
    @Id @GeneratedValue
    private Long userGalleryId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "gallery_id")
    private Gallery gallery;
    
    private LocalDateTime unlockedAt;
}
```

### 15. ChatLog.java
```java
@Entity
@Table(name = "chat_logs")
public class ChatLog {
    @Id @GeneratedValue
    private Long chatId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "npc_id")
    private Npc npc;
    
    private String message;
    private String sender; // USER, NPC
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

## 다음 개발 시 참고사항

### 🚀 즉시 시작 가능한 작업

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

서버는 `http://localhost:5173`에서 실행됩니다.

#### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 📝 구현 필요 사항 (우선순위 순)

#### 1. 백엔드 API 개발
- [ ] UserController - 회원가입, 로그인, 프로필 수정
- [ ] MenuController - 식단 CRUD
- [ ] WorkoutController - 운동 CRUD
- [ ] BodyLogController - 체중/체성분 CRUD
- [ ] AchievementController - 업적 조회, 진행상황 업데이트
- [ ] GalleryController - 갤러리 잠금해제 체크

#### 2. Frontend API 연동
```javascript
// 예시: services/api.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export const menuApi = {
  getDailyMenu: (userId, date) => 
    axios.get(`${API_BASE_URL}/menus/${userId}/${date}`),
  
  addFood: (menuData) => 
    axios.post(`${API_BASE_URL}/menus`, menuData),
  
  deleteFood: (menuFoodId) => 
    axios.delete(`${API_BASE_URL}/menus/foods/${menuFoodId}`)
}
```

#### 3. 로그인 시스템
- [ ] JWT 토큰 인증
- [ ] Vuex/Pinia 상태 관리
- [ ] LocalStorage 토큰 저장
- [ ] Auth Guard (라우터 가드)

#### 4. 실시간 데이터 연동
```javascript
// DietLogTab.vue 수정 예시
import { onMounted } from 'vue'
import { menuApi } from '@/services/api'

const foodItems = ref([])

onMounted(async () => {
  const response = await menuApi.getDailyMenu(userId, currentDate.value)
  foodItems.value = response.data
})
```

#### 5. 이미지 업로드
- [ ] 음식 사진 업로드 (S3 or 로컬 스토리지)
- [ ] 프로필 사진 업로드
- [ ] 갤러리 이미지 관리

#### 6. 차트/그래프 추가
```bash
npm install chart.js vue-chartjs
```

- [ ] 체중 변화 그래프 (LineChart)
- [ ] 주간 칼로리 섭취량 (BarChart)
- [ ] 운동 볼륨 추이 (AreaChart)

#### 7. 알림 시스템
- [ ] 운동 시작 알림
- [ ] 식사 시간 알림
- [ ] 업적 달성 알림
- [ ] 캐릭터 호감도 변화 알림

### 🎨 UI/UX 개선사항

#### 1. 반응형 디자인
현재는 데스크톱 위주입니다. 태블릿/모바일 대응 필요:

```css
/* tailwind.config.js screens 설정 */
screens: {
  'mobile': '375px',
  'tablet': '768px',
  'desktop': '1024px',
  'wide': '1920px',
}
```

모바일용 레이아웃:
- 사이드바 숨김 → 하단 탭바
- 카드 그리드 1열
- 햄버거 메뉴

#### 2. 다크모드
```javascript
// App.vue
const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}
```

#### 3. 로딩 상태
```vue
<template>
  <div v-if="loading" class="loading-spinner">
    <div class="animate-spin...">Loading...</div>
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

#### 4. 에러 핸들링
```javascript
const handleError = (error) => {
  if (error.response?.status === 401) {
    router.push('/login')
  } else {
    showNotification({
      type: 'error',
      message: error.message
    })
  }
}
```

### 🔐 보안 사항

#### 1. 환경 변수 설정
```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
VITE_IMAGE_UPLOAD_URL=http://localhost:8080/upload
```

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL)
  }
})
```

#### 2. CORS 설정 (Backend)
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

### 📊 데이터베이스 설정

#### application.yml (Backend)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lovenyam
    username: root
    password: yourpassword
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

### 🧪 테스트 코드 작성

#### Frontend (Vitest)
```bash
npm install -D vitest @vue/test-utils
```

```javascript
// PhotoCard.test.js
import { mount } from '@vue/test-utils'
import PhotoCard from '@/components/PhotoCard.vue'

describe('PhotoCard', () => {
  it('renders title correctly', () => {
    const wrapper = mount(PhotoCard, {
      props: {
        title: 'Test Card',
        description: 'Test Description',
        image: '/test.png'
      }
    })
    expect(wrapper.text()).toContain('Test Card')
  })
})
```

#### Backend (JUnit)
```java
@SpringBootTest
class MenuServiceTest {
    @Autowired
    private MenuService menuService;
    
    @Test
    void testCreateMenu() {
        Menu menu = new Menu();
        menu.setMealType("BREAKFAST");
        Menu saved = menuService.save(menu);
        assertNotNull(saved.getMenuId());
    }
}
```

### 📦 배포 준비

#### Frontend 빌드
```bash
npm run build
```

빌드 결과물: `dist/` 폴더

#### Backend 빌드
```bash
./mvnw clean package
```

빌드 결과물: `target/*.jar`

#### Docker 설정 (선택사항)
```dockerfile
# Dockerfile (Frontend)
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# Dockerfile (Backend)
FROM openjdk:17-jdk-slim
COPY target/lovenyam-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### 🐛 알려진 이슈

1. **PhotoCard 호버 애니메이션**
   - `@vueuse/motion` 의존성 필요
   - 없으면 호버 시 에러 발생 가능

2. **라우터 히스토리 모드**
   - 배포 시 서버 설정 필요 (Nginx rewrite)
   - 404 에러 방지

3. **이미지 경로**
   - 개발: `@/assets/images/`
   - 프로덕션: 절대 경로 또는 CDN 사용 권장

### 💡 추가 기능 아이디어

1. **소셜 기능**
   - 친구 추가
   - 운동 챌린지
   - 리더보드

2. **AI 추천**
   - 식단 추천
   - 운동 루틴 추천
   - 목표 달성 확률 예측

3. **웨어러블 연동**
   - Fitbit/Apple Watch 동기화
   - 심박수 모니터링

4. **게임화 요소 강화**
   - 캐릭터 의상 변경
   - 특수 아이템
   - 스토리 모드

---

## 📞 문의 및 지원

**프로젝트 구조**:
- Frontend: Vue 3 + Tailwind CSS
- Backend: Spring Boot + JPA
- Database: MySQL (권장)

**개발 서버**:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

**주요 파일 위치**:
- 레이아웃: `frontend/src/layouts/MainLayout.vue`
- 라우팅: `frontend/src/router/index.js`
- API 엔티티: `backend/src/main/java/com/lovenyam/entity/`

**다음 작업 시작 방법**:
1. 이 문서를 읽고 구조 파악
2. Backend 실행 → Frontend 실행
3. 브라우저에서 http://localhost:5173 접속
4. 원하는 기능부터 API 연동 시작

---

**최종 업데이트**: 2025-01-21 20:53  
**문서 버전**: 1.0  
**작성자**: Antigravity AI

✨ **모든 UI 리팩토링 완료! 다음 개발 시 이 문서를 참고하여 바로 시작하세요!** ✨

---

### ✅ Phase 7: Ultimate Quality Update (2025-11-25)
**목표**: 사용자 피드백 기반 "Ultimate Quality" 달성 및 기능 복구/개선

#### 1. 레이아웃 및 디자인 폴리싱
- [x] **사이드바 최적화**: `PhotoCard` 높이 비율 조정(60%) 및 패딩 최적화로 4개 카드가 스크롤 없이 완벽하게 배치되도록 수정.
- [x] **메인 로고 링크**: 로고 클릭 시 홈으로 이동하도록 `router-link` 적용.
- [x] **IntroOverlay 개선**:
    - 자동 넘김 제거, "대답하기" 버튼으로 수동 진행.
    - 선택지 버튼 가시성 개선 (노란색 버튼 텍스트 색상 변경).
    - 선택지 표시 중에도 마지막 질문 유지.
- [x] **AchievementView**: 이미지 위 불필요한 아이콘 오버레이 제거.

#### 2. 기능 복구 및 강화 (LogView)
- [x] **기능 복구**: 식단, 운동, 러닝 탭의 입력 폼 및 리스트 뷰 기능 완벽 복구.
- [x] **탭 디자인 개편**: 단순 버튼에서 **대형 캐릭터 카드** (Toma/Belle/Chie) 형태로 변경하여 몰입감 증대.
- [x] **대시보드 추가**: 월간 요약 정보(칼로리, 운동 시간 등)를 보여주는 대시보드 섹션 구현.
- [x] **캘린더 기능**:
    - 월간 캘린더 구현 (활동 기록이 있는 날짜에 색상 인디케이터 표시).
    - **인터랙티브 기능**: 날짜 클릭 시 해당 날짜의 기록을 조회 및 추가할 수 있도록 구현 (`selectedDate` 상태 관리).
- [x] **식단 기록 간소화**: 아침/점심/저녁 구분 제거, 단순 메뉴/칼로리 입력으로 변경.

#### 3. 로컬라이제이션 및 자산 관리
- [x] **전면 한글화**: 모든 뷰(Home, Log, Achievement, MyPage, Intro)의 텍스트를 자연스러운 한국어로 번역 완료.
- [x] **자산 표준화**: 외부 URL 대신 로컬 이미지(`toma.png`, `belle.png`, `chie.png`) 사용 및 `USER_TODO` 주석으로 교체 가이드 제공.
- [x] **AI 아이콘**: 현재 탭/상태에 맞는 고화질 캐릭터 이미지 연동 확인.

#### 4. 버그 수정
- [x] `MainLayout.vue`의 닫히지 않은 태그 문법 오류 수정.
- [x] 사이드바 `overflow-hidden` 적용으로 불필요한 스크롤 제거.

---

## Phase 8: V14 UI/UX 개선 및 커스텀 아이콘 시스템 (2025-12-14)

### 작업 일자: 2025년 12월 14일

### 1. 회원가입 및 프로필 수정 디자인 통일

#### 1.1. SignupView.vue 리디자인
- **목적**: 프로젝트의 파스텔 테마와 일관된 디자인 적용
- **변경 사항**:
  - 캐릭터 이미지 제거 (사용자 피드백 반영)
  - 중앙 정렬 단일 컬럼 레이아웃 (max-w-md)
  - 깔끔한 흰 배경 카드 (bg-white/80)
  - 그라데이션 타이틀 및 버튼 (pastel-red → pastel-yellow)
  - 한글 버튼 텍스트 ("가입하기", "돌아가기")

#### 1.2. EditProfileView.vue 신규 구현
- **라우트**: `/mypage/edit`
- **기능**: 사용자 프로필 정보 수정 (닉네임, 성별, 생년월일)
- **디자인**: SignupView와 동일한 중앙 정렬 레이아웃
- **특징**: Email 필드는 disabled (변경 불가)

#### 1.3. MyPageView.vue 업데이트
- **프로필 수정**: `handleEditProfile()` 함수가 `/mypage/edit`로 라우팅
- **계정 삭제**: `DeleteAccountModal` 컴포넌트 연동
  - 우는 Toma 이미지로 감성적 경고
  - 탈퇴 확인 후 로그아웃 및 랜딩 페이지로 이동

#### 1.4. DeleteAccountModal.vue 신규 생성
- **컴포넌트 타입**: 재사용 가능한 모달
- **디자인**: 중앙 모달 (max-w-md), backdrop blur
- **기능**: `cancel`/`confirm` 이벤트 emit

### 2. 커스텀 아이콘 시스템 구축

#### 2.1. 아이콘 인프라 설정
```
frontend/src/assets/icons/
├── index.js              # 중앙 아이콘 관리
├── toma-gallery.png      # 갤러리 메뉴 아이콘
├── belle-log.png         # 기록 메뉴 아이콘
└── chii-achievement.png  # 업적 메뉴 아이콘
```

#### 2.2. HomeView.vue 메뉴 아이콘 업그레이드
- **적용 메뉴**: 갤러리, 기록, 업적
- **효과**: 마우스 오버 시 역동적 애니메이션
  - **갤러리** (toma-gallery): 우측 12도 회전 + 바운스
  - **기록** (belle-log): 좌측 12도 회전 + 바운스
  - **업적** (chii-achievement): 우측 6도 회전 + 바운스
- **정렬**: 아이콘 없는 메뉴(마이페이지, 로그아웃)는 빈 공간(w-12 h-12)으로 정렬 유지

#### 2.3. 아이콘 사용법
```javascript
// icons/index.js
import { ICONS } from '@/assets/icons/index.js'

// Vue 템플릿
<img :src="ICONS.tomaGallery" alt="gallery" class="w-12 h-12" />
```

### 3. 주요 기술적 개선

#### 3.1. 컴포넌트 구조
- **EditProfileView**: 독립적인 프로필 수정 페이지로 분리
- **DeleteAccountModal**: 재사용 가능한 모달 컴포넌트

#### 3.2. 라우팅
```javascript
// router/index.js
{
  path: '/mypage/edit',
  name: 'editProfile',
  component: () => import('../views/EditProfileView.vue')
}
```

#### 3.3. 반응형 디자인
- 모바일: 단일 컬럼, 캐릭터 이미지 숨김
- 데스크톱: 여유로운 레이아웃, 애니메이션 효과

### 4. 디자인 일관성

#### 4.1. 통일된 요소
- **색상**: pastel-red, pastel-yellow, pastel-blue, cream
- **레이아웃**: 중앙 정렬 카드 (max-w-md)
- **버튼**: 그라데이션 (pastel-red → pastel-yellow)
- **입력 필드**: white 배경, rounded-xl, focus ring
- **배경**: cream/50 + pastel 그라데이션

#### 4.2. 애니메이션
- **모달**: modal-in (slide + scale)
- **메뉴 아이콘**: scale-125, rotate, bounce
- **호버**: 밑줄, 색상 변화, 이동

### 5. 개발 시 주의사항

#### 5.1. 아이콘 관리
- **파일명 규칙**: kebab-case (예: `toma-gallery.png`)
- **크기**: 128x128px 또는 256x256px PNG
- **스타일**: 미소녀 연애 시뮬레이션 컨셉에 맞는 귀여운 디자인
- **위치**: `frontend/src/assets/icons/` 폴더에 저장
- **import**: `icons/index.js`에서 중앙 관리

#### 5.2. 아이콘 추천 사이트
1. **Icons8** (가장 추천): https://icons8.com
   - "Cute Color" 또는 "Cute Clipart" 스타일 사용
2. **Flaticon**: https://www.flaticon.com
3. **Freepik**: https://www.freepik.com

#### 5.3. 파일 존재 확인
- **중요**: import하기 전에 반드시 파일이 존재하는지 확인
- **오류 방지**: 존재하지 않는 파일 import 시 빌드 에러 발생

#### 5.4. 정렬 유지
- 아이콘 없는 메뉴 항목은 빈 `<div class="w-12 h-12"></div>` 추가
- 모든 메뉴의 레이블 위치를 일관되게 유지

### 6. 향후 개선 사항

#### 6.1. 추가 아이콘 대체
- 마이페이지 아이콘 (현재 이모티콘)
- 로그아웃 아이콘 (현재 이모티콘)
- 채팅 버튼 아이콘 (현재 💬)

#### 6.2. 백엔드 연동
- 프로필 수정 API 연결
- 계정 삭제 API 연결
- 실시간 데이터 동기화

#### 6.3. 사용자 경험 개선
- Toast 알림 시스템 (alert 대체)
- 로딩 스피너 추가
- 폼 유효성 검사 강화

### 7. 파일 변경 이력 (2025-12-14)

#### 신규 파일
- `frontend/src/views/EditProfileView.vue`
- `frontend/src/components/DeleteAccountModal.vue`
- `frontend/src/assets/icons/index.js`
- `frontend/src/assets/icons/toma-gallery.png`
- `frontend/src/assets/icons/belle-log.png`
- `frontend/src/assets/icons/chii-achievement.png`

#### 수정 파일
- `frontend/src/views/SignupView.vue` (디자인 통일)
- `frontend/src/views/MyPageView.vue` (모달 연동, 라우팅)
- `frontend/src/views/HomeView.vue` (커스텀 아이콘 적용)
- `frontend/src/router/index.js` (EditProfile 라우트 추가)

### 8. 코드 품질 체크리스트

- [x] 일관된 디자인 토큰 사용
- [x] 재사용 가능한 컴포넌트 구조
- [x] 반응형 디자인 적용
- [x] Props/Emit 패턴 올바르게 사용
- [x] 파일 존재 확인 후 import
- [x] 빌드 에러 없음
- [ ] Toast 알림 시스템 (향후 개선)
- [ ] 실제 API 연동 (향후 개선)

---
