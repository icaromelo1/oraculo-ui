<template>
  <div class="estados">
    <span class="estados__rotulo">estado</span>
    <button
      v-for="opcao in opcoes"
      :key="opcao.valor"
      class="chip"
      :class="{ 'chip--ativo': chat.estado === opcao.valor }"
      type="button"
      @click="chat.definirEstado(opcao.valor)"
    >
      {{ opcao.rotulo }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat';
import type { EstadoResposta } from '@/types/oraculo';

const chat = useChatStore();

const opcoes: { valor: EstadoResposta; rotulo: string }[] = [
  { valor: 'resolvida', rotulo: 'resposta completa' },
  { valor: 'streaming', rotulo: 'streaming' },
  { valor: 'executando', rotulo: 'executando' },
  { valor: 'aprovacao', rotulo: 'aprovação' },
  { valor: 'sem_resultado', rotulo: 'sem resultado' },
  { valor: 'trecho_oculto', rotulo: 'trecho oculto' },
  { valor: 'bloqueada', rotulo: 'bloqueado' },
  { valor: 'erro_modelo', rotulo: 'modelo indisponível' },
];
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.estados {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-left: 2px;
  padding-left: 12px;
  border-left: 1px solid var(--line);

  &__rotulo {
    @include caps;
    letter-spacing: 0.08em;
  }
}

.chip {
  @include mono(11px, 400);
  background: transparent;
  color: var(--txt3);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 3px 7px;
  cursor: pointer;
  white-space: nowrap;

  &--ativo {
    background: var(--acc-b);
    color: var(--acc);
    border-color: var(--acc-l);
  }
}
</style>
