// Firebase Configuration and Initialization
// 🔥 여기에 Firebase 설정을 입력하세요! 🔥

// ⚠️ 중요: 아래 firebaseConfig를 Firebase Console에서 복사한 내용으로 교체하세요!
const firebaseConfig = {
  apiKey: "AIzaSyCK0GPvjwmZp8FLgTunTesXizPpz_XbdEQ",
  authDomain: "playg-cs-2026.firebaseapp.com",
  projectId: "playg-cs-2026",
  storageBucket: "playg-cs-2026.firebasestorage.app",
  messagingSenderId: "820137572547",
  appId: "1:820137572547:web:0220db224d95239efa8a76",
  measurementId: "G-YR1FQPMJG"
};

// Firebase 사용 가능 여부 확인
let useFirebase = false;
let db = null;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    // Firebase 초기화
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    useFirebase = true;
    console.log('✅ Firebase 연결 완료!');
  } else {
    console.log('⚠️ Firebase 미설정 - LocalStorage 사용');
  }
} catch (error) {
  console.log('⚠️ Firebase 연결 실패 - LocalStorage 사용:', error.message);
  useFirebase = false;
}

// Firestore 데이터베이스 설정
// 한국 시간대 설정
const TIMEZONE_OFFSET = 9 * 60 * 60 * 1000; // UTC+9 (한국)

// 컬렉션 이름 정의
const COLLECTIONS = {
    DEFECTS: 'defects',
    IMPORTS: 'imports'
};

