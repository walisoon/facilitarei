// Importar createClient do Supabase
const { createClient } = require('@supabase/supabase-js');

// Inicializar o cliente Supabase
const SUPABASE_URL = 'https://qkimxruewcensbnfllvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW14cnVld2NlbnNibmZsbHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTIxMzksImV4cCI6MjA0ODY2ODEzOX0.tLnz1o3ximSJFMHb1kRzbfmF-4gIP_i-YD6n5TH24fE';

console.log('Inicializando Supabase...');
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para lidar com o login
async function handleLogin(event) {
    event.preventDefault();
    console.log('Iniciando processo de login...');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Mostrar loading
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Entrando...';
        
        console.log('Tentando login com:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('Erro no login:', error);
            alert('Email ou senha incorretos. Por favor, tente novamente.');
            return;
        }
        
        console.log('Login bem sucedido:', data);
        
        // Se o login for bem-sucedido
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro no login: ' + error.message);
    } finally {
        // Restaurar botão
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Entrar';
    }
}

// Verificar estado de autenticação
async function checkAuth() {
    console.log('Verificando autenticação...');
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            return;
        }
        
        console.log('Sessão atual:', session);
        
        // Se não estiver na página de login e não estiver autenticado
        if (!session && !window.location.pathname.includes('login.html')) {
            console.log('Usuário não autenticado, redirecionando para login...');
            window.location.href = 'login.html';
        }
        // Se estiver na página de login e já estiver autenticado
        else if (session && window.location.pathname.includes('login.html')) {
            console.log('Usuário já autenticado, redirecionando para index...');
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

// Função para fazer logout
async function handleLogout() {
    try {
        console.log('Iniciando logout...');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout: ' + error.message);
    }
}

// Adicionar event listeners quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, inicializando...');
    
    // Verificar autenticação
    checkAuth();
    
    // Adicionar event listener para o formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Form de login encontrado, adicionando listener...');
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Adicionar event listener para o botão de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        console.log('Botão de logout encontrado, adicionando listener...');
        logoutButton.addEventListener('click', handleLogout);
    }
});
