// src/components/utils/AnimateOnScroll.tsx
"use client";

import { useInView } from "react-intersection-observer";
import { ReactNode, Children, cloneElement, isValidElement } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  // How much of the element should be in view before triggering (0 to 1)
  threshold?: number;
  // Trigger the animation only once
  triggerOnce?: boolean;
}

export const AnimateOnScroll = ({
  children,
  threshold = 0.1,
  triggerOnce = true,
}: AnimateOnScrollProps) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  });

  // We need to pass the `ref` and the `inView` status to the child component.
  // We iterate over children and clone them with the new props.
  return (
    <>
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          // This is a common pattern to inject props into a child component.
          // We add a 'ref' for the observer and an 'inView' boolean prop.
          return cloneElement(child, { ref, inView } as any);
        }
        return child;
      })}
    </>
  );
};
