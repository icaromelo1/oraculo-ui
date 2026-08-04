<template>
  <div class="markdown">
    <template v-for="bloco in blocos" :key="bloco.chave">
      <p v-if="bloco.tipo === 'paragrafo'">
        <PartesTexto :partes="bloco.partes" />
      </p>

      <component :is="`h${bloco.nivel + 3}`" v-else-if="bloco.tipo === 'titulo'" class="titulo">
        <PartesTexto :partes="bloco.partes" />
      </component>

      <component
        :is="bloco.ordenada ? 'ol' : 'ul'"
        v-else-if="bloco.tipo === 'lista'"
        class="lista"
      >
        <li v-for="(item, indiceItem) in bloco.itens" :key="indiceItem">
          <PartesTexto :partes="item" />
        </li>
      </component>

      <pre v-else class="codigo-bloco"><code>{{ bloco.conteudo }}</code></pre>
    </template>

    <span v-if="cursor" class="cursor" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PartesTexto from '@/components/chat/PartesTexto.vue';
import { interpretarTexto } from '@/composables/useTextoResposta';
import type { Fonte } from '@/types/oraculo';

const props = withDefaults(defineProps<{ texto: string; fontes: Fonte[]; cursor?: boolean }>(), {
  cursor: false,
});

const blocos = computed(() => interpretarTexto(props.texto, props.fontes));
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.markdown {
  font-size: 14px;
  color: var(--txt);
  max-width: 76ch;
  text-wrap: pretty;

  p {
    margin: 0 0 11px;
  }

  b {
    font-weight: 600;
  }
}

.titulo {
  font: 600 14px/1.4 $sans;
  margin: 0 0 9px;
  color: var(--txt);
}

.lista {
  margin: 0 0 11px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.codigo-bloco {
  @include mono(12px, 400, 1.6);
  margin: 0 0 11px;
  padding: 9px 11px;
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 3px;
  color: var(--txt2);
  overflow-x: auto;
  white-space: pre;
}

.cursor {
  display: inline-block;
  width: 7px;
  height: 15px;
  background: var(--acc);
  vertical-align: -3px;
  margin-left: 2px;
  animation: ocaret 1s step-end infinite;
}
</style>
