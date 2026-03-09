// Dashboard Page with Professional Gauge Charts
const Dashboard = {
    chart: null,
    selectedProduct: 'all', // 선택된 제품 (all = 전체)
    allDefects: [], // 전체 불량 데이터
    productNames: [], // 제품명 목록

    async render() {
        try {
            const result = await API.getDefects({ limit: 1000 });
            this.allDefects = result.data || [];
            
            // 고유 제품명 추출
            this.productNames = [...new Set(this.allDefects.map(d => d.product_name).filter(Boolean))].sort();
            
            // 선택된 제품 필터링
            const defects = this.getFilteredDefects();
            const stats = calculateStats(defects);

            // 비동기 데이터 미리 계산
            const defectRate = await this.calculateDefectRate(defects);
            const productTop3 = await this.calculateProductTop3(defects);
            const defectTypeDistribution = this.calculateDefectTypeDistribution(defects);
            const lotDefectRateTable = await this.renderLotDefectRateTable(defects);

            const html = `
                <div class="page active" id="dashboardPage">
                    <div class="page-header">
                        <h1 class="page-title">품질 관리 대시보드</h1>
                        <p class="page-description">불량 제품 현황 및 통계를 실시간으로 확인하세요</p>
                    </div>

                    <!-- Product Filter -->
                    <div class="product-filter-section">
                        <div class="product-filter-header">
                            <i class="fas fa-filter"></i>
                            <span>제품별 필터</span>
                        </div>
                        <div class="product-filter-buttons">
                            <button class="product-filter-btn ${this.selectedProduct === 'all' ? 'active' : ''}" data-product="all">
                                <i class="fas fa-globe"></i>
                                전체 제품
                            </button>
                            ${this.productNames.map(product => `
                                <button class="product-filter-btn ${this.selectedProduct === product ? 'active' : ''}" data-product="${product}">
                                    <i class="fas fa-box"></i>
                                    ${product}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Current Product Info -->
                    ${this.selectedProduct !== 'all' ? `
                        <div class="current-product-banner">
                            <i class="fas fa-bullseye"></i>
                            <span>현재 보고 있는 제품: <strong>${this.selectedProduct}</strong></span>
                        </div>
                    ` : ''}

                    <!-- Gauge Cards -->
                    <div class="gauge-grid">
                        <div class="gauge-card">
                            <h3 class="gauge-title">전체 평균 불량률</h3>
                            <div class="gauge-container">
                                <canvas id="defectsPerLotGauge"></canvas>
                                <div class="gauge-value">${defectRate}%</div>
                                <div class="gauge-date">${formatDate(new Date())}</div>
                            </div>
                            <div class="gauge-description">전체 생산량 대비 불량 비율</div>
                        </div>

                        <div class="gauge-card">
                            <h3 class="gauge-title">🏆 제품별 불량률 TOP 3</h3>
                            <div class="gauge-container">
                                <canvas id="productTop3Gauge"></canvas>
                                <div class="gauge-value">${productTop3.displayValue}</div>
                                <div class="gauge-date">${productTop3.topProduct}</div>
                            </div>
                            <div class="gauge-description">${productTop3.description}</div>
                        </div>

                        <div class="gauge-card">
                            <h3 class="gauge-title">📊 불량 유형별 분포</h3>
                            <div class="gauge-container">
                                <canvas id="defectTypeGauge"></canvas>
                                <div class="gauge-value">${defectTypeDistribution.displayValue}</div>
                                <div class="gauge-date">${defectTypeDistribution.topType}</div>
                            </div>
                            <div class="gauge-description">${defectTypeDistribution.description}</div>
                        </div>
                    </div>

                    <!-- LOT별 상세 불량률 -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">LOT별 상세 불량률</h2>
                        </div>
                        <div class="table-container">
                            ${lotDefectRateTable}
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon primary">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-label">총 등록 건수</div>
                                <div class="stat-value">${stats.total}</div>
                                <div class="stat-date">누적 데이터</div>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon danger">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-label">총 불량 수량</div>
                                <div class="stat-value">${stats.totalQuantity}</div>
                                <div class="stat-date">전체 합계</div>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon success">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-label">오늘 등록 건수</div>
                                <div class="stat-value">${stats.todayDefects}</div>
                                <div class="stat-date">${formatDate(new Date())}</div>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon warning">
                                <i class="fas fa-chart-pie"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-label">주요 불량 유형</div>
                                <div class="stat-value" style="font-size: 1.5rem;">${stats.mostCommonType}</div>
                                <div class="stat-date">최다 발생</div>
                            </div>
                        </div>
                    </div>

                    <!-- Product Defect Rate Comparison Chart -->
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h2 class="card-title">📊 제품별 불량률 비교 (전체 ${this.productNames.length}개 제품)</h2>
                                <div class="card-subtitle">낮을수록 좋음 | 🔴 >10% 🟡 5~10% 🟢 <5%</div>
                            </div>
                        </div>
                        <div class="chart-container" style="height: ${Math.max(400, this.productNames.length * 30)}px;">
                            <canvas id="productComparisonChart"></canvas>
                        </div>
                    </div>

                    <!-- Defect Type Chart -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">불량 유형별 통계</h2>
                        </div>
                        <div class="chart-container" style="height: 400px;">
                            <canvas id="defectChart"></canvas>
                        </div>
                    </div>

                    <!-- Recent Defects -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">최근 등록된 불량</h2>
                            <a href="#list" class="btn btn-outline" data-page="list">
                                전체 보기 <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>등록일</th>
                                        <th>수입일자</th>
                                        <th>제품명</th>
                                        <th>LOT 번호</th>
                                        <th>불량 유형</th>
                                        <th>수량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderRecentDefects(defects.slice(0, 10))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('mainContent').innerHTML = html;

            // Render all charts (게이지 차트에 이미 계산된 값을 전달)
            await this.renderGaugeCharts(defects, stats, defectRate, productTop3, defectTypeDistribution);
            await this.renderProductComparisonChart(defects);
            this.renderDefectTypeChart(stats.typeCount);

            // Add event listeners for product filter
            document.querySelectorAll('.product-filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.selectedProduct = btn.dataset.product;
                    console.log(`✅ 제품 선택: ${this.selectedProduct}`);
                    this.render(); // Re-render with new filter
                });
            });

            // Add event listeners for table rows
            document.querySelectorAll('.data-table tbody tr').forEach(row => {
                row.addEventListener('click', () => {
                    const defectId = row.dataset.id;
                    DefectList.showDetail(defectId);
                });
            });

            document.querySelector('[data-page="list"]')?.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = 'list';
            });

        } catch (error) {
            console.error('Dashboard render error:', error);
            showAlert('대시보드를 불러오는데 실패했습니다.', 'danger');
        }
    },

    getFilteredDefects() {
        // 선택된 제품에 따라 필터링
        if (this.selectedProduct === 'all') {
            return this.allDefects;
        }
        return this.allDefects.filter(d => d.product_name === this.selectedProduct);
    },

    async calculateDefectRate(defects) {
        // 전체 평균 불량률 계산
        // 수입 물량 테이블 기반
        if (defects.length === 0) return 0;
        
        try {
            // 1. 수입 물량 테이블에서 전체 데이터 조회
            const importsResponse = await API.getImports(1, 1000);
            const imports = importsResponse.data;

            // 2. 선택된 제품에 따른 필터링
            let filteredImports = imports;
            if (this.selectedProduct !== 'all') {
                filteredImports = imports.filter(imp => imp.product_name === this.selectedProduct);
            }

            if (filteredImports.length === 0) return 0;

            // 3. 전체 수입 수량 계산
            const totalImportQuantity = filteredImports.reduce((sum, imp) => sum + (imp.import_quantity || 0), 0);

            // 4. 해당 LOT들의 불량 수량 합계
            const lotNumbers = filteredImports.map(imp => imp.lot_number);
            const filteredDefects = defects.filter(d => lotNumbers.includes(d.lot_number));
            const totalDefectQuantity = filteredDefects.reduce((sum, d) => sum + (d.defect_quantity || 0), 0);
            
            if (totalImportQuantity === 0) return 0;
            
            // 5. 불량률 = (불량 수량 / 수입 수량) × 100
            const defectRate = (totalDefectQuantity / totalImportQuantity) * 100;
            return Math.min(Math.round(defectRate * 10) / 10, 100); // 소수점 1자리
        } catch (error) {
            console.error('불량률 계산 실패:', error);
            return 0;
        }
    },

    calculateRecentDefectRate(defects) {
        // 최근 7일간 발생한 불량의 비율
        // 높을수록 최근에 불량이 많이 발생함을 의미
        const now = new Date().getTime();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const recentDefects = defects.filter(d => d.created_at > weekAgo).length;
        
        if (defects.length === 0) return 0;
        return Math.round((recentDefects / defects.length) * 100);
    },

    async calculateDefectRateChange(defects) {
        // 이번 달 vs 지난 달 불량률 비교 (수입 물량 테이블 기반)
        if (defects.length === 0) {
            return {
                displayValue: '0%',
                period: '데이터 없음',
                description: '불량 데이터가 없습니다',
                changeRate: 0
            };
        }

        try {
            // 수입 물량 테이블 조회
            const importsResponse = await API.getImports(1, 1000);
            let imports = importsResponse.data;

            // 선택된 제품에 따른 필터링
            if (this.selectedProduct !== 'all') {
                imports = imports.filter(imp => imp.product_name === this.selectedProduct);
            }

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0-11

            // 이번 달 시작/끝
            const thisMonthStart = new Date(currentYear, currentMonth, 1).getTime();
            const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime();

            // 지난 달 시작/끝
            const lastMonthStart = new Date(currentYear, currentMonth - 1, 1).getTime();
            const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59).getTime();

            // 이번 달 불량률 계산
            const thisMonthDefects = defects.filter(d => {
                const created = d.created_at;
                return created >= thisMonthStart && created <= thisMonthEnd;
            });
            const thisMonthLotNumbers = imports
                .filter(imp => {
                    const importDate = new Date(imp.import_date).getTime();
                    return importDate >= thisMonthStart && importDate <= thisMonthEnd;
                })
                .map(imp => imp.lot_number);
            const thisMonthFilteredDefects = thisMonthDefects.filter(d => thisMonthLotNumbers.includes(d.lot_number));
            const thisMonthTotalDefects = thisMonthFilteredDefects.reduce((sum, d) => sum + (d.defect_quantity || 0), 0);
            const thisMonthTotalImport = imports
                .filter(imp => thisMonthLotNumbers.includes(imp.lot_number))
                .reduce((sum, imp) => sum + (imp.import_quantity || 0), 0);
            const thisMonthRate = thisMonthTotalImport > 0 ? (thisMonthTotalDefects / thisMonthTotalImport) * 100 : 0;

            // 지난 달 불량률 계산
            const lastMonthDefects = defects.filter(d => {
                const created = d.created_at;
                return created >= lastMonthStart && created <= lastMonthEnd;
            });
            const lastMonthLotNumbers = imports
                .filter(imp => {
                    const importDate = new Date(imp.import_date).getTime();
                    return importDate >= lastMonthStart && importDate <= lastMonthEnd;
                })
                .map(imp => imp.lot_number);
            const lastMonthFilteredDefects = lastMonthDefects.filter(d => lastMonthLotNumbers.includes(d.lot_number));
            const lastMonthTotalDefects = lastMonthFilteredDefects.reduce((sum, d) => sum + (d.defect_quantity || 0), 0);
            const lastMonthTotalImport = imports
                .filter(imp => lastMonthLotNumbers.includes(imp.lot_number))
                .reduce((sum, imp) => sum + (imp.import_quantity || 0), 0);
            const lastMonthRate = lastMonthTotalImport > 0 ? (lastMonthTotalDefects / lastMonthTotalImport) * 100 : 0;

            // 변화율 계산
            let changeRate = 0;
            let displayValue = '';
            let description = '';

            if (lastMonthRate === 0) {
                if (thisMonthRate === 0) {
                    changeRate = 0;
                    displayValue = '0%';
                    description = '불량 없음 유지';
                } else {
                    changeRate = 100;
                    displayValue = '신규';
                    description = '이번 달 첫 불량 발생';
                }
            } else {
                changeRate = ((thisMonthRate - lastMonthRate) / lastMonthRate) * 100;
                
                if (changeRate > 0) {
                    displayValue = `+${Math.round(changeRate)}%`;
                    description = `지난 달 대비 ${Math.round(changeRate)}% 증가 (악화)`;
                } else if (changeRate < 0) {
                    displayValue = `${Math.round(changeRate)}%`;
                    description = `지난 달 대비 ${Math.abs(Math.round(changeRate))}% 감소 (개선)`;
                } else {
                    displayValue = '0%';
                    description = '지난 달과 동일';
                }
            }

            // 기간 정보
            const lastMonthName = `${currentMonth === 0 ? currentYear - 1 : currentYear}-${String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0')}`;
            const thisMonthName = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
            const period = `${lastMonthName} → ${thisMonthName}`;

            return {
                displayValue,
                period,
                description,
                changeRate,
                thisMonthRate: Math.round(thisMonthRate * 10) / 10,
                lastMonthRate: Math.round(lastMonthRate * 10) / 10
            };
        } catch (error) {
            console.error('불량률 변화 계산 실패:', error);
            return {
                displayValue: '오류',
                period: '계산 실패',
                description: '데이터 조회 오류',
                changeRate: 0
            };
        }
    },

    async calculateProductTop3(defects) {
        // 제품별 불량률 TOP 3 계산
        if (defects.length === 0) {
            return {
                displayValue: '0%',
                topProduct: '데이터 없음',
                description: '등록된 불량이 없습니다',
                top3: []
            };
        }

        try {
            // 수입 물량 테이블 조회
            const importsResponse = await API.getImports(1, 1000);
            let imports = importsResponse.data;

            // 선택된 제품 필터링 (all이 아닌 경우)
            if (this.selectedProduct !== 'all') {
                imports = imports.filter(imp => imp.product_name === this.selectedProduct);
            }

            // 제품별 그룹화
            const productGroups = {};
            
            imports.forEach(imp => {
                const productName = imp.product_name;
                if (!productName) return;

                if (!productGroups[productName]) {
                    productGroups[productName] = {
                        product_name: productName,
                        import_quantity: 0,
                        defect_quantity: 0,
                        defect_count: 0
                    };
                }

                productGroups[productName].import_quantity += imp.import_quantity || 0;
            });

            // 불량 데이터 추가
            defects.forEach(defect => {
                const productName = defect.product_name;
                if (!productName || !productGroups[productName]) return;

                productGroups[productName].defect_quantity += defect.defect_quantity || 0;
                productGroups[productName].defect_count += 1;
            });

            // 배열로 변환 및 불량률 계산
            const productArray = Object.values(productGroups).map(product => {
                const defectRate = product.import_quantity > 0
                    ? (product.defect_quantity / product.import_quantity) * 100
                    : 0;
                return {
                    ...product,
                    defect_rate: Math.round(defectRate * 10) / 10
                };
            });

            // 불량률 기준 내림차순 정렬
            productArray.sort((a, b) => b.defect_rate - a.defect_rate);

            // TOP 3 추출
            const top3 = productArray.slice(0, 3);

            if (top3.length === 0) {
                return {
                    displayValue: '0%',
                    topProduct: '데이터 없음',
                    description: '제품 데이터가 없습니다',
                    top3: []
                };
            }

            // 1위 제품 정보
            const topProduct = top3[0];
            const displayValue = `${topProduct.defect_rate}%`;
            const description = `1위: ${topProduct.product_name} | 2위: ${top3[1]?.product_name || '-'} | 3위: ${top3[2]?.product_name || '-'}`;

            return {
                displayValue,
                topProduct: topProduct.product_name,
                description,
                top3,
                gaugeValue: topProduct.defect_rate
            };
        } catch (error) {
            console.error('제품별 불량률 TOP 3 계산 실패:', error);
            return {
                displayValue: '오류',
                topProduct: '계산 실패',
                description: '데이터 조회 오류',
                top3: []
            };
        }
    },

    calculateDefectTypeDistribution(defects) {
        // 불량 유형별 분포 계산
        if (defects.length === 0) {
            return {
                displayValue: '0%',
                topType: '데이터 없음',
                description: '등록된 불량이 없습니다',
                distribution: []
            };
        }

        try {
            // 불량 유형별 그룹화
            const typeGroups = {};
            let totalDefectQuantity = 0;

            defects.forEach(defect => {
                const defectType = defect.defect_type || '미분류';
                const quantity = defect.defect_quantity || 0;

                if (!typeGroups[defectType]) {
                    typeGroups[defectType] = {
                        type: defectType,
                        count: 0,
                        quantity: 0
                    };
                }

                typeGroups[defectType].count += 1;
                typeGroups[defectType].quantity += quantity;
                totalDefectQuantity += quantity;
            });

            // 배열로 변환 및 비율 계산
            const distributionArray = Object.values(typeGroups).map(group => {
                const percentage = totalDefectQuantity > 0
                    ? (group.quantity / totalDefectQuantity) * 100
                    : 0;
                return {
                    ...group,
                    percentage: Math.round(percentage * 10) / 10
                };
            });

            // 비율 기준 내림차순 정렬
            distributionArray.sort((a, b) => b.percentage - a.percentage);

            // TOP 3 추출
            const top3 = distributionArray.slice(0, 3);

            if (top3.length === 0) {
                return {
                    displayValue: '0%',
                    topType: '데이터 없음',
                    description: '불량 유형 데이터가 없습니다',
                    distribution: []
                };
            }

            // 1위 불량 유형 정보
            const topType = top3[0];
            const displayValue = `${topType.percentage}%`;
            const description = `1위: ${topType.type} | 2위: ${top3[1]?.type || '-'} | 3위: ${top3[2]?.type || '-'}`;

            return {
                displayValue,
                topType: topType.type,
                description,
                distribution: top3,
                gaugeValue: topType.percentage
            };
        } catch (error) {
            console.error('불량 유형별 분포 계산 실패:', error);
            return {
                displayValue: '오류',
                topType: '계산 실패',
                description: '데이터 조회 오류',
                distribution: []
            };
        }
    },

    async renderGaugeCharts(defects, stats, defectRate, productTop3, defectTypeDistribution) {
        // 이미 계산된 값들을 사용
        // 1. 전체 평균 불량률 Gauge (낮을수록 좋음)
        this.createGaugeChart('defectsPerLotGauge', defectRate, 'inverse');
        
        // 2. 제품별 불량률 TOP 3 Gauge (낮을수록 좋음)
        const productGaugeValue = productTop3.gaugeValue || 0;
        this.createGaugeChart('productTop3Gauge', productGaugeValue, 'inverse');
        
        // 3. 불량 유형별 분포 Gauge (높을수록 해당 유형이 많음 - normal)
        const typeGaugeValue = defectTypeDistribution.gaugeValue || 0;
        this.createGaugeChart('defectTypeGauge', typeGaugeValue, 'normal');
    },

    createGaugeChart(canvasId, value, type = 'normal') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const data = {
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [
                    this.getGaugeColor(value, type),
                    '#f0f0f0'
                ],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    },

    getGaugeColor(value, type = 'normal') {
        // type: 'normal' = 높을수록 좋음 (품질 점수)
        // type: 'inverse' = 낮을수록 좋음 (불량 개수, 불량 비율)
        
        if (type === 'inverse') {
            // 낮을수록 좋음 (역순)
            if (value <= 40) return '#22c55e'; // 낮음 = 좋음 (초록)
            if (value <= 80) return '#f59e0b'; // 중간 = 주의 (노랑)
            return '#ef4444'; // 높음 = 나쁨 (빨강)
        } else {
            // 높을수록 좋음 (정순)
            if (value >= 80) return '#22c55e'; // 높음 = 좋음 (초록)
            if (value >= 40) return '#f59e0b'; // 중간 = 주의 (노랑)
            return '#ef4444'; // 낮음 = 나쁨 (빨강)
        }
    },

    async renderProductComparisonChart(defects) {
        const ctx = document.getElementById('productComparisonChart');
        if (!ctx) return;

        try {
            // 수입 물량 테이블 조회
            const importsResponse = await API.getImports(1, 1000);
            let imports = importsResponse.data;

            // 선택된 제품 필터링
            if (this.selectedProduct !== 'all') {
                imports = imports.filter(imp => imp.product_name === this.selectedProduct);
            }

            // 제품별 그룹화
            const productGroups = {};
            
            imports.forEach(imp => {
                const productName = imp.product_name;
                if (!productName) return;

                if (!productGroups[productName]) {
                    productGroups[productName] = {
                        product_name: productName,
                        import_quantity: 0,
                        defect_quantity: 0,
                        defect_count: 0
                    };
                }

                productGroups[productName].import_quantity += imp.import_quantity || 0;
            });

            // 불량 데이터 추가
            defects.forEach(defect => {
                const productName = defect.product_name;
                if (!productName || !productGroups[productName]) return;

                productGroups[productName].defect_quantity += defect.defect_quantity || 0;
                productGroups[productName].defect_count += 1;
            });

            // 배열로 변환 및 불량률 계산
            const productArray = Object.values(productGroups).map(product => {
                const defectRate = product.import_quantity > 0
                    ? (product.defect_quantity / product.import_quantity) * 100
                    : 0;
                return {
                    ...product,
                    defect_rate: Math.round(defectRate * 10) / 10
                };
            });

            // 불량률 기준 내림차순 정렬 (높은 순)
            productArray.sort((a, b) => b.defect_rate - a.defect_rate);

            if (productArray.length === 0) {
                ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
                return;
            }

            // 차트 데이터 준비
            const labels = productArray.map(p => p.product_name);
            const data = productArray.map(p => p.defect_rate);
            
            // 색상 결정 함수
            const getBarColor = (rate) => {
                if (rate > 10) return 'rgba(220, 38, 38, 0.8)';      // 빨강 (심각)
                if (rate > 5) return 'rgba(251, 191, 36, 0.8)';      // 노랑 (주의)
                return 'rgba(34, 197, 94, 0.8)';                     // 초록 (양호)
            };

            const getBorderColor = (rate) => {
                if (rate > 10) return '#dc2626';
                if (rate > 5) return '#f59e0b';
                return '#22c55e';
            };

            const backgroundColors = data.map(rate => getBarColor(rate));
            const borderColors = data.map(rate => getBorderColor(rate));

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '불량률 (%)',
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y', // 가로 막대 차트
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13
                            },
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const product = productArray[context.dataIndex];
                                    return [
                                        `불량률: ${product.defect_rate}%`,
                                        `불량 수량: ${product.defect_quantity}개`,
                                        `수입 수량: ${product.import_quantity}개`,
                                        `불량 건수: ${product.defect_count}건`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: Math.max(15, Math.max(...data) + 2), // 최소 15%, 최대값+2
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                },
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            }
                        },
                        y: {
                            ticks: {
                                font: {
                                    size: 12,
                                    weight: '500'
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

            console.log(`✅ 제품별 불량률 비교 차트 렌더링 완료 (${productArray.length}개 제품)`);
        } catch (error) {
            console.error('제품별 불량률 비교 차트 렌더링 실패:', error);
        }
    },

    renderProcessControlChart(defects) {
        const ctx = document.getElementById('processControlChart');
        if (!ctx) return;

        // Group by month (created_at 등록일 기준)
        const monthlyData = {};
        defects.forEach(d => {
            const date = new Date(d.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { 
                    defectCount: 0,      // 불량 건수
                    defectQuantity: 0     // 불량 수량
                };
            }
            monthlyData[monthKey].defectCount += 1;
            monthlyData[monthKey].defectQuantity += d.defect_quantity;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        
        // 레이블 생성 (년-월 형식)
        const labels = sortedMonths.map(m => {
            const [year, month] = m.split('-');
            return `${year.substring(2)}년 ${month}월`;
        });
        
        // 불량 건수와 불량 수량 데이터
        const defectCountData = sortedMonths.map(m => monthlyData[m].defectCount);
        const defectQuantityData = sortedMonths.map(m => monthlyData[m].defectQuantity);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '불량 건수',
                        data: defectCountData,
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: '불량 수량',
                        data: defectQuantityData,
                        backgroundColor: 'rgba(239, 68, 68, 0.6)',
                        borderColor: '#ef4444',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 13,
                                weight: '500'
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            afterLabel: function(context) {
                                if (context.datasetIndex === 0) {
                                    return '등록된 불량 항목 수';
                                } else {
                                    return '총 불량 제품 개수';
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '불량 건수',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '불량 수량',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    },

    renderDefectTypeChart(typeCount) {
        const ctx = document.getElementById('defectChart');
        if (!ctx) return;

        const labels = Object.keys(typeCount);
        const data = Object.values(typeCount);

        const colors = [
            '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
            '#14b8a6', '#a855f7'
        ];

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '발생 건수',
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    },

    renderRecentDefects(defects) {
        if (defects.length === 0) {
            return `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>등록된 불량 정보가 없습니다.</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return defects.map(defect => `
            <tr data-id="${defect.id}">
                <td>${formatDateTime(defect.created_at)}</td>
                <td>${defect.import_date}</td>
                <td>${defect.product_name}</td>
                <td>${defect.lot_number}</td>
                <td><span class="badge badge-danger">${defect.defect_type}</span></td>
                <td><strong>${defect.defect_quantity}</strong></td>
            </tr>
        `).join('');
    },

    async renderLotDefectRateTable(defects) {
        if (defects.length === 0) {
            return '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">데이터가 없습니다.</p>';
        }
        
        try {
            // 수입 물량 테이블에서 데이터 조회
            const importsResponse = await API.getImports(1, 1000);
            let imports = importsResponse.data;

            // 선택된 제품에 따른 필터링
            if (this.selectedProduct !== 'all') {
                imports = imports.filter(imp => imp.product_name === this.selectedProduct);
            }

            if (imports.length === 0) {
                return '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">해당 제품의 수입 물량 데이터가 없습니다.</p>';
            }

            // 각 LOT별로 불량 데이터 집계
            const lotData = imports.map(imp => {
                const lotDefects = defects.filter(d => d.lot_number === imp.lot_number);
                const defect_count = lotDefects.length;
                const defect_quantity = lotDefects.reduce((sum, d) => sum + (d.defect_quantity || 0), 0);
                const defect_rate = imp.import_quantity > 0 
                    ? ((defect_quantity / imp.import_quantity) * 100).toFixed(1)
                    : '0.0';

                return {
                    lot_number: imp.lot_number,
                    product_name: imp.product_name,
                    import_quantity: imp.import_quantity,
                    defect_count,
                    defect_quantity,
                    defect_rate: parseFloat(defect_rate)
                };
            });

            // 불량률 높은 순으로 정렬
            lotData.sort((a, b) => b.defect_rate - a.defect_rate);

            // 전체 합계 계산
            const totalImportQuantity = lotData.reduce((sum, lot) => sum + lot.import_quantity, 0);
            const totalDefectCount = lotData.reduce((sum, lot) => sum + lot.defect_count, 0);
            const totalDefectQuantity = lotData.reduce((sum, lot) => sum + lot.defect_quantity, 0);
            const totalDefectRate = totalImportQuantity > 0 
                ? ((totalDefectQuantity / totalImportQuantity) * 100).toFixed(1)
                : '0.0';

            // 테이블 생성
            let html = `
                <div class="lot-defect-table-container">
                    <table class="lot-defect-table">
                        <thead>
                            <tr>
                                <th>LOT 번호</th>
                                <th>제품명</th>
                                <th>불량 건수</th>
                                <th>불량 수량</th>
                                <th>수입 수량</th>
                                <th>불량률(%)</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            lotData.forEach(lot => {
                const status = this.getDefectRateStatus(lot.defect_rate);
                html += `
                    <tr>
                        <td>
                            <strong>${lot.lot_number}</strong>
                        </td>
                        <td title="${lot.product_name}">
                            ${lot.product_name}
                        </td>
                        <td>
                            <span>${lot.defect_count}건</span>
                        </td>
                        <td>
                            <strong style="color: #dc3545; font-size: 1.1rem;">${lot.defect_quantity}개</strong>
                        </td>
                        <td>
                            <span>${lot.import_quantity}개</span>
                        </td>
                        <td>
                            <strong style="font-size: 1.15rem;">${lot.defect_rate}%</strong>
                        </td>
                        <td>
                            <span class="badge ${status.class}">
                                ${status.label} ${status.icon}
                            </span>
                        </td>
                    </tr>
                `;
            });

            // 합계 행
            html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2">전체 합계</td>
                            <td>${totalDefectCount}건</td>
                            <td><strong style="color: #dc3545;">${totalDefectQuantity}개</strong></td>
                            <td>${totalImportQuantity}개</td>
                            <td><strong>${totalDefectRate}%</strong></td>
                            <td>-</td>
                        </tr>
                    </tfoot>
                </table>
                </div>
            `;

            return html;
        } catch (error) {
            console.error('LOT 테이블 렌더링 실패:', error);
            return '<p style="text-align: center; color: #dc3545; padding: 40px;">데이터 로드 실패</p>';
        }
    },

    getDefectRateStatus(rate) {
        if (rate <= 5) {
            return { 
                label: '우수', 
                class: 'badge-success',
                icon: '🟢'
            };
        } else if (rate <= 15) {
            return { 
                label: '주의', 
                class: 'badge-warning',
                icon: '🟡'
            };
        } else {
            return { 
                label: '심각', 
                class: 'badge-danger',
                icon: '🔴'
            };
        }
    }
};
