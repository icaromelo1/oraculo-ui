import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as chatService from '@/services/chat.service';
import * as conversasService from '@/services/conversas.service';
import { formatarHoraCurta } from '@/composables/useFormato';
import { useSessaoStore } from '@/stores/sessao';
import type { EventoAprovacaoPedido, EventoOraculo } from '@/types/eventos';
import type {
  Cobertura,
  EstadoResposta,
  Ferramenta,
  Fonte,
  NomeFerramenta,
  ResumoConversa,
  StatusFerramenta,
} from '@/types/oraculo';

export interface MensagemUsuarioChat {
  id: string;
  papel: 'usuario';
  texto: string;
  hora: string;
}

export interface ErroResposta {
  codigo: string;
  mensagem: string;
  retomavel: boolean;
}

export interface MensagemAssistenteChat {
  id: string;
  papel: 'assistente';
  estado: EstadoResposta;
  modelo: string;
  texto: string;
  ferramentas: Ferramenta[];
  fontes: Fonte[];
  cobertura: Cobertura | null;
  tokens: number | null;
  duracaoMs: number | null;
  erro: ErroResposta | null;
  aprovacaoPedido: EventoAprovacaoPedido | null;
  interrompida: boolean;
}

export type MensagemChat = MensagemUsuarioChat | MensagemAssistenteChat;

const GRUPO_HOJE = 'hoje';
const GRUPO_ONTEM = 'ontem';
const GRUPO_SEMANA = '7 dias';
const GRUPO_ANTIGO = 'mais antigas';

function grupoPorData(data: Date): string {
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioOntem = new Date(inicioHoje.getTime() - 86400000);
  const inicioSemana = new Date(inicioHoje.getTime() - 7 * 86400000);

  if (data >= inicioHoje) return GRUPO_HOJE;
  if (data >= inicioOntem) return GRUPO_ONTEM;
  if (data >= inicioSemana) return GRUPO_SEMANA;
  return GRUPO_ANTIGO;
}

