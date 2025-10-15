"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PhoneOff,
  Ticket,
  UserPlus,
  Archive,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatSession } from "@/lib/supportService";

interface ChatActionsProps {
  session: ChatSession;
  onEndSession: () => void;
  onCreateTicket: () => void;
  onTransferChat?: () => void;
  onArchiveChat?: () => void;
}

export function ChatActions({
  session,
  onEndSession,
  onCreateTicket,
  onTransferChat,
  onArchiveChat,
}: ChatActionsProps) {
  const [isEndingSession, setIsEndingSession] = useState(false);

  const handleEndSession = async () => {
    try {
      setIsEndingSession(true);
      await onEndSession();
    } catch (error) {
      console.error("Error ending session:", error);
    } finally {
      setIsEndingSession(false);
    }
  };

  const isActive = session.status === "active";

  return (
    <div className="flex items-center justify-between">
      {/* Session Status */}
      <div className="flex items-center space-x-2">
        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
          {session.status}
        </Badge>

        {session.ticket_id && (
          <Badge variant="outline" className="text-xs">
            Ticket Created
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Create Ticket */}
        {!session.ticket_id && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCreateTicket}
            className="text-xs"
          >
            <Ticket className="h-3 w-3 mr-1" />
            Create Ticket
          </Button>
        )}

        {/* End Session */}
        {isActive && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="text-xs">
                <PhoneOff className="h-3 w-3 mr-1" />
                End Chat
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Chat Session</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end this chat session? This action
                  cannot be undone. The customer will be notified that the chat
                  has ended.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEndSession}
                  disabled={isEndingSession}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isEndingSession ? "Ending..." : "End Chat"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Transfer Chat */}
            {isActive && onTransferChat && (
              <DropdownMenuItem onClick={onTransferChat}>
                <UserPlus className="h-4 w-4 mr-2" />
                Transfer Chat
              </DropdownMenuItem>
            )}

            {/* Archive Chat */}
            {!isActive && onArchiveChat && (
              <DropdownMenuItem onClick={onArchiveChat}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Chat
              </DropdownMenuItem>
            )}

            {/* View Customer Profile */}
            <DropdownMenuItem
              onClick={() => {
                // This would open customer info panel or navigate to customer profile
                console.log("View customer profile");
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Customer Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Report Issue */}
            <DropdownMenuItem
              onClick={() => {
                // This would open a form to report issues with the chat
                console.log("Report issue");
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
