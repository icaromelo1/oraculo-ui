<template>
  <div class="explorador">
    <div class="explorador__topo">
      <div class="alternador" role="group" aria-label="Organizar por">
        <span class="alternador__rotulo">organizar por</span>
        <button
          v-for="opcao in EIXOS"
          :key="opcao.chave"
          class="alternador__item"
          type="button"
          :class="{ 'alternador__item--ativo': eixo === opcao.chave }"
          :aria-pressed="eixo === opcao.chave"
          @click="trocarEixo(opcao.chave)"
        >
          {{ opcao.rotulo }}
        </button>
      </div>

      <span class="explorador__espacador" />

      <select v-model="ordenar" class="o-field seletor-curto" aria-label="Ordenar por">
        <option value="data">mais recentes</option>
        <option value="nome">nome</option>
      </select>

      <div class="visao" role="group" aria-label="Modo de exibição">
        <button
          v-for="opcao in VISOES"
          :key="opcao.chave"
          class="visao__item"
          type="button"
          :class="{ 'visao__item--ativa': visao === opcao.chave }"
          :aria-pressed="visao === opcao.chave"
          :title="opcao.titulo"
          @click="visao = opcao.chave"
        >
          {{ opcao.icone }}
        </button>
      </div>
    </div>

    <div class="filtros">
      <input
        v-model="busca"
        class="o-field filtros__busca"
        type="search"
        placeholder="Buscar no conhecimento…"
        aria-label="Buscar no conhecimento"
      />
      <select v-model="fonte" class="o-field seletor-curto" aria-label="Filtrar por fonte">
        <option value="">todas as fontes</option>
        <option v-for="opcao in FONTES" :key="opcao.chave" :value="opcao.chave">
          {{ opcao.rotulo }}
        </option>
      </select>
      <select
        v-model="autoridade"
        class="o-field seletor-curto"
        aria-label="Filtrar por autoridade"
      >
        <option :value="0">todas as autoridades</option>
        <option v-for="nivel in AUTORIDADES" :key="nivel.autoridade" :value="nivel.autoridade">
          {{ nivel.autoridade }} · {{ nivel.rotulo }}
        </option>
      </select>
    </div>

    <div class="corpo">
      <aside class="lateral" :aria-label="eixo === 'modulo' ? 'Módulos' : 'Pastas'">
        <button
          class="lateral__item"
          type="button"
          :aria-current="naRaiz ? 'true' : undefined"
          :class="{ 'lateral__item--ativo': naRaiz }"
          @click="irParaRaiz()"
        >
          <span class="lateral__nome">todos os documentos</span>
          <span class="lateral__total">{{ totalGeral }}</span>
        </button>

        <template v-if="eixo === 'modulo'">
          <button
            v-for="(modulo, indice) in modulos"
            :key="modulo.id"
            class="lateral__item"
            type="button"
            :class="{ 'lateral__item--ativo': moduloAtual === modulo.id }"
            :aria-current="moduloAtual === modulo.id ? 'true' : undefined"
            @click="irParaModulo(modulo.id)"
          >
            <i class="ponto" :class="`ponto--${tomDoIndice(indice)}`" aria-hidden="true" />
            <span class="lateral__nome">{{ modulo.nome }}</span>
            <span class="lateral__total">{{ modulo.documentos }}</span>
          </button>

          <button
            class="lateral__item"
            type="button"
            :class="{ 'lateral__item--ativo': moduloAtual === 'nenhum' }"
            :aria-current="moduloAtual === 'nenhum' ? 'true' : undefined"
            @click="irParaModulo('nenhum')"
          >
            <i class="ponto ponto--vazio" aria-hidden="true" />
            <span class="lateral__nome">sem módulo</span>
            <span class="lateral__total">{{ soltos }}</span>
          </button>
        </template>

        <template v-else>
          <button
            v-for="raiz in raizes"
            :key="raiz.caminho"
            class="lateral__item"
            type="button"
            :class="{ 'lateral__item--ativo': pasta === raiz.caminho }"
            :aria-current="pasta === raiz.caminho ? 'true' : undefined"
            @click="irParaPasta(raiz.caminho)"
          >
            <span class="lateral__nome lateral__nome--caminho">{{ raiz.rotulo }}</span>
            <span class="lateral__total">{{ raiz.total }}</span>
          </button>
        </template>
      </aside>

      <div class="conteudo">
        <nav v-if="eixo === 'pasta' && pasta !== null" class="migalhas" aria-label="Pastas">
          <button class="migalhas__item" type="button" @click="irParaRaiz()">tudo</button>
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

        <p v-if="eixo === 'modulo' && moduloEscolhido" class="contexto">
          {{ moduloEscolhido.descricao }}
        </p>
        <p v-else-if="eixo === 'modulo' && moduloAtual === 'nenhum'" class="contexto">
          documentos que ainda não pertencem a módulo nenhum — é daqui que sai a classificação.
        </p>

        <p v-if="eixo === 'pasta' && erroPastas" class="mensagem mensagem--erro" role="alert">
          {{ erroPastas }}
        </p>

        <div v-if="containers.length > 0" class="pastas">
          <button
            v-for="container in containers"
            :key="container.chave"
            class="pastas__item"
            type="button"
            @click="entrar(container)"
          >
            <span class="pastas__icone" aria-hidden="true">▸</span>
            <span class="pastas__nome" :class="{ 'pastas__nome--texto': eixo === 'modulo' }">
              {{ container.rotulo }}
            </span>
            <span class="pastas__total">
              {{ container.total }} {{ container.total === 1 ? 'documento' : 'documentos' }}
            </span>
          </button>
        </div>

        <div v-if="documentos.length > 0" class="cabecalho">
          <label class="marcar">
            <input
              type="checkbox"
              :checked="paginaInteiraMarcada"
              :indeterminate.prop="algunsMarcados"
              @change="alternarPagina"
            />
            <span>{{ rotuloDaPagina }}</span>
          </label>
          <span class="explorador__espacador" />
          <span class="cabecalho__meta">{{ intervaloExibido }} de {{ total }}</span>
        </div>

        <p v-if="carregando && documentos.length === 0" class="mensagem">carregando…</p>
        <p v-else-if="erroLista" class="mensagem mensagem--erro" role="alert">{{ erroLista }}</p>
        <p v-else-if="documentos.length === 0" class="mensagem">{{ mensagemVazia }}</p>

        <div v-else :class="visao === 'grade' ? 'grade' : 'lista'">
          <div
            v-for="documento in documentos"
            :key="documento.id"
            class="item"
            :class="{ 'item--marcado': selecionados.has(documento.id) }"
          >
            <input
              class="item__caixa"
              type="checkbox"
              :checked="selecionados.has(documento.id)"
              :aria-label="`selecionar ${documento.titulo}`"
              @change="alternarUm(documento.id)"
            />
            <button class="item__abrir" type="button" @click="abrir(documento)">
              <span class="item__topo">
                <i
                  class="ponto"
                  :class="`ponto--${tomDaAutoridade(documento.autoridade)}`"
                  aria-hidden="true"
                />
                <span class="item__titulo">{{ documento.titulo }}</span>
                <span v-if="ehCapa(documento.id)" class="selo selo--capa">capa</span>
              </span>
              <span class="item__caminho">{{ documento.caminho }}</span>
              <span class="item__meta">
                {{ nomeDoModulo(documento.moduloId) }} · {{ rotuloDaFonte(documento.fonte) }} ·
                {{ documento.trechos }} {{ documento.trechos === 1 ? 'trecho' : 'trechos' }} ·
                {{ formatarQuando(documento.atualizadoEm) }}
              </span>
            </button>
          </div>
        </div>

        <p v-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>

        <div v-if="documentos.length > 0 && total > POR_PAGINA" class="paginacao">
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
    </div>

    <div v-if="selecionados.size > 0" class="barra" role="region" aria-label="Ações em lote">
      <span class="barra__contagem">
        {{ selecionados.size }}
        {{ selecionados.size === 1 ? 'selecionado' : 'selecionados' }}
      </span>

      <button
        v-if="podeSelecionarTudo"
        class="o-btn o-btn--ghost"
        type="button"
        :disabled="selecionandoTudo"
        @click="void selecionarTudoDoFiltro()"
      >
        {{ selecionandoTudo ? 'selecionando…' : `selecionar os ${total} do filtro` }}
      </button>

      <span class="explorador__espacador" />

      <select v-model="destino" class="o-field seletor-curto" aria-label="Mover para o módulo">
        <option value="">escolha o módulo…</option>
        <option v-for="modulo in modulos" :key="modulo.id" :value="modulo.id">
          {{ modulo.nome }}
        </option>
        <option value="nenhum">tirar do módulo</option>
      </select>

      <button
        class="o-btn o-btn--primary"
        type="button"
        :disabled="movendo || destino === ''"
        @click="void mover()"
      >
        {{ movendo ? 'movendo…' : 'mover' }}
      </button>

      <button class="o-btn o-btn--ghost" type="button" :disabled="movendo" @click="limpar()">
        limpar
      </button>

      <p class="barra__nota">
        mover troca o módulo do documento — nenhum arquivo sai do lugar em disco.
        <template v-if="acimaDoTetoDeSelecao">
          são {{ total }} no filtro e eu só seleciono {{ TETO_DE_SELECAO }} de uma vez — mova página
          por página, ou aperte o filtro.
        </template>
        <template v-if="capasSelecionadas > 0">
          <strong>
            {{ capasSelecionadas }}
            {{
              capasSelecionadas === 1 ? 'é capa de módulo e perde' : 'são capas de módulo e perdem'
            }}
            esse posto ao sair.
          </strong>
        </template>
      </p>

      <p v-if="erroMover" class="mensagem mensagem--erro" role="alert">{{ erroMover }}</p>
    </div>

    <ModalDocumento
      :documento="selecionado"
      :modulos="modulos"
      @fechar="selecionado = null"
      @salvo="void aoSalvar($event)"
      @classificado="void aoClassificar()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { colapsar, construirArvore, migalhasDaPasta } from './arvoreDePastas';
