<template>
  <Teleport to="body">
    <div v-if="fonte" class="modal-fundo" @mousedown="fecharSeForaClique">
      <div
        ref="caixaRef"
        class="modal-caixa"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="tituloId"
        @keydown.esc="fechar"
        @keydown.tab="aoTab"
      >
        <div class="modal-topo">
          <i class="ponto" :class="`ponto--${tom}`" aria-hidden="true" />
          <div class="modal-topo__info">
            <div class="modal-topo__nivel" :class="`modal-topo__nivel--${tom}`">
              {{ rotuloTipoFonte(fonte.tipo) }}
            </div>
            <div :id="tituloId" class="modal-topo__titulo">{{ fonte.titulo }}</div>
            <div class="modal-topo__caminho">{{ fonte.caminho }}</div>
          </div>
          <button
            ref="fecharRef"
            class="modal-topo__fechar"
            type="button"
            aria-label="fechar"
            @click="fechar"
          >
            ×
          </button>
        </div>

        <div class="modal-corpo">
          <div class="coluna-esquerda">
            <div class="coluna-esquerda__linha">
              <span class="rotulo-secao">trecho exato, como está no arquivo</span>
              <span class="coluna-esquerda__meta">{{ fonte.meta }}</span>
            </div>
            <div class="trecho">
              <div
                v-for="linha in fonte.linhas"
                :key="linha.n"
                class="trecho__linha"
                :class="{ 'trecho__linha--destaque': linha.destaque }"
              >
                <span class="trecho__numero">{{ linha.n }}</span>
                <span class="trecho__texto">{{ linha.texto }}</span>
              </div>
            </div>
            <div class="porque">
              <div class="rotulo-secao">por que isso entrou na resposta</div>
              <p class="porque__texto">{{ fonte.porque }}</p>
              <button class="porque__copiar" type="button" @click="copiarCaminho(fonte.caminho)">
                {{ copiado ? 'copiado!' : 'copiar caminho' }}
              </button>
            </div>
          </div>

          <div class="coluna-direita">
            <div class="rotulo-secao">como eu cheguei nesta fonte</div>

            <div v-if="passo" class="trilha">
              <div class="trilha__marcador">
                <i class="ponto" :class="`ponto--${tom}`" aria-hidden="true" />
              </div>
              <div class="trilha__conteudo">
                <div class="trilha__cabeca">
                  <span class="trilha__titulo">{{ passo.titulo }}</span>
                  <span class="trilha__tempo">{{ passo.tempo }}</span>
                </div>
                <div class="trilha__comando">{{ passo.comando }}</div>
                <div class="trilha__resultado">{{ passo.resultado }}</div>
              </div>
            </div>
            <p v-else class="trilha__vazio">não registrado para esta fonte</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { formatarSegundos } from '@/composables/useFormato';
import { rotuloFerramenta } from '@/composables/useRotuloFerramenta';
import { rotuloTipoFonte, tomTipoFonte } from '@/composables/useRotuloFonte';
import { useChatStore } from '@/stores/chat';

const chat = useChatStore();
const copiado = ref(false);
const caixaRef = ref<HTMLElement | null>(null);
const fecharRef = ref<HTMLButtonElement | null>(null);
let elementoQueAbriu: HTMLElement | null = null;

const tituloId = 'modal-fonte-titulo';

const fonte = computed(() => chat.detalheFonte);
const tom = computed(() => (fonte.value ? tomTipoFonte(fonte.value.tipo) : 'neutro'));

interface PassoTrilha {
  titulo: string;
  comando: string;
  resultado: string;
  tempo: string;
}

