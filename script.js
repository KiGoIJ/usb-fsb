// ===== Управление пользователями =====
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function logout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('callsign');
    window.location.href = 'login.html';
}

// ===== Система званий =====
function getRank(callsign) {
    const users = getUsers();
    const user = users.find(u => u.callsign === callsign);
    if (!user) return 'Неизвестно';
    return user.rank || 'Рядовой';
}

function updateRank(callsign) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.callsign === callsign);
    if (userIndex === -1) return;
    const user = users[userIndex];

    // Подсчёт общего числа сообщений (темы + посты)
    const topics = getTopics();
    const posts = getPosts();
    const totalMessages = topics.filter(t => t.author === callsign).length +
                          posts.filter(p => p.author === callsign).length;

    let newRank = 'Рядовой';
    if (totalMessages >= 200) newRank = 'Старший лейтенант';
    else if (totalMessages >= 100) newRank = 'Лейтенант';
    else if (totalMessages >= 50) newRank = 'Прапорщик';
    else if (totalMessages >= 25) newRank = 'Старший сержант';
    else if (totalMessages >= 10) newRank = 'Сержант';
    else if (totalMessages >= 5) newRank = 'Младший сержант';
    else newRank = 'Рядовой';

    if (user.rank !== newRank) {
        user.rank = newRank;
        saveUsers(users);
    }
}

// ===== Старые функции (для обратной совместимости) =====
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
    updateRank(author); // обновляем звание автора
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
    updateRank(author); // обновляем звание автора
}

function getPostsByTopic(topicId) {
    const posts = getPosts();
    return posts.filter(p => p.topicId === topicId).sort((a, b) => a.date.localeCompare(b.date));
}

function getTopicById(id) {
    const topics = getTopics();
    return topics.find(t => t.id === id);
}
