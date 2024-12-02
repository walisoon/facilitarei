import { createClient } from '@supabase/supabase-js'

// Use o domínio base do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkimxruewcensnfllvv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW14cnVld2NlbnNibmZsbHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTIxMzksImV4cCI6MjA0ODY2ODEzOX0.tLnz1o3ximSJFMHb1kRzbfmF-4gIP_i-YD6n5TH24fE'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided')
}

// Configuração do cliente Supabase com retry e timeout
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Tipos para as simulações
export interface Simulacao {
  id?: number
  numero: string
  nome_cliente: string
  cpf: string
  consultor: string
  valor_emprestimo: number
  taxa_entrada: number
  numero_parcelas: number
  valor_entrada: number
  valor_parcela: number
  status: 'Em Análise' | 'Aprovada' | 'Reprovada'
  data_criacao?: string
  data_atualizacao?: string
}

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
  async criar(simulacao: Omit<Simulacao, 'id' | 'data_criacao' | 'data_atualizacao'>) {
    try {
      // Garante que os valores numéricos estão no formato correto
      const dadosFormatados = {
        ...simulacao,
        valor_emprestimo: Number(simulacao.valor_emprestimo),
        taxa_entrada: Number(simulacao.taxa_entrada),
        numero_parcelas: Number(simulacao.numero_parcelas),
        valor_entrada: Number(simulacao.valor_entrada),
        valor_parcela: Number(simulacao.valor_parcela)
      };

      const { data, error } = await supabase
        .from('simulacoes')
        .insert([dadosFormatados])
        .select()
        .single()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw new Error(`Erro ao criar simulação: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro ao criar simulação:', error)
      throw error
    }
  },

  // Listar todas as simulações
  async listar() {
    try {
      const { data, error } = await supabase
        .from('simulacoes')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (error) {
        console.error('Erro do Supabase:', error)
        throw new Error(`Erro ao listar simulações: ${error.message}`)
      }

      // Garantir que os valores numéricos estão formatados corretamente
      return data?.map(simulacao => ({
        ...simulacao,
        valor_emprestimo: Number(simulacao.valor_emprestimo),
        taxa_entrada: Number(simulacao.taxa_entrada),
        numero_parcelas: Number(simulacao.numero_parcelas),
        valor_entrada: Number(simulacao.valor_entrada),
        valor_parcela: Number(simulacao.valor_parcela),
        data_criacao: simulacao.data_criacao || null
      })) || []
    } catch (error) {
      console.error('Erro ao listar simulações:', error)
      throw error
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
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  },

  // Excluir simulação
  async excluir(id: number) {
    try {
      const { error } = await supabase
        .from('simulacoes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir simulação:', error)
        throw new Error(`Erro ao excluir simulação: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro ao excluir simulação:', error)
      throw error
    }
  }
}

export const UsuariosAPI = {
  // Criar novo usuário
  async criar(usuario: Omit<Usuario, 'id' | 'data_criacao' | 'ativo'>) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuario])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      throw new Error(`Erro ao criar usuário: ${error.message}`)
    }

    return data
  },

  // Listar todos os usuários
  async listar() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao listar usuários:', error)
      throw new Error(`Erro ao listar usuários: ${error.message}`)
    }

    return data
  },

  // Atualizar usuário
  async atualizar(id: number, usuario: Partial<Usuario>) {
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

    return data
  },

  // Excluir usuário (na verdade apenas desativa)
  async excluir(id: number) {
    const { error } = await supabase
      .from('usuarios')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir usuário:', error)
      throw new Error(`Erro ao excluir usuário: ${error.message}`)
    }

    return true
  }
}
