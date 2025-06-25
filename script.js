// Gerador de Senhas
document.getElementById('generate').addEventListener('click', function() {
    const length = parseInt(document.getElementById('length').value);
    const uppercase = document.getElementById('uppercase').checked;
    const lowercase = document.getElementById('lowercase').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;
    
    const password = generatePassword(length, uppercase, lowercase, numbers, symbols);
    document.getElementById('password').value = password;
    
    updateEntropyAnalysis(password);
});

function generatePassword(length, uppercase, lowercase, numbers, symbols) {
    let charset = '';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!charset) {
        alert('Selecione pelo menos um conjunto de caracteres');
        return '';
    }
    
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset[array[i] % charset.length];
    }
    
    return result;
}

function updateEntropyAnalysis(password) {
    if (!password) return;
    
    // Calcular tamanho do conjunto de caracteres
    let charsetSize = 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    
    if (hasLower) charsetSize += 26;
    if (hasUpper) charsetSize += 26;
    if (hasNumber) charsetSize += 10;
    if (hasSymbol) charsetSize += 32; // Aproximação comum
    
    // Calcular entropia em bits
    const entropy = Math.log2(Math.pow(charsetSize, password.length));
    
    // Estimar tempo para quebrar (supondo 1 bilhão de tentativas por segundo)
    const combinations = Math.pow(charsetSize, password.length);
    const seconds = combinations / 1e9;
    
    document.getElementById('entropy-bits').textContent = entropy.toFixed(2);
    document.getElementById('break-time').textContent = formatTime(seconds);
}

function formatTime(seconds) {
    if (seconds < 1) return "menos de 1 segundo";
    if (seconds < 60) return `${seconds.toFixed(0)} segundos`;
    
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(0)} minutos`;
    
    const hours = minutes / 60;
    if (hours < 24) return `${hours.toFixed(0)} horas`;
    
    const days = hours / 24;
    if (days < 365) return `${days.toFixed(0)} dias`;
    
    const years = days / 365;
    if (years < 1000) return `${years.toFixed(0)} anos`;
    
    const millennia = years / 1000;
    return `${millennia.toFixed(0)} milênios`;
}

// Verificador de Força
document.getElementById('analyze').addEventListener('click', function() {
    const password = document.getElementById('password-input').value;
    analyzePassword(password);
});

function analyzePassword(password) {
    const length = password.length;
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
    
    const entropy = Math.log2(Math.pow(charsetSize, length));
    const combinations = Math.pow(charsetSize, length);
    const seconds = combinations / 1e9; // 1 bilhão de tentativas por segundo
    
    // Atualizar a interface
    document.getElementById('length-result').textContent = length;
    document.getElementById('charset-size').textContent = charsetSize;
    document.getElementById('entropy-result').textContent = entropy.toFixed(2);
    document.getElementById('combinations').textContent = combinations.toExponential(2);
    document.getElementById('time-to-crack').textContent = formatTime(seconds);
    
    // Atualizar o medidor visual
    const strengthMeter = document.getElementById('strength-meter');
    const strengthPercentage = Math.min(100, Math.max(0, entropy * 3)); // Ajuste empírico
    
    strengthMeter.style.width = `${strengthPercentage}%`;
    strengthMeter.style.backgroundColor = getStrengthColor(strengthPercentage);
    
    // Gerar feedback
    const feedbackList = document.getElementById('feedback-list');
    feedbackList.innerHTML = '';
    
    addFeedback(feedbackList, length >= 12, "Senha com comprimento adequado (12+ caracteres)");
    addFeedback(feedbackList, charsetSize >= 62, "Usa múltiplos conjuntos de caracteres");
    addFeedback(feedbackList, entropy >= 80, "Entropia alta (80+ bits recomendado)");
    addFeedback(feedbackList, !isCommonPassword(password), "Não é uma senha comum");
}

function getStrengthColor(percentage) {
    if (percentage < 30) return '#ff0000';
    if (percentage < 60) return '#ff9900';
    if (percentage < 80) return '#ffff00';
    return '#00ff00';
}

function addFeedback(list, condition, text) {
    const li = document.createElement('li');
    li.textContent = text;
    li.style.color = condition ? 'green' : 'red';
    li.style.listStyleType = condition ? '✓' : '✗';
    list.appendChild(li);
}

function isCommonPassword(password) {
    // Lista simplificada de senhas comuns - na prática, usar uma lista mais completa
    const commonPasswords = ['123456', 'password', '123456789', '12345678', '12345', 
                            '1234567', 'senha', '123123', '111111', 'qwerty'];
    return commonPasswords.includes(password.toLowerCase());
}

// Copiar senha
document.getElementById('copy').addEventListener('click', function() {
    const passwordField = document.getElementById('password');
    passwordField.select();
    document.execCommand('copy');
    alert('Senha copiada para a área de transferência!');
});
