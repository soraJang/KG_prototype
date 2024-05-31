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
        selector: ":parent",
        style: {
          label: "",
          "text-valign": "top",
          "text-halign": "center",
          shape: "round-rectangle",
          "background-color": "#bbb",
          "text-outline-color": "#aaa",
          "corner-radius": "50",
          padding: 50,
          width: "16px",
          height: "16px",
          "font-size": "14px",
          "z-index": "1"
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

        animate: false, // 레이아웃이 실행되는 동안 애니메이션을 보여줄지 여부
        refresh: 1, // 프레임당 틱 수; 높을수록 빠르지만 더 불안정해짐
        maxSimulationTime: 100, // 레이아웃을 실행할 최대 시간(ms)
        ungrabifyWhileSimulating: true, // 레이아웃 중 노드를 드래그할 수 없게 함
        fit: true, // 레이아웃 위치 조정 시 뷰포트를 맞춤
        padding: 30, // 시뮬레이션 주위의 여백
        boundingBox: {
          x1: 0,
          y1: 0,
          x2: 500,
          y2: 500
        }, // 레이아웃 경계를 제한함; { x1, y1, x2, y2 } 또는 { x1, y1, w, h } 형식
        nodeDimensionsIncludeLabels: false, // 노드가 사용하는 공간을 결정할 때 레이블을 포함할지 여부

        // 레이아웃 이벤트 콜백
        ready: function () {}, // 레이아웃 준비 완료 시 호출되는 함수
        stop: function () {}, // 레이아웃 중지 시 호출되는 함수

        // 위치 지정 옵션
        randomize: false, // 레이아웃 시작 시 랜덤 노드 위치 사용 여부
        avoidOverlap: true, // true이면 노드 경계 상자가 겹치는 것을 방지함
        handleDisconnected: true, // true이면 분리된 구성 요소가 겹치는 것을 방지함
        convergenceThreshold: 0.01, // 알파 값(시스템 에너지)이 이 값 아래로 떨어지면 레이아웃이 중지됨
        nodeSpacing: function (node) {
          return 10;
        }, // 노드 주위의 추가 간격
        flow: undefined, // DAG/트리 흐름 레이아웃을 사용하려면 지정, 예: { axis: 'y', minSeparation: 30 }
        alignment: undefined, // 노드에 대한 상대적 정렬 제약, 예: {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
        gapInequalities: undefined, // 노드 간의 간격에 대한 불평등 제약 조건 목록, 예: [{"axis":"y", "left":node1, "right":node2, "gap":25}]
        centerGraph: true, // 그래프의 위치를 중앙에 맞추기 위해 노드 위치를 초기 조정함 (현재 위치에서 레이아웃을 시작하려면 false를 전달)

        // 엣지 길이를 지정하는 다양한 방법
        // 각 속성은 상수 값이나 `function( edge ){ return 2; }`와 같은 함수가 될 수 있음
        edgeLength: undefined, // 시뮬레이션에서 엣지 길이를 직접 설정
        edgeSymDiffLength: undefined, // 시뮬레이션에서 대칭 차 엣지 길이 설정
        edgeJaccardLength: undefined, // 시뮬레이션에서 자카드 엣지 길이 설정

        // 콜라 알고리즘의 반복; 정의되지 않은 경우 기본값 사용
        unconstrIter: undefined, // 초기 무제한 레이아웃 반복
        userConstIter: undefined, // 사용자 지정 제약 조건이 있는 초기 레이아웃 반복
        allConstIter: undefined // 비중복 포함 모든 제약 조건이 있는 초기 레이아웃 반복
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
      },
      fcose: {
        name: "fcose",
        // 'draft', 'default' or 'proof'
        // - "draft" only applies spectral layout
        // - "default" improves the quality with incremental layout (fast cooling rate)
        // - "proof" improves the quality with incremental layout (slow cooling rate)
        quality: "default",
        // Use random node positions at beginning of layout
        // if this is set to false, then quality option must be "proof"
        randomize: true,
        // Whether or not to animate the layout
        animate: false,
        // Duration of animation in ms, if enabled
        animationDuration: 1000,
        // Easing of animation, if enabled
        animationEasing: undefined,
        // Fit the viewport to the repositioned nodes
        fit: true,
        // Padding around layout
        padding: 30,
        // Whether to include labels in node dimensions. Valid in "proof" quality
        nodeDimensionsIncludeLabels: false,
        // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
        uniformNodeDimensions: false,
        // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
        packComponents: true,
        // Layout step - all, transformed, enforced, cose - for debug purpose only
        step: "all",

        /* spectral layout options */

        // False for random, true for greedy sampling
        samplingType: true,
        // Sample size to construct distance matrix
        sampleSize: 25,
        // Separation amount between nodes
        nodeSeparation: 75,
        // Power iteration tolerance
        piTol: 0.0000001,

        /* incremental layout options */

        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: (node) => 4500,
        // Ideal edge (non nested) length
        idealEdgeLength: (edge) => 50,
        // Divisor to compute edge forces
        edgeElasticity: (edge) => 0.45,
        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 0.1,
        // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
        numIter: 2500,
        // For enabling tiling
        tile: true,
        // The comparison function to be used while sorting nodes during tiling operation.
        // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
        // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
        // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
        // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
        // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
        tilingCompareBy: undefined,
        // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingVertical: 10,
        // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingHorizontal: 10,
        // Gravity force (constant)
        gravity: 0.25,
        // Gravity range (constant) for compounds
        gravityRangeCompound: 1.5,
        // Gravity force (constant) for compounds
        gravityCompound: 1.0,
        // Gravity range (constant)
        gravityRange: 3.8,
        // Initial cooling factor for incremental layout
        initialEnergyOnIncremental: 0.3,

        /* constraint options */

        // Fix desired nodes to predefined positions
        // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
        fixedNodeConstraint: undefined,
        // Align desired nodes in vertical/horizontal direction
        // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
        alignmentConstraint: undefined,
        // Place two nodes relatively in vertical/horizontal direction
        // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
        relativePlacementConstraint: undefined,

        /* layout event callbacks */
        ready: () => {}, // on layoutready
        stop: () => {} // on layoutstop
      }
    }
  })
});
