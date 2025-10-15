"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Crown,
  UserCheck,
  Clock,
  LogIn,
  ShieldAlert,
  Flag,
  AlertTriangle,
} from "lucide-react";

interface UserProfileCardProps {
  user: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    custom_picture?: string;
    role: string;
    has_active_membership: boolean;
    newsletter_subscribed: boolean;
    manually_unsubscribed: boolean;
    provider?: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
    login_count?: number;
    suspended?: boolean;
    suspended_at?: string | null;
    suspended_by?: string | null;
    suspension_reason?: string | null;
    suspension_expires_at?: string | null;
    spam_score?: number;
    is_spam_flagged?: boolean;
    spam_flagged_at?: string | null;
    spam_flagged_by?: string | null;
  };
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getProviderBadgeColor = (provider?: string) => {
    switch (provider) {
      case "google":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "github":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage
                src={user.custom_picture || user.picture || ""}
                alt={user.name || user.email}
              />
              <AvatarFallback className="text-xl font-semibold">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator dot */}
            <div
              className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background flex items-center justify-center ${
                user.suspended
                  ? "bg-red-500"
                  : user.is_spam_flagged
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
            >
              {user.suspended ? (
                <ShieldAlert className="h-3 w-3 text-white" />
              ) : user.is_spam_flagged ? (
                <Flag className="h-3 w-3 text-white" />
              ) : (
                <CheckCircle className="h-3 w-3 text-white" />
              )}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {user.name || "No name provided"}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                className={`${getRoleBadgeColor(user.role)} px-3 py-1`}
                variant="secondary"
              >
                <Shield className="h-3 w-3 mr-1.5" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>

              {user.provider && (
                <Badge
                  className={`${getProviderBadgeColor(user.provider)} px-3 py-1`}
                  variant="secondary"
                >
                  {user.provider.charAt(0).toUpperCase() +
                    user.provider.slice(1)}
                </Badge>
              )}

              {user.has_active_membership && (
                <Badge
                  className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-400 px-3 py-1"
                  variant="secondary"
                >
                  <Crown className="h-3 w-3 mr-1.5" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Account Status Alerts */}
        {(user.suspended || user.is_spam_flagged) && (
          <div className="space-y-4">
            {user.suspended && (
              <div className="relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30">
                <div className="absolute inset-0 bg-red-500/5 dark:bg-red-400/10"></div>
                <div className="relative p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-lg font-semibold text-red-900 dark:text-red-100">
                          Account Suspended
                        </h4>
                        <Badge
                          variant="destructive"
                          className="text-xs font-medium"
                        >
                          {user.suspension_expires_at
                            ? "Temporary"
                            : "Permanent"}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Reason:
                            </span>
                            <span className="text-red-700 dark:text-red-300">
                              {user.suspension_reason || "No reason provided"}
                            </span>
                          </div>
                          {user.suspended_at && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-red-800 dark:text-red-200">
                                Suspended:
                              </span>
                              <span className="text-red-700 dark:text-red-300">
                                {format(
                                  new Date(user.suspended_at),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Duration:
                            </span>
                            <span className="text-red-700 dark:text-red-300">
                              {user.suspension_expires_at
                                ? `Until ${format(new Date(user.suspension_expires_at), "MMM dd, yyyy")}`
                                : "Permanent"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {user.is_spam_flagged && (
              <div className="relative overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-900/30">
                <div className="absolute inset-0 bg-amber-500/5 dark:bg-amber-400/10"></div>
                <div className="relative p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                        <Flag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                          Flagged as Spam
                        </h4>
                        {user.spam_score && (
                          <Badge
                            variant={
                              user.spam_score >= 80
                                ? "destructive"
                                : user.spam_score >= 50
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs font-medium"
                          >
                            Score: {user.spam_score}/100
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          {user.spam_score && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-amber-800 dark:text-amber-200">
                                Risk Level:
                              </span>
                              <span
                                className={`font-medium ${
                                  user.spam_score >= 80
                                    ? "text-red-600 dark:text-red-400"
                                    : user.spam_score >= 50
                                      ? "text-orange-600 dark:text-orange-400"
                                      : "text-yellow-600 dark:text-yellow-400"
                                }`}
                              >
                                {user.spam_score >= 80
                                  ? "High"
                                  : user.spam_score >= 50
                                    ? "Medium"
                                    : "Low"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {user.spam_flagged_at && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-amber-800 dark:text-amber-200">
                                Flagged:
                              </span>
                              <span className="text-amber-700 dark:text-amber-300">
                                {format(
                                  new Date(user.spam_flagged_at),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/50 p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  user.newsletter_subscribed && !user.manually_unsubscribed
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {user.newsletter_subscribed && !user.manually_unsubscribed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                Newsletter
              </div>
              <div
                className={`text-xs font-medium mt-1 ${
                  user.newsletter_subscribed && !user.manually_unsubscribed
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {user.newsletter_subscribed && !user.manually_unsubscribed
                  ? "Subscribed"
                  : "Unsubscribed"}
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/50 p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                Joined
              </div>
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                {format(new Date(user.created_at), "MMM dd, yyyy")}
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/50 p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <LogIn className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                Total Logins
              </div>
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">
                {user.login_count || 0}
              </div>
            </div>
          </div>

          {user.last_login && (
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/50 p-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">
                  Last Login
                </div>
                <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">
                  {format(new Date(user.last_login), "MMM dd, yyyy")}
                </div>
              </div>
            </div>
          )}

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/50 p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/30">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                Last Updated
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                {format(new Date(user.updated_at), "MMM dd, yyyy")}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
