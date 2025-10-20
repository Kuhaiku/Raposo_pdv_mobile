// Funções para gerenciar o token JWT no localStorage

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/página_de_login.html';
}

// Função para proteger as páginas. Deve ser chamada no início de cada página restrita.
function protectPage() {
    const token = getToken();
    // Se não houver token, redireciona para a página de login
    if (!token) {
        window.location.href = '/página_de_login.html';
    }
}

// Função para fazer requisições à API já incluindo o token de autorização
async function fetchWithAuth(url, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
}