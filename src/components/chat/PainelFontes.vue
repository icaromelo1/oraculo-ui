<template>
  <aside class="painel" :class="{ 'painel--flutuante': flutuante }">
    <div class="painel__topo">
      <span class="painel__titulo">{{ titulo }}</span>
      <div class="painel__espacador" />
      <button v-if="detalhe" class="o-btn o-btn--ghost" type="button" @click="chat.limparFonte()">
        todas as fontes
      </button>
      <button class="painel__fechar" type="button" @click="chat.alternarPainelFontes()">×</button>
    </div>

    <div v-if="detalhe" class="painel__corpo">
      <div class="cabecalho">
        <div class="cabecalho__linha">
          <i class="ponto" :class="`ponto--${tomTipoFonte(detalhe.tipo)}`" aria-hidden="true" />
          <span class="cabecalho__tipo" :class="`cabecalho__tipo--${tomTipoFonte(detalhe.tipo)}`">
            {{ rotuloTipoFonte(detalhe.tipo) }}
          </span>
        </div>
        <div class="cabecalho__titulo">{{ detalhe.titulo }}</div>
        <div class="cabecalho__caminho">{{ detalhe.caminho }}</div>
        <div class="cabecalho__meta">{{ detalhe.meta }}</div>
      </div>

      <div class="trecho">
        <div class="rotulo-secao">trecho exato</div>
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
        <div class="rotulo-secao">por que isso entrou na resposta</div>
        <p class="porque__texto">{{ detalhe.porque }}</p>
        <div class="porque__acoes">
          <button class="o-btn" type="button">{{ detalhe.acao }}</button>
          <button class="o-btn o-btn--ghost" type="button" @click="copiarCaminho(detalhe.caminho)">
            {{ copiado ? 'copiado!' : 'copiar caminho' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="painel__corpo">
      <div class="autoridades">
        <div class="rotulo-secao">quanto vale cada fonte</div>
        <div class="autoridades__lista">
          <div v-for="nivel in NIVEIS" :key="nivel.tom" class="autoridades__item">
            <i class="ponto" :class="`ponto--${nivel.tom}`" aria-hidden="true" />
            <span class="autoridades__rotulo" :class="{ fraco: nivel.tom === 'neutro' }">
              {{ nivel.rotulo }}
            </span>
          </div>
        </div>
      </div>

      <div class="rotulo-secao fontes__titulo">
        fontes desta resposta · {{ chat.fontes.length }}
      </div>

      <div class="fontes">
        <button
          v-for="item in chat.fontes"
          :key="item.id"
          class="fonte"
          :class="`fonte--${tomTipoFonte(item.tipo)}`"
          type="button"
          @click="chat.selecionarFonte(item.id)"
        >
          <span class="fonte__topo">
            <i class="ponto" :class="`ponto--${tomTipoFonte(item.tipo)}`" aria-hidden="true" />
            <span class="fonte__tipo" :class="`fonte__tipo--${tomTipoFonte(item.tipo)}`">{{
              rotuloTipoFonte(item.tipo)
            }}</span>
            <span class="fonte__etiqueta">{{ item.etiqueta }}</span>
          </span>
          <span class="fonte__titulo">{{ item.titulo }}</span>
          <span class="fonte__caminho">{{ item.caminho }}</span>
        </button>
      </div>

      <div v-if="cobertura.total > 0" class="cobertura">
        <div class="cobertura__linha cobertura__linha--titulo">
          <span>Afirmações com fonte</span>
          <span>{{ cobertura.citadas }} de {{ cobertura.total }}</span>
        </div>
        <div class="cobertura__barra">
          <span :style="{ width: percentual }" />
        </div>
        <div v-if="cobertura.semFonte > 0" class="cobertura__nota">
          {{ cobertura.semFonte }} afirmação(ões) sem fonte — dedução do modelo, sem trecho
          correspondente na base.
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { rotuloTipoFonte, tomTipoFonte } from '@/composables/useRotuloFonte';
import { useChatStore } from '@/stores/chat';
import type { Cobertura } from '@/types/oraculo';

defineProps<{ flutuante: boolean }>();

const chat = useChatStore();
const copiado = ref(false);

const NIVEIS = [
  { tom: 'amber', rotulo: 'Suas notas — o que você mesmo escreveu' },
  { tom: 'slate', rotulo: 'Documentação e configs do workspace' },
  { tom: 'neutro', rotulo: 'Dedução do modelo — sem fonte' },
] as const;

const cobertura = computed<Cobertura>(
  () => chat.coberturaAtual ?? { citadas: 0, total: 0, semFonte: 0 },
);

const detalhe = computed(() => chat.detalheFonte);
const titulo = computed(() => (detalhe.value ? 'Trecho citado' : 'Fontes desta resposta'));
const percentual = computed(() => {
  const total = cobertura.value.total;
  return total > 0 ? `${Math.round((cobertura.value.citadas / total) * 100)}%` : '0%';
});

async function copiarCaminho(caminho: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(caminho);
    copiado.value = true;
    setTimeout(() => {
      copiado.value = false;
    }, 1500);
  } catch {
    copiado.value = false;
  }
}
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
    gap: 9px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--line);
  }

  &__titulo {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    flex: 1;
  }

  &__espacador {
    flex: 1;
  }

  &__fechar {
    background: none;
    border: none;
    color: var(--ink3);
    font-size: 17px;
    cursor: pointer;
    line-height: 1;
    padding: 0 2px;
  }

  &__corpo {
    flex: 1;
    overflow-y: auto;
  }
}

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
}

