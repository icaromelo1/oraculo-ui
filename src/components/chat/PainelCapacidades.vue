<template>
  <div class="capacidades">
    <div class="capacidades__topo">
      <span class="capacidades__titulo">Capacidades</span>
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
  padding: 13px 14px;

  &__topo {
    margin-bottom: 10px;
  }

  &__titulo {
    font-size: 12px;
    color: var(--ink3);
  }

  &__lista {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.linha {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--ink2);

  &__ponto {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex: none;
    background: var(--sage);
  }

  &__cruz {
    width: 7px;
    flex: none;
    text-align: center;
    color: var(--clay);
    font-size: 11px;
  }

  &__rotulo {
    flex: 1;
  }

  &__nota {
    font-size: 11.5px;
    margin-left: auto;
  }

  &--aprovacao {
    .linha__ponto {
      background: var(--amber);
    }

    .linha__nota {
      color: var(--amber);
    }
  }

  &--desligada {
    color: var(--ink3);

    .linha__ponto {
      background: transparent;
      border: 1.5px solid var(--line2);
    }

    .linha__nota {
      color: var(--ink3);
    }
  }

  &--negada {
    color: var(--ink3);

    .linha__nota {
      color: var(--clay);
    }
  }
}
</style>