import { AUTORIDADES, tomDaAutoridade } from './autoridade';
import { formatarQuando } from './formato';
import ModalDocumento from './ModalDocumento.vue';
import { moverDocumentos, type ModuloResumido } from '@/services/ambiente.service';
import {
  listarDocumentos,
  listarPastas,
  type DocumentoIndexado,
  type FiltroDeDocumentos,
  type FonteDocumento,
  type PastaIndexada,
} from '@/services/conhecimento.service';
import { mensagemDoErro } from '@/services/http';

type Eixo = 'modulo' | 'pasta';
type Visao = 'lista' | 'grade';

interface ContainerNavegavel {
  chave: string;
  rotulo: string;
  total: number;
}

const POR_PAGINA = 20;
const POR_PAGINA_TETO = 100;
const TETO_DE_SELECAO = 500;
const TONS = ['amber', 'sage', 'slate'] as const;

const EIXOS: { chave: Eixo; rotulo: string }[] = [
  { chave: 'modulo', rotulo: 'módulo' },
  { chave: 'pasta', rotulo: 'pasta' },
];

const VISOES: { chave: Visao; icone: string; titulo: string }[] = [
  { chave: 'lista', icone: '☰', titulo: 'lista' },
  { chave: 'grade', icone: '▦', titulo: 'grade' },
];

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

