import type { LinhaMatriz, PerfilAcesso, StatusCapacidade, TipoFonte } from '@/types/oraculo';

export const PERFIS: PerfilAcesso[] = [
  { id: 'dev', nome: 'desenvolvedor', descricao: '18 usuários', usuarios: 18 },
  { id: 'n1', nome: 'suporte n1', descricao: '24 usuários', usuarios: 24 },
  { id: 'n2', nome: 'suporte n2', descricao: '9 usuários · seu perfil', usuarios: 9 },
  { id: 'admin', nome: 'admin da instalação', descricao: '3 usuários', usuarios: 3 },
  { id: 'leitor', nome: 'leitor', descricao: '31 usuários', usuarios: 31 },
];

export const COLUNAS_MATRIZ: {
  id: string;
  titulo: string;
  cor: TipoFonte | 'shell' | 'servico';
}[] = [
  { id: 'doc', titulo: 'busca doc', cor: 'doc' },
  { id: 'curado', titulo: 'curado', cor: 'curado' },
  { id: 'codigo', titulo: 'código', cor: 'codigo' },
  { id: 'sql', titulo: 'sql leitura', cor: 'banco' },
  { id: 'shell', titulo: 'shell', cor: 'shell' },
  { id: 'servicos', titulo: 'estado serviços', cor: 'servico' },
  { id: 'pessoais', titulo: 'dados pessoais', cor: 'inferencia' },
];

const linha = (
  capacidade: string,
  desligada: boolean,
  valores: StatusCapacidade[],
): LinhaMatriz => ({
  capacidade,
  desligadaNaInstalacao: desligada,
  porPerfil: Object.fromEntries(PERFIS.map((p, i) => [p.id, valores[i] as StatusCapacidade])),
});

export const MATRIZ: LinhaMatriz[] = [
  linha('doc', false, ['permitida', 'permitida', 'permitida', 'permitida', 'permitida']),
  linha('curado', false, ['permitida', 'permitida', 'permitida', 'permitida', 'negada']),
  linha('codigo', false, ['permitida', 'negada', 'permitida', 'permitida', 'negada']),
  linha('sql', false, ['permitida', 'negada', 'aprovacao', 'permitida', 'negada']),
  linha('shell', true, ['desligada', 'desligada', 'desligada', 'desligada', 'desligada']),
  linha('servicos', false, ['permitida', 'permitida', 'permitida', 'permitida', 'negada']),
  linha('pessoais', false, ['negada', 'negada', 'negada', 'aprovacao', 'negada']),
];

export const CAPACIDADES_INSTALACAO = [
  { rotulo: 'comando de shell', estado: 'desligada no servidor', ligada: false, acao: 'ligar' },
  { rotulo: 'dados pessoais (rh_prod)', estado: 'ligada', ligada: true, acao: 'desligar' },
  { rotulo: 'indexação de código (41 repos)', estado: 'ligada', ligada: true, acao: 'desligar' },
  {
    rotulo: 'modelo externo (fallback)',
    estado: 'desligada por política',
    ligada: false,
    acao: '',
  },
];

export const DETALHE_CAPACIDADE = {
  titulo: 'sql leitura · suporte n2',
  opcoes: [
    { id: 'permitir', rotulo: 'permitir sem aprovação', tom: 'acc' },
    { id: 'aprovar', rotulo: 'exigir aprovação humana por consulta', tom: 'warn' },
    { id: 'negar', rotulo: 'negar ao perfil', tom: 'err' },
  ],
  escolhida: 'aprovar',
  detalhes: [
    { chave: 'bancos alcançáveis', valor: 'fiscal_prod, fiscal_hml, dominio_prod' },
    { chave: 'conexão', valor: 'oraculo_ro · apenas select · timeout 15 s' },
    { chave: 'colunas mascaradas', valor: 'cpf, email, telefone, senha*', destaque: true },
    { chave: 'aprovadores', valor: 't.aguiar, p.duarte' },
  ],
};
