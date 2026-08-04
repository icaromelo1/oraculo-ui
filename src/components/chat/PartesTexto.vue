<template>
  <template v-for="(parte, indice) in partes" :key="indice">
    <code v-if="parte.tipo === 'codigo'" class="o-code">{{ parte.valor }}</code>
    <b v-else-if="parte.tipo === 'negrito'">{{ parte.valor }}</b>
    <ChipCitacao
      v-else-if="parte.tipo === 'citacao'"
      :fonte-id="parte.fonte.id"
      :tipo="parte.fonte.tipo"
      :rotulo="rotuloCitacao(parte.fonte)"
    />
    <template v-else>{{ parte.valor }}</template>
  </template>
</template>

<script setup lang="ts">
import ChipCitacao from '@/components/chat/ChipCitacao.vue';
import { rotuloCitacao } from '@/composables/useRotuloFonte';
import type { ParteTexto } from '@/composables/useTextoResposta';

defineProps<{ partes: ParteTexto[] }>();
</script>
