<template>
  <div class="rodape">
    <span>{{ formatarTokens(tokens) }} · {{ formatarSegundos(duracaoMs) }}</span>
    <button
      v-if="fontes.length"
      class="rodape__fontes"
      type="button"
      :title="chat.painelFontesAberto ? 'esconder as fontes' : 'ver as fontes desta resposta'"
      @click="chat.alternarPainelFontes()"
    >
      fontes: {{ resumoFontes }}
    </button>
    <div class="rodape__espacador" />
    <button type="button" @click="copiar">{{ copiado ? 'copiado!' : 'copiar' }}</button>
    <AcaoSalvarNota :mensagem-id="mensagemId" :texto="texto" :fontes="fontes" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AcaoSalvarNota from '@/components/chat/AcaoSalvarNota.vue';
import { formatarSegundos, formatarTokens } from '@/composables/useFormato';
import { rotuloTipoFonte } from '@/composables/useRotuloFonte';
import type { Fonte, TipoFonte } from '@/types/oraculo';
import { useChatStore } from '@/stores/chat';
import { textoVisivelDaResposta } from './notaDaResposta';

const props = defineProps<{
  mensagemId: string;
  tokens: number | null;
  duracaoMs: number | null;
  fontes: Fonte[];
  texto: string;
}>();

const chat = useChatStore();
const copiado = ref(false);

const resumoFontes = computed(() => {
  const contagem = new Map<TipoFonte, number>();

  for (const fonte of props.fontes) {
    contagem.set(fonte.tipo, (contagem.get(fonte.tipo) ?? 0) + 1);
  }

  return [...contagem.entries()]
    .map(([tipo, quantidade]) => `${quantidade} ${rotuloTipoFonte(tipo)}`)
    .join(' · ');
});

async function copiar(): Promise<void> {
  try {
    await navigator.clipboard.writeText(textoVisivelDaResposta(props.texto));
    copiado.value = true;
    setTimeout(() => {
      copiado.value = false;
    }, 1500);
  } catch {
    copiado.value = false;
  }
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.rodape {
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 9px;
  color: var(--ink3);

  &__espacador {
    flex: 1;
  }

  button {
    background: none;
    border: none;
    color: var(--ink3);
    cursor: pointer;
    font: inherit;
    text-decoration: underline;

    &:hover {
      color: var(--ink);
    }
  }
}
</style>
