"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MessageSquare,
  X,
  Send,
  User,
  Bot,
  Minimize2,
  Maximize2,
  Loader2,
  History,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  SupportMessage,
  ChatSession,
  formatTimeAgo,
} from "@/lib/supportService";

export function FloatingChatBubble() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Listen for custom events to open chat
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
      setActiveTab("current");
    };

    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  // Fetch customer's chat sessions for history using tRPC (for history tab)
  const { data: allChatHistoryData, refetch: refetchAllChatHistory } =
    api.support.getMyChatSessions.useQuery(
      {
        page: 1,
        limit: 50,
      },
      {
        enabled: !!session?.user && isOpen,
        refetchInterval: 30000, // Refetch every 30 seconds
      },
    );

  const chatHistory = allChatHistoryData?.sessions || [];
  const filteredChatHistory = chatHistory.filter(
    (chat: ChatSession) =>
      !searchTerm ||
      chat.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.admin?.name &&
        chat.admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.admin?.email &&
        chat.admin.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for existing active chat session using tRPC
  const { data: activeChatData, refetch: refetchActiveChats } =
    api.support.getMyChatSessions.useQuery(
      {
        page: 1,
        limit: 50,
        status: "active", // Only get active sessions
      },
      {
        enabled: !!session?.user && isOpen,
        refetchInterval: 30000, // Refetch every 30 seconds
      },
    );

  // Check for existing active chat session on mount
  useEffect(() => {
    if (!session?.user || !activeChatData) return;

    const activeSessions =
      activeChatData.sessions?.filter((s: any) => s.status === "active") || [];
    if (activeSessions.length > 0) {
      const activeSession = activeSessions[0];
      setChatSession(activeSession);
      // We'll handle the connection and history loading in a separate effect
    }
  }, [session, activeChatData]);

  // Get chat session details with messages using tRPC
  const { data: chatSessionData, refetch: refetchChatSession } =
    api.support.getChatSession.useQuery(
      { sessionId: chatSession?.id || "" },
      {
        enabled: !!chatSession?.id,
        refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
      },
    );

  // Update messages when chat session data changes
  useEffect(() => {
    if (chatSessionData?.messages) {
      setMessages(chatSessionData.messages);
      if (chatSessionData.messages.length > 0) {
        lastMessageIdRef.current =
          chatSessionData.messages[chatSessionData.messages.length - 1].id;
      }
    }
  }, [chatSessionData]);

  // Switch to a different chat session
  const switchToChatSession = async (session: ChatSession) => {
    // Set new session
    setChatSession(session);
    setMessages([]);
    setConnectionStatus("disconnected");

    // If session is active, connect to real-time updates
    if (session.status === "active") {
      connectToChat(session.id);
    }

    // Switch to current chat tab
    setActiveTab("current");

    toast.success(
      `Switched to chat session from ${formatTimeAgo(session.started_at)}`,
    );
  };

  // Start chat session mutation
  const startChatMutation = api.support.startChatSession.useMutation({
    onSuccess: (chatSession) => {
      setChatSession(chatSession);

      // Connect to real-time updates
      connectToChat(chatSession.id);

      toast.success(
        "Chat session started! You'll be connected with a support agent shortly.",
      );
    },
    onError: (error) => {
      console.error("Error starting chat:", error);
      toast.error(error.message || "Failed to start chat");
    },
    onSettled: () => {
      setIsStarting(false);
    },
  });

  // Start a new chat session
  const startChat = async () => {
    setIsStarting(true);

    startChatMutation.mutate({
      subject: "Customer Support Chat",
      initialMessage: "Hello, I need assistance with my account.",
    });
  };

  // Real-time updates are now handled by tRPC refetching
  // We can remove the SSE connection since tRPC handles real-time updates through polling
  const connectToChat = (sessionId: string) => {
    setConnectionStatus("connected");
    // Real-time updates are handled by the tRPC query refetching every 5 seconds
    // This provides a simpler and more reliable approach than SSE
  };

  // Send message mutation using tRPC
  const sendMessageMutation = api.support.sendChatMessage.useMutation({
    onSuccess: () => {
      // Message sent successfully, refetch chat session to get updated messages
      refetchChatSession();
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
      setNewMessage(newMessage); // Restore message on error
    },
    onSettled: () => {
      setIsSending(false);
    },
  });

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatSession || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    sendMessageMutation.mutate({
      sessionId: chatSession.id,
      content: messageContent,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    // Refetch chat history when opening
    refetchAllChatHistory();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setUnreadCount(0);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setConnectionStatus("disconnected");
  };

  // Don't show if user is not logged in
  if (!session?.user) {
    return null;
  }

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative group">
            <Button
              onClick={handleOpen}
              className="h-16 w-16 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-lg border-2 border-neutral-900 dark:border-white transition-all duration-300 group-hover:scale-105 relative"
            >
              <MessageSquare className="h-7 w-7" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs bg-red-600 text-white border-2 border-white dark:border-black"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-neutral-900 text-white text-xs px-3 py-2 whitespace-nowrap border border-neutral-700 dark:bg-white dark:text-black dark:border-neutral-300">
                Live Chat Support
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-white"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out transform ${
            isMinimized ? "w-80 h-16" : "w-96 h-[520px]"
          } animate-in slide-in-from-bottom-4 fade-in-0 duration-300`}
        >
          <Card className="h-full flex flex-col shadow-2xl border-2 border-neutral-900 dark:border-white bg-white dark:bg-neutral-900 overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <CardHeader className="p-4 bg-neutral-900 text-white dark:bg-white dark:text-black border-b border-neutral-700 dark:border-neutral-300">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 font-ui">
                  <MessageSquare className="h-4 w-4" />
                  Live Chat Support
                  {connectionStatus === "connected" && !isMinimized && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-800 border border-green-200"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      Online
                    </Badge>
                  )}
                  {connectionStatus === "connecting" && !isMinimized && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-200"
                    >
                      <Loader2 className="w-2 h-2 mr-1 animate-spin" />
                      Connecting
                    </Badge>
                  )}
                  {connectionStatus === "disconnected" &&
                    chatSession &&
                    !isMinimized && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-red-100 text-red-800 border border-red-200"
                      >
                        <AlertCircle className="w-2 h-2 mr-1" />
                        Offline
                      </Badge>
                    )}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {!isMinimized ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMinimize}
                      className="h-7 w-7 p-0 text-white hover:bg-neutral-700 dark:text-black dark:hover:bg-neutral-200 transition-colors"
                    >
                      <Minimize2 className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMaximize}
                      className="h-7 w-7 p-0 text-white hover:bg-neutral-700 dark:text-black dark:hover:bg-neutral-200 transition-colors"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-7 w-7 p-0 text-white hover:bg-red-600 dark:text-black dark:hover:bg-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0 bg-white dark:bg-neutral-900">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "current" | "history")
                  }
                  className="flex-1 flex flex-col"
                >
                  <div className="px-4 pt-4 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                    <TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-1">
                      <TabsTrigger
                        value="current"
                        className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-900 dark:data-[state=active]:text-white transition-all"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Current Chat
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-900 dark:data-[state=active]:text-white transition-all"
                      >
                        <History className="h-3 w-3" />
                        Chat History
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="current"
                    className="flex-1 flex flex-col mt-0 bg-white dark:bg-neutral-900"
                  >
                    {!chatSession ? (
                      // Chat start screen
                      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto">
                            <MessageSquare className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
                          </div>
                          <h3 className="font-semibold text-lg font-headings text-neutral-900 dark:text-white">
                            Start Live Chat
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs">
                            Connect with our support team for real-time
                            assistance with your questions.
                          </p>
                        </div>

                        <Button
                          onClick={startChat}
                          disabled={isStarting}
                          className="w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border-2 border-neutral-900 dark:border-white transition-all duration-200 font-medium"
                        >
                          {isStarting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Starting Chat...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Start New Chat
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Chat interface
                      <>
                        <ScrollArea className="flex-1 p-4 bg-neutral-50 dark:bg-neutral-800">
                          <div className="space-y-4">
                            {messages.length === 0 ? (
                              <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                                <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center mx-auto mb-3">
                                  <Bot className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-medium">
                                  Chat session started
                                </p>
                                <p className="text-xs mt-1">
                                  A support agent will join shortly
                                </p>
                              </div>
                            ) : (
                              messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.sender_type === "customer" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in-0 duration-200`}
                                >
                                  <div
                                    className={`max-w-[85%] p-3 border ${
                                      message.sender_type === "customer"
                                        ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white"
                                        : "bg-white text-neutral-900 border-neutral-200 dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <div
                                        className={`w-5 h-5 border flex items-center justify-center ${
                                          message.sender_type === "customer"
                                            ? "bg-white text-neutral-900 border-white dark:bg-black dark:text-white dark:border-black"
                                            : "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-600 dark:text-neutral-300 dark:border-neutral-500"
                                        }`}
                                      >
                                        {message.sender_type === "customer" ? (
                                          <User className="h-3 w-3" />
                                        ) : (
                                          <Bot className="h-3 w-3" />
                                        )}
                                      </div>
                                      <span className="text-xs font-semibold">
                                        {message.sender_name ||
                                          (message.sender_type === "customer"
                                            ? "You"
                                            : "Support Agent")}
                                      </span>
                                      <span className="text-xs opacity-70 ml-auto">
                                        {formatTimeAgo(message.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                      {message.content}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>

                        <div className="p-4 border-t-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                          <div className="flex gap-3">
                            <Input
                              placeholder="Type your message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              disabled={
                                isSending || connectionStatus !== "connected"
                              }
                              className="flex-1 border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                            />
                            <Button
                              onClick={sendMessage}
                              disabled={
                                !newMessage.trim() ||
                                isSending ||
                                connectionStatus !== "connected"
                              }
                              size="icon"
                              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border-2 border-neutral-900 dark:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {connectionStatus !== "connected" && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {connectionStatus === "connecting"
                                ? "Connecting to chat..."
                                : "Disconnected from chat"}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="history"
                    className="flex-1 flex flex-col mt-0 bg-white dark:bg-neutral-900"
                  >
                    <div className="p-4 space-y-4">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                        <Input
                          placeholder="Search chat sessions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                        />
                      </div>

                      {/* Chat History List */}
                      <ScrollArea className="flex-1 max-h-64">
                        <div className="space-y-2">
                          {filteredChatHistory.length === 0 ? (
                            <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto mb-3">
                                <History className="h-6 w-6" />
                              </div>
                              <p className="text-sm font-medium">
                                {searchTerm
                                  ? "No matching sessions"
                                  : "No chat history"}
                              </p>
                              <p className="text-xs mt-1">
                                {searchTerm
                                  ? "Try a different search term"
                                  : "Start your first chat to see history here"}
                              </p>
                            </div>
                          ) : (
                            filteredChatHistory.map((chat: ChatSession) => (
                              <div
                                key={chat.id}
                                className="p-3 border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:shadow-md hover:scale-[1.02] transform"
                                onClick={() => switchToChatSession(chat)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge
                                    variant={
                                      chat.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={`text-xs border ${
                                      chat.status === "active"
                                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                                        : "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600"
                                    }`}
                                  >
                                    {chat.status === "active" && (
                                      <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {chat.status === "ended" && (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {chat.status === "abandoned" && (
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {chat.status}
                                  </Badge>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                    {formatTimeAgo(chat.started_at)}
                                  </span>
                                </div>

                                {chat.admin && (
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Agent: {chat.admin.name || chat.admin.email}
                                  </p>
                                )}

                                {chat.last_message && (
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate bg-neutral-50 dark:bg-neutral-700 p-2 border border-neutral-200 dark:border-neutral-600">
                                    "{chat.last_message.content}"
                                  </p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>

                      {/* Start New Chat Button */}
                      <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-4">
                        <Button
                          onClick={() => {
                            setActiveTab("current");
                            if (!chatSession) {
                              startChat();
                            }
                          }}
                          className="w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border-2 border-neutral-900 dark:border-white transition-all duration-200 font-medium"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Start New Chat
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
