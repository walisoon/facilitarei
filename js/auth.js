// Função para lidar com o login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const { user, error } = await supabase.auth.signIn({ email, password });
        
        if (error) throw error;
        
        // Se o login for bem-sucedido, redirecionar para a página principal
        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Erro no login:', error.message);
        alert('Erro no login: ' + error.message);
    }
}

// Verificar estado de autenticação
async function checkAuth() {
    const user = supabase.auth.user();
    
    // Se não estiver na página de login e não estiver autenticado, redirecionar para login
    if (!user && !window.location.pathname.includes('login')) {
        window.location.href = '/login.html';
    }
    // Se estiver na página de login e já estiver autenticado, redirecionar para dashboard
    else if (user && window.location.pathname.includes('login')) {
        window.location.href = '/dashboard.html';
    }
}

// Adicionar event listener quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    checkAuth();
    
    // Adicionar event listener para o formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
