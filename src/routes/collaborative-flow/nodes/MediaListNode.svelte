<script lang="ts">
  import { Handle, Position, type NodeProps, type Node } from '@xyflow/svelte';
	import type { MediaItem } from './node-types.svelte';
	import { getFlowDoc } from '../LoroDoc.svelte';


  type MediaListNode = Node<{
    label: string;
    items: MediaItem[];
  }, 'media-list'>;

  let { id, data }: NodeProps<MediaListNode> = $props();

  $effect(() => {
    getFlowDoc().addOrModifyNodeData({
      id,
      data: {
        label: data.label,
        items: data.items
      },
      type: 'mediaList'
    })
  })


  function addItem() {
    data.items = [...data.items, { id: crypto.randomUUID(), text: '', imageUrl: '' }];
  }

  function removeItem(id: string) {
    data.items = data.items.filter(item => item.id !== id);
  }

  function updateItem(id: string, updates: Partial<MediaItem>) {
    data.items = data.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
  }

  async function handleImageUpload(event: Event, id: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Convert the file to a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateItem(id, { imageUrl });
      };
      reader.readAsDataURL(file);
    }
  }

</script>

<div class="media-list-node">
  <Handle type="target" position={Position.Left} />
  
  <div class="title">
    <input type="text" bind:value={data.label} class="nodrag" />
    <button class="add-btn nodrag" onclick={addItem}>+</button>
  </div>
  
  <div class="items">
    {#each data.items as item (item.id)}
      <div class="item">
        <div class="media-container">
          {#if item.imageUrl}
            <img
              src={item.imageUrl}
              alt="Item"
              class="preview-image"
            />
          {:else}
            <div class="image-placeholder">
              <label for="image-{item.id}" class="upload-label nodrag">
                Upload Image
              </label>
            </div>
          {/if}
          <input
            type="file"
            id="image-{item.id}"
            accept="image/*"
            class="nodrag"
            onchange={(e) => handleImageUpload(e, item.id)}
            style="display: none;"
          />
        </div>
        
        <input
          type="text"
          value={item.text}
          oninput={(e) => updateItem(item.id, { text: e.currentTarget.value })}
          placeholder="Enter text..."
          class="nodrag"
        />
        
        <button 
          class="remove-btn nodrag" 
          onclick={() => removeItem(item.id)}
          style:visibility={data.items.length > 1 ? 'visible' : 'hidden'}
        >
          ×
        </button>
        
        <Handle
          type="source"
          position={Position.Right}
          id={item.id}
          style="right: -8px; top: 50%;"
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .media-list-node {
    padding: 10px;
    border-radius: 5px;
    background: white;
    border: 1px solid #ddd;
    min-width: 300px;
  }

  .title {
    font-size: 12px;
    color: #777;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    padding-right: 20px;
  }

  .media-container {
    width: 60px;
    height: 60px;
    border: 1px dashed #ccc;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
  }

  .upload-label {
    font-size: 10px;
    color: #666;
    cursor: pointer;
    text-align: center;
    padding: 4px;
  }

  .upload-label:hover {
    color: #333;
  }

  input[type="text"] {
    flex: 1;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #aaa;
  }

  .add-btn, .remove-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 16px;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .add-btn {
    color: #666;
    background: #eee;
  }

  .remove-btn {
    color: #ff4444;
    margin-left: 4px;
  }

  .add-btn:hover {
    background: #ddd;
  }

  .remove-btn:hover {
    color: #ff0000;
  }
</style> 
