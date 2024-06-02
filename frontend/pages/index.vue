<template>INDEX</template>

<script setup lang="ts">
import { onMounted } from "vue";
const router = useRouter();

onMounted(() => {
  router.push("/cytoscape");
});
</script>
