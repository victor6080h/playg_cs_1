// Report Generation Page
const DefectReport = {
    selectedDefects: [],

    async render() {
        try {
            const result = await API.getDefects({ limit: 1000 });
            const defects = result.data || [];
            const groups = groupByLotAndDate(defects);

            const html = `
                <div class="page active" id="reportPage">
                    <div class="page-header">
                        <h1 class="page-title">보고서 출력</h1>
                        <p class="page-description">중국 공장에 제출할 클레임 보고서를 생성합니다.</p>
                    </div>

                    <!-- Report Options -->
                    <div class="card">
                        <h3 style="margin-bottom: 20px;">보고서 생성 옵션</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">보고서 유형</label>
                                <select class="form-select" id="reportType">
                                    <option value="all">전체 불량 보고서</option>
                                    <option value="lot">LOT별 보고서</option>
                                    <option value="date">수입일자별 보고서</option>
                                    <option value="custom">사용자 지정</option>
                                </select>
                            </div>
                        </div>

                        <div id="reportFilters" style="display: none;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">수입일자 시작</label>
                                    <input type="date" class="form-input" id="reportStartDate">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">수입일자 종료</label>
                                    <input type="date" class="form-input" id="reportEndDate">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">LOT 번호</label>
                                    <input type="text" class="form-input" id="reportLot" 
                                        placeholder="LOT 번호 입력">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">제품명</label>
                                    <input type="text" class="form-input" id="reportProduct" 
                                        placeholder="제품명 입력">
                                </div>
                            </div>
                        </div>

                        <div class="btn-group">
                            <button class="btn btn-primary" id="generatePdfBtn">
                                <i class="fas fa-file-pdf"></i> PDF 보고서 생성
                            </button>
                            <button class="btn btn-success" id="generateExcelBtn">
                                <i class="fas fa-file-excel"></i> 엑셀 보고서 생성
                            </button>
                        </div>
                    </div>

                    <!-- Quick Report by LOT -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">LOT별 빠른 보고서 생성</h2>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                            ${this.renderQuickReportCards(groups)}
                        </div>
                    </div>

                    <!-- Report Preview -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">보고서 미리보기</h2>
                        </div>
                        <div id="reportPreview" style="padding: 20px; background: var(--bg-color); border-radius: 8px; min-height: 200px;">
                            <p style="text-align: center; color: var(--text-secondary);">
                                보고서 옵션을 선택하고 생성 버튼을 클릭하세요.
                            </p>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('mainContent').innerHTML = html;
            this.attachEventListeners();

        } catch (error) {
            console.error('Report render error:', error);
            showAlert('보고서 페이지를 불러오는데 실패했습니다.', 'danger');
        }
    },

    renderQuickReportCards(groups) {
        if (groups.length === 0) {
            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>불량 정보가 없습니다.</p>
                    </div>
                </div>
            `;
        }

        return groups.map(group => `
            <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: var(--shadow);">
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        ${group.import_date}
                    </div>
                    <div style="font-size: 1.125rem; font-weight: 600; margin: 5px 0;">
                        ${group.lot_number}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        ${group.product_name}
                    </div>
                </div>
                <div style="margin-bottom: 15px; padding: 10px; background: var(--bg-color); border-radius: 6px;">
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">총 불량수</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger-color);">
                        ${group.totalQuantity}
                    </div>
                </div>
                <button class="btn btn-primary" style="width: 100%;" 
                    onclick="DefectReport.generateLotReport('${group.lot_number}', '${group.import_date}')">
                    <i class="fas fa-file-pdf"></i> PDF 보고서
                </button>
            </div>
        `).join('');
    },

    attachEventListeners() {
        // Report type change
        document.getElementById('reportType').addEventListener('change', (e) => {
            const filters = document.getElementById('reportFilters');
            if (e.target.value === 'custom') {
                filters.style.display = 'block';
            } else {
                filters.style.display = 'none';
            }
        });

        // Generate PDF
        document.getElementById('generatePdfBtn').addEventListener('click', () => {
            this.generateReport('pdf');
        });

        // Generate Excel
        document.getElementById('generateExcelBtn').addEventListener('click', () => {
            this.generateReport('excel');
        });
    },

    async generateReport(format) {
        try {
            const reportType = document.getElementById('reportType').value;
            const result = await API.getDefects({ limit: 1000 });
            let defects = result.data || [];

            // Filter based on report type
            if (reportType === 'custom') {
                const startDate = document.getElementById('reportStartDate').value;
                const endDate = document.getElementById('reportEndDate').value;
                const lot = document.getElementById('reportLot').value.toLowerCase();
                const product = document.getElementById('reportProduct').value.toLowerCase();

                defects = defects.filter(d => {
                    if (startDate && d.import_date < startDate) return false;
                    if (endDate && d.import_date > endDate) return false;
                    if (lot && !d.lot_number.toLowerCase().includes(lot)) return false;
                    if (product && !d.product_name.toLowerCase().includes(product)) return false;
                    return true;
                });
            }

            if (defects.length === 0) {
                showAlert('선택한 조건에 해당하는 불량 정보가 없습니다.', 'danger');
                return;
            }

            const reportInfo = {
                product_name: defects[0]?.product_name || '전체 제품',
                import_date: defects[0]?.import_date || '',
                lot_number: defects[0]?.lot_number || '전체',
                period: `${formatDate(new Date(Math.min(...defects.map(d => d.created_at))))} ~ ${formatDate(new Date(Math.max(...defects.map(d => d.created_at))))}`
            };

            if (format === 'pdf') {
                await generatePDFReport(defects, reportInfo);
                showAlert('PDF 보고서가 생성되었습니다.', 'success');
            } else {
                exportToExcel(defects, `defect_report_${formatDate(new Date())}.xlsx`);
                showAlert('엑셀 보고서가 생성되었습니다.', 'success');
            }

        } catch (error) {
            console.error('Report generation error:', error);
            showAlert('보고서 생성에 실패했습니다.', 'danger');
        }
    },

    async generateLotReport(lotNumber, importDate) {
        try {
            const result = await API.getDefects({ limit: 1000 });
            const defects = result.data.filter(d => 
                d.lot_number === lotNumber && d.import_date === importDate
            );

            if (defects.length === 0) {
                showAlert('해당 LOT의 불량 정보가 없습니다.', 'danger');
                return;
            }

            const reportInfo = {
                product_name: defects[0].product_name,
                import_date: importDate,
                lot_number: lotNumber,
                period: `${formatDate(new Date(Math.min(...defects.map(d => d.created_at))))} ~ ${formatDate(new Date(Math.max(...defects.map(d => d.created_at))))}`
            };

            await generatePDFReport(defects, reportInfo);
            showAlert(`LOT ${lotNumber}의 PDF 보고서가 생성되었습니다.`, 'success');

        } catch (error) {
            console.error('LOT report generation error:', error);
            showAlert('보고서 생성에 실패했습니다.', 'danger');
        }
    }
};
