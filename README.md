# Prayer for Love — 사랑의 기도타임

결혼 이야기로 참견하신 분께 "사랑의 기도" 의무를 발급하는 인터랙티브 웹 페이지입니다. 이름 입력 → 발언자 등록 → 발언 선택 → 판정/콤보 → 기도 요청서 발급 → 기도 수행(타이머/체크리스트) → 완료 → 관리자 현황(PIN 보호) 순서로 이어지는 단일 페이지 플로우입니다.

## 기술 스택

- 순수 HTML / CSS / Vanilla JavaScript (프레임워크 없음)
- [Vite](https://vitejs.dev/) — 로컬 개발 서버 및 프로덕션 빌드 도구로만 사용
- Google Fonts: Cormorant Garamond, Noto Serif KR, Noto Sans KR

## 프로젝트 구조

```
index.html          진입점, 전체 스텝(section) 마크업
css/app.css         전체 스타일 (반응형 포함)
js/data.js          발언/기도 데이터 정의
js/combo.js         콤보 판정 로직
js/state.js         앱 상태 및 로컬스토리지 처리
js/views.js         화면 렌더링 함수
js/main.js          이벤트 바인딩 및 앱 진입
assets/             이미지 에셋
```

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 안내된 로컬 주소(기본 http://localhost:5173)로 접속합니다.

## 빌드

```bash
npm run build
npm run preview
```

`dist/` 폴더에 정적 파일이 생성됩니다.
