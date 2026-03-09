// Local Storage Backup System
const LocalStorage = {
    // 데이터 저장
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`✅ ${key} 데이터 저장 완료`);
        } catch (error) {
            console.error('저장 실패:', error);
        }
    },

    // 데이터 불러오기
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('불러오기 실패:', error);
            return null;
        }
    },

    // 데이터 내보내기 (백업)
    exportData() {
        const exports = {
            defects: this.loadData('defects') || [],
            imports: this.loadData('imports') || [],
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exports, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('✅ 데이터 백업 완료');
    },

    // 데이터 가져오기 (복원)
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveData('defects', data.defects || []);
                    this.saveData('imports', data.imports || []);
                    console.log('✅ 데이터 복원 완료');
                    resolve(data);
                } catch (error) {
                    console.error('복원 실패:', error);
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
};
