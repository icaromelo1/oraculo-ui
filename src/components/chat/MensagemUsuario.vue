<template>
  <div class="linha">
    <div class="hora">{{ hora }}</div>
    <div class="balao">{{ texto }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hora: string; texto: string }>();
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.linha {
  align-self: flex-end;
  max-width: 88%;
}

.hora {
  font-size: 12px;
  color: var(--ink3);
  text-align: right;
  margin-bottom: 5px;
}

.balao {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px 14px 4px 14px;
  padding: 11px 14px;
  font-size: 14.5px;
  color: var(--ink);
  box-shadow: var(--shadow);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
