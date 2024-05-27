<template>
  <h3>상단</h3>

  <div>
    <select v-model="selectedLayout" @change="changeLayout">
      <option value="grid">Grid</option>
      <option value="circle">Circle</option>
      <option value="cola">Cola</option>
      <option value="concentric">Concentric</option>
      <option value="preset">Preset</option>
      <option value="random">random</option>
      <option value="breadthfirst">breadthfirst</option>
      <option value="cose">cose</option>
    </select>
  </div>
</template>

<script setup lang="ts">
const selectedLayout = ref("grid");

function changeLayout() {
  let coseOpt = {
    name: "cose"
    // animate : 'end',
  };
  let colaOpt = {
    name: "cola"
    // animate :'end',
  };
  // if (selectedLayout.value === "cose") {
  //   cy.layout(coseOpt).run();
  // } else if (selectedLayout.value === "cola") {
  //   cy.layout(colaOpt).run();
  // } else {
  //   cy.layout({ name: selectedLayout.value }).run(); // 선택된 레이아웃으로 변경
  // }
  console.log(
    `[레이아웃 변경] 부모 component 로 넘겨서 처리 : ${selectedLayout.value}`
  );
}
</script>

<style lang="scss"></style>
