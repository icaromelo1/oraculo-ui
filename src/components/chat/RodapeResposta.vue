<template>
  <div class="rodape">
    <span>2 890 tok · 3,8 s</span>
    <span>fontes: 2 código · 2 doc · 1 banco · 1 curado</span>
    <div class="rodape__espacador" />
    <button type="button">copiar</button>
    <button type="button">exportar trilha</button>
    <button type="button">refazer sem cache</button>
  </div>
</template>

<style scoped lang="scss">
@use '@/css/tokens' as *;

.rodape {
  @include mono(10.5px, 400);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 9px;
  border-top: 1px solid var(--line);
  color: var(--txt3);

  &__espacador {
    flex: 1;
  }

  button {
    background: none;
    border: none;
    color: var(--txt3);
    cursor: pointer;
    font: inherit;

    &:hover {
      color: var(--txt);
    }
  }
}
</style>
