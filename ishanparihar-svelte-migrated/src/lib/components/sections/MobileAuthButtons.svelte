<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import { UserCircle2 } from 'lucide-svelte';
</script>

{#if $auth.isLoggedIn}
  <div class="flex flex-col space-y-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
    <Button
      asChild
      variant="outline"
      class="w-full py-2.5 rounded-none bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 border border-black dark:border-white transition-all duration-200"
    >
      <a href="/account" class="flex items-center justify-center gap-2">
        <UserCircle2 class="h-4 w-4" />
        <span class="text-sm font-medium">My Account</span>
      </a>
    </Button>
    <Button
      variant="ghost"
      class="w-full py-2.5 rounded-none"
      on:click={() => auth.signOut()}
    >
      Sign Out
    </Button>
  </div>
{:else if !$auth.isLoading}
  <div class="flex flex-col space-y-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
    <Button
      variant="outline"
      class="w-full py-2.5 rounded-none bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 border border-black dark:border-white transition-all duration-200"
      on:click={() => auth.openAuthModal('signIn', '/account')}
    >
      <span class="text-sm font-medium">Sign In</span>
    </Button>
    <Button
      variant="ghost"
      class="w-full py-2.5 rounded-none"
      on:click={() => auth.openAuthModal('signUp', '/account')}
    >
      Create Account
    </Button>
  </div>
{/if}
