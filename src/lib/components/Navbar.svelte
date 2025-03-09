<script lang="ts">
  import { page } from '$app/stores';
	import { toggleMode, mode } from 'mode-watcher';
  import { onMount } from 'svelte';
  
  let menuOpen = $state(false);
  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<nav class="bg-white dark:bg-zinc-900 shadow-md fixed w-full z-50 transition-colors duration-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0 flex items-center">
          <img class="h-8 w-auto" src="/favicon.png" alt="o7 Logo" />
          <span class="ml-2 text-xl font-bold text-[#FF6900] dark:text-[#FF6900]">o7 Flow</span>
        </a>
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
          <a 
            href="/" 
            class={`${$page.url.pathname === '/' ? 'border-[#FF6900] text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
          >
            Home
          </a>
          <a 
            href="/collaborative-flow" 
            class={`${$page.url.pathname.includes('/collaborative-flow') ? 'border-[#FF6900] text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
          >
            Flows
          </a>
        </div>
      </div>
      
      <div class="flex items-center">
        <button 
          onclick={toggleMode}
          class="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none"
          aria-label="Toggle dark mode"
        >
          {#if $mode === 'dark'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          {/if}
        </button>
        
        <div class="ml-3 sm:hidden">
          <button 
            onclick={toggleMenu}
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <svg class={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg class={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div class={`${menuOpen ? 'block' : 'hidden'} sm:hidden transition-all duration-200`}>
    <div class="pt-2 pb-3 space-y-1">
      <a 
        href="/" 
        class={`${$page.url.pathname === '/' ? 'bg-[#FF6900]/10 dark:bg-[#FF6900]/20 border-[#FF6900] text-[#FF6900] dark:text-[#FF6900]' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
      >
        Home
      </a>
      <a 
        href="/collaborative-flow" 
        class={`${$page.url.pathname.includes('/collaborative-flow') ? 'bg-[#FF6900]/10 dark:bg-[#FF6900]/20 border-[#FF6900] text-[#FF6900] dark:text-[#FF6900]' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
      >
        Flows
      </a>
    </div>
  </div>
</nav>
<div class="h-16"></div> <!-- Spacer for fixed navbar -->
