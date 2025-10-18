<script lang="ts">
  import { user } from '$lib/stores/user';
  import Avatar from '$lib/components/ui/avatar.svelte';
  import AvatarImage from '$lib/components/ui/AvatarImage.svelte';
  import AvatarFallback from '$lib/components/ui/AvatarFallback.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import AlertDialog from '$lib/components/ui/alert-dialog.svelte';
  import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
  import DropdownMenuTrigger from '$lib/components/ui/DropdownMenuTrigger.svelte';
  import DropdownMenuContent from '$lib/components/ui/DropdownMenuContent.svelte';
  import Tooltip from '$lib/components/ui/tooltip.svelte';
  import CommentForm from './CommentForm.svelte';
  import CommentItem from './CommentItem.svelte'; // Self-import for recursive use
  import { MoreVertical, Trash2, Flag, Edit, Check, X, KeyboardIcon, Dot } from 'lucide-svelte';
  import { relativeTime } from '$lib/utils';

  let {
    comment,
    blogPostId,
    onCommentAdded,
    depth = 0,
    maxDepth = 5,
  } = $props();

  let isCollapsed = $state(false);
  let isEditing = $state(false);
  let editedContent = $state(comment.content);
  let showDeleteDialog = $state(false);
  let showReplyForm = $state(false);

  const timeAgo = relativeTime(comment.created_at);

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  function handleReplyClick() {
    showReplyForm = !showReplyForm;
  }

  function handleReplySubmitted() {
    showReplyForm = false;
    onCommentAdded();
  }

  function handleCancelReply() {
    showReplyForm = false;
  }

  function handleDeleteComment() {
    // TODO: Implement delete comment
    showDeleteDialog = false;
  }

  function handleEditComment() {
    // TODO: Implement edit comment
    isEditing = false;
  }
  

</script>

<div class={`pl-${depth * 5}`}>
  <div class="relative">
       {#if depth > 0}
        <div 
          class="absolute top-0 bottom-0 w-[2px] border-gray-300 dark:border-gray-600 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" 
          style="left: 8px;" 
          onclick={toggleCollapse}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCollapse(); }}
          role="button"
          tabindex="0"
        ></div>
       <div class="absolute w-4 h-[20px] border-gray-300 dark:border-gray-600 opacity-60" style="top: 10px; left: 8px; border-bottom-width: 1px; border-left-width: 1px; border-bottom-left-radius: 6px;"></div>
     {/if}
    <div class="flex items-start gap-1.5 mb-1 pl-6">
      <div class="flex-1 pt-0.5 min-w-0">
        <div class="flex items-center gap-1 text-xs mb-0.5">
          <Avatar class="h-5 w-5 mr-1 relative z-10">
            <AvatarImage src={comment.user_picture} alt={comment.user_name} />
            <AvatarFallback class="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <span class="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{comment.user_name || 'Anonymous'}</span>
          <Dot size={12} class="text-gray-500 dark:text-gray-400 shrink-0" />
          <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">{timeAgo}</span>
        </div>
        <div>
          {#if comment.is_deleted}
            <div class="mt-0.5 text-sm text-gray-500 dark:text-gray-400 italic">
              {comment.deleted_by_user ? "user deleted this message" : "comment removed by moderator"}
            </div>
          {:else}
            <div class="mt-0.5 text-sm text-gray-800 dark:text-gray-100 break-words">{comment.content}</div>
          {/if}
          {#if !comment.is_deleted}
            <div class="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {#if $user}
                 <Button onclick={handleReplyClick} variant="ghost" size="sm" class="h-6 px-2 text-xs font-medium">Reply</Button>
              {:else}
                 <Button variant="ghost" size="sm" class="h-6 px-2 text-xs font-medium" onclick={() => { /* TODO: open auth modal */ }}>Sign in to reply</Button>
              {/if}
              {#if comment.replies && comment.replies.length > 0}
                 <Button onclick={toggleCollapse} variant="ghost" size="sm" class="h-6 px-2 text-xs font-medium">
                  {isCollapsed ? `[+] ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}` : '[-]'}
                </Button>
              {/if}
                 {#if $user}
                   <DropdownMenu>
                     <DropdownMenuTrigger>
                       <Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex items-center justify-center relative z-10">
                         <MoreVertical class="h-3 w-3" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent>
                       {#if $user.email === comment.user_email}
                          <button onclick={() => { showDeleteDialog = true; }} class="text-red-600 dark:text-red-400 w-full text-left px-2 py-1.5 text-sm rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-900"><Trash2 class="h-3.5 w-3.5 mr-2 inline-block" /> Delete</button>
                          <button onclick={() => { isEditing = true; }} class="w-full text-left px-2 py-1.5 text-sm rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-900"><Edit class="h-3.5 w-3.5 mr-2 inline-block" /> Edit</button>
                       {:else}
                          <button onclick={() => {}} class="w-full text-left px-2 py-1.5 text-sm rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-900"><Flag class="h-3.5 w-3.5 mr-2 inline-block" /> Report</button>
                       {/if}
                     </DropdownMenuContent>
                   </DropdownMenu>
                 {/if}
            </div>
          {/if}
          {#if showReplyForm && !comment.is_deleted}
            <div class="mt-1.5">
              <CommentForm {blogPostId} parentId={comment.id} onCommentAdded={handleReplySubmitted} onCancel={handleCancelReply} isReply={true} />
            </div>
          {/if}
          {#if isEditing && !comment.is_deleted}
            <div class="mt-1.5">
              <div class="space-y-2">
                <div class="relative">
                  <Textarea bind:value={editedContent} class="min-h-[100px] text-sm" />
                  <div class="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 flex items-center pointer-events-none">
                    <KeyboardIcon class="h-3 w-3 mr-1" />
                    <span>Ctrl+Enter to save</span>
                  </div>
                </div>
                <div class="flex justify-end gap-2">
                   <Button size="sm" variant="secondary" onclick={() => isEditing = false} class="h-8 text-xs font-medium"><X class="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                   <Button size="sm" variant="default" onclick={handleEditComment} class="h-8 text-xs font-medium"><Check class="h-3.5 w-3.5 mr-1" /> Save</Button>
                </div>
              </div>
            </div>
          {/if}
           {#if comment.replies && comment.replies.length > 0 && !isCollapsed}
             <div class="mt-1.5">
               {#each comment.replies as reply}
                 <CommentItem comment={reply} {blogPostId} {onCommentAdded} depth={depth + 1} {maxDepth} />
               {/each}
             </div>
           {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm" style:display={showDeleteDialog ? 'block' : 'none'}>
    <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-none md:w-full">
      <h2 class="text-lg font-semibold">Delete Comment?</h2>
      <p class="text-sm text-muted-foreground">This action cannot be undone. It will mark the comment as deleted.</p>
      <div class="flex justify-end gap-2 mt-4">
         <Button variant="secondary" onclick={() => showDeleteDialog = false}>Cancel</Button>
         <Button variant="destructive" onclick={handleDeleteComment}>Delete</Button>
      </div>
    </div>
  </div>
</div>
