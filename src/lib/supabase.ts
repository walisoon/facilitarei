import { createClient } from '@supabase/supabase-js'
import { Simulacao } from '@/types/simulacao'

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
    detectSessionInUrl: true
  }
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

      if (error) {
        console.error('Erro ao atualizar status:', error)
        throw new Error(`Erro ao atualizar status: ${error.message}`)
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      return { data: null, error };
    }
  },

  // Excluir simulação
  async excluir(id: number) {
    try {
      const { error } = await supabase
        .from('simulacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      return { data: null, error };
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
