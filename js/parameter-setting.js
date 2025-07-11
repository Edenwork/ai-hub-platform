// 參數拉桿

function initParameterModal() {
  const modal = document.getElementById('modal-parameter-setting');
  if (!modal) return;

  const paramConfigs = [
    { slider: 'temp-slider', input: 'temp-input', defaultValue: 0.5 },
    { slider: 'topp-slider', input: 'topp-input', defaultValue: 1 },
    { slider: 'topk-slider', input: 'topk-input', defaultValue: 50 },
    { slider: 'freq-slider', input: 'freq-input', defaultValue: 1 }
  ];

  // 雙向同步功能
  function bindSliderInput(slider, input, defaultValue) {
    slider.addEventListener('input', function () {
      input.value = slider.value;
    });
    input.addEventListener('input', function () {
      let val = parseFloat(input.value);
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      if (isNaN(val)) val = defaultValue;
      if (val < min) val = min;
      if (val > max) val = max;
      slider.value = val;
      input.value = val;
    });
  }

  const controls = [];
  paramConfigs.forEach(cfg => {
    const slider = modal.querySelector(`#${cfg.slider}`);
    const input = modal.querySelector(`#${cfg.input}`);
    if (slider && input) {
      bindSliderInput(slider, input, cfg.defaultValue);
      controls.push({ slider, input, defaultValue: cfg.defaultValue });
    }
  });

  const tokenInput = modal.querySelector('#token-input');
  const tokenDefault = '4096';

  modal.addEventListener('shown.bs.modal', function () {
    controls.forEach(({ slider, input, defaultValue }) => {
      slider.value = defaultValue;
      input.value = defaultValue;
    });
    if (tokenInput) tokenInput.value = tokenDefault;
  });

  const resetBtn = modal.querySelector('#reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      controls.forEach(({ slider, input, defaultValue }) => {
        slider.value = defaultValue;
        input.value = defaultValue;
      });
      if (tokenInput) tokenInput.value = tokenDefault;
    });
  }
}
