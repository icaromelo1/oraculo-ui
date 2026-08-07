<template>
  <form class="formulario" @submit.prevent="void cadastrar()">
    <div class="formulario__topo">
      <span class="rotulo-secao">cadastrar provedor</span>
      <span v-if="tiposDeFora.length > 0" class="mensagem">
        o <code>.env</code> desta instalação libera só {{ nomesDosTipos(tiposDisponiveis) }} —
        {{ nomesDosTipos(tiposDeFora) }}
        {{ tiposDeFora.length === 1 ? 'fica de fora' : 'ficam de fora' }} até alguém mudar o arquivo
        no servidor.
      </span>
    </div>

    <p v-if="tipo === null" class="mensagem mensagem--aviso">
      o <code>.env</code> desta instalação não libera nenhum tipo de provedor — enquanto ficar
      assim, o modelo é só o que já está configurado no servidor.
    </p>

    <template v-else>
      <div class="formulario__linha">
        <input
          v-model="nome"
          class="o-field"
          type="text"
          maxlength="120"
          placeholder="Como você chama esse provedor — ex.: OpenAI da conta pessoal"
          :disabled="cadastrando"
        />
        <select
          v-model="tipo"
          class="o-field"
          aria-label="Tipo do provedor"
          :disabled="cadastrando"
        >
          <option v-for="opcao in tiposDisponiveis" :key="opcao.chave" :value="opcao.chave">
            {{ opcao.rotulo }}
          </option>
        </select>
      </div>

      <template v-if="tipo === 'cli'">
        <p class="mensagem mensagem--forte">
          o dialeto decide quais argumentos o servidor passa para esse programa. um dialeto escrito
          à mão é, na prática, permissão para rodar o programa do jeito que quem escreveu quiser —
          só faça isso se você mesmo escreveu o descritor. na dúvida, use
          <code>claude</code> ou <code>agy</code>, que já vêm prontos.
        </p>

        <div class="formulario__linha">
          <input
            v-model="comando"
            class="o-field formulario__mono"
            type="text"
            placeholder="comando instalado no servidor — ex.: claude"
            :disabled="cadastrando"
          />
          <input
            v-model="dialeto"
            class="o-field formulario__mono"
            type="text"
            placeholder="dialeto: claude, agy ou o JSON do descritor"
            :disabled="cadastrando"
          />
        </div>

        <p v-if="dialetoPersonalizado" class="mensagem mensagem--aviso">
          esse dialeto não é um dos prontos — vai ser lido como descritor JSON.
        </p>
      </template>

      <template v-else>
        <div class="formulario__linha">
          <select
            v-model="preset"
            class="o-field"
            aria-label="Preset do provedor"
            :disabled="cadastrando || presets.length === 0"
          >
            <option value="">manual — eu preencho o endereço</option>
            <option v-for="opcao in presets" :key="opcao.id" :value="opcao.id">
              {{ opcao.rotulo }}
            </option>
          </select>
          <input
            v-model="baseUrl"
            class="o-field formulario__mono"
            type="url"
            placeholder="https://api.exemplo.com/v1"
            :disabled="cadastrando || enderecoVemDoPreset"
            :readonly="enderecoVemDoPreset"
          />
        </div>

        <p v-if="erroPresets" class="mensagem mensagem--erro">{{ erroPresets }}</p>
        <p v-else-if="presetEscolhido?.observacao" class="mensagem">
          {{ presetEscolhido.observacao }}
        </p>

        <div class="formulario__linha">
          <input
            v-model="modelo"
            class="o-field formulario__mono"
            type="text"
            placeholder="modelo — ex.: gpt-4o-mini"
            :disabled="cadastrando"
          />
          <input
            v-model="chave"
            class="o-field formulario__mono"
            type="password"
            autocomplete="off"
            :placeholder="placeholderDaChave"
            :disabled="cadastrando"
          />
        </div>

        <div v-if="modelosSugeridos.length > 0" class="sugestoes">
          <span class="sugestoes__rotulo">sugestões deste preset</span>
          <button
            v-for="sugestao in modelosSugeridos"
            :key="sugestao"
            class="sugestoes__item"
            type="button"
            :class="{ 'sugestoes__item--escolhida': modelo === sugestao }"
            :disabled="cadastrando"
            @click="modelo = sugestao"
          >
            {{ sugestao }}
          </button>
        </div>

        <div class="avancado">
          <button
            class="avancado__topo"
            type="button"
            :aria-expanded="avancadoAberto"
            :disabled="cadastrando"
            @click="avancadoAberto = !avancadoAberto"
          >
            <span aria-hidden="true">{{ avancadoAberto ? '▾' : '▸' }}</span>
            Opções avançadas
            <span class="avancado__dica">quase nunca é necessário</span>
          </button>

          <div v-if="avancadoAberto" class="avancado__corpo">
            <p class="avancado__texto">
              Alguns serviços pedem uma informação a mais além da chave — o OpenRouter, por exemplo,
              quer saber de qual aplicação veio o pedido. Quando o serviço escolhido já traz isso
              pronto, você não precisa preencher nada aqui.
            </p>
            <p class="avancado__texto">
              Só use se a documentação do serviço pedir explicitamente. Um por linha, no formato
              <code>Nome: valor</code>.
            </p>
            <textarea
              v-model="cabecalhos"
              class="o-field formulario__mono formulario__area"
              rows="2"
              placeholder="X-Portal: interno"
              :disabled="cadastrando"
            ></textarea>
          </div>
        </div>
      </template>

      <div class="formulario__rodape">
        <button class="o-btn o-btn--primary" type="submit" :disabled="cadastrando || !preenchido">
          {{ cadastrando ? 'cadastrando…' : 'cadastrar provedor' }}
        </button>
        <span class="mensagem">
          a chave some daqui assim que é enviada e nunca volta — o teste roda pela lista acima,
          depois de cadastrar.
        </span>
      </div>

      <p v-if="erroCadastro" class="mensagem mensagem--erro" role="alert">{{ erroCadastro }}</p>
      <p v-else-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
    </template>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  criarProvedor,
  type NovoProvedor,
  type PresetDeProvedor,
  type TipoDeProvedor,
} from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';

