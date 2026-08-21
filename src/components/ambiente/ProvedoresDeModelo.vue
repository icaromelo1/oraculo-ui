<template>
  <div class="bloco">
    <div class="bloco__topo">
      <span class="rotulo-secao">provedores</span>
      <span class="bloco__nota">
        o provedor ativo é quem responde no chat. a chave fica cifrada no servidor e nunca volta
        para esta tela — só a dica mascarada volta.
      </span>
    </div>

    <p class="mensagem">
      padrão do <code>.env</code>: {{ provedorDoEnv.tipo }} · {{ provedorDoEnv.modelo }}
    </p>

    <p v-if="carregando && provedores.length === 0" class="mensagem">carregando…</p>
    <p v-else-if="erroLista" class="mensagem mensagem--erro" role="alert">{{ erroLista }}</p>
    <p v-else-if="provedores.length === 0" class="mensagem">
      nenhum provedor cadastrado — vale o que está no <code>.env</code> do servidor.
    </p>

    <div v-else class="lista">
      <div
        v-for="provedor in provedores"
        :key="provedor.id"
        class="item"
        :class="{ 'item--ativo': provedor.ativo }"
      >
        <div class="item__texto">
          <span class="item__cabecalho">
            <span class="item__nome">{{ provedor.nome }}</span>
            <span v-if="provedor.ativo" class="selo selo--ativo">ativo</span>
            <span class="selo">{{ rotuloDoTipo(provedor.tipo) }}</span>
          </span>

          <span class="item__endereco">{{ descreverEndereco(provedor) }}</span>

          <div class="item__etiquetas">
            <span v-if="provedor.modelo" class="etiqueta">{{ provedor.modelo }}</span>
            <span v-if="provedor.chave.definida" class="etiqueta etiqueta--chave">
              chave {{ provedor.chave.dica ?? 'definida' }}
            </span>
            <span v-else-if="provedor.tipo !== 'cli'" class="etiqueta">sem chave</span>
            <span
              v-for="cabecalho in provedor.cabecalhosExtras ?? []"
              :key="`h-${cabecalho}`"
              class="etiqueta"
            >
              {{ cabecalho }}
            </span>
          </div>

          <div v-if="resultadoDe(provedor.id)" class="resultado">
            <span
              class="resultado__linha"
              :class="
                resultadoDe(provedor.id)?.ok ? 'resultado__linha--ok' : 'resultado__linha--erro'
              "
            >
              {{ descreverResultado(provedor.id) }}
            </span>
            <p v-if="resultadoDe(provedor.id)?.amostra" class="resultado__amostra">
              {{ resultadoDe(provedor.id)?.amostra }}
            </p>
          </div>

          <span v-if="erroDe(provedor.id)" class="mensagem mensagem--erro" role="alert">
            {{ erroDe(provedor.id) }}
          </span>
        </div>

        <span class="item__meta">desde {{ formatarQuando(provedor.criadoEm) }}</span>

        <button
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="testando === provedor.id"
          @click="void testar(provedor.id)"
        >
          {{ testando === provedor.id ? 'testando…' : 'testar' }}
        </button>

        <button
          v-if="!provedor.ativo"
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="ativando !== null"
          @click="void ativar(provedor.id)"
        >
          {{ ativando === provedor.id ? 'ativando…' : 'ativar' }}
        </button>

        <button
          v-if="confirmando === provedor.id"
          class="o-btn o-btn--ghost item__perigo"
          type="button"
          :disabled="removendo === provedor.id"
          @click="void remover(provedor.id)"
        >
          {{ removendo === provedor.id ? 'removendo…' : 'confirmar' }}
        </button>
        <button
          v-else
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="removendo !== null"
          @click="pedirConfirmacao(provedor.id)"
        >
          remover
        </button>
      </div>
    </div>

    <p v-if="erroAtivacao" class="mensagem mensagem--erro" role="alert">{{ erroAtivacao }}</p>
    <p v-if="erroRemocao" class="mensagem mensagem--erro" role="alert">{{ erroRemocao }}</p>

    <p v-if="travado" class="travado" role="status">
      <i class="travado__ponto" aria-hidden="true" />
      {{ motivoDaTrava }}
    </p>

    <CadastroDeProvedor
      v-if="!travado"
      :tipos-permitidos="tiposPermitidos"
      :presets="presets"
      :erro-presets="erroPresets"
      @cadastrado="void aoMudar()"
    />

    <GuiaDeProvedores v-if="presets.length > 0" :presets="presets" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CadastroDeProvedor from './CadastroDeProvedor.vue';
