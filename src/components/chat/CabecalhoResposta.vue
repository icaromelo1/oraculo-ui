<template>
  <div class="linha">
    <i
      class="linha__ponto"
      :class="[`linha__ponto--${tom}`, { 'linha__ponto--pulsa': pulsando }]"
      :aria-hidden="true"
    />
    <span class="linha__texto"
      ><slot>{{ meta }}</slot></span
    >
    <slot name="extra" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    meta?: string;
    pulsando?: boolean;
    tom?: 'sage' | 'sage-suave' | 'clay' | 'neutro';
  }>(),
  { meta: '', pulsando: false, tom: 'sage-suave' },
);
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.linha {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--ink3);

  &__ponto {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex: none;

    &--sage {
      background: var(--sage);
    }

    &--sage-suave {
      background: var(--sage-l);
    }

    &--clay {
      background: var(--clay);
    }

    &--neutro {
      background: var(--line2);
    }

    &--pulsa {
      animation: opulse 1.2s infinite;
    }
  }

  &__texto {
    color: var(--ink3);
  }
}
</style>
