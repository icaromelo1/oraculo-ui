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

    <nav class="migalhas" aria-label="Pastas do conhecimento">
      <button
        class="migalhas__item"
        type="button"
        :aria-current="pasta === null ? 'true' : undefined"
        @click="irParaPasta(null)"
      >
        todos os documentos
      </button>
      <template v-for="(migalha, indice) in migalhas" :key="migalha.caminho">
        <span class="migalhas__seta" aria-hidden="true">›</span>
        <button
          class="migalhas__item"
          type="button"
          :aria-current="indice === migalhas.length - 1 ? 'true' : undefined"
          @click="irParaPasta(migalha.caminho)"
        >
          {{ migalha.rotulo }}
        </button>
      </template>
    </nav>

    <p v-if="erroPastas" class="mensagem mensagem--erro" role="alert">{{ erroPastas }}</p>

    <div v-if="subpastas.length > 0" class="pastas">
      <button
        v-for="subpasta in subpastas"
        :key="subpasta.caminho"
        class="pastas__item"
        type="button"
        @click="irParaPasta(subpasta.caminho)"
      >
        <span class="pastas__seta" aria-hidden="true">▸</span>
        <span class="pastas__nome">{{ subpasta.rotulo }}</span>
        <span class="pastas__total">
          {{ subpasta.total }} {{ subpasta.total === 1 ? 'documento' : 'documentos' }}
          <template v-if="subpasta.subpastas > 0">
            · {{ subpasta.subpastas }}
            {{ subpasta.subpastas === 1 ? 'subpasta' : 'subpastas' }}
          </template>
        </span>
      </button>
    </div>

    <p v-if="pasta !== null" class="mensagem">{{ resumoDaPasta }}</p>

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
        <button class="documento__linha" type="button" @click="abrir(documento)">
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

    <ModalDocumento
      :documento="selecionado"
      @fechar="selecionado = null"
      @salvo="void aoSalvar($event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { colapsar, construirArvore, migalhasDaPasta } from './arvoreDePastas';
