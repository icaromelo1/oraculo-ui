<template>
  <div class="biblioteca">
    <div class="rotulo-secao">biblioteca — o que já está indexado</div>

    <div class="filtros">
      <input
        v-model="busca"
        class="o-field filtros__busca"
        type="search"
        placeholder="Buscar na biblioteca…"
        aria-label="Buscar na biblioteca"
      />
      <select v-model="fonte" class="o-field filtros__seletor" aria-label="Filtrar por fonte">
        <option value="">todas as fontes</option>
        <option v-for="opcao in FONTES" :key="opcao.chave" :value="opcao.chave">
          {{ opcao.rotulo }}
        </option>
      </select>
      <select
        v-model="autoridade"
        class="o-field filtros__seletor"
        aria-label="Filtrar por autoridade"
      >
        <option :value="0">todas as autoridades</option>
        <option v-for="nivel in AUTORIDADES" :key="nivel.autoridade" :value="nivel.autoridade">
          {{ nivel.autoridade }} · {{ nivel.rotulo }}
        </option>
      </select>
    </div>

    <div class="legenda">
      <span v-for="nivel in AUTORIDADES" :key="nivel.autoridade" class="legenda__item">
        <i class="ponto" :class="`ponto--${nivel.tom}`" aria-hidden="true" />
        {{ nivel.autoridade }} · {{ nivel.rotulo }}
      </span>
    </div>

    <p v-if="carregando && documentos.length === 0" class="mensagem">carregando…</p>
    <p v-else-if="erroLista" class="mensagem mensagem--erro" role="alert">{{ erroLista }}</p>
    <p v-else-if="documentos.length === 0" class="mensagem">{{ mensagemVazia }}</p>

    <div v-else class="documentos">
      <div v-for="documento in documentos" :key="documento.id" class="documento">
        <button
          class="documento__linha"
          type="button"
          :class="{ 'documento__linha--aberta': documento.id === aberto }"
          :aria-expanded="documento.id === aberto"
          @click="alternar(documento.id)"
        >
          <span class="documento__topo">
            <i
              class="ponto"
              :class="`ponto--${tomDaAutoridade(documento.autoridade)}`"
              aria-hidden="true"
            />
            <span class="documento__titulo">{{ documento.titulo }}</span>
            <span class="documento__caminho">{{ documento.caminho }}</span>
          </span>
          <span class="documento__meta">
            {{ rotuloDaFonte(documento.fonte) }} · {{ documento.trechos }}
            {{ documento.trechos === 1 ? 'trecho' : 'trechos' }} ·
            {{ formatarBytes(documento.bytes) }} · {{ formatarQuando(documento.atualizadoEm) }}
            <template v-if="!documento.editavel"> · somente leitura</template>
          </span>
        </button>

        <VisualizadorDocumento
          v-if="documento.id === aberto"
          :key="documento.id"
          :documento="documento"
          @salvo="void aoSalvar($event)"
        />
      </div>
    </div>

    <p v-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>

    <div v-if="documentos.length > 0 && total > POR_PAGINA" class="paginacao">
      <span>{{ intervaloExibido }} de {{ total }}</span>
      <span class="paginacao__espacador" />
      <button
        class="o-btn o-btn--ghost"
        type="button"
        :disabled="pagina <= 1 || carregando"
        @click="irParaPagina(pagina - 1)"
      >
        ← anteriores
      </button>
      <button
        class="o-btn o-btn--ghost"
        type="button"
        :disabled="pagina * POR_PAGINA >= total || carregando"
        @click="irParaPagina(pagina + 1)"
      >
        próximos →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { formatarBytes, formatarQuando } from './formato';
import VisualizadorDocumento from './VisualizadorDocumento.vue';
import {
  listarDocumentos,
  type DocumentoIndexado,
  type FiltroDeDocumentos,
  type FonteDocumento,
} from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

const emit = defineEmits<{ atualizado: [] }>();

const POR_PAGINA = 20;

const FONTES: { chave: FonteDocumento; rotulo: string }[] = [
  { chave: 'nota', rotulo: 'notas' },
  { chave: 'memoria', rotulo: 'memória' },
  { chave: 'agente', rotulo: 'agentes' },
  { chave: 'doc', rotulo: 'documentação' },
  { chave: 'config', rotulo: 'configuração' },
  { chave: 'codigo', rotulo: 'código' },
];

const ROTULOS_DE_FONTE: Record<FonteDocumento, string> = {
  nota: 'nota',
  memoria: 'memória',
  agente: 'agente',
  doc: 'documentação',
  config: 'configuração',
  codigo: 'código',
};

