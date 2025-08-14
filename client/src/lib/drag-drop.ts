export interface DragDropHandlers<T> {
  onDragStart: (item: T, index: number) => void;
  onDragEnd: () => void;
  onDrop: (draggedItem: T, draggedIndex: number, targetIndex: number) => void;
}

export function createDragDropHandlers<T>(
  items: T[],
  onReorder: (reorderedItems: T[]) => void,
  getId: (item: T) => string
): DragDropHandlers<T> {
  let draggedItem: T | null = null;
  let draggedIndex = -1;

  return {
    onDragStart: (item: T, index: number) => {
      draggedItem = item;
      draggedIndex = index;
    },
    
    onDragEnd: () => {
      draggedItem = null;
      draggedIndex = -1;
    },
    
    onDrop: (_, __, targetIndex: number) => {
      if (draggedItem && draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const newItems = [...items];
        newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        onReorder(newItems);
      }
    }
  };
}

export function makeDraggable(
  element: HTMLElement,
  dragData: any,
  handlers: {
    onDragStart?: (data: any) => void;
    onDragEnd?: () => void;
  }
): void {
  element.draggable = true;
  
  element.addEventListener('dragstart', (e) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = 'move';
    }
    handlers.onDragStart?.(dragData);
  });
  
  element.addEventListener('dragend', () => {
    handlers.onDragEnd?.();
  });
}

export function makeDropZone(
  element: HTMLElement,
  onDrop: (draggedData: any, targetData?: any) => void,
  targetData?: any
): void {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    element.classList.add('drag-over');
  });
  
  element.addEventListener('dragleave', () => {
    element.classList.remove('drag-over');
  });
  
  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');
    
    try {
      const draggedData = JSON.parse(e.dataTransfer!.getData('application/json'));
      onDrop(draggedData, targetData);
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  });
}
