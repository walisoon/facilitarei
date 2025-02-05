// Inicializar o cliente Supabase
const SUPABASE_URL = 'https://euphonious-selkie-17c6d9.netlify.app';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Substitua pela sua chave anônima
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para lidar com o login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Mostrar loading
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Entrando...';
        
        // Usar o método correto do Supabase v2
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Se o login for bem-sucedido
        console.log('Login bem-sucedido:', data);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirecionar para a página principal
        window.location.href = '/';
        
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro no login: ' + (error.message || 'Tente novamente mais tarde'));
    } finally {
        // Restaurar botão
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Entrar';
    }
}

// Verificar estado de autenticação
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Se não estiver na página de login e não estiver autenticado
        if (!session && !window.location.pathname.includes('login')) {
            window.location.href = '/login.html';
        }
        // Se estiver na página de login e já estiver autenticado
        else if (session && window.location.pathname.includes('login')) {
            window.location.href = '/';
        }
        
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

// Função para fazer logout
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout: ' + error.message);
    }
}

// Adicionar event listeners quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    checkAuth();
    
    // Adicionar event listener para o formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Adicionar event listener para o botão de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});
