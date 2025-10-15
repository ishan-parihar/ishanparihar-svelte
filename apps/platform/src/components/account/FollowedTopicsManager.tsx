"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Check, Plus, X, ArrowLeft } from "lucide-react";
import { getBlogCategories, blogQueryKeys } from "@/queries/blogQueries";
import { api } from "@/lib/trpc-client";
import {
  userQueryKeys,
  getUserFollowedTopics,
  updateFollowedTopics,
} from "@/queries/userQueries";
import Link from "next/link";
import { toast } from "sonner";

export function FollowedTopicsManager() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const userEmail = session?.user?.email;
  const userId = session?.user?.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("following");

  // Use tRPC for categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    api.blog.getCategories.useQuery(undefined, {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    });

  // tRPC mutation for toggling followed topics
  const toggleTopicMutation = api.user.toggleFollowedTopic.useMutation({
    onSuccess: () => {
      // Invalidate and refetch the followed topics data
      refetchFollowedTopics();
    },
    onError: (error) => {
      console.error("Failed to toggle topic:", error);
      toast.error("Failed to update topic preference");
    },
  });

  // React Query for followed topics
  const {
    data: followedTopicsData,
    isLoading: followedTopicsLoading,
    refetch: refetchFollowedTopics,
  } = useQuery({
    queryKey: userQueryKeys.followedTopics(userEmail),
    queryFn: getUserFollowedTopics,
    enabled: status === "authenticated" && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoize followedTopics to prevent unnecessary re-renders
  const followedTopics = useMemo(() => {
    return followedTopicsData?.followed_topics || [];
  }, [followedTopicsData?.followed_topics]);

  // Transform and filter categories
  const allCategories = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) {
      return [];
    }

    // tRPC returns array of strings directly
    const uniqueCategories = [
      ...new Set(
        (categoriesData as string[])
          .filter(Boolean)
          .filter((cat: string) => cat !== "All Categories"),
      ),
    ];

    return uniqueCategories;
  }, [categoriesData]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return allCategories;
    return allCategories.filter((category: string) =>
      category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allCategories, searchTerm]);

  // Separate followed and unfollowed topics
  const followedFilteredTopics = useMemo(() => {
    return filteredCategories.filter((topic: string) =>
      followedTopics.includes(topic),
    );
  }, [filteredCategories, followedTopics]);

  const unfollowedFilteredTopics = useMemo(() => {
    return filteredCategories.filter(
      (topic: string) => !followedTopics.includes(topic),
    );
  }, [filteredCategories, followedTopics]);

  // Toggle following a topic
  const toggleFollowTopic = async (topic: string) => {
    if (!session || !userId) {
      toast.error("Please sign in to manage topics");
      return;
    }

    try {
      const isFollowing = followedTopics.includes(topic);
      const action = isFollowing ? "remove" : "add";

      // Use tRPC mutation instead of direct API call
      await toggleTopicMutation.mutateAsync({
        topic: topic,
        action: action,
      });

      // Refetch followed topics data
      await refetchFollowedTopics();

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.followedTopics(userEmail),
      });

      toast.success(`${isFollowing ? "Unfollowed" : "Followed"} ${topic}`);
    } catch (error) {
      console.error("Error updating followed topics:", error);
      toast.error("Failed to update topic. Please try again.");
    }
  };

  if (status === "loading" || categoriesLoading || followedTopicsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-neutral-200 dark:border-neutral-800 rounded-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-none border-b border-neutral-200 dark:border-neutral-800">
          <TabsTrigger
            value="following"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white rounded-none"
          >
            Following ({followedTopics.length})
          </TabsTrigger>
          <TabsTrigger
            value="discover"
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white rounded-none"
          >
            Discover ({unfollowedFilteredTopics.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="mt-6">
          <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white">
                Topics You Follow
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followedFilteredTopics.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {searchTerm
                      ? "No followed topics match your search."
                      : "You're not following any topics yet."}
                  </p>
                  <Button
                    onClick={() => setActiveTab("discover")}
                    className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Discover Topics
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {followedFilteredTopics.map((topic: string) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors"
                    >
                      <span className="font-medium text-neutral-900 dark:text-white flex-1 truncate pr-2">
                        {topic}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFollowTopic(topic)}
                        className="text-xs px-2 py-1 h-7 border-neutral-300 dark:border-neutral-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400 rounded-none"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Unfollow
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white">
                Discover New Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unfollowedFilteredTopics.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {searchTerm
                      ? "No topics match your search."
                      : "You're following all available topics!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unfollowedFilteredTopics.map((topic: string) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors"
                    >
                      <span className="font-medium text-neutral-900 dark:text-white flex-1 truncate pr-2">
                        {topic}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFollowTopic(topic)}
                        className="text-xs px-2 py-1 h-7 border-neutral-300 dark:border-neutral-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:border-green-700 dark:hover:text-green-400 rounded-none"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
