<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  import { UserCircle2 } from 'lucide-svelte';
</script>

{#if $auth.isLoading}
  <div class="ml-1">
    <Skeleton class="w-32 h-9 rounded-md" />
  </div>
{:else if $auth.isLoggedIn}
  <div class="ml-1">
    <Button
      asChild
      size="sm"
      variant="default"
      class="w-32 h-9 px-3 py-2 flex items-center justify-center bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
    >
      <a href="/account" class="flex items-center justify-center gap-1.5">
        <UserCircle2 class="h-4 w-4" />
        <span class="text-sm font-medium">Account</span>
      </a>
    </Button>
  </div>
{:else}
  <div class="ml-1">
    <Button
      size="sm"
      variant="default"
      class="w-32 h-9 px-3 py-2 flex items-center justify-center bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      on:click={() => auth.openAuthModal("signIn", "/account")}
    >
      <div class="flex items-center justify-center gap-1.5">
        <UserCircle2 class="h-4 w-4" />
        <span class="text-sm font-medium">Sign In</span>
      </div>
    </Button>
  </div>
{/if}