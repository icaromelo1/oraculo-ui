<template>
  <div class="cabecalho">
    <span class="cabecalho__marca">oráculo</span>
    <span class="cabecalho__meta" :class="{ 'cabecalho__meta--erro': tomErro }">
      <i v-if="pulsando" class="cabecalho__pulso" aria-hidden="true" />
      <slot>{{ meta }}</slot>
    </span>
    <slot name="extra" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    meta?: string;
    pulsando?: boolean;
    tomErro?: boolean;
  }>(),
  { meta: '', pulsando: false, tomErro: false },
);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.cabecalho {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;

  &__marca {
    @include mono(10px, 600);
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--acc);
  }

  &__meta {
    @include mono(10.5px, 400);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--txt3);

    &--erro {
      color: var(--err);
    }
  }

  &__pulso {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--acc);
    animation: opulse 1.1s infinite;
  }
}
</style>
