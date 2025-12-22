# Project Spec: Love & Fitness (가제: 두근두근 헬스 클럽)

> Project Goal: 미소녀 연애 시뮬레이션(Date Sim) 요소를 결합한 AI 기반 개인화 헬스케어 코칭 웹 어플리케이션 구축
> 

## 1. 프로젝트 개요 (Overview)

본 프로젝트는 지속적인 동기 부여가 필요한 '다이어트 및 운동' 활동에 '미소녀 캐릭터와의 유대감 형성'이라는 게임적 보상을 결합한 서비스입니다. 사용자는 건강 데이터를 입력함으로써 히로인과의 호감도를 높이고, AI 페르소나 챗봇을 통해 감성적인 코칭을 받습니다.

### 핵심 가치 (Core Value)

- **Gamification**: 운동 수행이 캐릭터의 성장 및 스토리 해금으로 직결됨.
- **Personalization**: 사용자의 신체 데이터 및 수행 능력을 기반으로 한 맞춤형 가이드.
- **Emotional Bond**: 딱딱한 코칭이 아닌, 연인/조력자 관계의 AI 대화를 통한 지속성 유지.

## 2. 상세 기능 명세 (Detailed Features)

### A. 사용자 및 건강 데이터 관리 (Health Management)

1. **대시보드**: 체중, 골격근량, 체지방률 변화 그래프 시각화 (Chart.js 활용).
2. **일일 기록 (Daily Log)**:
    - **식단**: 아침/점심/저녁/간식 입력, 칼로리 및 탄단지 자동 계산 (공공 데이터 API 활용 권장).
    - **운동**: 운동 종목, 시간, 세트, 무게 입력 및 소모 칼로리 계산.
3. **비교 분석**:
    - 사용자 연령/성별 평균 데이터 대비 본인의 위치(백분위) 시각화.
    - 목표 달성률(Goal Achievement Rate) 계산.

### B. 게이미피케이션 & 미소녀 시스템 (Galge Mechanics)

1. **호감도 시스템 (Affection Algorithm)**:
    - `Total_Score = (식단점수 * 0.4) + (운동점수 * 0.6)`
    - 목표 달성 시 호감도 상승, 3일 이상 미접속 시 호감도 하락 및 캐릭터 대사 변화(삐짐, 걱정).
2. **업적 및 추억 (Memory & Archive)**:
    - **이벤트 CG 해금**: 특정 업적 달성 시 고퀄리티 일러스트(추억) 해금.
        - *예: 5kg 감량 달성 -> "함께 해변 조깅" 일러스트 해금.*
        - *예: 30일 연속 출석 -> "발렌타인데이 초콜릿" 이벤트 발생.*
    - **칭호 시스템**: '헬린이', '단백질 헌터', '유산소 마스터' 등 칭호 부여.
3. **상호작용 (Live Interaction)**:
    - 메인 화면에서 캐릭터 터치 시 반응(랜덤 대사 출력).
    - 사용자의 건강 상태(피로도)에 따른 캐릭터 표정 변화(Sprite 변경).

### C. AI 챗봇 코칭 (AI Persona Coaching)

1. **페르소나 주입 (System Prompting)**:
    - AI에게 특정 캐릭터 성격(예: 츤데레, 상냥한 누나 등) 부여.
    - 단순 정보 전달을 넘어 감정적 지지 수행.
2. **맥락 인식 코칭**:
    - 사용자 DB의 최근 기록(어제 폭식함, 오늘 운동 안 함)을 프롬프트에 포함하여 전송.
    - *AI 발화 예시: "어제 치킨 먹었더라? 오늘은 스쿼트 3세트 더 하기로 약속했지? 안 하면 실망할 거야."*

## 3. 시스템 아키텍처 (System Architecture)

### Tech Stack

- **Backend**: Java 17+, Spring Boot 3.x
- **Database**: MySQL 8.0
- **ORM**: MyBatis (SQL 매핑 및 동적 쿼리 활용)
- **Frontend**: Vue.js, Chart.js
- **AI Integration**: OpenAI API or Google Gemini API (Spring WebClient 활용)

### 데이터 흐름도 (Data Flow)

