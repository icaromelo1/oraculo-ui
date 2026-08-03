import type {
  Capacidade,
  Cobertura,
  EstadoResposta,
  Ferramenta,
  ResumoConversa,
} from '@/types/oraculo';

export const CONVERSAS: ResumoConversa[] = [
  {
    id: 'k1',
    titulo: 'Reprocessamento de lotes na ingestão de NF-e',
    hora: '14:22',
    grupo: 'hoje',
    fontes: 6,
    ferramentas: 4,
  },
  {
    id: 'k2',
    titulo: 'Diferença entre fila retry e fila dlq no barramento',
    hora: '11:07',
    grupo: 'hoje',
    fontes: 3,
  },
  {
    id: 'k3',
    titulo: 'Quem mantém o serviço de autenticação legado?',
    hora: '09:48',
    grupo: 'hoje',
    fontes: 2,
  },
  {
    id: 'k4',
    titulo: 'Migração 0142 travou em produção — rollback',
    hora: '18:31',
    grupo: 'ontem',
    fontes: 9,
    aprovacoes: 1,
  },
  {
    id: 'k5',
    titulo: 'Como o cache de tabelas de domínio invalida?',
    hora: '16:02',
    grupo: 'ontem',
    fontes: 5,
  },
  {
    id: 'k6',
    titulo: 'Contratos de integração com a folha CAST',
    hora: '10:55',
    grupo: 'ontem',
    fontes: 4,
    bloqueios: 1,
  },
  {
    id: 'k7',
    titulo: 'Padrão de log estruturado adotado pelo time',
    hora: '29 jul',
    grupo: '7 dias',
    fontes: 7,
  },
  {
    id: 'k8',
    titulo: 'Timeout do gateway em picos de emissão',
    hora: '28 jul',
    grupo: '7 dias',
    fontes: 11,
  },
];

export const CAPACIDADES: Capacidade[] = [
  { id: 'doc', rotulo: 'busca documental', status: 'permitida' },
  { id: 'curado', rotulo: 'conhecimento curado', status: 'permitida' },
  { id: 'codigo', rotulo: 'leitura de código · 41 repos', status: 'permitida' },
  { id: 'sql', rotulo: 'sql somente-leitura', status: 'aprovacao', nota: 'requer aprovação' },
  { id: 'shell', rotulo: 'comando de shell', status: 'desligada', nota: 'desligada aqui' },
  { id: 'pessoal', rotulo: 'dados de pessoal', status: 'negada', nota: 'negado ao perfil' },
];

export const FERRAMENTAS_RESOLVIDA: Ferramenta[] = [
  {
    id: 't1',
    nome: 'busca_documentos',
    argumento: '"reprocessamento lote nfe idempotência"',
    status: 'concluida',
    metrica: '7 trechos · 412 ms',
  },
  {
    id: 't2',
    nome: 'ler_codigo',
    argumento: 'dsg-fiscal-ingestao/src/lote/LoteWorker.java:88-140',
    status: 'concluida',
    metrica: '53 linhas · 96 ms',
  },
  {
    id: 't3',
    nome: 'consulta_sql',
    argumento: 'fiscal_prod · somente-leitura',
    status: 'concluida',
    metrica: '2,1 s',
    aprovadaPor: 't.aguiar',
    expandida: true,
    resultadoSql: {
      sql: [
        'select l.id, l.status, l.tentativas, max(e.criado_em) as ultima',
        'from lote l join lote_evento e on e.lote_id = l.id',
        "where l.status in ('RETRY','ERRO') and l.criado_em > now() - interval '36 hours'",
        'group by 1,2,3 order by l.tentativas desc limit 5;',
      ].join('\n'),
      colunas: [
        { campo: 'id', titulo: 'id' },
        { campo: 'status', titulo: 'status' },
        { campo: 'tentativas', titulo: 'tentativas', alinhar: 'direita' },
        { campo: 'ultima', titulo: 'ultima' },
      ],
      linhas: [
        { id: '884213', status: 'RETRY', tentativas: '147', ultima: '2026-08-03 14:19:58' },
        { id: '884198', status: 'RETRY', tentativas: '146', ultima: '2026-08-03 14:19:51' },
        { id: '884176', status: 'ERRO', tentativas: '12', ultima: '2026-08-03 03:41:02' },
      ],
      rodape: '3 linhas · plano: index scan lote_status_idx · sem escrita',
    },
  },
  {
    id: 't4',
    nome: 'conhecimento_curado',
    argumento: 'nota de t.aguiar · "lote preso em RETRY"',
    status: 'concluida',
    metrica: '1 nota · 88 ms',
  },
];

export const FERRAMENTAS_STREAMING: Ferramenta[] = [
  {
    id: 's1',
    nome: 'busca_documentos',
    argumento: '"dlq nfe drenar procedimento"',
    status: 'concluida',
    metrica: '4 trechos · 380 ms',
  },
  {
    id: 's2',
    nome: 'ler_codigo',
    argumento: 'dsg-barramento/scripts/drain_dlq.sh',
    status: 'concluida',
    metrica: '31 linhas · 74 ms',
  },
];

export const FERRAMENTAS_EXECUTANDO: Ferramenta[] = [
  {
    id: 'e1',
    nome: 'busca_documentos',
    argumento: '"dlq nfe drenar procedimento"',
    status: 'concluida',
    metrica: '4 trechos · 380 ms',
  },
  {
    id: 'e2',
    nome: 'conhecimento_curado',
    argumento: 'runbook "drenagem de DLQ fiscal"',
    status: 'concluida',
    metrica: '1 nota · 92 ms',
  },
  {
    id: 'e3',
    nome: 'ler_codigo',
    argumento: 'dsg-barramento/scripts/drain_dlq.sh',
    status: 'executando',
    metrica: 'em execução · 1,2 s',
    progresso:
      'resolvendo repositório dsg-barramento @ main (1a7c39f) → abrindo scripts/drain_dlq.sh',
  },
  {
    id: 'e4',
    nome: 'consulta_sql',
    argumento: 'na fila · exigirá aprovação',
    status: 'na_fila',
    metrica: '',
  },
];

export const COBERTURA: Cobertura = { citadas: 7, total: 8, semFonte: 1 };

export const PERGUNTA_INICIAL =
  'Por que o serviço de ingestão de NF-e está reprocessando os mesmos lotes desde ontem à noite?';

export const SEGUIMENTO: Partial<Record<EstadoResposta, string>> = {
  streaming: 'Posso drenar a DLQ com o consumidor pausado sem perder mensagem?',
  executando: 'Posso drenar a DLQ com o consumidor pausado sem perder mensagem?',
  aprovacao: 'Confirma se o consumidor nfe.lote.retry já está pausado em produção.',
  sem_resultado: 'Existe rotina documentada de expurgo dos lotes fiscais de 2019?',
  trecho_oculto: 'Como o worker autentica na SEFAZ? Onde fica a senha do keystore?',
  bloqueada: 'Quem está de plantão no barramento agora e qual o telefone?',
  erro_modelo: 'Monta um resumo do incidente para eu colar no chamado.',
};
