<template>
  <div class="lista">
    <BlocoFerramenta v-for="item in ferramentas" :key="item.id" :ferramenta="item" />
  </div>
</template>

<script setup lang="ts">
import BlocoFerramenta from '@/components/chat/BlocoFerramenta.vue';
import type { Ferramenta } from '@/types/oraculo';

defineProps<{ ferramentas: Ferramenta[] }>();
</script>

<style scoped lang="scss">
.lista {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}
</style>
