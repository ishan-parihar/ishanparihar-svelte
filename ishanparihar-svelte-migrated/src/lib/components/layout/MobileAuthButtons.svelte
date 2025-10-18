<script lang="ts">
  import { session } from '$lib/stores/session';
  import { UserCircle2 } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // TODO: Implement actual authentication logic
  const status = $derived($session ? 'authenticated' : 'unauthenticated');

  function openAuthModal(type: 'signIn' | 'signUp', path: string) {
    // TODO: Implement auth modal
    console.log('openAuthModal', type, path);
  }

  function signOut() {
    // TODO: Implement sign out
    console.log('signOut');
  }
</script>

{#if status === 'authenticated'}
  <div class="flex flex-col space-y-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
    <Button
      href="/account"
      variant="outline"
      class="w-full py-2.5 rounded-none bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 border border-black dark:border-white transition-all duration-200"
    >
      <UserCircle2 class="h-4 w-4" />
      <span class="text-sm font-medium">My Account</span>
    </Button>
    <Button
      variant="ghost"
      class="w-full py-2.5 rounded-none"
      on:click={() => signOut()}
    >
      Sign Out
    </Button>
  </div>
{:else if status === 'unauthenticated'}
  <div class="flex flex-col space-y-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
    <Button
      variant="outline"
      class="w-full py-2.5 rounded-none bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 border border-black dark:border-white transition-all duration-200"
      on:click={() => openAuthModal('signIn', '/account')}
    >
      <span class="text-sm font-medium">Sign In</span>
    </Button>
    <Button
      variant="ghost"
      class="w-full py-2.5 rounded-none"
      on:click={() => openAuthModal('signUp', '/account')}
    >
      Create Account
    </Button>
  </div>
{/if}
