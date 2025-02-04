// Arrays para armazenar dados
let creditRecords = [];
let simulacoes = [];

// Função para carregar simulações
async function loadSimulacoes() {
    try {
        console.log('Carregando simulações...');
        const { data, error } = await supabase
            .from('simulacoes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar simulações:', error);
            throw error;
        }

        console.log('Simulações carregadas:', data);
        simulacoes = data || [];
        updateSimulacoesSelect();
    } catch (error) {
        console.error('Erro ao carregar simulações:', error);
        alert('Erro ao carregar simulações. Por favor, tente novamente.');
    }
}

// Função para atualizar o select de simulações
function updateSimulacoesSelect() {
    const select = document.getElementById('simulacaoId');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione uma simulação...</option>';
    simulacoes.forEach(sim => {
        select.innerHTML += `<option value="${sim.id}">${sim.cliente} - R$ ${sim.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</option>`;
    });
}

// Função para preencher dados da simulação
function preencherDadosSimulacao(simulacaoId) {
    const simulacao = simulacoes.find(s => s.id === simulacaoId);
    if (!simulacao) return;

    // Preencher campos com dados da simulação
    document.getElementById('nome').value = simulacao.cliente || '';
    document.getElementById('valor_bem').value = simulacao.valor || '';
    document.getElementById('renda_individual').value = simulacao.rendaIndividual || '';
}

// Função para carregar os registros do Supabase
async function loadCreditRecords() {
    creditRecords = [];
    updateCreditTable();

    try {
        console.log('Carregando registros de crédito...');
        const { data, error } = await supabase
            .from('creditos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar registros:', error);
            throw error;
        }

        console.log('Dados recebidos:', data);
        creditRecords = data || [];
        updateCreditTable();
    } catch (error) {
        console.error('Erro ao carregar registros:', error);
        alert('Erro ao carregar os registros. Por favor, tente novamente.');
    }
}

// Função para determinar o tipo do bem
function getTipoBem() {
    if (document.getElementById('imovel').checked) return 'IMÓVEL';
    if (document.getElementById('auto').checked) return 'AUTO';
    if (document.getElementById('pesados').checked) return 'PESADOS';
    return null;
}

// Função para lidar com o envio do formulário
async function handleCreditFormSubmit(event) {
    event.preventDefault();
    
    const simulacaoId = document.getElementById('simulacaoId').value;
    const simulacao = simulacoes.find(s => s.id === simulacaoId);
    
    if (!simulacao) {
        alert('Por favor, selecione uma simulação válida.');
        return;
    }
    
    try {
        // Obter dados do formulário
        const formData = {
            simulacao_id: simulacaoId,
            
            // Dados Pessoais
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            rg: document.getElementById('rg').value,
            orgao_emissor: document.getElementById('orgao_emissor').value,
            data_nascimento: document.getElementById('data_nascimento').value || null, // Se vazio, envia null
            naturalidade: document.getElementById('naturalidade').value,
            estado_civil: document.getElementById('estado_civil').value,
            conjuge: document.getElementById('conjuge').value,
            filiacao_materna: document.getElementById('filiacao_materna').value,
            filiacao_paterna: document.getElementById('filiacao_paterna').value,
            
            // Endereço
            endereco: document.getElementById('endereco').value,
            numero: document.getElementById('numero').value,
            bairro: document.getElementById('bairro').value,
            complemento: document.getElementById('complemento').value,
            cep: document.getElementById('cep').value,
            cidade_uf: document.getElementById('cidade_uf').value,
            
            // Contato
            telefone1: document.getElementById('telefone1').value,
            telefone2: document.getElementById('telefone2').value,
            email: document.getElementById('email').value,
            
            // Profissão e Renda
            profissao: document.getElementById('profissao').value,
            empresa: document.getElementById('empresa').value,
            renda_individual: parseFloat(document.getElementById('renda_individual').value || 0),
            renda_familiar: parseFloat(document.getElementById('renda_familiar').value || 0),
            pont_score: parseFloat(document.getElementById('pont_score').value || 0),
            restricao: document.getElementById('restricao').checked,
            
            // Dados do Bem
            tipo_bem: getTipoBem(),
            valor_bem: parseFloat(document.getElementById('valor_bem').value || 0),
            valor_entrada: parseFloat(document.getElementById('valor_entrada').value || 0),
            prazo: parseInt(document.getElementById('prazo').value || 0),
            reducao: parseFloat(document.getElementById('reducao').value || 0),
            
            // Dados do Consultor
            consultor: document.getElementById('consultor').value,
            filial: document.getElementById('filial').value,
            
            // Sistema
            status: 'Em Análise',
            user_id: supabase.auth.user().id
        };

        // Remover campos que são null, undefined ou string vazia
        Object.keys(formData).forEach(key => {
            if (formData[key] === null || formData[key] === undefined || formData[key] === '') {
                delete formData[key];
            }
        });
    
        console.log('Tentando salvar ficha:', formData);
        const { data, error } = await supabase
            .from('creditos')
            .insert([formData])
            .select();

        if (error) {
            console.error('Erro ao salvar ficha:', error);
            throw error;
        }

        console.log('Ficha salva com sucesso:', data);
        await loadCreditRecords();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('novoCreditoModal'));
        modal.hide();
        
        // Resetar formulário
        document.getElementById('creditForm').reset();

        // Mostrar mensagem de sucesso
        alert('Ficha salva com sucesso!');
    } catch (error) {
        console.error('Erro detalhado ao salvar ficha:', error);
        alert('Erro ao salvar a ficha: ' + error.message);
    }
}

// Função para atualizar a tabela de créditos
function updateCreditTable() {
    const tableBody = document.getElementById('creditTableBody');
    tableBody.innerHTML = '';
    
    if (!creditRecords || creditRecords.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum registro encontrado</td></tr>';
        return;
    }

    creditRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.nome || ''}</td>
            <td>R$ ${(record.valor_bem || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>240</td>
            <td>7.63%</td>
            <td>
                <span class="badge bg-warning">${record.status || 'Em Análise'}</span>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm" onclick="viewCreditDetails('${record.id}')">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Função para visualizar detalhes do crédito
async function viewCreditDetails(id) {
    try {
        const { data, error } = await supabase
            .from('creditos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        console.log('Detalhes do crédito:', data);
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar os detalhes. Por favor, tente novamente.');
    }
}

// Inicializar event listeners quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, inicializando...');
    
    const creditForm = document.getElementById('creditForm');
    if (creditForm) {
        creditForm.addEventListener('submit', handleCreditFormSubmit);
    }

    // Adicionar listener para mudança na simulação selecionada
    const simulacaoSelect = document.getElementById('simulacaoId');
    if (simulacaoSelect) {
        simulacaoSelect.addEventListener('change', (e) => {
            preencherDadosSimulacao(e.target.value);
        });
    }

    // Carregar simulações e registros existentes
    loadSimulacoes();
    loadCreditRecords();
});
