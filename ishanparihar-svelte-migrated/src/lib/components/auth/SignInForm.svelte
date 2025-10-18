
<script lang="ts">
    import { enhance } from "$app/forms";

    let form: {
        type?: string;
        error?: string;
        message?: string;
    } = $state({});
</script>

<div class="flex flex-col items-center justify-center">
    <div class="w-full max-w-md">
        <h1 class="text-2xl font-bold text-center">Sign in</h1>
        <form method="POST" action="/login" use:enhance class="mt-4">
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" name="email" type="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mt-4">
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mt-6">
                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Continue</button>
            </div>
            {#if form?.error}
                <p class="mt-2 text-sm text-red-600">{form.error}</p>
            {/if}
        </form>
        <div class="mt-4 text-center">
            <a href="/login/google" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">Sign in with Google</a>
        </div>
        <div class="mt-2 text-center">
            <a href="/signup" class="text-sm font-medium text-gray-600 hover:text-gray-500">Create an account</a>
        </div>
    </div>
</div>
