"use client";

import { useState } from "react";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

export default function SocialBlock() {
  const [ripples, setRipples] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      color: string;
    }>
  >([]);

  let rippleCount = 0;

  const addRipple = (e: React.MouseEvent, color: string) => {
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    // Get position relative to the button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: rippleCount++,
      x,
      y,
      color,
    };

    setRipples((prevRipples) => [...prevRipples, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prevRipples) =>
        prevRipples.filter((ripple) => ripple.id !== newRipple.id),
      );
    }, 1000);
  };

  return (
    <div className="social-links flex space-x-3">
      <a
        href="https://twitter.com/ItsIshanParihar"
        target="_blank"
        rel="noopener noreferrer"
        className="cosmic-social-button relative overflow-hidden w-10 h-10 flex items-center justify-center rounded-none text-neutral-700 dark:text-neutral-300 bg-transparent dark:bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all duration-300"
        onClick={(e) => addRipple(e, "text-blue-400")}
      >
        <FaTwitter className="text-lg" />
        {ripples.map(
          (ripple) =>
            ripple.color === "text-blue-400" && (
              <span
                key={ripple.id}
                className="ripple-effect text-blue-400"
                style={{
                  left: ripple.x - 50,
                  top: ripple.y - 50,
                }}
              />
            ),
        )}
      </a>

      <a
        href="https://github.com/ishanparihar"
        target="_blank"
        rel="noopener noreferrer"
        className="cosmic-social-button relative overflow-hidden w-10 h-10 flex items-center justify-center rounded-none text-neutral-700 dark:text-neutral-300 bg-transparent dark:bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all duration-300"
        onClick={(e) => addRipple(e, "text-purple-400")}
      >
        <FaGithub className="text-lg" />
        {ripples.map(
          (ripple) =>
            ripple.color === "text-purple-400" && (
              <span
                key={ripple.id}
                className="ripple-effect text-purple-400"
                style={{
                  left: ripple.x - 50,
                  top: ripple.y - 50,
                }}
              />
            ),
        )}
      </a>

      <a
        href="https://linkedin.com/in/ishanparihar"
        target="_blank"
        rel="noopener noreferrer"
        className="cosmic-social-button relative overflow-hidden w-10 h-10 flex items-center justify-center rounded-none text-neutral-700 dark:text-neutral-300 bg-transparent dark:bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all duration-300"
        onClick={(e) => addRipple(e, "text-indigo-400")}
      >
        <FaLinkedin className="text-lg" />
        {ripples.map(
          (ripple) =>
            ripple.color === "text-indigo-400" && (
              <span
                key={ripple.id}
                className="ripple-effect text-indigo-400"
                style={{
                  left: ripple.x - 50,
                  top: ripple.y - 50,
                }}
              />
            ),
        )}
      </a>
    </div>
  );
}
