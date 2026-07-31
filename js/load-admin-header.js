document.addEventListener('DOMContentLoaded', function() {
    // 使用 Fetch API 載入 header-admin.html
    fetch('header-admin.html')
        .then(response => response.text())
        .then(data => {
            // 將載入的內容插入到 header-admin-placeholder 中
            const headerPlaceholder = document.getElementById('header-admin-placeholder');
            if (!headerPlaceholder) return;
            headerPlaceholder.innerHTML = data;

            // 載入完成後，綁定「登出」按鈕的事件
            const logoutLink = document.querySelector('.logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault(); // 阻止預設導向行為
                    console.log('正在登出...');
                    // 模擬登出邏輯（例如清除 session 或 token）
                    // localStorage.removeItem('userToken');
                    // 導向到 sign-in.html
                    window.location.href = 'sign-in.html';
                });
            }
        })
        .catch(error => {
            console.error('載入 header-admin.html 失敗:', error);
        });
});