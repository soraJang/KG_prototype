import { defineNuxtPlugin } from "nuxt/app";

import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import compoundDragAndDrop from "cytoscape-compound-drag-and-drop";
import htmlLabel from "cytoscape-node-html-label";
import fcose from "cytoscape-fcose";
import dblClick from "cytoscape-dblclick";

export default defineNuxtPlugin((nuxtApp) => {
  cytoscape.use(compoundDragAndDrop);
  cytoscape.use(cola);
  cytoscape.use(fcose);
  cytoscape.use(htmlLabel);
  cytoscape.use(dblClick);

  nuxtApp.provide("cytoscape", cytoscape);
});
