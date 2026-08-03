import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useLarguraJanela() {
  const largura = ref(typeof window === 'undefined' ? 1440 : window.innerWidth);

  function medir() {
    largura.value = window.innerWidth;
  }

  onMounted(() => window.addEventListener('resize', medir));
  onBeforeUnmount(() => window.removeEventListener('resize', medir));

  return { largura };
}
