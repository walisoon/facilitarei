// Importar createClient do Supabase
const { createClient } = require('@supabase/supabase-js');

// Inicializar o cliente Supabase
const SUPABASE_URL = 'https://qkimxruewcensbnfllvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW14cnVld2NlbnNibmZsbHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTIxMzksImV4cCI6MjA0ODY2ODEzOX0.tLnz1o3ximSJFMHb1kRzbfmF-4gIP_i-YD6n5TH24fE';

console.log('Inicializando Supabase...');
const supabase = window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para forçar navegação
function forceNavigate(path) {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${path}`;
    console.log('Forçando navegação para:', fullUrl);
    
    // Limpar qualquer estado anterior
    sessionStorage.clear();
    
    // Forçar navegação
    window.location.replace(fullUrl);
    
    // Se replace não funcionar, tentar href
    setTimeout(() => {
        if (window.location.href !== fullUrl) {
            console.log('Replace falhou, tentando href...');
            window.location.href = fullUrl;
        }
    }, 100);
}

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
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('Erro no login:', error);
            alert('Email ou senha incorretos. Por favor, tente novamente.');
            return;
        }
        
        console.log('Login bem sucedido:', data);
        
        // Salvar dados do usuário
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('isAuthenticated', 'true');
        
        // Forçar navegação para a página principal
        forceNavigate('/index.html');
        
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
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            return;
        }
        
        console.log('Sessão atual:', session);
        
        const currentPath = window.location.pathname;
        console.log('Caminho atual:', currentPath);
        
        if (!session && !currentPath.includes('login.html')) {
            console.log('Usuário não autenticado, redirecionando para login...');
            forceNavigate('/login.html');
        } else if (session && currentPath.includes('login.html')) {
            console.log('Usuário já autenticado, redirecionando para index...');
            forceNavigate('/index.html');
        }
        
        // Atualizar email do usuário se estiver na página principal
        if (session && !currentPath.includes('login.html')) {
            const userEmail = document.getElementById('userEmail');
            if (userEmail) {
                userEmail.textContent = session.user.email;
            }
        }
        
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

// Função para fazer logout
async function handleLogout() {
    try {
        console.log('Iniciando logout...');
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        
        // Limpar dados
        localStorage.clear();
        sessionStorage.clear();
        
        console.log('Logout bem sucedido, redirecionando...');
        forceNavigate('/login.html');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout: ' + error.message);
    }
}

// Adicionar event listeners quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, inicializando...');
    console.log('URL atual:', window.location.href);
    console.log('Origin:', window.location.origin);
    console.log('Pathname:', window.location.pathname);
    
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
