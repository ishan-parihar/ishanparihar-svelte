"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

type ActiveReplyContextType = {
  activeReplyId: string | null;
  setActiveReplyId: (id: string | null) => void;
  registerReplyForm: (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => void;
  unregisterReplyForm: (id: string) => void;
};

const ActiveReplyContext = createContext<ActiveReplyContextType | undefined>(
  undefined,
);

type ReplyFormRefs = {
  [key: string]: React.RefObject<HTMLDivElement | null>;
};

export function ActiveReplyProvider({ children }: { children: ReactNode }) {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const replyFormRefs = useRef<ReplyFormRefs>({});

  // Handle click outside to close active reply form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!activeReplyId) return;

      const activeFormRef = replyFormRefs.current[activeReplyId];
      if (
        activeFormRef?.current &&
        !activeFormRef.current.contains(event.target as Node)
      ) {
        setActiveReplyId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeReplyId]);

  const registerReplyForm = (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    replyFormRefs.current[id] = ref;
  };

  const unregisterReplyForm = (id: string) => {
    delete replyFormRefs.current[id];
  };

  return (
    <ActiveReplyContext.Provider
      value={{
        activeReplyId,
        setActiveReplyId,
        registerReplyForm,
        unregisterReplyForm,
      }}
    >
      {children}
    </ActiveReplyContext.Provider>
  );
}

export function useActiveReply() {
  const context = useContext(ActiveReplyContext);
  if (context === undefined) {
    throw new Error(
      "useActiveReply must be used within an ActiveReplyProvider",
    );
  }
  return context;
}
