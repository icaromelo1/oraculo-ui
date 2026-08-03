<template>
  <div class="app">
    <header class="barra">
      <div class="marca">
        <span class="marca__glifo" aria-hidden="true"><i /></span>
        <span class="marca__nome">ORÁCULO</span>
        <span class="marca__tag">v0.1</span>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in navegacao"
          :key="item.nome"
          v-slot="{ isActive, navigate }"
          :to="item.para"
          custom
        >
          <button class="aba" :class="{ 'aba--ativa': isActive }" type="button" @click="navigate">
            {{ item.rotulo }}
          </button>
        </RouterLink>
      </nav>

      <DemoEstados v-if="mostrarDemo && naTelaDeChat" />

      <div class="espacador" />

      <span class="usuario">{{ sessao.usuario }} · {{ sessao.perfil }}</span>
      <button class="o-btn" type="button" @click="sessao.alternarTema()">
        tema: {{ sessao.tema }}
      </button>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DemoEstados from '@/components/DemoEstados.vue';
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
const route = useRoute();

const mostrarDemo = import.meta.env.DEV || window.location.href.includes('demo');
const naTelaDeChat = computed(() => route.name === 'chat');

const navegacao = [
  { nome: 'chat', rotulo: 'chat', para: { name: 'chat' } },
  { nome: 'auditoria', rotulo: 'auditoria', para: { name: 'auditoria' } },
  { nome: 'perfis', rotulo: 'perfis', para: { name: 'perfis' } },
];
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--txt);
  overflow: hidden;
}

.barra {
  display: flex;
  align-items: center;
  gap: 10px 14px;
  flex-wrap: wrap;
  min-height: 42px;
  padding: 6px 12px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  flex: none;
  z-index: 40;
}

.marca {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
  border-right: 1px solid var(--line);

  &__glifo {
    width: 15px;
    height: 15px;
    border: 1.5px solid var(--acc);
    border-radius: 2px;
    position: relative;

    i {
      position: absolute;
      inset: 3px;
      background: var(--acc);
      border-radius: 1px;
    }
  }

  &__nome {
    @include mono(12px, 600);
    letter-spacing: 0.06em;
    color: var(--txt);
  }

  &__tag {
    @include mono(10px, 400);
    color: var(--txt3);
  }
}

.nav {
  display: flex;
  gap: 2px;
}

.aba {
  @include mono(11px, 500);
  background: transparent;
  color: var(--txt3);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 4px 9px;
  cursor: pointer;
  letter-spacing: 0.03em;

  &--ativa {
    background: var(--acc-b);
    color: var(--acc);
    border-color: var(--acc-l);
  }
}

.espacador {
  flex: 1;
}

.usuario {
  @include mono(11px, 400);
  color: var(--txt3);
  white-space: nowrap;
}
</style>
