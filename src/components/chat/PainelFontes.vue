<template>
  <aside class="painel" :class="{ 'painel--flutuante': flutuante }">
    <div class="painel__topo">
      <span class="o-caps">{{ titulo }}</span>
      <div class="painel__espacador" />
      <button v-if="detalhe" class="o-btn o-btn--ghost" type="button" @click="chat.limparFonte()">
        ← todas as fontes
      </button>
      <button class="painel__fechar" type="button" @click="chat.alternarPainelFontes()">×</button>
    </div>

    <div v-if="detalhe" class="painel__corpo">
      <div class="cabecalho">
        <div class="cabecalho__linha">
          <span class="etiqueta" :class="`etiqueta--${detalhe.tipo}`">{{ rotuloTipo }}</span>
          <span class="cabecalho__autoridade">autoridade {{ detalhe.autoridade }} de 4</span>
        </div>
        <div class="cabecalho__caminho">{{ detalhe.caminho }}</div>
        <div class="cabecalho__meta">{{ detalhe.meta }}</div>
      </div>

      <div class="trecho">
        <div class="o-caps">trecho exato</div>
        <div class="trecho__quadro">
          <div
            v-for="linha in detalhe.linhas"
            :key="linha.n"
            class="trecho__linha"
            :class="{ 'trecho__linha--destaque': linha.destaque }"
          >
            <span class="trecho__numero">{{ linha.n }}</span>
            <span class="trecho__texto">{{ linha.texto }}</span>
          </div>
        </div>
      </div>

      <div class="porque">
        <div class="o-caps">como isso entrou na resposta</div>
        <p class="porque__texto">{{ detalhe.porque }}</p>
        <div class="porque__acoes">
          <button class="o-btn" type="button">{{ detalhe.acao }}</button>
          <button class="o-btn o-btn--ghost" type="button">copiar referência</button>
        </div>
      </div>
    </div>

    <div v-else class="painel__corpo">
      <div class="autoridades">
        <div class="o-caps">níveis de autoridade</div>
        <div class="autoridades__lista">
          <div v-for="nivel in niveis" :key="nivel.ordem" class="autoridades__item">
            <span class="autoridades__ordem" :class="`autoridades__ordem--${nivel.tipo}`">
              {{ nivel.ordem }}
            </span>
            <i class="autoridades__marca" :class="`autoridades__marca--${nivel.tipo}`" />
            <span class="autoridades__rotulo" :class="{ fraco: nivel.tipo === 'inferencia' }">
              {{ nivel.rotulo }}
            </span>
          </div>
        </div>
      </div>

      <div class="o-caps fontes__titulo">fontes desta resposta · {{ chat.fontes.length }}</div>

      <div class="fontes">
        <button
          v-for="item in chat.fontes"
          :key="item.id"
          class="fonte"
          :class="`fonte--${item.tipo}`"
          type="button"
          @click="chat.selecionarFonte(item.id)"
        >
          <span class="fonte__topo">
            <span class="fonte__tipo" :class="`fonte__tipo--${item.tipo}`">{{
              rotulo(item.tipo)
            }}</span>
            <span class="fonte__etiqueta">{{ item.etiqueta }}</span>
          </span>
          <span class="fonte__titulo">{{ item.titulo }}</span>
          <span class="fonte__detalhe">{{ item.detalhe }}</span>
        </button>
      </div>

      <div class="cobertura">
        <div class="o-caps">cobertura</div>
        <div class="cobertura__linha">
          <span>afirmações citadas</span>
          <span>{{ cobertura.citadas }} de {{ cobertura.total }}</span>
        </div>
        <div class="cobertura__barra">
          <span :style="{ width: percentual }" />
        </div>
        <div class="cobertura__linha">
          <span>sem fonte (inferência)</span>
          <span class="cobertura__inferencia">{{ cobertura.semFonte }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { COBERTURA } from '@/mocks/conversa';
import { useChatStore } from '@/stores/chat';
import type { TipoFonte } from '@/types/oraculo';

defineProps<{ flutuante: boolean }>();

const chat = useChatStore();
const cobertura = COBERTURA;

const detalhe = computed(() => chat.detalheFonte);
const titulo = computed(() => (detalhe.value ? 'fonte · trecho exato' : 'contexto da resposta'));
const percentual = computed(() => `${Math.round((cobertura.citadas / cobertura.total) * 100)}%`);

const rotulos: Record<TipoFonte, string> = {
  curado: 'curado',
  doc: 'doc',
  codigo: 'código',
  banco: 'banco',
  inferencia: 'inferência',
};

const rotuloTipo = computed(() => (detalhe.value ? rotulos[detalhe.value.tipo] : ''));

function rotulo(tipo: TipoFonte) {
  return rotulos[tipo];
}

const niveis = [
  { ordem: 1, tipo: 'curado', rotulo: 'conhecimento curado' },
  { ordem: 2, tipo: 'doc', rotulo: 'documentação oficial' },
  { ordem: 3, tipo: 'codigo', rotulo: 'código / banco' },
  { ordem: 4, tipo: 'inferencia', rotulo: 'inferência do modelo' },
];
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.painel {
  border-left: 1px solid var(--line);
  background: var(--panel);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 11px;
    border-bottom: 1px solid var(--line);
  }

  &__espacador {
    flex: 1;
  }

  &__fechar {
    background: none;
    border: none;
    color: var(--txt3);
    font-size: 14px;
    cursor: pointer;
    line-height: 1;
  }

  &__corpo {
    flex: 1;
    overflow-y: auto;
  }
}

