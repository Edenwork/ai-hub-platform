(function () {
  const role = localStorage.getItem('ffmHubDemoRole');
  const notice = sessionStorage.getItem('ffmHubDemoNotice');

  function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'demo-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = text;
    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.classList.add('is-visible');
    }, 50);

    window.setTimeout(function () {
      toast.classList.remove('is-visible');
      window.setTimeout(function () {
        toast.remove();
      }, 250);
    }, 3200);
  }

  function bindRestrictedLinks() {
    if (role !== 'user') return;

    document.querySelectorAll('a[href$="dashboard.html"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        showToast('此帳號沒有此功能權限');
      });
    });
  }

  if (notice) {
    sessionStorage.removeItem('ffmHubDemoNotice');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        showToast(notice);
      });
    } else {
      showToast(notice);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindRestrictedLinks);
  } else {
    bindRestrictedLinks();
  }

  window.ffmHubBindRestrictedLinks = bindRestrictedLinks;
})();
