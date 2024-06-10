import { ref } from "vue";
import CONSTANTS from "@cons/constants";

export default function useCytoscapeDragOpt() {
  const getTarget = (targetNode: any) => {
    return targetNode
      .connectedEdges()
      .map((e: any) =>
        targetNode.data().id === e.data().source ? e.data().target : ""
      );
  };
  const createNewEdge = (children: any[], targets: any) => {
    let newEdges: any[] = [];
    children.forEach((e) => {
      newEdges = newEdges.concat(
        targets.map((t: any, ti: number) => {
          return {
            group: "edges",
            data: {
              id: `${e.data().id}_${t}_${ti}`,
              source: e.data().id,
              target: t
            }
          };
        })
      );
    });
    return newEdges;
  };

  const findEls = (cy: any, key: string) => {
    const arr: any[] = [];
    cy.elements().forEach((el: any) => {
      if (el.data(CONSTANTS.PRNT_CTGRY_ID) === key) {
        arr.push(el);
      }
    });
    return arr;
  };
  const getChild = (cy: any, el: any) => {
    return findEls(cy, el.data().id);
  };

  const getSibling = (cy: any, el: any) => {
    return findEls(cy, el.data(CONSTANTS.PRNT_CTGRY_ID));
  };

  const getParent = (cy: any, el: any) => {
    return cy.getElementById(el.data(CONSTANTS.PRNT_CTGRY_ID));
  };

  const isPrnt = (e: any) => {
    return e.isParent() || e.data("isParent");
  };

  const options = ref({
    grabbedNode: (node: any) => {
      // 노드를 선택할 때 마다, 이벤트를 생성해주고 있기 때문에, 노드 선택시 이전 이벤트를 지우고 시작한다. (이벤트가 복수개로 설정되버림.)
      node.off("cdndout");

      node.on("cdndout", (event: any, parentNode: any, dropSibling: any) => {
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
        let targets = getTarget(parentNode);

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
        cy.add(createNewEdge(children, targets));
      });

      return true;
    },
    dropTarget: (dropTarget: any, grabbedNode: any) => {
      // grabbedNode : 내가 선택한 노드
      // dropTarget : 내가 drop 할수 있는 모든 노드.
      // ->  분류를 추가하는 기능은 지원하지 않음 === 어떤 노드에도 drop 할 수 없음. 위치 이동만 가능함.
      return false;
    },
    dropSibling: (dropSibling: any, grabbedNode: any) => {
      // grabbedNode : 내가 선택한 노드
      // dropSibling : 고아노드를 제외한 내가 drop 할 수 있는 노드
      // dropTarget 은 false 고 dropSibling 은 true 일 수 없음.
      return false;
    },
    newParentNode: (grabbedNode: any, dropSibling: any) => {
      // 고아노드 + 고아노드 를 합칠때, 부모노드가 생성될때 호출 됨.
      // 노드 + 노드 를 설정할 수 없도록 했기 때문에 이 option method 에서는 아무것도 할 필요가 없음.
      return {};
    },
    boundingBoxOptions: {
      includeOverlays: false,
      includeLabels: false
    },
    overThreshold: 200,
    outThreshold: 200
  });
  return {
    option: options,
    getTarget: getTarget,
    createNewEdge: createNewEdge,
    getChild: getChild,
    getParent: getParent,
    getSibling: getSibling,
    isPrnt: isPrnt
  };
}