const props = defineProps<{
  tiposPermitidos: string[];
  presets: PresetDeProvedor[];
  erroPresets: string;
}>();

const emit = defineEmits<{ cadastrado: [] }>();

interface OpcaoDeTipo {
  chave: TipoDeProvedor;
  rotulo: string;
}

const TIPOS: OpcaoDeTipo[] = [
  { chave: 'openai-compat', rotulo: 'API compatível com OpenAI' },
  { chave: 'anthropic', rotulo: 'API da Anthropic' },
  { chave: 'cli', rotulo: 'programa de linha de comando no servidor' },
];

const DIALETOS_PRONTOS = ['claude', 'agy'];

const nome = ref('');
const tipo = ref<TipoDeProvedor | null>(null);
const preset = ref('');
const baseUrl = ref('');
const modelo = ref('');
const chave = ref('');
const comando = ref('');
const dialeto = ref('');
const cabecalhos = ref('');
const avancadoAberto = ref(false);
const cadastrando = ref(false);
const erroCadastro = ref('');
const feito = ref('');

const tiposDisponiveis = computed(() =>
  TIPOS.filter((opcao) => props.tiposPermitidos.includes(opcao.chave)),
);

const tiposDeFora = computed(() =>
  TIPOS.filter((opcao) => !props.tiposPermitidos.includes(opcao.chave)),
);

const presetEscolhido = computed(
  () => props.presets.find((opcao) => opcao.id === preset.value) ?? null,
);

const modelosSugeridos = computed(() => presetEscolhido.value?.modelosSugeridos ?? []);

const enderecoVemDoPreset = computed(() => (presetEscolhido.value?.baseUrl ?? null) !== null);

const exigeChave = computed(() => presetEscolhido.value?.exigeChave === true);

const dialetoPersonalizado = computed(() => {
  const escolhido = dialeto.value.trim();

  return escolhido.length > 0 && !DIALETOS_PRONTOS.includes(escolhido);
});

const placeholderDaChave = computed(() =>
  exigeChave.value ? 'chave da api (obrigatória neste preset)' : 'chave da api (opcional)',
);

const preenchido = computed(() => {
  if (nome.value.trim().length === 0) return false;

  if (tipo.value === 'cli') {
    return comando.value.trim().length > 0 && dialeto.value.trim().length > 0;
  }

  if (exigeChave.value && chave.value.trim().length === 0) return false;

  return enderecoVemDoPreset.value || baseUrl.value.trim().length > 0;
});

function nomesDosTipos(opcoes: OpcaoDeTipo[]): string {
  return opcoes.map((opcao) => opcao.rotulo).join(', ') || 'nenhum tipo';
}

function lerCabecalhos(bruto: string): Record<string, string> {
  const mapa: Record<string, string> = {};

  for (const linha of bruto.split('\n')) {
    const limpa = linha.trim();

    if (!limpa) continue;

    const corte = limpa.indexOf(':');

    if (corte <= 0) continue;

    const nomeDoCabecalho = limpa.slice(0, corte).trim();
    const valor = limpa.slice(corte + 1).trim();

    if (nomeDoCabecalho && valor) mapa[nomeDoCabecalho] = valor;
  }

  return mapa;
}

