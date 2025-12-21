# 🥗 Love & Fitness (LoveNyam)

> **"건강한 습관, 설레는 시작"**  
> 미소녀 연애 시뮬레이션(Date Sim) 요소를 결합한 AI 기반 개인화 헬스케어 코칭 웹 어플리케이션

![LoveNyam Banner](frontend/src/assets/images/door_final.png)

## 📖 Project Overview

**Love & Fitness**는 단순한 운동 기록을 넘어, 매력적인 캐릭터와의 유대감을 통해 지속적인 동기 부여를 제공하는 서비스입니다. 사용자는 식단과 운동을 기록하며 캐릭터(Toma, Belle, Chie)와의 호감도를 쌓고, AI 페르소나의 맞춤형 코칭을 받으며 성장합니다.

### ✨ Key Features

*   **🚪 Immersive Entry (Visual Novel Style)**
    *   감성적인 "문 열기" 인트로와 화이트 페이드 효과.
    *   사용자 경험을 고려한 최초 1회 진입 로직.
*   **💬 Interactive Home Hub**
    *   메인 캐릭터 **Toma**와의 실시간 상호작용.
    *   대화 선택지에 따른 지능적인 페이지 라우팅 (식단, 운동, 러닝 기록).
*   **🖼️ Gallery & Achievements**
    *   운동/식단 기록에 따른 시각적 보상(일러스트 해금).
    *   직관적인 카드 뉴스 형태의 갤러리 뷰.
*   **🤖 AI Persona Coaching**
    *   사용자의 기록을 분석하여 캐릭터 성격(츤데레, 활발함 등)에 맞는 피드백 제공.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Vue.js 3 (Composition API)
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS, Vanilla CSS (Custom Animations)
*   **State Management**: Pinia (Planned) / Reactivity API
*   **Router**: Vue Router

### Backend
*   **Framework**: Spring Boot 3.x
*   **Language**: Java 17+
*   **Database**: MySQL 8.0
*   **ORM**: MyBatis

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Java JDK 17+
*   MySQL Server

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-repo/lovenyam.git
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Backend Setup**
    *   Import the project into IntelliJ IDEA or Eclipse.
    *   Update `application.properties` with your MySQL credentials.
    *   Run `LoveNyamApplication.java`.

## 📂 Project Structure

```
LoveNyam/
├── backend/            # Spring Boot Application
│   ├── src/main/java   # Java Source Code
│   └── pom.xml         # Maven Dependencies
├── frontend/           # Vue.js Application
│   ├── src/
│   │   ├── assets/     # Images, Fonts, CSS
│   │   ├── components/ # Reusable Vue Components
│   │   ├── layouts/    # Main Layout Structure
│   │   ├── router/     # Routing Configuration
│   │   └── views/      # Page Views (Home, Landing, Gallery...)
│   └── vite.config.js  # Vite Configuration
└── README.md           # Project Documentation
```

## 🎨 Design Philosophy

*   **Pastel & Soft**: 편안하고 설레는 분위기를 위한 파스텔 톤 컬러 팔레트.
*   **Retro & Pixel**: 고전 미연시 게임의 향수를 자극하는 픽셀 폰트와 UI 요소.
*   **Clean & Modern**: 복잡하지 않고 직관적인 사용자 인터페이스.

## 📝 License

This project is licensed under the MIT License.

---
*Developed by SSAFY 12th Team LoveNyam*
