// Firebase Setup Banner
function showFirebaseSetupBanner() {
    // Firebase가 설정되지 않았을 때만 배너 표시
    if (!useFirebase) {
        const banner = document.getElementById('firebaseSetupBanner');
        if (banner) {
            banner.style.display = 'block';
        }
    }
}

// Main Application
const App = {
    currentPage: 'dashboard',

    init() {
        // Firebase 설정 배너 표시
        showFirebaseSetupBanner();
        
        this.setupNavigation();
        this.setupModal();
        this.handleRoute();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
    },

    setupNavigation() {
        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        navToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                window.location.hash = page;
                
                // Close mobile menu
                navMenu.classList.remove('active');
            });
        });
    },

    setupModal() {
        const modal = document.getElementById('detailModal');
        const closeBtn = document.getElementById('closeModal');

        closeBtn?.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close modal when clicking outside
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.currentPage = hash;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === hash) {
                link.classList.add('active');
            }
        });

        // Route to appropriate page
        this.loadPage(hash);
    },

    async loadPage(page) {
        try {
            switch (page) {
                case 'dashboard':
                    await Dashboard.render();
                    break;
                case 'imports':
                    await ImportManagement.render();
                    break;
                case 'register':
                    await DefectRegister.render();
                    break;
                case 'list':
                    await DefectList.render();
                    break;
                case 'summary':
                    await DefectSummary.render();
                    break;
                case 'report':
                    await DefectReport.render();
                    break;
                default:
                    await Dashboard.render();
                    break;
            }
        } catch (error) {
            console.error('Page load error:', error);
            document.getElementById('mainContent').innerHTML = `
                <div class="card">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>페이지를 불러오는데 실패했습니다.</span>
                    </div>
                </div>
            `;
        }
    }
};

// Expose modules globally for debugging and cross-module access
window.DefectList = DefectList;
window.Dashboard = Dashboard;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
