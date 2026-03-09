#!/bin/bash
# Firebase 자동 설정 스크립트

echo "🔥 Firebase 자동 설정 시작..."
echo ""

# Firebase CLI 설치 확인
if ! command -v firebase &> /dev/null
then
    echo "📦 Firebase CLI 설치 중..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI 설치 완료"
else
    echo "✅ Firebase CLI 이미 설치됨"
fi

echo ""
echo "🔐 Firebase 로그인..."
firebase login

echo ""
echo "📋 Firebase 프로젝트 목록:"
firebase projects:list

echo ""
read -p "기존 프로젝트 ID를 입력하거나 엔터를 눌러 새 프로젝트 생성: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo ""
    echo "🆕 새 프로젝트 생성..."
    echo "브라우저에서 Firebase Console로 이동합니다."
    echo "1. https://console.firebase.google.com"
    echo "2. '프로젝트 추가' 클릭"
    echo "3. 프로젝트 이름 입력 (예: defect-management)"
    echo "4. Google 애널리틱스 비활성화"
    echo "5. 프로젝트 만들기"
    echo ""
    read -p "프로젝트 생성 완료 후 프로젝트 ID 입력: " PROJECT_ID
fi

echo ""
echo "🔥 Firebase 초기화..."
firebase init firestore --project $PROJECT_ID

echo ""
echo "🌐 웹 앱 설정 정보 가져오기..."
echo "브라우저에서 다음 단계를 진행하세요:"
echo "1. Firebase Console → 프로젝트 개요"
echo "2. 웹 아이콘 (</>) 클릭"
echo "3. 앱 닉네임: defect-management-app"
echo "4. Firebase Hosting 체크 해제"
echo "5. 앱 등록 클릭"
echo ""

read -p "Firebase 설정 코드를 복사했습니까? (y/n): " COPIED

if [ "$COPIED" = "y" ]; then
    echo ""
    echo "📝 js/firebase-config.js 파일을 열고"
    echo "6~12번 줄의 firebaseConfig를 교체하세요."
    echo ""
    echo "✅ Firebase 설정 완료!"
    echo ""
    echo "🚀 다음 단계:"
    echo "1. js/firebase-config.js 파일 수정"
    echo "2. git add js/firebase-config.js"
    echo "3. git commit -m 'feat: Firebase 설정 완료'"
    echo "4. git push"
    echo "5. 배포 사이트 새로고침"
fi