import { AUTORIDADES, tomDaAutoridade } from './autoridade';
import { formatarBytes, formatarQuando } from './formato';
import ModalDocumento from './ModalDocumento.vue';
import {
  listarDocumentos,
  listarPastas,
  type DocumentoIndexado,
  type FiltroDeDocumentos,
  type FonteDocumento,
  type PastaIndexada,
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

const documentos = ref<DocumentoIndexado[]>([]);
const total = ref(0);
const pagina = ref(1);
const busca = ref('');
const fonte = ref<FonteDocumento | ''>('');
const autoridade = ref(0);
const pasta = ref<string | null>(null);
const pastas = ref<PastaIndexada[]>([]);
const selecionado = ref<DocumentoIndexado | null>(null);
const carregando = ref(true);
const erroLista = ref('');
const erroPastas = ref('');
const feito = ref('');

let referencia = 0;
let temporizador: ReturnType<typeof setTimeout> | undefined;

const arvore = computed(() => construirArvore(pastas.value));

const noAtual = computed(() =>
  pasta.value === null ? null : (arvore.value.porCaminho.get(pasta.value) ?? null),
);

const migalhas = computed(() =>
  pasta.value === null ? [] : migalhasDaPasta(pasta.value, arvore.value.porCaminho),
);

const subpastas = computed(() => {
  const nos = pasta.value === null ? arvore.value.raizes : (noAtual.value?.filhos ?? []);

  return nos.map(colapsar);
});

const resumoDaPasta = computed(() => {
  const no = noAtual.value;

  if (!no) return 'esta pasta não aparece no índice de pastas — a lista abaixo veio direto da api.';

  const diretos = no.diretos === 1 ? '1 arquivo nesta pasta' : `${no.diretos} arquivos nesta pasta`;

  if (temFiltro.value) {
    return `busca ativa — procurando nesta pasta e nas ${no.filhos.length} subpastas.`;
  }

  if (no.filhos.length === 0) return `${diretos}.`;

  const abaixo = no.total - no.diretos;

  return `${diretos} · ${abaixo} em subpastas, abra a subpasta para ver.`;
});

const temFiltro = computed(
  () => busca.value.trim().length > 0 || fonte.value !== '' || autoridade.value !== 0,
);

const mensagemVazia = computed(() => {
  if (temFiltro.value) {
    return pasta.value === null
      ? 'nenhum documento casa com esse filtro — tente outro termo ou limpe os filtros.'
      : 'nenhum documento casa com esse filtro dentro desta pasta — tente outro termo ou volte para todos os documentos.';
  }

  if (pasta.value !== null) {
    const no = noAtual.value;

    if (no && no.diretos === 0 && no.filhos.length > 0) {
      return 'esta pasta não guarda arquivo nenhum direto — o que existe está nas subpastas acima.';
    }

    return 'esta pasta não tem nenhum documento indexado.';
  }

  return 'nada indexado ainda — escreva uma nota, envie um arquivo ou cadastre uma pasta do servidor.';
});

const intervaloExibido = computed(() => {
  const primeiro = (pagina.value - 1) * POR_PAGINA + 1;
  const ultimo = primeiro + documentos.value.length - 1;

  return `${primeiro}–${ultimo}`;
});

function rotuloDaFonte(chave: FonteDocumento): string {
  return ROTULOS_DE_FONTE[chave] ?? chave;
}

function filtroAtual(): FiltroDeDocumentos {
  const termo = busca.value.trim();

  return {
    pagina: pagina.value,
    porPagina: POR_PAGINA,
    ...(termo ? { busca: termo } : {}),
    ...(fonte.value ? { fonte: fonte.value } : {}),
    ...(autoridade.value ? { autoridade: autoridade.value } : {}),
    ...(pasta.value ? { pasta: pasta.value } : {}),
    ...(pasta.value && !temFiltro.value ? { recursivo: false } : {}),
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

async function carregarPastas(): Promise<void> {
  erroPastas.value = '';

  try {
    pastas.value = await listarPastas();
  } catch (falha) {
    pastas.value = [];
    erroPastas.value = mensagemDoErro(
      falha,
      'não consegui montar a árvore de pastas — a lista abaixo continua completa',
    );
  }
}

function abrir(documento: DocumentoIndexado): void {
  feito.value = '';
  selecionado.value = documento;
}

function irParaPasta(caminho: string | null): void {
  if (pasta.value === caminho) return;

  feito.value = '';
  pasta.value = caminho;
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
    pagina.value = 1;
    void carregar();
  }, 300);
});

watch([fonte, autoridade, pasta], () => {
  pagina.value = 1;
  void carregar();
});

watch(pagina, () => {
  void carregar();
});

onMounted(() => {
  void carregar();
  void carregarPastas();
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

.migalhas {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;

  &__item {
    font: 400 11.5px/1.5 $mono;
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--ink3);
    padding: 2px 5px;
    cursor: pointer;
    word-break: break-all;
    text-align: left;

    &:hover {
      color: var(--ink);
      background: var(--panel2);
    }

    &[aria-current='true'] {
      color: var(--ink);
      background: var(--sel);
    }
  }

  &__seta {
    color: var(--ink3);
    font-size: 12px;
  }
}

.pastas {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    width: 100%;
    text-align: left;
    background: var(--panel2);
    border: none;
    padding: 8px 11px;
    cursor: pointer;

    &:not(:first-child) {
      border-top: 1px solid var(--line);
    }

    &:hover {
      background: var(--sel);
    }
  }

  &__seta {
    color: var(--ink3);
    font-size: 10px;
    flex: none;
  }

  &__nome {
    font: 400 12.5px/1.5 $mono;
    color: var(--ink);
    flex: 1;
    word-break: break-all;
  }

  &__total {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
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
