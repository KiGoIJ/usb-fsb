// ===== Управление пользователями =====

function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// (Опционально) Функция выхода уже есть в index.html, но можно добавить очистку только auth и callsign
function logout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('callsign');
    window.location.href = 'login.html';
}

// ===== Старые функции остаются без изменений =====
function generateKRSP() {
    let lastNum = parseInt(localStorage.getItem('lastKRSP') || '0');
    lastNum++;
    const num = 'КРСП-' + String(lastNum).padStart(3, '0');
    localStorage.setItem('lastKRSP', lastNum);
    return num;
}

function saveReport(report) {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));
}

function saveCheck(check) {
    const checks = JSON.parse(localStorage.getItem('checks') || '[]');
    checks.push(check);
    localStorage.setItem('checks', JSON.stringify(checks));
}

function updateStatus(type, index, newStatus) {
    if (!newStatus) return;
    const data = JSON.parse(localStorage.getItem(type) || '[]');
    if (data[index]) {
        data[index].status = newStatus;
        localStorage.setItem(type, JSON.stringify(data));
        location.reload();
    }
}

function deleteItem(type, index) {
    const data = JSON.parse(localStorage.getItem(type) || '[]');
    data.splice(index, 1);
    localStorage.setItem(type, JSON.stringify(data));
    location.reload();
}

function updateCheckStatus(index, newStatus) {
    if (!newStatus) return;
    const checks = JSON.parse(localStorage.getItem('checks') || '[]');
    if (checks[index]) {
        checks[index].status = newStatus;
        localStorage.setItem('checks', JSON.stringify(checks));
        location.reload();
    }
}

function deleteCheck(index) {
    const checks = JSON.parse(localStorage.getItem('checks') || '[]');
    checks.splice(index, 1);
    localStorage.setItem('checks', JSON.stringify(checks));
    location.reload();
}

// ===== ФУНКЦИИ ДЛЯ ФОРУМА =====

function getTopics() {
    return JSON.parse(localStorage.getItem('forumTopics') || '[]');
}

function saveTopics(topics) {
    localStorage.setItem('forumTopics', JSON.stringify(topics));
}

function getPosts() {
    return JSON.parse(localStorage.getItem('forumPosts') || '[]');
}

function savePosts(posts) {
    localStorage.setItem('forumPosts', JSON.stringify(posts));
}

function createTopic(title, text, author) {
    const topics = getTopics();
    const posts = getPosts();
    const topicId = Date.now();
    const now = new Date().toISOString();
    topics.push({
        id: topicId,
        title: title,
        author: author,
        date: now,
        lastPostDate: now,
        postCount: 1
    });
    posts.push({
        id: Date.now() + 1,
        topicId: topicId,
        author: author,
        date: now,
        text: text
    });
    saveTopics(topics);
    savePosts(posts);
    return topicId;
}

function addPost(topicId, text, author) {
    const posts = getPosts();
    const topics = getTopics();
    const now = new Date().toISOString();
    posts.push({
        id: Date.now(),
        topicId: topicId,
        author: author,
        date: now,
        text: text
    });
    savePosts(posts);
    // Обновляем информацию о теме
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
        topic.lastPostDate = now;
        topic.postCount = (topic.postCount || 0) + 1;
        saveTopics(topics);
    }
}

function getPostsByTopic(topicId) {
    const posts = getPosts();
    return posts.filter(p => p.topicId === topicId).sort((a, b) => a.date.localeCompare(b.date));
}

function getTopicById(id) {
    const topics = getTopics();
    return topics.find(t => t.id === id);
}
