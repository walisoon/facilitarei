import { createClient } from '@supabase/supabase-js'
import { Simulacao, SimulacaoStatus } from '@/types/simulacao'
import { Credito } from '@/types/credito'

// Use o domínio base do Supabase
const supabaseUrl = 'https://qkimxruewcensbnfllvv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW14cnVld2NlbnNibmZsbHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTIxMzksImV4cCI6MjA0ODY2ODEzOX0.tLnz1o3ximSJFMHb1kRzbfmF-4gIP_i-YD6n5TH24fE'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided')
}

// Configuração do cliente Supabase com retry e timeout
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'facilitarei@1.0.0',
    },
  },
})

// Tipos para usuários
export interface Usuario {
  id?: number
  email: string
  nome: string
  cargo: string
  ativo?: boolean
  data_criacao?: string
}

// Funções helpers para interagir com o Supabase
export const SimulacoesAPI = {
  // Criar nova simulação
  async criar(simulacao: Omit<Simulacao, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Gera um número único para a simulação (ano + mês + sequencial)
      const dataAtual = new Date();
      const ano = dataAtual.getFullYear();
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      
      // Busca o último número do mês atual
      const { data: ultimasSimulacoes } = await supabase
        .from('simulacoes')
        .select('numero')
        .like('numero', `SIM${ano}${mes}%`)
        .order('numero', { ascending: false });

      // Gera o próximo número sequencial
      let sequencial = '001';
      if (ultimasSimulacoes && ultimasSimulacoes.length > 0) {
        const ultimoNumero = ultimasSimulacoes[0].numero;
        if (ultimoNumero) {
          const ultimoSequencial = parseInt(ultimoNumero.slice(-3));
          sequencial = String(ultimoSequencial + 1).padStart(3, '0');
        }
      }
      
      const numeroSimulacao = `SIM${ano}${mes}${sequencial}`;

      // Garante que os valores numéricos sejam números
      const dadosFormatados = {
        ...simulacao,
        numero: numeroSimulacao,
        valor_emprestimo: Number(simulacao.valor_emprestimo),
        valor_entrada: Number(simulacao.valor_entrada),
        numero_parcelas: Number(simulacao.numero_parcelas),
        taxa_entrada: Number(simulacao.taxa_entrada),
        valor_parcela: Number(simulacao.valor_parcela),
      };

      console.log('Dados formatados para envio:', dadosFormatados);
      console.log('Tipos dos campos numéricos:', {
        valor_emprestimo: typeof dadosFormatados.valor_emprestimo,
        valor_entrada: typeof dadosFormatados.valor_entrada,
        numero_parcelas: typeof dadosFormatados.numero_parcelas,
        taxa_entrada: typeof dadosFormatados.taxa_entrada,
        valor_parcela: typeof dadosFormatados.valor_parcela,
      });

      const { data, error } = await supabase
        .from('simulacoes')
        .insert([dadosFormatados])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      return { data: null, error };
    }
  },

  // Listar todas as simulações
  async listar(): Promise<{ data: Simulacao[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('simulacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Converte os valores para número mantendo null se não existir
      const simulacoesFormatadas = data?.map(simulacao => ({
        ...simulacao,
        valor_emprestimo: simulacao.valor_emprestimo ? Number(simulacao.valor_emprestimo) : null,
        valor_entrada: simulacao.valor_entrada ? Number(simulacao.valor_entrada) : null,
        numero_parcelas: simulacao.numero_parcelas ? Number(simulacao.numero_parcelas) : null,
        taxa_entrada: simulacao.taxa_entrada ? Number(simulacao.taxa_entrada) : null,
        valor_parcela: simulacao.valor_parcela ? Number(simulacao.valor_parcela) : null,
      }));

      return { data: simulacoesFormatadas || [], error: null };
    } catch (error) {
      console.error('Erro ao listar simulações:', error);
      return { data: [], error };
    }
  },

  // Atualizar status da simulação
  async atualizarStatus(id: number, status: Simulacao['status']) {
    try {
      const { error } = await supabase
        .from('simulacoes')
        .update({ status })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Erro ao atualizar status:', error)
        throw error
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error;
    }
  },

  // Excluir simulação
  async excluir(id: number) {
    try {
      const { error } = await supabase
        .from('simulacoes')
        .delete()
        .eq('id', id)
        .select('id'); // Selecionamos apenas o ID para confirmar a exclusão

      if (error) {
        console.error('Erro ao excluir simulação:', error);
        throw error;
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      throw error;
    }
  }
}

export const UsuariosAPI = {
  // Criar novo usuário
  async criar(usuario: Omit<Usuario, 'id' | 'data_criacao' | 'ativo'>) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([usuario])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar usuário:', error)
        throw new Error(`Erro ao criar usuário: ${error.message}`)
      }
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      return { data: null, error };
    }
  },

  // Listar todos os usuários
  async listar() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome', { ascending: true })

      if (error) {
        console.error('Erro ao listar usuários:', error)
        throw new Error(`Erro ao listar usuários: ${error.message}`)
      }
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      return { data: null, error };
    }
  },

  // Atualizar usuário
  async atualizar(id: number, usuario: Partial<Usuario>) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(usuario)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar usuário:', error)
        throw new Error(`Erro ao atualizar usuário: ${error.message}`)
      }
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      return { data: null, error };
    }
  },

  // Excluir usuário (na verdade apenas desativa)
  async excluir(id: number) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: false })
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir usuário:', error)
        throw new Error(`Erro ao excluir usuário: ${error.message}`)
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      return { data: null, error };
    }
  }
}