import GuiaDeProvedores from './GuiaDeProvedores.vue';
import { formatarQuando } from './formato';
import {
  ativarProvedor,
  listarPresetsDeProvedor,
  listarProvedores,
  removerProvedor,
  testarProvedor,
  type PresetDeProvedor,
  type ProvedorResumido,
  type ResultadoDoTeste,
  type TipoDeProvedor,
} from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';

defineProps<{
  provedorDoEnv: { tipo: string; modelo: string };
}>();

const emit = defineEmits<{ mudou: [] }>();

const ROTULOS_DE_TIPO: Record<TipoDeProvedor, string> = {
  'openai-compat': 'compatível com OpenAI',
  anthropic: 'Anthropic',
  cli: 'linha de comando',
};

const provedores = ref<ProvedorResumido[]>([]);
const tiposPermitidos = ref<string[]>([]);
const travado = ref(false);
const motivoDaTrava = ref('');
const presets = ref<PresetDeProvedor[]>([]);
const carregando = ref(true);
const erroLista = ref('');
const erroPresets = ref('');
const testando = ref<string | null>(null);
const resultados = ref<Record<string, ResultadoDoTeste>>({});
const errosDeTeste = ref<Record<string, string>>({});
const ativando = ref<string | null>(null);
const erroAtivacao = ref('');
const confirmando = ref<string | null>(null);
const removendo = ref<string | null>(null);
const erroRemocao = ref('');

function rotuloDoTipo(tipo: TipoDeProvedor): string {
  return ROTULOS_DE_TIPO[tipo] ?? tipo;
}

function descreverEndereco(provedor: ProvedorResumido): string {
  if (provedor.tipo === 'cli') {
    const dialeto = provedor.dialeto ? ` · dialeto ${provedor.dialeto}` : '';

    return `${provedor.comando ?? 'sem comando'}${dialeto}`;
  }

  return provedor.baseUrl ?? 'endereço padrão do provedor';
}

function resultadoDe(id: string): ResultadoDoTeste | null {
  return resultados.value[id] ?? null;
}

function erroDe(id: string): string {
  return errosDeTeste.value[id] ?? '';
}

function descreverResultado(id: string): string {
  const resultado = resultados.value[id];

  if (!resultado) return '';

  if (!resultado.ok) {
    return resultado.erro ?? 'o teste falhou e a api não disse por quê';
  }

  const partes = ['respondeu'];

  if (resultado.latenciaMs !== null) partes.push(`em ${resultado.latenciaMs} ms`);
  if (resultado.modelo) partes.push(`· ${resultado.modelo}`);
  if (resultado.tokensEntrada !== null || resultado.tokensSaida !== null) {
    partes.push(`· ${resultado.tokensEntrada ?? 0} entrada / ${resultado.tokensSaida ?? 0} saída`);
  }

  return partes.join(' ');
}

async function carregarLista(): Promise<void> {
  erroLista.value = '';

  try {
    const lista = await listarProvedores();

    provedores.value = lista.provedores;
    tiposPermitidos.value = lista.tiposPermitidos;
    travado.value = lista.travado === true;
    motivoDaTrava.value = lista.motivoDaTrava ?? '';
  } catch (falha) {
    erroLista.value = mensagemDoErro(falha, 'não consegui listar os provedores');
  }
}

