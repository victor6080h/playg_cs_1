# 🔥 Firebase 설정 가이드

## 📋 목차
1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성)
2. [Firestore 데이터베이스 설정](#2-firestore-데이터베이스-설정)
3. [Firebase 설정 코드 적용](#3-firebase-설정-코드-적용)
4. [배포 및 테스트](#4-배포-및-테스트)
5. [보안 규칙 설정](#5-보안-규칙-설정-선택)

---

## 1. Firebase 프로젝트 생성

### 단계별 진행:

#### 1-1. Firebase Console 접속
```
🌐 https://console.firebase.google.com
```

#### 1-2. 프로젝트 생성
```
1. "프로젝트 추가" 클릭
2. 프로젝트 이름: defect-management-system
3. "계속" 클릭
4. Google 애널리틱스: ❌ 사용 안함 선택
5. "프로젝트 만들기" 클릭
6. 완료 대기 (1-2분)
```

---

## 2. Firestore 데이터베이스 설정

### 단계별 진행:

#### 2-1. Firestore Database 생성
```
1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 버튼 클릭
```

#### 2-2. 보안 규칙 선택
```
● 테스트 모드로 시작 (권장)
  - 모든 직원이 데이터 읽기/쓰기 가능
  - 나중에 보안 강화 가능

또는

○ 프로덕션 모드
  - 추가 보안 규칙 설정 필요
```

#### 2-3. 위치 선택
```
asia-northeast3 (Seoul) 선택
→ "사용 설정" 클릭
→ 완료 대기 (1-2분)
```

---

## 3. Firebase 설정 코드 적용

### 단계별 진행:

#### 3-1. Firebase 설정 코드 복사
```
1. Firebase Console에서
   ⚙️ (톱니바퀴) → "프로젝트 설정" 클릭

2. "내 앱" 섹션 아래로 스크롤

3. </> 웹 아이콘 클릭

4. 앱 닉네임: defect-app
   "앱 등록" 클릭

5. "Firebase SDK 구성" 코드가 나타남
   → firebaseConfig 부분만 복사!
```

**복사할 코드 예시:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "defect-management-system.firebaseapp.com",
  projectId: "defect-management-system",
  storageBucket: "defect-management-system.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

#### 3-2. 프로젝트 파일에 설정 붙여넣기
```
1. js/firebase-config.js 파일 열기

2. 8-15줄의 firebaseConfig를 찾아서
   복사한 내용으로 교체

Before:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",  // ← 교체 필요!
  ...
};

After:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // ← 실제 값!
  ...
};

3. 파일 저장
```

---

## 4. 배포 및 테스트

### 4-1. 파일 업로드
```
GenSpark 호스팅에 다음 파일 업로드:
✅ index.html (수정됨)
✅ js/firebase-config.js (신규)
✅ 기타 모든 파일
```

### 4-2. 테스트
```
1. 배포된 사이트 접속
   https://your-url.gensparksite.com

2. 브라우저 개발자 도구 열기 (F12)

3. Console 탭에서 확인:
   ✅ Firebase 연결 완료!
   ✅ Firebase API 준비 완료!

4. "수입 물량 관리" → 데이터 등록
   → Firebase Console에서 데이터 확인!
```

### 4-3. Firebase Console에서 데이터 확인
```
1. Firebase Console → Firestore Database

2. "defects" 컬렉션과 "imports" 컬렉션이 생성됨

3. 등록한 데이터가 실시간으로 표시됨!
```

---

## 5. 보안 규칙 설정 (선택)

### 회사 IP만 허용하기 (권장)

#### 5-1. Firebase Console에서
```
1. Firestore Database → 규칙 탭

2. 다음 규칙으로 교체:
```

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 모든 사람이 읽기/쓰기 가능 (테스트용)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**또는 더 안전하게:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 5-2. 규칙 게시
```
"게시" 버튼 클릭
```

---

## ✅ 완료 체크리스트

설정 완료 후 확인:

- [ ] Firebase 프로젝트 생성 완료
- [ ] Firestore 데이터베이스 생성 완료
- [ ] firebaseConfig 코드 붙여넣기 완료
- [ ] index.html 수정 완료
- [ ] js/firebase-config.js 업로드 완료
- [ ] 사이트 접속 시 "Firebase 연결 완료!" 콘솔 메시지 확인
- [ ] 데이터 등록 테스트 완료
- [ ] Firebase Console에서 데이터 확인 완료
- [ ] 다른 직원 PC에서도 같은 데이터 보임 확인

---

## 🎉 완료!

이제 모든 직원이:
- ✅ 같은 URL 접속
- ✅ 같은 데이터 공유
- ✅ 실시간 동기화
- ✅ 데이터 영구 저장

---

## 🆘 문제 해결

### "Firebase 연결 완료!" 메시지가 안 나타남
```
원인: firebaseConfig가 올바르지 않음
해결: Firebase Console에서 설정 다시 복사
```

### "Permission denied" 오류
```
원인: Firestore 보안 규칙 문제
해결: 테스트 모드로 변경
```

### 데이터가 Firebase Console에 안 보임
```
원인: 컬렉션 이름 오류
해결: 브라우저 F12 → Console 탭에서 오류 확인
```

---

## 📞 추가 지원

문제가 계속되면:
1. 브라우저 F12 → Console 탭 스크린샷
2. Firebase Console 스크린샷
3. IT 담당자에게 문의