const passo = computed<PassoTrilha | null>(() => {
  const atual = fonte.value;
  if (!atual) return null;

  const ferramentaId = chat.fonteParaFerramenta[atual.id];
  if (!ferramentaId) return null;

  for (const mensagem of chat.mensagens) {
    if (mensagem.papel !== 'assistente') continue;
    const ferramenta = mensagem.ferramentas.find((item) => item.id === ferramentaId);

    if (ferramenta) {
      return {
        titulo: rotuloFerramenta(ferramenta.nome),
        comando: ferramenta.argumento || '—',
        resultado: ferramenta.metrica || '—',
        tempo: formatarSegundos(ferramenta.duracaoMs ?? null),
      };
    }
  }

  return null;
});

function fechar(): void {
  chat.limparFonte();
}

function fecharSeForaClique(evento: MouseEvent): void {
  if (evento.target === evento.currentTarget) fechar();
}

function aoTab(evento: KeyboardEvent): void {
  const caixa = caixaRef.value;
  if (!caixa) return;

  const focaveis = caixa.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (focaveis.length === 0) return;

  const primeiro = focaveis[0] as HTMLElement;
  const ultimo = focaveis[focaveis.length - 1] as HTMLElement;

  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}

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

watch(fonte, (novo, anterior) => {
  if (novo && !anterior) {
    elementoQueAbriu = document.activeElement as HTMLElement | null;
    void nextTick(() => fecharRef.value?.focus());
  } else if (!novo && anterior) {
    elementoQueAbriu?.focus();
    elementoQueAbriu = null;
  }
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.modal-fundo {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(30 26 22 / 42%);
}

.modal-caixa {
  position: relative;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 24px 64px -24px rgba(30, 26, 22, 0.5);
  width: min(880px, 100%);
  max-height: min(660px, 88vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-topo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__nivel {
    font-size: 12.5px;
    margin-bottom: 3px;

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
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
    color: var(--ink);
  }

  &__caminho {
    font: 400 12px/1.6 $mono;
    color: var(--ink3);
    word-break: break-all;
  }

  &__fechar {
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--ink2);
    font-size: 15px;
    cursor: pointer;
    line-height: 1;
    padding: 5px 9px;
    flex: none;

    &:hover {
      color: var(--ink);
      border-color: var(--line2);
    }
  }
}

.ponto {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-top: 7px;
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

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
}

.modal-corpo {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.coluna-esquerda {
  padding: 16px 18px;
  border-right: 1px solid var(--line);
  min-width: 0;

  &__linha {
    display: flex;
    align-items: baseline;
    gap: 9px;
    margin-bottom: 10px;
  }

  &__meta {
    font-size: 12px;
    color: var(--ink3);
    margin-left: auto;
    white-space: nowrap;
  }
}

.trecho {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel2);
  overflow-x: auto;

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
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--line);

  &__texto {
    margin: 5px 0 9px;
    font-size: 13.5px;
    color: var(--ink2);
    text-wrap: pretty;
  }

  &__copiar {
    background: none;
    border: none;
    color: var(--ink3);
    cursor: pointer;
    font: inherit;
    font-size: 12.5px;
    padding: 0;
    text-decoration: underline;

    &:hover {
      color: var(--ink);
    }
  }
}

.coluna-direita {
  padding: 16px 18px;
  min-width: 0;
  background: var(--panel2);

  .rotulo-secao {
    margin-bottom: 12px;
  }
}

.trilha {
  display: flex;
  gap: 11px;

  &__marcador {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: none;
    padding-top: 4px;
  }

  &__conteudo {
    flex: 1;
    min-width: 0;
  }

  &__cabeca {
    display: flex;
    align-items: baseline;
    gap: 9px;
    margin-bottom: 5px;
  }

  &__titulo {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
    flex: 1;
  }

  &__tempo {
    font-size: 12px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__comando {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 9px 11px;
    font: 400 12px/1.7 $mono;
    color: var(--ink2);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__resultado {
    font-size: 12.5px;
    color: var(--ink3);
    margin-top: 6px;
  }

  &__vazio {
    margin: 0;
    font-size: 13px;
    color: var(--ink3);
  }
}
</style>