1. **Client**: 운동/식단 데이터 입력
2. **Controller**: 데이터 유효성 검사 및 Service 호출
3. **Service**:
    - MyBatis를 통해 DB 저장.
    - 게이미피케이션 로직 수행 (경험치/호감도 계산).
    - AI API에 `User_Context`(최근 기록 + 성격)를 담아 코칭 메시지 요청.
4. **AI API**: 페르소나에 입각한 답변 생성 및 반환.
5. **DB**: 사용자 기록 및 AI 대화 로그 저장.
6. **View**: 캐릭터 이미지(표정), 대화창, 그래프 렌더링.

## 4. 데이터베이스 스키마 설계 제안 (ERD Draft)

### 1. Users (사용자)

- `user_id` (PK), `password`, `nickname`
- `height`, `weight`, `gender`, `goal_weight`
- `current_affection` (현재 호감도), `level`

### 2. Daily_Log (일일 기록)

- `log_id` (PK), `user_id` (FK)
- `date`, `food_intake_kcal`, `workout_burn_kcal`
- `workout_type`, `memo`

### 3. Achievements (업적 마스터)

- `achievement_id` (PK)
- `title`, `description`, `condition_type` (예: weight_loss, attendance)
- `reward_image_url` (해금될 CG 경로)

### 4. User_Achievements (사용자 업적 현황)

- `ua_id` (PK), `user_id` (FK), `achievement_id` (FK)
- `is_unlocked` (Boolean), `unlocked_at` (Date)

### 5. Chat_History (대화 기록)

- `chat_id` (PK), `user_id` (FK)
- `message_user`, `message_ai`
- `timestamp`, `context_summary` (이전 대화 요약)

## 5. AI 프롬프트 엔지니어링 전략 (Prompt Strategy)

AI에게 다음과 같은 구조화된 프롬프트를 전송하여 캐릭터성을 유지합니다.

```
[System Role]
당신은 사용자의 헬스 트레이너이자 연인인 '하루'입니다.
성격: 활발하고 긍정적이지만, 운동을 게을리하면 엄격하게 굽니다.
말투: 반말을 사용하며, 이모지를 자주 사용합니다. (~해!, ~했어?)

[User Context]
- 사용자 이름: {userName}
- 어제 운동량: {yesterdayWorkout} (목표 미달성)
- 오늘 식단: {todayDiet} (고칼로리 섭취)
- 현재 호감도: {affectionLevel} (낮음)

[Instruction]
위 정보를 바탕으로 사용자에게 운동을 독려하는 메시지를 작성하세요.
식단을 지적하되 기분 나쁘지 않게 동기를 부여하세요.

```

## 6. 개발 로드맵 (Roadmap)

1. **Phase 1**: DB 설계 및 회원가입, 기초 운동/식단 CRUD 구현.
2. **Phase 2**: 대시보드 시각화 및 통계 로직 구현.
3. **Phase 3**: 캐릭터 UI 배치 및 호감도 알고리즘 적용.
4. **Phase 4**: AI API 연동 및 챗봇 서비스 구축.
5. **Phase 5**: 업적 시스템 및 CG 갤러리 구현.


## 7. 전반적인 웹 디자인
1. 컨셉 디자인은 https://www.felissimo.co.jp/ranma/ranma_cha.html 사이트를 참고해서 디자인

# 메인화면 디자인 마크다운
# Project: Retro Vibe "Mi-Yeon-Si" Interactive Web Page

## 1. 프로젝트 개요
이 프로젝트는 [참고 이미지: 란마 1/2 콜라보 사이트]의 **레트로하고 키치한 디자인 바이브**를 기반으로, **미소녀 연애 시뮬레이션(Visual Novel)** 게임 같은 인터랙션을 결합한 개인 웹페이지입니다.

## 2. 핵심 기능 및 사용자 흐름 (User Flow)

### Phase 1: 메인 레이아웃 (The Layout) - "3단 구조"
* **전체 구조:** 화면을 좌(Left) - 중(Center) - 우(Right) 3분할로 나눕니다.
* **스크롤 동작 (중요):**
    * **Left & Right (고정):** 양쪽 사이드바는 스크롤되지 않고 화면에 **고정(Sticky/Fixed)**되어 있습니다. 여기에 내비게이션 역할을 하는 '포토카드'가 배치됩니다.
    * **Center (스크롤):** 오직 **가운데 영역만 스크롤**이 가능합니다. 이곳에 실제 콘텐츠(텍스트, 이미지 등)가 길게 이어집니다.

