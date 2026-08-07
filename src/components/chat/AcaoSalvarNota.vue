<template>
  <button
    class="acao-nota"
    type="button"
    :disabled="!podeSalvar"
    :title="dica"
    @click="void salvar()"
  >
    {{ rotulo }}
  </button>

  <span v-if="erro" class="acao-nota__erro" role="alert">{{ erro }}</span>
  <span v-else-if="confirmacao" class="acao-nota__ok" role="status">{{ confirmacao }}</span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  conteudoDaNota,
  textoVisivelDaResposta,
  tituloDaNota,
} from '@/components/chat/notaDaResposta';
import { criarNota, TAMANHO_MAXIMO_BYTES } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';
import { useChatStore } from '@/stores/chat';
import type { Fonte } from '@/types/oraculo';

const props = defineProps<{ mensagemId: string; texto: string; fontes: Fonte[] }>();

const chat = useChatStore();

const salvando = ref(false);
const salva = ref(false);
const erro = ref('');
const confirmacao = ref('');

const textoVisivel = computed(() => textoVisivelDaResposta(props.texto));

const podeSalvar = computed(() => !salvando.value && textoVisivel.value.length > 0);

const rotulo = computed(() => {
  if (salvando.value) return 'salvando…';
  return salva.value ? 'nota salva' : 'salvar como nota';
});

const dica = computed(() =>
  salva.value
    ? 'salvar esta resposta de novo como nota'
    : 'guardar esta resposta no conhecimento do oráculo',
);

function perguntaDaResposta(): string {
  const indice = chat.mensagens.findIndex((item) => item.id === props.mensagemId);

  for (let i = indice - 1; i >= 0; i -= 1) {
    const item = chat.mensagens[i];
    if (item && item.papel === 'usuario') return item.texto;
  }

  return '';
}

async function salvar(): Promise<void> {
  if (!podeSalvar.value) return;

  erro.value = '';
  confirmacao.value = '';

  const pergunta = perguntaDaResposta();
  const conteudo = conteudoDaNota({
    pergunta,
    textoVisivel: textoVisivel.value,
    fontes: props.fontes,
  });

  if (new Blob([conteudo]).size > TAMANHO_MAXIMO_BYTES) {
    erro.value = 'a resposta passou do teto de 2 MB por nota';
    return;
  }

  salvando.value = true;

  try {
    const nota = await criarNota(tituloDaNota(pergunta, textoVisivel.value), conteudo);

    salva.value = true;
    confirmacao.value =
      nota.trechosIndexados > 0
        ? `nota "${nota.slug}" gravada — ${nota.trechosIndexados} trecho(s) indexado(s)`
        : `nota "${nota.slug}" gravada, mas nada foi indexado agora`;
  } catch (falha) {
    salva.value = false;
    erro.value = mensagemDoErro(falha, 'não consegui salvar a resposta como nota');
  } finally {
    salvando.value = false;
  }
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.acao-nota {
  background: none;
  border: none;
  padding: 0;
  color: var(--ink3);
  cursor: pointer;
  font: inherit;
  text-decoration: underline;

  &:hover:enabled {
    color: var(--ink);
  }

  &:disabled {
    cursor: default;
    text-decoration: none;
  }

  &__erro {
    color: var(--clay);
  }

  &__ok {
    color: var(--sage);
  }
}
</style>
