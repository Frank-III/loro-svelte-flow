<script lang="ts">
  import { Handle, Position, type NodeProps, type Node } from '@xyflow/svelte';
	import { getFlowDoc,} from '../LoroDoc.svelte';


  type TextNode = Node<{
    text: string;
  }, 'text-node'>;

  let { id, data }: NodeProps<TextNode> = $props();

  $effect(() => {
    getFlowDoc().addOrModifyNodeData({
      id,
      data: {
        text: data.text
      },
      type: 'text'
    })
  })
</script>

<div class="text-node">
  <Handle type="target" position={Position.Left} />
  
  <input
    type="text"
    bind:value={data.text}
    placeholder="Enter text..."
    class="nodrag"
  />
  
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .text-node {
    padding: 10px;
    border-radius: 5px;
    background: white;
    border: 1px solid #ddd;
    min-width: 150px;
  }

  .title {
    font-size: 12px;
    color: #777;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
  }

  input:focus {
    outline: none;
    border-color: #aaa;
  }
</style>