.cabecalho {
  padding: 11px;
  border-bottom: 1px solid var(--line);

  &__linha {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 7px;
  }

  &__autoridade {
    @include mono(10.5px, 400);
    color: var(--txt3);
  }

  &__caminho {
    @include mono(12.5px, 500, 1.4);
    color: var(--txt);
    word-break: break-all;
    margin-bottom: 5px;
  }

  &__meta {
    @include mono(11px, 400, 1.6);
    color: var(--txt3);
  }
}

.etiqueta {
  @include mono(10px, 500, 1.4);
  padding: 2px 6px;
  border-radius: 3px;

  &--codigo {
    border: 1px solid var(--green-l);
    color: var(--green);
    background: var(--green-b);
  }

  &--doc {
    border: 1px solid var(--blue-l);
    color: var(--blue);
    background: var(--blue-b);
  }

  &--banco {
    border: 1px solid var(--gold-l);
    color: var(--gold);
    background: var(--gold-b);
  }

  &--curado,
  &--inferencia {
    border: 1px solid var(--gray-l);
    color: var(--gray);
    background: var(--gray-b);
  }
}

.trecho {
  padding: 11px;
  border-bottom: 1px solid var(--line);

  &__quadro {
    border: 1px solid var(--line);
    border-radius: 3px;
    background: var(--bg);
    overflow-x: auto;
    margin-top: 7px;
  }

  &__linha {
    display: flex;

    &--destaque {
      background: var(--sel);

      .trecho__texto {
        color: var(--txt);
      }
    }
  }

  &__numero {
    @include mono(11px, 400, 1.7);
    width: 38px;
    flex: none;
    text-align: right;
    padding: 1px 8px 1px 0;
    color: var(--txt3);
    user-select: none;
  }

  &__texto {
    @include mono(11.5px, 400, 1.7);
    padding: 1px 9px 1px 0;
    color: var(--txt2);
    white-space: pre;
  }
}

.porque {
  padding: 11px;
  display: flex;
  flex-direction: column;
  gap: 7px;

  &__texto {
    margin: 0;
    font-size: 12.5px;
    color: var(--txt2);
    text-wrap: pretty;
  }

  &__acoes {
    display: flex;
    gap: 6px;
    margin-top: 3px;
  }
}

.autoridades {
  padding: 10px 11px;
  border-bottom: 1px solid var(--line);

  &__lista {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 7px;
  }

  &__item {
    @include mono(11px, 400, 1.4);
    display: flex;
    align-items: center;
    gap: 7px;
  }

  &__ordem {
    width: 16px;
    text-align: center;

    &--curado {
      color: var(--gray);
    }

    &--doc {
      color: var(--blue);
    }

    &--codigo {
      color: var(--green);
    }

    &--inferencia {
      color: var(--txt3);
    }
  }

  &__marca {
    width: 8px;
    height: 8px;
    border-radius: 2px;

    &--curado {
      background: var(--gray);
    }

    &--doc {
      background: var(--blue);
    }

    &--codigo {
      background: var(--green);
    }

    &--inferencia {
      border: 1px dashed var(--gray-l);
    }
  }

  &__rotulo {
    color: var(--txt2);

    &.fraco {
      color: var(--txt3);
    }
  }
}

.fontes {
  padding: 0 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__titulo {
    padding: 10px 11px 4px;
  }
}

.fonte {
  text-align: left;
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 8px 9px;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: var(--line2);
  }

  &--curado {
    border-left: 2px solid var(--gray);
  }

  &--doc {
    border-left: 2px solid var(--blue);
  }

  &--codigo {
    border-left: 2px solid var(--green);
  }

  &--banco {
    border-left: 2px solid var(--gold);
  }

  &__topo {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  &__tipo {
    @include mono(10px, 500);
    text-transform: uppercase;
    letter-spacing: 0.06em;

    &--curado {
      color: var(--gray);
    }

    &--doc {
      color: var(--blue);
    }

    &--codigo {
      color: var(--green);
    }

    &--banco {
      color: var(--gold);
    }
  }

  &__etiqueta {
    @include mono(10px, 400);
    color: var(--txt3);
  }

  &__titulo {
    font-size: 12.5px;
    color: var(--txt);
    margin-bottom: 2px;
  }

  &__detalhe {
    @include mono(10.5px, 400);
    color: var(--txt3);
  }
}

.cobertura {
  padding: 10px 11px 14px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__linha {
    @include mono(11px, 400);
    display: flex;
    justify-content: space-between;
    color: var(--txt2);
  }

  &__barra {
    height: 4px;
    background: var(--panel3);
    border-radius: 2px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: var(--acc);
    }
  }

  &__inferencia {
    color: var(--gray);
  }
}
</style>
