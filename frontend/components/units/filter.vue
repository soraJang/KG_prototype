<template>
  <div class="filter-wrap">
    ** filter toggle 처리 해야함.
    <template v-for="(f, fi) in filters">
      <div>
        <button v-key="`filter_btn_${fi}`" @click="filterClick(f, fi)">
          {{ f.name }} {{ btnStatus[fi] }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const btnStatus = ref([]);

const props = defineProps({
  filters: {
    type: Array,
    required: false,
    defaults: () => {
      return [{ name: "a" }, { name: "b" }];
    }
  }
});

const filterClick = (obj: object, fi: number) => {
  btnStatus[fi] = !btnStatus[fi];
};
</script>

<style lang="scss">
div.filter-wrap {
  width: 300px;
  min-height: 400px;
  position: absolute;
  right: 0px;
}
</style>
