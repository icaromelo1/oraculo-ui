<template>
  <div class="pagina">
    <div class="pagina__coluna">
      <h1 class="titulo">Histórico</h1>
      <p class="subtitulo">O que você perguntou, o que eu busquei e o que ficou de fora.</p>

      <div class="filtros">
        <input v-model="busca" class="o-field filtros__busca" placeholder="Buscar no histórico…" />
      </div>

      <div class="resumo">
        <div v-for="cartao in resumo" :key="cartao.rotulo" class="resumo__cartao">
          <div class="resumo__rotulo">{{ cartao.rotulo }}</div>
          <div class="resumo__valor" :class="`resumo__valor--${cartao.tom}`">
            {{ cartao.valor }}
          </div>
        </div>
      </div>

      <p v-if="carregando" class="aviso">carregando…</p>
      <p v-else-if="registros.length === 0" class="aviso">nenhum registro encontrado.</p>

      <div v-else class="lista">
        <div v-for="registro in registros" :key="registro.id" class="cartao">
          <button
            class="cartao__linha"
            type="button"
            :class="{ 'cartao__linha--aberta': registro.id === expandido }"
            @click="void alternar(registro)"
          >
            <span class="cartao__topo">
              <span class="cartao__pergunta">{{ registro.pergunta }}</span>
              <span class="cartao__quando">{{ registro.hora }} · {{ registro.duracao }}</span>
            </span>
            <span class="cartao__meta">
              <span v-if="registro.ferramentas.length" class="cartao__ferramentas">
                <span
                  v-for="(ferramenta, indice) in registro.ferramentas"
                  :key="indice"
                  class="sigla"
                  :class="[
                    `sigla--${ferramenta.tipo}`,
                    { 'sigla--bloqueada': ferramenta.bloqueada },
                  ]"
                >
                  {{ ferramenta.sigla }}
                </span>
              </span>
              <span v-if="registro.fontes > 0">{{ registro.fontes }} fontes</span>
              <span :class="`tom-${registro.tomResultado}`">{{ registro.resultado }}</span>
              <span class="cartao__espacador" />
              <span class="cartao__modelo">{{ registro.modelo }}</span>
            </span>
          </button>

          <div v-if="registro.id === expandido" class="detalhe">
            <p v-if="carregandoDetalhe" class="aviso">carregando trilha…</p>
            <div v-else class="detalhe__grade">
              <div class="o-panel">
                <div class="detalhe__titulo">trilha de execução</div>
                <div v-if="registro.trilha?.length" class="detalhe__trilha">
                  <div v-for="(passo, indice) in registro.trilha" :key="indice">{{ passo }}</div>
                </div>
                <p v-else class="detalhe__vazio">sem trilha registrada.</p>
              </div>
              <div v-if="registro.sqlExecutado" class="o-panel">
                <div class="detalhe__titulo">sql executado</div>
                <pre class="detalhe__sql">{{ registro.sqlExecutado }}</pre>
                <div class="detalhe__nota">{{ registro.notaSql }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="paginacao">
        <span>{{ registros.length }} de {{ total }} registros</span>
        <div class="paginacao__espacador" />
        <button
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="pagina <= 1"
          @click="irParaPagina(pagina - 1)"
        >
          ← anteriores
        </button>
        <button
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="pagina * porPagina >= total"
          @click="irParaPagina(pagina + 1)"
        >
          próximos →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
  listarAuditoria,
  obterAuditoria,
  resumoAuditoria,
  type CartaoResumo,
} from '@/services/auditoria.service';
import type { RegistroAuditoria } from '@/types/oraculo';

const resumo = ref<CartaoResumo[]>([]);
const registros = ref<RegistroAuditoria[]>([]);
const total = ref(0);
const pagina = ref(1);
const porPagina = 25;
const busca = ref('');
const expandido = ref<string | null>(null);
const carregando = ref(false);
const carregandoDetalhe = ref(false);

let referenciaBusca = 0;

async function carregarResumo(): Promise<void> {
  resumo.value = await resumoAuditoria();
}

async function carregarRegistros(): Promise<void> {
  const referencia = ++referenciaBusca;
  carregando.value = true;

  try {
    const resposta = await listarAuditoria({ busca: busca.value, pagina: pagina.value, porPagina });
    if (referencia !== referenciaBusca) return;
    registros.value = resposta.registros;
    total.value = resposta.total;
  } finally {
    if (referencia === referenciaBusca) carregando.value = false;
  }
}

