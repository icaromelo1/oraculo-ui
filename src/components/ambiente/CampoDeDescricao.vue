<template>
  <div class="descricao">
    <textarea
      class="o-field descricao__campo"
      :value="modelValue"
      :rows="linhas ?? 2"
      :maxlength="TETO_DA_DESCRICAO"
      :placeholder="placeholder"
      :disabled="desabilitado === true"
      :aria-label="rotulo"
      @input="aoDigitar"
    ></textarea>

    <div class="descricao__rodape">
      <button
        class="o-btn o-btn--ghost"
        type="button"
        :disabled="desabilitado === true || sugerindo || !temOrigem"
        @click="void sugerir()"
      >
        {{ sugerindo ? 'pensando…' : 'sugerir' }}
      </button>
      <span class="descricao__contador">
        {{ modelValue.length }}/{{ TETO_DA_DESCRICAO }} caracteres
      </span>
      <span v-if="!temOrigem" class="descricao__dica">{{ dicaSemOrigem }}</span>
    </div>

    <p v-if="erro" class="mensagem mensagem--erro" role="alert">{{ erro }}</p>
    <p v-else-if="motivo" class="mensagem mensagem--aviso" role="status">{{ motivo }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { sugerirDescricao } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const TETO_DA_DESCRICAO = 200;

const props = defineProps<{
  modelValue: string;
  origemConteudo: string;
  origemTitulo: string;
  placeholder: string;
  dicaSemOrigem: string;
  rotulo: string;
  linhas?: number;
  desabilitado?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [valor: string] }>();

const sugerindo = ref(false);
const erro = ref('');
const motivo = ref('');

const temOrigem = computed(() => props.origemConteudo.trim().length > 0);

function aoDigitar(evento: Event): void {
  const campo = evento.target as HTMLTextAreaElement;

  erro.value = '';
  motivo.value = '';
  emit('update:modelValue', campo.value);
}

async function sugerir(): Promise<void> {
  const conteudo = props.origemConteudo.trim();

  if (sugerindo.value || conteudo.length === 0) return;

  sugerindo.value = true;
  erro.value = '';
  motivo.value = '';

  try {
    const resposta = await sugerirDescricao(conteudo, props.origemTitulo);
    const sugestao = resposta.sugestao?.trim() ?? '';

    if (sugestao) {
      emit('update:modelValue', sugestao.slice(0, TETO_DA_DESCRICAO));
      return;
    }

    motivo.value =
      resposta.motivo ?? 'o modelo não devolveu sugestão desta vez — escreva a descrição à mão';
  } catch (falha) {
    erro.value = mensagemDoErro(
      falha,
      'não consegui pedir a sugestão ao modelo — escreva a descrição à mão',
    );
  } finally {
    sugerindo.value = false;
  }
}

watch(
  () => props.origemConteudo,
  () => {
    erro.value = '';
    motivo.value = '';
  },
);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.descricao {
  display: flex;
  flex-direction: column;
  gap: 5px;

  &__campo {
    resize: vertical;
    font-size: 13.5px;
    line-height: 1.55;
  }

  &__rodape {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }

  &__contador {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__dica {
    font-size: 12px;
    color: var(--ink3);
    flex: 1;
    min-width: 180px;
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }

  &--aviso {
    color: var(--amber);
  }
}
</style>
