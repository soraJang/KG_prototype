import { defineNuxtPlugin } from "nuxt/app";

import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import compoundDragAndDrop from "cytoscape-compound-drag-and-drop";
import htmlLabel from "cytoscape-node-html-label";
import fcose from "cytoscape-fcose";
// import { v4 as uuidv4 } from "uuid";

export default defineNuxtPlugin((nuxtApp) => {
  cytoscape.use(compoundDragAndDrop);
  cytoscape.use(cola);
  cytoscape.use(fcose);
  cytoscape.use(htmlLabel);

  nuxtApp.provide("cytoscape", cytoscape);
  // nuxtApp.provide("uuid", uuidv4);
});
