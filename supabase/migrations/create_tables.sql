-- Create the simulacoes table
CREATE TABLE simulacoes (
    id BIGSERIAL PRIMARY KEY,
    nome_cliente TEXT,
    cpf TEXT,
    consultor TEXT,
    valor_emprestimo DECIMAL(15,2) DEFAULT 0,
    valor_entrada DECIMAL(15,2) DEFAULT 0,
    numero_parcelas INTEGER DEFAULT 0,
    taxa_entrada DECIMAL(5,2) DEFAULT 0,
    valor_parcela DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'Em Análise',
    data_nascimento DATE,
    telefone TEXT,
    email TEXT,
    tipo_bem TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_simulacoes_updated_at
    BEFORE UPDATE ON simulacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE simulacoes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert and select
CREATE POLICY "Allow anonymous insert" ON simulacoes
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON simulacoes
    FOR SELECT
    TO anon
    USING (true);

-- Create indexes for better performance
CREATE INDEX idx_simulacoes_created_at ON simulacoes(created_at DESC);
CREATE INDEX idx_simulacoes_cpf ON simulacoes(cpf);
CREATE INDEX idx_simulacoes_status ON simulacoes(status);
