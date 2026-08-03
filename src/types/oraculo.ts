export type Instalacao = 'pessoal' | 'dsg' | 'cast';

export type NivelAutoridade = 1 | 2 | 3 | 4;

export type TipoFonte = 'curado' | 'doc' | 'codigo' | 'banco' | 'inferencia';

export type StatusCapacidade = 'permitida' | 'aprovacao' | 'desligada' | 'negada';

export type NomeFerramenta =
  | 'buscar_conhecimento'
  | 'buscar_codigo'
  | 'ler_arquivo'
  | 'consultar_banco'
  | 'ler_documento'
  | 'estado_servicos';

export type StatusFerramenta = 'concluida' | 'executando' | 'na_fila' | 'bloqueada' | 'erro';

export type EstadoResposta =
  | 'resolvida'
  | 'streaming'
  | 'executando'
  | 'aprovacao'
  | 'sem_resultado'
  | 'trecho_oculto'
  | 'bloqueada'
  | 'erro_modelo';

export interface LinhaTrecho {
  n: number;
  texto: string;
  destaque?: boolean;
}

export interface Fonte {
  id: string;
  tipo: TipoFonte;
  autoridade: NivelAutoridade;
  titulo: string;
  caminho: string;
  meta: string;
  porque: string;
  acao: string;
  etiqueta: string;
  detalhe: string;
  linhas: LinhaTrecho[];
}

export interface ColunaResultado {
  campo: string;
  titulo: string;
  alinhar?: 'esquerda' | 'direita';
}

export interface ResultadoSql {
  sql: string;
  colunas: ColunaResultado[];
  linhas: Record<string, string>[];
  rodape: string;
}

export interface Ferramenta {
  id: string;
  nome: NomeFerramenta;
  argumento: string;
  status: StatusFerramenta;
  metrica: string;
  expandida?: boolean;
  aprovadaPor?: string;
  progresso?: string;
  resultadoSql?: ResultadoSql;
}

export interface Capacidade {
  id: string;
  rotulo: string;
  status: StatusCapacidade;
  nota?: string;
}

export interface ResumoConversa {
  id: string;
  titulo: string;
  hora: string;
  grupo: string;
  fontes: number;
  ferramentas?: number;
  aprovacoes?: number;
  bloqueios?: number;
}

export interface Cobertura {
  citadas: number;
  total: number;
  semFonte: number;
}

export interface RegistroAuditoria {
  id: string;
  hora: string;
  usuario: string;
  perfil: string;
  instalacao: string;
  pergunta: string;
  ferramentas: { sigla: string; tipo: TipoFonte | 'shell'; bloqueada?: boolean }[];
  fontes: number;
  resultado: string;
  tomResultado: 'ok' | 'aviso' | 'erro' | 'neutro';
  duracao: string;
  modelo: string;
  trilha?: string[];
  sqlExecutado?: string;
  notaSql?: string;
}

export interface PerfilAcesso {
  id: string;
  nome: string;
  descricao: string;
  usuarios: number;
}

export interface LinhaMatriz {
  capacidade: string;
  desligadaNaInstalacao: boolean;
  porPerfil: Record<string, StatusCapacidade>;
}

export interface EstadoModelo {
  nome: string;
  local: boolean;
  contexto: string;
  repositorios: number;
}

export interface Escopo {
  repositorios: string[];
  alvos: string[];
}
