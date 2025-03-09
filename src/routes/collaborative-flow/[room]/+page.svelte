<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
    Panel,
    type Node,
    type Edge,
    type NodeTypes,
    useSvelteFlow,
  } from '@xyflow/svelte';
  import {page} from '$app/state'
  import { PUBLIC_DURABLE_OBJECT_ENDPOINT, PUBLIC_ENV } from '$env/static/public'
  import PartySocket from 'partysocket';
  import '@xyflow/svelte/dist/style.css';
  import { FlowDoc, setFlowDoc } from '$lib/nodes/LoroDoc.svelte';
  import Toolbar from './Toolbar.svelte';
  import TextNode from '$lib/nodes/TextNode2.svelte';
  import TextListNode from '$lib/nodes/TextListNode2.svelte';
  import MediaListNode from '$lib/nodes/MediaListNode2.svelte';
  import { mode } from 'mode-watcher';
  import ListPickerNode from '$lib/nodes/ListPickerNode2.svelte';
  // import { TextNodeData, TextListData, MediaListData, ListPickerData } from './nodes/node-types.svelte';
  import { Spring } from 'svelte/motion';
	import { Loro, LoroDoc, VersionVector } from 'loro-crdt';
	import { constructEdgesFromLoroMap, constructNodesFromLoroMap } from '@/utils';
	import type { ServerToClient } from 'common';
  // Define node types
  const nodeTypes: NodeTypes = {
    text: TextNode,
    textList: TextListNode,
    mediaList: MediaListNode,
    picker: ListPickerNode
  };
  let vvs = $state<VersionVector>();

  const { data }: { data: { doc: Uint8Array | undefined, nodes: Node[], edges: Edge[] } } = $props();

  function importDoc(doc: Uint8Array) {
    flowDoc!.doc.import(doc);
    flowDoc!.isSyncing = true;
    nodes = constructNodesFromLoroMap(flowDoc!.loroNodes);
    edges = constructEdgesFromLoroMap(flowDoc!.loroEdges);
    setTimeout(() => {
      flowDoc!.isSyncing = false;
    }, 0);
  }

  let flowName = $state(page.params.room!)
  let isEditingName = $state(false)
  let flowDoc: FlowDoc | undefined;
  $effect.root(() => {
    flowDoc = setFlowDoc(data.doc ? LoroDoc.fromSnapshot(data.doc): undefined);
    const ws = new PartySocket({
      host: PUBLIC_ENV === "dev" ? "localhost:8787" : PUBLIC_DURABLE_OBJECT_ENDPOINT,
      room: page.params.room ?? 'my-room',
      protocol: PUBLIC_ENV === 'dev' ? 'ws' : 'wss',
    })
    ws.onopen = (event) => {
      console.log('open', event)
    }
    ws.onmessage = (event) => {
      const data: ServerToClient = JSON.parse(event.data);
      // console.log('data', data)
      if (data.type === 'version') {
        console.log('version', data.payload)
        vvs = VersionVector.decode(new Uint8Array(Object.values(data.payload)))
      } else if (data.type === 'delta-and-version') {
        console.log('delta-and-version', data.payload)
        vvs = VersionVector.decode(new Uint8Array(Object.values(data.payload.version)));
        importDoc(new Uint8Array(Object.values(data.payload.delta)));
      } else if (data.type === 'version-and-doc') {
        console.log('version-and-doc', data.payload)
        vvs = VersionVector.decode(new Uint8Array(Object.values(data.payload.version)));
        importDoc(new Uint8Array(Object.values(data.payload.doc)));
      }
    }

    const sub = flowDoc?.doc.subscribeLocalUpdates((event) => {
      if (flowDoc!.isSyncing) return
          console.log('sending update', flowDoc?.doc.peerId)
          if (vvs) {
            const delta = flowDoc?.doc.export({mode: "update", from: vvs})
            if (delta) {
              ws?.send(delta.slice().buffer!)
            }
          }
    })
    return () => {
      sub?.();
      ws?.close();
    }
  })

  let nodes = $state.raw<Node[]>(data.nodes);
  let edges = $state.raw<Edge[]>(data.edges);
  let springToolbarPosition = new Spring({ x: 20, y: 60 }, {
    stiffness: 0.1,
    damping: 0.5,
  })
  
  const { screenToFlowPosition } = $derived(useSvelteFlow());
  
  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };
  
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    
    if (!event.dataTransfer) return;
    
    const type = event.dataTransfer.getData('application/nodeflow');
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    let data;
    const id = crypto.randomUUID();
    
    // Create data objects directly without using classes
    switch (type) {
      case 'text':
        data = { text: '' };
        break;
      case 'textList':
        data = { 
          label: '', 
          items: [{ id: crypto.randomUUID(), text: '' }] 
        };
        break;
      case 'mediaList':
        data = { 
          label: '', 
          items: [{ id: crypto.randomUUID(), text: '', imageUrl: '' }] 
        };
        break;
      case 'picker':
        data = { 
          label: '', 
          options: ["Option 1", "Option 2", "Option 3"], 
          selected: 0,
          get selectedOption() {
            return this.options[this.selected];
          }
        };
        break;
      default:
        return;
    }
    
    const newNode: Node = {
      id,
      type,
      position,
      data
    };
    
    nodes = [...nodes, newNode];

    flowDoc?.addOrModifyNodeData({
      id,
      data,
      position,
      type
    });
  };
  
  const onPaneContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    springToolbarPosition.set({
      x: event.clientX,
      y: event.clientY
    });
  };

  // Add this to ensure the flow takes up the full height
  let containerHeight = "calc(100vh - 4rem)";
