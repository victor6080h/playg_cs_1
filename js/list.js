// Defect List Page
const DefectList = {
    allDefects: [],
    filteredDefects: [],
    selectedDefects: [],
    currentPage: 1,
    itemsPerPage: 20,

    async render() {
        try {
            const result = await API.getDefects({ limit: 1000 });
            this.allDefects = result.data || [];
            this.filteredDefects = [...this.allDefects];
            this.selectedDefects = [];
            this.currentPage = 1;

            const html = `
                <div class="page active" id="listPage">
                    <div class="page-header">
                        <h1 class="page-title">불량 목록</h1>
                        <p class="page-description">등록된 불량 제품 목록을 조회하고 관리합니다.</p>
                    </div>

                    <!-- Filters -->
                    <div class="filters">
                        <div class="filter-group">
                            <label class="form-label">수입일자 시작</label>
                            <input type="date" class="form-input" id="filterStartDate">
                        </div>
                        <div class="filter-group">
                            <label class="form-label">수입일자 종료</label>
                            <input type="date" class="form-input" id="filterEndDate">
                        </div>
                        <div class="filter-group">
                            <label class="form-label">제품명 검색</label>
                            <input type="text" class="form-input" id="filterProduct" 
                                placeholder="제품명으로 검색">
                        </div>
                        <div class="filter-group">
                            <label class="form-label">LOT 번호 검색</label>
                            <input type="text" class="form-input" id="filterLot" 
                                placeholder="LOT 번호로 검색">
                        </div>
                        <div class="filter-group">
                            <label class="form-label">불량 유형</label>
                            <select class="form-select" id="filterType">
                                <option value="">전체</option>
                                ${DEFECT_TYPES.map(type => `
                                    <option value="${type}">${type}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="form-label">정렬</label>
                            <select class="form-select" id="sortBy">
                                <option value="created_desc">최신 등록순</option>
                                <option value="created_asc">오래된 등록순</option>
                                <option value="import_desc">수입일자 최신순</option>
                                <option value="import_asc">수입일자 오래된순</option>
                                <option value="quantity_desc">수량 많은 순</option>
                                <option value="quantity_asc">수량 적은 순</option>
                            </select>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="card">
                        <div class="btn-group">
                            <button class="btn btn-primary" id="applyFilterBtn">
                                <i class="fas fa-filter"></i> 필터 적용
                            </button>
                            <button class="btn btn-secondary" id="resetFilterBtn">
                                <i class="fas fa-redo"></i> 필터 초기화
                            </button>
                            <button class="btn btn-success" id="exportExcelBtn">
                                <i class="fas fa-file-excel"></i> 엑셀 다운로드
                            </button>
                            <button class="btn btn-outline" id="exportSelectedBtn" disabled>
                                <i class="fas fa-check-square"></i> 선택 항목 다운로드 (<span id="selectedCount">0</span>)
                            </button>
                            <button class="btn btn-danger" id="deleteSelectedBtn" disabled>
                                <i class="fas fa-trash"></i> 선택 항목 삭제 (<span id="selectedCountDelete">0</span>)
                            </button>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">불량 목록 (총 <span id="totalCount">${this.filteredDefects.length}</span>건)</h2>
                        </div>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">
                                            <input type="checkbox" class="checkbox" id="selectAll">
                                        </th>
                                        <th>등록일</th>
                                        <th>수입일자</th>
                                        <th>제품명</th>
                                        <th>LOT 번호</th>
                                        <th>불량 유형</th>
                                        <th>수량</th>
                                        <th>등록자</th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody id="defectTableBody">
                                    ${this.renderTableRows()}
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="pagination" id="pagination"></div>
                    </div>
                </div>
            `;

            document.getElementById('mainContent').innerHTML = html;
            this.renderPagination();
            this.attachEventListeners();

        } catch (error) {
            console.error('List render error:', error);
            showAlert('목록을 불러오는데 실패했습니다.', 'danger');
        }
    },

    renderTableRows() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageDefects = this.filteredDefects.slice(start, end);

        if (pageDefects.length === 0) {
            return `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px;">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>불량 정보가 없습니다.</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return pageDefects.map(defect => `
            <tr data-id="${defect.id}">
                <td>
                    <input type="checkbox" class="checkbox row-checkbox" 
                        value="${defect.id}" 
                        ${this.selectedDefects.includes(defect.id) ? 'checked' : ''}>
                </td>
                <td>${formatDateTime(defect.created_at)}</td>
                <td>${defect.import_date}</td>
                <td>${defect.product_name}</td>
                <td>${defect.lot_number}</td>
                <td><span class="badge badge-danger">${defect.defect_type}</span></td>
                <td>${defect.defect_quantity}</td>
                <td>${defect.registrant || '-'}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm view-btn" data-id="${defect.id}" 
                            style="padding: 6px 12px; font-size: 0.875rem;">
                            <i class="fas fa-eye"></i> 보기
                        </button>
                        <button class="btn btn-danger btn-sm delete-single-btn" data-id="${defect.id}" 
                            style="padding: 6px 12px; font-size: 0.875rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderPagination() {
        const totalPages = Math.ceil(this.filteredDefects.length / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (!pagination) return;

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = `
            <button ${this.currentPage === 1 ? 'disabled' : ''} id="prevPage">
                <i class="fas fa-chevron-left"></i> 이전
            </button>
            <span>${this.currentPage} / ${totalPages}</span>
            <button ${this.currentPage === totalPages ? 'disabled' : ''} id="nextPage">
                다음 <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = html;

        // Attach pagination listeners
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateTable();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredDefects.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateTable();
            }
        });
    },

    attachEventListeners() {
        // Apply filter
        document.getElementById('applyFilterBtn').addEventListener('click', () => {
            this.applyFilters();
        });

        // Reset filter
        document.getElementById('resetFilterBtn').addEventListener('click', () => {
            document.getElementById('filterStartDate').value = '';
            document.getElementById('filterEndDate').value = '';
            document.getElementById('filterProduct').value = '';
            document.getElementById('filterLot').value = '';
            document.getElementById('filterType').value = '';
            document.getElementById('sortBy').value = 'created_desc';
            this.applyFilters();
        });

        // Export Excel
        document.getElementById('exportExcelBtn').addEventListener('click', () => {
            exportToExcel(this.filteredDefects, `defects_${formatDate(new Date())}.xlsx`);
            showAlert('엑셀 파일이 다운로드되었습니다.', 'success');
        });

        // Export selected
        document.getElementById('exportSelectedBtn').addEventListener('click', () => {
            const selected = this.allDefects.filter(d => this.selectedDefects.includes(d.id));
            if (selected.length === 0) {
                showAlert('선택된 항목이 없습니다.', 'danger');
                return;
            }
            exportToExcel(selected, `defects_selected_${formatDate(new Date())}.xlsx`);
            showAlert(`선택된 ${selected.length}건의 엑셀 파일이 다운로드되었습니다.`, 'success');
        });

        // Delete selected
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
            this.deleteSelected();
        });

        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const id = cb.value;
                if (e.target.checked) {
                    if (!this.selectedDefects.includes(id)) {
                        this.selectedDefects.push(id);
                    }
                } else {
                    this.selectedDefects = this.selectedDefects.filter(sid => sid !== id);
                }
            });
            this.updateSelectedCount();
        });

        // Row checkboxes
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                const id = cb.value;
                if (cb.checked) {
                    if (!this.selectedDefects.includes(id)) {
                        this.selectedDefects.push(id);
                    }
                } else {
                    this.selectedDefects = this.selectedDefects.filter(sid => sid !== id);
                }
                this.updateSelectedCount();
            });
        });

        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const defectId = btn.dataset.id;
                this.showDetail(defectId);
            });
        });

        // Delete single buttons
        document.querySelectorAll('.delete-single-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const defectId = btn.dataset.id;
                await this.deleteSingle(defectId);
            });
        });

        // Row click
        document.querySelectorAll('.data-table tbody tr').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox' && !e.target.closest('button')) {
                    const defectId = row.dataset.id;
                    if (defectId) {
                        this.showDetail(defectId);
                    }
                }
            });
        });
    },

    applyFilters() {
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;
        const product = document.getElementById('filterProduct').value.toLowerCase();
        const lot = document.getElementById('filterLot').value.toLowerCase();
        const type = document.getElementById('filterType').value;
        const sortBy = document.getElementById('sortBy').value;

        // Filter
        this.filteredDefects = this.allDefects.filter(defect => {
            if (startDate && defect.import_date < startDate) return false;
            if (endDate && defect.import_date > endDate) return false;
            if (product && !defect.product_name.toLowerCase().includes(product)) return false;
            if (lot && !defect.lot_number.toLowerCase().includes(lot)) return false;
            if (type && defect.defect_type !== type) return false;
            return true;
        });

        // Sort
        this.filteredDefects.sort((a, b) => {
            switch (sortBy) {
                case 'created_desc':
                    return b.created_at - a.created_at;
                case 'created_asc':
                    return a.created_at - b.created_at;
                case 'import_desc':
                    return b.import_date.localeCompare(a.import_date);
                case 'import_asc':
                    return a.import_date.localeCompare(b.import_date);
                case 'quantity_desc':
                    return b.defect_quantity - a.defect_quantity;
                case 'quantity_asc':
                    return a.defect_quantity - b.defect_quantity;
                default:
                    return 0;
            }
        });

        this.currentPage = 1;
        this.updateTable();
        showAlert(`필터가 적용되었습니다. (${this.filteredDefects.length}건)`, 'success');
    },

    updateTable() {
        document.getElementById('defectTableBody').innerHTML = this.renderTableRows();
        document.getElementById('totalCount').textContent = this.filteredDefects.length;
        this.renderPagination();
        this.attachEventListeners();
    },

    updateSelectedCount() {
        const count = this.selectedDefects.length;
        document.getElementById('selectedCount').textContent = count;
        document.getElementById('selectedCountDelete').textContent = count;
        document.getElementById('exportSelectedBtn').disabled = count === 0;
        document.getElementById('deleteSelectedBtn').disabled = count === 0;
    },

    async deleteSingle(defectId) {
        if (!confirmDialog('이 불량 정보를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await API.deleteDefect(defectId);
            showAlert('불량 정보가 삭제되었습니다.', 'success');
            
            // Remove from selectedDefects if exists
            this.selectedDefects = this.selectedDefects.filter(id => id !== defectId);
            
            // Reload data
            await this.render();
        } catch (error) {
            console.error('Delete error:', error);
            showAlert('삭제에 실패했습니다.', 'danger');
        }
    },

    async deleteSelected() {
        if (this.selectedDefects.length === 0) {
            showAlert('선택된 항목이 없습니다.', 'danger');
            return;
        }

        if (!confirmDialog(`선택된 ${this.selectedDefects.length}건의 불량 정보를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            // Delete all selected items
            const deletePromises = this.selectedDefects.map(id => API.deleteDefect(id));
            await Promise.all(deletePromises);
            
            showAlert(`${this.selectedDefects.length}건의 불량 정보가 삭제되었습니다.`, 'success');
            
            // Clear selection
            this.selectedDefects = [];
            
            // Reload data
            await this.render();
        } catch (error) {
            console.error('Batch delete error:', error);
            showAlert('일부 항목의 삭제에 실패했습니다.', 'danger');
            // Still reload to show what was deleted
            await this.render();
        }
    },

    async showDetail(defectId) {
        try {
            const defect = await API.getDefect(defectId);
            
            const modalHtml = `
                <h2 style="margin-bottom: 25px;">불량 상세 정보</h2>
                
                <div class="detail-section">
                    <h3 style="margin-bottom: 15px; color: var(--primary-color);">기본 정보</h3>
                    <div class="detail-row">
                        <div class="detail-label">수입일자</div>
                        <div class="detail-value">${defect.import_date}</div>
                    </div>
                    ${defect.received_date ? `
                        <div class="detail-row">
                            <div class="detail-label">불량제품 접수일자</div>
                            <div class="detail-value"><strong style="color: var(--warning-color);">${defect.received_date}</strong></div>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <div class="detail-label">제품명</div>
                        <div class="detail-value">${defect.product_name}</div>
                    </div>
                    ${defect.season ? `
                        <div class="detail-row">
                            <div class="detail-label">시즌/버전</div>
                            <div class="detail-value">${defect.season}</div>
                        </div>
                    ` : ''}
                    ${defect.model_name ? `
                        <div class="detail-row">
                            <div class="detail-label">모델명</div>
                            <div class="detail-value">${defect.model_name}</div>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <div class="detail-label">LOT 번호</div>
                        <div class="detail-value"><strong>${defect.lot_number}</strong></div>
                    </div>
                    ${defect.import_quantity ? `
                        <div class="detail-row">
                            <div class="detail-label">수입 수량</div>
                            <div class="detail-value"><strong style="color: var(--primary-color);">${defect.import_quantity}개</strong></div>
                        </div>
                    ` : ''}
                </div>

                <div class="detail-section">
                    <h3 style="margin-bottom: 15px; color: var(--danger-color);">불량 정보</h3>
                    <div class="detail-row">
                        <div class="detail-label">불량 유형</div>
                        <div class="detail-value">
                            <span class="badge badge-danger">${defect.defect_type}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">불량 수량</div>
                        <div class="detail-value"><strong style="font-size: 1.25rem; color: var(--danger-color);">${defect.defect_quantity}개</strong></div>
                    </div>
                    ${defect.import_quantity ? `
                        <div class="detail-row">
                            <div class="detail-label">불량률</div>
                            <div class="detail-value">
                                <strong style="font-size: 1.25rem; color: ${(defect.defect_quantity / defect.import_quantity * 100) > 15 ? 'var(--danger-color)' : (defect.defect_quantity / defect.import_quantity * 100) > 5 ? 'var(--warning-color)' : 'var(--success-color)'};">
                                    ${((defect.defect_quantity / defect.import_quantity) * 100).toFixed(1)}%
                                </strong>
                            </div>
                        </div>
                    ` : ''}
                    ${defect.defect_detail ? `
                        <div class="detail-row">
                            <div class="detail-label">상세 내용</div>
                            <div class="detail-value" style="white-space: pre-wrap;">${defect.defect_detail}</div>
                        </div>
                    ` : ''}
                </div>

                <div class="detail-section">
                    <h3 style="margin-bottom: 15px; color: var(--secondary-color);">추가 정보</h3>
                    ${defect.registrant ? `
                        <div class="detail-row">
                            <div class="detail-label">등록자</div>
                            <div class="detail-value">${defect.registrant}</div>
                        </div>
                    ` : ''}
                    ${defect.inspection_location ? `
                        <div class="detail-row">
                            <div class="detail-label">검사 위치</div>
                            <div class="detail-value">${defect.inspection_location}</div>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <div class="detail-label">등록일시</div>
                        <div class="detail-value">${formatDateTime(defect.created_at)}</div>
                    </div>
                    ${defect.note ? `
                        <div class="detail-row">
                            <div class="detail-label">비고</div>
                            <div class="detail-value" style="white-space: pre-wrap;">${defect.note}</div>
                        </div>
                    ` : ''}
                </div>

                ${defect.photos && defect.photos.length > 0 ? `
                    <div class="detail-section">
                        <h3 style="margin-bottom: 15px; color: var(--info-color);">첨부 사진</h3>
                        <div class="image-gallery">
                            ${defect.photos.map(photo => `
                                <img src="${photo}" alt="Defect photo" onclick="window.open('${photo}', '_blank')">
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${defect.videos && defect.videos.length > 0 ? `
                    <div class="detail-section">
                        <h3 style="margin-bottom: 15px; color: var(--info-color);">첨부 동영상</h3>
                        <div class="image-gallery">
                            ${defect.videos.map(video => `
                                <video src="${video}" controls playsinline webkit-playsinline></video>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="btn-group" style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="DefectRegister.render('${defect.id}'); document.getElementById('detailModal').classList.remove('active'); window.location.hash='register';">
                        <i class="fas fa-edit"></i> 수정하기
                    </button>
                    <button class="btn btn-secondary" onclick="document.getElementById('detailModal').classList.remove('active')">
                        <i class="fas fa-times"></i> 닫기
                    </button>
                </div>
            `;

            document.getElementById('modalBody').innerHTML = modalHtml;
            document.getElementById('detailModal').classList.add('active');

        } catch (error) {
            console.error('Detail view error:', error);
            showAlert('상세 정보를 불러오는데 실패했습니다.', 'danger');
        }
    }
};
