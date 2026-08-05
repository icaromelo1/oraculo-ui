<template>
  <div class="app">
    <header class="barra">
      <div class="marca">
        <MarcaOraculo tamanho="sm" />
        <span class="marca__nome">Oráculo</span>
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

      <div class="espacador" />

      <span class="usuario">{{ sessao.usuario }}</span>
      <button class="o-btn" type="button" @click="sessao.alternarTema()">
        tema {{ tituloTema }}
      </button>
      <button class="o-btn" type="button" @click="sair">sair</button>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MarcaOraculo from '@/components/MarcaOraculo.vue';
import { useSessaoStore } from '@/stores/sessao';

const sessao = useSessaoStore();
const router = useRouter();

onMounted(() => {
  if (sessao.autenticado && !sessao.usuario) {
    void sessao.carregarPerfil();
  }
});

const tituloTema = computed(() => (sessao.tema === 'light' ? 'claro' : 'escuro'));

function sair(): void {
  sessao.sair();
  void router.push({ name: 'login' });
}

const navegacao = [
  { nome: 'chat', rotulo: 'Conversa', para: { name: 'chat' } },
  { nome: 'auditoria', rotulo: 'Histórico', para: { name: 'auditoria' } },
  { nome: 'ambiente', rotulo: 'Ambiente', para: { name: 'ambiente' } },
];
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--ink);
  overflow: hidden;
}

.barra {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 9px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  flex: none;
  z-index: 40;
}

.marca {
  display: flex;
  align-items: center;
  gap: 9px;

  &__nome {
    font-weight: 600;
    font-size: 15px;
    letter-spacing: -0.01em;
    color: var(--ink);
  }
}

.nav {
  display: flex;
  gap: 3px;
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 3px;
}

.aba {
  background: transparent;
  color: var(--ink3);
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;

  &--ativa {
    background: var(--panel);
    color: var(--ink);
    font-weight: 600;
    box-shadow: var(--shadow);
  }
}

.espacador {
  flex: 1;
}

.usuario {
  font-size: 12.5px;
  color: var(--ink3);
  white-space: nowrap;
}
</style>
