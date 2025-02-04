export type SimulacaoStatus = 'Aprovada' | 'Em Análise' | 'Reprovada';

export interface Simulacao {
  id?: number;
  numero: string;
  nome_cliente: string;
  cpf: string;
  consultor: string;
  valor_emprestimo: number;
  taxa_entrada: number;
  numero_parcelas: number;
  valor_entrada: number;
  valor_parcela: number;
  status: SimulacaoStatus;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  tipo_bem?: string;
  created_at?: string;
  updated_at?: string;
}
