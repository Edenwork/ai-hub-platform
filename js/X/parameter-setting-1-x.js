// 模型參數設定
document.addEventListener('DOMContentLoaded', () => {
  const modalElement = document.getElementById('modal-parameter-setting');

  function createSliderSync(sliderId, inputId, defaultValue) {
    const slider = modalElement.querySelector(`#${sliderId}`);
    const input = modalElement.querySelector(`#${inputId}`);

    if (!slider || !input) {
      console.warn(`找不到元素: ${sliderId} 或 ${inputId}`);
      return null;
    }

    // 滑桿變動時同步輸入框
    slider.addEventListener('input', () => {
      input.value = slider.value;
    });

    // 輸入框變動時同步滑桿
    input.addEventListener('input', () => {
      let val = parseFloat(input.value);
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);

      if (isNaN(val)) val = defaultValue;
      if (val < min) val = min;
      if (val > max) val = max;

      slider.value = val;
      input.value = val;
    });

    return { slider, input, defaultValue };
  }

  // 初始化所有控制組件
  const controls = {
    temperature: createSliderSync('temp-slider', 'temp-input', 0.5),
    topP: createSliderSync('topp-slider', 'topp-input', 1),
    topK: createSliderSync('topk-slider', 'topk-input', 50),
    frequency: createSliderSync('freq-slider', 'freq-input', 1),
  };

  const tokenInput = modalElement.querySelector('#token-input');
  const tokenDefault = '4096';

  // Modal 顯示時初始化數值
  modalElement.addEventListener('shown.bs.modal', () => {
    Object.values(controls).forEach(c => {
      if (c) {
        c.slider.value = c.defaultValue;
        c.input.value = c.defaultValue;
      }
    });
    if (tokenInput) tokenInput.value = tokenDefault;
  });

  // 重置按鈕事件
  const resetBtn = modalElement.querySelector('#reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.values(controls).forEach(c => {
        if (c) {
          c.slider.value = c.defaultValue;
          c.input.value = c.defaultValue;
        }
      });
      if (tokenInput) tokenInput.value = tokenDefault;
    });
  }

  // 防止輸入框輸入無效字符（可選）
  modalElement.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('keypress', e => {
      if (!/[\d\.\-\+e]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }
    });
  });
});
