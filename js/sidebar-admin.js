// 檔案跟sidebar.js一樣

// 切換 sidebar 狀態
function toggleSidebar() {
    const sidebar = document.getElementById('sidebarArea');
    if (!sidebar) return;

    sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed');
}

// 點擊事件監聽
document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('sidebarArea');
    if (!sidebar) return;

    const toggleBtn = document.getElementById('sidebarToggle');

    // 1. 點擊漢堡按鈕 → 永遠切換（展開 ↔ 收合）
    if (toggleBtn && toggleBtn.contains(e.target)) {
        e.stopPropagation();
        toggleSidebar();
        return;
    }

    // 2. 不在 sidebar 範圍內 → 什麼都不做
    if (!sidebar.contains(e.target)) {
        return;
    }

    // ───────────── 無論展開或收合，只要點在 sidebar 內 ─────────────

    // 定義互動元素：這些被點擊時不觸發 toggle，讓它們執行原本功能
    const interactiveSelectors = [
        '.nav-link',                    // 所有導航連結
        '.nav-item a',                  // nav-item 內的連結
        'a[href]',                      // 任何有跳轉的連結
        '.btn-history',                 // 歷史的 ... 按鈕
        '[data-bs-toggle]',             // bootstrap dropdown、tooltip 等
        '.dropdown',                    // dropdown 容器
        '.dropdown-item',               // dropdown 選項
        '.btn-show-more',               // 顯示更多按鈕
        '.ai-app-title'                 // 如果有 AI 應用標題
    ].join(',');

    // 如果點擊的是互動元素 → 不觸發 toggle
    if (e.target.closest(interactiveSelectors)) {
        return;
    }

    // 其他情況（點 logo、頂部空白、hr、nav-title、分隔線、sidebar 空白處等）
    // → 都觸發 toggle（展開 → 收合；收合 → 展開）
    toggleSidebar();
});


