// 檔案跟sidebar.js一樣

// 切換 sidebar 狀態
const SIDEBAR_MOBILE_BREAKPOINT = 768;

function isMobileSidebarViewport() {
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    return viewportWidth <= SIDEBAR_MOBILE_BREAKPOINT;
}

function setSidebarCollapsed(sidebar, shouldCollapse) {
    sidebar.classList.toggle('collapsed', shouldCollapse);
    document.body.classList.toggle('sidebar-collapsed', shouldCollapse);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebarArea');
    if (!sidebar) return;

    const shouldCollapse = !sidebar.classList.contains('collapsed');
    setSidebarCollapsed(sidebar, shouldCollapse);

    if (isMobileSidebarViewport()) {
        sidebar.dataset.mobileState = shouldCollapse ? 'collapsed' : 'expanded';
        return;
    }

    delete sidebar.dataset.mobileState;
    delete sidebar.dataset.mobileCollapsed;
}

function applyResponsiveSidebar() {
    const sidebar = document.getElementById('sidebarArea');
    if (!sidebar) return;

    const isMobile = isMobileSidebarViewport();

    if (isMobile) {
        if (sidebar.dataset.mobileState === 'expanded') {
            setSidebarCollapsed(sidebar, false);
            return;
        }
        setSidebarCollapsed(sidebar, true);
        sidebar.dataset.mobileState = 'collapsed';
        return;
    }

    if (sidebar.dataset.mobileState || sidebar.dataset.mobileCollapsed === 'true') {
        setSidebarCollapsed(sidebar, false);
        delete sidebar.dataset.mobileState;
        delete sidebar.dataset.mobileCollapsed;
    }
}

let sharedSidebarModalsPromise;

function removeLegacySidebarModals() {
    ['modal-system-prompt', 'modal-parameter-setting'].forEach((id) => {
        const modals = document.querySelectorAll(`#${id}`);
        const sharedModal = Array.from(modals).find((modal) => modal.dataset.sharedSidebarModal === 'true');

        if (sharedModal) {
            modals.forEach((modal) => {
                if (modal !== sharedModal) modal.remove();
            });
        }
    });
    initializeSidebarModelSelectors();
}

function setSidebarModelSelectorValue(dropdown, selectedText) {
    if (!dropdown || !selectedText) return;

    const button = dropdown.querySelector('[data-bs-toggle="dropdown"]');
    const label = button?.querySelector('.dropdown-button-label');
    if (!button || !label) return;

    if (label.textContent.trim() !== selectedText) {
        label.textContent = selectedText;
    }
    button.setAttribute('title', selectedText);

    dropdown.querySelectorAll('.dropdown-item').forEach((item) => {
        const isSelected = item.querySelector('.dropdown-text')?.textContent.trim() === selectedText;
        item.classList.toggle('active', isSelected);

        const checkmark = item.querySelector('.checkmark');
        if (checkmark) {
            checkmark.style.display = isSelected ? 'inline-block' : 'none';
        }
    });
}

function initializeSidebarModelSelectors(root = document) {
    const storedModel = localStorage.getItem('selectedChatModel');

    root.querySelectorAll('.modal-model-selector, .chat-model-selector').forEach((dropdown) => {
        const activeText = dropdown.querySelector('.dropdown-item.active .dropdown-text')?.textContent.trim();
        const selectedText = storedModel || activeText;
        if (selectedText) {
            setSidebarModelSelectorValue(dropdown, selectedText);
        }
    });
}

function initializeSidebarParameterModal(root = document) {
    if (typeof window.initParameterModal === 'function') {
        window.initParameterModal(root);
    }
    document.dispatchEvent(new CustomEvent('sidebar:modals-ready', { detail: { root } }));
}

function ensureSharedSidebarModals() {
    if (sharedSidebarModalsPromise) {
        return sharedSidebarModalsPromise;
    }

    sharedSidebarModalsPromise = fetch('sidebar-user.html')
        .then((response) => {
            if (!response.ok) throw new Error('無法載入共用 sidebar modal');
            return response.text();
        })
        .then((html) => {
            const sourceDocument = new DOMParser().parseFromString(html, 'text/html');
            const modalIds = ['modal-system-prompt', 'modal-parameter-setting'];

            modalIds.forEach((id) => {
                const sourceModal = sourceDocument.getElementById(id);
                if (!sourceModal) throw new Error(`共用 modal 不存在：${id}`);

                document.querySelectorAll(`#${id}`).forEach((modal) => modal.remove());
                const sharedModal = document.importNode(sourceModal, true);
                sharedModal.dataset.sharedSidebarModal = 'true';
                document.body.appendChild(sharedModal);
                initializeSidebarModelSelectors(sharedModal);
                if (id === 'modal-parameter-setting') {
                    initializeSidebarParameterModal(sharedModal);
                }
            });

            removeLegacySidebarModals();
        })
        .catch((error) => {
            sharedSidebarModalsPromise = null;
            console.error(error);
            throw error;
        });

    return sharedSidebarModalsPromise;
}

