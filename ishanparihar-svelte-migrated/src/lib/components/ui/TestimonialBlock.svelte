<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const scale1 = tweened(1, { duration: 4000, easing: cubicOut });
  const scale2 = tweened(1, { duration: 3000, easing: cubicOut });

  function loop1() {
    scale1.set(1.1).then(() => {
      scale1.set(1).then(loop1);
    });
  }

  function loop2() {
    scale2.set(1.1).then(() => {
      scale2.set(1).then(loop2);
    });
  }

  loop1();
  setTimeout(loop2, 1000);
</script>

  <div class="h-[450px] rounded-lg overflow-hidden relative">
    <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg"></div>

    <div class="relative z-10 h-full flex flex-col justify-between p-8 md:p-10">
      <div>
        <div class="text-5xl md:text-6xl font-serif text-primary/20 mb-4">"</div>
        <blockquote class="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-6">
          In three months, I achieved a level of clarity I hadn't found in ten years.
        </blockquote>
      </div>

      <div class="mt-auto">
        <div class="flex items-center">
          <div class="flex-shrink-0 mr-4">
            <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16"></div>
          </div>
          <div>
            <div class="font-bold text-lg text-foreground">James W.</div>
            <div class="text-muted-foreground">From Founder Burnout to Renewed Purpose</div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="absolute top-4 right-4 w-24 h-24 rounded-full bg-primary/10"
      style="transform: scale({$scale1});"
    ></div>

    <div
      class="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-accent/10"
      style="transform: scale({$scale2});"
    ></div>
  </div>