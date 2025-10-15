"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Link,
  Loader2,
} from "lucide-react";
import { useTypingIndicator } from "@/hooks/useChatSSE";

interface MessageComposerProps {
  onSendMessage: (content: string, attachments?: any[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  sessionId?: string;
}

export function MessageComposer({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  sessionId = "",
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Typing indicator
  const { startTyping, stopTyping } = useTypingIndicator(sessionId);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    adjustTextareaHeight();

    // Handle typing indicators
    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return;

    try {
      setIsSending(true);
      stopTyping();

      // Process attachments if any
      const attachmentData =
        attachments.length > 0
          ? await processAttachments(attachments)
          : undefined;

      await onSendMessage(message, attachmentData);

      // Clear form
      setMessage("");
      setAttachments([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const processAttachments = async (files: File[]): Promise<any[]> => {
    // In a real implementation, you would upload files to a storage service
    // For now, we'll just return file metadata
    return files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      // In production, this would be the uploaded file URL
      url: URL.createObjectURL(file),
    }));
  };

  const insertFormatting = (format: "bold" | "italic" | "link") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);

    let formattedText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case "link":
        formattedText = selectedText ? `[${selectedText}](url)` : "[text](url)";
        cursorOffset = selectedText ? formattedText.length - 4 : 1;
        break;
    }

    const newMessage =
      message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + formattedText.length - cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-muted px-2 py-1 rounded text-xs"
            >
              <Paperclip className="h-3 w-3" />
              <span className="truncate max-w-20">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-1 mb-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => insertFormatting("bold")}
              className="h-6 w-6 p-0"
            >
              <Bold className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => insertFormatting("italic")}
              className="h-6 w-6 p-0"
            >
              <Italic className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => insertFormatting("link")}
              className="h-6 w-6 p-0"
            >
              <Link className="h-3 w-3" />
            </Button>

            <div className="flex-1" />

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="h-6 w-6 p-0"
            >
              <Paperclip className="h-3 w-3" />
            </Button>
          </div>

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          size="sm"
          className="h-10 w-10 p-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Character Count */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{message.length}/1000</span>
        {message.length > 900 && (
          <span className="text-orange-500">
            {1000 - message.length} characters remaining
          </span>
        )}
      </div>
    </div>
  );
}
