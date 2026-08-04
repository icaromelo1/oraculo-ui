<template>
  <div class="tela">
    <div class="grade">
      <div class="cartao">
        <form class="acesso" @submit.prevent="entrar">
          <div class="acesso__marca">
            <MarcaOraculo tamanho="lg" />
            <span class="acesso__marca-nome">Oráculo</span>
          </div>
          <h1 class="acesso__titulo">Bem-vindo de volta</h1>
          <p class="acesso__sub">Seu assistente sobre a sua infraestrutura.</p>

          <label class="acesso__rotulo" for="usuario">Usuário</label>
          <input
            id="usuario"
            v-model="usuario"
            class="o-field acesso__campo"
            autocomplete="username"
          />

          <label class="acesso__rotulo" for="senha">Senha</label>
          <input
            id="senha"
            v-model="senha"
            class="o-field acesso__campo"
            type="password"
            autocomplete="current-password"
          />

          <p v-if="sessao.erroLogin" class="acesso__erro">{{ sessao.erroLogin }}</p>

          <button class="acesso__entrar" type="submit" :disabled="sessao.carregandoSessao">
            {{ sessao.carregandoSessao ? 'entrando…' : 'Entrar' }}
          </button>
        </form>
      </div>

      <div class="estado">
        <div class="estado__titulo">Estado da instalação</div>
        <div class="estado__lista">
          <div v-for="item in estado" :key="item.rotulo" class="estado__linha">
            <i class="estado__ponto" :class="{ 'estado__ponto--ok': item.ok }" aria-hidden="true" />
            <span class="estado__chave">{{ item.rotulo }}</span>
            <span class="estado__valor" :class="{ mono: item.mono }">{{ item.valor }}</span>
          </div>
          <div v-if="desligadas.length" class="estado__linha">
            <i class="estado__ponto" aria-hidden="true" />
            <span class="estado__chave estado__chave--fraco">Desligadas</span>
            <span class="estado__valor">{{ desligadas.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import MarcaOraculo from '@/components/MarcaOraculo.vue';
import { obterSaude } from '@/services/saude.service';
import { useSessaoStore } from '@/stores/sessao';

const router = useRouter();
const sessao = useSessaoStore();

const usuario = ref('');
const senha = ref('');

interface ItemEstado {
  rotulo: string;
  valor: string;
  ok: boolean;
  mono?: boolean;
}

const ROTULOS_CAPACIDADE: Record<string, string> = {
  conhecimento: 'conhecimento curado',
  codigo: 'código e configs',
  banco: 'consulta ao banco',
  estado: 'estado dos serviços',
  shell: 'comando de shell',
};

function rotularCapacidade(chave: string): string {
  return ROTULOS_CAPACIDADE[chave] ?? chave.replace(/_/g, ' ');
}

const estado = ref<ItemEstado[]>([{ rotulo: 'API respondendo', valor: 'verificando…', ok: false }]);
const desligadas = ref<string[]>([]);

onMounted(() => {
  void carregarEstado();
});

async function carregarEstado(): Promise<void> {
  try {
    const saude = await obterSaude();
    const entradas = Object.entries(saude.capacidades);
    const ligadas = entradas.filter(([, valor]) => valor).length;

    desligadas.value = entradas
      .filter(([, valor]) => !valor)
      .map(([chave]) => rotularCapacidade(chave));

    estado.value = [
      { rotulo: 'API respondendo', valor: saude.status, ok: saude.status === 'ok' },
      { rotulo: 'Provedor', valor: saude.provedor, ok: true, mono: true },
      {
        rotulo: 'Capacidades ligadas',
        valor: `${ligadas} de ${entradas.length}`,
        ok: ligadas > 0,
      },
    ];
  } catch {
    estado.value = [{ rotulo: 'API respondendo', valor: 'indisponível', ok: false }];
    desligadas.value = [];
  }
}

async function entrar(): Promise<void> {
  if (!usuario.value.trim() || !senha.value) return;

  try {
    await sessao.entrar(usuario.value.trim(), senha.value);
    senha.value = '';
    await router.push({ name: 'chat' });
  } catch {
    senha.value = '';
  }
}
</script>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.tela {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--bg);
}

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
  max-width: 760px;
  width: 100%;
}

.cartao {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 30px 28px;
  box-shadow: var(--shadow);
}

.acesso {
  &__marca {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 18px;
  }

  &__marca-nome {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  &__titulo {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  &__sub {
    margin: 0 0 24px;
    color: var(--ink2);
    font-size: 13.5px;
  }

  &__rotulo {
    display: block;
    font-size: 13px;
    color: var(--ink2);
    margin-bottom: 6px;
  }

  &__campo {
    margin-bottom: 16px;
  }

  &__erro {
    margin: -8px 0 16px;
    font-size: 13px;
    color: var(--clay);
  }

  &__entrar {
    width: 100%;
    background: var(--sage);
    color: var(--onaccent);
    border: none;
    border-radius: 9px;
    padding: 11px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
      filter: brightness(1.07);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
}

.estado {
  background: var(--panel2);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 24px 22px;

  &__titulo {
    font-size: 12.5px;
    color: var(--ink3);
    margin-bottom: 14px;
  }

  &__lista {
    display: flex;
    flex-direction: column;
    gap: 13px;
  }

  &__linha {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__ponto {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid var(--line2);
    flex: none;

    &--ok {
      background: var(--sage);
      border: none;
    }
  }

  &__chave {
    flex: 1;
    font-size: 13.5px;
    color: var(--ink);

    &--fraco {
      color: var(--ink2);
    }
  }

  &__valor {
    font-size: 12.5px;
    color: var(--ink3);

    &.mono {
      font: 400 12.5px/1 $mono;
      color: var(--ink2);
    }
  }
}
</style>
