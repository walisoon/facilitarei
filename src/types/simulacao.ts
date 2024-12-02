export interface Simulacao {
  id: number;
  client: string;
  value: string;
  status: string;
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
}
