<template>
  <div class="persona">
    <div class="rotulo-secao">quem é este assistente — vai junto em toda conversa</div>

    <p v-if="carregando" class="mensagem">carregando…</p>
    <p v-else-if="erroLeitura" class="mensagem mensagem--erro" role="alert">{{ erroLeitura }}</p>

    <template v-else>
      <textarea
        v-model="texto"
        class="o-field persona__campo"
        rows="7"
        :maxlength="teto"
        aria-label="Persona do Oráculo"
        placeholder="Você é o Oráculo, assistente técnico de…"
        :disabled="salvando"
      ></textarea>

      <p class="persona__estado">
        <template v-if="ehPadrao">
          esta é a persona padrão — o assistente se apresenta como Oráculo. reescreva para dar
          outro nome, outro tom ou outro escopo a esta instalação.
        </template>
        <template v-else>
          persona própria desta instalação. as regras de busca, citação e proteção contra
          injeção não passam por aqui: são fixas no código e continuam valendo.
        </template>
      </p>

      <div class="persona__rodape">
        <span v-if="mascaramentos > 0" class="persona__mascaras">
          <i class="ponto ponto--amber" aria-hidden="true" />
          {{ mascaramentos }}
          {{ mascaramentos === 1 ? 'trecho será mascarado' : 'trechos serão mascarados' }}
          antes de ir ao modelo — o texto original fica guardado aqui.
          <template v-if="mudou"> (contagem do texto salvo)</template>
        </span>
        <span class="persona__espacador" />
        <span class="persona__contador">{{ texto.length }} / {{ teto }}</span>
      </div>

      <div class="persona__acoes">
        <button
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="salvando || textoNoPadrao"
          @click="restaurarPadrao"
        >
          Restaurar padrão
        </button>
        <span class="persona__espacador" />
        <button
          class="o-btn o-btn--ghost"
          type="button"
          :disabled="salvando || !mudou"
          @click="descartar"
        >
          Descartar mudanças
        </button>
        <button
          class="o-btn o-btn--primary"
          type="button"
          :disabled="salvando || !mudou || vazia"
          @click="void salvar()"
        >
          {{ salvando ? 'salvando…' : 'Salvar persona' }}
        </button>
      </div>

      <p v-if="vazia" class="mensagem mensagem--aviso">
        a persona não pode ficar vazia — é ela que diz quem este assistente é. use “restaurar
        padrão” se quiser voltar ao começo.
      </p>

      <p v-if="erroSalvar" class="mensagem mensagem--erro" role="alert">{{ erroSalvar }}</p>
      <p v-else-if="feito" class="mensagem mensagem--ok" role="status">{{ feito }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { definirPersona, obterPersona } from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';

const texto = ref('');
const salvo = ref('');
const padrao = ref('');
const ehPadrao = ref(false);
const teto = ref(1500);
const mascaramentos = ref(0);
const carregando = ref(true);
const salvando = ref(false);
const erroLeitura = ref('');
const erroSalvar = ref('');
const feito = ref('');

const mudou = computed(() => texto.value !== salvo.value);

const vazia = computed(() => texto.value.trim().length === 0);

const textoNoPadrao = computed(() => texto.value.trim() === padrao.value.trim());

function descartar(): void {
  texto.value = salvo.value;
  erroSalvar.value = '';
  feito.value = '';
}

function restaurarPadrao(): void {
  texto.value = padrao.value;
  erroSalvar.value = '';
  feito.value = '';
}

async function carregar(): Promise<void> {
  carregando.value = true;
  erroLeitura.value = '';

  try {
    const persona = await obterPersona();

    salvo.value = persona.texto;
    texto.value = persona.texto;
    padrao.value = persona.padrao;
    ehPadrao.value = !persona.personalizada;
    teto.value = persona.teto;
    mascaramentos.value = persona.mascaramentos;
  } catch (falha) {
    erroLeitura.value = mensagemDoErro(falha, 'não consegui ler a persona');
  } finally {
    carregando.value = false;
  }
}

async function salvar(): Promise<void> {
  if (salvando.value || !mudou.value || vazia.value) return;

  salvando.value = true;
  erroSalvar.value = '';
  feito.value = '';

  try {
    const persona = await definirPersona(texto.value);

    salvo.value = persona.texto;
    texto.value = persona.texto;
    ehPadrao.value = !persona.personalizada;
    mascaramentos.value = persona.mascaramentos;
    feito.value = 'persona salva — vale a partir da próxima conversa';
  } catch (falha) {
    erroSalvar.value = mensagemDoErro(falha, 'não consegui salvar a persona');
  } finally {
    salvando.value = false;
  }
}

onMounted(() => {
  void carregar();
});
</script>

<style scoped lang="scss">
.persona {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__campo {
    resize: vertical;
    font-size: 14px;
    line-height: 1.6;
  }

  &__rodape {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__mascaras {
    font-size: 12.5px;
    color: var(--ink2);
    flex: 1;
    min-width: 240px;
  }

  &__espacador {
    flex: 1;
  }

  &__contador {
    font-size: 12.5px;
    color: var(--ink3);
    white-space: nowrap;
  }

  &__acoes {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__estado {
    margin: 0;
    font-size: 12.5px;
    color: var(--ink3);
  }
}

.rotulo-secao {
  font-size: 12.5px;
  color: var(--ink3);
}

.ponto {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;

  &--amber {
    background: var(--amber);
  }
}

.mensagem {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink3);

  &--erro {
    color: var(--clay);
  }

  &--ok {
    color: var(--sage);
  }

  &--aviso {
    color: var(--amber);
  }
}
</style>