const AUTORIDADES = [
  { autoridade: 1, tom: 'amber', rotulo: 'suas notas, memória e agentes' },
  { autoridade: 2, tom: 'slate', rotulo: 'documentação' },
  { autoridade: 3, tom: 'neutro', rotulo: 'código e configuração' },
] as const;

const documentos = ref<DocumentoIndexado[]>([]);
const total = ref(0);
const pagina = ref(1);
const busca = ref('');
const fonte = ref<FonteDocumento | ''>('');
const autoridade = ref(0);
const aberto = ref<string | null>(null);
const carregando = ref(true);
const erroLista = ref('');
const feito = ref('');

let referencia = 0;
let temporizador: ReturnType<typeof setTimeout> | undefined;

const temFiltro = computed(
  () => busca.value.trim().length > 0 || fonte.value !== '' || autoridade.value !== 0,
);

const mensagemVazia = computed(() =>
  temFiltro.value
    ? 'nenhum documento casa com esse filtro — tente outro termo ou limpe os filtros.'
    : 'nada indexado ainda — escreva uma nota, envie um arquivo ou cadastre uma pasta do servidor.',
);

const intervaloExibido = computed(() => {
  const primeiro = (pagina.value - 1) * POR_PAGINA + 1;
  const ultimo = primeiro + documentos.value.length - 1;

  return `${primeiro}–${ultimo}`;
});

function rotuloDaFonte(chave: FonteDocumento): string {
  return ROTULOS_DE_FONTE[chave] ?? chave;
}

function nivelDaAutoridade(valor: number): (typeof AUTORIDADES)[number] | undefined {
  return AUTORIDADES.find((item) => item.autoridade === valor);
}

function tomDaAutoridade(valor: number): string {
  return nivelDaAutoridade(valor)?.tom ?? 'neutro';
}

function filtroAtual(): FiltroDeDocumentos {
  const termo = busca.value.trim();

  return {
    pagina: pagina.value,
    porPagina: POR_PAGINA,
    ...(termo ? { busca: termo } : {}),
    ...(fonte.value ? { fonte: fonte.value } : {}),
    ...(autoridade.value ? { autoridade: autoridade.value } : {}),
  };
}

async function carregar(silencioso = false): Promise<void> {
  const atual = ++referencia;

  if (!silencioso) {
    carregando.value = true;
    erroLista.value = '';
  }

  try {
    const resposta = await listarDocumentos(filtroAtual());

    if (atual !== referencia) return;

    documentos.value = resposta.documentos;
    total.value = resposta.total;
    erroLista.value = '';
  } catch (falha) {
    if (atual !== referencia || silencioso) return;

    documentos.value = [];
    total.value = 0;
    erroLista.value = mensagemDoErro(falha, 'não consegui listar os documentos indexados');
  } finally {
    if (atual === referencia) carregando.value = false;
  }
}

function alternar(id: string): void {
  feito.value = '';
  aberto.value = aberto.value === id ? null : id;
}

function irParaPagina(alvo: number): void {
  if (alvo < 1) return;

  pagina.value = alvo;
}

async function aoSalvar(trechos: number): Promise<void> {
  feito.value =
    trechos > 0
      ? `salvo — ${trechos} ${trechos === 1 ? 'trecho reindexado' : 'trechos reindexados'}`
      : 'salvo, mas nada foi reindexado agora — a próxima varredura do corpus recupera';

  await carregar(true);
  emit('atualizado');
}

watch(busca, () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    aberto.value = null;
    pagina.value = 1;
    void carregar();
  }, 300);
});

watch([fonte, autoridade], () => {
  aberto.value = null;
  pagina.value = 1;
  void carregar();
});

watch(pagina, () => {
  aberto.value = null;
  void carregar();
});

onMounted(() => {
  void carregar();
});

onUnmounted(() => {
  clearTimeout(temporizador);
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.biblioteca {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
}

.filtros {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  &__busca {
    flex: 1;
    min-width: 200px;
  }

  &__seletor {
    width: auto;
    min-width: 150px;
    cursor: pointer;
  }
}

.legenda {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--ink3);

  &__item {
    display: flex;
    align-items: center;
    gap: 5px;
  }
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

.documentos {
  display: flex;
  flex-direction: column;
}

.documento {
  &:not(:first-child) {
    border-top: 1px solid var(--line);
  }

  &__linha {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    border-radius: 8px;
    padding: 8px 6px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 3px;

    &:hover {
      background: var(--panel2);
    }

    &--aberta {
      background: var(--sel);
    }
  }

  &__topo {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__titulo {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    flex: 1;
    word-break: break-all;
  }

  &__meta {
    font-size: 11.5px;
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

.mensagem {
  margin: 0;
  padding: 4px 0;
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