const props = defineProps<{ modulos: ModuloResumido[]; totalDeDocumentos: number }>();

const emit = defineEmits<{ atualizado: [] }>();

const eixo = ref<Eixo>('modulo');
const visao = ref<Visao>('lista');
const ordenar = ref<'data' | 'nome'>('data');

const moduloAtual = ref<string | null>(null);
const pasta = ref<string | null>(null);
const pastas = ref<PastaIndexada[]>([]);

const busca = ref('');
const fonte = ref<FonteDocumento | ''>('');
const autoridade = ref(0);

const documentos = ref<DocumentoIndexado[]>([]);
const total = ref(0);
const pagina = ref(1);
const carregando = ref(true);
const erroLista = ref('');
const erroPastas = ref('');
const feito = ref('');
const selecionado = ref<DocumentoIndexado | null>(null);

const selecionados = ref(new Set<string>());
const destino = ref('');
const movendo = ref(false);
const erroMover = ref('');
const selecionandoTudo = ref(false);

let referencia = 0;
let temporizador: ReturnType<typeof setTimeout> | undefined;

const arvore = computed(() => construirArvore(pastas.value));

const raizes = computed(() => arvore.value.raizes.map(colapsar));

const noAtual = computed(() =>
  pasta.value === null ? null : (arvore.value.porCaminho.get(pasta.value) ?? null),
);

const migalhas = computed(() =>
  pasta.value === null ? [] : migalhasDaPasta(pasta.value, arvore.value.porCaminho),
);