function limpar(): void {
  nome.value = '';
  preset.value = '';
  baseUrl.value = '';
  modelo.value = '';
  chave.value = '';
  comando.value = '';
  dialeto.value = '';
  cabecalhos.value = '';
  avancadoAberto.value = false;
}

function montarPayload(escolhido: TipoDeProvedor): NovoProvedor {
  const nomeLimpo = nome.value.trim();

  if (escolhido === 'cli') {
    return {
      nome: nomeLimpo,
      tipo: escolhido,
      comando: comando.value.trim(),
      dialeto: dialeto.value.trim(),
    };
  }

  const endereco = baseUrl.value.trim();
  const modeloLimpo = modelo.value.trim();
  const chaveLimpa = chave.value.trim();
  const mapaDeCabecalhos = lerCabecalhos(cabecalhos.value);

  return {
    nome: nomeLimpo,
    tipo: escolhido,
    ...(preset.value ? { preset: preset.value } : {}),
    ...(!enderecoVemDoPreset.value && endereco ? { baseUrl: endereco } : {}),
    ...(modeloLimpo ? { modelo: modeloLimpo } : {}),
    ...(chaveLimpa ? { chave: chaveLimpa } : {}),
    ...(Object.keys(mapaDeCabecalhos).length > 0 ? { cabecalhosExtras: mapaDeCabecalhos } : {}),
  };
}

async function cadastrar(): Promise<void> {
  const escolhido = tipo.value;

  if (cadastrando.value || !preenchido.value || escolhido === null) return;

  cadastrando.value = true;
  erroCadastro.value = '';
  feito.value = '';

  try {
    const provedor = await criarProvedor(montarPayload(escolhido));

    feito.value = `"${provedor.nome}" cadastrado — teste na lista acima antes de ativar`;
    limpar();
    emit('cadastrado');
  } catch (falha) {
    erroCadastro.value = mensagemDoErro(falha, 'não consegui cadastrar esse provedor');
  } finally {
    cadastrando.value = false;
  }
}

watch(
  tiposDisponiveis,
  (opcoes) => {
    const atual = tipo.value;

    if (atual !== null && opcoes.some((opcao) => opcao.chave === atual)) return;

    tipo.value = opcoes[0]?.chave ?? null;
  },
  { immediate: true },
);

watch(preset, () => {
  const escolhido = presetEscolhido.value;

  baseUrl.value = escolhido?.baseUrl ?? '';
  erroCadastro.value = '';
});

watch(tipo, () => {
  erroCadastro.value = '';
  feito.value = '';
});
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.avancado {
  border-top: 1px dashed var(--line2);
  padding-top: 10px;
  margin-top: 2px;
}

.avancado__topo {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 12.5px;
  color: var(--ink2);
}

.avancado__topo:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.avancado__dica {
  margin-left: auto;
  font-size: 11.5px;
  color: var(--ink3);
}

.avancado__corpo {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 9px;
}

.avancado__texto {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);
  max-width: 60ch;
}

.avancado__texto code {
  font-size: 11.5px;
  background: var(--panel3);
  border-radius: 4px;
  padding: 1px 5px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-top: 10px;
  border-top: 1px solid var(--line);

  &__topo {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__linha {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;

    .o-field {
      flex: 1;
      min-width: 220px;
    }
  }

  &__mono {
    font: 400 12.5px/1.5 $mono;
  }

  &__area {
    resize: vertical;
  }

  &__rodape {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .mensagem {
      flex: 1;
      min-width: 220px;
    }
  }
}

.rotulo-secao {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink2);
}

.sugestoes {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;

  &__rotulo {
    font-size: 12px;
    color: var(--ink3);
  }

  &__item {
    font: 400 11px/1.6 $mono;
    color: var(--ink3);
    background: var(--panel3);
    border: 1px solid transparent;
    border-radius: 5px;
    padding: 1px 6px;
    cursor: pointer;

    &:hover {
      color: var(--ink);
    }

    &--escolhida {
      color: var(--sage);
      background: var(--sage-s);
      border-color: var(--sage-l);
    }
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  code {
    font: 400 11.5px/1 $mono;
  }

  &--forte {
    color: var(--ink2);
    background: var(--amber-s);
    border-radius: 8px;
    padding: 8px 10px;
  }

  &--erro {
    color: var(--clay);
  }

  &--aviso {
    color: var(--amber);
  }

  &--ok {
    color: var(--sage);
  }
}
</style>
