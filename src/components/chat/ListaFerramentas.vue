<template>
  <div class="painel">
    <div class="painel__titulo">{{ titulo }}</div>
    <BlocoFerramenta v-for="item in ferramentas" :key="item.id" :ferramenta="item" />
    <div v-if="emAndamento" class="painel__progresso" aria-hidden="true"><span /></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BlocoFerramenta from '@/components/chat/BlocoFerramenta.vue';
import type { Ferramenta } from '@/types/oraculo';

const props = withDefaults(defineProps<{ ferramentas: Ferramenta[]; titulo?: string }>(), {
  titulo: 'O que eu fiz antes de responder',
});

const emAndamento = computed(() => props.ferramentas.some((item) => item.status === 'executando'));
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.painel {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--panel);
  overflow: hidden;
  margin: -6px 0 16px;
  max-width: 560px;

  &__titulo {
    padding: 11px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 12.5px;
    color: var(--ink3);
  }

  &__progresso {
    height: 3px;
    background: var(--panel3);
    overflow: hidden;

    span {
      display: block;
      width: 30%;
      height: 100%;
      background: var(--sage);
      animation: obar 1.5s ease-in-out infinite;
    }
  }
}
</style>
