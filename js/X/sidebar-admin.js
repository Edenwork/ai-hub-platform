$(function () {
    const tryBind = () => {
        const $btn = $('#sidebarToggle');
        const $sidebar = $('#sidebarArea');

        if ($btn.length && $sidebar.length) {
            $btn.off('click.adminSidebar').on('click.adminSidebar', function () {
                $sidebar.toggleClass('collapsed');
                $('body').toggleClass('sidebar-collapsed');
            });
            console.log('管理員側邊欄收合功能已啟用');
            return true;
        }
        return false;
    };

    // 立即嘗試一次
    if (!tryBind()) {
        // 如果還沒載入完，每 100ms 再試一次，最多等 4 秒
        const timer = setInterval(() => {
            if (tryBind()) clearInterval(timer);
        }, 100);
        setTimeout(() => clearInterval(timer), 4000);
    }
});