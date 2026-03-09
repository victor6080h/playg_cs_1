// Utility Functions

// Defect types for dropdown
const DEFECT_TYPES = [
    '전원 불량',
    '피규어 분리',
    'SD카드 불량',
    '액정 멈춤',
    '촬영 불량',
    '화면 불량',
    '버튼 불량',
    '외관 불량',
    '포장 불량',
    '구성품 누락',
    '작동 이상',
    '기타'
];

// Format date to YYYY-MM-DD
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format datetime to readable string
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR');
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const mainContent = document.getElementById('mainContent');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Confirm dialog
function confirmDialog(message) {
    return confirm(message);
}

// File to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Export to Excel
function exportToExcel(data, filename = 'defects_export.xlsx') {
    // Prepare data for export
    const exportData = data.map(item => ({
        '등록일': formatDateTime(item.created_at),
        '수입일자': item.import_date,
        '접수일자': item.received_date || '',
        '제품명': item.product_name,
        '시즌': item.season || '',
        '모델명': item.model_name || '',
        'LOT 번호': item.lot_number,
        '수입 수량': item.import_quantity || '',
        '불량 유형': item.defect_type,
        '불량 설명': item.defect_detail || '',
        '불량 수량': item.defect_quantity,
        '불량률(%)': item.import_quantity ? ((item.defect_quantity / item.import_quantity) * 100).toFixed(1) : '',
        '등록자': item.registrant || '',
        '비고': item.note || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    ws['!cols'] = [
        { wch: 20 }, // 등록일
        { wch: 12 }, // 수입일자
        { wch: 12 }, // 접수일자
        { wch: 30 }, // 제품명
        { wch: 15 }, // 시즌
        { wch: 15 }, // 모델명
        { wch: 15 }, // LOT 번호
        { wch: 12 }, // 수입 수량
        { wch: 15 }, // 불량 유형
        { wch: 40 }, // 불량 설명
        { wch: 10 }, // 불량 수량
        { wch: 12 }, // 불량률
        { wch: 15 }, // 등록자
        { wch: 30 }  // 비고
    ];

    XLSX.utils.book_append_sheet(wb, ws, '불량 목록');
    XLSX.writeFile(wb, filename);
}

// Generate PDF Report with Korean support
async function generatePDFReport(defects, reportInfo) {
    // Create a temporary container for the report
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'absolute';
    reportContainer.style.left = '-9999px';
    reportContainer.style.top = '0';
    reportContainer.style.width = '210mm'; // A4 width
    reportContainer.style.padding = '20mm';
    reportContainer.style.backgroundColor = '#ffffff';
    reportContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Calculate statistics
    const totalQuantity = defects.reduce((sum, d) => sum + d.defect_quantity, 0);
    const typeGroups = {};
    defects.forEach(d => {
        if (!typeGroups[d.defect_type]) {
            typeGroups[d.defect_type] = 0;
        }
        typeGroups[d.defect_type] += d.defect_quantity;
    });
    
    // Build HTML content
    reportContainer.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
                <h1 style="font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">
                    제품 불량 클레임 보고서
                </h1>
                <p style="font-size: 14px; color: #64748b; margin: 0;">
                    Product Defect Claim Report
                </p>
            </div>
            
            <!-- Report Info -->
            <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px;">
                <h2 style="font-size: 18px; font-weight: 600; color: #2563eb; margin: 0 0 15px 0;">
                    기본 정보
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b; width: 150px;">제품명</td>
                        <td style="padding: 8px 0; color: #1e293b;">${reportInfo.product_name || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">수입일자</td>
                        <td style="padding: 8px 0; color: #1e293b;">${reportInfo.import_date || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">LOT 번호</td>
                        <td style="padding: 8px 0; color: #1e293b;">${reportInfo.lot_number || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">검사 기간</td>
                        <td style="padding: 8px 0; color: #1e293b;">${reportInfo.period || '-'}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Defect Summary -->
            <div style="margin-bottom: 30px; background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h2 style="font-size: 18px; font-weight: 600; color: #ef4444; margin: 0 0 15px 0;">
                    불량 요약
                </h2>
                <div style="margin-bottom: 15px;">
                    <span style="font-weight: 600; color: #64748b;">총 불량 수량:</span>
                    <span style="font-size: 24px; font-weight: 700; color: #ef4444; margin-left: 10px;">
                        ${totalQuantity}
                    </span>
                </div>
                
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 15px 0 10px 0;">
                    불량 유형별 수량
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${Object.entries(typeGroups).map(([type, qty]) => `
                        <tr>
                            <td style="padding: 6px 0; color: #1e293b; width: 60%;">
                                <span style="display: inline-block; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></span>
                                ${type}
                            </td>
                            <td style="padding: 6px 0; font-weight: 600; color: #ef4444; text-align: right;">
                                ${qty}개
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            
            <!-- Detailed List -->
            <div style="margin-bottom: 30px;">
                <h2 style="font-size: 18px; font-weight: 600; color: #2563eb; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">
                    상세 목록
                </h2>
                ${defects.map((defect, index) => `
                    <div style="margin-bottom: 15px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #ef4444;">
                        <div style="margin-bottom: 8px;">
                            <span style="display: inline-block; background: #2563eb; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 8px;">
                                ${index + 1}
                            </span>
                            <span style="font-weight: 600; color: #1e293b; font-size: 16px;">
                                ${defect.defect_type}
                            </span>
                            <span style="color: #64748b; margin-left: 10px;">
                                수량: <span style="font-weight: 600; color: #ef4444;">${defect.defect_quantity}개</span>
                            </span>
                        </div>
                        ${defect.defect_detail ? `
                            <div style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 8px;">
                                ${defect.defect_detail}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                    보고서 작성일: ${formatDate(new Date())}
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(reportContainer);
    
    try {
        // Convert HTML to canvas
        const canvas = await html2canvas(reportContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        
        // If content is longer than one page, split it
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297; // A4 height
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 297;
        }
        
        // Save PDF
        const filename = `defect_report_${reportInfo.lot_number || 'all'}_${formatDate(new Date())}.pdf`;
        pdf.save(filename);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    } finally {
        // Remove temporary container
        document.body.removeChild(reportContainer);
    }
}

// Calculate statistics
function calculateStats(defects) {
    const total = defects.length;
    const totalQuantity = defects.reduce((sum, d) => sum + d.defect_quantity, 0);
    
    // Today's defects
    const today = formatDate(new Date());
    const todayDefects = defects.filter(d => {
        const createdDate = formatDate(new Date(d.created_at));
        return createdDate === today;
    }).length;

    // Most common defect type
    const typeCount = {};
    defects.forEach(d => {
        typeCount[d.defect_type] = (typeCount[d.defect_type] || 0) + 1;
    });
    
    let mostCommonType = '없음';
    let maxCount = 0;
    for (const [type, count] of Object.entries(typeCount)) {
        if (count > maxCount) {
            maxCount = count;
            mostCommonType = type;
        }
    }

    return {
        total,
        totalQuantity,
        todayDefects,
        mostCommonType,
        typeCount
    };
}

// Group by LOT and Import Date
function groupByLotAndDate(defects) {
    const groups = {};
    
    defects.forEach(defect => {
        const key = `${defect.import_date}_${defect.lot_number}`;
        if (!groups[key]) {
            groups[key] = {
                import_date: defect.import_date,
                lot_number: defect.lot_number,
                product_name: defect.product_name,
                defects: [],
                totalQuantity: 0,
                typeCount: {}
            };
        }
        
        groups[key].defects.push(defect);
        groups[key].totalQuantity += defect.defect_quantity;
        
        const type = defect.defect_type;
        groups[key].typeCount[type] = (groups[key].typeCount[type] || 0) + defect.defect_quantity;
    });
    
    return Object.values(groups);
}

// Get main defect type
function getMainDefectType(typeCount) {
    let maxType = '';
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(typeCount)) {
        if (count > maxCount) {
            maxCount = count;
            maxType = type;
        }
    }
    
    return maxType || '없음';
}
