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

const blocos = computed(() => interpretarTexto(props.texto));
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.markdown {
  font-size: 15px;
  color: var(--ink);
  max-width: 68ch;
  text-wrap: pretty;

  p {
    margin: 0 0 12px;
  }

  b {
    font-weight: 600;
  }
}

.titulo {
  font: 600 15px/1.4 $sans;
  margin: 0 0 9px;
  color: var(--ink);
}

.lista {
  margin: 0 0 12px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.codigo-bloco {
  @include mono(13px, 400, 1.75);
  margin: 0 0 12px;
  padding: 13px 15px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 11px;
  color: var(--ink2);
  overflow-x: auto;
  white-space: pre;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 17px;
  background: var(--sage);
  vertical-align: -3px;
  margin-left: 3px;
  animation: ocaret 1s step-end infinite;
}
</style>