### Phase 2: 포토카드 인터랙션 (Magic Cards)
* **배치:** 왼쪽 사이드바에 4개, 오른쪽 사이드바에 4개 (총 8개)의 카드 슬롯이 있습니다.
* **디자인:** 레트로한 굵은 테두리와 파스텔톤 배경의 카드 디자인.
* **호버 효과 (Hover Effect):**
    * 마우스를 카드에 올리면, 카드 뒤나 옆에서 **작은 픽셀 아트 캐릭터(또는 귀여운 아이콘)가 '뿅' 하고 튀어나오는 애니메이션**을 구현해주세요. (bouncy animation)
    * 카드 자체가 살짝 커지거나 기울어지는 효과 포함.
* **클릭 동작 (Click Action):**
    * 카드를 클릭하면 가운데(Center) 영역의 **해당 콘텐츠 위치로 부드럽게 스크롤(Smooth Scroll)**되어 이동합니다.

    
### Phase 3: 화면이동 - "미연시 모드"
* **화면 구성:**
    * 메인페이지를 들어오는 순간
    * 중앙 또는 하단에 **귀여운 2D 캐릭터** 일러스트가 등장.
    * 하단에 게임 스타일의 **대화창(Dialogue Box)** 표시.
    * 타이핑 효과로 텍스트 출력: *"안녕? 건강관리 하게? 기다리고 있었어!"*
* **상호작용:**
    * 사용자에게 2~3개의 선택지 버튼 제공 (예: "식단 등록하러 왔어", "근력 운동 등록하러 왔어", "지구력 운동 등록하러 왔어").
    * 버튼을 클릭하면 캐릭터가 기뻐하는 표정으로 바뀌며 *"좋아, 들어와!"* 대사와 함께 오버레이가 페이드 아웃(Fade-out)되고 등록 화면이 열립니다.

## 3. 디자인 가이드 (Design Vibe)
* **참고 레퍼런스:** 란마 1/2 펠리시모 콜라보 사이트.
# 🎨 Revised Color Palette (미소녀 연애 시뮬레이션 감성)

## 🌟 Base
- **배경(Base White)**: `#FFFFFF`  
  - 기본 화면은 밝고 깨끗한 순백 사용

## ❤️ Main Character Colors (레드 / 블랙 / 옐로우)

### 🔴 Red (메인 포인트)
- **Soft Red (파스텔 레드)**: `#F8A8A8`
- **Vivid Red (강조용)**: `#E63946`
  - 버튼, 선택지 하이라이트, 캐릭터 포인트용

### ⚫ Black (강조/선/텍스트)
- **Deep Ink Black**: `#222222`
  - 텍스트 전용
- **Soft Dark Gray**: `#4A4A4A`
  - UI 라인, 그림자, 중간 강조

### 🟡 Yellow (밝은 포인트)
- **Pastel Yellow**: `#FFE08C`
- **Soft Gold Accent**: `#F4C430`
  - 캐릭터 헤어 포인트, 작고 귀여운 UI 강조

## 🌸 Sub Accent (연애 시뮬레이터 감성 보조 컬러)
- **Blush Pink**: `#FFD5E5`
- **Peach**: `#FFEDD5`
  - 화면을 부드럽게 만들기 위한 보조용

## 🎀 느낌 정리
- 전체적으로 **하얀 배경 + 파스텔 레드·옐로우 강조 + 잉크색 텍스트** 구조  
- 미소녀 연애 시뮬레이터 특유의 **따뜻하고 부드러운 분위기 유지**  
- UI는 **최소한의 색 포인트만 사용**해서 깔끔하게  

* **Typography:** 레트로한 고딕체 또는 픽셀 폰트 추천.
* **장식 요소:** 화면 모서리의 전통 문양 프레임, 구름 모양 배경 장식 등을 CSS나 SVG로 구현.

## 5. 요청 사항 (Action Items)
위 내용을 바탕으로 **단일 페이지(Single Page) 형태의 코드를 작성**해주세요.
1.  먼저 `IntroOverlay` 컴포넌트를 만들어주세요.
2.  `Layout` 컴포넌트에서 좌우 고정, 중앙 스크롤을 `flex` 또는 `grid`로 구현해주세요.
3.  `PhotoCard` 컴포넌트에 Framer Motion을 사용하여 호버 시 캐릭터가 튀어나오는 효과를 넣어주세요.