function formatarHoraResumo(data: Date, grupo: string): string {
  if (grupo === GRUPO_HOJE) return formatarHoraCurta(data);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

function extrairResumo(valor: Record<string, unknown> | null): string {
  if (!valor) return '';
  const resumo = valor.resumo;
  return typeof resumo === 'string' ? resumo : '';
}

function mapearResumoConversa(api: conversasService.ResumoConversaApi): ResumoConversa {
  const data = new Date(api.hora);
  const grupo = grupoPorData(data);

  return {
    id: api.id,
    titulo: api.titulo,
    hora: formatarHoraResumo(data, grupo),
    grupo,
    fontes: api.fontes,
    ...(api.ferramentas ? { ferramentas: api.ferramentas } : {}),
    ...(api.aprovacoes ? { aprovacoes: api.aprovacoes } : {}),
    ...(api.bloqueios ? { bloqueios: api.bloqueios } : {}),
  };
}

function mapearFerramentaSalva(item: conversasService.FerramentaDaMensagemApi): Ferramenta {
  return {
    id: item.id,
    nome: item.nome as NomeFerramenta,
    argumento: extrairResumo(item.argumento),
    status: item.status as StatusFerramenta,
    metrica: extrairResumo(item.metrica),
    ...(item.aprovadaPor ? { aprovadaPor: item.aprovadaPor } : {}),
    resultado: extrairResumo(item.resultado),
  };
}

function calcularEstadoDeMensagemSalva(
  item: conversasService.MensagemDaConversaApi,
): EstadoResposta {
  if (item.ferramentas.some((f) => f.status === 'bloqueada')) return 'bloqueada';
  if (item.cobertura && item.cobertura.total === 0) return 'sem_resultado';
  return 'resolvida';
}

function mapearMensagensSalvas(itens: conversasService.MensagemDaConversaApi[]): MensagemChat[] {
  return itens.map((item) => {
    if (item.papel === 'usuario') {
      return {
        id: item.id,
        papel: 'usuario',
        texto: item.texto,
        hora: formatarHoraCurta(new Date(item.criadaEm)),
      };
    }

    return {
      id: item.id,
      papel: 'assistente',
      estado: calcularEstadoDeMensagemSalva(item),
      modelo: '',
      texto: item.texto,
      ferramentas: item.ferramentas.map(mapearFerramentaSalva),
      fontes: item.fontes,
      cobertura: item.cobertura,
      tokens: item.tokens,
      duracaoMs: item.duracaoMs,
      erro: null,
      aprovacaoPedido: null,
      interrompida: false,
    };
  });
}

function calcularEstadoFinal(mensagem: MensagemAssistenteChat): EstadoResposta {
  if (mensagem.erro) return 'erro_modelo';
  if (mensagem.ferramentas.some((f) => f.status === 'bloqueada')) return 'bloqueada';
  if (mensagem.cobertura && mensagem.cobertura.total === 0) return 'sem_resultado';
  return 'resolvida';
}

let contadorLocal = 0;

function idLocal(prefixo: string): string {
  contadorLocal += 1;
  return `${prefixo}-${Date.now()}-${contadorLocal}`;
}

export const useChatStore = defineStore('chat', () => {
  const conversas = ref<ResumoConversa[]>([]);
  const conversaAtiva = ref<string | null>(null);
  const mensagens = ref<MensagemChat[]>([]);
  const filtro = ref('');
  const fonteSelecionada = ref<string | null>(null);
  const fonteParaFerramenta = ref<Record<string, string>>({});
  const painelFontesAberto = ref(true);
  const listaConversasAberta = ref(false);
  const rascunho = ref('');
  const carregandoConversas = ref(false);
  const carregandoMensagens = ref(false);
  const enviando = ref(false);
  const erro = ref('');

  let controlador: AbortController | null = null;

  const grupos = computed(() => {
    const alvo = filtro.value.trim().toLowerCase();
    const visiveis = alvo
      ? conversas.value.filter((c) => c.titulo.toLowerCase().includes(alvo))
      : conversas.value;

    const ordem: string[] = [];
    const mapa = new Map<string, typeof visiveis>();

    for (const conversa of visiveis) {
      if (!mapa.has(conversa.grupo)) {
        mapa.set(conversa.grupo, []);
        ordem.push(conversa.grupo);
      }
      mapa.get(conversa.grupo)?.push(conversa);
    }

    return ordem.map((titulo) => ({ titulo, itens: mapa.get(titulo) ?? [] }));
  });

  const conversa = computed(() => conversas.value.find((c) => c.id === conversaAtiva.value));

  const ultimaAssistente = computed<MensagemAssistenteChat | null>(() => {
    for (let i = mensagens.value.length - 1; i >= 0; i -= 1) {
      const item = mensagens.value[i];
      if (item && item.papel === 'assistente') return item;
    }
    return null;
  });

  const fontes = computed<Fonte[]>(() => ultimaAssistente.value?.fontes ?? []);

  const coberturaAtual = computed<Cobertura | null>(
    () => ultimaAssistente.value?.cobertura ?? null,
  );

  const detalheFonte = computed(() =>
    fonteSelecionada.value
      ? (fontes.value.find((f) => f.id === fonteSelecionada.value) ?? null)
      : null,
  );

  async function carregarConversas(): Promise<void> {
    carregandoConversas.value = true;

    try {
      const resposta = await conversasService.listarConversas();
      conversas.value = resposta.map(mapearResumoConversa);
    } finally {
      carregandoConversas.value = false;
    }
  }

  async function selecionarConversa(id: string): Promise<void> {
    conversaAtiva.value = id;
    listaConversasAberta.value = false;
    fonteSelecionada.value = null;
    carregandoMensagens.value = true;
    erro.value = '';

    try {
      const resposta = await conversasService.obterConversa(id);
      mensagens.value = mapearMensagensSalvas(resposta.mensagens);
    } catch (falha) {
      erro.value = falha instanceof Error ? falha.message : 'não foi possível abrir a conversa';
    } finally {
      carregandoMensagens.value = false;
    }
  }

  function novaConversa(): void {
    conversaAtiva.value = null;
    mensagens.value = [];
    fonteSelecionada.value = null;
    erro.value = '';
    listaConversasAberta.value = false;
  }

  function selecionarFonte(id: string): void {
    fonteSelecionada.value = id;
    painelFontesAberto.value = true;
  }

  function limparFonte(): void {
    fonteSelecionada.value = null;
  }

  function alternarPainelFontes(): void {
    painelFontesAberto.value = !painelFontesAberto.value;
  }

  function alternarListaConversas(): void {
    listaConversasAberta.value = !listaConversasAberta.value;
  }

  function processarEvento(mensagem: MensagemAssistenteChat, evento: EventoOraculo): void {
    switch (evento.tipo) {
      case 'mensagem.inicio':
        mensagem.modelo = evento.modelo;
        if (!conversaAtiva.value) conversaAtiva.value = evento.conversaId;
        break;

      case 'texto.delta':
        mensagem.texto += evento.fragmento;
        mensagem.estado = 'streaming';
        break;

      case 'ferramenta.inicio':
        mensagem.ferramentas.push({
          id: evento.id,
          nome: evento.nome,
          argumento: evento.argumento,
          status: 'executando',
          metrica: '',
        });
        if (mensagem.texto.length === 0) mensagem.estado = 'executando';
        break;

      case 'ferramenta.fim': {
        const alvo = mensagem.ferramentas.find((f) => f.id === evento.id);

        if (alvo) {
          alvo.status = evento.status;
          alvo.metrica = evento.metrica;
          alvo.duracaoMs = evento.duracaoMs;
          alvo.resultado = evento.resultado;
          if (evento.aprovadaPor) alvo.aprovadaPor = evento.aprovadaPor;
        }

        break;
      }

      case 'citacao':
        if (!mensagem.fontes.some((f) => f.id === evento.fonte.id)) {
          mensagem.fontes.push(evento.fonte);
        }

        fonteParaFerramenta.value[evento.fonte.id] = evento.ferramentaId;

        break;

      case 'aprovacao.pedido':
        mensagem.aprovacaoPedido = evento;
        if (mensagem.texto.length === 0) mensagem.estado = 'aprovacao';
        break;

      case 'mensagem.fim':
        mensagem.cobertura = evento.cobertura;
        mensagem.tokens = evento.tokens;
        mensagem.duracaoMs = evento.duracaoMs;
        mensagem.estado = calcularEstadoFinal(mensagem);
        break;

      case 'erro':
        mensagem.erro = {
          codigo: evento.codigo,
          mensagem: evento.mensagem,
          retomavel: evento.retomavel,
        };
        mensagem.estado = 'erro_modelo';
        break;
    }
  }

  async function enviar(perguntaBruta?: string): Promise<void> {
    const pergunta = (perguntaBruta ?? rascunho.value).trim();
    if (!pergunta || enviando.value) return;

    const sessao = useSessaoStore();

    if (perguntaBruta === undefined) rascunho.value = '';

    mensagens.value.push({
      id: idLocal('usuario'),
      papel: 'usuario',
      texto: pergunta,
      hora: formatarHoraCurta(new Date()),
    });

    const mensagemAssistente: MensagemAssistenteChat = {
      id: idLocal('assistente'),
      papel: 'assistente',
      estado: 'executando',
      modelo: sessao.modelo.nome,
      texto: '',
      ferramentas: [],
      fontes: [],
      cobertura: null,
      tokens: null,
      duracaoMs: null,
      erro: null,
      aprovacaoPedido: null,
      interrompida: false,
    };

    mensagens.value.push(mensagemAssistente);

    const referencia = mensagens.value[mensagens.value.length - 1] as MensagemAssistenteChat;

    enviando.value = true;
    erro.value = '';
    controlador = new AbortController();

    try {
      await chatService.enviarPergunta(
        { pergunta, ...(conversaAtiva.value ? { conversaId: conversaAtiva.value } : {}) },
        {
          signal: controlador.signal,
          onEvento: (evento) => processarEvento(referencia, evento),
        },
      );
    } catch (falha) {
      if (falha instanceof DOMException && falha.name === 'AbortError') {
        referencia.interrompida = true;
      } else {
        referencia.erro = {
          codigo: 'falha_transporte',
          mensagem: falha instanceof Error ? falha.message : 'falha ao falar com o oráculo',
          retomavel: true,
        };
        referencia.estado = 'erro_modelo';
      }
    } finally {
      enviando.value = false;
      controlador = null;
      void carregarConversas();
    }
  }

  function interromper(): void {
    controlador?.abort();
  }

  async function reenviarUltima(): Promise<void> {
    for (let i = mensagens.value.length - 1; i >= 0; i -= 1) {
      const item = mensagens.value[i];

      if (item && item.papel === 'usuario') {
        await enviar(item.texto);
        return;
      }
    }
  }

  return {
    conversas,
    conversaAtiva,
    mensagens,
    filtro,
    fonteSelecionada,
    fonteParaFerramenta,
    painelFontesAberto,
    listaConversasAberta,
    rascunho,
    carregandoConversas,
    carregandoMensagens,
    enviando,
    erro,
    grupos,
    conversa,
    fontes,
    coberturaAtual,
    detalheFonte,
    carregarConversas,
    selecionarConversa,
    novaConversa,
    selecionarFonte,
    limparFonte,
    alternarPainelFontes,
    alternarListaConversas,
    enviar,
    interromper,
    reenviarUltima,
  };
});
