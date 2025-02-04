export interface Credito {
  id?: number;
  nome: string;
  cpf: string;
  rg: string;
  orgao_emissor: string;
  data_nascimento: string;
  naturalidade: string;
  estado_civil: string;
  conjuge?: string;
  filiacao_materna: string;
  filiacao_paterna: string;
  
  // Endereço
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade_uf: string;
  
  // Contato
  telefone1: string;
  telefone2?: string;
  email: string;
  
  // Profissão e Renda
  profissao: string;
  empresa: string;
  renda_individual: number;
  renda_familiar: number;
  pont_score: number;
  restricao: boolean;
  
  // Dados do Bem
  tipo_bem: string;
  valor_bem: number;
  valor_entrada: number;
  prazo: number;
  reducao: boolean;
  
  // Dados do Consultor
  consultor: string;
  filial: string;
  
  // Sistema
  status: 'Em Análise' | 'Aprovada' | 'Reprovada';
  user_id: string;
  created_at?: string;
  updated_at?: string;
}
