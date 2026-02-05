## 폰트 파일 넣는 곳 (언어별 분리)

이 폴더는 화면설계서(HTML)에서 사용할 **로컬 폰트 파일**을 넣는 위치입니다.

### 권장 구조

- `assets/fonts/ko/` : 한국어 폰트
- `assets/fonts/en/` : 영문 폰트
- `assets/fonts/zh-Hant/` : 번체(繁體中文) 폰트

### 권장 포맷

- `woff2` 우선 (가볍고 브라우저 호환이 가장 좋음)
- 차선: `woff`, 그 외 `otf/ttf`

### 다음에 할 일

1) 폰트 파일을 위 폴더에 복사해 주세요.  
2) 파일명/weight(Regular=400, Medium=500, SemiBold=600 등)를 알려주시거나, 파일명이 weight를 포함하도록 해주세요.  
3) 그러면 `assets/style.css`에 `@font-face`를 등록하고, `html:lang(ko|en|zh-Hant)`에 따라 폰트가 자동으로 바뀌게 연결해드립니다.

