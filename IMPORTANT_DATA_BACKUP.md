# ⚠️ 중요: 데이터 보관 및 공유 안내

## 🚨 현재 상황

**현재 시스템:**
- ❌ 각 직원의 **브라우저에만** 데이터 저장 (LocalStorage)
- ❌ 다른 직원들과 데이터 공유 **불가능**
- ❌ 브라우저 캐시 삭제 시 데이터 **영구 손실**
- ❌ 컴퓨터 변경 시 데이터 **접근 불가**

**문제점:**
```
❌ A 직원이 등록한 불량 → B 직원은 볼 수 없음
❌ 브라우저 캐시 삭제 → 모든 데이터 손실
❌ 다른 컴퓨터 접속 → 데이터 없음
❌ 팀 전체 통계 → 각자 데이터만 집계
```

---

## ✅ 해결 방법: Firebase 설정 (필수)

### 🔥 Firebase란?
Google이 제공하는 **무료 클라우드 데이터베이스**
- ✅ **모든 직원이 같은 데이터 공유**
- ✅ **실시간 동기화** (A가 등록 → B가 즉시 확인)
- ✅ **영구 저장** (절대 사라지지 않음)
- ✅ **자동 백업** (Google이 자동 관리)
- ✅ **무료** (월 50,000건까지)

---

## 📖 Firebase 설정 가이드 (10분)

### 1단계: Firebase 프로젝트 생성

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com
   ```

2. **"프로젝트 추가" 클릭**
   - 프로젝트 이름: `defect-management` (원하는 이름)
   - Google 애널리틱스: 비활성화 (선택사항)
   - "프로젝트 만들기" 클릭

### 2단계: Firestore 데이터베이스 생성

1. 왼쪽 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. **보안 규칙 선택:**
   - ⚠️ **"테스트 모드에서 시작"** 선택
   - (나중에 보안 규칙 설정 가능)
4. **위치 선택:**
   - `asia-northeast3 (Seoul)` 선택 (한국 서버)
5. **"사용 설정"** 클릭

### 3단계: 웹 앱 추가

1. 프로젝트 개요 페이지로 이동
2. **웹 아이콘 (</>)** 클릭
3. 앱 닉네임 입력: `defect-app`
4. "Firebase Hosting 설정" **체크 안 함**
5. **"앱 등록"** 클릭

### 4단계: 설정 코드 복사

화면에 표시되는 `firebaseConfig` 코드 복사:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 5단계: 코드 적용

1. 프로젝트 폴더의 `js/firebase-config.js` 파일 열기
2. 6~12번 줄의 설정을 복사한 내용으로 **교체**:

**변경 전:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",  // ← 여기 교체
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

**변경 후:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // ← 복사한 내용
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

3. 파일 저장 후 **브라우저 새로고침**

### 6단계: 확인

페이지를 새로고침하면 콘솔에 다음 메시지가 표시됩니다:
```
✅ Firebase 연결 완료!
🔥 Firebase API 준비 완료!
```

---

## 🎯 Firebase 설정 후 효과

### Before (현재 - LocalStorage)
```
김철수 컴퓨터 → 김철수 데이터만 보임
이영희 컴퓨터 → 이영희 데이터만 보임
박민수 컴퓨터 → 박민수 데이터만 보임
❌ 데이터 공유 불가
❌ 전체 통계 불가능
```

### After (Firebase 설정 후)
```
김철수 컴퓨터 → 전체 데이터 보임 ✅
이영희 컴퓨터 → 전체 데이터 보임 ✅
박민수 컴퓨터 → 전체 데이터 보임 ✅
✅ 실시간 데이터 공유
✅ 전체 통계 가능
✅ 영구 저장
```

---

## 💾 임시 백업 방법 (Firebase 설정 전)

Firebase 설정 전까지 데이터를 보호하는 방법:

### 방법 1: JSON 파일로 백업

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭으로 이동
3. 다음 코드 입력:

```javascript
// 백업 데이터 다운로드
const backup = {
    defects: JSON.parse(localStorage.getItem('defects') || '[]'),
    imports: JSON.parse(localStorage.getItem('imports') || '[]'),
    backupDate: new Date().toISOString()
};
const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
a.click();
```

### 방법 2: 엑셀로 백업

1. "불량 목록" 페이지 이동
2. "엑셀 다운로드" 버튼 클릭
3. "수입 물량 관리" 페이지 이동
4. "엑셀 다운로드" 버튼 클릭

---

## 🔄 백업 데이터 복원 (Firebase 설정 전)

백업한 JSON 파일을 복원하려면:

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 다음 코드 입력:

```javascript
// 파일 선택 대화상자 표시
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const backup = JSON.parse(text);
    localStorage.setItem('defects', JSON.stringify(backup.defects));
    localStorage.setItem('imports', JSON.stringify(backup.imports));
    alert('복원 완료! 페이지를 새로고침하세요.');
    location.reload();
};
input.click();
```

---

## ⚠️ 주의사항

### LocalStorage 사용 시 (현재 상태)

**절대 하지 말아야 할 것:**
- ❌ 브라우저 캐시 삭제 (데이터 손실)
- ❌ 브라우저 개인정보 보호 모드 (데이터 저장 안 됨)
- ❌ 다른 브라우저 사용 (데이터 접근 불가)

**주기적으로 해야 할 것:**
- ✅ **매일 엑셀 백업** (불량 목록 + 수입 물량)
- ✅ **주 1회 JSON 백업** (전체 데이터)
- ✅ **중요 데이터는 즉시 백업**

---

## 🆘 긴급 상황 대응

### 데이터가 사라진 경우

1. **당황하지 마세요!**
2. **브라우저를 닫지 마세요!** (다른 탭에 데이터가 남아있을 수 있음)
3. 즉시 백업 절차 실행
4. 최근 엑셀 백업 파일 확인

### 복구가 불가능한 경우

**LocalStorage 한계:**
- ❌ 브라우저 캐시 삭제 후에는 복구 불가능
- ❌ 백업 파일이 없으면 복구 불가능

**해결책:**
- ✅ **지금 바로 Firebase 설정!** (10분)
- ✅ 설정 후에는 이런 문제 발생 안 함

---

## 📞 도움이 필요하신가요?

Firebase 설정 중 문제가 발생하면:

1. **Firebase 공식 문서:**
   - https://firebase.google.com/docs/web/setup

2. **문제 해결:**
   - Firebase Console에서 설정 확인
   - 브라우저 콘솔에서 오류 메시지 확인
   - `js/firebase-config.js` 파일 내용 재확인

---

## 🎯 결론

**현재 상태:**
- ⚠️ LocalStorage 사용 중
- ⚠️ 데이터 공유 불가
- ⚠️ 손실 위험 있음

**권장 사항:**
- ✅ **지금 바로 Firebase 설정** (10분)
- ✅ 설정 후 모든 문제 해결
- ✅ 모든 직원이 데이터 공유
- ✅ 영구 저장 보장

**Firebase 설정은 필수입니다!**
