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

export type TipoDeProvedor = 'openai-compat' | 'anthropic' | 'cli';

export interface ChaveDoProvedor {
  definida: boolean;
  dica: string | null;
}

export interface ProvedorResumido {
  id: string;
  nome: string;
  tipo: TipoDeProvedor;
  baseUrl: string | null;
  modelo: string | null;
  comando: string | null;
  dialeto: string | null;
  chave: ChaveDoProvedor;
  cabecalhosExtras: string[] | null;
  ativo: boolean;
  criadoEm: string;
}

export interface ListaDeProvedores {
  provedores: ProvedorResumido[];
  tiposPermitidos: string[];
}

export interface PresetDeProvedor {
  id: string;
  rotulo: string;
  tipo: TipoDeProvedor;
  baseUrl: string | null;
  exigeChave: boolean;
  cabecalhos: Record<string, string>;
  modelosSugeridos: string[];
  observacao: string | null;
  ondeObterChave: string | null;
  gratuito: boolean;
}

export interface NovoProvedor {
  nome: string;
  tipo: TipoDeProvedor;
  preset?: string;
  baseUrl?: string;
  modelo?: string;
  chave?: string;
  comando?: string;
  dialeto?: string;
  cabecalhosExtras?: Record<string, string>;
  parametros?: Record<string, unknown>;
}

export interface ResultadoDoTeste {
  ok: boolean;
  latenciaMs: number | null;
  modelo: string | null;
  amostra: string | null;
  tokensEntrada: number | null;
  tokensSaida: number | null;
  erro: string | null;
}

export function listarProvedores(): Promise<ListaDeProvedores> {
  return apiFetch('/ambiente/provedores');
}

export async function listarPresetsDeProvedor(): Promise<PresetDeProvedor[]> {
  const resposta = await apiFetch<{ presets: PresetDeProvedor[] }>('/ambiente/provedores/presets');

  return resposta.presets;
}

export function criarProvedor(provedor: NovoProvedor): Promise<ProvedorResumido> {
  return apiFetch('/ambiente/provedores', { metodo: 'POST', corpo: provedor });
}

export function ativarProvedor(id: string): Promise<void> {
  return apiFetch(`/ambiente/provedores/${encodeURIComponent(id)}/ativar`, { metodo: 'POST' });
}

export function removerProvedor(id: string): Promise<void> {
  return apiFetch(`/ambiente/provedores/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export function testarProvedor(id: string): Promise<ResultadoDoTeste> {
  return apiFetch(`/ambiente/provedores/${encodeURIComponent(id)}/testar`, { metodo: 'POST' });
}

export interface ModuloResumido {
  id: string;
  nome: string;
  descricao: string;
  especialistaDocumentoId: string | null;
  documentos: number;
  criadoEm: string;
}

export interface ListaDeModulos {
  modulos: ModuloResumido[];
  mapa: string;
}

export interface EdicaoDeModulo {
  nome?: string;
  descricao?: string;
}

export interface MudancaDeModulo {
  movidos: number;
  moduloId: string | null;
}

export function listarModulos(): Promise<ListaDeModulos> {
  return apiFetch('/ambiente/modulos');
}

export function criarModulo(nome: string, descricao: string): Promise<ModuloResumido> {
  return apiFetch('/ambiente/modulos', { metodo: 'POST', corpo: { nome, descricao } });
}

export function atualizarModulo(id: string, edicao: EdicaoDeModulo): Promise<ModuloResumido> {
  return apiFetch(`/ambiente/modulos/${encodeURIComponent(id)}`, {
    metodo: 'PATCH',
    corpo: edicao,
  });
}

export function removerModulo(id: string): Promise<void> {
  return apiFetch(`/ambiente/modulos/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export function definirEspecialista(
  id: string,
  documentoId: string | null,
): Promise<ModuloResumido> {
  return apiFetch(`/ambiente/modulos/${encodeURIComponent(id)}/especialista`, {
    metodo: 'POST',
    corpo: { documentoId },
  });
}

export function moverDocumentos(
  documentos: string[],
  moduloId: string | null,
): Promise<MudancaDeModulo> {
  return apiFetch('/ambiente/modulos/mover', {
    metodo: 'POST',
    corpo: { documentos, moduloId },
  });
}

export interface PersonaDaInstalacao {
  texto: string | null;
  teto: number;
  mascaramentos: number;
}

export function obterPersona(): Promise<PersonaDaInstalacao> {
  return apiFetch('/ambiente/persona');
}

export function definirPersona(texto: string): Promise<PersonaDaInstalacao> {
  return apiFetch('/ambiente/persona', { metodo: 'PUT', corpo: { texto } });
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
