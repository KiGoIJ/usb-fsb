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
    localStorage.removeItem('isAdmin'); // удаляем флаг админа
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
// 2. ФУНКЦИИ ДЛЯ ФОРУМА (темы и посты)
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

// ============================================================
// 3. СИСТЕМА ЗВАНИЙ
// ============================================================

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

// ============================================================
// 4. СОЗДАНИЕ ТЕМ И ОТВЕТОВ (с поддержкой категорий)
// ============================================================

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
// 5. КАТЕГОРИИ ФОРУМА
// ============================================================

function getCategories() {
    return [
        { id: 'recruiting', name: 'Кадры / Рекрутинг', icon: '👤' },
        { id: 'general',   name: 'Обучение и общение / Курилка', icon: '💬' }
    ];
}

function getCategoryById(id) {
    return getCategories().find(c => c.id === id);
}

// ============================================================
// 6. РАПОРТЫ
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
// 7. ЗАКОНОДАТЕЛЬСТВО (база статей)
// ============================================================

function getLegislationArticles() {
    return [
        {
            code: 'УК РФ',
            number: 'ст. 105',
            title: 'Убийство',
            text: 'Умышленное причинение смерти другому человеку.',
            sanction: 'Лишение свободы на срок от 6 до 15 лет.'
        },
        {
            code: 'УК РФ',
            number: 'ст. 158',
            title: 'Кража',
            text: 'Тайное хищение чужого имущества.',
            sanction: 'Штраф до 80 тыс. руб. или лишение свободы до 2 лет.'
        },
        {
            code: 'КоАП РФ',
            number: 'ст. 12.8',
            title: 'Управление ТС в состоянии опьянения',
            text: 'Управление транспортным средством в состоянии алкогольного опьянения.',
            sanction: 'Штраф 30 тыс. руб. и лишение прав на 1.5-2 года.'
        },
        {
            code: 'УПК РФ',
            number: 'ст. 91',
            title: 'Основания задержания',
            text: 'Задержание подозреваемого в совершении преступления.',
            sanction: 'Срок задержания не более 48 часов.'
        }
    ];
}
