<template>
  <div class="linha">
    <div class="linha__principal">
      <i class="linha__ponto" :class="`linha__ponto--${tom}`" aria-hidden="true" />
      <div class="linha__texto">
        <div class="linha__nome">{{ nomeAmigavel }}</div>
        <div v-if="ferramenta.argumento" class="linha__arg">{{ ferramenta.argumento }}</div>
        <div v-if="ferramenta.aprovadaPor" class="linha__aprovacao">
          aprovado por {{ ferramenta.aprovadaPor }}
        </div>
      </div>
      <div class="linha__metrica">{{ metricaExibida }}</div>
    </div>

    <template v-if="ferramenta.resultadoSql">
      <pre class="linha__sql">{{ ferramenta.resultadoSql.sql }}</pre>

      <div class="linha__tabela">
        <table>
          <thead>
            <tr>
              <th
                v-for="coluna in ferramenta.resultadoSql.colunas"
                :key="coluna.campo"
                :class="{ 'ao-fim': coluna.alinhar === 'direita' }"
              >
                {{ coluna.titulo }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(linha, indice) in ferramenta.resultadoSql.linhas" :key="indice">
              <td
                v-for="coluna in ferramenta.resultadoSql.colunas"
                :key="coluna.campo"
                :class="[
                  { 'ao-fim': coluna.alinhar === 'direita' },
                  classeValor(coluna.campo, linha[coluna.campo] ?? ''),
                ]"
              >
                {{ linha[coluna.campo] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="linha__rodape">{{ ferramenta.resultadoSql.rodape }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { rotuloFerramenta } from '@/composables/useRotuloFerramenta';
import type { Ferramenta } from '@/types/oraculo';

const props = defineProps<{ ferramenta: Ferramenta }>();

const nomeAmigavel = computed(() => rotuloFerramenta(props.ferramenta.nome));

const tom = computed(() => {
  switch (props.ferramenta.status) {
    case 'executando':
      return 'ativo';
    case 'na_fila':
      return 'fila';
    case 'bloqueada':
    case 'erro':
      return 'alerta';
    default:
      return 'ok';
  }
});

const metricaExibida = computed(() => {
  if (props.ferramenta.status === 'executando') return 'em andamento…';
  if (props.ferramenta.status === 'na_fila') return 'na fila';
  return props.ferramenta.metrica;
});

function classeValor(campo: string, valor: string) {
  if (campo !== 'status') return '';
  if (valor === 'RETRY') return 'tom-aviso';
  if (valor === 'ERRO') return 'tom-erro';
  return '';
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.linha {
  padding: 11px 14px;
  border-bottom: 1px solid var(--line);

  &:last-child {
    border-bottom: none;
  }

  &__principal {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__ponto {
    width: 6px;
    height: 6px;
    margin-top: 6px;
    border-radius: 50%;
    flex: none;
    background: var(--line2);

    &--ok {
      background: var(--sage);
    }

    &--ativo {
      background: var(--sage-l);
      animation: opulse 1.2s infinite;
    }

    &--fila {
      background: var(--line2);
    }

    &--alerta {
      background: var(--clay);
    }
  }

  &__texto {
    flex: 1;
    min-width: 220px;
  }

  &__nome {
    font-size: 13.5px;
    color: var(--ink);
    margin-bottom: 3px;
  }

  &__arg {
    font: 400 12.5px/1.5 $mono;
    color: var(--ink2);
    word-break: break-word;
  }

  &__aprovacao {
    font-size: 11.5px;
    color: var(--amber);
    margin-top: 3px;
  }

  &__metrica {
    font-size: 12.5px;
    color: var(--ink3);
    white-space: nowrap;
    flex: none;
  }

  &__sql {
    font: 400 12.5px/1.65 $mono;
    margin: 9px 0 0;
    padding: 10px 12px;
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: 9px;
    color: var(--ink2);
    overflow-x: auto;
    white-space: pre-wrap;
  }

  &__tabela {
    overflow-x: auto;
    margin-top: 9px;
    border: 1px solid var(--line);
    border-radius: 9px;

    table {
      font: 400 12px/1.4 $mono;
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 6px 11px;
      color: var(--ink3);
      font-weight: 500;
      border-bottom: 1px solid var(--line);
      background: var(--panel2);
    }

    td {
      padding: 6px 11px;
      color: var(--ink2);
    }

    .ao-fim {
      text-align: right;
      color: var(--ink);
    }

    .tom-aviso {
      color: var(--amber);
    }

    .tom-erro {
      color: var(--clay);
    }
  }

  &__rodape {
    font: 400 11.5px/1.4 $mono;
    padding: 7px 2px 0;
    color: var(--ink3);
  }
}
</style>
