// Summary Page - LOT and Import Date Summary
const DefectSummary = {
    groups: [],

    async render() {
        try {
            const result = await API.getDefects({ limit: 1000 });
            const defects = result.data || [];
            this.groups = groupByLotAndDate(defects);

            const html = `
                <div class="page active" id="summaryPage">
                    <div class="page-header">
                        <h1 class="page-title">LOT / 수입일자 요약</h1>
                        <p class="page-description">수입일자와 LOT 번호 기준으로 불량 현황을 집계합니다.</p>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">불량 요약 (총 ${this.groups.length}개 그룹)</h2>
                            <button class="btn btn-success" id="exportSummaryBtn">
                                <i class="fas fa-file-excel"></i> 요약 엑셀 다운로드
                            </button>
                        </div>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>수입일자</th>
                                        <th>LOT 번호</th>
                                        <th>제품명</th>
                                        <th>총 불량수</th>
                                        <th>주요 불량 유형</th>
                                        <th>불량 유형별 수량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderSummaryRows()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Overall Statistics -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">전체 불량 유형별 통계</h2>
                        </div>
                        ${this.renderOverallStats(defects)}
                    </div>
                </div>
            `;

            document.getElementById('mainContent').innerHTML = html;
            this.attachEventListeners();

        } catch (error) {
            console.error('Summary render error:', error);
            showAlert('요약 정보를 불러오는데 실패했습니다.', 'danger');
        }
    },

    renderSummaryRows() {
        if (this.groups.length === 0) {
            return `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>불량 정보가 없습니다.</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.groups.map(group => {
            const mainType = getMainDefectType(group.typeCount);
            const typeDetails = Object.entries(group.typeCount)
                .map(([type, count]) => `${type}: ${count}`)
                .join('<br>');

            return `
                <tr>
                    <td>${group.import_date}</td>
                    <td><strong>${group.lot_number}</strong></td>
                    <td>${group.product_name}</td>
                    <td><strong style="color: var(--danger-color); font-size: 1.125rem;">${group.totalQuantity}</strong></td>
                    <td><span class="badge badge-danger">${mainType}</span></td>
                    <td style="font-size: 0.875rem;">${typeDetails}</td>
                </tr>
            `;
        }).join('');
    },

    renderOverallStats(defects) {
        const typeCount = {};
        defects.forEach(d => {
            typeCount[d.defect_type] = (typeCount[d.defect_type] || 0) + d.defect_quantity;
        });

        const sortedTypes = Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1]);

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${sortedTypes.map(([type, count]) => `
                    <div style="padding: 15px; background: var(--bg-color); border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 5px;">
                            ${type}
                        </div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger-color);">
                            ${count}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    attachEventListeners() {
        document.getElementById('exportSummaryBtn').addEventListener('click', () => {
            const exportData = this.groups.map(group => ({
                '수입일자': group.import_date,
                'LOT 번호': group.lot_number,
                '제품명': group.product_name,
                '총 불량수': group.totalQuantity,
                '주요 불량 유형': getMainDefectType(group.typeCount),
                ...Object.fromEntries(
                    Object.entries(group.typeCount).map(([type, count]) => [type, count])
                )
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws, '요약');
            XLSX.writeFile(wb, `defect_summary_${formatDate(new Date())}.xlsx`);
            
            showAlert('요약 엑셀 파일이 다운로드되었습니다.', 'success');
        });
    }
};
