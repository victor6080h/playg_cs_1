// Auto Backup System for LocalStorage
// 자동 백업 시스템 - Firebase 설정 전까지 데이터 보호

const AutoBackup = {
    // 백업 간격 (밀리초) - 기본 30분
    BACKUP_INTERVAL: 30 * 60 * 1000,
    
    // 마지막 백업 시간
    lastBackupTime: null,
    
    // 백업 타이머 ID
    backupTimer: null,
    
    // 초기화
    init() {
        console.log('🔄 자동 백업 시스템 초기화...');
        
        // 마지막 백업 시간 불러오기
        this.lastBackupTime = localStorage.getItem('last_backup_time');
        
        // 페이지 로드 시 백업 상태 확인
        this.checkBackupStatus();
        
        // 주기적 백업 시작
        this.startAutoBackup();
        
        // 페이지 닫기 전 백업
        window.addEventListener('beforeunload', () => {
            this.createBackup(true);
        });
        
        console.log('✅ 자동 백업 시스템 활성화 (30분마다 백업)');
    },
    
    // 백업 상태 확인
    checkBackupStatus() {
        const defects = JSON.parse(localStorage.getItem('defects') || '[]');
        const imports = JSON.parse(localStorage.getItem('imports') || '[]');
        
        if (defects.length === 0 && imports.length === 0) {
            console.log('ℹ️ 백업할 데이터가 없습니다.');
            return;
        }
        
        if (this.lastBackupTime) {
            const lastBackup = new Date(parseInt(this.lastBackupTime));
            const now = new Date();
            const hoursSinceBackup = (now - lastBackup) / (1000 * 60 * 60);
            
            if (hoursSinceBackup > 24) {
                console.warn('⚠️ 마지막 백업이 24시간 이상 경과했습니다!');
                this.showBackupWarning();
            } else {
                console.log(`✅ 마지막 백업: ${this.formatDate(lastBackup)}`);
            }
        } else {
            console.warn('⚠️ 백업 기록이 없습니다. 지금 백업을 권장합니다!');
            this.showBackupWarning();
        }
    },
    
    // 백업 경고 표시
    showBackupWarning() {
        const banner = document.createElement('div');
        banner.id = 'backup-warning-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
            color: white;
            padding: 15px 20px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        banner.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="flex: 1; text-align: left;">
                    <strong style="font-size: 16px;">⚠️ 데이터 백업 필요!</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.95;">
                        중요한 데이터가 손실될 수 있습니다. 지금 바로 백업하거나 Firebase를 설정하세요.
                    </p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="AutoBackup.downloadBackup()" style="
                        background: white;
                        color: #dc2626;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        💾 지금 백업
                    </button>
                    <button onclick="document.getElementById('backup-warning-banner').remove()" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid white;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        닫기
                    </button>
                </div>
            </div>
        `;
        
        // 기존 배너가 있으면 제거
        const existingBanner = document.getElementById('backup-warning-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        document.body.appendChild(banner);
    },
    
    // 주기적 백업 시작
    startAutoBackup() {
        // 기존 타이머가 있으면 정리
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        
        // 30분마다 자동 백업
        this.backupTimer = setInterval(() => {
            this.createBackup(false);
        }, this.BACKUP_INTERVAL);
    },
    
    // 백업 생성
    createBackup(silent = false) {
        try {
            const defects = JSON.parse(localStorage.getItem('defects') || '[]');
            const imports = JSON.parse(localStorage.getItem('imports') || '[]');
            
            if (defects.length === 0 && imports.length === 0) {
                if (!silent) {
                    console.log('ℹ️ 백업할 데이터가 없습니다.');
                }
                return;
            }
            
            // 백업 데이터를 LocalStorage에 저장
            const backupData = {
                defects: defects,
                imports: imports,
                backupDate: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem('backup_data', JSON.stringify(backupData));
            localStorage.setItem('last_backup_time', Date.now().toString());
            
            this.lastBackupTime = Date.now().toString();
            
            if (!silent) {
                console.log('✅ 백업 완료:', this.formatDate(new Date()));
            }
        } catch (error) {
            console.error('❌ 백업 실패:', error);
        }
    },
    
    // 백업 파일 다운로드
    downloadBackup() {
        try {
            const defects = JSON.parse(localStorage.getItem('defects') || '[]');
            const imports = JSON.parse(localStorage.getItem('imports') || '[]');
            
            if (defects.length === 0 && imports.length === 0) {
                alert('백업할 데이터가 없습니다.');
                return;
            }
            
            const backupData = {
                defects: defects,
                imports: imports,
                backupDate: new Date().toISOString(),
                version: '1.0',
                totalDefects: defects.length,
                totalImports: imports.length
            };
            
            // JSON 파일 생성
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const now = new Date();
            const filename = `backup_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.json`;
            
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
            
            // 백업 시간 기록
            localStorage.setItem('last_backup_time', Date.now().toString());
            this.lastBackupTime = Date.now().toString();
            
            // 경고 배너 제거
            const banner = document.getElementById('backup-warning-banner');
            if (banner) {
                banner.remove();
            }
            
            alert(`✅ 백업 완료!\n\n파일명: ${filename}\n불량 데이터: ${defects.length}건\n수입 물량: ${imports.length}건`);
            
            console.log('✅ 백업 다운로드 완료:', filename);
        } catch (error) {
            console.error('❌ 백업 다운로드 실패:', error);
            alert('백업 다운로드에 실패했습니다. 콘솔을 확인하세요.');
        }
    },
    
    // 백업 복원
    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;
                
                const text = await file.text();
                const backup = JSON.parse(text);
                
                // 백업 데이터 검증
                if (!backup.defects || !backup.imports) {
                    alert('❌ 올바른 백업 파일이 아닙니다.');
                    return;
                }
                
                // 현재 데이터 확인
                const currentDefects = JSON.parse(localStorage.getItem('defects') || '[]');
                const currentImports = JSON.parse(localStorage.getItem('imports') || '[]');
                
                let confirmMsg = `백업 데이터를 복원하시겠습니까?\n\n`;
                confirmMsg += `[백업 파일]\n`;
                confirmMsg += `- 불량 데이터: ${backup.defects.length}건\n`;
                confirmMsg += `- 수입 물량: ${backup.imports.length}건\n`;
                confirmMsg += `- 백업 날짜: ${new Date(backup.backupDate).toLocaleString()}\n\n`;
                confirmMsg += `[현재 데이터]\n`;
                confirmMsg += `- 불량 데이터: ${currentDefects.length}건\n`;
                confirmMsg += `- 수입 물량: ${currentImports.length}건\n\n`;
                confirmMsg += `⚠️ 현재 데이터는 덮어씌워집니다!`;
                
                if (!confirm(confirmMsg)) {
                    return;
                }
                
                // 데이터 복원
                localStorage.setItem('defects', JSON.stringify(backup.defects));
                localStorage.setItem('imports', JSON.stringify(backup.imports));
                localStorage.setItem('last_backup_time', Date.now().toString());
                
                alert('✅ 복원 완료! 페이지를 새로고침합니다.');
                location.reload();
                
            } catch (error) {
                console.error('❌ 복원 실패:', error);
                alert('복원에 실패했습니다. 파일을 확인하세요.');
            }
        };
        
        input.click();
    },
    
    // 날짜 포맷팅
    formatDate(date) {
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
};

// Firebase가 설정되지 않았을 때만 자동 백업 활성화
if (typeof useFirebase !== 'undefined' && !useFirebase) {
    // 페이지 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AutoBackup.init();
        });
    } else {
        AutoBackup.init();
    }
}

// 전역에서 접근 가능하도록
window.AutoBackup = AutoBackup;
