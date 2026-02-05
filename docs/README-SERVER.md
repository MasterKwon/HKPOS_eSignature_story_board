# 간단 서버 실행 가이드

## Python HTTP 서버 사용 (권장)

### 사전 준비

1. **Python 설치 확인**
   ```bash
   python --version
   ```
   - Python이 설치되어 있지 않으면: https://www.python.org/downloads/ 에서 다운로드
   - 설치 시 **"Add Python to PATH"** 옵션을 반드시 체크하세요

### 사용 방법

#### 방법 1: 배치 파일 사용 (가장 간단)

```bash
# 파일 탐색기에서 더블클릭하거나
start-server.bat
```

#### 방법 2: PowerShell 스크립트 사용

```powershell
.\start-server.ps1
```

#### 방법 3: 직접 명령어 실행

```bash
cd "02.화면설계서"
python -m http.server 8000
```

### 접속 URL

서버 시작 후 브라우저에서 접속:

```
http://localhost:8000/
```

### 서버 중지

서버를 중지하려면:
- 터미널/명령 프롬프트 창에서 **Ctrl+C** 누르기

### 포트 변경

기본 포트는 8000입니다. 다른 포트를 사용하려면:

```bash
python -m http.server 8080
```

또는 스크립트 실행 시 포트 번호를 입력하세요.

## 장점

- ✅ Python만 설치하면 바로 사용 가능
- ✅ 추가 설정 불필요
- ✅ 메모리 사용량이 매우 낮음
- ✅ Cursor의 메모리 문제 해결

## 문제 해결

### Python을 찾을 수 없습니다

1. Python이 설치되어 있는지 확인: `python --version`
2. PATH 환경 변수에 Python이 추가되어 있는지 확인
3. Python 재설치 시 "Add Python to PATH" 옵션 체크

### 포트가 이미 사용 중입니다

- 다른 포트 번호 사용 (예: 8001, 8080)
- 또는 해당 포트를 사용하는 프로그램 종료

### 파일이 로드되지 않습니다

- 브라우저 개발자 도구(F12) → Console 탭에서 오류 확인
- Network 탭에서 파일 로드 실패 여부 확인
- 서버가 정상 실행 중인지 확인 (터미널 창 확인)
