-- Create the simulacoes table
create table if not exists public.simulacoes (
    id bigint primary key generated always as identity,
    numero varchar(20) not null unique,
    nome_cliente text not null,
    cpf text,
    consultor text,
    valor_emprestimo numeric(15,2) not null,
    taxa_entrada numeric(5,2) not null,
    numero_parcelas integer not null,
    valor_entrada numeric(15,2) not null,
    valor_parcela numeric(15,2) not null,
    status text not null check (status in ('Em Análise', 'Aprovada', 'Reprovada')),
    data_criacao timestamp with time zone default timezone('utc'::text, now()) not null,
    data_atualizacao timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster searches
create index if not exists simulacoes_numero_idx on public.simulacoes(numero);
create index if not exists simulacoes_nome_cliente_idx on public.simulacoes(nome_cliente);
create index if not exists simulacoes_cpf_idx on public.simulacoes(cpf);
create index if not exists simulacoes_status_idx on public.simulacoes(status);

-- Add RLS (Row Level Security) policies
alter table public.simulacoes enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow anon access to simulacoes" on public.simulacoes;
drop policy if exists "Allow authenticated users to view simulacoes" on public.simulacoes;
drop policy if exists "Allow authenticated users to insert simulacoes" on public.simulacoes;
drop policy if exists "Allow authenticated users to update simulacoes" on public.simulacoes;

-- Create policy to allow anon and authenticated users to view simulacoes
create policy "Allow anon access to simulacoes"
    on public.simulacoes
    for all
    to anon, authenticated
    using (true)
    with check (true);

-- Create function to automatically update data_atualizacao
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.data_atualizacao = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for automatically updating data_atualizacao
drop trigger if exists set_data_atualizacao on public.simulacoes;
create trigger set_data_atualizacao
    before update on public.simulacoes
    for each row
    execute function public.handle_updated_at();