</script>

<div style="height: {containerHeight}; width: 100%;">
  <SvelteFlow
    bind:nodes
    bind:edges
    {nodeTypes}
    colorMode={$mode}
    fitView
    oncontextmenu={onPaneContextMenu}
    ondragover={onDragOver}
    ondrop={onDrop}
    onnodedragstop={({targetNode}) => {
      if (targetNode) {
        flowDoc?.modifyNodePosition(targetNode);
      }
    }}
    onconnectend={(e, state) => {
      // if not node is connected, move the toolbar to the location
      if (state.toHandle === null) {
        const position = springToolbarPosition.set({
          x: state.to?.x ?? 20,
          y: state.to?.y ?? 60
        });
      }
    }}
    onconnect={(e) => {
      // console.log('connect', e)
      flowDoc?.addOrModifyEdge({
        id: crypto.randomUUID(),
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      })
    }}
    ondelete={(e) => {
      if (e.nodes.length > 0) {
        e.nodes.forEach(node => {
          flowDoc?.deleteNode(node);
        });
      }
      if (e.edges.length > 0) {
        e.edges.forEach(edge => {
          flowDoc?.deleteEdge(edge);
        });
      }
    }}
  >
    <Controls />
    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    <MiniMap />
    <Panel position="top-left" style="transform: translate(0px, -5px);">
    <div
        aria-live="polite"
        id="canvas-info"
        class="absolute left-5 top-4 rounded-2xl border bg-white p-1 shadow-md shadow-neutral-300 dark:border-neutral-700 dark:bg-black dark:text-white dark:shadow-black flex items-center gap-2"
      >
        <a 
          href="/collaborative-flow" 
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          aria-label="Go back to flows"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
        
        <form method="POST" action="?/rename">
          <div class="flex items-center">
            {#if isEditingName}
              <input 
                type="text" 
                name="name" 
                bind:value={flowName} 
                class="bg-transparent border-b border-gray-300 dark:border-gray-700 px-2 py-1 focus:outline-none focus:border-blue-500 min-w-[150px]"
                autocomplete="off"
              />
              <button 
                type="submit" 
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                aria-label="Save flow name"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            {:else}
              <button 
                type="button" 
                class="px-2 py-1 font-medium hover:underline"
                onclick={() => isEditingName = true}
              >
                {flowName}
              </button>
            {/if}
          </div>
        </form>
    </div>
    </Panel>
    <Panel 
      position="top-left" 
      class="animated-panel"
      style="transform: translate({springToolbarPosition.current.x}px, {springToolbarPosition.current.y}px);"
    >
      <Toolbar />
    </Panel>
  </SvelteFlow>
</div>

<style>

</style>
