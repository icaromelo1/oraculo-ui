import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { CONVERSAS, SEGUIMENTO } from '@/mocks/conversa';
import { FONTES, fonte } from '@/mocks/fontes';
import type { EstadoResposta } from '@/types/oraculo';

export const useChatStore = defineStore('chat', () => {
  const conversas = ref([...CONVERSAS]);
  const conversaAtiva = ref(CONVERSAS[0]?.id ?? '');
  const estado = ref<EstadoResposta>('resolvida');
  const filtro = ref('');
  const fonteSelecionada = ref<string | null>(null);
  const painelFontesAberto = ref(true);
  const listaConversasAberta = ref(false);
  const rascunho = ref('');

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

  const seguimento = computed(() => SEGUIMENTO[estado.value] ?? null);

  const detalheFonte = computed(() =>
    fonteSelecionada.value ? (fonte(fonteSelecionada.value) ?? null) : null,
  );

  const fontes = computed(() => FONTES);

  function selecionarConversa(id: string) {
    conversaAtiva.value = id;
    listaConversasAberta.value = false;
  }

  function selecionarFonte(id: string) {
    fonteSelecionada.value = id;
    painelFontesAberto.value = true;
  }

  function limparFonte() {
    fonteSelecionada.value = null;
  }

  function alternarPainelFontes() {
    painelFontesAberto.value = !painelFontesAberto.value;
  }

  function alternarListaConversas() {
    listaConversasAberta.value = !listaConversasAberta.value;
  }

  function definirEstado(novo: EstadoResposta) {
    estado.value = novo;
  }

  return {
    conversas,
    conversaAtiva,
    estado,
    filtro,
    fonteSelecionada,
    painelFontesAberto,
    listaConversasAberta,
    rascunho,
    grupos,
    conversa,
    seguimento,
    detalheFonte,
    fontes,
    selecionarConversa,
    selecionarFonte,
    limparFonte,
    alternarPainelFontes,
    alternarListaConversas,
    definirEstado,
  };
});
