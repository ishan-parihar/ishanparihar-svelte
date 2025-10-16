
<script lang="ts">
    import { page } from "$app/stores";

    function signOut() {
        fetch("/api/logout", { method: "POST" });
        location.reload();
    }
</script>

{#if $page.data.user}
    <button on:click={signOut}>Sign out</button>
{:else}
    <a href="/login">Sign in</a>
{/if}
