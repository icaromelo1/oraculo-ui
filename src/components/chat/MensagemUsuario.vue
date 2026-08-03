<template>
  <div>
    <div class="autor">{{ sessao.usuario }} · {{ hora }}</div>
    <div class="balao">{{ texto }}</div>
  </div>
</template>

<script setup lang="ts">
import { useSessaoStore } from '@/stores/sessao';

defineProps<{ hora: string; texto: string }>();

const sessao = useSessaoStore();
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.autor {
  @include caps;
  margin-bottom: 6px;
}

.balao {
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--txt);
}
</style>
