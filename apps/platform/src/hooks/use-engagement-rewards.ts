"use client";

import { useState, useEffect } from "react";

interface EngagementReward {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  timestamp?: number;
}

export const useEngagementRewards = () => {
  const [rewards, setRewards] = useState<EngagementReward[]>([
    {
      id: "first_click",
      name: "First Interaction",
      description: "You've started exploring the site!",
      achieved: false
    },
    {
      id: "scroll_50",
      name: "Deep Explorer",
      description: "You've scrolled halfway through the page",
      achieved: false
    },
    {
      id: "hover_elements",
      name: "Curious Explorer",
      description: "You've interacted with multiple elements",
      achieved: false
    },
    {
      id: "visit_blog",
      name: "Knowledge Seeker",
      description: "You've visited the blog section",
      achieved: false
    },
    {
      id: "complete_section",
      name: "Journey Completer",
      description: "You've explored a complete section",
      achieved: false
    }
  ]);
  
  const [interactionCount, setInteractionCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Track user interactions
  useEffect(() => {
    const handleInteraction = () => {
      setInteractionCount(prev => prev + 1);
    };
    
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(scrollPercent);
    };
    
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // Update rewards based on interactions
  useEffect(() => {
    setRewards(prev => prev.map(reward => {
      switch (reward.id) {
        case "first_click":
          if (!reward.achieved && interactionCount > 0) {
            return { ...reward, achieved: true, timestamp: Date.now() };
          }
          break;
        case "scroll_50":
          if (!reward.achieved && scrollProgress >= 50) {
            return { ...reward, achieved: true, timestamp: Date.now() };
          }
          break;
        case "hover_elements":
          if (!reward.achieved && interactionCount >= 5) {
            return { ...reward, achieved: true, timestamp: Date.now() };
          }
          break;
        default:
          return reward;
      }
      return reward;
    }));
  }, [interactionCount, scrollProgress]);
  
  // Get recently achieved rewards
  const getRecentRewards = () => {
    return rewards.filter(reward => reward.achieved && reward.timestamp && 
      Date.now() - reward.timestamp < 5000); // Last 5 seconds
  };
  
  // Check if user has achieved a specific reward
  const hasReward = (rewardId: string) => {
    return rewards.some(reward => reward.id === rewardId && reward.achieved);
  };
  
  return {
    rewards,
    interactionCount,
    scrollProgress,
    getRecentRewards,
    hasReward
  };
};