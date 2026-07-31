(function () {
  const demoAccounts = {
    debug: {
      password: 'debug',
      role: 'debug',
      label: 'Debug',
      landingPage: 'index.html'
    },
    admin: {
      password: 'admin',
      role: 'admin',
      label: 'Admin',
      landingPage: 'index.html'
    },
    user: {
      password: 'user',
      role: 'user',
      label: 'User',
      landingPage: 'index.html'
    }
  };

  const form = document.getElementById('demoSignInForm');
  const accountInput = document.getElementById('floatingInput');
  const passwordInput = document.getElementById('floatingPassword');
  const message = document.getElementById('signInMessage');
  const demoButtons = document.querySelectorAll('[data-demo-login]');

  function showMessage(text) {
    if (!message) return;
    message.textContent = text;
    message.classList.remove('d-none');
  }

  function saveDemoSession(accountName) {
    const account = demoAccounts[accountName];
    if (!account) return;

    localStorage.setItem('ffmHubDemoRole', account.role);
    localStorage.setItem('ffmHubDemoAccount', accountName);
    localStorage.setItem('ffmHubDemoLabel', account.label);
    window.location.href = account.landingPage;
  }

  form?.addEventListener('submit', function (event) {
    event.preventDefault();

    const accountName = accountInput?.value.trim().toLowerCase();
    const password = passwordInput?.value;
    const account = demoAccounts[accountName];

    if (!account || account.password !== password) {
      showMessage('帳號或密碼不正確，請使用 Demo 帳號登入。');
      return;
    }

    saveDemoSession(accountName);
  });

  demoButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const accountName = button.dataset.demoLogin;
      saveDemoSession(accountName);
    });
  });
})();
