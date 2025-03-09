<script lang="ts">
  const onDragStart = (event: DragEvent, nodeType: string) => {
    if (!event.dataTransfer) return;
    
    event.dataTransfer.setData('application/nodeflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
</script>

<div class="toolbar bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
  <div tabindex={1} role="button" class="node-item" draggable={true} ondragstart={(e) => onDragStart(e, 'text')}>
    <span class="text-orange-500 dark:text-orange-400 mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
      </svg>
    </span>
    Text Node
  </div>
  
  <div class="node-item" role="button" tabindex={1} draggable={true} ondragstart={(e) => onDragStart(e, 'textList')}>
    <span class="text-orange-500 dark:text-orange-400 mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    </span>
    Text List Node
  </div>
  
  <div class="node-item" role="button" tabindex={1} draggable={true} ondragstart={(e) => onDragStart(e, 'mediaList')}>
    <span class="text-orange-500 dark:text-orange-400 mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>
    </span>
    Media List Node
  </div>
  
  <div class="node-item" role="button" tabindex={1} draggable={true} ondragstart={(e) => onDragStart(e, 'picker')}>
    <span class="text-orange-500 dark:text-orange-400 mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
      </svg>
    </span>
    List Picker Node
  </div>
</div>

<style>
  .toolbar {
    padding: 10px;
  }
  
  .node-item {
    padding: 8px 12px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
    background: #f5f5f5;
    transition: all 0.2s;
  }
  
  :global(.dark) .node-item {
    background: #374151;
    border-color: #4B5563;
    color: #E5E7EB;
  }
  
  .node-item:hover {
    background: #eee;
    border-color: #fb923c;
  }
  
  :global(.dark) .node-item:hover {
    background: #4B5563;
    border-color: #fb923c;
  }
</style>
