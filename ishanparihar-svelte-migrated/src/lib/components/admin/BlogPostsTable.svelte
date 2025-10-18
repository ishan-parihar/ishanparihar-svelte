<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    createColumnHelper, 
    flexRender, 
    getCoreRowModel, 
    createSvelteTable
  } from '@tanstack/svelte-table';
  import { Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-svelte';
  
  export let posts: {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    author: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    likes: number;
  }[] = [];
  export let loading: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  const columnHelper = createColumnHelper<{
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    author: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    likes: number;
  }>();
  
  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('author', {
      header: 'Author',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('views', {
      header: 'Views',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('likes', {
      header: 'Likes',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleDateString();
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => info.row.original // This will be rendered properly in the template
    })
  ];
  
  const tableStore = createSvelteTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  
  let table;
  
  $: table = $tableStore;
</script>

<div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-900">
        {#each table.getHeaderGroups() as headerGroup}
          <tr>
            {#each headerGroup.headers as header}
               <th class="px-6 py-3 text-left text-xs font-medium text-gray-50 dark:text-gray-400 uppercase tracking-wider">
                 {#if header.column.columnDef.header instanceof Function}
                   {header.column.columnDef.header({ column: header.column, header, table: $tableStore })}
                 {:else}
                   {header.column.columnDef.header}
                 {/if}
               </th>
            {/each}
          </tr>
        {/each}
      </thead>
      
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {#if loading}
          <tr>
            <td colspan="7" class="px-6 py-4 text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </td>
          </tr>
        {:else if posts.length === 0}
          <tr>
            <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              No blog posts found
            </td>
          </tr>
        {:else}
          {#each table.getRowModel().rows as row}
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
              {#each row.getVisibleCells() as cell}
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {#if cell.column.id === 'actions'}
                    <div class="flex space-x-2">
                       <button 
                         class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                         onclick={() => dispatch('edit', row.original.slug)}
                       >
                         <Edit class="w-4 h-4" />
                       </button>
                       <button 
                         class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                         onclick={() => dispatch('delete', row.original.slug)}
                       >
                         <Trash2 class="w-4 h-4" />
                       </button>
                    </div>
                   {:else if cell.column.id === 'status'}
                     <span 
                       class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {row.original.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''} {row.original.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : ''} {row.original.status === 'archived' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}"
                     >
                      {#if row.original.status === 'published'}
                        <CheckCircle class="w-3 h-3 mr-1" />
                      {:else if row.original.status === 'draft'}
                        <Clock class="w-3 h-3 mr-1" />
                      {:else if row.original.status === 'archived'}
                        <XCircle class="w-3 h-3 mr-1" />
                      {/if}
                      {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                    </span>
                  {:else}
                    {#if cell.column.id === 'title'}
                      <div class="font-medium text-gray-900 dark:text-white">
                        {row.original.title}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {row.original.slug}
                      </div>
                    {:else if cell.column.id === 'createdAt'}
                      {new Date(row.original.createdAt).toLocaleDateString()}
                    {:else}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    {/if}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>