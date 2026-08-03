<template>
  <button
    class="chip"
    :class="`chip--${tipo}`"
    type="button"
    @click="chat.selecionarFonte(fonteId)"
  >
    {{ rotulo }}
  </button>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat';
import type { TipoFonte } from '@/types/oraculo';

defineProps<{ fonteId: string; rotulo: string; tipo: TipoFonte }>();

const chat = useChatStore();
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.chip {
  @include mono(11px, 500, 1.4);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 5px;
  border-radius: 3px;
  cursor: pointer;
  vertical-align: baseline;

  &:hover {
    filter: brightness(1.35);
  }

  &--codigo {
    border: 1px solid var(--green-l);
    color: var(--green);
    background: var(--green-b);
  }

  &--doc {
    border: 1px solid var(--blue-l);
    color: var(--blue);
    background: var(--blue-b);
  }

  &--banco {
    border: 1px solid var(--gold-l);
    color: var(--gold);
    background: var(--gold-b);
  }

  &--curado,
  &--inferencia {
    border: 1px solid var(--gray-l);
    color: var(--gray);
    background: var(--gray-b);
  }
}
</style>
