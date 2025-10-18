<script lang="ts">
  import { navigating } from '$app/stores';

  let {
    href,
    showIndicator = true,
    class: className = "",
    children
  } = $props<{
    href: string;
    showIndicator?: boolean;
    class?: string;
    children?: () => any;
  }>();

  let isClicked = $state(false);

  function handleClick() {
    if (showIndicator) {
      isClicked = true;
      setTimeout(() => (isClicked = false), 1500);
    }
  }
</script>

<a {href} class="relative {className}" onclick={handleClick}>
  {@render children?.()}
</a>
