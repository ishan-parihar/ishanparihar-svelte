import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthorDetails {
  id: string;
  display_name: string;
  profile_picture_url: string | null;
  role: string;
}

interface BlogAuthorServerProps {
  author: string;
  author_details?: AuthorDetails | null;
  date?: string;
}

export function BlogAuthorServer({
  author = "Anonymous",
  author_details = null,
  date,
}: BlogAuthorServerProps) {
  // Get the author name - prefer author_details if available, fallback to author string
  const authorName = author_details?.display_name || author || "Anonymous";

  // Get author role - prefer author_details if available, otherwise use a generic role
  const getAuthorRole = () => {
    if (author_details?.role) {
      return author_details.role === "admin"
        ? "Content Creator"
        : author_details.role;
    }

    // Fallback role detection based on name (for backward compatibility)
    if (authorName.includes("Harper")) return "Personal Growth Coach";
    if (authorName.includes("Maya"))
      return "Collective Consciousness Researcher";
    if (authorName.includes("Sage")) return "Spiritual Practitioner";
    if (authorName.includes("Anonymous")) return "Guest Writer";
    return "Cosmic Explorer";
  };

  // Get initials for avatar fallback (up to 2 characters)
  const getInitials = () => {
    if (!authorName || typeof authorName !== "string") return "A";

    const nameParts = authorName.split(" ").filter(Boolean);
    if (nameParts.length === 0) return "A";

    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
  };

  // Get avatar URL - prefer profile_picture_url from author_details if available
  const getAvatarUrl = () => {
    // If we have author details with a profile picture, use it
    if (author_details?.profile_picture_url) {
      return author_details.profile_picture_url;
    }

    // Otherwise generate a deterministic avatar (for backward compatibility)
    if (authorName === "Anonymous") return "";

    // Use a seed based on the name to always get the same image for the same author
    const seed = authorName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6ccfe,c9b6fb,f5c6ff&backgroundType=gradientLinear`;
  };

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="border-2 border-primary/20 h-10 w-10">
        <AvatarImage
          src={getAvatarUrl()}
          alt={authorName}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{authorName}</p>
        <p className="text-xs text-muted-foreground">{getAuthorRole()}</p>
      </div>
    </div>
  );
}
