<template>
  <div class="tela">
    <div class="cartao">
      <form class="acesso" @submit.prevent="entrar">
        <div class="acesso__marca">
          <span class="acesso__glifo" aria-hidden="true"><i /></span>
          <span class="acesso__nome">ORÁCULO</span>
        </div>
        <p class="acesso__sub">assistente técnico · infraestrutura DSG</p>

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

        <div class="acesso__opcoes">
          <label class="acesso__manter">
            <input v-model="manterSessao" type="checkbox" />
            manter sessão neste terminal
          </label>
          <a href="#">esqueci a senha</a>
        </div>

        <button class="acesso__entrar" type="submit">ENTRAR</button>

        <p class="acesso__nota">
          Autenticação pelo diretório interno. Sessões expiram em 12&nbsp;h de inatividade e ficam
          registradas na auditoria.
        </p>
      </form>

      <div class="estado">
        <div class="o-caps">estado da instalação</div>
        <div class="estado__lista">
          <div v-for="item in instalacao" :key="item.rotulo" class="estado__linha">
            <span class="estado__chave">{{ item.rotulo }}</span>
            <span class="estado__valor" :class="{ 'estado__valor--ok': item.ok }">
              <i v-if="item.ok" aria-hidden="true" />
              {{ item.valor }}
            </span>
          </div>
        </div>
        <div class="estado__rodape">
          <div>build 2026.08.03-0a1f4c2</div>
          <div>base: fts pt-br · 1.2 M trechos</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSessaoStore } from '@/stores/sessao';

const router = useRouter();
const sessao = useSessaoStore();

const usuario = ref(sessao.usuario);
const senha = ref('');
const manterSessao = ref(true);

const instalacao = [
  { rotulo: 'api-oraculo', valor: 'online · 38 ms', ok: true },
  { rotulo: 'modelo', valor: sessao.modelo.nome, ok: true },
  { rotulo: 'índice de conhecimento', valor: 'há 11 min', ok: false },
  { rotulo: 'repositórios indexados', valor: '41 / 41', ok: false },
  { rotulo: 'execução de shell', valor: 'desligada', ok: false },
];

function entrar() {
  sessao.usuario = usuario.value;
  sessao.entrar();
  void router.push({ name: 'chat' });
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

  &__opcoes {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -8px 0 22px;
    font-size: 12px;

    a {
      color: var(--txt3);
    }
  }

  &__manter {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--txt2);
    cursor: pointer;

    input {
      accent-color: var(--acc);
      margin: 0;
    }
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

    &:hover {
      filter: brightness(1.1);
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

  &__rodape {
    @include mono(11px, 400, 1.6);
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    color: var(--txt3);
  }
}
</style>
