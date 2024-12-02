export type SimulacaoStatus = 'Aprovada' | 'Em Análise' | 'Reprovada';

export interface Simulacao {
  id: number;
  client: string;
  value: string;
  status: SimulacaoStatus;
  date: string;
  paymentDay: string;
  nome?: string;
  valor?: number;
  parcelas?: number;
  valorParcela?: number;
  dataNascimento?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  created_at?: string;
  valor_emprestimo?: number;
  taxa_entrada?: number;
  numero_parcelas?: number;
  valor_entrada?: number;
  valor_parcela?: number;
}
