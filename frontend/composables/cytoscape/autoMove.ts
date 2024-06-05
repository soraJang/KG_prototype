import { ref } from "vue";

export default function useCytoscapeAutomove() {
  const options = ref({
    // 자동으로 이동할 노드를 지정하는 방법
    // - true를 반환하는 함수 (노드가 일치하는 경우)
    // - 노드를 선택하는 셀렉터
    // - 노드 컬렉션 (성능에 매우 좋음)
    nodesMatching: function (node) {
      console.log(`nodesMatching : ${node.data().id}`);
      return false; // 모든 노드가 일치
    },

    // 노드의 위치를 업데이트하는 방법을 지정하는 방법
    // - function(node){ return { x: 1, y: 2 }; } => 함수가 반환하는 위치로 노드를 이동
    // - { x1, y1, x2, y2 } => 바운딩 박스 내에서 노드 위치 제한 (모델 좌표로)
    // - { x1, y1, x2, y2, type: 'inside' } => 바운딩 박스 내부에서 노드 위치 제한 (모델 좌표로)
    // - { x1, y1, x2, y2, type: 'outside' } => 바운딩 박스 외부에서 노드 위치 제한 (모델 좌표로)
    // - 'mean' => 노드를 이웃의 평균 위치에 배치
    // - 'viewport' => 뷰포트 내에 노드 본체 유지
    // - 'drag' => 일치하는 노드를 드래그하여 이동
    reposition: "viewport",

    // 재배치가 발생할 때를 지정하는 방법
    // - function(update){ /* ... */ update(); } => 수동 업데이트 함수
    // - 'matching' => nodesMatching에 대한 위치 이벤트 발생 시 자동 업데이트
    // - 효율적으로 자동 설정됨:
    //   - reposition: 'mean'
    //   - reposition: { x1, y1, x2, y2 }
    //   - reposition: 'viewport'
    //   - reposition: 'drag'
    // - 기본값/정의되지 않음 => 모든 노드에 대한 위치 이벤트 발생 시 (효율적이지 않음)
    when: "mean", // 일치하는 노드의 위치 이벤트 시 재배치

    // 함수가 아닌 `reposition` 값에 대한 커스터마이즈 옵션

    // `reposition: 'mean'`,

    // 평균 계산에서 무시할 노드를 지정
    // - 무시할 노드에 대해 true를 반환하는 함수
    // - 무시할 노드를 선택하는 셀렉터
    // - 무시할 노드 컬렉션 (성능에 매우 좋음)
    meanIgnores: function (node) {
      console.log(`meanIgnores : ${node.data().id}`);
      return false; // 무시할 노드 없음
    },

    // 특정 `nodesMatching` 노드가 이동할 때 재배치 여부를 지정
    // - true : 중간 노드를 독립적으로 이동/드래그할 수 없음
    // - false : 중간 노드를 독립적으로 이동/드래그할 수 있음 (다른 규칙에서 이웃과 함께 `reposition: 'drag'` 사용 시 유용)
    meanOnSelfPosition: function (node) {
      console.log(`meanOnselfPosition : ${node.data().id}`);
      return true; // 중간 노드를 독립적으로 이동할 수 없음
    },

    // `reposition: 'drag'`

    // 드래그할 때 일치하는 노드를 이동시키는 노드 지정 (즉, 마스터 노드)
    // - 드래그 이벤트를 위해 노드를 들을 함수가 true를 반환
    // - 드래그 이벤트를 위해 노드를 선택하는 셀렉터
    // - 드래그 이벤트를 듣는 노드 컬렉션 (성능에 매우 좋음)
    dragWith: function (node) {
      console.log(`dragWith : ${node.data().id}`);
      return false; // 드래그 이벤트를 듣는 노드 없음
    }
  });

  return {
    option: options
  };
}
