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

// Обновление статуса рапорта
function updateStatus(type, index, newStatus) {
    const data = JSON.parse(localStorage.getItem(type) || '[]');
    if (data[index]) {
        data[index].status = newStatus;
        localStorage.setItem(type, JSON.stringify(data));
    }
}

function deleteItem(type, index) {
    const data = JSON.parse(localStorage.getItem(type) || '[]');
    data.splice(index, 1);
    localStorage.setItem(type, JSON.stringify(data));
    location.reload();
}

function updateCheckStatus(index, newStatus) {
    const checks = JSON.parse(localStorage.getItem('checks') || '[]');
    if (checks[index]) {
        checks[index].status = newStatus;
        localStorage.setItem('checks', JSON.stringify(checks));
    }
}

function deleteCheck(index) {
    const checks = JSON.parse(localStorage.getItem('checks') || '[]');
    checks.splice(index, 1);
    localStorage.setItem('checks', JSON.stringify(checks));
    location.reload();
}