<template>
  <span class="marca-oraculo" :class="`marca-oraculo--${tamanho}`" aria-hidden="true">
    <i />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ tamanho?: 'sm' | 'lg' }>(), { tamanho: 'sm' });
</script>

<style scoped lang="scss">
.marca-oraculo {
  position: relative;
  display: inline-block;
  flex: none;
  border-radius: 50%;
  border: 2.5px solid var(--sage);

  i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: var(--amber);
  }

  &--sm {
    width: 22px;
    height: 22px;
    border-width: 2.5px;

    i {
      width: 6px;
      height: 6px;
    }
  }

  &--lg {
    width: 34px;
    height: 34px;
    border-width: 4px;

    i {
      width: 9px;
      height: 9px;
    }
  }
}
</style>
