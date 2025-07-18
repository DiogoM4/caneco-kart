-- Criar tabela de corridas
CREATE TABLE public.corridas (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    local TEXT,
    nome TEXT
);

-- Criar tabela de resultados das corridas
CREATE TABLE public.resultados_corrida (
    id SERIAL PRIMARY KEY,
    corrida_id INTEGER NOT NULL REFERENCES public.corridas(id) ON DELETE CASCADE,
    piloto_nome TEXT NOT NULL,
    colocacao INTEGER NOT NULL,
    pontos INTEGER NOT NULL,
    pole_position BOOLEAN DEFAULT false,
    melhor_volta BOOLEAN DEFAULT false
);

-- Criar tabela de ranking geral
CREATE TABLE public.ranking_geral (
    id SERIAL PRIMARY KEY,
    piloto_nome TEXT NOT NULL UNIQUE,
    total_pontos INTEGER NOT NULL DEFAULT 0
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_corrida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_geral ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir acesso público (conforme solicitado para usar anon key)
CREATE POLICY "Permitir leitura pública de corridas" 
ON public.corridas 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção pública de corridas" 
ON public.corridas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de corridas" 
ON public.corridas 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir leitura pública de resultados" 
ON public.resultados_corrida 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção pública de resultados" 
ON public.resultados_corrida 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de resultados" 
ON public.resultados_corrida 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir leitura pública de ranking" 
ON public.ranking_geral 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção pública de ranking" 
ON public.ranking_geral 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de ranking" 
ON public.ranking_geral 
FOR UPDATE 
USING (true);

-- Inserir pilotos iniciais no ranking geral
INSERT INTO public.ranking_geral (piloto_nome, total_pontos) VALUES
('Carlos Silva', 0),
('Ana Costa', 0),
('João Santos', 0),
('Maria Oliveira', 0),
('Pedro Lima', 0),
('Sofia Mendes', 0),
('Lucas Rocha', 0),
('Beatriz Alves', 0),
('Diego Ferreira', 0),
('Camila Souza', 0);