const temFiltro = computed(
  () => busca.value.trim().length > 0 || fonte.value !== '' || autoridade.value !== 0,
);

const containers = computed<ContainerNavegavel[]>(() => {
  if (temFiltro.value) return [];

  if (eixo.value === 'modulo') {
    if (moduloAtual.value !== null) return [];

    const cartoes = props.modulos.map((modulo) => ({
      chave: modulo.id,
      rotulo: modulo.nome,
      total: modulo.documentos,
    }));

    return soltos.value > 0
      ? [...cartoes, { chave: 'nenhum', rotulo: 'sem módulo', total: soltos.value }]
      : cartoes;
  }

  const nos = pasta.value === null ? arvore.value.raizes : (noAtual.value?.filhos ?? []);

  return nos.map(colapsar).map((item) => ({
    chave: item.caminho,
    rotulo: item.rotulo,
    total: item.total,
  }));
});

const naRaiz = computed(() =>
  eixo.value === 'modulo' ? moduloAtual.value === null : pasta.value === null,
);

const totalGeral = computed(() => props.totalDeDocumentos);

const soltos = computed(() => {
  const classificados = props.modulos.reduce((soma, item) => soma + item.documentos, 0);

  return Math.max(0, props.totalDeDocumentos - classificados);
});

const moduloEscolhido = computed(() =>
  props.modulos.find((modulo) => modulo.id === moduloAtual.value),
);

const capas = computed(
  () =>
    new Set(
      props.modulos
        .map((modulo) => modulo.especialistaDocumentoId)
        .filter((id): id is string => id !== null),
    ),
);

const capasSelecionadas = computed(
  () => [...selecionados.value].filter((id) => capas.value.has(id)).length,
);

const paginaInteiraMarcada = computed(
  () =>
    documentos.value.length > 0 &&
    documentos.value.every((documento) => selecionados.value.has(documento.id)),
);

const algunsMarcados = computed(
  () =>
    !paginaInteiraMarcada.value &&
    documentos.value.some((documento) => selecionados.value.has(documento.id)),
);

const podeSelecionarTudo = computed(
  () =>
    paginaInteiraMarcada.value &&
    total.value > documentos.value.length &&
    total.value <= TETO_DE_SELECAO &&
    selecionados.value.size < total.value,
);

const acimaDoTetoDeSelecao = computed(
  () =>
    paginaInteiraMarcada.value &&
    total.value > documentos.value.length &&
    total.value > TETO_DE_SELECAO,
);

const rotuloDaPagina = computed(() =>
  paginaInteiraMarcada.value ? 'desmarcar esta página' : 'marcar esta página',
);

const intervaloExibido = computed(() => {
  const primeiro = (pagina.value - 1) * POR_PAGINA + 1;
  const ultimo = primeiro + documentos.value.length - 1;

  return `${primeiro}–${ultimo}`;
});

const mensagemVazia = computed(() => {
  if (temFiltro.value) return 'nenhum documento casa com esse filtro — troque o termo ou limpe.';

  if (eixo.value === 'modulo') {
    if (moduloAtual.value === 'nenhum') {
      return 'nada solto por aqui — todo documento já tem módulo.';
    }

    if (moduloAtual.value !== null) {
      return 'este módulo ainda não tem documento — traga um de "sem módulo".';
    }
  }

  if (eixo.value === 'pasta' && pasta.value !== null) {
    return 'esta pasta não guarda arquivo direto — o que existe está nas subpastas acima.';
  }

  return 'nada indexado ainda — escreva uma nota, envie um arquivo ou cadastre uma pasta.';
});

function tomDoIndice(indice: number): string {
  return TONS[indice % TONS.length] ?? 'slate';
}

function rotuloDaFonte(chave: FonteDocumento): string {
  return ROTULOS_DE_FONTE[chave] ?? chave;
}

function nomeDoModulo(id: string | null): string {
  if (!id) return 'sem módulo';

  return props.modulos.find((modulo) => modulo.id === id)?.nome ?? 'sem módulo';
}

function ehCapa(id: string): boolean {
  return capas.value.has(id);
}

