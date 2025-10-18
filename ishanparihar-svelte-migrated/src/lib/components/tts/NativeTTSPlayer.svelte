<script lang="ts">
  import { onMount } from 'svelte';
  import { Play, Pause, Square, Volume2, Clock } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';

  export let textToSpeak: string;

  let isSpeaking = false;
  let isPaused = false;
  let voices: SpeechSynthesisVoice[] = [];
  let selectedVoiceURI: string = '';
  let rate = 1;
  let progress = 0;
  let elapsedTime = 0;
  let totalDuration = 0;

  let utterance: SpeechSynthesisUtterance | null = null;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handlePlayPause() {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      isPaused = true;
      isSpeaking = false;
    } else if (isPaused) {
      window.speechSynthesis.resume();
      isPaused = false;
      isSpeaking = true;
    } else {
      utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (selectedVoiceURI) {
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      utterance.rate = rate;
      utterance.onend = () => {
        isSpeaking = false;
        isPaused = false;
        progress = 100;
      };
      utterance.onboundary = (event) => {
        progress = (event.charIndex / textToSpeak.length) * 100;
      };
      window.speechSynthesis.speak(utterance);
      isSpeaking = true;
    }
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    progress = 0;
    elapsedTime = 0;
  }

  onMount(() => {
    function loadVoices() {
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && !selectedVoiceURI) {
        const defaultVoice = voices.find(v => v.default);
        if (defaultVoice) {
          selectedVoiceURI = defaultVoice.voiceURI;
        }
      }
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const timer = setInterval(() => {
      if (isSpeaking && !isPaused) {
        elapsedTime += 1;
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.speechSynthesis.onvoiceschanged = null;
    };
  });

  $: if (utterance) {
    totalDuration = Math.ceil(textToSpeak.split(' ').length / (rate * 2.5));
  }
</script>

<div class="flex flex-col space-y-4 p-4">
  <div class="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-none overflow-hidden">
    <div class="h-full bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out" style="width: {progress}%"></div>
  </div>

  <div class="flex flex-col space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="icon" on:click={handlePlayPause}>
          {#if isSpeaking && !isPaused}
            <Pause size={18} />
          {:else}
            <Play size={18} />
          {/if}
        </Button>
        <Button variant="outline" size="icon" on:click={handleStop} disabled={!isSpeaking && !isPaused}>
          <Square size={18} />
        </Button>
      </div>
      <div class="flex items-center space-x-2 text-sm text-neutral-800 dark:text-neutral-300">
        <Clock size={14} />
        <span>{formatTime(elapsedTime)}</span>
        <span>/</span>
        <span>{totalDuration > 0 ? formatTime(totalDuration) : '--:--'}</span>
      </div>
    </div>

    <div class="flex items-center space-x-2">
      <Volume2 size={18} />
      <select bind:value={selectedVoiceURI} class="flex-1 h-8 border rounded-md">
        {#each voices as voice}
          <option value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
        {/each}
      </select>
    </div>

    <div class="flex items-center space-x-2">
      <span class="text-sm min-w-[40px]">{rate.toFixed(1)}x</span>
      <input 
        type="range" 
        bind:value={rate} 
        min={0.5} 
        max={2} 
        step={0.1}
        class="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-none appearance-none cursor-pointer"
      />
    </div>
  </div>
</div>
