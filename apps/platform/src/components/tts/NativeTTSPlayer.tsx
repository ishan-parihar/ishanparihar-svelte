"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, Volume2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Helper function to get a more descriptive error message
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "canceled":
      return "Speech was canceled";
    case "interrupted":
      return "Speech was interrupted by another utterance";
    case "audio-busy":
      return "Audio system is busy";
    case "audio-hardware":
      return "Audio hardware not available";
    case "network":
      return "Network error occurred";
    case "synthesis-unavailable":
      return "Speech synthesis not available";
    case "synthesis-failed":
      return "Speech synthesis failed";
    case "language-unavailable":
      return "Language not available";
    case "voice-unavailable":
      return "Voice not available";
    case "text-too-long":
      return "Text too long";
    case "invalid-argument":
      return "Invalid argument";
    case "not-allowed":
      return "Not allowed";
    default:
      return `Unknown error: ${errorCode}`;
  }
};

// Android-specific text segmentation utilities
// These functions help break long text into manageable chunks for Android TTS

// Interface for text segment in the queue
interface TextSegment {
  text: string;
  index: number;
  isLast: boolean;
}

// Function to split text into segments that maintain natural speech flow
// Prioritizes complete sentences and breaks at natural pause points
const segmentText = (
  text: string,
  maxSegmentLength: number = 200,
): TextSegment[] => {
  // Trim whitespace and normalize spaces
  const normalizedText = text.trim().replace(/\s+/g, " ");

  // For testing/debugging
  const logSegmentation = (segments: TextSegment[], reason: string) => {
    console.log(
      `[TTS Android Segmentation] ${reason}: ${segments.length} segments`,
    );
    segments.forEach((seg, i) => {
      console.log(
        `[TTS Android Segmentation] Segment ${i + 1}: ${seg.text.substring(0, 30)}... (${seg.text.length} chars)`,
      );
    });
  };

  // If text is already short enough, return it as a single segment
  if (normalizedText.length <= maxSegmentLength) {
    const segments = [{ text: normalizedText, index: 0, isLast: true }];
    logSegmentation(segments, "Text is short enough for a single segment");
    return segments;
  }

  // Step 1: Split text into sentences using a more comprehensive regex
  // This regex matches sentence endings with proper handling of abbreviations and edge cases
  const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/g;
  const rawSentences = normalizedText.split(sentenceRegex);

  // Clean up sentences and ensure they end with proper punctuation
  const sentences: string[] = [];
  rawSentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    if (trimmed.length > 0) {
      // Make sure the sentence ends with punctuation
      if (!/[.!?]$/.test(trimmed)) {
        sentences.push(trimmed + ". ");
      } else {
        sentences.push(trimmed + " ");
      }
    }
  });

  // Step 2: Group sentences into segments, respecting the max length
  const segments: TextSegment[] = [];
  let currentSegment = "";
  let currentSegmentSentences = 0;

  sentences.forEach((sentence) => {
    // Case 1: The sentence itself exceeds max length - needs special handling
    if (sentence.length > maxSegmentLength) {
      // If we have accumulated content, push it as a segment first
      if (currentSegment.length > 0) {
        segments.push({
          text: currentSegment.trim(),
          index: segments.length,
          isLast: false,
        });
        currentSegment = "";
        currentSegmentSentences = 0;
      }

      // Now handle the long sentence by breaking it at natural pause points
      const longSentenceSegments = breakLongSentence(
        sentence,
        maxSegmentLength,
      );
      longSentenceSegments.forEach((segment) => {
        segments.push({
          text: segment.trim(),
          index: segments.length,
          isLast: false,
        });
      });
    }
    // Case 2: Adding this sentence would exceed the max length
    else if (
      currentSegment.length + sentence.length > maxSegmentLength &&
      currentSegment.length > 0
    ) {
      // Complete the current segment
      segments.push({
        text: currentSegment.trim(),
        index: segments.length,
        isLast: false,
      });

      // Start a new segment with this sentence
      currentSegment = sentence;
      currentSegmentSentences = 1;
    }
    // Case 3: This sentence fits in the current segment
    else {
      currentSegment += sentence;
      currentSegmentSentences++;
    }
  });

  // Add the last segment if there's anything left
  if (currentSegment.length > 0) {
    segments.push({
      text: currentSegment.trim(),
      index: segments.length,
      isLast: true,
    });
  }

  // Update the isLast flag to ensure only the final segment is marked as last
  if (segments.length > 0) {
    segments.forEach((segment, index) => {
      segment.isLast = index === segments.length - 1;
    });
  }

  logSegmentation(segments, "Final segmentation");
  return segments;
};

// Helper function to break a long sentence at natural pause points
const breakLongSentence = (sentence: string, maxLength: number): string[] => {
  const segments: string[] = [];
  let remainingText = sentence;

  while (remainingText.length > maxLength) {
    // Try to find natural break points in order of preference

    // 1. Look for semicolons, colons, or dashes first (strongest pauses)
    let breakPoint = findLastBreakPoint(remainingText.substring(0, maxLength), [
      ";",
      ":",
      "—",
      "--",
    ]);

    // 2. If not found, look for commas (medium pauses)
    if (breakPoint === -1) {
      breakPoint = findLastBreakPoint(remainingText.substring(0, maxLength), [
        ",",
      ]);
    }

    // 3. If still not found, look for conjunctions with spaces on both sides
    if (breakPoint === -1) {
      breakPoint = findLastConjunction(remainingText.substring(0, maxLength));
    }

    // 4. If all else fails, break at the last space before maxLength
    if (breakPoint === -1) {
      breakPoint = remainingText.substring(0, maxLength).lastIndexOf(" ");
    }

    // 5. If there's no space (very unlikely), break at maxLength
    if (breakPoint === -1) {
      breakPoint = maxLength - 1;
    }

    // Extract the segment and update remaining text
    const segment = remainingText.substring(0, breakPoint + 1);
    segments.push(segment);
    remainingText = remainingText.substring(breakPoint + 1).trim();
  }

  // Add the last part if there's anything left
  if (remainingText.length > 0) {
    segments.push(remainingText);
  }

  return segments;
};

