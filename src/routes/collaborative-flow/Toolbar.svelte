<script lang="ts">
  const onDragStart = (event: DragEvent, nodeType: string) => {
    if (!event.dataTransfer) return;
    
    event.dataTransfer.setData('application/nodeflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
</script>

<div class="toolbar">
  <div tabindex={1} role="button" class="node-item" draggable={true} ondragstart={(e) => onDragStart(e, 'text')}>
    Text Node
  </div>
  
  <div class="node-item" draggable={true} ondragstart={(e) => onDragStart(e, 'textList')}>
    Text List Node
  </div>
  
  <div class="node-item" draggable={true} ondragstart={(e) => onDragStart(e, 'mediaList')}>
    Media List Node
  </div>
  
  <div class="node-item" draggable={true} ondragstart={(e) => onDragStart(e, 'picker')}>
    List Picker Node
  </div>
</div>

<style>
  .toolbar {
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .node-item {
    padding: 8px 12px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
    background: #f5f5f5;
  }
  
  .node-item:hover {
    background: #eee;
  }
</style>
