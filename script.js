// ============================================================
// 1. УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
// ============================================================
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}
function logout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('callsign');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
}
function getUserByCallsign(callsign) {
    const users = getUsers();
    return users.find(u => u.callsign === callsign);
}
function isAdmin(callsign) {
    const user = getUserByCallsign(callsign);
    return user && user.role === 'admin';
}
function setUserRole(callsign, role) {
    const users = getUsers();
    const user = users.find(u => u.callsign === callsign);
    if (user) {
        user.role = role;
        saveUsers(users);
        return true;
    }
    return false;
}
function deleteUser(callsign) {
    let users = getUsers();
    users = users.filter(u => u.callsign !== callsign);
    saveUsers(users);
}

// ============================================================
// 2. УПРАВЛЕНИЕ ДОЛЖНОСТЯМИ И ЗВАНИЯМИ
// ============================================================
function setUserPosition(callsign, position) {
    const users = getUsers();
    const user = users.find(u => u.callsign === callsign);
    if (user) {
        user.position = position || '';
        saveUsers(users);
        return true;
    }
    return false;
}
function setCustomRank(callsign, customRank) {
    const users = getUsers();
    const user = users.find(u => u.callsign === callsign);
    if (user) {
        if (customRank && customRank.trim() !== '') {
            user.customRank = customRank.trim();
        } else {
            delete user.customRank;
        }
        saveUsers(users);
        return true;
    }
    return false;
}
function getPosition(callsign) {
    const user = getUserByCallsign(callsign);
    return user && user.position ? user.position : '—';
}

// ============================================================
// 3. СИСТЕМА ЗВАНИЙ (с учётом ручного переопределения)
// ============================================================
function getRank(callsign) {
    const users = getUsers();
    const user = users.find(u => u.callsign === callsign);
    if (!user) return 'Неизвестно';
    if (user.customRank) return user.customRank;
    const topics = getTopics();
    const posts = getPosts();
    const totalMessages = topics.filter(t => t.author === callsign).length +
                          posts.filter(p => p.author === callsign).length;
    let rank = 'Рядовой';
    if (totalMessages >= 200) rank = 'Старший лейтенант';
    else if (totalMessages >= 100) rank = 'Лейтенант';
    else if (totalMessages >= 50) rank = 'Прапорщик';
    else if (totalMessages >= 25) rank = 'Старший сержант';
    else if (totalMessages >= 10) rank = 'Сержант';
    else if (totalMessages >= 5) rank = 'Младший сержант';
    else rank = 'Рядовой';
    return rank;
}
function updateRank(callsign) {
    const users = getUsers();
    const user = users.find(u => u.callsign === callsign);
    if (!user || user.customRank) return;
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
    user.rank = newRank;
    saveUsers(users);
}

// ============================================================
// 4. ФУНКЦИИ ДЛЯ ФОРУМА
// ============================================================
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
function getTopicById(id) {
    const topics = getTopics();
    return topics.find(t => t.id === id);
}
function getPostsByTopic(topicId) {
    const posts = getPosts();
    return posts.filter(p => p.topicId === topicId).sort((a, b) => a.date.localeCompare(b.date));
}
function deleteTopic(topicId) {
    let topics = getTopics();
    topics = topics.filter(t => t.id !== topicId);
    saveTopics(topics);
    let posts = getPosts();
    posts = posts.filter(p => p.topicId !== topicId);
    savePosts(posts);
}
function deletePost(postId) {
    let posts = getPosts();
    posts = posts.filter(p => p.id !== postId);
    savePosts(posts);
}
function createTopic(title, text, author, category) {
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
        postCount: 1,
        category: category || 'general'
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
    updateRank(author);
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
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
        topic.lastPostDate = now;
        topic.postCount = (topic.postCount || 0) + 1;
        saveTopics(topics);
    }
    updateRank(author);
}

// ============================================================
// 5. КАТЕГОРИИ ФОРУМА (две категории)
// ============================================================
function getCategories() {
    return [
        { id: 'recruiting', name: 'Кадры / Рекрутинг', icon: '👤' },
        { id: 'general', name: 'Обучение и общение / Курилка', icon: '💬' }
    ];
}
function getCategoryById(id) {
    return getCategories().find(c => c.id === id);
}

// ============================================================
// 6. ШТАТНОЕ РАСПИСАНИЕ
// ============================================================
function getStaffData() {
    const users = getUsers();
    const groups = {};
    users.forEach(u => {
        const pos = u.position || 'Без должности';
        if (!groups[pos]) groups[pos] = [];
        groups[pos].push(u.callsign);
    });
    const order = ['Начальник', 'Заместитель', 'Старший', 'Группа'];
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        const idxA = order.findIndex(o => a.startsWith(o));
        const idxB = order.findIndex(o => b.startsWith(o));
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });
    return sortedKeys.map(pos => ({
        position: pos,
        members: groups[pos]
    }));
}

// ============================================================
// 7. РАПОРТЫ
// ============================================================
function getReports() {
    return JSON.parse(localStorage.getItem('reports') || '[]');
}
function saveReports(reports) {
    localStorage.setItem('reports', JSON.stringify(reports));
}
function saveReport(report) {
    const reports = getReports();
    reports.push(report);
    saveReports(reports);
}
function deleteReport(reportId) {
    let reports = getReports();
    reports = reports.filter(r => r.id !== reportId);
    saveReports(reports);
}
function changeReportStatus(reportId, newStatus) {
    const reports = getReports();
    const report = reports.find(r => r.id === reportId);
    if (report) {
        report.status = newStatus;
        saveReports(reports);
        return true;
    }
    return false;
}

// ============================================================
// 8. ЗАКОНОДАТЕЛЬСТВО
// ============================================================
function getLegislationArticles() {
    return [
        { code: 'УК РФ', number: 'ст. 105', title: 'Убийство', text: 'Умышленное причинение смерти другому человеку.', sanction: 'Лишение свободы на срок от 6 до 15 лет.' },
        { code: 'УК РФ', number: 'ст. 158', title: 'Кража', text: 'Тайное хищение чужого имущества.', sanction: 'Штраф до 80 тыс. руб. или лишение свободы до 2 лет.' },
        { code: 'КоАП РФ', number: 'ст. 12.8', title: 'Управление ТС в состоянии опьянения', text: 'Управление транспортным средством в состоянии алкогольного опьянения.', sanction: 'Штраф 30 тыс. руб. и лишение прав на 1.5-2 года.' },
        { code: 'УПК РФ', number: 'ст. 91', title: 'Основания задержания', text: 'Задержание подозреваемого в совершении преступления.', sanction: 'Срок задержания не более 48 часов.' }
    ];
}
