// /src/composables/canvas/use-canvas-controls.ts

import { nextTick } from "vue";

import { useProjectStore } from "@/stores/project";

export function useCanvasControls(getScroller: () => HTMLElement | null) {
  const store = useProjectStore();

  function scrollToRooms() {
    const scroller = getScroller();
    if (!scroller) return;

    if (store.rooms.rooms.length === 0) {
      scroller.scrollLeft = 0;
      scroller.scrollTop = 0;
      return;
    }

    const box = store.rooms.boundingBoxOfRooms;
    const cellSize = store.grid.cellSizePx;
    const boxCenterX = (box.x + box.width / 2) * cellSize;
    const boxCenterY = (box.y + box.height / 2) * cellSize;
    scroller.scrollLeft = boxCenterX - scroller.clientWidth / 2;
    scroller.scrollTop = boxCenterY - scroller.clientHeight / 2;
  }

  async function fitToScreen() {
    const scroller = getScroller();
    if (!scroller) return;

    const box = store.rooms.boundingBoxOfRooms;
    const hasRooms = store.rooms.rooms.length > 0;

    store.grid.fitToScreen(
      scroller.clientWidth,
      scroller.clientHeight,
      hasRooms ? box : null,
    );

    await nextTick();
    scrollToRooms();
  }

  async function centerOnGrid() {
    store.rooms.centerOnGrid();
    await nextTick();
    scrollToRooms();
  }

  async function resetZoom() {
    store.grid.resetZoom();
    await nextTick();
    scrollToRooms();
  }

  function zoomIn() {
    store.grid.zoom(1);
  }

  function zoomOut() {
    store.grid.zoom(-1);
  }

  return {
    scrollToRooms,
    fitToScreen,
    centerOnGrid,
    resetZoom,
    zoomIn,
    zoomOut,
  };
}
