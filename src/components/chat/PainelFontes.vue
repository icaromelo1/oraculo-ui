<template>
  <aside class="painel" :class="{ 'painel--flutuante': flutuante }">
    <div class="painel__topo">
      <span class="painel__titulo">Fontes desta resposta</span>
      <span class="painel__contagem">{{ chat.fontes.length }}</span>
      <button class="painel__fechar" type="button" @click="chat.alternarPainelFontes()">×</button>
    </div>

    <div class="painel__corpo">
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

      <div class="grupos">
        <div v-for="grupo in gruposFontes" :key="grupo.tipo" class="grupo">
          <div class="grupo__cabecalho">
            <i class="ponto" :class="`ponto--${grupo.tom}`" aria-hidden="true" />
            <span class="grupo__nome" :class="`grupo__nome--${grupo.tom}`">{{ grupo.rotulo }}</span>
            <span class="grupo__contagem">{{ grupo.itens.length }}</span>
          </div>
          <div class="grupo__itens">
            <button
              v-for="item in grupo.itens"
              :key="item.id"
              class="fonte"
              :class="`fonte--${grupo.tom}`"
              type="button"
              @click="chat.selecionarFonte(item.id)"
            >
              <span class="fonte__titulo">{{ item.titulo }}</span>
              <span class="fonte__caminho">{{ item.caminho }}</span>
            </button>
          </div>
        </div>
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
import { computed } from 'vue';
import { tomTipoFonte } from '@/composables/useRotuloFonte';
import { useChatStore } from '@/stores/chat';
import type { Cobertura, Fonte, TipoFonte } from '@/types/oraculo';

defineProps<{ flutuante: boolean }>();

const chat = useChatStore();

const NIVEIS = [
  { tom: 'amber', rotulo: 'Suas notas — o que você mesmo escreveu' },
  { tom: 'slate', rotulo: 'Documentação e configs do workspace' },
  { tom: 'neutro', rotulo: 'Dedução do modelo — sem fonte' },
] as const;

const ROTULOS_GRUPO: Record<TipoFonte, string> = {
  curado: 'Suas notas',
  doc: 'Documentação e configs',
  codigo: 'Código',
  banco: 'Estado dos serviços',
  inferencia: 'Dedução do modelo',
};

const ORDEM_TIPOS: TipoFonte[] = ['curado', 'doc', 'codigo', 'banco', 'inferencia'];

interface GrupoFontes {
  tipo: TipoFonte;
  tom: 'amber' | 'slate' | 'neutro';
  rotulo: string;
  itens: Fonte[];
}

const gruposFontes = computed<GrupoFontes[]>(() => {
  const mapa = new Map<TipoFonte, Fonte[]>();

  for (const fonte of chat.fontes) {
    const lista = mapa.get(fonte.tipo) ?? [];
    lista.push(fonte);
    mapa.set(fonte.tipo, lista);
  }

  return ORDEM_TIPOS.filter((tipo) => mapa.has(tipo)).map((tipo) => ({
    tipo,
    tom: tomTipoFonte(tipo),
    rotulo: ROTULOS_GRUPO[tipo],
    itens: mapa.get(tipo) ?? [],
  }));
});

const cobertura = computed<Cobertura>(
  () => chat.coberturaAtual ?? { citadas: 0, total: 0, semFonte: 0 },
);

const percentual = computed(() => {
  const total = cobertura.value.total;
  return total > 0 ? `${Math.round((cobertura.value.citadas / total) * 100)}%` : '0%';
});
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

  &__contagem {
    font-size: 12px;
    color: var(--ink3);
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

.grupos {
  display: flex;
  flex-direction: column;
}

.grupo {
  &:not(:first-child) {
    border-top: 1px solid var(--line);
  }

  &__cabecalho {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px 7px;
  }

  &__nome {
    font-size: 12.5px;
    font-weight: 600;

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

  &__contagem {
    font-size: 12px;
    color: var(--ink3);
    margin-left: auto;
  }

  &__itens {
    padding: 0 10px 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.fonte {
  text-align: left;
  background: none;
  border: none;
  border-left: 2px solid var(--amber-l);
  border-radius: 0 8px 8px 0;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &:hover {
    background: var(--panel2);
  }

  &--amber {
    border-left-color: var(--amber-l);

    &:hover {
      background: var(--amber-s);
    }
  }

  &--slate {
    border-left-color: var(--slate-l);

    &:hover {
      background: var(--slate-s);
    }
  }

  &--neutro {
    border-left-color: var(--line2);

    &:hover {
      background: var(--panel3);
    }
  }

  &__titulo {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--ink);
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
