<template>
  <div class="tela">
    <div class="cartao">
      <form class="acesso" @submit.prevent="entrar">
        <div class="acesso__marca">
          <span class="acesso__glifo" aria-hidden="true"><i /></span>
          <span class="acesso__nome">ORÁCULO</span>
        </div>
        <p class="acesso__sub">assistente técnico de infraestrutura</p>

        <label class="acesso__rotulo" for="usuario">usuário</label>
        <input
          id="usuario"
          v-model="usuario"
          class="o-field acesso__campo"
          autocomplete="username"
        />

        <label class="acesso__rotulo" for="senha">senha</label>
        <input
          id="senha"
          v-model="senha"
          class="o-field acesso__campo"
          type="password"
          autocomplete="current-password"
        />

        <p v-if="sessao.erroLogin" class="acesso__erro">{{ sessao.erroLogin }}</p>

        <button class="acesso__entrar" type="submit" :disabled="sessao.carregandoSessao">
          {{ sessao.carregandoSessao ? 'entrando…' : 'ENTRAR' }}
        </button>

        <p class="acesso__nota">
          Autenticação pelo diretório interno. Sessões ficam registradas na auditoria.
        </p>
      </form>

      <div class="estado">
        <div class="o-caps">estado da instalação</div>
        <div class="estado__lista">
          <div v-for="item in estado" :key="item.rotulo" class="estado__linha">
            <span class="estado__chave">{{ item.rotulo }}</span>
            <span class="estado__valor" :class="{ 'estado__valor--ok': item.ok }">
              <i v-if="item.ok" aria-hidden="true" />
              {{ item.valor }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
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
}

const estado = ref<ItemEstado[]>([{ rotulo: 'api-oráculo', valor: 'verificando…', ok: false }]);

onMounted(() => {
  void carregarEstado();
});

async function carregarEstado(): Promise<void> {
  try {
    const saude = await obterSaude();
    const ligadas = Object.values(saude.capacidades).filter(Boolean).length;
    const total = Object.values(saude.capacidades).length;

    estado.value = [
      { rotulo: 'api-oráculo', valor: `online · ${saude.status}`, ok: saude.status === 'ok' },
      { rotulo: 'provedor de modelo', valor: saude.provedor, ok: true },
      { rotulo: 'ambiente', valor: saude.ambiente, ok: true },
      { rotulo: 'capacidades ligadas', valor: `${ligadas} de ${total}`, ok: ligadas > 0 },
    ];
  } catch {
    estado.value = [{ rotulo: 'api-oráculo', valor: 'indisponível', ok: false }];
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
  padding: 24px;
  background: var(--bg);
}

.cartao {
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 340px);
  border: 1px solid var(--line);
  border-radius: 5px;
  overflow: hidden;
  background: var(--panel);

  @media (width <= 760px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.acesso {
  padding: 32px 30px;
  border-right: 1px solid var(--line);

  &__marca {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 4px;
  }

  &__glifo {
    width: 17px;
    height: 17px;
    border: 1.5px solid var(--acc);
    border-radius: 2px;
    position: relative;

    i {
      position: absolute;
      inset: 3.5px;
      background: var(--acc);
      border-radius: 1px;
    }
  }

  &__nome {
    @include mono(15px, 600);
    letter-spacing: 0.05em;
  }

  &__sub {
    @include mono(12px, 400, 1.5);
    margin: 0 0 26px;
    color: var(--txt3);
  }

  &__rotulo {
    @include caps(var(--txt2));
    display: block;
    margin-bottom: 6px;
  }

  &__campo {
    margin-bottom: 16px;
  }

  &__erro {
    @include mono(11.5px, 400, 1.4);
    margin: -8px 0 16px;
    color: var(--err);
  }

  &__entrar {
    @include mono(12px, 600);
    width: 100%;
    background: var(--acc);
    color: var(--acc-on);
    border: none;
    border-radius: 3px;
    padding: 10px;
    letter-spacing: 0.06em;
    cursor: pointer;

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  &__nota {
    margin: 14px 0 0;
    color: var(--txt3);
    font-size: 11.5px;
    text-wrap: pretty;
  }
}

.estado {
  padding: 32px 26px;
  background: var(--panel2);

  &__lista {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 14px;
  }

  &__linha {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 11px;
    background: var(--panel);
  }

  &__chave {
    @include mono(12px, 400);
    color: var(--txt2);
  }

  &__valor {
    @include mono(11px, 400);
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--txt3);

    &--ok {
      color: var(--green);
    }

    i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
    }
  }
}
</style>