function irParaPagina(alvo: number): void {
  if (alvo < 1) return;
  pagina.value = alvo;
}

async function alternar(registro: RegistroAuditoria): Promise<void> {
  if (expandido.value === registro.id) {
    expandido.value = null;
    return;
  }

  expandido.value = registro.id;

  if (registro.trilha || registro.sqlExecutado) return;

  carregandoDetalhe.value = true;

  try {
    const detalhe = await obterAuditoria(registro.id);
    const indice = registros.value.findIndex((item) => item.id === registro.id);
    if (indice !== -1) registros.value[indice] = detalhe;
  } finally {
    carregandoDetalhe.value = false;
  }
}

let temporizadorBusca: ReturnType<typeof setTimeout> | undefined;

watch(busca, () => {
  clearTimeout(temporizadorBusca);
  temporizadorBusca = setTimeout(() => {
    pagina.value = 1;
    void carregarRegistros();
  }, 300);
});

watch(pagina, () => {
  void carregarRegistros();
});

onMounted(() => {
  void carregarResumo();
  void carregarRegistros();
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.pagina {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 26px 22px 40px;

  &__coluna {
    max-width: 840px;
    margin: 0 auto;
  }
}

.titulo {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.subtitulo {
  margin: 0 0 20px;
  color: var(--ink2);
  font-size: 13.5px;
}

.filtros {
  margin-bottom: 18px;

  &__busca {
    max-width: 420px;
  }
}

.resumo {
  display: flex;
  gap: 26px;
  flex-wrap: wrap;
  padding: 14px 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  margin-bottom: 22px;

  &__rotulo {
    font-size: 12.5px;
    color: var(--ink3);
    margin-bottom: 3px;
  }

  &__valor {
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);

    &--erro {
      color: var(--clay);
    }

    &--aviso {
      color: var(--amber);
    }
  }
}

.aviso {
  font-size: 13px;
  padding: 14px 2px;
  color: var(--ink3);
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 16px;
}

.cartao {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;

  &__linha {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 14px 16px;
    cursor: pointer;
    display: block;

    &:hover {
      background: var(--panel2);
    }

    &--aberta {
      background: var(--sel);
    }
  }

  &__topo {
    display: flex;
    gap: 12px;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: 7px;
  }

  &__pergunta {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    flex: 1;
    min-width: 200px;
  }

  &__quando {
    font-size: 12.5px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    align-items: center;
    font-size: 12.5px;
    color: var(--ink2);
  }

  &__ferramentas {
    display: flex;
    gap: 6px;
  }

  &__espacador {
    flex: 1;
  }

  &__modelo {
    font: 400 12px/1 $mono;
    color: var(--ink3);
  }
}

.sigla {
  &--doc,
  &--codigo,
  &--banco {
    color: var(--slate);
  }

  &--curado {
    color: var(--amber);
  }

  &--shell {
    color: var(--amber);
  }

  &--inferencia {
    color: var(--ink3);
  }

  &--bloqueada {
    color: var(--clay);
  }
}

.tom-ok {
  color: var(--sage);
}

.tom-aviso {
  color: var(--amber);
}

.tom-erro {
  color: var(--clay);
}

.tom-neutro {
  color: var(--ink2);
}

.detalhe {
  padding: 0 16px 14px;

  &__grade {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 10px;
  }

  &__titulo {
    font-size: 12.5px;
    color: var(--ink3);
    padding: 9px 12px;
    border-bottom: 1px solid var(--line);
  }

  &__trilha {
    font: 400 12px/1.6 $mono;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    color: var(--ink2);
  }

  &__vazio {
    font-size: 12.5px;
    padding: 12px;
    margin: 0;
    color: var(--ink3);
  }

  &__sql {
    font: 400 12px/1.6 $mono;
    margin: 0;
    padding: 9px 12px;
    color: var(--ink2);
    overflow-x: auto;
  }

  &__nota {
    font-size: 11.5px;
    padding: 8px 12px;
    border-top: 1px solid var(--line);
    color: var(--ink3);
  }
}

.paginacao {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: var(--ink3);

  &__espacador {
    flex: 1;
  }
}
</style>
