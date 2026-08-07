<template>
  <div>
    <template v-if="mensagem.interrompida">
      <CabecalhoResposta meta="interrompido pelo usuário" />
      <ListaFerramentas :ferramentas="mensagem.ferramentas" />
      <RespostaMarkdown v-if="mensagem.texto" :texto="mensagem.texto" :fontes="mensagem.fontes" />
      <RodapeResposta
        :mensagem-id="mensagem.id"
        :tokens="mensagem.tokens"
        :duracao-ms="mensagem.duracaoMs"
        :fontes="mensagem.fontes"
        :texto="mensagem.texto"
      />
    </template>

    <RespostaAprovacao v-else-if="mensagem.estado === 'aprovacao'" :mensagem="mensagem" />

    <RespostaExecutando
      v-else-if="mensagem.estado === 'executando'"
      :mensagem="mensagem"
      @interromper="$emit('interromper')"
    />

    <RespostaStreaming
      v-else-if="mensagem.estado === 'streaming'"
      :mensagem="mensagem"
      @interromper="$emit('interromper')"
    />

    <RespostaBloqueada v-else-if="mensagem.estado === 'bloqueada'" :mensagem="mensagem" />

    <RespostaSemResultado v-else-if="mensagem.estado === 'sem_resultado'" :mensagem="mensagem" />

    <template v-else-if="mensagem.estado === 'erro_modelo'">
      <template v-if="mensagem.texto">
        <RespostaErroModelo
          :mensagem="mensagem"
          compacto
          @tentar-novamente="$emit('tentar-novamente')"
        />
        <RespostaResolvida :mensagem="mensagem" />
      </template>

      <RespostaErroModelo
        v-else
        :mensagem="mensagem"
        @tentar-novamente="$emit('tentar-novamente')"
      />
    </template>

    <RespostaResolvida v-else :mensagem="mensagem" />
  </div>
</template>

<script setup lang="ts">
import CabecalhoResposta from '@/components/chat/CabecalhoResposta.vue';
import ListaFerramentas from '@/components/chat/ListaFerramentas.vue';
import RespostaAprovacao from '@/components/chat/RespostaAprovacao.vue';
import RespostaBloqueada from '@/components/chat/RespostaBloqueada.vue';
import RespostaErroModelo from '@/components/chat/RespostaErroModelo.vue';
import RespostaExecutando from '@/components/chat/RespostaExecutando.vue';
import RespostaMarkdown from '@/components/chat/RespostaMarkdown.vue';
import RespostaResolvida from '@/components/chat/RespostaResolvida.vue';
import RespostaSemResultado from '@/components/chat/RespostaSemResultado.vue';
import RespostaStreaming from '@/components/chat/RespostaStreaming.vue';
import RodapeResposta from '@/components/chat/RodapeResposta.vue';
import type { MensagemAssistenteChat } from '@/stores/chat';

defineProps<{ mensagem: MensagemAssistenteChat }>();
defineEmits<{ interromper: []; 'tentar-novamente': [] }>();
</script>
