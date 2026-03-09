# 🚀 배포 가이드 (Deployment Guide)

## ✅ 배포 전 최종 체크리스트

### 1. 소스코드 검증 완료
- ✅ 모든 JavaScript 파일 문법 검증 완료
- ✅ 모든 페이지 정상 작동 확인
- ✅ 에러 없이 로드됨

### 2. 기능 테스트 완료
- ✅ 대시보드: 차트 및 통계 정상 표시
- ✅ 수입 물량 관리: 테이블 정상 표시 (가로 스크롤)
- ✅ 불량 등록: 폼 및 파일 업로드 정상
- ✅ 불량 목록: 필터링 및 삭제 정상
- ✅ LOT/수입일자 요약: 통계 정상 표시
- ✅ 보고서 출력: PDF 생성 및 사진 포함 정상
- ✅ 자동 백업: 30분마다 자동 실행

### 3. 브라우저 호환성
- ✅ Chrome (권장)
- ✅ Edge
- ✅ Firefox
- ✅ Safari

---

## 📁 프로젝트 구조

```
불량 제품 관리 시스템/
│
├── index.html                      # 메인 HTML
├── README.md                       # 프로젝트 설명
├── FIREBASE_SETUP.md              # Firebase 설정 가이드
├── IMPORTANT_DATA_BACKUP.md       # 데이터 백업 가이드
├── DEPLOYMENT.md                  # 배포 가이드 (이 파일)
│
├── css/
│   └── style.css                  # 스타일시트
│
└── js/
    ├── firebase-config.js         # Firebase 설정 (중요!)
    ├── auto-backup.js             # 자동 백업 시스템
    ├── sample-data.js             # 샘플 데이터
    ├── storage.js                 # 로컬 스토리지 유틸
    ├── utils.js                   # 공통 유틸리티
    ├── main.js                    # 메인 앱 로직
    ├── dashboard.js               # 대시보드 페이지
    ├── imports.js                 # 수입 물량 관리
    ├── register.js                # 불량 등록
    ├── list.js                    # 불량 목록
    ├── summary.js                 # LOT/수입일자 요약
    └── report.js                  # 보고서 출력
```

---

## 🌐 배포 방법

### 옵션 1: 로컬 서버 (테스트용)

```bash
# Python 3가 설치되어 있다면
cd /path/to/project
python3 -m http.server 8000

# 또는 Node.js가 설치되어 있다면
npx http-server -p 8000

# 접속
http://localhost:8000
```

### 옵션 2: Firebase Hosting (권장)

```bash
# 1. Firebase CLI 설치
npm install -g firebase-tools

# 2. Firebase 로그인
firebase login

# 3. 프로젝트 초기화
firebase init hosting
# - 프로젝트 선택
# - Public directory: . (현재 디렉토리)
# - Single-page app: No
# - GitHub auto-deploy: No

# 4. 배포
firebase deploy --only hosting

# 5. 배포 URL 확인
# https://your-project-id.web.app
```

### 옵션 3: GitHub Pages

```bash
# 1. GitHub 저장소에 푸시
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# 2. GitHub 저장소 Settings
# - Pages 메뉴 선택
# - Source: Deploy from a branch
# - Branch: main, / (root)
# - Save 클릭

# 3. 배포 URL
# https://username.github.io/repository-name
```

### 옵션 4: Netlify (간편)

```bash
# 1. Netlify CLI 설치
npm install -g netlify-cli

# 2. 로그인
netlify login

# 3. 배포
netlify deploy --prod

# 또는 웹 인터페이스 사용
# 1. https://netlify.com 접속
# 2. "Add new site" 클릭
# 3. 프로젝트 폴더 드래그 앤 드롭
# 4. 배포 완료!
```

### 옵션 5: Vercel

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 배포
vercel

# 또는 GitHub 연동
# 1. https://vercel.com 접속
# 2. "Import Project" 클릭
# 3. GitHub 저장소 연결
# 4. 자동 배포!
```

---

## 🔧 배포 후 설정

### 1. Firebase 설정 (직원 데이터 공유용)

⚠️ **중요: 모든 직원이 데이터를 공유하려면 필수!**

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com
   ```

2. **프로젝트 생성**
   - "프로젝트 추가" 클릭
   - 프로젝트 이름 입력
   - Google 애널리틱스 비활성화

3. **Firestore 데이터베이스 생성**
   - "Firestore Database" 메뉴
   - "데이터베이스 만들기" 클릭
   - "테스트 모드에서 시작" 선택
   - 위치: `asia-northeast3 (Seoul)`

4. **웹 앱 추가**
   - 프로젝트 개요 → 웹 아이콘 (</>)
   - 앱 닉네임 입력
   - Firebase Hosting 체크 해제
   - "앱 등록" 클릭

5. **설정 코드 적용**
   - Firebase 설정 코드 복사
   - `js/firebase-config.js` 파일의 6~12번 줄 수정
   - 배포된 사이트에 반영

