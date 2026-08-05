<template>
  <aside class="lateral">
    <div class="lateral__topo">
      <button class="nova" type="button" @click="void irParaNova()">Nova conversa</button>
      <input v-model="chat.filtro" class="filtro" placeholder="filtrar conversas…" />
    </div>

    <div class="lateral__lista">
      <p v-if="chat.carregandoConversas" class="aviso">carregando…</p>
      <p v-else-if="chat.grupos.length === 0" class="aviso">nenhuma conversa ainda.</p>
      <template v-for="grupo in chat.grupos" :key="grupo.titulo">
        <div class="grupo">{{ grupo.titulo }}</div>
        <button
          v-for="item in grupo.itens"
          :key="item.id"
          class="item"
          :class="{ 'item--ativo': item.id === chat.conversaAtiva }"
          type="button"
          @click="void irParaConversa(item.id)"
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
import { useRoute, useRouter } from 'vue-router';
import PainelCapacidades from '@/components/chat/PainelCapacidades.vue';
import { useChatStore } from '@/stores/chat';

const chat = useChatStore();

const roteador = useRouter();
const rota = useRoute();

async function irParaConversa(id: string): Promise<void> {
  chat.fecharListaConversas();

  if (rota.name === 'conversa' && rota.params.id === id) return;

  await roteador.push({ name: 'conversa', params: { id } });
}

async function irParaNova(): Promise<void> {
  chat.fecharListaConversas();

  if (rota.name === 'chat') {
    chat.novaConversa();

    return;
  }

  await roteador.push({ name: 'chat' });
}
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
    padding: 14px 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__lista {
    flex: 1;
    overflow-y: auto;
    padding: 2px 8px 8px;
  }
}

.nova {
  width: 100%;
  background: var(--sage-s);
  border: 1px solid var(--sage-l);
  border-radius: 9px;
  padding: 9px;
  color: var(--sage);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    filter: brightness(0.97);
  }
}

.filtro {
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 7px 9px;
  color: var(--ink);
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: var(--line2);
  }

  &::placeholder {
    color: var(--ink3);
  }
}

.aviso {
  font-size: 12.5px;
  padding: 10px 8px;
  color: var(--ink3);
}

.grupo {
  font-size: 12px;
  color: var(--ink3);
  padding: 12px 8px 5px;

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
  border-radius: 9px;
  padding: 9px 10px;
  margin-bottom: 3px;
  cursor: pointer;

  &:hover {
    background: var(--panel2);
  }

  &--ativo {
    background: var(--sel);
  }

  &__titulo {
    display: block;
    color: var(--ink2);
    font-size: 13.5px;
    margin-bottom: 2px;

    .item--ativo & {
      color: var(--ink);
      font-weight: 500;
    }
  }

  &__meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--ink3);

    &--aviso {
      color: var(--amber);
    }

    &--erro {
      color: var(--clay);
    }
  }
}
</style>
