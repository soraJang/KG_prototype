<template>
  <div>
    <h4>Select Layout</h4>
    <select v-model="selectedLayout" @change="changeLayout">
      <option
        v-for="(value, name, index) in cytoscapeStore.graphLayouts"
        :value="name"
        :key="index"
      >
        {{ capitalizeFirstLetter(name) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";
import { useCytoscapeStore } from "@store/useCytoscapeStore";

const cytoscapeStore = useCytoscapeStore();

const props = defineProps({
  defaultLayout: {
    type: String,
    required: true
  }
});
const emit = defineEmits(["setGraphLayout"]);

const selectedLayout = ref(props.defaultLayout);

const changeLayout = () => {
  if (cytoscapeStore.graphLayouts[selectedLayout.value]) {
    emit("setGraphLayout", cytoscapeStore.graphLayouts[selectedLayout.value]);
  } else {
    console.error("fail");
  }
};

const capitalizeFirstLetter = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};
</script>

<style lang="scss"></style>