# Project Feature Specs: Daily Quest System (Diet & Workout)

## 1. 레이아웃 배치 (Layout & Positioning)
기존 3단 레이아웃을 활용하여 기능을 배치합니다.

### Left Column (Status Zone)
* **Top (Left-Top): [Global Date Picker]**
    * 레트로한 픽셀 아트 스타일의 달력 아이콘.
    * 클릭 시 달력 모달이 뜨고 날짜를 선택할 수 있음.
    * 기본값: `Today`. 날짜를 변경하면 식단/운동 기록과 대시보드 데이터가 해당 날짜로 바뀜.
* **Bottom (Left-Bottom): [Health Dashboard]**
    * RPG 게임의 '스테이터스 창' 디자인.
    * 입력된 데이터를 기반으로 그래프나 게이지바(HP/MP 스타일)로 시각화.

### Right Column (Action Zone)
* **Top (Right-Top): [Input Forms]**
    * 탭(Tab) 또는 카드 선택에 따라 입력 폼 내용이 바뀜.
    * 디자인: 게임의 '퀘스트 수락 창' 같은 느낌의 보드.
* **Bottom (Right-Bottom): [AI Summon Buttons]**
    * 3개의 귀여운 픽셀 아이콘 버튼 배치 (토마토, 바벨, 치타).

---

## 2. 등록 화면 디자인

### A. 입력 폼 (Input Forms) - Right Top
모든 입력 폼은 미연시에 맞는 귀여운 텍스트 박스와 버튼 스타일을 사용합니다.

1.  **식단 등록 (Diet Log)**
    * **Fields:**
        * 음식 이름 (Text Input)
        * 섭취량 (Number Input + Unit: `g`)
    * **Button:** "먹었다!" (Submit)

2.  **근력 운동 (Strength Training)**
    * **Fields:**
        * 운동 부위 (Select Box: 가슴, 등, 하체, 어깨, 팔, 복근)
        * 세트 수 (Number Input: `Set`)
        * 세트 당 횟수 (Number Input: `Reps`)
    * **Button:** "해냈다!" (Submit)

3.  **지구력 운동 (Endurance Training)**
    * **Fields:**
        * 운동 종류 (Text Input: 러닝, 사이클, 수영 등)
        * 운동 시간 (Number Input + Unit: `min`)
    * **Button:** "완주!" (Submit)

---

### B. 헬스 대시보드 (Dashboard) - Left Bottom
입력된 데이터에 따라 실시간으로 변하는 시각화 구역입니다.

* **Visual Style:** * 일반적인 차트 라이브러리(Recharts 등)를 쓰되, 색상은 테마 컬러(Yellow/Red/black)를 사용.
    * 폰트는 픽셀 폰트 사용.
* **Contents:**
    * **칼로리 게이지:** 식단 입력 시 채워지는 바(Bar).
    * **근성(Strength) 스탯:** 근력 운동 세트 수에 따라 올라가는 육각형 스탯 혹은 레벨 표시.
    * **지구력(Stamina) 스탯:** 운동 시간에 따라 채워지는 원형 그래프.

---

### C. AI 페르소나 에이전트 (AI Agents) - Right Bottom
클릭 시 인트로에 나왔던 **메인 캐릭터**가 다시 등장하지만, **선택한 아이콘에 따라 말투와 역할(Persona)이 바뀝니다.**

#### UI Components
* **Button 1: 🍅 (토마토)** - 식단/영양 코치
* **Button 2: 🏋️ (바벨)** - 근력 트레이너 (엄격한 교관 스타일)
* **Button 3: 🐆 (치타)** - 러닝 메이트 (활기찬 응원단장 스타일)

#### Interaction Flow
1.  사용자가 오른쪽 하단의 아이콘(예: 🏋️) 클릭.
2.  화면 중앙 또는 하단에 캐릭터 오버레이 등장 (Animation: Slide Up).
3.  **AI Logic:**
    * 현재 입력된 데이터를 분석해서 피드백을 주거나 입력에 도움을 줌.
    * *예시 (근력):* "오, 오늘은 가슴 운동을 5세트나 했네? 내일은 근육통 좀 있겠는데? 단백질 챙겨 먹어!"
    * *예시 (식단):* "고구마 2개를 먹었으면 120g으로 입력하면 돼!"
