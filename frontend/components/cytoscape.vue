<template>
  <div>
    <SelectLayout
      v-if="useTop"
      :default-layout="defaultLayout"
      @set-graph-layout="setGraphLayout"
    ></SelectLayout>
    <Filter
      v-if="useFilter"
      :filters="filters"
      :highlighted-node-id="highlightedNodeId"
      @set-node-view="setNodeView"
    ></Filter>

      <div class="canvas" style="width: 1600px; height: 1000px">
        <div id="cy" ref="mmContainer" style="width: 1400px; height: 1000px"></div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from "vue";
import { useCytoscapeStore } from "@store/useCytoscapeStore";
import CONSTANTS from "@cons/constants";
import Filter from "@comp/units/filter.vue";
import SelectLayout from "@comp/units/selectLayout.vue";

const nuxtApp = useNuxtApp();

const cytoscapeStore = useCytoscapeStore();

const props = defineProps({
  defaultLayout: {
    type: String,
    required: true
  },
  nodeData: {
    type: Object,
    required: true
  },
  styleJson: {
    type: Array,
    required: false,
    defaults: () => {
      return [];
    }
  },
  useFilter: {
    type: Boolean,
    default: true
  },
  useTop: {
    type: Boolean,
    default: true
  },
  useControlBtn: {
    type: Boolean,
    default: true
  }
});

interface Filter {
  id: string;
  label: string;
  color: string;
  isUnChecked: boolean;
}


const options = ref({
    grabbedNode: (node) => {
        // 노드를 선택할 때 마다, 이벤트를 생성해주고 있기 때문에, 노드 선택시 이전 이벤트를 지우고 시작한다. (이벤트가 복수개로 설정되버림.)
        node.off("cdndout");

        // node.off("cdndgrab");
        // node.off("cdndover");
        // node.off("cdnddrop");

        node.on("cdndout", (event, parentNode, dropSibling) => {
            const cy = event.cy;
            const thisNode = event.target;

            /**
             * dragOut 할때 해야할 일
             * 1. 선택한 노드가 부모 노드(이하 카테고리)에 포함되어 있는 경우, 해당 카테고리의 edges 정보를 물려받아야 함.
             * 2. 선택한 노드의 카테고리에 선택한 노드를 제외한 노드가 1개 이하인 경우,
             *    2-1. 다른 하위 노드가 있는 경우, 해당 노드에게 카테고리의 edges 정보를 물려줘야함.
             *    2-2. 다른 하위 노드의 parent 정보를 삭제해 줘야함. (하위노드 move())
             *    2-3. 분류를 삭제해 줘야함.
             */

                // step1. 부모 노드의 edges 정보를 저장해둔다.
            let targets = parentNode
                    .connectedEdges()
                    .map((e) =>
                        parentNode.data().id === e.data().source ? e.data().target : ""
                    );

            // edges 정보를 물려줄 node 정보를 array 에 저장해두는 변수 선언
            // 선택한 노드는 dragout 하는 노드이기 때문에, children 에 넣어둔다.
            let children = [thisNode];

            // 현재 노드를 dragout 한 후에 남아있는 노드를 구한다.
            // 선택한 노드는 이미 부모 노드에서 빠져있다.
            if (parentNode.children().length < 2) {
                // 부모노드에 남아있는 자식 노드가 1개 이하인 경우
                // 부모노드의 존재 의미가 없기 때문에 부모노드를 삭제한다.
                // 삭제하기 전에 자식노드를 독립
                children = children.concat(parentNode.children());

                // 부모노드의 자식노드에서 해당 parent 정보를 지워준다.
                parentNode.children().move({ parent: null });
            }

            // 부모노드에 자식노드가 없다면, 부모노드를 삭제한다.
            if (!parentNode.isParent()) {
                parentNode.remove();
            }

            // children 변수에는 부모노드의 edges 정보를 물려받아야 하는 노드들이 들어있다. 반영해준다.
            let newEdges = [];
            children.forEach((e) => {
                newEdges = newEdges.concat(
                    targets.map((t) => {
                        return {
                            group: "edges",
                            data: {
                                id: `${e.data().id}${t}`,
                                source: e.data().id,
                                target: t
                            }
                        };
                    })
                );
            });
            cy.add(newEdges);
        });

        // 사용하지 않음.
        // node.on("cdndgrab", (event) => {
        //   console.log("cdndgrab");
        // });
        // node.on("cdndover", (event, dropTarget, dropSibling) => {
        //   console.log("cdndover");
        // });
        // node.on("cdnddrop", (event, dropTarget, dropSibling) => {
        //   console.log("cdnddrop");
        // });

        return true;
    },
    dropTarget: (dropTarget, grabbedNode) => {
        // grabbedNode : 내가 선택한 노드
        // dropTarget : 내가 drop 할수 있는 모든 노드.
        // ->  분류를 추가하는 기능은 지원하지 않음 === 어떤 노드에도 drop 할 수 없음. 위치 이동만 가능함.
        return false;
    },
    dropSibling: (dropSibling, grabbedNode) => {
        // grabbedNode : 내가 선택한 노드
        // dropSibling : 고아노드를 제외한 내가 drop 할 수 있는 노드
        // dropTarget 은 false 고 dropSibling 은 true 일 수 없음.
        return false;
    },
    newParentNode: (grabbedNode, dropSibling) => {
        // 고아노드 + 고아노드 를 합칠때, 부모노드가 생성될때 호출 됨.
        // 노드 + 노드 를 설정할 수 없도록 했기 때문에 이 option method 에서는 아무것도 할 필요가 없음.
        return {};
    },
    boundingBoxOptions: {
        // same as https://js.cytoscape.org/#eles.boundingBox, used when calculating if one node is dragged over another
        includeOverlays: false,
        includeLabels: false
    },
    overThreshold: 10, // make dragging over a drop target easier by expanding the hit area by this amount on all sides
    outThreshold: 10 // make dragging out of a drop target a bit harder by expanding the hit area by this amount on all sides
});

