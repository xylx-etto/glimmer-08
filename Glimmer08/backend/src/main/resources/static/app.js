const API_BASE = '/api/v1/messages';

const authorInput = document.getElementById('authorInput');
const contentInput = document.getElementById('contentInput');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitBtn');
const messagesContainer = document.getElementById('messagesContainer');

contentInput.addEventListener('input', () => {
    charCount.textContent = contentInput.value.length;
});

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function fetchMessages() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('请求失败');
        const data = await res.json();
        renderMessages(data);
    } catch (err) {
        messagesContainer.innerHTML = '<div class="error-msg">加载失败，请检查后端服务是否正常运行</div>';
    }
}

function renderMessages(messages) {
    if (!messages || messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">&#128221;</div>
                <p>还没有留言，快来写第一条吧！</p>
            </div>`;
        return;
    }

    messagesContainer.innerHTML = messages.map(msg => `
        <div class="message-card">
            <div class="author">${escapeHtml(msg.author || '匿名')}</div>
            <div class="content">${escapeHtml(msg.content)}</div>
            <div class="meta">
                <span>${msg.createdAt ? new Date(msg.createdAt).toLocaleString('zh-CN') : '刚刚'}</span>
                <button class="delete-btn" onclick="deleteMessage(${msg.id})">删除</button>
            </div>
        </div>
    `).join('');
}

async function submitMessage() {
    const author = authorInput.value.trim();
    const content = contentInput.value.trim();

    if (!author) { alert('请输入昵称'); return; }
    if (!content) { alert('请输入留言内容'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = '发布中...';

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author, content })
        });
        if (!res.ok) throw new Error('发布失败');
        authorInput.value = '';
        contentInput.value = '';
        charCount.textContent = '0';
        await fetchMessages();
    } catch (err) {
        alert('发布失败，请稍后重试');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '发布留言';
    }
}

async function deleteMessage(id) {
    if (!confirm('确定要删除这条留言吗？')) return;
    try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('删除失败');
        await fetchMessages();
    } catch (err) {
        alert('删除失败，请稍后重试');
    }
}

submitBtn.addEventListener('click', submitMessage);

document.addEventListener('DOMContentLoaded', fetchMessages);