4.  대화창 닫기 버튼으로 복귀.


### 추가내용

1. 대시보드를 추가해서 현재 나의 식습관의 상태를 확인할 수 있도록 구현
2. 달력표시로 언제 식단, 운동을 하였는지 간편하게 기록 가능해야함
3. 대시보드는 이번 달의 상태를 요약하는 건강 정보(식단과 운동 탭 나눠서 다른 정보를 보여줘야함)

---

## 3. 기술 구현 가이드 (Tech Implementation)
* **LLM Integration (Simulated):** 실제 AI 연결 전에는, 사전 정의된 스크립트 배열(Array)에서 상황에 맞는 대사를 랜덤으로 출력하는 방식으로 목업(Mock-up) 구현.


# Project Feature Specs: Achievement & Collection System

## 1. 시스템 개요 (System Overview)
이 시스템은 사용자의 활동(식단, 운동) 보상으로 **'폴라로이드 사진(업적)'**을 해금하고, 이를 **메인 페이지의 8개 슬롯(Slot)**에 장착(Equip)하여 커스터마이징하는 기능입니다.

* **핵심 개념:**
    * **Inventory:** 전체 업적 목록 (업적 페이지).
    * **Deck:** 메인 페이지에 노출할 수 있는 최대 8개의 선택된 업적.
    * **Reward:** 업적 달성 시 제공되는 일러스트와 스토리(폴라로이드 형태).

---


-----------------------------------
## 3. UI 구성: 업적 페이지 (Achievement Page)

### A. 상단 필터 및 캐릭터 (Character Filter Nav)
화면 최상단에 3명의 캐릭터(AI 페르소나)가 매달려 있는(Sticky) 디자인.
* **Components:**
    1.  **🍅 토마토 (Diet):** 클릭 시 식단 관련 업적만 필터링.
    2.  **🏋️ 바벨 (Strength):** 클릭 시 근력 운동 관련 업적만 필터링.
    3.  **🐆 치타 (Endurance):** 클릭 시 유산소 운동 관련 업적만 필터링.
    * *Interaction:* 캐릭터 클릭 시 해당 캐릭터가 조금 더 아래로 내려오거나 하이라이트 처리됨.

### B. 진행률 바 (Progress Bar)
캐릭터 아래에 전체 업적 달성도를 보여주는 게이지 바.
* **Design:** 레트로 게임의 경험치(EXP) 바 디자인.
* **Data:** `(달성한 업적 수 / 전체 업적 수) * 100`

### C. 업적 리스트 (Achievement Grid)
업적의 상태에 따라 3가지 타입으로 구분하여 그리드(Grid) 형태로 나열.

1.  **완료됨 (Unlocked):**
    * 썸네일이 선명하게 보임.
    * 클릭 시 **[상세 보기 모달]** 오픈.
    * 이미 메인페이지에 등록된 경우 '장착됨(Equipped)' 뱃지 표시.
2.  **진행 중 (In Progress):**
    * 흑백 처리되거나 투명도 조절.
    * 하단에 개별 진행률 표시 (예: 스쿼트 50/100회).
3.  **잠김 (Locked):**
    * 이미지 대신 거대한 **물음표(?)** 아이콘 표시.
    * 클릭하거나 호버 시 **'수수께끼 같은 힌트'**만 텍스트로 표시 (예: *"다리가 불타는 느낌을 10번 느껴라..."*).

---

## 3. 상세 기능: 업적 상세 및 장착 (Detail & Equip)

### A. 상세 보기 모달 (Polaroid Detail Modal)
완료된 업적을 클릭했을 때 뜨는 팝업.
* **Design:** 실제 폴라로이드 사진처럼 흰색 프레임에 사진과 손글씨 폰트의 설명이 적혀있음.
* **Contents:**
    * 일러스트 (업적 관련 귀여운 그림).
    * 업적 명 & 달성 날짜.
    * 감성적인 짧은 글귀 (Flavor Text).
* **Action Button:**
    * **"메인 페이지에 걸기 (Register)"** 버튼.

### B. 슬롯 관리 매니저 (Slot Manager Modal)
"메인 페이지에 걸기"를 눌렀을 때 작동하는 로직.

