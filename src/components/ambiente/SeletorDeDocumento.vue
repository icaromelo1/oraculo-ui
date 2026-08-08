<template>
  <div class="seletor">
    <input
      v-model="termo"
      class="o-field"
      type="search"
      :placeholder="placeholder"
      :aria-label="placeholder"
      :disabled="desabilitado === true"
    />

    <p v-if="buscando && resultados.length === 0" class="mensagem">procurando…</p>
    <p v-else-if="erro" class="mensagem mensagem--erro" role="alert">{{ erro }}</p>
    <p v-else-if="resultados.length === 0" class="mensagem">
      nenhum documento casa com esse termo.
    </p>

    <div v-else class="seletor__lista">
      <button
        v-for="documento in resultados"
        :key="documento.id"
        class="seletor__item"
        type="button"
        :class="{ 'seletor__item--escolhido': documento.id === escolhidoId }"
        :disabled="desabilitado === true"
        @click="emit('escolhido', documento)"
      >
        <span class="seletor__titulo">{{ documento.titulo }}</span>
        <span class="seletor__caminho">{{ documento.caminho }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { listarDocumentos, type DocumentoIndexado } from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const POR_PAGINA = 8;

const props = defineProps<{
  placeholder: string;
  escolhidoId?: string | null;
  desabilitado?: boolean;
}>();

const emit = defineEmits<{ escolhido: [documento: DocumentoIndexado] }>();

const termo = ref('');
const resultados = ref<DocumentoIndexado[]>([]);
const buscando = ref(false);
const erro = ref('');

let referencia = 0;
let temporizador: ReturnType<typeof setTimeout> | undefined;

async function carregar(): Promise<void> {
  const atual = ++referencia;
  const busca = termo.value.trim();

  buscando.value = true;

  try {
    const pagina = await listarDocumentos({
      porPagina: POR_PAGINA,
      ...(busca ? { busca } : {}),
    });

    if (atual !== referencia) return;

    resultados.value = pagina.documentos;
    erro.value = '';
  } catch (falha) {
    if (atual !== referencia) return;

    resultados.value = [];
    erro.value = mensagemDoErro(falha, 'não consegui procurar documentos agora');
  } finally {
    if (atual === referencia) buscando.value = false;
  }
}

watch(termo, () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => void carregar(), 300);
});

watch(
  () => props.desabilitado,
  (travado) => {
    if (travado !== true) void carregar();
  },
);

onMounted(() => {
  void carregar();
});

onUnmounted(() => {
  clearTimeout(temporizador);
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.seletor {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__lista {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    text-align: left;
    background: var(--panel2);
    border: none;
    padding: 7px 11px;
    cursor: pointer;

    &:not(:first-child) {
      border-top: 1px solid var(--line);
    }

    &:hover {
      background: var(--sel);
    }

    &--escolhido {
      background: var(--sage-s);
    }
  }

  &__titulo {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    word-break: break-all;
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }
}
</style>