const mmContainer = ref(null);
const filters = ref<Filter[]>([]);
let highlightedNodeId = ref([]);
let cy: any = null;

const fcoseLayoutOpt = {
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
};

onMounted(() => {
  const cytoscape = nuxtApp.$cytoscape;
  const container = mmContainer.value;

  cy = cytoscape({
    container: container,
    elements: props.nodeData,
    style: props.styleJson,
    zoom: 1,
    layout: cytoscapeStore.graphLayouts[props.defaultLayout]
  });

    // layout 처리 작업중
    // cy.layout(fcoseLayoutOpt);
    cy.zoom({
        // level: 2.0,
        renderedPosition: {
            x: container.offsetWidth / 2,
            y: container.offsetHeight / 2
        }
    });
    const cdnd = cy.compoundDragAndDrop(options.value);

  cy.elements().forEach((element: any) => {
    let colorCode: string = getRandomColor();
    if (element.isNode()) {
      element.style("background-color", colorCode);
      filters.value.push({
        id: element.id(),
        label: element.data().label,
        color: colorCode,
        isUnChecked: false
      });
    }
  });

  cy.on("tap", (event: any) => {
    let evtTarget = event.target;

    highlightedNodeId.value = [];

    if (evtTarget === cy) {
      cy.elements().forEach((element: any) => {
        if (element.isNode()) {
          element.removeClass(CONSTANTS.HIGHLIGHT);
          element.removeClass(CONSTANTS.NOT_SELECTED);
        } else if (element.isEdge()) {
          element.removeClass(CONSTANTS.HIGHLIGHT);
          element.removeClass(CONSTANTS.NOT_SELECTED);
        }
      });
    }
  });

  cy.on("tap", "node", (event: any) => {
    let evtTarget = event.target;

    highlightedNodeId.value.push(evtTarget.id());

    cy.elements().removeClass(CONSTANTS.NOT_SELECTED);
    evtTarget.addClass(CONSTANTS.HIGHLIGHT);

    cy.elements().forEach((element: any) => {
      if (element.isNode() && element !== evtTarget) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      } else if (element.isEdge()) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      }
    });
  });

  cy.on("tap", "edge", (event: any) => {
    let evtTarget = event.target;
    let startNode = evtTarget.source();
    let endNode = evtTarget.target();

    highlightedNodeId.value.push(startNode.id(), endNode.id());

    cy.elements().removeClass(CONSTANTS.NOT_SELECTED);
    evtTarget.addClass(CONSTANTS.HIGHLIGHT);
    startNode.addClass(CONSTANTS.HIGHLIGHT);
    endNode.addClass(CONSTANTS.HIGHLIGHT);

    cy.elements().forEach((element: any) => {
      if (element.isNode() && element !== startNode && element !== endNode) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      } else if (element.isEdge() && element !== evtTarget) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      }
    });
  });

  cy.on("mouseover", "node", (event: any) => {
    let evtTarget = event.target;
    evtTarget.addClass(CONSTANTS.MOUSE_HOVER);
  });

  cy.on("mouseout", "node", (event: any) => {
    let evtTarget = event.target;
    evtTarget.removeClass(CONSTANTS.MOUSE_HOVER);
  });

  cy.on("mouseover", "edge", (event: any) => {
    let evtTarget = event.target;
    evtTarget.addClass(CONSTANTS.MOUSE_HOVER);
  });

  cy.on("mouseout", "edge", (event: any) => {
    let evtTarget = event.target;
    evtTarget.removeClass(CONSTANTS.MOUSE_HOVER);
  });
});

const getRandomColor = () => {
  let color_r = Math.floor(Math.random() * 127 + 115).toString(16);
  let color_g = Math.floor(Math.random() * 127 + 115).toString(16);
  let color_b = Math.floor(Math.random() * 127 + 115).toString(16);
  return `#${color_r + color_g + color_b}`;
};

const setNodeView = (id: string, isUnChecked: boolean) => {
  cy.elements().forEach((element: any) => {
    if (element.isNode()) {
      if (element.id() === id) {
        isUnChecked ? element.hide() : element.show();
      }
    }
  });
};

const setGraphLayout = (layout: object) => {
  if (cy) {
    cy.layout(layout).run();
  } else {
    console.error("fail");
  }
};
</script>

<style lang="scss">
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  outline: none;
}
.part {
  border: 1px solid red;
}
</style>