* **Logic:**
    * **Case 1 (슬롯 여유 있음):** 즉시 등록되고 "등록되었습니다!" 토스트 메시지 출력.
    * **Case 2 (슬롯 8개 꽉 참):** **[슬롯 교체 창]**이 뜸.
* **[슬롯 교체 창] UI:**
    * 현재 메인 페이지에 등록된 8개의 업적 리스트가 미니 아이콘으로 뜸.
    * 사용자가 "제거할 업적"을 선택하고 "교체"를 누르면 새로운 업적으로 바뀜.

---

## 4. 메인 페이지 연동 (Main Page Integration)

이 시스템은 기존 **메인 페이지의 구조**를 동적으로 변화시킵니다.

### A. 사이드바 슬롯 (Side Columns - The Deck)
* 기존에 기획한 좌/우 8개의 카드 자리는 이제 **'유저가 장착한 업적'**으로 채워집니다.
* 빈 슬롯은 "비어있음" 또는 "+" 아이콘으로 표시되어 업적 페이지로 유도.

### B. 중앙 스크롤 영역 (Center Column - The Album)
* **동작 (Scroll & Snap):**
    * 사이드바의 업적 카드(폴라로이드)를 클릭하면, 중앙 화면이 **해당 업적의 상세 내용(큰 폴라로이드)**이 있는 위치로 부드럽게 스크롤 이동(ScrollIntoView)합니다.
* **콘텐츠:**
    * 중앙 영역은 유저가 장착한 8개 업적의 상세 이미지가 세로로 나열된 형태입니다.
    * 즉, **"나의 명예의 전당"** 같은 느낌으로 스크롤하며 감상할 수 있습니다.

---

## 5. 기술 구현 포인트 (Tech Points)
// AchievementDTO.java
@Getter @Setter
public class AchievementDTO {
    private Long id;            // DB PK
    private String type;        // "diet", "strength", "endurance"
    private boolean isLocked;   // 해금 여부 (1: 해금, 0: 잠김)
    private int progress;       // 진행률 (0 ~ 100)
    private String title;       // 업적 이름
    private String hint;        // 잠금 시 노출할 힌트
    private String description; // 해금 시 노출할 설명(폴라로이드 글귀)
    private String imageSrc;    // 이미지 경로
}
* **State Management (Zustand):**

    * Drag & Drop 라이브러리를 사용하여 메인 페이지 등록 시 드래그로 교체하는 느낌을 주면 더 좋음(선택 사항).


### 모든 컬러 구현을 변경 컬러는 아래 색감에 맞게 
# 🎨 Revised Color Palette (미소녀 연애 시뮬레이션 감성)

## 🌟 Base
- **배경(Base White)**: `#FFFFFF`  
  - 기본 화면은 밝고 깨끗한 순백 사용

## ❤️ Main Character Colors (레드 / 블랙 / 옐로우)

### 🔴 Red (메인 포인트)
- **Soft Red (파스텔 레드)**: `#F8A8A8`
- **Vivid Red (강조용)**: `#E63946`
  - 버튼, 선택지 하이라이트, 캐릭터 포인트용

### ⚫ Black (강조/선/텍스트)
- **Deep Ink Black**: `#222222`
  - 텍스트 전용
- **Soft Dark Gray**: `#4A4A4A`
  - UI 라인, 그림자, 중간 강조

### 🟡 Yellow (밝은 포인트)
- **Pastel Yellow**: `#FFE08C`
- **Soft Gold Accent**: `#F4C430`
  - 캐릭터 헤어 포인트, 작고 귀여운 UI 강조

## 🌸 Sub Accent (연애 시뮬레이터 감성 보조 컬러)
- **Blush Pink**: `#FFD5E5`
- **Peach**: `#FFEDD5`
  - 화면을 부드럽게 만들기 위한 보조용

## 🎀 느낌 정리
- 전체적으로 **하얀 배경 + 파스텔 레드·옐로우 강조 + 잉크색 텍스트** 구조  
- 미소녀 연애 시뮬레이터 특유의 **따뜻하고 부드러운 분위기 유지**  
- UI는 **최소한의 색 포인트만 사용**해서 깔끔하게  
- 픽셀은 과하지 않고 적절히 귀여운 정도로만 사용


#현재 폰트 유지 