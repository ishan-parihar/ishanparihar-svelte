<script lang="ts">
  let { 
    value = $bindable(''),
    id = undefined,
    disabled = false,
    class: className = '' 
  } = $props<{ 
    value?: string;
    id?: string;
    disabled?: boolean;
    class?: string;
  }>();
  
  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    value = target.value;
  }
</script>

<select
  id={id}
  bind:value={value}
  onchange={handleChange}
  disabled={disabled}
  class={className + " block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"}
>
  <slot />
</select>