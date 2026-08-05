<template>
  <form class="nota" @submit.prevent="void gravar()">
    <input
      v-model="titulo"
      class="o-field"
      type="text"
      maxlength="200"
      placeholder="Título da nota"
      :disabled="gravando"
    />

    <textarea
      v-model="conteudo"
      class="o-field nota__texto"
      rows="8"
      placeholder="Escreva em markdown. Se o texto não começar com um cabeçalho, o título vira o primeiro."
      :disabled="gravando"
    ></textarea>

    <div class="nota__rodape">
      <button class="o-btn o-btn--primary" type="submit" :disabled="gravando || !preenchida">
        {{ gravando ? 'gravando…' : 'gravar nota' }}
      </button>
      <span class="nota__dica">vai para o diretório de notas e é indexada na hora</span>
    </div>

    <p v-if="erro" class="mensagem mensagem--erro" role="alert">{{ erro }}</p>
    <p v-else-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { criarNota, TAMANHO_MAXIMO_BYTES } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const emit = defineEmits<{ gravada: [] }>();

const titulo = ref('');
const conteudo = ref('');
const gravando = ref(false);
const erro = ref('');
const feito = ref('');

const preenchida = computed(
  () => titulo.value.trim().length > 0 && conteudo.value.trim().length > 0,
);

async function gravar(): Promise<void> {
  if (gravando.value || !preenchida.value) return;

  erro.value = '';
  feito.value = '';

  if (new Blob([conteudo.value]).size > TAMANHO_MAXIMO_BYTES) {
    erro.value = 'o texto passou do teto de 2 MB por nota';
    return;
  }

  gravando.value = true;

  try {
    const nota = await criarNota(titulo.value.trim(), conteudo.value);

    feito.value =
      nota.trechosIndexados > 0
        ? `nota "${nota.slug}" gravada — ${nota.trechosIndexados} trecho(s) indexado(s)`
        : `nota "${nota.slug}" gravada, mas nada foi indexado agora — a próxima varredura do corpus recupera`;

    titulo.value = '';
    conteudo.value = '';
    emit('gravada');
  } catch (falha) {
    erro.value = mensagemDoErro(falha, 'não consegui gravar a nota');
  } finally {
    gravando.value = false;
  }
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.nota {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__texto {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
  }

  &__rodape {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__dica {
    font-size: 12.5px;
    color: var(--ink3);
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }

  &--ok {
    color: var(--sage);
  }
}
</style>
