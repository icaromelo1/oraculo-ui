<template>
  <div class="notas">
    <div class="rotulo-secao">notas anexadas por aqui</div>

    <p v-if="carregando" class="mensagem">carregando…</p>
    <p v-else-if="erro" class="mensagem mensagem--erro">{{ erro }}</p>
    <p v-else-if="notas.length === 0" class="mensagem">
      nenhuma nota ainda — escreva uma acima ou envie um arquivo.
    </p>

    <div v-else class="notas__lista">
      <div v-for="nota in notas" :key="nota.slug" class="nota">
        <span class="nota__titulo">{{ nota.titulo }}</span>
        <span class="nota__caminho">{{ nota.caminho }}</span>
        <span class="nota__meta">
          {{ formatarBytes(nota.bytes) }} · {{ formatarQuando(nota.atualizadaEm) }}
        </span>

        <button
          v-if="confirmando === nota.slug"
          class="o-btn o-btn--ghost nota__perigo"
          type="button"
          :disabled="removendo === nota.slug"
          @click="void remover(nota.slug)"
        >
          {{ removendo === nota.slug ? 'removendo…' : 'confirmar' }}
        </button>
        <button
          v-else
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="removendo !== null"
          @click="pedirConfirmacao(nota.slug)"
        >
          remover
        </button>
      </div>
    </div>

    <p v-if="erroRemocao" class="mensagem mensagem--erro" role="alert">{{ erroRemocao }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { formatarBytes, formatarQuando } from './formato';
import { removerNota, type NotaListada } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

defineProps<{
  notas: NotaListada[];
  carregando: boolean;
  erro: string;
}>();

const emit = defineEmits<{ removida: [] }>();

const confirmando = ref<string | null>(null);
const removendo = ref<string | null>(null);
const erroRemocao = ref('');

function pedirConfirmacao(slug: string): void {
  erroRemocao.value = '';
  confirmando.value = slug;
}

async function remover(slug: string): Promise<void> {
  if (removendo.value) return;

  removendo.value = slug;
  erroRemocao.value = '';

  try {
    await removerNota(slug);
    confirmando.value = null;
    emit('removida');
  } catch (falha) {
    erroRemocao.value = mensagemDoErro(falha, `não consegui remover a nota "${slug}"`);
  } finally {
    removendo.value = null;
  }
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.notas {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__lista {
    display: flex;
    flex-direction: column;
  }
}

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
  margin-bottom: 4px;
}

.nota {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;

  &__titulo {
    font-size: 13px;
    font-weight: 500;
    min-width: 130px;
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    flex: 1;
    word-break: break-all;
  }

  &__meta {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__perigo {
    color: var(--clay);

    &:hover {
      color: var(--clay);
      border-color: var(--clay-l);
    }
  }
}

.mensagem {
  margin: 0;
  padding: 6px 0;
  font-size: 12.5px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }
}
</style>
