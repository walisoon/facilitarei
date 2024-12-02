export type SimulacaoStatus = 'Aprovada' | 'Em Análise' | 'Reprovada';

export interface Simulacao {
  id: number;
  numero?: string;
  nome_cliente?: string;
  client?: string; // para compatibilidade com o código existente
  value?: string; // para compatibilidade com o código existente
  cpf?: string;
  consultor?: string;
  valor_emprestimo?: number;
  taxa_entrada?: number;
  numero_parcelas?: number;
  valor_entrada?: number;
  valor_parcela?: number;
  status: SimulacaoStatus;
  date?: string; // para compatibilidade com o código existente
  paymentDay?: string; // para compatibilidade com o código existente
  data_criacao?: string;
  data_atualizacao?: string;
  // campos adicionais do formulário
  nome?: string;
  valor?: number;
  parcelas?: number;
  valorParcela?: number;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
  created_at?: string;
}