function filtroAtual(paginaAlvo = pagina.value, porPagina = POR_PAGINA): FiltroDeDocumentos {
  const termo = busca.value.trim();

  return {
    pagina: paginaAlvo,
    porPagina,
    ordenar: ordenar.value,
    ...(termo ? { busca: termo } : {}),
    ...(fonte.value ? { fonte: fonte.value } : {}),
    ...(autoridade.value ? { autoridade: autoridade.value } : {}),
    ...(eixo.value === 'modulo' && moduloAtual.value ? { modulo: moduloAtual.value } : {}),
    ...(eixo.value === 'pasta' && pasta.value ? { pasta: pasta.value } : {}),
    ...(eixo.value === 'pasta' && pasta.value && !temFiltro.value ? { recursivo: false } : {}),
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
    erroLista.value = mensagemDoErro(falha, 'não consegui listar os documentos');
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
      'não consegui montar a árvore de pastas — a lista continua completa',
    );
  }
}

function limpar(): void {
  selecionados.value = new Set();
  destino.value = '';
  erroMover.value = '';
}

function trocarEixo(alvo: Eixo): void {
  if (eixo.value === alvo) return;

  eixo.value = alvo;
  moduloAtual.value = null;
  pasta.value = null;
  pagina.value = 1;
  feito.value = '';
  limpar();
}

function irParaRaiz(): void {
  moduloAtual.value = null;
  pasta.value = null;
  pagina.value = 1;
  feito.value = '';
}

function irParaModulo(id: string): void {
  if (moduloAtual.value === id) return;

  moduloAtual.value = id;
  pagina.value = 1;
  feito.value = '';
}

function irParaPasta(caminho: string): void {
  if (pasta.value === caminho) return;

  pasta.value = caminho;
  pagina.value = 1;
  feito.value = '';
}

function entrar(container: ContainerNavegavel): void {
  if (eixo.value === 'modulo') {
    irParaModulo(container.chave);
    return;
  }

  irParaPasta(container.chave);
}

function irParaPagina(alvo: number): void {
  if (alvo < 1) return;

  pagina.value = alvo;
}

function abrir(documento: DocumentoIndexado): void {
  feito.value = '';
  selecionado.value = documento;
}

function alternarUm(id: string): void {
  const proximo = new Set(selecionados.value);

  if (proximo.has(id)) {
    proximo.delete(id);
  } else {
    proximo.add(id);
  }

  erroMover.value = '';
  selecionados.value = proximo;
}

function alternarPagina(): void {
  const proximo = new Set(selecionados.value);
  const marcar = !paginaInteiraMarcada.value;

  for (const documento of documentos.value) {
    if (marcar) {
      proximo.add(documento.id);
    } else {
      proximo.delete(documento.id);
    }
  }

  erroMover.value = '';
  selecionados.value = proximo;
}

async function selecionarTudoDoFiltro(): Promise<void> {
  if (selecionandoTudo.value) return;

  selecionandoTudo.value = true;
  erroMover.value = '';

  try {
    const proximo = new Set(selecionados.value);
    const paginas = Math.ceil(total.value / POR_PAGINA_TETO);

    for (let numero = 1; numero <= paginas; numero += 1) {
      const resposta = await listarDocumentos(filtroAtual(numero, POR_PAGINA_TETO));

      for (const documento of resposta.documentos) proximo.add(documento.id);
    }

    selecionados.value = proximo;
  } catch (falha) {
    erroMover.value = mensagemDoErro(falha, 'não consegui selecionar tudo — tente por página');
  } finally {
    selecionandoTudo.value = false;
  }
}

async function mover(): Promise<void> {
  if (movendo.value || destino.value === '' || selecionados.value.size === 0) return;

  movendo.value = true;
  erroMover.value = '';
  feito.value = '';

  const alvo = destino.value === 'nenhum' ? null : destino.value;
  const quantos = selecionados.value.size;

  try {
    const mudanca = await moverDocumentos([...selecionados.value], alvo);

    feito.value = `${mudanca.movidos} de ${quantos} ${
      quantos === 1 ? 'documento passou' : 'documentos passaram'
    } para ${alvo ? nomeDoModulo(alvo) : 'nenhum módulo'}`;

    limpar();
    await carregar(true);
    emit('atualizado');
  } catch (falha) {
    erroMover.value = mensagemDoErro(falha, 'não consegui mover os documentos');
  } finally {
    movendo.value = false;
  }
}

