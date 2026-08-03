<template>
  <div class="capacidades">
    <div class="capacidades__topo">
      <span class="o-caps">capacidades</span>
      <span class="capacidades__perfil">perfil: {{ sessao.perfil }}</span>
    </div>

    <ul class="capacidades__lista">
      <li
        v-for="cap in sessao.capacidades"
        :key="cap.id"
        class="linha"
        :class="`linha--${cap.status}`"
      >
        <span v-if="cap.status === 'negada'" class="linha__cruz" aria-hidden="true">×</span>
        <i v-else class="linha__ponto" aria-hidden="true" />
        <span class="linha__rotulo">{{ cap.rotulo }}</span>
        <span v-if="cap.nota" class="linha__nota">{{ cap.nota }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.capacidades {
  border-top: 1px solid var(--line);
  padding: 10px;

  &__topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__perfil {
    @include mono(10px, 400);
    color: var(--txt3);
  }

  &__lista {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}

.linha {
  @include mono(11.5px, 400);
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--txt2);

  &__ponto {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex: none;
    background: var(--green);
  }

  &__cruz {
    width: 5px;
    flex: none;
    text-align: center;
    color: var(--err);
    font-size: 11px;
  }

  &__nota {
    font-size: 10.5px;
  }

  &--aprovacao {
    .linha__ponto {
      background: var(--warn);
    }

    .linha__nota {
      color: var(--warn);
    }
  }

  &--desligada {
    color: var(--txt3);

    .linha__ponto {
      background: transparent;
      border: 1px solid var(--txt3);
    }
  }

  &--negada {
    color: var(--txt3);

    .linha__nota {
      color: var(--err);
    }
  }
}
</style>