// Helper to find the last occurrence of any of the specified break characters
const findLastBreakPoint = (text: string, breakChars: string[]): number => {
  let lastIndex = -1;

  breakChars.forEach((char) => {
    const index = text.lastIndexOf(char);
    if (index > lastIndex) {
      lastIndex = index;
    }
  });

  return lastIndex;
};

// Helper to find the last conjunction that would make a good break point
const findLastConjunction = (text: string): number => {
  // Common conjunctions that can serve as natural break points
  const conjunctions = [
    " and ",
    " but ",
    " or ",
    " nor ",
    " for ",
    " yet ",
    " so ",
  ];
  let lastIndex = -1;

  conjunctions.forEach((conj) => {
    const index = text.lastIndexOf(conj);
    if (index > lastIndex) {
      // Return the index at the end of the conjunction
      lastIndex = index + conj.length - 1;
    }
  });

  return lastIndex;
};

interface NativeTTSPlayerProps {
  textToSpeak: string;
  className?: string;
}

export function NativeTTSPlayer({
  textToSpeak,
  className,
}: NativeTTSPlayerProps) {
  // Core state - simplified to essential states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // Android-specific segmented speech state
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [totalSegments, setTotalSegments] = useState<number>(0);
  const [isSegmentedSpeechActive, setIsSegmentedSpeechActive] =
    useState<boolean>(false);

  // Refs - simplified to essential refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractedRef = useRef<boolean>(false);
  const rateChangePendingRef = useRef<boolean>(false);
  const voiceChangePendingRef = useRef<boolean>(false);
  const lastSpeakTimeRef = useRef<number>(0);
  const lastCharIndexRef = useRef<number | null>(null);
  const voiceOrRateChangePendingRef = useRef<boolean>(false);
  const originalFullTextRef = useRef<string>("");

  // Android-specific segmented speech refs
  const segmentsRef = useRef<TextSegment[]>([]);
  const segmentedSpeechActiveRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  // Helper function to format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to get a reference to the speech synthesis API
  const getSpeechSynthesis = (): SpeechSynthesis | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return null;
    }

    // Store in ref for consistent access
    if (!speechSynthesisRef.current) {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    return speechSynthesisRef.current;
  };

  // Robust helper to safely cancel any ongoing speech - memoized with useCallback
  const cancelSpeech = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const synthesis = getSpeechSynthesis();
      if (!synthesis) {
        resolve();
        return;
      }

      try {
        // Log current state before cancelling
        console.log(
          "[TTS] Cancelling speech. Current state - speaking:",
          synthesis.speaking,
          "paused:",
          synthesis.paused,
          "pending:",
          synthesis.pending,
        );

        // Cancel any existing speech
        synthesis.cancel();

        // Log state after cancelling to verify it worked
        console.log(
          "[TTS] After cancel - speaking:",
          synthesis.speaking,
          "paused:",
          synthesis.paused,
          "pending:",
          synthesis.pending,
        );

        // Add a cooldown period to ensure the speech engine has fully reset
        // This is critical for mobile browsers to prevent 'interrupted' errors
        // iOS devices need a longer cooldown period
        const cooldownTime = isIOS ? 350 : isMobile ? 250 : 50;

        setTimeout(() => {
          // Double-check if still speaking after cancel (rare but can happen)
          if (synthesis.speaking || synthesis.paused) {
            console.warn(
              "[TTS] Speech synthesis still active after cancel, trying again",
            );
            synthesis.cancel();
          }

          console.log("[TTS] Cooldown completed");
          resolve();
        }, cooldownTime);
      } catch (error) {
        console.error("[TTS] Error cancelling speech:", error);
        resolve(); // Resolve anyway to prevent hanging promises
      }
    });
  }, [isMobile, isIOS]);

  // Improved helper function to estimate speech duration based on text length and rate
  const estimateDuration = (text: string, speechRate: number): number => {
    // More accurate word count - split on whitespace and filter out empty strings
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;

    // Base words per minute rate for TTS at rate 1.0
    // Adjusted based on testing with real TTS engines
    const baseWPM = 170; // Slightly increased from 160 for better accuracy

    // Count punctuation marks that cause pauses
    const pauseMarks = (text.match(/[,.;:!?()]/g) || []).length;

    // Calculate base minutes based on word count and rate
    let minutes = wordCount / (baseWPM * speechRate);

    // Add time for punctuation pauses (each punctuation mark adds a small pause)
    const pauseAdjustment = (pauseMarks * 0.3) / 60; // Each pause mark adds ~0.3 seconds
    minutes += pauseAdjustment;

    // Add time for longer words (approximation)
    const longWords = words.filter((word) => word.length > 8).length;
    const longWordAdjustment = (longWords * 0.2) / 60; // Each long word adds ~0.2 seconds
    minutes += longWordAdjustment;

    // Convert to seconds and add a buffer (15%) for TTS engine variability
    const durationInSeconds = Math.ceil(minutes * 60 * 1.15);

    console.log(
      `[TTS] Estimated duration for ${wordCount} words (${pauseMarks} pauses, ${longWords} long words) at rate ${speechRate}: ${Math.floor(durationInSeconds / 60)}:${Math.floor(
        durationInSeconds % 60,
      )
        .toString()
        .padStart(2, "0")}`,
    );

    return durationInSeconds;
  };

  // Function to speak the next segment in the queue
  const speakNextSegment = useCallback(
    (index: number, segments: TextSegment[]) => {
      if (index >= segments.length) {
        console.log("[TTS Android Segmented] All segments completed");
        segmentedSpeechActiveRef.current = false;
        setIsSegmentedSpeechActive(false);
        setIsSpeaking(false);
        setProgress(100);
        return;
      }

      const segment = segments[index];
      console.log(
        `[TTS Android Segmented] Speaking segment ${index + 1}/${segments.length}: "${segment.text.substring(0, 30)}..."`,
      );

      // Update UI state
      setCurrentSegmentIndex(index);
      setProgress(Math.floor((index / segments.length) * 100));

      // Get speech synthesis
      const synth = window.speechSynthesis;
      if (!synth) {
        console.error("[TTS Android Segmented] Speech synthesis not available");
        return;
      }

      // Create a fresh utterance for this segment
      const utterance = new SpeechSynthesisUtterance(segment.text);

      // Find an appropriate English voice for Android
      let androidVoiceToUse: SpeechSynthesisVoice | undefined = undefined;

      if (voices.length > 0) {
        // First try to find the selected voice if one is set
        if (selectedVoiceURI) {
          androidVoiceToUse = voices.find(
            (voice) => voice.voiceURI === selectedVoiceURI,
          );
          if (androidVoiceToUse) {
            console.log(
              `[TTS Android Segmented] Using selected voice: ${androidVoiceToUse.name}`,
            );
          }
        }

        // If no selected voice or it wasn't found, try to find a default English voice
        if (!androidVoiceToUse) {
          // Try to find a default English voice first
          androidVoiceToUse = voices.find(
            (v) => v.lang.startsWith("en-") && v.default,
          );

          // If no default English voice, try any English voice
          if (!androidVoiceToUse) {
            androidVoiceToUse = voices.find((v) => v.lang.startsWith("en-"));
          }

          // If still no voice found, use the first available voice as fallback
          if (!androidVoiceToUse && voices.length > 0) {
            androidVoiceToUse = voices[0];
          }
        }
      }

      // Set essential properties
      utterance.lang = androidVoiceToUse ? androidVoiceToUse.lang : "en-US";
      utterance.rate = rate; // Use the selected rate
      utterance.volume = 1.0;

      // Set the voice if one was found
      if (androidVoiceToUse) {
        utterance.voice = androidVoiceToUse;
      }

      // Set up event handlers
      utterance.onstart = () => {
        console.log(`[TTS Android Segmented] Segment ${index + 1} started`);
        setIsSpeaking(true);

        // Start timer to update elapsed time if this is the first segment
        if (index === 0 && timerRef.current === null) {
          timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
          }, 1000);
        }
      };

      // Create a unique identifier for this utterance to track it
      const utteranceId = `segment-${index}-${Date.now()}`;
      // Use a custom property to track the utterance ID (TypeScript safe)
      (utterance as any).customId = utteranceId;

      utterance.onend = () => {
        console.log(
          `[TTS Android Segmented] Segment ${index + 1} ended (ID: ${utteranceId})`,
        );

        // If this is the last segment, clean up
        if (segment.isLast) {
          console.log("[TTS Android Segmented] Last segment completed");
          setIsSpeaking(false);
          setProgress(100);

          // Clear timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          // Reset segmented speech state
          segmentedSpeechActiveRef.current = false;
          setIsSegmentedSpeechActive(false);
        } else {
          // Otherwise, speak the next segment after a short delay
          // This delay helps prevent 'interrupted' errors between segments

          // Only proceed if this utterance is still the current one
          // This prevents multiple onend events from triggering multiple next segments
          if (
            utteranceRef.current &&
            (utteranceRef.current as any).customId === utteranceId
          ) {
            // Calculate a natural-sounding pause between segments
            // Longer pause after sentences ending with period, shorter after comma, etc.
            const lastChar = segment.text.trim().slice(-1);
            let pauseDuration = 150; // Base pause duration in ms

            // Adjust pause based on the ending punctuation of the current segment
            if (lastChar === ".")
              pauseDuration = 250; // Longer pause after periods
            else if (lastChar === "!")
              pauseDuration = 300; // Even longer after exclamation
            else if (lastChar === "?")
              pauseDuration = 300; // Similar for questions
            else if (lastChar === ",")
              pauseDuration = 150; // Medium pause after commas
            else if (lastChar === ";") pauseDuration = 200; // Medium-long pause after semicolons

            console.log(
              `[TTS Android Segmented] Pausing for ${pauseDuration}ms after segment ${index + 1}`,
            );

            setTimeout(() => {
              // Only proceed to the next segment if speech is active and not paused
              if (segmentedSpeechActiveRef.current && !isPausedRef.current) {
                // Increment the index explicitly here to ensure we move forward
                const nextIndex = index + 1;
                console.log(
                  `[TTS Android Segmented] Moving to next segment: ${nextIndex + 1}`,
                );
                speakNextSegment(nextIndex, segments);
              }
            }, pauseDuration);
          } else {
            console.log(
              `[TTS Android Segmented] Ignoring onend for outdated utterance (ID: ${utteranceId})`,
            );
          }
        }
      };

      utterance.onerror = (event) => {
        console.error(
          `[TTS Android Segmented] Error in segment ${index + 1}:`,
          event.error,
        );
        console.error("[TTS Android Segmented] Error details:", {
          error: event.error,
          errorMessage: getErrorMessage(event.error),
          segmentIndex: index,
          segmentText: segment.text,
          utteranceLang: utterance.lang,
          utteranceVoice: utterance.voice ? utterance.voice.name : "default",
        });

        // If there's an error, try to continue with the next segment
        // unless this is the last segment
        if (!segment.isLast && segmentedSpeechActiveRef.current) {
          console.log(
            "[TTS Android Segmented] Attempting to continue with next segment",
          );
          setTimeout(() => {
            speakNextSegment(index + 1, segments);
          }, 100);
        } else {
          // If this is the last segment or we've had too many errors, clean up
          setIsSpeaking(false);

          // Clear timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          // Reset segmented speech state
          segmentedSpeechActiveRef.current = false;
          setIsSegmentedSpeechActive(false);
        }
      };

      // Store the utterance in the ref
      utteranceRef.current = utterance;

      // Speak the segment
      try {
        synth.speak(utterance);
        console.log(
          `[TTS Android Segmented] speak() called for segment ${index + 1}`,
        );

        // Check if the utterance was actually queued
        if (!synth.speaking && !synth.pending) {
          console.warn(
            `[TTS Android Segmented] Warning: speak() called for segment ${index + 1} but utterance not queued`,
          );
        }
      } catch (e) {
        console.error(
          `[TTS Android Segmented] Error calling speak() for segment ${index + 1}:`,
          e,
        );

        // Try to continue with the next segment
        if (!segment.isLast && segmentedSpeechActiveRef.current) {
          setTimeout(() => {
            speakNextSegment(index + 1, segments);
          }, 100);
        } else {
          // Clean up
          setIsSpeaking(false);
          segmentedSpeechActiveRef.current = false;
          setIsSegmentedSpeechActive(false);
        }
      }
    },
    [voices, selectedVoiceURI, rate],
  );

  // Test function to verify segmentation quality without speaking
  const testSegmentation = (text: string): void => {
    console.log(
      "[TTS Android Segmentation Test] Starting test of segmentation algorithm",
    );

    // Test with different max lengths to compare results
    const testLengths = [150, 200, 250, 300];

    testLengths.forEach((maxLength) => {
      const segments = segmentText(text, maxLength);

      console.log(
        `[TTS Android Segmentation Test] Results for max length ${maxLength}:`,
      );
      console.log(
        `[TTS Android Segmentation Test] - Total segments: ${segments.length}`,
      );
      console.log(
        `[TTS Android Segmentation Test] - Average segment length: ${Math.round(text.length / segments.length)} chars`,
      );

      // Check for potential issues
      let sentenceSplits = 0;
      let unnaturalBreaks = 0;

      segments.forEach((segment, i) => {
        // Check if segment ends with a sentence-ending punctuation
        const endsWithSentence = /[.!?]\s*$/.test(segment.text);
        if (!endsWithSentence && !segment.isLast) {
          sentenceSplits++;
        }

        // Check for potentially unnatural breaks (simplified heuristic)
        if (
          segment.text.endsWith(" and") ||
          segment.text.endsWith(" the") ||
          segment.text.endsWith(" a") ||
          segment.text.endsWith(" to")
        ) {
          unnaturalBreaks++;
        }
      });

      console.log(
        `[TTS Android Segmentation Test] - Sentence splits: ${sentenceSplits}`,
      );
      console.log(
        `[TTS Android Segmentation Test] - Potentially unnatural breaks: ${unnaturalBreaks}`,
      );
    });

    console.log("[TTS Android Segmentation Test] Test completed");
  };

  // Android-specific function to speak text in segments
  const speakAndroidSegmented = useCallback(
    (text: string) => {
      console.log(
        "[TTS Android Segmented] Starting segmented speech for Android",
      );

      // Mark that user has interacted - important for mobile browsers
      userInteractedRef.current = true;

      // Get speech synthesis directly from window
      const synth = window.speechSynthesis;
      if (!synth) {
        console.error(
          "[TTS Android Segmented] Speech synthesis not available on window object",
        );
        return;
      }

      // Cancel any ongoing speech directly
      console.log("[TTS Android Segmented] Cancelling any existing speech");
      synth.cancel();

      // Reset UI state
      setProgress(0);
      setElapsedTime(0);
      setCurrentSegmentIndex(0);
      isPausedRef.current = false;
      setIsPaused(false);

      // Run a test of the segmentation algorithm if in development mode
      if (process.env.NODE_ENV === "development") {
        // Uncomment to run the test
        // testSegmentation(text);
      }

      // Segment the text into natural speech chunks
      const segments = segmentText(text, 250); // Use 250 characters as max segment length for better coherence
      console.log(
        `[TTS Android Segmented] Created ${segments.length} segments using improved algorithm`,
      );

      // Store segments in ref for access in callbacks
      segmentsRef.current = segments;
      setTotalSegments(segments.length);

      // Mark segmented speech as active
      segmentedSpeechActiveRef.current = true;
      setIsSegmentedSpeechActive(true);

      // Start speaking the first segment
      speakNextSegment(0, segments);
    },
    [speakNextSegment],
  );

  // Function to stop segmented speech
  const stopSegmentedSpeech = useCallback(() => {
    console.log("[TTS Android Segmented] Stopping segmented speech");

    // Get speech synthesis
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Cancel any ongoing speech
    synth.cancel();

    // Reset state
    segmentedSpeechActiveRef.current = false;
    isPausedRef.current = false;
    setIsSegmentedSpeechActive(false);
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentSegmentIndex(0);

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset elapsed time
    setElapsedTime(0);
  }, []);

  // Function to pause segmented speech
  const handlePauseSegmented = useCallback(() => {
    console.log("[TTS Android Segmented] Pausing segmented speech");

    // Get speech synthesis
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Only try to pause if actually speaking
    if (synth.speaking && !synth.paused) {
      // Set the paused state before actually pausing
      isPausedRef.current = true;
      setIsPaused(true);
      setIsSpeaking(false);

      // Pause the speech synthesis
      synth.pause();
      console.log("[TTS Android Segmented] Speech paused");

      // Pause the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      console.warn(
        "[TTS Android Segmented] Attempted to pause when speech synthesis was not speaking or already paused",
      );
    }
  }, []);

  // Function to resume segmented speech
  const handleResumeSegmented = useCallback(() => {
    console.log("[TTS Android Segmented] Resuming segmented speech");

    // Get speech synthesis
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Only try to resume if actually paused
    if (synth.speaking && synth.paused) {
      // Reset the paused state before resuming
      isPausedRef.current = false;
      setIsPaused(false);
      setIsSpeaking(true);

      // Resume the speech synthesis
      synth.resume();
      console.log("[TTS Android Segmented] Speech resumed");

      // Resume the timer
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      }
    } else if (isPausedRef.current) {
      // If the engine is not paused but our state says it is,
      // we might need to restart from the current segment
      console.log(
        "[TTS Android Segmented] Engine not in paused state but isPausedRef is true. Restarting from current segment.",
      );

      // Reset the paused state
      isPausedRef.current = false;
      setIsPaused(false);

      // Speak the current segment again
      if (
        segmentsRef.current.length > 0 &&
        currentSegmentIndex < segmentsRef.current.length
      ) {
        speakNextSegment(currentSegmentIndex, segmentsRef.current);
      }
    } else {
      console.warn(
        "[TTS Android Segmented] Attempted to resume when speech synthesis was not paused",
      );
    }
  }, [currentSegmentIndex, speakNextSegment]);

  // Function declarations to resolve circular dependencies
  const handleResumeRef = useRef<() => void>(() => {});

  // Main play function
  const handlePlay = useCallback(async () => {
    console.log("[TTS] Play button clicked");

    // Mark that user has interacted - critical for mobile browsers
    userInteractedRef.current = true;

    // If already speaking, do nothing
    if (isSpeaking && !isPaused) {
      console.log("[TTS] Already speaking, ignoring play request");
      return;
    }

    // If paused, resume instead of starting new speech
    if (isPaused && handleResumeRef.current) {
      console.log("[TTS] Resuming paused speech");
      handleResumeRef.current();
      return;
    }

    // For Android devices, use segmented speech for better compatibility
    if (isAndroid) {
      console.log("[TTS] Using segmented speech for Android");
      speakAndroidSegmented(textToSpeak);
      return;
    }

    try {
      console.log("[TTS] Starting new speech");

      // Get speech synthesis
      const synthesis = getSpeechSynthesis();
      if (!synthesis) {
        console.error("[TTS] Speech synthesis not available");
        return;
      }

      // First cancel any ongoing speech and wait for the cooldown to complete
      await cancelSpeech();

      // Update the last speak time
      lastSpeakTimeRef.current = Date.now();

      // Reset UI state
      setProgress(0);
      setElapsedTime(0);

      // Store the original full text for potential resume operations
      originalFullTextRef.current = textToSpeak;

      // Create a fresh utterance
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Set essential properties
      utterance.lang = "en-US"; // Default language

      // Set the selected voice if available
      if (voices.length > 0 && selectedVoiceURI) {
        const selectedVoice = voices.find(
          (voice) => voice.voiceURI === selectedVoiceURI,
        );
        if (selectedVoice) {
          console.log(`[TTS] Setting voice to: ${selectedVoice.name}`);
          utterance.voice = selectedVoice;
          // Use the voice's language if available
          utterance.lang = selectedVoice.lang || "en-US";
        }
      }

      // Set the rate
      utterance.rate = rate;

      // Set up event handlers
      utterance.onstart = () => {
        console.log("[TTS] Speech started");
        setIsSpeaking(true);
        setIsPaused(false);

        // Start timer to update elapsed time
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      };

      utterance.onend = () => {
        console.log("[TTS] Speech ended");
        setIsSpeaking(false);
        setIsPaused(false);
        setProgress(100); // Set to 100% when finished

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      utterance.onpause = () => {
        console.log("[TTS] Speech paused");
        setIsPaused(true);
      };

      utterance.onresume = () => {
        console.log("[TTS] Speech resumed");
        setIsPaused(false);
      };

      utterance.onboundary = (event) => {
        // Track the current character index for potential resume operations
        if (event.charIndex !== undefined) {
          lastCharIndexRef.current = event.charIndex;
        }
      };

      utterance.onerror = (event) => {
        console.error("[TTS] Speech synthesis error:", event.error);
        console.error("[TTS] Error details:", {
          error: event.error,
          errorMessage: getErrorMessage(event.error),
          charIndex: event.charIndex,
          elapsedTime: event.elapsedTime,
          utteranceTextLength: utterance.text.length,
          utteranceTextSample: utterance.text.substring(0, 50) + "...",
          utteranceLang: utterance.lang,
          utteranceRate: utterance.rate,
          utteranceVoice: utterance.voice ? utterance.voice.name : "default",
          engineState: {
            speaking: synthesis.speaking,
            paused: synthesis.paused,
            pending: synthesis.pending,
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });

        // Update UI state
        setIsSpeaking(false);
        setIsPaused(false);

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Store the utterance in the ref for potential pause/resume operations
      utteranceRef.current = utterance;

      // Estimate the duration for progress calculation
      const estimatedDuration = estimateDuration(textToSpeak, rate);
      setTotalDuration(estimatedDuration);

      // Speak
      synthesis.speak(utterance);
      console.log("[TTS] speak() called successfully");

      // Check if the utterance was actually queued
      if (!synthesis.speaking && !synthesis.pending) {
        console.warn(
          "[TTS] Warning: speak() called but utterance not queued (speaking=false, pending=false)",
        );
      }
    } catch (error) {
      console.error("[TTS] Error starting speech:", error);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [
    cancelSpeech,
    isAndroid,
    isPaused,
    isSpeaking,
    rate,
    selectedVoiceURI,
    speakAndroidSegmented,
    textToSpeak,
    voices,
  ]);

  // Function to pause speech
  const handlePause = useCallback(() => {
    console.log("[TTS] Pause button clicked");

    // For Android segmented speech, handle pause specially
    if (isAndroid && segmentedSpeechActiveRef.current) {
      console.log("[TTS Android Segmented] Pausing segmented speech");
      handlePauseSegmented();
      return;
    }

    // Get speech synthesis
    const synthesis = getSpeechSynthesis();
    if (!synthesis) return;

    // Only try to pause if actually speaking
    if (synthesis.speaking && !synthesis.paused) {
      console.log("[TTS] Pausing speech");
      synthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);

      // Pause the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      console.warn(
        "[TTS] Attempted to pause when speech synthesis was not speaking or already paused",
      );
    }
  }, [isAndroid, handlePauseSegmented]);

  // Function to resume speech
  const handleResume = useCallback(() => {
    console.log("[TTS] Resume button clicked");

    // For Android segmented speech, handle resume specially
    if (isAndroid && segmentedSpeechActiveRef.current) {
      console.log("[TTS Android Segmented] Resuming segmented speech");
      handleResumeSegmented();
      return;
    }

    // Get speech synthesis
    const synthesis = getSpeechSynthesis();
    if (!synthesis) return;

    // Only try to resume if actually paused
    if (synthesis.speaking && synthesis.paused) {
      console.log("[TTS] Resuming speech");
      synthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);

      // Resume the timer
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      }
    } else {
      console.warn(
        "[TTS] Attempted to resume when speech synthesis was not paused",
      );
    }
  }, [isAndroid, handleResumeSegmented]);

  // Update the handleResumeRef with the current handleResume function
  useEffect(() => {
    handleResumeRef.current = handleResume;
  }, [handleResume]);

  // Function to stop speech
  const handleStop = useCallback(() => {
    console.log("[TTS] Stop button clicked");

    // For Android segmented speech, handle stop specially
    if (isAndroid && segmentedSpeechActiveRef.current) {
      console.log("[TTS Android Segmented] Stopping segmented speech");
      stopSegmentedSpeech();
      return;
    }

    // Get speech synthesis
    const synthesis = getSpeechSynthesis();
    if (!synthesis) return;

    // Cancel any ongoing speech
    synthesis.cancel();
    console.log("[TTS] Speech cancelled");

    // Update UI state
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset elapsed time
    setElapsedTime(0);
  }, [isAndroid, stopSegmentedSpeech]);

  // Combined play/pause toggle function
  const handlePlayPause = useCallback(async () => {
    console.log("[TTS] Play/Pause toggle button clicked");

    // Mark that user has interacted - critical for mobile browsers
    userInteractedRef.current = true;

    // For Android segmented speech, handle pause/resume specially
    if (isAndroid && segmentedSpeechActiveRef.current) {
      if (isSpeaking && !isPaused) {
        // Pause the segmented speech
        console.log(
          "[TTS Android Segmented] Pausing segmented speech on pause request",
        );
        handlePauseSegmented();
      } else if (isPaused) {
        // Resume the segmented speech
        console.log(
          "[TTS Android Segmented] Resuming segmented speech on resume request",
        );
        handleResumeSegmented();
      } else {
        // If not speaking, start new segmented playback
        console.log(
          "[TTS Android Segmented] Starting new segmented playback from user gesture",
        );
        await handlePlay();
      }
      return;
    }

    // Standard play/pause toggle logic
    if (isSpeaking && !isPaused) {
      // If speaking, pause
      handlePause();
    } else if (isPaused) {
      // If paused, resume
      handleResume();
    } else {
      // If not speaking, start new playback
      await handlePlay();
    }
  }, [
    handlePause,
    handlePlay,
    handlePauseSegmented,
    handleResume,
    handleResumeSegmented,
    isAndroid,
    isPaused,
    isSpeaking,
  ]);

  // Function to handle voice change
  const handleVoiceChange = useCallback(
    (voiceURI: string) => {
      console.log(`[TTS] Voice changed to: ${voiceURI}`);
      setSelectedVoiceURI(voiceURI);

      // If currently speaking, restart with the new voice
      if (isSpeaking) {
        // For Android segmented speech, stop and restart
        if (isAndroid && segmentedSpeechActiveRef.current) {
          console.log(
            "[TTS Android Segmented] Stopping and restarting with new voice",
          );
          stopSegmentedSpeech();
          // Short delay before restarting
          setTimeout(() => {
            speakAndroidSegmented(textToSpeak);
          }, 100);
          return;
        }

        // For standard speech, try to resume from the current position
        if (
          utteranceRef.current &&
          lastCharIndexRef.current !== null &&
          originalFullTextRef.current
        ) {
          console.log(
            `[TTS] Restarting speech with new voice from position: ${lastCharIndexRef.current}`,
          );

          // Set flag to indicate a voice change is pending
          voiceChangePendingRef.current = true;
          voiceOrRateChangePendingRef.current = true;

          // Get speech synthesis
          const synthesis = getSpeechSynthesis();
          if (!synthesis) return;

          // Cancel current speech
          synthesis.cancel();
        }
      }
    },
    [
      isAndroid,
      isSpeaking,
      speakAndroidSegmented,
      stopSegmentedSpeech,
      textToSpeak,
    ],
  );

  // Function to handle rate change
  const handleRateChange = useCallback(
    (newRate: number) => {
      console.log(`[TTS] Rate changed to: ${newRate}`);
      setRate(newRate);

      // If currently speaking, restart with the new rate
      if (isSpeaking) {
        // For Android segmented speech, stop and restart
        if (isAndroid && segmentedSpeechActiveRef.current) {
          console.log(
            "[TTS Android Segmented] Stopping and restarting with new rate",
          );
          stopSegmentedSpeech();
          // Short delay before restarting
          setTimeout(() => {
            speakAndroidSegmented(textToSpeak);
          }, 100);
          return;
        }

        // For standard speech, try to resume from the current position
        if (
          utteranceRef.current &&
          lastCharIndexRef.current !== null &&
          originalFullTextRef.current
        ) {
          console.log(
            `[TTS] Restarting speech with new rate from position: ${lastCharIndexRef.current}`,
          );

          // Set flag to indicate a rate change is pending
          rateChangePendingRef.current = true;
          voiceOrRateChangePendingRef.current = true;

          // Get speech synthesis
          const synthesis = getSpeechSynthesis();
          if (!synthesis) return;

          // Cancel current speech
          synthesis.cancel();
        }
      }
    },
    [
      isAndroid,
      isSpeaking,
      speakAndroidSegmented,
      stopSegmentedSpeech,
      textToSpeak,
    ],
  );

  // Effect to detect mobile devices and set up speech synthesis
  useEffect(() => {
    // Detect mobile devices
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice =
      /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroidDevice = /android/i.test(userAgent);

    setIsMobile(isMobileDevice);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Check if speech synthesis is supported
    const synthesis = getSpeechSynthesis();
    setIsSupported(!!synthesis);

    // Load available voices
    const loadVoices = () => {
      if (synthesis) {
        const availableVoices = synthesis.getVoices();
        console.log(`[TTS] Loaded ${availableVoices.length} voices`);

        // Filter to only include English voices for simplicity
        const englishVoices = availableVoices.filter((voice) =>
          voice.lang.startsWith("en-"),
        );

        // If no English voices, use all voices
        const voicesToUse =
          englishVoices.length > 0 ? englishVoices : availableVoices;

        setVoices(voicesToUse);
        setVoicesLoaded(true);

        // Set a default voice if available
        if (voicesToUse.length > 0 && !selectedVoiceURI) {
          // Try to find a default voice
          const defaultVoice = voicesToUse.find((voice) => voice.default);
          if (defaultVoice) {
            console.log(`[TTS] Setting default voice: ${defaultVoice.name}`);
            setSelectedVoiceURI(defaultVoice.voiceURI);
          } else {
            // If no default voice, use the first one
            console.log(
              `[TTS] Setting first voice as default: ${voicesToUse[0].name}`,
            );
            setSelectedVoiceURI(voicesToUse[0].voiceURI);
          }
        }
      }
    };

    // Load voices initially
    loadVoices();

    // Set up event listener for voiceschanged event
    if (synthesis) {
      synthesis.addEventListener("voiceschanged", loadVoices);
    }

    // Clean up event listener
    return () => {
      if (synthesis) {
        synthesis.removeEventListener("voiceschanged", loadVoices);
      }

      // Cancel any ongoing speech
      if (synthesis && (synthesis.speaking || synthesis.pending)) {
        synthesis.cancel();
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedVoiceURI]);

  // Effect to set up Media Session API for better control when the screen is locked
  useEffect(() => {
    // Check if Media Session API is supported
    if ("mediaSession" in navigator) {
      console.log("[TTS] Media Session API is supported");

      // Set up media session action handlers
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("[TTS MediaSession] Play action triggered");
        if (isPaused && handleResumeRef.current) {
          handleResumeRef.current();
        } else if (!isSpeaking && !isPaused) {
          handlePlay();
        }
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("[TTS MediaSession] Pause action triggered");
        if (isSpeaking && !isPaused) {
          handlePause();
        }
      });

      navigator.mediaSession.setActionHandler("stop", () => {
        console.log("[TTS MediaSession] Stop action triggered");
        if (isSpeaking || isPaused) {
          handleStop();
        }
      });

      // Update media session metadata and playback state when speaking starts/stops
      if (isSpeaking) {
        // Set metadata with more descriptive information
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "Article Text-to-Speech",
          artist: document.title || "Text-to-Speech Player",
          album: "Web Speech API",
          // Optional: Add artwork if available
          // artwork: [
          //   { src: '/path-to-icon.png', sizes: '96x96', type: 'image/png' },
          // ]
        });

        // Update playback state to "playing"
        navigator.mediaSession.playbackState = "playing";
      } else if (isPaused) {
        // Update playback state to "paused" when paused
        navigator.mediaSession.playbackState = "paused";
      } else {
        // Update playback state to "none" when stopped
        navigator.mediaSession.playbackState = "none";
      }
    }

    return () => {
      // Clear media session action handlers when component unmounts
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("stop", null);

        // Reset playback state
        navigator.mediaSession.playbackState = "none";
      }
    };
  }, [handlePause, handlePlay, handleStop, isPaused, isSpeaking]);

  // Effect to handle voice or rate change
  useEffect(() => {
    // If a voice or rate change is pending and we have an utterance
    if (
      voiceOrRateChangePendingRef.current &&
      utteranceRef.current &&
      lastCharIndexRef.current !== null &&
      originalFullTextRef.current
    ) {
      const handleVoiceOrRateChange = () => {
        // Get speech synthesis
        const synthesis = getSpeechSynthesis();
        if (!synthesis) return;

        // Only proceed if the engine is not speaking or paused
        if (!synthesis.speaking && !synthesis.paused) {
          console.log(
            `[TTS] Resuming from character index: ${lastCharIndexRef.current}`,
          );

          // Reset the flag
          voiceOrRateChangePendingRef.current = false;
          rateChangePendingRef.current = false;
          voiceChangePendingRef.current = false;

          // Create a new utterance with the remaining text
          const remainingText = originalFullTextRef.current.substring(
            lastCharIndexRef.current || 0,
          );
          const newUtterance = new SpeechSynthesisUtterance(remainingText);

          // Set properties
          newUtterance.lang = "en-US";
          newUtterance.rate = rate;

          // Set the selected voice if available
          if (voices.length > 0 && selectedVoiceURI) {
            const selectedVoice = voices.find(
              (voice) => voice.voiceURI === selectedVoiceURI,
            );
            if (selectedVoice) {
              newUtterance.voice = selectedVoice;
              newUtterance.lang = selectedVoice.lang || "en-US";
            }
          }

          // Set up event handlers
          newUtterance.onstart = () => {
            console.log("[TTS] Resumed speech started");
            setIsSpeaking(true);
            setIsPaused(false);

            // Start timer to update elapsed time
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
              setElapsedTime((prev) => prev + 1);
            }, 1000);
          };

          newUtterance.onend = () => {
            console.log("[TTS] Resumed speech ended");
            setIsSpeaking(false);
            setIsPaused(false);
            setProgress(100);

            // Clear timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          };

          newUtterance.onboundary = (event) => {
            // Update the character index
            if (event.charIndex !== undefined) {
              // Add the offset from where we resumed
              lastCharIndexRef.current =
                (lastCharIndexRef.current || 0) + event.charIndex;
            }
          };

          // Store the utterance in the ref
          utteranceRef.current = newUtterance;

          // Speak
          synthesis.speak(newUtterance);
        }
      };

      // Add a small delay to ensure the engine has fully reset
      setTimeout(handleVoiceOrRateChange, 100);
    }
  }, [rate, selectedVoiceURI, voices]);

  // If speech synthesis is not supported, show a message
  if (isSupported === false) {
    return (
      <div className={cn("flex flex-col space-y-2 p-4", className)}>
        <p className="text-red-500 dark:text-red-400">
          Speech synthesis is not supported in your browser.
        </p>
      </div>
    );
  }

  // If speech synthesis support is still being determined, show a loading message
  if (isSupported === null) {
    return (
      <div className={cn("flex flex-col space-y-2 p-4", className)}>
        <p className="text-neutral-500 dark:text-neutral-400">
          Checking speech synthesis support...
        </p>
      </div>
    );
  }

  // Main component UI
  return (
    <div className={cn("flex flex-col space-y-4 p-4", className)}>
      {/* Progress bar */}
      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-none overflow-hidden">
        <div
          className="h-full bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-4">
        {/* Top row: Play/Pause, Stop, and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Play/Pause button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              aria-label={
                isSpeaking && !isPaused ? "Pause" : isPaused ? "Resume" : "Play"
              }
            >
              {isSpeaking && !isPaused ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </Button>

            {/* Stop button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleStop}
              aria-label="Stop"
              disabled={!isSpeaking && !isPaused}
              className={cn(
                !isSpeaking && !isPaused && "opacity-50 cursor-not-allowed",
              )}
            >
              <Square size={18} />
            </Button>
          </div>

          {/* Time display */}
          <div className="flex items-center space-x-2 text-sm text-neutral-800 dark:text-neutral-300">
            <Clock
              size={14}
              className="text-neutral-800 dark:text-neutral-300"
            />
            <span>{formatTime(elapsedTime)}</span>
            <span>/</span>
            <span>
              {totalDuration > 0 ? formatTime(totalDuration) : "--:--"}
            </span>
          </div>
        </div>

        {/* Middle row: Voice selection */}
        <div className="flex items-center space-x-2">
          <Volume2
            size={18}
            className="text-neutral-800 dark:text-neutral-300"
          />
          <Select value={selectedVoiceURI} onValueChange={handleVoiceChange}>
            <SelectTrigger className="flex-1 h-8">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bottom row: Rate control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-800 dark:text-neutral-300 min-w-[40px]">
            {rate.toFixed(1)}x
          </span>
          <Slider
            value={[rate]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={(values) => handleRateChange(values[0])}
            className="flex-1"
          />
        </div>

        {/* Status message */}
        <div className="text-sm text-neutral-800 dark:text-neutral-300">
          {isSpeaking ? (
            isPaused ? (
              <p>Paused. Press Play to continue.</p>
            ) : (
              <p>Speaking...</p>
            )
          ) : (
            <p>Ready to speak.</p>
          )}

          {/* Platform-specific messages */}
          <div className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">
            {isMobile ? (
              isAndroid ? (
                isSegmentedSpeechActive ? (
                  <p>
                    On Android, text is spoken in segments for better
                    compatibility. You can pause and resume playback at any
                    time.
                  </p>
                ) : isSpeaking ? (
                  <p>
                    On Android devices, changing voice or speed will stop
                    playback. Press Play to continue with new settings.
                  </p>
                ) : (
                  <p>
                    On Android, text will be spoken in segments for better
                    compatibility.
                  </p>
                )
              ) : isSpeaking ? (
                <p>
                  On mobile devices, changing voice or speed will stop playback.
                  Press Play to continue with new settings.
                </p>
              ) : (
                <p>Press Play to start listening to this article.</p>
              )
            ) : (
              <p>Use the controls to adjust voice and speed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