async function carregarPresets(): Promise<void> {
  erroPresets.value = '';

  try {
    presets.value = await listarPresetsDeProvedor();
  } catch (falha) {
    presets.value = [];
    erroPresets.value = mensagemDoErro(falha, 'não consegui carregar os presets');
  }
}

async function aoMudar(): Promise<void> {
  await carregarLista();
  emit('mudou');
}

async function testar(id: string): Promise<void> {
  if (testando.value) return;

  testando.value = id;
  delete errosDeTeste.value[id];
  delete resultados.value[id];

  try {
    resultados.value[id] = await testarProvedor(id);
  } catch (falha) {
    errosDeTeste.value[id] = mensagemDoErro(falha, 'não consegui testar esse provedor');
  } finally {
    testando.value = null;
  }
}

async function ativar(id: string): Promise<void> {
  if (ativando.value) return;

  ativando.value = id;
  erroAtivacao.value = '';

  try {
    await ativarProvedor(id);
    await aoMudar();
  } catch (falha) {
    erroAtivacao.value = mensagemDoErro(falha, 'não consegui ativar esse provedor');
  } finally {
    ativando.value = null;
  }
}

function pedirConfirmacao(id: string): void {
  erroRemocao.value = '';
  confirmando.value = id;
}

async function remover(id: string): Promise<void> {
  if (removendo.value) return;

  removendo.value = id;
  erroRemocao.value = '';

  try {
    await removerProvedor(id);
    confirmando.value = null;
    delete resultados.value[id];
    delete errosDeTeste.value[id];
    await aoMudar();
  } catch (falha) {
    erroRemocao.value = mensagemDoErro(falha, 'não consegui remover esse provedor');
  } finally {
    removendo.value = null;
  }
}

onMounted(() => {
  void (async () => {
    await Promise.all([carregarLista(), carregarPresets()]);
    carregando.value = false;
  })();
});
</script>

<style scoped lang="scss">
.travado {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-size: 12.5px;
  color: var(--ink2);
  background: var(--amber-s);
  border: 1px solid var(--amber-l);
  border-radius: 9px;
  padding: 10px 12px;
}

.travado__ponto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--amber);
  flex: none;
  margin-top: 6px;
}

@use '@/css/tokens' as *;

.bloco {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__topo {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__nota {
    font-size: 12.5px;
    color: var(--ink3);
  }
}

.rotulo-secao {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink2);
}

.lista {
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;

  &--ativo {
    border-left: 2px solid var(--sage);
    padding-left: 10px;
  }

  &__texto {
    flex: 1;
    min-width: 240px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__cabecalho {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  &__nome {
    font-size: 13px;
    font-weight: 500;
  }

  &__endereco {
    font: 400 11.5px/1.5 $mono;
    color: var(--ink3);
    word-break: break-all;
  }

  &__etiquetas {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  &__meta {
    font-size: 11.5px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__perigo {
    color: var(--clay);

    &:hover {
      color: var(--clay);
      border-color: var(--clay-l);
    }
  }
}

.selo {
  font-size: 11px;
  border-radius: 20px;
  padding: 2px 9px;
  white-space: nowrap;
  color: var(--ink3);
  background: var(--panel3);

  &--ativo {
    color: var(--sage);
    background: var(--sage-s);
  }
}

.etiqueta {
  font: 400 11px/1.6 $mono;
  color: var(--ink3);
  background: var(--panel3);
  border-radius: 5px;
  padding: 1px 6px;

  &--chave {
    color: var(--amber);
    background: var(--amber-s);
  }
}

.resultado {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 2px;

  &__linha {
    font-size: 12.5px;

    &--ok {
      color: var(--sage);
    }

    &--erro {
      color: var(--clay);
    }
  }

  &__amostra {
    margin: 0;
    font: 400 11.5px/1.5 $mono;
    color: var(--ink2);
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 7px 9px;
    max-height: 120px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  code {
    font: 400 11.5px/1 $mono;
  }

  &--erro {
    color: var(--clay);
  }
}
</style>
