// Register Defect Page
const DefectRegister = {
    photos: [],
    videos: [],
    editMode: false,
    editId: null,
    productNames: [], // 제품명 리스트 저장
    availableLots: [], // 수입 물량에 등록된 LOT 목록

    async loadProductNames() {
        console.log('📦 제품명 목록 로딩 중...');
        try {
            const response = await API.getDefects(1, 1000); // 최대 1000개
            const uniqueNames = [...new Set(response.data.map(d => d.product_name).filter(Boolean))];
            this.productNames = uniqueNames.sort();
            console.log(`✅ ${this.productNames.length}개의 고유 제품명 로드 완료:`, this.productNames);
        } catch (error) {
            console.error('❌ 제품명 로딩 실패:', error);
            this.productNames = [];
        }
    },

    async loadAvailableLots() {
        console.log('📦 수입 물량 LOT 목록 로딩 중...');
        try {
            const response = await API.getImports(1, 1000);
            this.availableLots = response.data || [];
            console.log(`✅ ${this.availableLots.length}개의 LOT 로드 완료`);
        } catch (error) {
            console.error('❌ LOT 목록 로딩 실패:', error);
            this.availableLots = [];
        }
    },

    async render(defectId = null) {
        this.photos = [];
        this.videos = [];
        this.editMode = false;
        this.editId = null;

        // Load product names and LOT list for autocomplete
        await this.loadProductNames();
        await this.loadAvailableLots();

        let defectData = null;
        if (defectId) {
            this.editMode = true;
            this.editId = defectId;
            try {
                defectData = await API.getDefect(defectId);
                this.photos = defectData.photos || [];
                this.videos = defectData.videos || [];
            } catch (error) {
                showAlert('불량 정보를 불러오는데 실패했습니다.', 'danger');
                return;
            }
        }

        const html = `
            <div class="page active" id="registerPage">
                <div class="page-header">
                    <h1 class="page-title">${this.editMode ? '불량 수정' : '불량 등록'}</h1>
                    <p class="page-description">${this.editMode ? '불량 정보를 수정합니다.' : '새로운 불량 제품을 등록합니다.'}</p>
                </div>

                <div class="card">
                    <form id="defectForm">
                        <!-- Basic Info -->
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">LOT 번호</label>
                                <div class="autocomplete-wrapper">
                                    <input type="text" class="form-input" id="lotNumber" required 
                                        title="LOT 번호를 입력하거나 선택하세요"
                                        placeholder="🔍 수입 물량에서 LOT를 선택하세요"
                                        value="${defectData?.lot_number || ''}"
                                        autocomplete="off">
                                    <div class="autocomplete-dropdown" id="lotNumberDropdown"></div>
                                </div>
                                <small style="color: var(--primary-color); font-size: 0.85rem; display: block; margin-top: 5px;">
                                    <i class="fas fa-lightbulb"></i> LOT를 선택하면 수입일자, 제품명, 시즌, 모델명이 자동으로 입력됩니다
                                </small>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">수입일자</label>
                                <input type="date" class="form-input" id="importDate" required 
                                    title="수입일자를 선택하세요"
                                    value="${defectData?.import_date || formatDate(new Date())}"
                                    readonly style="background-color: #f8f9fa;">
                                <small style="color: var(--text-secondary); font-size: 0.85rem; display: block; margin-top: 5px;">
                                    <i class="fas fa-info-circle"></i> LOT 선택 시 자동 입력
                                </small>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">불량제품 접수일자</label>
                                <input type="date" class="form-input" id="receivedDate" required 
                                    title="불량제품 접수일자를 선택하세요"
                                    value="${defectData?.received_date || formatDate(new Date())}">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group form-group-full">
                                <label class="form-label required">제품명</label>
                                <input type="text" class="form-input" id="productName" required 
                                    title="제품명"
                                    placeholder="LOT 선택 시 자동 입력됩니다"
                                    value="${defectData?.product_name || ''}"
                                    readonly style="background-color: #f8f9fa;">
                                <small style="color: var(--text-secondary); font-size: 0.85rem; display: block; margin-top: 5px;">
                                    <i class="fas fa-info-circle"></i> LOT 선택 시 자동 입력
                                </small>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">시즌 / 버전</label>
                                <input type="text" class="form-input" id="season" 
                                    placeholder="LOT 선택 시 자동 입력"
                                    value="${defectData?.season || ''}"
                                    readonly style="background-color: #f8f9fa;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">모델명</label>
                                <input type="text" class="form-input" id="modelName" 
                                    placeholder="LOT 선택 시 자동 입력"
                                    value="${defectData?.model_name || ''}"
                                    readonly style="background-color: #f8f9fa;">
                            </div>
                        </div>

                        <!-- LOT 수입 정보 표시 영역 -->
                        <div id="lotInfoContainer" style="display: none; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                                <div>
                                    <i class="fas fa-box" style="color: var(--primary-color);"></i>
                                    <strong style="margin-left: 5px;">수입 수량:</strong>
                                    <span id="lotImportQuantity" style="color: var(--primary-color); font-size: 1.1em; font-weight: 600; margin-left: 5px;">-</span>
                                </div>
                                <div>
                                    <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
                                    <strong style="margin-left: 5px;">현재 불량 수량:</strong>
                                    <span id="lotDefectQuantity" style="color: #dc3545; font-size: 1.1em; font-weight: 600; margin-left: 5px;">-</span>
                                </div>
                                <div>
                                    <i class="fas fa-chart-pie" style="color: #ffc107;"></i>
                                    <strong style="margin-left: 5px;">불량률:</strong>
                                    <span id="lotDefectRate" style="color: #ffc107; font-size: 1.1em; font-weight: 600; margin-left: 5px;">-</span>
                                </div>
                            </div>
                        </div>

                        <!-- Defect Info -->
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">불량 유형</label>
                                <select class="form-select" id="defectType" required
                                    title="불량 유형을 선택하세요">
                                    <option value="">선택하세요</option>
                                    ${DEFECT_TYPES.map(type => `
                                        <option value="${type}" ${defectData?.defect_type === type ? 'selected' : ''}>
                                            ${type}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">불량 수량</label>
                                <input type="number" class="form-input" id="defectQuantity" required 
                                    title="불량 수량을 입력하세요"
                                    min="1" placeholder="1"
                                    value="${defectData?.defect_quantity || ''}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">불량 상세 내용</label>
                            <textarea class="form-textarea" id="defectDetail" 
                                placeholder="불량 증상을 자세히 설명해주세요...">${defectData?.defect_detail || ''}</textarea>
                        </div>

                        <!-- Additional Info -->
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">등록자명</label>
                                <input type="text" class="form-input" id="registrant" 
                                    placeholder="홍길동"
                                    value="${defectData?.registrant || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">검사 위치</label>
                                <input type="text" class="form-input" id="inspectionLocation" 
                                    placeholder="제1검사대"
                                    value="${defectData?.inspection_location || ''}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">비고</label>
                            <textarea class="form-textarea" id="note" 
                                placeholder="추가 메모사항...">${defectData?.note || ''}</textarea>
                        </div>

                        <!-- Photo Upload -->
                        <div class="form-group">
                            <label class="form-label">사진 첨부</label>
                            <div class="file-upload-area" id="photoUploadArea">
                                <i class="fas fa-camera"></i>
                                <div class="file-upload-text">사진을 선택하거나 드래그하세요</div>
                                <div class="file-upload-hint">여러 장 업로드 가능 (5MB 이하, 자동 리사이징)</div>
                            </div>
                            <input type="file" class="file-input" id="photoInput" 
                                accept="image/*" multiple>
                            <div class="file-preview-grid" id="photoPreview"></div>
                        </div>

                        <!-- Video Upload -->
                        <div class="form-group">
                            <label class="form-label">동영상 첨부</label>
                            <div class="file-upload-area" id="videoUploadArea">
                                <i class="fas fa-video"></i>
                                <div class="file-upload-text">동영상을 선택하거나 드래그하세요</div>
                                <div class="file-upload-hint">여러 개 업로드 가능 (10MB 이하 권장)</div>
                            </div>
                            <input type="file" class="file-input" id="videoInput" 
                                accept="video/*" multiple>
                            <div class="file-preview-grid" id="videoPreview"></div>
                        </div>

                        <!-- Buttons -->
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                ${this.editMode ? '수정하기' : '등록하기'}
                            </button>
                            <button type="button" class="btn btn-secondary" id="resetBtn">
                                <i class="fas fa-redo"></i>
                                초기화
                            </button>
                            ${this.editMode ? `
                                <button type="button" class="btn btn-danger" id="deleteBtn">
                                    <i class="fas fa-trash"></i>
                                    삭제하기
                                </button>
                            ` : ''}
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;
        this.attachEventListeners();
        this.renderPreviews();
    },

    attachEventListeners() {
        console.log('🔧 이벤트 리스너 연결 시작');
        
        // 커스텀 검증 메시지 설정
        this.setupCustomValidation();

        // Photo upload
        const photoInput = document.getElementById('photoInput');
        const photoUploadArea = document.getElementById('photoUploadArea');
        
        if (photoInput && photoUploadArea) {
            console.log('✅ 사진 업로드 요소 발견');
            photoUploadArea.addEventListener('click', () => {
                console.log('📷 사진 업로드 영역 클릭');
                photoInput.click();
            });
            photoInput.addEventListener('change', (e) => {
                console.log('📷 사진 파일 선택됨');
                this.handlePhotoUpload(e);
            });
        } else {
            console.error('❌ 사진 업로드 요소를 찾을 수 없음');
        }

        // Video upload
        const videoInput = document.getElementById('videoInput');
        const videoUploadArea = document.getElementById('videoUploadArea');
        
        if (videoInput && videoUploadArea) {
            console.log('✅ 동영상 업로드 요소 발견');
            videoUploadArea.addEventListener('click', () => {
                console.log('🎥 동영상 업로드 영역 클릭');
                videoInput.click();
            });
            videoInput.addEventListener('change', (e) => {
                console.log('🎥 동영상 파일 선택됨');
                this.handleVideoUpload(e);
            });
        } else {
            console.error('❌ 동영상 업로드 요소를 찾을 수 없음');
        }

        // Form submit
        const defectForm = document.getElementById('defectForm');
        if (defectForm) {
            console.log('✅ 폼 요소 발견');
            defectForm.addEventListener('submit', (e) => {
                console.log('📝 폼 제출 이벤트 발생');
                e.preventDefault();
                console.log('✅ preventDefault 실행됨');
                this.handleSubmit();
            });
        } else {
            console.error('❌ 폼 요소를 찾을 수 없음');
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            console.log('✅ 초기화 버튼 발견');
            resetBtn.addEventListener('click', () => {
                console.log('🔄 초기화 버튼 클릭');
                if (confirmDialog('입력한 내용을 모두 초기화하시겠습니까?')) {
                    this.render(this.editId);
                }
            });
        }

        // Delete button (edit mode)
        if (this.editMode) {
            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn) {
                console.log('✅ 삭제 버튼 발견');
                deleteBtn.addEventListener('click', () => {
                    console.log('🗑️ 삭제 버튼 클릭');
                    this.handleDelete();
                });
            }
        }

        // LOT number autocomplete
        const lotNumberInput = document.getElementById('lotNumber');
        const lotNumberDropdown = document.getElementById('lotNumberDropdown');
        
        if (lotNumberInput && lotNumberDropdown) {
            console.log('✅ LOT 번호 자동완성 요소 발견');
            
            // Input event - show matching LOTs
            lotNumberInput.addEventListener('input', (e) => {
                const value = e.target.value.toLowerCase().trim();
                
                if (value.length === 0) {
                    lotNumberDropdown.classList.remove('show');
                    return;
                }
                
                const matches = this.availableLots.filter(lot => 
                    lot.lot_number.toLowerCase().includes(value)
                );
                
                if (matches.length > 0) {
                    lotNumberDropdown.innerHTML = matches.map(lot => `
                        <div class="autocomplete-item" data-lot-number="${lot.lot_number}">
                            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                <div>
                                    <strong>${lot.lot_number}</strong>
                                    <div style="font-size: 0.85em; color: var(--text-secondary);">
                                        ${lot.product_name} | 수입: ${lot.import_quantity}개
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    
                    lotNumberDropdown.classList.add('show');
                    
                    // Attach click listeners
                    lotNumberDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                        item.addEventListener('click', async () => {
                            const lotNumber = item.dataset.lotNumber;
                            lotNumberInput.value = lotNumber;
                            lotNumberDropdown.classList.remove('show');
                            console.log('✅ LOT 선택:', lotNumber);
                            
                            // 자동으로 수입 정보 조회
                            await this.fetchLotImportInfo(lotNumber);
                        });
                    });
                } else {
                    lotNumberDropdown.classList.remove('show');
                }
            });
            
            // Focus event - show all available LOTs
            lotNumberInput.addEventListener('focus', () => {
                if (this.availableLots.length > 0 && lotNumberInput.value.trim().length === 0) {
                    lotNumberDropdown.innerHTML = this.availableLots.map(lot => `
                        <div class="autocomplete-item" data-lot-number="${lot.lot_number}">
                            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                <div>
                                    <strong>${lot.lot_number}</strong>
                                    <div style="font-size: 0.85em; color: var(--text-secondary);">
                                        ${lot.product_name} | 수입: ${lot.import_quantity}개
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    
                    lotNumberDropdown.classList.add('show');
                    
                    // Attach click listeners
                    lotNumberDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                        item.addEventListener('click', async () => {
                            const lotNumber = item.dataset.lotNumber;
                            lotNumberInput.value = lotNumber;
                            lotNumberDropdown.classList.remove('show');
                            console.log('✅ LOT 선택:', lotNumber);
                            
                            // 자동으로 수입 정보 조회
                            await this.fetchLotImportInfo(lotNumber);
                        });
                    });
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!lotNumberInput.contains(e.target) && !lotNumberDropdown.contains(e.target)) {
                    lotNumberDropdown.classList.remove('show');
                }
            });
            
            // Blur event - 포커스를 잃었을 때 수입 정보 자동 조회
            lotNumberInput.addEventListener('blur', async () => {
                // 약간의 지연 후 드롭다운 닫기 (클릭 이벤트가 먼저 처리되도록)
                setTimeout(() => {
                    lotNumberDropdown.classList.remove('show');
                }, 200);
                
                const lotNumber = lotNumberInput.value.trim();
                if (lotNumber) {
                    await this.fetchLotImportInfo(lotNumber);
                }
            });
            
            // Enter 키로 조회
            lotNumberInput.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    lotNumberDropdown.classList.remove('show');
                    const lotNumber = lotNumberInput.value.trim();
                    if (lotNumber) {
                        await this.fetchLotImportInfo(lotNumber);
                    }
                }
            });
        }
        
        console.log('✅ 모든 이벤트 리스너 연결 완료');
    },

    setupCustomValidation() {
        // 필수 입력 필드에 커스텀 메시지 설정
        const fields = [
            { id: 'importDate', message: '수입일자를 선택하세요' },
            { id: 'receivedDate', message: '불량제품 접수일자를 선택하세요' },
            { id: 'productName', message: '제품명을 입력하세요' },
            { id: 'lotNumber', message: 'LOT 번호를 입력하세요' },
            { id: 'defectType', message: '불량 유형을 선택하세요' },
            { id: 'defectQuantity', message: '불량 수량을 입력하세요 (1 이상)' }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.addEventListener('invalid', (e) => {
                    e.preventDefault();
                    element.setCustomValidity(field.message);
                    // 포커스 설정
                    setTimeout(() => element.focus(), 0);
                });
                
                element.addEventListener('input', () => {
                    element.setCustomValidity('');
                });
                
                element.addEventListener('change', () => {
                    element.setCustomValidity('');
                });
            }
        });
    },

    async handlePhotoUpload(e) {
        console.log('📸 handlePhotoUpload 호출됨');
        const files = Array.from(e.target.files);
        console.log(`선택된 파일 개수: ${files.length}`);
        
        if (files.length === 0) {
            console.log('파일이 선택되지 않음');
            return;
        }
        
        for (const file of files) {
            console.log(`처리 중인 파일: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            
            try {
                // 파일 크기 체크 (5MB 제한)
                if (file.size > 5 * 1024 * 1024) {
                    showAlert(`${file.name}은(는) 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.`, 'danger');
                    continue;
                }
                
                // 이미지 타입 체크
                if (!file.type.startsWith('image/')) {
                    showAlert(`이미지 파일만 업로드 가능합니다: ${file.name}`, 'danger');
                    continue;
                }
                
                // 이미지 리사이징
                const resized = await this.resizeImage(file, 1200, 1200);
                this.photos.push(resized);
                console.log(`✅ 사진 업로드 완료: ${file.name}`);
                
            } catch (error) {
                console.error('❌ Photo upload error:', error);
                showAlert(`사진 업로드 중 오류가 발생했습니다: ${file.name}`, 'danger');
            }
        }
        
        console.log(`총 업로드된 사진 개수: ${this.photos.length}`);
        this.renderPreviews();
        // 파일 입력 초기화
        e.target.value = '';
    },

    async handleVideoUpload(e) {
        const files = Array.from(e.target.files);
        
        for (const file of files) {
            try {
                // 동영상 크기 체크 (10MB 제한)
                if (file.size > 10 * 1024 * 1024) {
                    showAlert(`${file.name}은(는) 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.`, 'danger');
                    continue;
                }
                
                const base64 = await fileToBase64(file);
                this.videos.push(base64);
                
            } catch (error) {
                console.error('Video upload error:', error);
                showAlert(`동영상 업로드 중 오류가 발생했습니다: ${file.name}`, 'danger');
            }
        }
        this.renderPreviews();
        // 파일 입력 초기화
        e.target.value = '';
    },

    // 이미지 리사이징 함수
    async resizeImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // 비율 유지하며 리사이징
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // JPEG로 변환 (품질 0.8)
                    const resized = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(resized);
                };
                
                img.onerror = reject;
            };
            
            reader.onerror = reject;
        });
    },

    /**
     * LOT 번호로 수입 물량 정보 조회 및 폼 자동 입력
     */
    async fetchLotImportInfo(lotNumber) {
        console.log('📦 LOT 수입 정보 조회 중:', lotNumber);
        
        const lotInfoContainer = document.getElementById('lotInfoContainer');
        const lotImportQuantity = document.getElementById('lotImportQuantity');
        const lotDefectQuantity = document.getElementById('lotDefectQuantity');
        const lotDefectRate = document.getElementById('lotDefectRate');

        // 폼 필드 요소들
        const importDateInput = document.getElementById('importDate');
        const productNameInput = document.getElementById('productName');
        const seasonInput = document.getElementById('season');
        const modelNameInput = document.getElementById('modelName');

        try {
            // 1. 수입 물량 테이블에서 LOT 조회
            const importData = await API.getImportByLot(lotNumber);
            
            if (!importData) {
                // 수입 물량이 등록되지 않은 경우
                lotInfoContainer.style.display = 'block';
                lotImportQuantity.textContent = '등록되지 않음';
                lotImportQuantity.style.color = '#dc3545';
                lotDefectQuantity.textContent = '-';
                lotDefectRate.textContent = '-';
                
                // 폼 필드 초기화
                if (importDateInput) importDateInput.value = formatDate(new Date());
                if (productNameInput) productNameInput.value = '';
                if (seasonInput) seasonInput.value = '';
                if (modelNameInput) modelNameInput.value = '';
                
                showAlert('해당 LOT의 수입 물량이 등록되지 않았습니다. 먼저 "수입 물량 관리"에서 LOT를 등록해주세요.', 'warning');
                return;
            }

            // 2. 폼 필드 자동 입력 ⭐ 핵심 기능!
            if (importDateInput) {
                importDateInput.value = importData.import_date || formatDate(new Date());
                console.log('✅ 수입일자 자동 입력:', importData.import_date);
            }
            
            if (productNameInput) {
                productNameInput.value = importData.product_name || '';
                console.log('✅ 제품명 자동 입력:', importData.product_name);
            }
            
            if (seasonInput) {
                seasonInput.value = importData.season || '';
                console.log('✅ 시즌 자동 입력:', importData.season);
            }
            
            if (modelNameInput) {
                modelNameInput.value = importData.model_name || '';
                console.log('✅ 모델명 자동 입력:', importData.model_name);
            }

            // 3. 현재 LOT의 불량 데이터 조회
            const defectsResponse = await API.getDefects(1, 1000);
            const lotDefects = defectsResponse.data.filter(d => d.lot_number === lotNumber);
            const totalDefectQty = lotDefects.reduce((sum, d) => sum + (d.defect_quantity || 0), 0);
            
            // 4. 불량률 계산
            const defectRate = importData.import_quantity > 0
                ? ((totalDefectQty / importData.import_quantity) * 100).toFixed(1)
                : '0.0';

            // 5. 정보 표시
            lotInfoContainer.style.display = 'block';
            lotImportQuantity.textContent = `${importData.import_quantity.toLocaleString()}개`;
            lotImportQuantity.style.color = 'var(--primary-color)';
            lotDefectQuantity.textContent = `${totalDefectQty.toLocaleString()}개`;
            lotDefectRate.textContent = `${defectRate}%`;

            // 불량률에 따른 색상 설정
            const rate = parseFloat(defectRate);
            if (rate > 15) {
                lotDefectRate.style.color = '#dc3545'; // 빨강
            } else if (rate > 5) {
                lotDefectRate.style.color = '#ffc107'; // 노랑
            } else {
                lotDefectRate.style.color = '#28a745'; // 초록
            }

            // 성공 메시지
            showAlert(`✅ LOT 정보가 자동으로 입력되었습니다! (${importData.product_name})`, 'success');

            console.log('✅ LOT 수입 정보 조회 및 폼 자동 입력 완료:', {
                lotNumber,
                importDate: importData.import_date,
                productName: importData.product_name,
                season: importData.season,
                modelName: importData.model_name,
                importQuantity: importData.import_quantity,
                defectQuantity: totalDefectQty,
                defectRate
            });

        } catch (error) {
            console.error('❌ LOT 수입 정보 조회 실패:', error);
            lotInfoContainer.style.display = 'none';
            showAlert('LOT 수입 정보를 조회하는데 실패했습니다.', 'danger');
        }
    },

    renderPreviews() {
        // Photo previews
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = this.photos.map((photo, index) => `
            <div class="file-preview-item">
                <img src="${photo}" alt="Preview">
                <button type="button" class="file-preview-remove" data-type="photo" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Video previews
        const videoPreview = document.getElementById('videoPreview');
        videoPreview.innerHTML = this.videos.map((video, index) => `
            <div class="file-preview-item">
                <video src="${video}" controls></video>
                <button type="button" class="file-preview-remove" data-type="video" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Attach remove listeners
        document.querySelectorAll('.file-preview-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const index = parseInt(btn.dataset.index);
                if (type === 'photo') {
                    this.photos.splice(index, 1);
                } else {
                    this.videos.splice(index, 1);
                }
                this.renderPreviews();
            });
        });
    },

    async handleSubmit() {
        console.log('🚀 handleSubmit 시작');
        
        // 버튼 비활성화 및 로딩 표시
        const submitBtn = document.querySelector('button[type="submit"]');
        if (!submitBtn) {
            console.error('❌ Submit 버튼을 찾을 수 없음');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 등록 중...';
        console.log('✅ 버튼 비활성화 완료');

        const data = {
            import_date: document.getElementById('importDate').value,
            received_date: document.getElementById('receivedDate').value,
            product_name: document.getElementById('productName').value,
            season: document.getElementById('season').value,
            model_name: document.getElementById('modelName').value,
            lot_number: document.getElementById('lotNumber').value,
            defect_type: document.getElementById('defectType').value,
            defect_detail: document.getElementById('defectDetail').value,
            defect_quantity: parseInt(document.getElementById('defectQuantity').value),
            registrant: document.getElementById('registrant').value,
            inspection_location: document.getElementById('inspectionLocation').value,
            note: document.getElementById('note').value,
            photos: this.photos,
            videos: this.videos
        };

        console.log('📦 수집된 데이터:', {
            ...data,
            photos: `${data.photos.length}개`,
            videos: `${data.videos.length}개`
        });

        try {
            console.log(`📡 API 호출 시작 (editMode: ${this.editMode})`);
            
            if (this.editMode) {
                await API.updateDefect(this.editId, data);
                console.log('✅ 수정 완료');
                showAlert('불량 정보가 수정되었습니다.', 'success');
            } else {
                const result = await API.createDefect(data);
                console.log('✅ 등록 완료:', result);
                showAlert('불량 정보가 등록되었습니다.', 'success');
            }
            
            // Redirect to list with reload
            console.log('🔄 목록 페이지로 이동 중...');
            setTimeout(() => {
                window.location.hash = 'list';
                // 목록 페이지 강제 새로고침
                setTimeout(() => {
                    if (window.DefectList) {
                        window.DefectList.render();
                    }
                }, 100);
            }, 1500);
        } catch (error) {
            console.error('❌ Submit error:', error);
            showAlert(error.message || '등록 중 오류가 발생했습니다.', 'danger');
            
            // 버튼 복원
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    },

    async handleDelete() {
        if (!confirmDialog('이 불량 정보를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await API.deleteDefect(this.editId);
            showAlert('불량 정보가 삭제되었습니다.', 'success');
            setTimeout(() => {
                window.location.hash = 'list';
            }, 1000);
        } catch (error) {
            console.error('Delete error:', error);
            showAlert(error.message, 'danger');
        }
    }
};