async function aoClassificar(): Promise<void> {
  await carregar(true);
  emit('atualizado');
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

watch([fonte, autoridade, moduloAtual, pasta, ordenar, eixo], () => {
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

.explorador {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--line);

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__espacador {
    flex: 1;
  }
}

.alternador {
  display: flex;
  align-items: center;
  gap: 3px;
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 3px;

  &__rotulo {
    font-size: 12px;
    color: var(--ink3);
    padding: 0 6px;
  }

  &__item {
    font: 400 12.5px/1 $sans;
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--ink3);
    padding: 5px 11px;
    cursor: pointer;

    &:hover {
      color: var(--ink);
    }

    &--ativo {
      background: var(--panel);
      color: var(--ink);
      font-weight: 600;
      box-shadow: var(--shadow);
    }
  }
}

.visao {
  display: flex;
  gap: 3px;
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 3px;

  &__item {
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--ink3);
    font-size: 13px;
    line-height: 1;
    padding: 6px 9px;
    cursor: pointer;

    &--ativa {
      background: var(--panel);
      color: var(--ink);
      box-shadow: var(--shadow);
    }
  }
}

.filtros {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  &__busca {
    flex: 1;
    min-width: 180px;
  }
}

.seletor-curto {
  width: auto;
  min-width: 140px;
  cursor: pointer;
}

.corpo {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.lateral {
  display: flex;
  flex-direction: column;
  width: 196px;
  flex: none;
  border: 1px solid var(--line);
  border-radius: 11px;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    text-align: left;
    background: var(--panel2);
    border: none;
    padding: 8px 10px;
    cursor: pointer;

    &:not(:first-child) {
      border-top: 1px solid var(--line);
    }

    &:hover {
      background: var(--sel);
    }

    &--ativo {
      background: var(--sel);
      font-weight: 600;
    }
  }

  &__nome {
    flex: 1;
    min-width: 0;
    font-size: 12.5px;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--caminho {
      font: 400 11.5px/1.5 $mono;
    }
  }

  &__total {
    font-size: 11.5px;
    color: var(--ink3);
  }
}

.conteudo {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.contexto {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);
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

  &__icone {
    color: var(--ink3);
    font-size: 10px;
    flex: none;
  }

  &__nome {
    font: 400 12.5px/1.5 $mono;
    color: var(--ink);
    flex: 1;
    word-break: break-all;

    &--texto {
      font: 500 13px/1.5 $sans;
    }
  }

  &__total {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
  }
}

.cabecalho {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 6px;

  &__meta {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
  }
}

.marcar {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--ink2);
  cursor: pointer;
}

.lista {
  display: flex;
  flex-direction: column;
}

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 8px;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 9px;

  &__caixa {
    margin-top: 11px;
    flex: none;
    cursor: pointer;
  }

  &__abrir {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
    background: none;
    border: none;
    border-radius: 8px;
    padding: 8px 6px;
    cursor: pointer;

    &:hover {
      background: var(--panel2);
    }
  }

  &__topo {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }

  &__titulo {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__caminho {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    word-break: break-all;
  }

  &__meta {
    font-size: 11.5px;
    color: var(--ink3);
  }

  &--marcado &__abrir {
    background: var(--sage-s);
  }
}

.lista .item:not(:first-child) {
  border-top: 1px solid var(--line);
}

.grade .item {
  border: 1px solid var(--line);
  border-radius: 11px;
  background: var(--panel2);
  padding: 4px 8px 8px 10px;
}

.grade .item__caminho {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

  &--sage {
    background: var(--sage);
  }

  &--slate {
    background: var(--slate);
  }

  &--neutro {
    background: var(--line2);
  }

  &--vazio {
    border: 1.5px solid var(--line2);
  }
}

.selo {
  font-size: 10.5px;
  border-radius: 20px;
  padding: 1px 7px;
  white-space: nowrap;

  &--capa {
    background: var(--sage-s);
    color: var(--sage);
  }
}

.barra {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  background: var(--panel);
  border: 1px solid var(--sage-l);
  border-radius: 11px;
  padding: 10px 13px;
  box-shadow: var(--shadow);

  &__contagem {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  &__nota {
    flex-basis: 100%;
    margin: 0;
    font-size: 12px;
    color: var(--ink3);

    strong {
      color: var(--amber);
      font-weight: 500;
    }
  }
}

.paginacao {
  display: flex;
  gap: 8px;
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

.barra .mensagem {
  flex-basis: 100%;
  padding: 0;
}
</style>