document.addEventListener('DOMContentLoaded', () => {
    applyResponsiveSidebar();
    ensureSharedSidebarModals();
});
window.addEventListener('load', () => {
    applyResponsiveSidebar();
    ensureSharedSidebarModals();
});
window.addEventListener('resize', applyResponsiveSidebar);
window.setTimeout(applyResponsiveSidebar, 0);
window.setTimeout(applyResponsiveSidebar, 300);

const sidebarMountObserver = new MutationObserver(function () {
    if (document.getElementById('sidebarArea')) {
        sidebarMountObserver.disconnect();
        applyResponsiveSidebar();
        ensureSharedSidebarModals();
    }
});

sidebarMountObserver.observe(document.body, {
    childList: true,
    subtree: true
});

document.addEventListener('click', async function (e) {
    const modelItem = e.target.closest('.modal-model-selector .dropdown-item, .chat-model-selector .dropdown-item');
    if (modelItem) {
        const dropdown = modelItem.closest('.modal-model-selector, .chat-model-selector');
        const selectedText = modelItem.querySelector('.dropdown-text')?.textContent.trim();

        if (dropdown && selectedText) {
            setSidebarModelSelectorValue(dropdown, selectedText);
            localStorage.setItem('selectedChatModel', selectedText);
        }
    }

    const modalTrigger = e.target.closest(
        '[data-bs-toggle="modal"][data-bs-target="#modal-system-prompt"], ' +
        '[data-bs-toggle="modal"][data-bs-target="#modal-parameter-setting"]'
    );

    if (!modalTrigger) return;

    const targetSelector = modalTrigger.getAttribute('data-bs-target');
    const targetModal = document.querySelector(targetSelector);
    if (targetModal?.dataset.sharedSidebarModal === 'true') return;

    e.preventDefault();
    e.stopImmediatePropagation();

    try {
        await ensureSharedSidebarModals();
        const sharedModal = document.querySelector(targetSelector);
        if (sharedModal) {
            bootstrap.Modal.getOrCreateInstance(sharedModal).show();
        }
    } catch (error) {
        // ensureSharedSidebarModals already reports the loading error.
    }
}, true);

let lastSidebarToggleTime = 0;

function handleSidebarToggleEvent(e) {
    const toggleBtn = document.getElementById('sidebarToggle');

    if (!toggleBtn || !toggleBtn.contains(e.target)) {
        return false;
    }

    const now = Date.now();
    if (now - lastSidebarToggleTime < 350) {
        e.preventDefault();
        e.stopPropagation();
        return true;
    }

    lastSidebarToggleTime = now;
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
    return true;
}

document.addEventListener('pointerup', handleSidebarToggleEvent, true);

// 點擊事件監聽
document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('sidebarArea');
    if (!sidebar) return;

    // 1. 點擊漢堡按鈕 → 永遠切換（展開 ↔ 收合）
    if (handleSidebarToggleEvent(e)) {
        return;
    }

    // 2. 手機版點擊 sidebar 外側 → 收合
    if (!sidebar.contains(e.target)) {
        if (isMobileSidebarViewport() && !sidebar.classList.contains('collapsed')) {
            setSidebarCollapsed(sidebar, true);
            sidebar.dataset.mobileState = 'collapsed';
        }
        return;
    }

    // ───────────── 無論展開或收合，只要點在 sidebar 內 ─────────────

    // 定義互動元素：這些被點擊時不觸發 toggle，讓它們執行原本功能
    const interactiveSelectors = [
        '.nav-link',                    // 所有導航連結
        '.nav-item a',                  // nav-item 內的連結
        'a[href]',                      // 任何有跳轉的連結
        '.btn-history',                 // 歷史的 ... 按鈕
        '[data-bs-toggle]',             // bootstrap dropdown、tooltip 等
        '.dropdown',                    // dropdown 容器
        '.dropdown-item',               // dropdown 選項
        '.btn-show-more',               // 顯示更多按鈕
        '.ai-app-title'                 // 如果有 AI 應用標題
    ].join(',');

    // 如果點擊的是互動元素 → 不觸發 toggle
    if (e.target.closest(interactiveSelectors)) {
        return;
    }

    // 其他情況（點 logo、頂部空白、hr、nav-title、分隔線、sidebar 空白處等）
    // → 都觸發 toggle（展開 → 收合；收合 → 展開）
    toggleSidebar();
});
