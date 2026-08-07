<template>
  <template v-for="(parte, indice) in partes" :key="indice">
    <code v-if="parte.tipo === 'codigo'" class="o-code">{{ parte.valor }}</code>
    <b v-else-if="parte.tipo === 'negrito'">{{ parte.valor }}</b>
    <template v-else>{{ parte.valor }}</template>
  </template>
</template>

<script setup lang="ts">
import type { ParteTexto } from '@/composables/useTextoResposta';

defineProps<{ partes: ParteTexto[] }>();
</script>
