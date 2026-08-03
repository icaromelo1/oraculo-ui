<template>
  <aside class="lateral">
    <div class="lateral__topo">
      <button class="nova" type="button">
        <span>+ nova conversa</span>
        <span class="nova__atalho">⌘K</span>
      </button>
      <input v-model="chat.filtro" class="filtro" placeholder="filtrar conversas…" />
    </div>

    <div class="lateral__lista">
      <template v-for="grupo in chat.grupos" :key="grupo.titulo">
        <div class="grupo">{{ grupo.titulo }}</div>
        <button
          v-for="item in grupo.itens"
          :key="item.id"
          class="item"
          :class="{ 'item--ativo': item.id === chat.conversaAtiva }"
          type="button"
          @click="chat.selecionarConversa(item.id)"
        >
          <span class="item__titulo">{{ item.titulo }}</span>
          <span class="item__meta">
            <span>{{ item.hora }}</span>
            <span>{{ item.fontes }} fontes</span>
            <span v-if="item.ferramentas">{{ item.ferramentas }} ferramentas</span>
            <span v-if="item.aprovacoes" class="item__meta--aviso">
              {{ item.aprovacoes }} aprovação
            </span>
            <span v-if="item.bloqueios" class="item__meta--erro">
              {{ item.bloqueios }} bloqueio
            </span>
          </span>
        </button>
      </template>
    </div>

    <PainelCapacidades />
  </aside>
</template>

<script setup lang="ts">
import PainelCapacidades from '@/components/chat/PainelCapacidades.vue';
import { useChatStore } from '@/stores/chat';

const chat = useChatStore();
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.lateral {
  border-right: 1px solid var(--line);
  background: var(--panel);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__topo {
    padding: 10px;
    border-bottom: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__lista {
    flex: 1;
    overflow-y: auto;
    padding: 8px 6px;
  }
}

.nova {
  @include mono(12px, 500);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--panel2);
  border: 1px solid var(--line2);
  border-radius: 3px;
  padding: 7px 9px;
  color: var(--txt);
  cursor: pointer;

  &:hover {
    border-color: var(--acc);
    color: var(--acc);
  }

  &__atalho {
    color: var(--txt3);
    font-size: 10px;
  }
}

.filtro {
  @include mono(12px, 400, 1.2);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 6px 8px;
  color: var(--txt);
  outline: none;

  &:focus {
    border-color: var(--line2);
  }

  &::placeholder {
    color: var(--txt3);
  }
}

.grupo {
  @include caps;
  padding: 12px 8px 6px;

  &:first-child {
    padding-top: 6px;
  }
}

.item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 3px;
  padding: 8px 9px;
  margin-bottom: 2px;
  cursor: pointer;

  &:hover {
    background: var(--panel2);
  }

  &--ativo {
    background: var(--sel);
    border-left: 2px solid var(--acc);
  }

  &__titulo {
    display: block;
    color: var(--txt2);
    font-size: 12.5px;
    margin-bottom: 3px;

    .item--ativo & {
      color: var(--txt);
    }
  }

  &__meta {
    @include mono(10.5px, 400);
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--txt3);

    &--aviso {
      color: var(--warn);
    }

    &--erro {
      color: var(--err);
    }
  }
}
</style>
