import { defineStore } from "pinia";

export const useCytoscapeStore = defineStore("cytoscape", {
  state: () => ({
    graphStyle: [
      {
        selector: "node",
        style: {
          width: "60",
          height: "60",
          "background-color": "data(color)",
          label: "data(label)",
          "text-valign": "center",
          "text-halign": "center",
          color: "#333",
          "font-size": "10",
          "border-color": "#333",
          "border-width": "2",
          "z-index": 1,
          "text-wrap": "ellipsis",
          "text-max-width": "40px"
        }
      },
      {
        selector: "node.highlight",
        style: {
          "font-size": "12",
          "z-index": 2,
          "text-wrap": "wrap"
        }
      },
      {
        selector: "node.notSelected",
        style: {
          "background-blacken": -0.5,
          "border-opacity": 0.5,
          "font-size": "10",
          "text-wrap": "ellipsis",
          "text-opacity": 0.5,
          "z-index": 0
        }
      },
      {
        selector: "node.mouseHover",
        style: {
          "font-size": "12",
          "text-wrap": "wrap"
        }
      },
      {
        selector: "edge",
        style: {
          width: 1,
          "line-color": "#333",
          label: "data(id)",
          "curve-style": "bezier",
          "target-arrow-color": "#333",
          "target-arrow-shape": "triangle",
          "font-size": "10",
          color: "#5F5E5E",
          "z-index": 1
        }
      },
      {
        selector: "edge.highlight",
        style: {
          width: 2,
          "z-index": 2,
          "font-size": "12",
          "arrow-scale": 1.2
        }
      },
      {
        selector: "edge.notSelected",
        style: {
          "line-opacity": 0.5,
          "text-opacity": 0.5,
          "z-index": 0
        }
      },
      {
        selector: "edge.mouseHover",
        style: {
          "font-size": "12",
          width: 2,
          "arrow-scale": 1.2
        }
      }
    ],
    graphLayouts: {
      // null -> 0, 0
      // preset -> node 하나하나에 직접 positon: {x: 100, y:100} 와 같이 위치를 지정해 줘야만 한다.
      grid: {
        name: "grid",

        fit: true,
        padding: 30,
        boundingBox: undefined,
        avoidOverlap: true,
        avoidOverlapPadding: 10,
        nodeDimensionsIncludeLabels: false,
        spacingFactor: undefined,
        condense: false,
        rows: undefined,
        cols: undefined,
        position: function (node: any) {},
        sort: undefined,
        animate: true,
        animationDuration: 500,
        animationEasing: "ease-in",
        animateFilter: function (node: any, i: any) {
          return true;
        },
        ready: undefined,
        stop: undefined,
        transform: function (node: any, position: any) {
          return position;
        }
      },
      circle: {
        name: "circle",

        fit: true,
        padding: 30,
        boundingBox: undefined,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        spacingFactor: undefined,
        radius: undefined,
        startAngle: (3 / 2) * Math.PI,
        sweep: undefined,
        clockwise: true,
        sort: undefined,
        animate: true,
        animationDuration: 500,
        animationEasing: "ease-in",
        animateFilter: function (node: any, i: any) {
          return true;
        },
        ready: undefined,
        stop: undefined,
        transform: function (node: any, position: any) {
          return position;
        }
      },
      cola: {
        name: "cola",

        animate: true,
        refresh: 1,
        maxSimulationTime: 4000,
        ungrabifyWhileSimulating: true,
        fit: true,
        padding: 30,
        randomize: false,
        nodeSpacing: function (node: any) {
          return 10;
        },
        edgeLengthVal: 45,
        boundingBox: {
          x1: 0,
          y1: 0,
          x2: 500,
          y2: 500
        },
        avoidOverlap: true // 노드가 겹치지 않게 합니다.
      },
      concentric: {
        name: "concentric",

        fit: true,
        padding: 30,
        startAngle: (3 / 2) * Math.PI,
        sweep: undefined,
        clockwise: true,
        equidistant: false,
        minNodeSpacing: 10,
        boundingBox: undefined,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        height: undefined,
        width: undefined,
        spacingFactor: undefined,
        concentric: function (node: any) {
          return node.degree();
        },
        levelWidth: function (nodes: any) {
          return nodes.maxDegree() / 4;
        },
        animate: true,
        animationDuration: 500,
        animationEasing: "ease-in",
        animateFilter: function (node: any, i: any) {
          return true;
        },
        ready: undefined,
        stop: undefined,
        transform: function (node: any, position: any) {
          return position;
        }
      },
      random: {
        name: "random",

        fit: true,
        padding: 30,
        boundingBox: undefined,
        animate: true,
        animationDuration: 500,
        animationEasing: "ease-in",
        animateFilter: function (node: any, i: any) {
          return true;
        },
        ready: undefined,
        stop: undefined,
        transform: function (node: any, position: any) {
          return position;
        }
      },
      breadthfirst: {
        name: "breadthfirst",

        fit: true,
        directed: false,
        padding: 30,
        circle: false,
        grid: false,
        spacingFactor: 1.75,
        boundingBox: undefined,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        roots: undefined,
        depthSort: undefined,
        animate: true,
        animationDuration: 500,
        animationEasing: "ease-in",
        animateFilter: function (node: any, i: any) {
          return true;
        },
        ready: undefined,
        stop: undefined,
        transform: function (node: any, position: any) {
          return position;
        }
      },
      cose: {
        name: "cose",

        ready: function () {},
        stop: function () {},

        animate: true,
        animationEasing: "ease-in",
        animationDuration: 500,
        animateFilter: function (nod: any, i: any) {
          return true;
        },
        animationThreshold: 250,
        refresh: 20,
        fit: true,
        padding: 30,
        boundingBox: undefined,
        nodeDimensionsIncludeLabels: false,
        randomize: false,
        componentSpacing: 40,
        nodeRepulsion: function (node: any) {
          return 2048;
        },
        nodeOverlap: 4,
        idealEdgeLength: function (edge: any) {
          return 32;
        },
        edgeElasticity: function (edge: any) {
          return 32;
        },
        nestingFactor: 1.2,
        gravity: 1,
        numIter: 1000,
        initialTemp: 1000,
        coolingFactor: 0.99,

        minTemp: 1.0
      }
    }
  })
});
