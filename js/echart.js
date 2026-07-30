// ── 1. 全域配置與共用常數 ──────────────────────────
const GLOBAL_COLORS = ['#307473', '#2F378F', '#47842E', '#25649E', '#83CBC3', '#6f42c1', '#198754', '#fd7e14'];
const NOW = '04/10 16:40';
const charts = {}; 

// ── 2. GPU Usage (第一組) 邏輯 ──────────────────
function generateTimeData() {
    const times = [];
    let current = new Date('2026-03-01 16:00');
    for (let i = 0; i < 144; i++) {
        const h = String(current.getHours()).padStart(2, '0');
        const m = String(current.getMinutes()).padStart(2, '0');
        const d = (current.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                  current.getDate().toString().padStart(2, '0');
        times.push(`${d} ${h}:${m}`);
        current.setMinutes(current.getMinutes() + 10);
    }
    return times;
}
const fullTimeData = generateTimeData();

function generateRandomUsage() {
    return fullTimeData.map((_, index) => {
        if (index < 40) return 0;
        const rand = Math.random();
        if (rand > 0.95) return Math.floor(Math.random() * 70) + 20;
        if (rand > 0.8) return Math.floor(Math.random() * 15);
        return 0;
    });
}

let rawDataGPU = [
    { name: 'llama3.1-8b-32k', data: generateRandomUsage() },
    { name: 'llama3.1-70b-32k', data: generateRandomUsage() },
    { name: 'qwen2.5-3b-inf', data: generateRandomUsage() },
    { name: 'llama3.1-70b-inf', data: generateRandomUsage() },
    { name: 'ffm-embed-v2', data: generateRandomUsage() },
    { name: 'reranker-inf-m', data: generateRandomUsage() }
].map((item, index) => {
    const color = GLOBAL_COLORS[index % GLOBAL_COLORS.length];
    return { ...item, color, max: Math.max(...item.data), mean: parseFloat((item.data.reduce((a,b)=>a+b,0)/item.data.length).toFixed(3)) };
});

let gpuSortState = { key: 'max', asc: false };

function renderGPUTable() {
    const tbody = document.getElementById('stats-body');
    if (!tbody) return;
    tbody.innerHTML = rawDataGPU.map(item => `
        <tr>
            <td><span class="color-dot" style="background:${item.color}"></span><span class="model-name">${item.name}</span></td>
            <td class="text-end fw-bold">${item.max}%</td>
            <td class="text-end text-muted">${item.mean}%</td>
        </tr>
    `).join('');
}

function handleGPUSort(key) {
    if (gpuSortState.key === key) gpuSortState.asc = !gpuSortState.asc;
    else { gpuSortState.key = key; gpuSortState.asc = false; }
    rawDataGPU.sort((a, b) => gpuSortState.asc ? (a[key] > b[key] ? 1 : -1) : (b[key] > a[key] ? 1 : -1));
    renderGPUTable();
}

// ── 3. Dashboard (第二組) 邏輯 ──────────────
const DASHBOARD_DATASETS = {
    tp: { unit: 'T/s', series: [{ name: 'Prompt Tokens/Sec', data: [0, 0, 0, 6, 0] }, { name: 'Generation Tokens/Sec', data: [0, 0, 0, 2, 0] }],
          models: [{ name: 'reranker-inf-m', max: '10%' }, { name: 'ffm-embed-v2', max: '31%' }, { name: 'llama3.1-70b-inf', max: '81.8%' }, { name: 'qwen2.5-3b-inf', max: '89%' }, { name: 'llama3.1-70b-32k', max: '91.9%' }, { name: 'llama3.1-8b-32k', max: '97%' }] },
    e2e: { unit: 's', series: [{ name: 'P99', data: [1.9, 1.9, 1.9, 2.0, 2.0] }, { name: 'P50', data: [0.8, 0.8, 0.8, 0.8, 1.8] }],
           models: [{ name: 'llama3.1-8b-32k', max: '97%' }, { name: 'llama3.1-70b-32k', max: '91.9%' }, { name: 'qwen2.5-3b-inf', max: '89%' }] },
    tpot: { unit: 'ms', series: [{ name: 'P99', data: [50, 50, 50, 50, 50] }, { name: 'Mean', data: [28, 28, 28, 27, 27] }],
            models: [{ name: 'llama3.1-8b-32k', max: '97%' }, { name: 'llama3.1-70b-32k', max: '91.9%' }] }
};

const dashboardSortStates = { tp: {key:'max',asc:false}, e2e:{key:'max',asc:false}, tpot:{key:'max',asc:false} };

function buildDashboardOption(ds) {
    return {
        tooltip: { trigger: 'axis', formatter: p => `<b>${p[0].axisValue}</b><br>` + p.map(x => `${x.marker}${x.seriesName}: <b>${x.value} ${ds.unit}</b>`).join('<br>') },
        grid: { top: 30, left: 10, right: 20, bottom: 10, containLabel: true },
        xAxis: { type: 'category', data: ['10:01','10:02','10:03','10:04','10:05'], axisLabel: { color: '#94a3b8', fontSize: 11 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 11 } },
        series: ds.series.map((s, i) => ({ name: s.name, type: 'line', symbol: 'circle', symbolSize: 6, data: s.data, itemStyle: { color: GLOBAL_COLORS[i] } }))
    };
}

function renderList(id) {
    const ds = DASHBOARD_DATASETS[id];
    if (!ds) return;
    const ss = dashboardSortStates[id];
    const items = [...ds.models];
    items.sort((a,b) => {
        const av = ss.key === 'name' ? a.name : parseFloat(a.max);
        const bv = ss.key === 'name' ? b.name : parseFloat(b.max);
        return ss.asc ? (av > bv ? 1 : -1) : (bv > av ? 1 : -1);
    });
    const el = document.getElementById('list-' + id);
    if (el) {
        el.innerHTML = items.map((m, i) => `
            <div class="model-row">
                <div class="model-name">
                    <div class="dot" style="background:${GLOBAL_COLORS[i % GLOBAL_COLORS.length]}"></div>
                    <span>${m.name}</span>
                </div>
                <div class="model-max">${m.max}</div>
            </div>
        `).join('');
    }
}

function sortTable(id, key) {
    const ss = dashboardSortStates[id];
    if (ss.key === key) ss.asc = !ss.asc;
    else { ss.key = key; ss.asc = false; }
    renderList(id);
}

// ── 4. 統一初始化與自動寬度監控 ──────────────────
window.onload = () => {
    // A. 更新時間
    ['global-updated', 'upd-tp', 'upd-e2e', 'upd-tpot'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'Updated: ' + NOW;
    });

    // B. 初始化監聽器 (當容器寬度改變時自動 resize)
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const chartId = entry.target.dataset.chartKey;
            if (charts[chartId]) {
                charts[chartId].resize();
            }
        }
    });

    // C. 初始化 第一組 (GPU)
    const gpuEl = document.getElementById('chart-container');
    if (gpuEl) {
        gpuEl.dataset.chartKey = 'gpu'; // 綁定 key
        const gpuChart = echarts.init(gpuEl);
        gpuChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { top: 40, left: 10, right: 10, bottom: 20, containLabel: true },
            xAxis: { type: 'category', data: fullTimeData, axisLabel: { interval: 23, color: '#94a3b8' } },
            yAxis: { max: 100, axisLabel: { color: '#94a3b8' } },
            series: rawDataGPU.map(item => ({ name: item.name, type: 'bar', stack: 'total', itemStyle: { color: item.color }, data: item.data }))
        });
        charts['gpu'] = gpuChart;
        resizeObserver.observe(gpuEl); // 開始監聽
        handleGPUSort('max');
    }


    // D. 初始化 第二組 (tp, e2e, tpot)
    ['tp', 'e2e', 'tpot'].forEach(id => {
        const el = document.getElementById('chart-' + id);
        if (el) {
            el.dataset.chartKey = id; // 綁定 key
            const chart = echarts.init(el);
            chart.setOption(buildDashboardOption(DASHBOARD_DATASETS[id]));
            charts[id] = chart;
            resizeObserver.observe(el); // 開始監聽
        }
        
        const leg = document.getElementById('legend-' + id);
        if (leg) {
            leg.innerHTML = DASHBOARD_DATASETS[id].series.map((s, i) => `
                <div class="legend-item"><div class="legend-line" style="background:${GLOBAL_COLORS[i]}"></div>${s.name}</div>
            `).join('');
        }
        renderList(id);
    });
};

// ── Toggle collapse ───────────────────────────────
function toggleCard(id) {
  const body = document.getElementById('body-' + id);
  const chev = document.getElementById('chev-' + id);
  const isOpen = body.classList.toggle('collapsed');
  chev.className = 'chevron ' + (isOpen ? 'closed' : 'open');
  chev.textContent = isOpen ? '▾' : '▾';
  if (!isOpen && charts[id]) charts[id].resize();
}

// 全域掛載 onclick 事件
window.handleGPUSort = handleGPUSort;
window.sortTable = sortTable;