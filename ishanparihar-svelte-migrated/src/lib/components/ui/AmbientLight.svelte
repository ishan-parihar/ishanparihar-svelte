<script lang="ts">
  let {
    color = "rgba(0, 255, 255, 0.1)",
    intensity = 0.1,
    size = 300,
    speed = 0.5,
    className = "",
  } = $props();
</script>

<div class={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
  <div
    class="absolute rounded-full"
    style="
      width: {size}px;
      height: {size}px;
      background: radial-gradient(circle, {color} 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: {intensity};
      animation: float {20 / speed}s ease-in-out infinite;
    "
  ></div>
  <div
    class="absolute rounded-full"
    style="
      width: {size * 0.7}px;
      height: {size * 0.7}px;
      background: radial-gradient(circle, {color} 0%, transparent 70%);
      top: 30%;
      left: 70%;
      opacity: {intensity * 0.7};
      animation: float {25 / speed}s ease-in-out infinite 2s;
    "
  ></div>
  <div
    class="absolute rounded-full"
    style="
      width: {size * 0.5}px;
      height: {size * 0.5}px;
      background: radial-gradient(circle, {color} 0%, transparent 70%);
      top: 70%;
      left: 30%;
      opacity: {intensity * 0.5};
      animation: float {30 / speed}s ease-in-out infinite 4s;
    "
  ></div>
</div>

<style>
  @keyframes float {
    0% { transform: translate(-50%, -50%); }
    25% { transform: translate(-50%, -55%); }
    50% { transform: translate(-45%, -50%); }
    75% { transform: translate(-50%, -45%); }
    100% { transform: translate(-50%, -50%); }
  }
</style>