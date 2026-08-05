import { apiFetch } from './http';

export type NomeCapacidade = 'conhecimento' | 'codigo' | 'estado' | 'banco';

export interface CapacidadeEfetiva {
  capacidade: NomeCapacidade;
  ligada: boolean;
  tetoDoEnv: boolean;
  motivoIndisponivel?: string;
  aviso?: string;
}

export interface FonteEfetiva {
  id: string | null;
  caminho: string;
  rotulo: string;
  origem: 'env' | 'banco';
  removivel: boolean;
}

export type MotivoDeRecusa =
  'denylist' | 'extensao' | 'binario' | 'vazio' | 'permissao' | 'link_simbolico';

export interface ItemDaAmostra {
  caminho: string;
  bytes: number;
  motivo?: MotivoDeRecusa;
}

export interface PreviaDeFonte {
  caminho: string;
  existe: boolean;
  legivel: boolean;
  arquivosElegiveis: number;
  arquivosRecusados: number;
  bytesTotais: number;
  porExtensao: Record<string, number>;
  amostra: ItemDaAmostra[];
  motivosDeRecusa: Record<string, number>;
  truncada?: boolean;
}

export interface ResumoConexao {
  host: string;
  porta: string | null;
  base: string;
  usuario: string;
}

export interface AlvoBancoResumido {
  id: string;
  nome: string;
  schemas: string[];
  colunasMascaradas: string[];
  ativo: boolean;
  criadoEm: string;
  conexao: ResumoConexao;
}

export interface ServicoResumido {
  id: string;
  nome: string;
  rotulo: string;
  ativo: boolean;
  criadoEm: string;
}

export interface ContagemCorpus {
  fonte: string;
  autoridade: number;
  documentos: number;
}

export interface EstadoDoAmbiente {
  capacidades: CapacidadeEfetiva[];
  fontes: FonteEfetiva[];
  alvosBanco: AlvoBancoResumido[];
  servicos: ServicoResumido[];
  corpus: {
    total: number;
    porFonte: ContagemCorpus[];
  };
  provedor: {
    tipo: string;
    modelo: string;
  };
  ultimaIndexacao: string | null;
}

export function obterAmbiente(): Promise<EstadoDoAmbiente> {
  return apiFetch('/ambiente');
}

export function definirCapacidade(
  capacidade: NomeCapacidade,
  ligada: boolean,
): Promise<CapacidadeEfetiva> {
  return apiFetch('/ambiente/capacidades', {
    metodo: 'PATCH',
    corpo: { capacidade, ligada },
  });
}

export function obterPreviaDeFonte(caminho: string): Promise<PreviaDeFonte> {
  return apiFetch(`/ambiente/fontes/previa?caminho=${encodeURIComponent(caminho)}`);
}

export function criarFonte(caminho: string, rotulo?: string): Promise<FonteEfetiva> {
  const escolhido = rotulo?.trim();

  return apiFetch('/ambiente/fontes', {
    metodo: 'POST',
    corpo: escolhido ? { caminho, rotulo: escolhido } : { caminho },
  });
}

export function removerFonte(id: string): Promise<void> {
  return apiFetch(`/ambiente/fontes/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export function criarServico(nome: string, rotulo: string): Promise<ServicoResumido> {
  return apiFetch('/ambiente/servicos', { metodo: 'POST', corpo: { nome, rotulo } });
}

export function removerServico(id: string): Promise<void> {
  return apiFetch(`/ambiente/servicos/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export interface NovoAlvoBanco {
  nome: string;
  url: string;
  schemas?: string[];
  colunasMascaradas?: string[];
}

export function criarAlvoBanco(alvo: NovoAlvoBanco): Promise<AlvoBancoResumido> {
  return apiFetch('/ambiente/alvos-banco', { metodo: 'POST', corpo: alvo });
}

export function removerAlvoBanco(id: string): Promise<void> {
  return apiFetch(`/ambiente/alvos-banco/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export interface ArgumentoDoCatalogo {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
  minimo: number | null;
  maximo: number | null;
  padrao: number | null;
}

export interface EntradaDoCatalogoExibida {
  id: string;
  descricao: string;
  liberadaNoEnv: boolean;
  comandos: string[];
  argumentos: ArgumentoDoCatalogo[];
}

export interface CatalogoExibido {
  ferramenta: string;
  tetoDoEnv: boolean;
  ligada: boolean;
  liberadosNoEnv: string[];
  entradas: EntradaDoCatalogoExibida[];
}

export function obterCatalogoDeDiagnostico(): Promise<CatalogoExibido> {
  return apiFetch('/ambiente/diagnostico/catalogo');
}
