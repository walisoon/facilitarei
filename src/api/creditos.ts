import { supabase } from '@/lib/supabase';

const CreditosAPI = {
  // Criar nova ficha de crédito
  async criar(credito: any) {
    try {
      console.log('Dados recebidos para criar ficha:', credito);
      console.log('Tipo dos campos recebidos:', {
        restricao: typeof credito.restricao,
        reducao: typeof credito.reducao
      });
      
      const { data: { user } } = await supabase.auth.getUser();

      // Função auxiliar para converter string para número
      const toNumber = (value: string | undefined | null) => {
        if (!value) return 0;
        const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
        return cleanValue ? parseFloat(cleanValue) : 0;
      };

      // Função auxiliar para converter para número (0 ou 1)
      const toBinaryNumber = (value: any) => {
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' ? 1 : 0;
        }
        return value ? 1 : 0;
      };
      
      const { data, error } = await supabase
        .from('creditos')
        .insert([{
          nome: credito.nome,
          cpf: credito.cpf,
          rg: credito.rg,
          orgao_emissor: credito.orgaoEmissor,
          data_nascimento: credito.data_nascimento,
          naturalidade: credito.naturalidade,
          estado_civil: credito.estadoCivil,
          conjuge: credito.conjuge,
          filiacao_materna: credito.filiacaoMaterna,
          filiacao_paterna: credito.filiacaoPaterna,
          
          // Endereço
          endereco: credito.endereco,
          numero: credito.numero,
          complemento: credito.complemento,
          bairro: credito.bairro,
          cep: credito.cep,
          cidade_uf: credito.cidadeUF,
          
          // Contato
          telefone1: credito.telefone1,
          telefone2: credito.telefone2,
          email: credito.email,
          
          // Profissão e Renda
          profissao: credito.profissao,
          empresa: credito.empresa,
          renda_individual: toNumber(credito.rendaIndividual),
          renda_familiar: toNumber(credito.rendaFamiliar),
          pont_score: toNumber(credito.pontScore),
          restricao: toBinaryNumber(credito.restricao),
          
          // Dados do Bem
          tipo_bem: Object.keys(credito.tipoBem || {}).find(key => credito.tipoBem[key]) || '',
          valor_bem: toNumber(credito.valorBem),
          valor_entrada: toNumber(credito.entrada),
          prazo: credito.prazo ? parseInt(credito.prazo.toString()) : 240,
          reducao: toBinaryNumber(credito.reducao),
          
          // Dados do Consultor
          consultor: credito.consultor,
          filial: credito.filial,
          
          // Sistema
          status: 'Em Análise',
          user_id: user?.id
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

  // Atualizar status da ficha
  async atualizarStatus(id: number, status: string) {
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

  // Atualizar uma ficha de crédito
  async atualizar(id: number, credito: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Função auxiliar para converter string para número
      const toNumber = (value: string | undefined | null) => {
        if (!value) return 0;
        const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
        return cleanValue ? parseFloat(cleanValue) : 0;
      };

      // Função auxiliar para converter para número (0 ou 1)
      const toBinaryNumber = (value: any) => {
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' ? 1 : 0;
        }
        return value ? 1 : 0;
      };
      
      const { data, error } = await supabase
        .from('creditos')
        .update({
          nome: credito.nome,
          cpf: credito.cpf,
          rg: credito.rg,
          orgao_emissor: credito.orgaoEmissor,
          data_nascimento: credito.data_nascimento,
          naturalidade: credito.naturalidade,
          estado_civil: credito.estadoCivil,
          conjuge: credito.conjuge,
          filiacao_materna: credito.filiacaoMaterna,
          filiacao_paterna: credito.filiacaoPaterna,
          
          // Endereço
          endereco: credito.endereco,
          numero: credito.numero,
          complemento: credito.complemento,
          bairro: credito.bairro,
          cep: credito.cep,
          cidade_uf: credito.cidadeUF,
          
          // Contato
          telefone1: credito.telefone1,
          telefone2: credito.telefone2,
          email: credito.email,
          
          // Profissão e Renda
          profissao: credito.profissao,
          empresa: credito.empresa,
          renda_individual: toNumber(credito.rendaIndividual),
          renda_familiar: toNumber(credito.rendaFamiliar),
          pont_score: toNumber(credito.pontScore),
          restricao: toBinaryNumber(credito.restricao),
          
          // Dados do Bem
          tipo_bem: Object.keys(credito.tipoBem || {}).find(key => credito.tipoBem[key]) || '',
          valor_bem: toNumber(credito.valorBem),
          valor_entrada: toNumber(credito.entrada),
          prazo: credito.prazo ? parseInt(credito.prazo.toString()) : 240,
          reducao: toBinaryNumber(credito.reducao),
          
          // Dados do Consultor
          consultor: credito.consultor,
          filial: credito.filial,
        })
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

  // Excluir uma ficha de crédito
  async excluir(id: number) {
    try {
      const { data, error } = await supabase
        .from('creditos')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao excluir ficha:', error);
      return { data: null, error };
    }
  }
};

export default CreditosAPI;
