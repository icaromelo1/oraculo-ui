<template>
  <div class="rodape">
    <span>{{ formatarTokens(tokens) }} · {{ formatarSegundos(duracaoMs) }}</span>
    <span v-if="fontes.length">fontes: {{ resumoFontes }}</span>
    <div class="rodape__espacador" />
    <button type="button" @click="copiar">{{ copiado ? 'copiado!' : 'copiar' }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatarSegundos, formatarTokens } from '@/composables/useFormato';
import { rotuloTipoFonte } from '@/composables/useRotuloFonte';
import type { Fonte, TipoFonte } from '@/types/oraculo';

const props = defineProps<{
  tokens: number | null;
  duracaoMs: number | null;
  fontes: Fonte[];
  texto: string;
}>();

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
    await navigator.clipboard.writeText(props.texto);
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
  @include mono(10.5px, 400);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 9px;
  border-top: 1px solid var(--line);
  color: var(--txt3);

  &__espacador {
    flex: 1;
  }

  button {
    background: none;
    border: none;
    color: var(--txt3);
    cursor: pointer;
    font: inherit;

    &:hover {
      color: var(--txt);
    }
  }
}
</style>