export const DocumentosAPI = {
  upload: async (file: File, creditoId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${creditoId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, file);

    if (error) throw error;
    return data;
  }
};

export const CreditosAPI = {
  // Criar nova ficha de crédito
  async criar(credito: Omit<Credito, 'id' | 'created_at' | 'updated_at' | 'status' | 'user_id'>): Promise<{ data: Credito | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('creditos')
        .insert([{
          nome: credito.nome,
          cpf: credito.cpf,
          rg: credito.rg,
          orgao_emissor: credito.orgao_emissor,
          data_nascimento: credito.data_nascimento,
          naturalidade: credito.naturalidade,
          estado_civil: credito.estado_civil,
          conjuge: credito.conjuge,
          filiacao_materna: credito.filiacao_materna,
          filiacao_paterna: credito.filiacao_paterna,
          
          // Endereço
          endereco: credito.endereco,
          numero: credito.numero,
          complemento: credito.complemento || '',
          bairro: credito.bairro,
          cep: credito.cep,
          cidade_uf: credito.cidade_uf,
          
          // Contato
          telefone1: credito.telefone1,
          telefone2: credito.telefone2 || '',
          email: credito.email,
          
          // Profissão e Renda
          profissao: credito.profissao,
          empresa: credito.empresa,
          renda_individual: credito.renda_individual,
          renda_familiar: credito.renda_familiar,
          pont_score: credito.pont_score,
          restricao: credito.restricao,
          
          // Dados do Bem
          tipo_bem: credito.tipo_bem,
          valor_bem: credito.valor_bem,
          valor_entrada: credito.valor_entrada,
          prazo: credito.prazo,
          reducao: credito.reducao,
          
          // Dados do Consultor
          consultor: credito.consultor,
          filial: credito.filial,
          
          // Sistema
          status: 'Em Análise' as const,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar ficha:', error);
      return { data: null, error };
    }
  },

  // Listar todas as fichas de crédito
  async listar() {
    try {
      const { data, error } = await supabase
        .from('creditos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao listar fichas:', error);
      return { data: null, error };
    }
  },

  // Buscar uma ficha específica
  async buscar(id: number) {
    try {
      const { data, error } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar ficha:', error);
      return { data: null, error };
    }
  },

  // Atualizar ficha de crédito
  async atualizar(id: string, credito: any) {
    try {
      const { data, error } = await supabase
        .from('creditos')
        .update(credito)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar ficha:', error);
      return { data: null, error };
    }
  },

  // Atualizar status da ficha
  async atualizarStatus(id: number, status: SimulacaoStatus) {
    try {
      const { data, error } = await supabase
        .from('creditos')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return { data: null, error };
    }
  },

  // Excluir ficha de crédito
  async excluir(id: number) {
    try {
      const { error } = await supabase
        .from('creditos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      console.error('Erro ao excluir ficha:', error);
      return { data: null, error };
    }
  }
};
