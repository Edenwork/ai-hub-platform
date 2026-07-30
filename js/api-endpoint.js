document.addEventListener('DOMContentLoaded', function () {
  const statusBox = document.querySelector('.status-box');
  const statusLabel = statusBox.querySelector('label.form-check-label');
  const toggleInput = statusBox.querySelector('input.form-check-input');
  const endpointBox = document.querySelector('.endpoint-url-box');
  const endpointLabel = endpointBox.querySelector('label.form-check-label');

  // 預設隱藏 endpoint-url-box
  endpointBox.style.display = 'none';

  let isEnabled = false;

  // 只在點擊切換開關時觸發
  toggleInput.addEventListener('click', function (e) {
    e.stopPropagation();

    if (!isEnabled) {
      statusLabel.textContent = '狀態：啟用中';
      statusLabel.style.color = '#ffffff';
      statusBox.style.backgroundColor = '#004693';

      endpointBox.style.backgroundColor = '#004693';
      endpointLabel.style.color = '#ffffff';
      endpointBox.style.display = 'block';
    } else {
      statusLabel.textContent = '狀態：未啟用';
      statusLabel.style.color = '#333';
      statusBox.style.backgroundColor = '#F1F1F1';

      endpointBox.style.backgroundColor = '#F1F1F1';
      endpointLabel.style.color = '#333';
      endpointBox.style.display = 'none';
    }
    isEnabled = !isEnabled;
  });
});
