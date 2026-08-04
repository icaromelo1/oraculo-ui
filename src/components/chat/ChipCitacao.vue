<template>
  <button
    class="citacao"
    :class="`citacao--${tom}`"
    type="button"
    @click="chat.selecionarFonte(fonte.id)"
  >
    <i class="citacao__ponto" aria-hidden="true" />{{ nome }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { nomeArquivoFonte, tomTipoFonte } from '@/composables/useRotuloFonte';
import { useChatStore } from '@/stores/chat';
import type { Fonte } from '@/types/oraculo';

const props = defineProps<{ fonte: Fonte }>();

const chat = useChatStore();

const nome = computed(() => nomeArquivoFonte(props.fonte));
const tom = computed(() => tomTipoFonte(props.fonte.tipo));
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.citacao {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  background: none;
  border: none;
  padding: 0;
  margin: 0 2px;
  font: inherit;
  color: var(--slate);
  border-bottom: 1px dotted var(--slate-l);
  cursor: pointer;
  vertical-align: baseline;

  &:hover {
    background: var(--slate-s);
    text-decoration: none;
  }

  &__ponto {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--slate);
    vertical-align: 1px;
  }

  &--amber {
    color: var(--amber);
    border-bottom-color: var(--amber-l);

    &:hover {
      background: var(--amber-s);
    }

    .citacao__ponto {
      background: var(--amber);
    }
  }

  &--neutro {
    color: var(--ink3);
    border-bottom-color: var(--line2);

    &:hover {
      background: var(--panel3);
    }

    .citacao__ponto {
      background: var(--ink3);
    }
  }
}
</style>
