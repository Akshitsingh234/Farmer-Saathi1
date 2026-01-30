"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Flag,
  FileText,
  Video,
} from "lucide-react";
import type { Artwork } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context"; // ✅

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(artwork.likes);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { toast } = useToast();

  const { t } = useLanguage(); // ✅ get translation helper

  const handleLike = () => {
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
  };

  const handleReport = () => {
    setIsReportDialogOpen(false);
    toast({
      title: t("toasts.reportSuccess.title"),
      description: `${t("toasts.reportSuccess.description1")}"${
        artwork.title
      }". ${t("toasts.reportSuccess.description2")}`,
    });
  };

  const renderMedia = () => {
    switch (artwork.type) {
      case "image":
        return (
          artwork.imageUrl && (
            <div className="aspect-[4/3] relative">
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint={artwork.aiHint}
              />
            </div>
          )
        );
      case "video":
        return (
          <div className="aspect-video relative bg-black">
            {artwork.videoUrl && (
              <video
                src={artwork.videoUrl}
                poster={artwork.imageUrl}
                controls
                className="w-full h-full"
              />
            )}
            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
              <Video className="h-4 w-4 text-white" />
            </div>
          </div>
        );
      case "text":
        return (
          <div className="aspect-[4/3] p-6 flex items-center justify-center bg-secondary/50">
            <FileText className="h-16 w-16 text-muted-foreground/50" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
        <CardHeader className="p-0">{renderMedia()}</CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-headline mb-1 leading-tight">
            {artwork.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("artworkCard.by")} {artwork.artist}
          </p>
          {artwork.type === "text" && artwork.content && (
            <p className="text-sm text-foreground/80 mt-3 line-clamp-3">
              {artwork.content}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {artwork.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-muted-foreground">
            <button
              onClick={handleLike}
              className="flex items-center space-x-1.5 hover:text-primary transition-colors focus:outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("artworkCard.likeAriaLabel")}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all",
                  isLiked ? "fill-red-500 text-red-500" : ""
                )}
              />
              <span className="text-sm font-medium">{likes}</span>
            </button>
            <div className="flex items-center space-x-1.5">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {artwork.commentsCount}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("artworkCard.shareAriaLabel")}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={t("artworkCard.moreOptionsAriaLabel")}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
                  <Flag className="mr-2 h-4 w-4" />
                  <span>{t("artworkCard.report")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("reportDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("reportDialog.description1")} "{artwork.title}"?{" "}
              {t("reportDialog.description2")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("reportDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("reportDialog.report")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