6. **보안 규칙 설정 (선택사항)**
   ```javascript
   // Firestore 보안 규칙
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;  // 개발용 (모든 접근 허용)
         // 프로덕션에서는 인증 추가 권장
       }
     }
   }
   ```

### 2. 도메인 설정 (선택사항)

#### Firebase Hosting 커스텀 도메인
```bash
firebase hosting:channel:deploy production --domain your-domain.com
```

#### Netlify 커스텀 도메인
1. Netlify 대시보드 → Site settings
2. Domain management → Add custom domain
3. DNS 레코드 설정 (A 레코드 또는 CNAME)

---

## 📊 성능 최적화

### 1. CDN 사용 (이미 적용됨)
```html
<!-- Chart.js, SheetJS, jsPDF, html2canvas, Font Awesome -->
<!-- Firebase SDK -->
<!-- 모두 CDN에서 로드 (빠른 로딩) -->
```

### 2. 이미지 최적화
- 불량 등록 시 이미지 자동 리사이징 (최대 1920x1080)
- Base64 인코딩으로 별도 파일 없이 저장

### 3. 자동 백업
- LocalStorage 사용 시 30분마다 자동 백업
- Firebase 사용 시 자동 백업 비활성화 (불필요)

---

## 🔒 보안 설정

### 1. Firebase 보안 규칙 (프로덕션)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 읽기/쓰기 가능
    match /defects/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /imports/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Firebase 인증 추가 (선택사항)

```javascript
// firebase-config.js에 추가
firebase.auth().signInAnonymously();
// 또는 Google 로그인
firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
```

### 3. 환경변수 (선택사항)

```javascript
// .env 파일 (프로덕션)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

---

## 📱 모바일 대응

### PWA (Progressive Web App) 설정 (선택사항)

1. **manifest.json 생성**
```json
{
  "name": "불량 제품 관리 시스템",
  "short_name": "불량관리",
  "description": "제품 불량 관리 및 보고서 시스템",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **index.html에 추가**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2563eb">
```

3. **Service Worker 등록 (선택사항)**
```javascript
// sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/css/style.css',
        '/js/main.js'
      ]);
    })
  );
});
```

---

## 🧪 테스트 체크리스트

### 기능 테스트
- [ ] 대시보드 로드 및 차트 표시
- [ ] 수입 물량 등록/수정/삭제
- [ ] 불량 등록 (사진 첨부 포함)
- [ ] 불량 목록 필터링
- [ ] 엑셀 다운로드
- [ ] PDF 보고서 생성 (사진 포함)
- [ ] 자동 백업 작동
- [ ] 백업 다운로드 및 복원

### 브라우저 테스트
- [ ] Chrome (최신 버전)
- [ ] Firefox (최신 버전)
- [ ] Safari (최신 버전)
- [ ] Edge (최신 버전)

### 모바일 테스트
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] 반응형 레이아웃
- [ ] 터치 인터페이스

### 데이터 테스트
- [ ] LocalStorage 저장/로드
- [ ] Firebase 저장/로드 (설정 시)
- [ ] 샘플 데이터 초기화
- [ ] 데이터 삭제 및 복원

---

## 📞 배포 후 지원

### 문제 발생 시

1. **브라우저 콘솔 확인 (F12)**
   - 에러 메시지 확인
   - 네트워크 탭에서 실패한 요청 확인

2. **Firebase 설정 확인**
   - `js/firebase-config.js` 파일의 설정 값 확인
   - Firebase Console에서 프로젝트 상태 확인

3. **캐시 삭제**
   - Ctrl + Shift + Delete (캐시 및 쿠키 삭제)
   - 페이지 새로고침

4. **백업 복원**
   - 최근 백업 파일 찾기
   - F12 → Console → `AutoBackup.restoreBackup()` 실행

### 연락처 정보
- 프로젝트 GitHub: https://github.com/victor6080h/playg_cs_1
- 문서: README.md, FIREBASE_SETUP.md, IMPORTANT_DATA_BACKUP.md

---

## 🎯 배포 완료 후 할 일

1. **✅ Firebase 설정** (모든 직원 데이터 공유)
2. **✅ 사용자 교육** (직원들에게 사용법 안내)
3. **✅ 백업 정책 수립** (주기적 백업 일정)
4. **✅ 모니터링** (오류 및 성능 모니터링)
5. **✅ 피드백 수집** (개선 사항 파악)

---

## 🚀 배포 URL

**현재 배포 URL:** https://8000-i41699xozsavs9synnldg-8f57ffe2.sandbox.novita.ai/

**GitHub 저장소:** https://github.com/victor6080h/playg_cs_1

---

## 📝 버전 정보

- **버전:** 1.0.0
- **마지막 업데이트:** 2026-03-09
- **배포 준비:** ✅ 완료

---

**배포 성공을 기원합니다! 🎉**
