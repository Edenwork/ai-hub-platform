document.addEventListener('DOMContentLoaded', function() {
    // 使用 Fetch API 載入 sidebar-admin.html
    fetch('sidebar-admin.html')
        .then(response => response.text())
        .then(data => {
            // 將載入的內容插入到 sidebar-admin-placeholder 中
            document.getElementById('sidebar-admin-placeholder').innerHTML = data;

        })
        .catch(error => {
            console.error('載入 sidebar-admin.html 失敗:', error);
        });
});