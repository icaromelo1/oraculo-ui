<template>
  <div class="bloco">
    <div class="bloco__topo">
      <span class="rotulo-secao">catálogo de diagnóstico</span>
      <span class="bloco__nota">{{ resumoDoLimite }}</span>
    </div>

    <p v-if="carregando" class="mensagem">carregando…</p>
    <p v-else-if="erro" class="mensagem mensagem--erro" role="alert">{{ erro }}</p>

    <template v-else-if="catalogo">
      <p v-if="!catalogo.tetoDoEnv" class="mensagem mensagem--aviso">
        <code>CAP_ESTADO</code> está desligado no <code>.env</code> desta instalação — nenhuma
        destas entradas roda, mesmo cadastrada.
      </p>
      <p v-else-if="!catalogo.ligada" class="mensagem mensagem--aviso">
        a capacidade <strong>Diagnosticar o servidor</strong> está desligada — as entradas abaixo
        existem, mas nenhuma roda enquanto ela ficar assim.
      </p>

      <div class="entradas">
        <div v-for="entrada in catalogo.entradas" :key="entrada.id" class="entrada">
          <div class="entrada__topo">
            <span class="entrada__id">{{ entrada.id }}</span>
            <span v-if="!entrada.liberadaNoEnv" class="selo">
              fora de ESTADO_COMANDOS no .env
            </span>
          </div>

          <span class="entrada__descricao">{{ entrada.descricao }}</span>

          <div class="entrada__comandos">
            <code v-for="comando in entrada.comandos" :key="comando" class="comando">{{
              comando
            }}</code>
          </div>

          <div v-if="entrada.argumentos.length > 0" class="entrada__argumentos">
            <span v-for="argumento in entrada.argumentos" :key="argumento.nome" class="argumento">
              <span class="argumento__nome">&lt;{{ argumento.nome }}&gt;</span>
              <span class="argumento__descricao">{{ argumento.descricao }}</span>
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { obterCatalogoDeDiagnostico, type CatalogoExibido } from '@/services/ambiente.service';
import { mensagemDoErro } from '@/services/http';

const catalogo = ref<CatalogoExibido | null>(null);
const carregando = ref(true);
const erro = ref('');

const resumoDoLimite = computed(() => {
  const total = catalogo.value?.entradas.length ?? 0;
  const contagem = total > 0 ? `os ${total} comandos abaixo são` : 'a lista abaixo é';

  return `somente leitura. ${contagem} tudo que eu consigo rodar no servidor: não existe shell livre, e nada fora dela é aceito.`;
});

async function carregar(): Promise<void> {
  carregando.value = true;
  erro.value = '';

  try {
    catalogo.value = await obterCatalogoDeDiagnostico();
  } catch (falha) {
    erro.value = mensagemDoErro(falha, 'não consegui ler o catálogo de diagnóstico');
  } finally {
    carregando.value = false;
  }
}

onMounted(() => {
  void carregar();
});
</script>

<style scoped lang="scss">
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

.entradas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}

.entrada {
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 11px 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__topo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__id {
    font: 500 12px/1.4 $mono;
    color: var(--ink);
  }

  &__descricao {
    font-size: 12.5px;
    color: var(--ink3);
  }

  &__comandos {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__argumentos {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
}

.comando {
  font: 400 11.5px/1.5 $mono;
  color: var(--ink2);
  background: var(--panel3);
  border-radius: 6px;
  padding: 4px 7px;
  word-break: break-all;
}

.argumento {
  display: flex;
  flex-direction: column;

  &__nome {
    font: 400 11px/1.5 $mono;
    color: var(--slate);
  }

  &__descricao {
    font-size: 11.5px;
    color: var(--ink3);
  }
}

.selo {
  font-size: 11px;
  border-radius: 20px;
  padding: 2px 9px;
  white-space: nowrap;
  background: var(--clay-s);
  color: var(--clay);
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

  &--aviso {
    color: var(--amber);
  }
}
</style>
