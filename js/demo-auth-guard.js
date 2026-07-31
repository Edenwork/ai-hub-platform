(function () {
  const role = localStorage.getItem('ffmHubDemoRole');
  const validRoles = ['debug', 'admin', 'user'];
  const adminPages = [
    'dashboard.html',
    'install-nemoclaw.html',
    'dashboard-seeAll-user.html',
    'user-manage.html',
    'group-manage.html',
    'group-manage-new.html',
    'group-manage-edit.html',
    'ldap-manage.html',
    'ldap-manage-new.html',
    'ldap-manage-edit.html',
    'model-manage.html',
    'model-manage-disconnected.html',
    'model-manage-setup-all.html',
    'model-manage-setup-assign.html',
    'model-info-page.html',
    'add-model-1-key.html',
    'add-model-2.html',
    'add-model-3.html',
    'ai-agent.html',
    'ai-agent-setup-all.html',
    'ai-agent-setup-assign.html',
    'agent-info-page.html',
    'api-endpoint.html',
    'api-key.html',
    'system-log.html'
  ];

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (!validRoles.includes(role)) {
    window.location.replace('demo.html');
    return;
  }

  if (role === 'user' && adminPages.includes(currentPage)) {
    sessionStorage.setItem('ffmHubDemoNotice', '此帳號沒有此功能權限');
    window.location.replace('index.html');
  }
})();
