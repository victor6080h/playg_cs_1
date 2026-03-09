// Sample Data Initialization
function initializeSampleData() {
    // LocalStorage에 데이터가 없으면 샘플 데이터 추가
    const existingDefects = localStorage.getItem('defects');
    const existingImports = localStorage.getItem('imports');
    
    if (!existingDefects || JSON.parse(existingDefects).length === 0) {
        console.log('📦 샘플 데이터 초기화 중...');
        
        // 샘플 수입 물량 데이터
        const sampleImports = [
            {
                id: 'imp_001',
                import_date: '2026-02-15',
                product_name: '프린세스 캐치! 티니핑 카메라 하츄핑',
                season: '시즌6',
                model_name: 'HC-100',
                lot_number: 'LOT-2026-001',
                import_quantity: 150,
                registrant: '홍길동',
                note: '정상 수입',
                created_at: new Date('2026-02-15').getTime(),
                updated_at: new Date('2026-02-15').getTime()
            },
            {
                id: 'imp_002',
                import_date: '2026-02-16',
                product_name: '프린세스 캐치! 티니핑 카메라 라라핑',
                season: '시즌6',
                model_name: 'LC-100',
                lot_number: 'LOT-2026-002',
                import_quantity: 80,
                registrant: '김철수',
                note: '',
                created_at: new Date('2026-02-16').getTime(),
                updated_at: new Date('2026-02-16').getTime()
            },
            {
                id: 'imp_003',
                import_date: '2026-02-20',
                product_name: '프린세스 캐치! 티니핑 카메라 차차핑',
                season: '시즌6',
                model_name: 'CC-100',
                lot_number: 'LOT-2026-003',
                import_quantity: 120,
                registrant: '이영희',
                note: '',
                created_at: new Date('2026-02-20').getTime(),
                updated_at: new Date('2026-02-20').getTime()
            }
        ];
        
        // 샘플 불량 데이터
        const sampleDefects = [
            {
                id: 'def_001',
                import_date: '2026-02-15',
                received_date: '2026-02-18',
                product_name: '프린세스 캐치! 티니핑 카메라 하츄핑',
                season: '시즌6',
                model_name: 'HC-100',
                lot_number: 'LOT-2026-001',
                import_quantity: 150,
                defect_type: '전원 불량',
                defect_detail: '전원 버튼 눌러도 켜지지 않음',
                defect_quantity: 5,
                registrant: '홍길동',
                inspection_location: '1차 검수대',
                note: '배터리 접촉 불량 의심',
                photos: [],
                videos: [],
                created_at: new Date('2026-02-18').getTime(),
                updated_at: new Date('2026-02-18').getTime()
            },
            {
                id: 'def_002',
                import_date: '2026-02-15',
                received_date: '2026-02-20',
                product_name: '프린세스 캐치! 티니핑 카메라 하츄핑',
                season: '시즌6',
                model_name: 'HC-100',
                lot_number: 'LOT-2026-001',
                import_quantity: 150,
                defect_type: '액정 멈춤',
                defect_detail: '화면이 멈춰서 작동하지 않음',
                defect_quantity: 7,
                registrant: '김철수',
                inspection_location: '2차 검수대',
                note: '펌웨어 문제 가능성',
                photos: [],
                videos: [],
                created_at: new Date('2026-02-20').getTime(),
                updated_at: new Date('2026-02-20').getTime()
            },
            {
                id: 'def_003',
                import_date: '2026-02-16',
                received_date: '2026-02-19',
                product_name: '프린세스 캐치! 티니핑 카메라 라라핑',
                season: '시즌6',
                model_name: 'LC-100',
                lot_number: 'LOT-2026-002',
                import_quantity: 80,
                defect_type: '버튼 불량',
                defect_detail: '셔터 버튼 눌러도 반응 없음',
                defect_quantity: 3,
                registrant: '이영희',
                inspection_location: '1차 검수대',
                note: '버튼 스위치 불량',
                photos: [],
                videos: [],
                created_at: new Date('2026-02-19').getTime(),
                updated_at: new Date('2026-02-19').getTime()
            },
            {
                id: 'def_004',
                import_date: '2026-02-20',
                received_date: '2026-02-25',
                product_name: '프린세스 캐치! 티니핑 카메라 차차핑',
                season: '시즌6',
                model_name: 'CC-100',
                lot_number: 'LOT-2026-003',
                import_quantity: 120,
                defect_type: '외관 불량',
                defect_detail: '피규어 도색 불량',
                defect_quantity: 10,
                registrant: '박민수',
                inspection_location: '외관 검수대',
                note: '도색 얼룩 다수',
                photos: [],
                videos: [],
                created_at: new Date('2026-02-25').getTime(),
                updated_at: new Date('2026-02-25').getTime()
            },
            {
                id: 'def_005',
                import_date: '2026-02-20',
                received_date: '2026-03-01',
                product_name: '프린세스 캐치! 티니핑 카메라 차차핑',
                season: '시즌6',
                model_name: 'CC-100',
                lot_number: 'LOT-2026-003',
                import_quantity: 120,
                defect_type: '촬영 불량',
                defect_detail: '사진이 저장되지 않음',
                defect_quantity: 5,
                registrant: '최지현',
                inspection_location: '기능 검수대',
                note: 'SD카드 인식 문제',
                photos: [],
                videos: [],
                created_at: new Date('2026-03-01').getTime(),
                updated_at: new Date('2026-03-01').getTime()
            }
        ];
        
        localStorage.setItem('imports', JSON.stringify(sampleImports));
        localStorage.setItem('defects', JSON.stringify(sampleDefects));
        
        console.log('✅ 샘플 데이터 초기화 완료!');
        console.log(`   - 수입 물량: ${sampleImports.length}개`);
        console.log(`   - 불량 데이터: ${sampleDefects.length}개`);
    }
}

// 페이지 로드 시 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSampleData);
} else {
    initializeSampleData();
}