.ponto {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;

  &--amber {
    background: var(--amber);
  }

  &--slate {
    background: var(--slate);
  }

  &--neutro {
    background: var(--line2);
  }
}

.cabecalho {
  padding: 14px;
  border-bottom: 1px solid var(--line);

  &__linha {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__tipo {
    font-size: 12.5px;

    &--amber {
      color: var(--amber);
    }

    &--slate {
      color: var(--slate);
    }

    &--neutro {
      color: var(--ink3);
    }
  }

  &__titulo {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 4px;
  }

  &__caminho {
    font: 400 12px/1.6 $mono;
    color: var(--ink3);
    word-break: break-all;
  }

  &__meta {
    font-size: 12.5px;
    color: var(--ink3);
    margin-top: 7px;
  }
}

.trecho {
  padding: 14px;
  border-bottom: 1px solid var(--line);

  &__quadro {
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--panel2);
    overflow-x: auto;
    margin-top: 9px;
  }

  &__linha {
    display: flex;

    &--destaque {
      background: var(--sel);

      .trecho__texto {
        color: var(--ink);
      }
    }
  }

  &__numero {
    font: 400 11.5px/1.75 $mono;
    width: 34px;
    flex: none;
    text-align: right;
    padding: 2px 9px 2px 0;
    color: var(--ink3);
    user-select: none;
  }

  &__texto {
    font: 400 12.5px/1.75 $mono;
    padding: 2px 10px 2px 0;
    color: var(--ink2);
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.porque {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 9px;

  &__texto {
    margin: 0;
    font-size: 13.5px;
    color: var(--ink2);
    text-wrap: pretty;
  }

  &__acoes {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
}

.autoridades {
  padding: 13px 14px;
  border-bottom: 1px solid var(--line);

  &__lista {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-top: 9px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
  }

  &__rotulo {
    color: var(--ink2);

    &.fraco {
      color: var(--ink3);
    }
  }
}

.fontes {
  padding: 0 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;

  &__titulo {
    padding: 13px 14px 6px;
  }
}

.fonte {
  text-align: left;
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 11px;
  padding: 11px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    background: var(--panel3);
    border-color: var(--line2);
  }

  &--amber:hover {
    background: var(--amber-s);
    border-color: var(--amber-l);
  }

  &--slate:hover {
    background: var(--slate-s);
    border-color: var(--slate-l);
  }

  &__topo {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 5px;
  }

  &__tipo {
    font-size: 12px;

    &--amber {
      color: var(--amber);
    }

    &--slate {
      color: var(--slate);
    }

    &--neutro {
      color: var(--ink3);
    }
  }

  &__etiqueta {
    font-size: 12px;
    color: var(--ink3);
    margin-left: auto;
  }

  &__titulo {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 3px;
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    word-break: break-all;
  }
}

.cobertura {
  padding: 13px 14px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__linha {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--ink2);

    &--titulo span:last-child {
      color: var(--ink);
    }
  }

  &__barra {
    height: 5px;
    background: var(--panel3);
    border-radius: 3px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: var(--sage);
      border-radius: 3px;
    }
  }

  &__nota {
    font-size: 12.5px;
    color: var(--ink3);
  }
}
</style>
