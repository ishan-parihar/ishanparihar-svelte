<script lang="ts">
  import { onMount } from 'svelte';
  
  let frameworks = $state([
    {
      id: 1,
      title: "Integral Theory",
      description: "A comprehensive framework for understanding human development and consciousness.",
      slug: "integral-theory",
      icon: "🧘",
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: 2,
      title: "Law of One",
      description: "A spiritual framework exploring unity consciousness and the nature of reality.",
      slug: "law-of-one",
      icon: "🔮",
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: 3,
      title: "Other Frameworks",
      description: "Various other spiritual and philosophical frameworks.",
      slug: "other",
      icon: "📚",
      color: "bg-green-100 text-green-800"
    }
  ]);
</script>

<svelte:head>
  <title>Spiritual Frameworks</title>
  <meta name="description" content="Explore various spiritual and philosophical frameworks for personal growth" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Spiritual Frameworks</h1>
    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
      Explore various spiritual and philosophical frameworks to deepen your understanding and support your journey of self-discovery.
    </p>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each frameworks as framework (framework.id)}
      <a 
        href={`/framework/${framework.slug}`}
        class="block group"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 h-full border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col items-center text-center">
            <div class="text-4xl mb-4">{framework.icon}</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              {framework.title}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {framework.description}
            </p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {framework.color}">
              Learn More
            </span>
          </div>
        </div>
      </a>
    {/each}
  </div>
  
  <div class="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">About These Frameworks</h2>
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      The frameworks presented here are meant to be exploratory tools rather than definitive truths. 
      Each offers a different lens through which to view reality, consciousness, and the human experience.
    </p>
    <p class="text-gray-700 dark:text-gray-300">
      We encourage you to approach these concepts with an open mind, using them as starting points 
      for your own exploration rather than absolute answers.
    </p>
  </div>
</div>