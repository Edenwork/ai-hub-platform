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

function moveSidebarModalsToBody() {
    document.querySelectorAll('#modal-system-prompt, #modal-parameter-setting').forEach((modal) => {
        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
    });
    initializeSidebarModelSelectors();
}

function setSidebarModelSelectorValue(dropdown, selectedText) {
    if (!dropdown || !selectedText) return;

    const button = dropdown.querySelector('[data-bs-toggle="dropdown"]');
    const label = button?.querySelector('.dropdown-button-label');
    if (!button || !label) return;

    label.textContent = selectedText;
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

document.addEventListener('DOMContentLoaded', () => {
    applyResponsiveSidebar();
    moveSidebarModalsToBody();
});
window.addEventListener('load', () => {
    applyResponsiveSidebar();
    moveSidebarModalsToBody();
});
window.addEventListener('resize', applyResponsiveSidebar);
window.setTimeout(applyResponsiveSidebar, 0);
window.setTimeout(applyResponsiveSidebar, 300);

const sidebarMountObserver = new MutationObserver(function () {
    if (document.getElementById('sidebarArea')) {
        applyResponsiveSidebar();
    }
});

sidebarMountObserver.observe(document.body, {
    childList: true,
    subtree: true
});

document.addEventListener('click', function (e) {
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

    if (modalTrigger) {
        moveSidebarModalsToBody();
    }
}, true);

function updateShowMoreText(isExpanded) {
    const textEl = document.getElementById('showMoreText');
    if (!textEl) return;

    const label = isExpanded ? '顯示較少' : '顯示全部';
    const icon = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
    textEl.innerHTML = `${label} <i class="fa ${icon} sidebar-toggle-icon"></i>`;
}

document.addEventListener('shown.bs.collapse', function (event) {
    if (event.target?.id === 'moreAppsCollapse') {
        updateShowMoreText(true);
    }
});

document.addEventListener('hidden.bs.collapse', function (event) {
    if (event.target?.id === 'moreAppsCollapse') {
        updateShowMoreText(false);
    }
});

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
        '.conversation-rename-input',   // 對話重新命名輸入
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

function showSidebarSnackbar(message) {
    let snackbar = document.querySelector('.sidebar-snackbar');

    if (!snackbar) {
        snackbar = document.createElement('div');
        snackbar.className = 'sidebar-snackbar';
        snackbar.setAttribute('role', 'status');
        snackbar.setAttribute('aria-live', 'polite');
        snackbar.setAttribute('aria-atomic', 'true');
        snackbar.innerHTML = '<span class="sidebar-snackbar-icon"></span><span class="sidebar-snackbar-message"></span>';
        document.body.appendChild(snackbar);
    }

    let messageEl = snackbar.querySelector('.sidebar-snackbar-message');
    if (!messageEl) {
        snackbar.innerHTML = '<span class="sidebar-snackbar-icon"></span><span class="sidebar-snackbar-message"></span>';
        messageEl = snackbar.querySelector('.sidebar-snackbar-message');
    }

    messageEl.textContent = message;
    snackbar.classList.add('show');

    window.clearTimeout(snackbar._hideTimer);
    snackbar._hideTimer = window.setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

function goToConversation(item) {
    const question = item?.dataset.question?.trim();
    const responseType = item?.dataset.response?.trim();
    const params = new URLSearchParams();

    if (question) {
        params.set('question', question);
    }

    if (responseType) {
        params.set('response', responseType);
    }

    window.location.href = params.toString() ? `chat.html?${params.toString()}` : 'chat.html';
}

function updateConversationEmptyState(list) {
    const emptyState = list?.querySelector('.conversation-empty-state');
    if (!emptyState) return;

    const hasConversation = !!list.querySelector('.conversation-item');
    emptyState.classList.toggle('d-none', hasConversation);
}

function setConversationTitle(titleEl, value) {
    titleEl.textContent = value;
    titleEl.setAttribute('data-bs-title', value);
    titleEl.setAttribute('title', value);

    if (window.bootstrap?.Tooltip) {
        const tooltip = bootstrap.Tooltip.getInstance(titleEl);
        if (tooltip) {
            tooltip.dispose();
        }
        new bootstrap.Tooltip(titleEl);
    }
}

function startConversationRename(item) {
    const titleEl = item.querySelector('.conversation-title');
    if (!titleEl || item.querySelector('.conversation-rename-input')) return;

    const originalTitle = titleEl.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'conversation-rename-input';
    input.value = originalTitle;
    input.setAttribute('aria-label', '重新命名對話');

    titleEl.replaceWith(input);
    input.focus();
    input.select();

    let isRenameFinished = false;

    const finishRename = (shouldSave) => {
        if (isRenameFinished) return;
        isRenameFinished = true;

        const nextTitle = input.value.trim();
        const restoredTitle = document.createElement('span');
        restoredTitle.className = titleEl.className;
        restoredTitle.setAttribute('data-bs-toggle', 'tooltip');
        restoredTitle.setAttribute('data-bs-placement', 'bottom');

        input.replaceWith(restoredTitle);
        setConversationTitle(restoredTitle, shouldSave && nextTitle ? nextTitle : originalTitle);

        if (shouldSave && nextTitle && nextTitle !== originalTitle) {
            showSidebarSnackbar('已重新命名對話');
        }
    };

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            finishRename(true);
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            finishRename(false);
        }
    });

    input.addEventListener('blur', () => {
        if (document.body.contains(input)) {
            finishRename(true);
        }
    });
}

document.addEventListener('click', function (e) {
    const conversationRow = e.target.closest('.conversation-history-row');
    if (
        conversationRow &&
        !e.target.closest('.btn-history, .dropdown-menu, .conversation-rename-input, .conversation-rename-action, .conversation-delete-action')
    ) {
        const item = conversationRow.closest('.conversation-item');
        if (item) {
            goToConversation(item);
        }
        return;
    }

    const renameAction = e.target.closest('.conversation-rename-action');
    if (renameAction) {
        e.preventDefault();
        e.stopPropagation();

        const item = renameAction.closest('.conversation-item');
        if (item) {
            startConversationRename(item);
        }
        return;
    }

    const deleteAction = e.target.closest('.conversation-delete-action');
    if (deleteAction) {
        e.preventDefault();
        e.stopPropagation();

        const item = deleteAction.closest('.conversation-item');
        const list = deleteAction.closest('.conversation-history-list');
        const title = item?.querySelector('.conversation-title')?.textContent.trim() || '對話';

        if (item) {
            item.remove();
            updateConversationEmptyState(list);
            showSidebarSnackbar(`已刪除「${title}」`);
        }
    }
});

document.addEventListener('keydown', function (e) {
    const conversationRow = e.target.closest('.conversation-history-row');
    if (!conversationRow || e.target.closest('.conversation-rename-input')) return;

    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const item = conversationRow.closest('.conversation-item');
        if (item) {
            goToConversation(item);
        }
    }
});
