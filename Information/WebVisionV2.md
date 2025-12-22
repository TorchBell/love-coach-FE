🏗️ 프로젝트 아키텍처 리팩토링: Pinia 및 Axios 도입 지침

1. ✅ 현재 상태 및 디자인 유지 (Current Status)

디자인 확정: 현재 구현된 UI 디자인, 레이아웃, 애니메이션은 모두 만족스럽습니다.

핵심 요구사항: 리팩토링 과정에서 화면에 보이는 비주얼과 기능은 100% 동일하게 유지되어야 합니다.

2. 🛠️ 기술 스택 전환 및 구조 개선 (Tech Refactoring)

현재의 코드를 확장성과 유지보수성을 고려하여 Pinia와 Axios 기반으로 재구성합니다.

A. Pinia 상태 관리 도입 (Store Implementation)

목표: 컴포넌트 간 복잡한 props 전달 방식을 제거하고, Pinia Store를 통해 데이터를 중앙에서 관리합니다.

세부 지침:

기능별로 Store를 분리하여 모듈화합니다 (예: useAuthStore, useLogStore, useUiStore).

현재의 하드코딩된 로직들을 Store의 **state**와 **actions**로 이동시켜 코드를 깔끔하게 정리합니다.

B. Axios 통신 환경 구축

목표: 추후 서버 연동을 대비하여 Axios 기본 설정을 완료합니다.

세부 지침:

API 호출을 위한 기본 인스턴스 및 인터셉터 설정을 구성합니다.

데이터 흐름이 Component -> Store -> Axios -> Server가 되도록 구조를 잡습니다. (현재는 Server 대신 더미 데이터를 반환하도록 Mocking 처리)

3. 🎨 에셋 및 콘텐츠 관리 (Asset & Content Management)

향후 이미지와 대사는 작성자(사용자)가 직접 수정할 예정이므로, 수정이 가장 용이한 구조로 변경해야 합니다.

A. 이미지 에셋 더미 처리 (Dummy Assets)

중앙 관리: 모든 이미지 경로는 컴포넌트에 하드코딩하지 않고, 별도의 설정 파일(예: assetsConfig.js) 하나에서 관리하도록 변경합니다.

더미 처리: 현재 사용 중인 이미지들은 **더미(Placeholder)**로 처리하고, **// TODO: [사용자 수정 영역] 실제 이미지 경로로 변경**과 같은 명확한 주석을 달아주세요.

B. 텍스트 및 대사 분리 (Text Externalization)

대사 관리: 캐릭터의 대사나 안내 문구 등은 컴포넌트 내부에서 분리하여 별도의 상수 파일이나 Store에 저장합니다.

수정 용이성: 제가 나중에 코드의 깊은 곳을 뒤지지 않고도, 변수 값만 바꾸면 전체 대사가 변경되도록 구조화해주세요.

🚀 4. 최종 목표 (Final Goal)

"화면은 그대로, 코드는 전문가답게."


## 5. ✅ 개발 완료 현황 (Development Status)

### A. 리팩토링 완료 (Refactoring Completed)
- **Pinia 도입**: `authStore`, `uiStore`, `logStore` 구현 및 전역 상태 관리 적용 완료.
- **Axios 설정**: `src/api` 폴더 내 API 모듈 분리 및 Mocking 구현 완료.
- **에셋 중앙화**: `src/assets/dummy/index.js`를 통해 이미지 경로 통합 관리.
- **텍스트 분리**: `src/constants/text.js`를 생성하여 대사 및 텍스트 상수화 완료.

### B. 안정화 및 버그 수정 (Stabilization)
- **HTML 구조 개선**: `button` 태그 내 `div` 중첩 문제 해결 (`div role="button"`으로 변경).
- **런타임 오류 해결**: `PhotoCard.vue`의 `useMotion` 관련 오류 수정.
- **빌드 검증**: `npm run build` 성공 확인.

이제 프로젝트는 확장 가능한 구조로 재편되었으며, 추후 백엔드 연동 및 콘텐츠 수정이 용이한 상태입니다.