/**
 * 수입 물량 관리 페이지
 * - 수입 물량 등록/수정/삭제
 * - 제품별 수입 물량 조회
 * - LOT별 수입 수량 관리
 */

const ImportManagement = {
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    filters: {
        startDate: '',
        endDate: '',
        productName: '',
        lotNumber: ''
    },

    /**
     * 페이지 렌더링
     */
    async render() {
        console.log('📦 수입 물량 관리 페이지 렌더링...');
        
        try {
            // 수입 물량 데이터 로드
            const imports = await this.loadImports();
            
            const html = `
                <div class="page active" id="importsPage">
                    <div class="page-header">
                        <h1 class="page-title">수입 물량 관리</h1>
                        <p class="page-description">제품별 수입 물량을 등록하고 관리합니다</p>
                    </div>

                    <!-- 필터 영역 -->
                    <div class="filter-section">
                        <div class="filter-row">
                            <div class="filter-group">
                                <label class="filter-label">수입일자</label>
                                <div class="filter-date-range">
                                    <input type="date" id="filterStartDate" class="form-input" value="${this.filters.startDate}">
                                    <span class="filter-date-separator">~</span>
                                    <input type="date" id="filterEndDate" class="form-input" value="${this.filters.endDate}">
                                </div>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">제품명</label>
                                <input type="text" id="filterProductName" class="form-input" placeholder="제품명 검색" value="${this.filters.productName}">
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">LOT 번호</label>
                                <input type="text" id="filterLotNumber" class="form-input" placeholder="LOT 번호 검색" value="${this.filters.lotNumber}">
                            </div>
                            <div class="filter-actions">
                                <button class="btn btn-secondary" id="searchBtn">
                                    <i class="fas fa-search"></i> 검색
                                </button>
                                <button class="btn btn-outline" id="resetFilterBtn">
                                    <i class="fas fa-redo"></i> 초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 액션 버튼 영역 -->
                    <div class="list-actions">
                        <button class="btn btn-primary" id="addImportBtn">
                            <i class="fas fa-plus"></i> 수입 물량 등록
                        </button>
                        <button class="btn btn-success" id="exportExcelBtn">
                            <i class="fas fa-file-excel"></i> Excel 다운로드
                        </button>
                    </div>

                    <!-- 수입 물량 목록 테이블 -->
                    <div class="table-container" style="overflow-x: auto;">
                        <table class="defect-table" style="min-width: 1200px;">
                            <thead>
                                <tr>
                                    <th style="min-width: 100px;">수입일자</th>
                                    <th style="min-width: 150px;">제품명</th>
                                    <th style="min-width: 100px;">시즌/버전</th>
                                    <th style="min-width: 100px;">모델명</th>
                                    <th style="min-width: 130px;">LOT 번호</th>
                                    <th style="min-width: 100px; text-align: right;">수입 수량</th>
                                    <th style="min-width: 100px; text-align: right;">불량 수량</th>
                                    <th style="min-width: 100px; text-align: center;">불량률(%)</th>
                                    <th style="min-width: 80px;">등록자</th>
                                    <th style="min-width: 100px; text-align: center;">관리</th>
                                </tr>
                            </thead>
                            <tbody id="importsTableBody">
                                ${this.renderTableRows(imports)}
                            </tbody>
                        </table>
                    </div>

                    <!-- 페이지네이션 -->
                    <div class="pagination" id="pagination">
                        ${this.renderPagination()}
                    </div>
                </div>
            `;

            document.getElementById('mainContent').innerHTML = html;

            // 이벤트 리스너 설정
            this.attachEventListeners();

            console.log('✅ 수입 물량 관리 페이지 렌더링 완료');
        } catch (error) {
            console.error('❌ 수입 물량 관리 페이지 렌더링 실패:', error);
            showAlert('수입 물량 관리 페이지를 불러오는데 실패했습니다.', 'danger');
        }
    },

    /**
     * 수입 물량 데이터 로드
     */
    async loadImports() {
        try {
            const response = await API.getImports(this.currentPage, this.pageSize);
            this.totalPages = Math.ceil(response.total / this.pageSize);
            
            // 각 수입 물량에 대한 불량 데이터 조회
            const importsWithDefects = await Promise.all(response.data.map(async (imp) => {
                try {
                    // 해당 LOT의 불량 데이터 조회
                    const defectsResponse = await API.getDefects(1, 1000);
                    const lotDefects = defectsResponse.data.filter(d => d.lot_number === imp.lot_number);
                    
                    const totalDefectQuantity = lotDefects.reduce((sum, d) => sum + (d.defect_quantity || 0), 0);
                    const defectRate = imp.import_quantity > 0 
                        ? ((totalDefectQuantity / imp.import_quantity) * 100).toFixed(1)
                        : '0.0';
                    
                    return {
                        ...imp,
                        totalDefectQuantity,
                        defectRate
                    };
                } catch (error) {
                    console.error('불량 데이터 조회 실패:', error);
                    return {
                        ...imp,
                        totalDefectQuantity: 0,
                        defectRate: '0.0'
                    };
                }
            }));
            
            return importsWithDefects;
        } catch (error) {
            console.error('❌ 수입 물량 데이터 로드 실패:', error);
            return [];
        }
    },

    /**
     * 테이블 행 렌더링
     */
    renderTableRows(imports) {
        if (!imports || imports.length === 0) {
            return `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px;">
                        등록된 수입 물량이 없습니다.
                    </td>
                </tr>
            `;
        }

        return imports.map(imp => {
            const defectRateNum = parseFloat(imp.defectRate);
            let rateClass = 'badge-success';
            if (defectRateNum > 15) rateClass = 'badge-danger';
            else if (defectRateNum > 5) rateClass = 'badge-warning';

            return `
                <tr data-import-id="${imp.id}">
                    <td style="white-space: nowrap;">${imp.import_date || '-'}</td>
                    <td style="white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${imp.product_name || '-'}">${imp.product_name || '-'}</td>
                    <td style="white-space: nowrap;">${imp.season || '-'}</td>
                    <td style="white-space: nowrap;">${imp.model_name || '-'}</td>
                    <td style="white-space: nowrap;"><strong>${imp.lot_number || '-'}</strong></td>
                    <td style="text-align: right; white-space: nowrap;"><strong>${(imp.import_quantity || 0).toLocaleString()}개</strong></td>
                    <td style="text-align: right; color: #dc3545; white-space: nowrap;"><strong>${(imp.totalDefectQuantity || 0).toLocaleString()}개</strong></td>
                    <td style="text-align: center; white-space: nowrap;">
                        <span class="badge ${rateClass}">${imp.defectRate}%</span>
                    </td>
                    <td style="white-space: nowrap;">${imp.registrant || '-'}</td>
                    <td style="text-align: center; white-space: nowrap;">
                        <button class="btn btn-sm btn-outline edit-import-btn" data-id="${imp.id}" style="margin-right: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-import-btn" data-id="${imp.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * 페이지네이션 렌더링
     */
    renderPagination() {
        if (this.totalPages <= 1) return '';

        let html = '<div class="pagination-controls">';
        
        // 이전 페이지 버튼
        html += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 페이지 번호
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        // 다음 페이지 버튼
        html += `
            <button class="pagination-btn" ${this.currentPage === this.totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        html += '</div>';
        return html;
    },

    /**
     * 이벤트 리스너 설정
     */
    attachEventListeners() {
        // 수입 물량 등록 버튼
        document.getElementById('addImportBtn')?.addEventListener('click', () => {
            this.showImportModal();
        });

        // 검색 버튼
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.applyFilters();
        });

        // 필터 초기화 버튼
        document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Excel 다운로드 버튼
        document.getElementById('exportExcelBtn')?.addEventListener('click', async () => {
            await this.exportToExcel();
        });

        // 수정 버튼
        document.querySelectorAll('.edit-import-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.showImportModal(id);
            });
        });

        // 삭제 버튼
        document.querySelectorAll('.delete-import-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                await this.deleteImport(id);
            });
        });

        // 페이지네이션 버튼
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.render();
                }
            });
        });
    },

    /**
     * 수입 물량 등록/수정 모달 표시
     */
    async showImportModal(importId = null) {
        const isEdit = !!importId;
        let importData = null;

        if (isEdit) {
            try {
                importData = await API.getImport(importId);
            } catch (error) {
                console.error('수입 물량 데이터 로드 실패:', error);
                showAlert('수입 물량 데이터를 불러오는데 실패했습니다.', 'danger');
                return;
            }
        }

        const modalHtml = `
            <div class="modal-overlay" id="importModal">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2 class="modal-title">${isEdit ? '수입 물량 수정' : '수입 물량 등록'}</h2>
                        <button class="modal-close" id="closeImportModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="importForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">수입일자</label>
                                    <input type="date" id="importDate" class="form-input" required
                                        value="${importData?.import_date || new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">제품명</label>
                                    <input type="text" id="productName" class="form-input" required
                                        placeholder="제품명을 입력하세요"
                                        value="${importData?.product_name || ''}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">시즌/버전</label>
                                    <input type="text" id="season" class="form-input"
                                        placeholder="예: 2026 봄"
                                        value="${importData?.season || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">모델명</label>
                                    <input type="text" id="modelName" class="form-input"
                                        placeholder="예: HC-100"
                                        value="${importData?.model_name || ''}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">LOT 번호</label>
                                    <input type="text" id="lotNumber" class="form-input" required
                                        placeholder="예: LOT-2026-001"
                                        value="${importData?.lot_number || ''}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">수입 수량</label>
                                    <input type="number" id="importQuantity" class="form-input" required
                                        min="1" placeholder="수입 수량을 입력하세요"
                                        value="${importData?.import_quantity || ''}">
                                    <small class="form-help">전체 수입된 제품의 수량을 입력하세요</small>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">등록자</label>
                                    <input type="text" id="registrant" class="form-input"
                                        placeholder="등록자명"
                                        value="${importData?.registrant || ''}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">비고</label>
                                    <textarea id="note" class="form-textarea" rows="3"
                                        placeholder="특이사항이나 참고사항을 입력하세요">${importData?.note || ''}</textarea>
                                </div>
                            </div>

                            <div class="modal-actions">
                                <button type="button" class="btn btn-outline" id="cancelImportBtn">취소</button>
                                <button type="submit" class="btn btn-primary" id="submitImportBtn">
                                    ${isEdit ? '수정' : '등록'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // 기존 모달 제거
        document.getElementById('importModal')?.remove();

        // 새 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 모달 이벤트 리스너
        const modal = document.getElementById('importModal');
        const closeBtn = document.getElementById('closeImportModal');
        const cancelBtn = document.getElementById('cancelImportBtn');
        const form = document.getElementById('importForm');

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveImport(importId);
            closeModal();
        });

        // 모달 표시
        setTimeout(() => modal.classList.add('active'), 10);
    },

    /**
     * 수입 물량 저장
     */
    async saveImport(importId = null) {
        const data = {
            import_date: document.getElementById('importDate').value,
            product_name: document.getElementById('productName').value,
            season: document.getElementById('season').value,
            model_name: document.getElementById('modelName').value,
            lot_number: document.getElementById('lotNumber').value,
            import_quantity: parseInt(document.getElementById('importQuantity').value),
            registrant: document.getElementById('registrant').value,
            note: document.getElementById('note').value
        };

        try {
            if (importId) {
                await API.updateImport(importId, data);
                showAlert('수입 물량이 수정되었습니다.', 'success');
            } else {
                await API.createImport(data);
                showAlert('수입 물량이 등록되었습니다.', 'success');
            }
            
            await this.render();
        } catch (error) {
            console.error('수입 물량 저장 실패:', error);
            showAlert('수입 물량 저장에 실패했습니다.', 'danger');
        }
    },

    /**
     * 수입 물량 삭제
     */
    async deleteImport(importId) {
        if (!confirmDialog('이 수입 물량을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await API.deleteImport(importId);
            showAlert('수입 물량이 삭제되었습니다.', 'success');
            await this.render();
        } catch (error) {
            console.error('수입 물량 삭제 실패:', error);
            showAlert('수입 물량 삭제에 실패했습니다.', 'danger');
        }
    },

    /**
     * 필터 적용
     */
    async applyFilters() {
        this.filters.startDate = document.getElementById('filterStartDate').value;
        this.filters.endDate = document.getElementById('filterEndDate').value;
        this.filters.productName = document.getElementById('filterProductName').value;
        this.filters.lotNumber = document.getElementById('filterLotNumber').value;
        
        this.currentPage = 1;
        await this.render();
    },

    /**
     * 필터 초기화
     */
    async resetFilters() {
        this.filters = {
            startDate: '',
            endDate: '',
            productName: '',
            lotNumber: ''
        };
        this.currentPage = 1;
        await this.render();
    },

    /**
     * Excel 다운로드
     */
    async exportToExcel() {
        try {
            const response = await API.getImports(1, 1000);
            const imports = response.data;

            // 각 수입 물량에 대한 불량 데이터 조회
            const importsWithDefects = await Promise.all(imports.map(async (imp) => {
                try {
                    const defectsResponse = await API.getDefects(1, 1000);
                    const lotDefects = defectsResponse.data.filter(d => d.lot_number === imp.lot_number);
                    
                    const totalDefectQuantity = lotDefects.reduce((sum, d) => sum + (d.defect_quantity || 0), 0);
                    const defectRate = imp.import_quantity > 0 
                        ? ((totalDefectQuantity / imp.import_quantity) * 100).toFixed(1)
                        : '0.0';
                    
                    return {
                        ...imp,
                        totalDefectQuantity,
                        defectRate
                    };
                } catch (error) {
                    return {
                        ...imp,
                        totalDefectQuantity: 0,
                        defectRate: '0.0'
                    };
                }
            }));

            const data = importsWithDefects.map(imp => ({
                '수입일자': imp.import_date || '-',
                '제품명': imp.product_name || '-',
                '시즌/버전': imp.season || '-',
                '모델명': imp.model_name || '-',
                'LOT 번호': imp.lot_number || '-',
                '수입 수량': imp.import_quantity || 0,
                '불량 수량': imp.totalDefectQuantity || 0,
                '불량률(%)': imp.defectRate || '0.0',
                '등록자': imp.registrant || '-',
                '비고': imp.note || '-'
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '수입물량');

            // 컬럼 너비 설정
            ws['!cols'] = [
                { wch: 12 },  // 수입일자
                { wch: 15 },  // 제품명
                { wch: 12 },  // 시즌/버전
                { wch: 12 },  // 모델명
                { wch: 18 },  // LOT 번호
                { wch: 12 },  // 수입 수량
                { wch: 12 },  // 불량 수량
                { wch: 12 },  // 불량률
                { wch: 10 },  // 등록자
                { wch: 30 }   // 비고
            ];

            const fileName = `수입물량_${formatDate(new Date())}.xlsx`;
            XLSX.writeFile(wb, fileName);

            showAlert('Excel 파일이 다운로드되었습니다.', 'success');
        } catch (error) {
            console.error('Excel 다운로드 실패:', error);
            showAlert('Excel 다운로드에 실패했습니다.', 'danger');
        }
    }
};
