(function () {
  const demoKeys = [
    'ffmHubDemoRole',
    'ffmHubDemoAccount',
    'ffmHubDemoLabel'
  ];

  function getDemoRole() {
    const params = new URLSearchParams(window.location.search);
    return params.get('demoRole') || localStorage.getItem('ffmHubDemoRole') || 'debug';
  }

  function resetAiHubDemo() {
    const role = getDemoRole();

    try {
      sessionStorage.clear();
      demoKeys.forEach(function (key) {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Unable to clear AI Hub demo state.', error);
    }

    window.location.replace(`index.html?demoRole=${encodeURIComponent(role)}`);
  }

  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-demo-reset], button, a');
    if (!trigger) return;

    const triggerText = `${trigger.textContent || ''} ${trigger.getAttribute('title') || ''} ${trigger.getAttribute('aria-label') || ''}`.trim();
    const isTextReset = trigger.matches('button, a') && /重新(開始|整理)/.test(triggerText);

    if (!trigger.matches('[data-demo-reset]') && !isTextReset) return;

    event.preventDefault();
    resetAiHubDemo();
  });

  window.resetAiHubDemo = resetAiHubDemo;
})();