// LocalStorage API (Firebase 대체)
const LocalStorageAPI = {
    // ID 생성 헬퍼
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // ==================== 불량 데이터 관리 ====================
    
    // 모든 불량 데이터 조회
    async getDefects(params = {}) {
        try {
            console.log('📦 LocalStorage에서 불량 데이터 조회 중...');
            
            let data = JSON.parse(localStorage.getItem('defects') || '[]');
            
            // 정렬 (최신순)
            data.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
            
            // limit 적용
            if (params.limit) {
                data = data.slice(0, parseInt(params.limit));
            }
            
            console.log(`✅ 불량 데이터 ${data.length}개 조회 완료`);
            
            return {
                data: data,
                total: data.length,
                page: 1,
                limit: params.limit || 1000
            };
        } catch (error) {
            console.error('❌ LocalStorage 조회 오류:', error);
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
    },
    
    // 단일 불량 데이터 조회
    async getDefect(id) {
        try {
            const data = JSON.parse(localStorage.getItem('defects') || '[]');
            const item = data.find(d => d.id === id);
            
            if (!item) {
                throw new Error('데이터를 찾을 수 없습니다.');
            }
            
            return item;
        } catch (error) {
            console.error('❌ LocalStorage 조회 오류:', error);
            throw error;
        }
    },
    
    // 불량 데이터 생성
    async createDefect(defectData) {
        try {
            console.log('💾 LocalStorage에 불량 데이터 저장 중...');
            
            const data = JSON.parse(localStorage.getItem('defects') || '[]');
            
            // 생성 시간 추가
            const timestamp = Date.now();
            const newDefect = {
                id: this.generateId(),
                ...defectData,
                created_at: timestamp,
                updated_at: timestamp
            };
            
            data.push(newDefect);
            localStorage.setItem('defects', JSON.stringify(data));
            
            console.log(`✅ 불량 데이터 저장 완료 (ID: ${newDefect.id})`);
            
            return newDefect;
        } catch (error) {
            console.error('❌ LocalStorage 저장 오류:', error);
            throw new Error('데이터 저장에 실패했습니다.');
        }
    },
    
    // 불량 데이터 수정
    async updateDefect(id, updateData) {
        try {
            console.log(`📝 LocalStorage 불량 데이터 수정 중... (ID: ${id})`);
            
            const data = JSON.parse(localStorage.getItem('defects') || '[]');
            const index = data.findIndex(d => d.id === id);
            
            if (index === -1) {
                throw new Error('데이터를 찾을 수 없습니다.');
            }
            
            data[index] = {
                ...data[index],
                ...updateData,
                updated_at: Date.now()
            };
            
            localStorage.setItem('defects', JSON.stringify(data));
            
            console.log('✅ 불량 데이터 수정 완료');
            
            return data[index];
        } catch (error) {
            console.error('❌ LocalStorage 수정 오류:', error);
            throw new Error('데이터 수정에 실패했습니다.');
        }
    },
    
    // 불량 데이터 삭제
    async deleteDefect(id) {
        try {
            console.log(`🗑️ LocalStorage 불량 데이터 삭제 중... (ID: ${id})`);
            
            const data = JSON.parse(localStorage.getItem('defects') || '[]');
            const filtered = data.filter(d => d.id !== id);
            
            localStorage.setItem('defects', JSON.stringify(filtered));
            
            console.log('✅ 불량 데이터 삭제 완료');
            
            return true;
        } catch (error) {
            console.error('❌ LocalStorage 삭제 오류:', error);
            throw new Error('데이터 삭제에 실패했습니다.');
        }
    },
    
    // ==================== 수입 물량 관리 ====================
    
    // 모든 수입 물량 조회
    async getImports(page = 1, limit = 100) {
        try {
            console.log('📦 LocalStorage에서 수입 물량 조회 중...');
            
            let data = JSON.parse(localStorage.getItem('imports') || '[]');
            
            // 정렬 (수입일자 최신순)
            data.sort((a, b) => {
                const dateA = new Date(a.import_date || 0);
                const dateB = new Date(b.import_date || 0);
                return dateB - dateA;
            });
            
            // limit 적용
            const limited = data.slice(0, limit);
            
            console.log(`✅ 수입 물량 ${limited.length}개 조회 완료`);
            
            return {
                data: limited,
                total: data.length,
                page: page,
                limit: limit
            };
        } catch (error) {
            console.error('❌ LocalStorage 조회 오류:', error);
            throw new Error('수입 물량 데이터를 불러오는데 실패했습니다.');
        }
    },
    
    // 단일 수입 물량 조회
    async getImport(id) {
        try {
            const data = JSON.parse(localStorage.getItem('imports') || '[]');
            const item = data.find(d => d.id === id);
            
            if (!item) {
                throw new Error('데이터를 찾을 수 없습니다.');
            }
            
            return item;
        } catch (error) {
            console.error('❌ LocalStorage 조회 오류:', error);
            throw error;
        }
    },
    
    // LOT 번호로 수입 물량 조회
    async getImportByLot(lotNumber) {
        try {
            const data = JSON.parse(localStorage.getItem('imports') || '[]');
            const item = data.find(d => d.lot_number === lotNumber);
            
            return item || null;
        } catch (error) {
            console.error('❌ LocalStorage 조회 오류:', error);
            return null;
        }
    },
    
    // 수입 물량 생성
    async createImport(importData) {
        try {
            console.log('💾 LocalStorage에 수입 물량 저장 중...');
            
            const data = JSON.parse(localStorage.getItem('imports') || '[]');
            
            const timestamp = Date.now();
            const newImport = {
                id: this.generateId(),
                ...importData,
                created_at: timestamp,
                updated_at: timestamp
            };
            
            data.push(newImport);
            localStorage.setItem('imports', JSON.stringify(data));
            
            console.log(`✅ 수입 물량 저장 완료 (ID: ${newImport.id})`);
            
            return newImport;
        } catch (error) {
            console.error('❌ LocalStorage 저장 오류:', error);
            throw new Error('수입 물량 저장에 실패했습니다.');
        }
    },
    
    // 수입 물량 수정
    async updateImport(id, updateData) {
        try {
            console.log(`📝 LocalStorage 수입 물량 수정 중... (ID: ${id})`);
            
            const data = JSON.parse(localStorage.getItem('imports') || '[]');
            const index = data.findIndex(d => d.id === id);
            
            if (index === -1) {
                throw new Error('데이터를 찾을 수 없습니다.');
            }
            
            data[index] = {
                ...data[index],
                ...updateData,
                updated_at: Date.now()
            };
            
            localStorage.setItem('imports', JSON.stringify(data));
            
            console.log('✅ 수입 물량 수정 완료');
            
            return data[index];
        } catch (error) {
            console.error('❌ LocalStorage 수정 오류:', error);
            throw new Error('수입 물량 수정에 실패했습니다.');
        }
    },
    
    // 수입 물량 삭제
    async deleteImport(id) {
        try {
            console.log(`🗑️ LocalStorage 수입 물량 삭제 중... (ID: ${id})`);
            
            const data = JSON.parse(localStorage.getItem('imports') || '[]');
            const filtered = data.filter(d => d.id !== id);
            
            localStorage.setItem('imports', JSON.stringify(filtered));
            
            console.log('✅ 수입 물량 삭제 완료');
            
            return true;
        } catch (error) {
            console.error('❌ LocalStorage 삭제 오류:', error);
            throw new Error('수입 물량 삭제에 실패했습니다.');
        }
    }
};

// Firebase API 래퍼
const FirebaseAPI = {
    // ==================== 불량 데이터 관리 ====================
    
    // 모든 불량 데이터 조회
    async getDefects(params = {}) {
        try {
            console.log('📦 Firebase에서 불량 데이터 조회 중...');
            
            let query = db.collection(COLLECTIONS.DEFECTS);
            
            // 정렬 (최신순)
            query = query.orderBy('created_at', 'desc');
            
            // limit 적용
            if (params.limit) {
                query = query.limit(parseInt(params.limit));
            }
            
            const snapshot = await query.get();
            const data = [];
            
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ 불량 데이터 ${data.length}개 조회 완료`);
            
            return {
                data: data,
                total: data.length,
                page: 1,
                limit: params.limit || 1000
            };
        } catch (error) {
            console.error('❌ Firebase 조회 오류:', error);
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
    },
    
    // 단일 불량 데이터 조회
    async getDefect(id) {
        try {
            const doc = await db.collection(COLLECTIONS.DEFECTS).doc(id).get();
            
            if (!doc.exists) {
                throw new Error('데이터를 찾을 수 없습니다.');
            }
            
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('❌ Firebase 조회 오류:', error);
            throw error;
        }
    },
    
    // 불량 데이터 생성
    async createDefect(data) {
        try {
            console.log('💾 Firebase에 불량 데이터 저장 중...');
            
            // 생성 시간 추가
            const timestamp = Date.now();
            const defectData = {
                ...data,
                created_at: timestamp,
                updated_at: timestamp
            };
            
            const docRef = await db.collection(COLLECTIONS.DEFECTS).add(defectData);
            
            console.log(`✅ 불량 데이터 저장 완료 (ID: ${docRef.id})`);
            
            return {
                id: docRef.id,
                ...defectData
            };
        } catch (error) {
            console.error('❌ Firebase 저장 오류:', error);
            throw new Error('데이터 저장에 실패했습니다.');
        }
    },
    
    // 불량 데이터 수정
    async updateDefect(id, data) {
        try {
            console.log(`📝 Firebase 불량 데이터 수정 중... (ID: ${id})`);
            
            const updateData = {
                ...data,
                updated_at: Date.now()
            };
            
            await db.collection(COLLECTIONS.DEFECTS).doc(id).update(updateData);
            
            console.log('✅ 불량 데이터 수정 완료');
            
            return {
                id: id,
                ...updateData
            };
        } catch (error) {
            console.error('❌ Firebase 수정 오류:', error);
            throw new Error('데이터 수정에 실패했습니다.');
        }
    },
    
    // 불량 데이터 삭제
    async deleteDefect(id) {
        try {
            console.log(`🗑️ Firebase 불량 데이터 삭제 중... (ID: ${id})`);
            
            await db.collection(COLLECTIONS.DEFECTS).doc(id).delete();
            
            console.log('✅ 불량 데이터 삭제 완료');
            
            return true;
        } catch (error) {
            console.error('❌ Firebase 삭제 오류:', error);
            throw new Error('데이터 삭제에 실패했습니다.');
        }
    },
    
    // ==================== 수입 물량 관리 ====================
    
    // 모든 수입 물량 조회
    async getImports(page = 1, limit = 100) {
        try {
            console.log('📦 Firebase에서 수입 물량 조회 중...');
            
            const query = db.collection(COLLECTIONS.IMPORTS)
                .orderBy('import_date', 'desc')
                .limit(limit);
            
            const snapshot = await query.get();
            const data = [];
            
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ 수입 물량 ${data.length}개 조회 완료`);
            
            return {
                data: data,
                total: data.length,
                page: page,
                limit: limit
            };
        } catch (error) {
            console.error('❌ Firebase 조회 오류:', error);
            throw new Error('수입 물량 데이터를 불러오는데 실패했습니다.');
        }
    },
    
    // 단일 수입 물량 조회
    async getImport(id) {
        try {
            const doc = await db.collection(COLLECTIONS.IMPORTS).doc(id).get();
            
            if (!doc.exists) {
                throw new Error('데이터를 찾을 수 없습니다.');
            }
            
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('❌ Firebase 조회 오류:', error);
            throw error;
        }
    },
    
    // LOT 번호로 수입 물량 조회
    async getImportByLot(lotNumber) {
        try {
            const snapshot = await db.collection(COLLECTIONS.IMPORTS)
                .where('lot_number', '==', lotNumber)
                .limit(1)
                .get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('❌ Firebase 조회 오류:', error);
            return null;
        }
    },
    
    // 수입 물량 생성
    async createImport(data) {
        try {
            console.log('💾 Firebase에 수입 물량 저장 중...');
            
            const timestamp = Date.now();
            const importData = {
                ...data,
                created_at: timestamp,
                updated_at: timestamp
            };
            
            const docRef = await db.collection(COLLECTIONS.IMPORTS).add(importData);
            
            console.log(`✅ 수입 물량 저장 완료 (ID: ${docRef.id})`);
            
            return {
                id: docRef.id,
                ...importData
            };
        } catch (error) {
            console.error('❌ Firebase 저장 오류:', error);
            throw new Error('수입 물량 저장에 실패했습니다.');
        }
    },
    
    // 수입 물량 수정
    async updateImport(id, data) {
        try {
            console.log(`📝 Firebase 수입 물량 수정 중... (ID: ${id})`);
            
            const updateData = {
                ...data,
                updated_at: Date.now()
            };
            
            await db.collection(COLLECTIONS.IMPORTS).doc(id).update(updateData);
            
            console.log('✅ 수입 물량 수정 완료');
            
            return {
                id: id,
                ...updateData
            };
        } catch (error) {
            console.error('❌ Firebase 수정 오류:', error);
            throw new Error('수입 물량 수정에 실패했습니다.');
        }
    },
    
    // 수입 물량 삭제
    async deleteImport(id) {
        try {
            console.log(`🗑️ Firebase 수입 물량 삭제 중... (ID: ${id})`);
            
            await db.collection(COLLECTIONS.IMPORTS).doc(id).delete();
            
            console.log('✅ 수입 물량 삭제 완료');
            
            return true;
        } catch (error) {
            console.error('❌ Firebase 삭제 오류:', error);
            throw new Error('수입 물량 삭제에 실패했습니다.');
        }
    }
};

// 기존 API를 FirebaseAPI 또는 LocalStorageAPI로 교체
if (useFirebase) {
    window.API = FirebaseAPI;
    console.log('🔥 Firebase API 준비 완료!');
} else {
    window.API = LocalStorageAPI;
    console.log('💾 LocalStorage API 준비 완료!');
}
