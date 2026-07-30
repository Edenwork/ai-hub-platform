// $(function () {
//     $(document).on('click', '#sidebarToggle', function () {
//         $('#sidebarArea').toggleClass('collapsed');
//         $('body').toggleClass('sidebar-collapsed');
//     });
// });



document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('sidebarArea');
    if (!sidebar) return;

    const toggleBtn = document.getElementById('sidebarToggle');
    const isCollapsed = sidebar.classList.contains('collapsed');

    // 1. 點擊漢堡按鈕 → toggle
    if (toggleBtn && toggleBtn.contains(e.target)) {
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
        return;
    }

    // 2. 在收合狀態下，點擊 sidebar 內的任何地方 → 展開
    if (sidebar.contains(e.target) && isCollapsed) {
        // 可選擇：排除某些互動元素（例如 nav-link、dropdown）
        if (e.target.closest('.nav-link, .btn-history, a[href], button:not(#sidebarToggle)')) {
            return; // 讓這些元素正常運作，不要展開
        }

        sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
    }
});

