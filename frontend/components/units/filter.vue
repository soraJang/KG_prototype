<template>
  <div class="filter">
    <h4>Filter</h4>
    <ul class="filter-list">
      <li class="filter-item" v-for="(item, index) in filters">
        <button
          class="filter-button"
          :key="`filter_btn_${index}`"
          :class="[
            item.isUnChecked ? 'filter-button--unchecked' : '',
            highlightedNodeId.length !== 0 &&
            !highlightedNodeId.includes(item.id)
              ? 'filter-button--unhighlighted'
              : ''
          ]"
          :style="{ background: item.color }"
          @click="
            [(item.isUnChecked = !item.isUnChecked), getCheckedItem(item)]
          "
        >
          {{ item.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  filters: {
    type: Array,
    required: true
  },
  highlightedNodeId: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["setNodeView"]);

const getCheckedItem = (item: any) => {
  emit("setNodeView", item.id, item.isUnChecked);
};
</script>

<style lang="scss">
.filter {
  z-index: 999;
  width: 300px;
  min-height: 400px;
  position: absolute;
  right: 16px;

  &-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &-item {
    width: 100%;
  }
  &-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    outline: none;
    filter: contrast(1) brightness(1);

    &:hover {
      filter: brightness(1.2);
    }

    &--unchecked {
      background: white !important;
      border: 1px solid #333;
    }

    &--unhighlighted {
      filter: contrast(0.4) brightness(1.5);
    }
  }
}
</style>
