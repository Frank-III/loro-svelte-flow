<script lang="ts">
  import { Handle, Position, type NodeProps, type Node } from '@xyflow/svelte';
	import type { TextItem } from './node-types.svelte';
	import { getFlowDoc} from '../LoroDoc.svelte';


  type TextListNode = Node<{
    label: string;
    items: TextItem[];
  }, 'text-list'>;

  let { id, data }: NodeProps<TextListNode> = $props();

  $effect(() => {
    const flowDoc = getFlowDoc();
      flowDoc.addOrModifyNodeData({
        id,
        data: {
          label: data.label,
        items: data.items
      },
      type: 'textList'
      })
  })

  function addItem() {
    data.items = [...data.items, { id: crypto.randomUUID(), text: '' }];
  }

  function removeItem(id: string) {
    data.items = data.items.filter(item => item.id !== id);
  }

  function updateItemText(id: string, newText: string) {
    data.items = data.items.map(item => 
      item.id === id ? { ...item, text: newText } : item
    );
  }
</script>

<div class="text-list-node">
  <Handle type="target" position={Position.Left} />
  
  <div class="title">
    <input type="text" bind:value={data.label} class="nodrag" />
    <button class="add-btn nodrag" onclick={addItem}>+</button>
  </div>
  
  <div class="items">
    {#each data.items as item (item.id)}
      <div class="item">
        <input
          type="text"
          value={item.text}
          oninput={(e) => updateItemText(item.id, e.currentTarget.value)}
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
  .text-list-node {
    padding: 10px;
    border-radius: 5px;
    background: white;
    border: 1px solid #ddd;
    min-width: 200px;
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
    gap: 8px;
  }

  .item {
    display: flex;
    align-items: center;
    position: relative;
    padding-right: 20px;
  }

  input {
    flex: 1;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
  }

  input:focus {
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
