'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Copy,
  Download,
  Facebook,
  Instagram,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { GeneratedOutput } from './types';

type OutputDisplayProps = {
  data: GeneratedOutput;
  onReset: () => void;
};

type SocialPlatform = 'instagram' | 'facebook' | 'whatsapp';

export default function OutputDisplay({ data, onReset }: OutputDisplayProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<SocialPlatform>('instagram');
  const { toast } = useToast();

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrentSetIndex(api.selectedScrollSnap());
    };

    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  // Simplified data access
  const currentDesignSet = data.designSets[currentSetIndex];

  const socialContent = {
    instagram: data.textOutputs.instagram,
    facebook: data.textOutputs.facebook,
    whatsapp: data.textOutputs.whatsapp,
  };

  let currentText = '';
  let currentHashtags = '';

  if (activeTab === 'instagram') {
    currentText = socialContent.instagram.caption;
    currentHashtags = socialContent.instagram.hashtags.join(' ');
  } else if (activeTab === 'facebook' && socialContent.facebook) {
    currentText = socialContent.facebook.post;
  } else if (activeTab === 'whatsapp' && socialContent.whatsapp) {
    currentText = socialContent.whatsapp.message;
  }

  const handleCopy = () => {
    const textToCopy = `${currentText}\n\n${currentHashtags}`;
    navigator.clipboard.writeText(textToCopy.trim());
    toast({
      title: 'Copied to clipboard!',
      description: `Your ${activeTab} content is ready to be pasted.`,
    });
  };

  const handleDownload = async () => {
    if (!currentDesignSet) return;
    toast({
      title: 'Starting download...',
      description: `Downloading ${currentDesignSet.images.length} images.`,
    });
    for (const [index, imageUrl] of currentDesignSet.images.entries()) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${currentDesignSet.theme.replace(/\s/g, '')}${index + 1
          }.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Download failed for image:', imageUrl, error);
        toast({
          variant: 'destructive',
          title: 'Download failed',
          description: `Could not download image ${index + 1}.`,
        });
      }
    }
  };

  const handleShare = (platform: SocialPlatform) => {
    const textToShare = `${currentText}\n\n${currentHashtags}`.trim();

    let shareUrl = '';

    if (platform === 'instagram') {
      shareUrl = 'https://www.instagram.com/';
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        'https://example.com' // Placeholder URL
      )}&quote=${encodeURIComponent(textToShare)}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        textToShare
      )}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getShareButtonForPlatform = (platform: SocialPlatform) => {
    const commonProps = {
      className:
        'font-headline w-full bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all',
      onClick: () => handleShare(platform),
    };
    const platformDetails = {
      instagram: { Icon: Instagram, label: 'Share on Instagram' },
      facebook: { Icon: Facebook, label: 'Share on Facebook' },
      whatsapp: { Icon: MessageSquare, label: 'Share on WhatsApp' },
    };

    const details = platformDetails[platform];

    return (
      <Button {...commonProps}>
        <details.Icon className="mr-2" /> {details.label}
      </Button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-headline text-3xl text-amber-700">
          Your Post is Ready!
        </h2>
        <p className="font-body text-stone-600 mt-1">
          Choose a design, copy the text, and share your creation.
        </p>
      </div>

      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {data.designSets.map((designSet, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-headline text-2xl text-stone-900 mb-4">
                    {designSet.theme}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {designSet.images.map((imgSrc, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative aspect-square rounded-lg overflow-hidden shadow-md"
                      >
                        <Image
                          src={imgSrc}
                          alt={`${designSet.theme} design ${imgIndex + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                          priority={imgIndex === 0}
                          unoptimized={true} // Assuming the AI might not return standard image sizes
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12 bg-white/70 hover:bg-white border-amber-300 text-amber-600 hover:text-amber-700" />
        <CarouselNext className="hidden md:flex -right-12 bg-white/70 hover:bg-white border-amber-300 text-amber-600 hover:text-amber-700" />
      </Carousel>

      <Card className="shadow-lg bg-white/70 backdrop-blur-lg border border-stone-200/80">
        <CardContent className="p-4 md:p-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as SocialPlatform)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-stone-100 h-12">
              <TabsTrigger
                value="instagram"
                className="font-headline text-stone-600 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md h-10"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </TabsTrigger>
              <TabsTrigger
                value="facebook"
                className="font-headline text-stone-600 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md h-10"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </TabsTrigger>
              <TabsTrigger
                value="whatsapp"
                className="font-headline text-stone-600 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md h-10"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 p-4 min-h-[200px] bg-stone-50/50 rounded-md border border-stone-200/80">
              <TabsContent value="instagram" className="font-body text-stone-700 space-y-4">
                <p className="whitespace-pre-wrap">
                  {socialContent.instagram.caption}
                </p>
                <p className="text-sm text-amber-600">
                  {socialContent.instagram.hashtags.join(' ')}
                </p>
              </TabsContent>
              <TabsContent value="facebook" className="font-body text-stone-700">
                <p className="whitespace-pre-wrap">
                  {socialContent.facebook?.post}
                </p>
              </TabsContent>
              <TabsContent value="whatsapp" className="font-body text-stone-700">
                <p className="whitespace-pre-wrap">
                  {socialContent.whatsapp?.message}
                </p>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            <div className="lg:col-span-1 sm:col-span-2">
              {getShareButtonForPlatform(activeTab)}
            </div>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="font-headline border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
            >
              <Copy className="mr-2" /> Copy Text
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="font-headline border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
            >
              <Download className="mr-2" /> Save Design Set
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button
          variant="ghost"
          onClick={onReset}
          className="font-headline text-stone-500 hover:text-amber-700 hover:bg-amber-100"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Start Over
        </Button>
      </div>

      <div className="mt-12 border-t border-stone-200 pt-8">
        <h3 className="font-headline text-2xl text-amber-700 mb-6 text-center">
          Helpful Tutorials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'instagram' && (
            <>
              <div className="space-y-2">
                <h4 className="font-headline text-lg text-stone-700">
                  How to Create an Account
                </h4>
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/WK_ICsc9am8"
                    title="How to Create an Instagram Account"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-headline text-lg text-stone-700">
                  How to Post on Instagram
                </h4>
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/mI_Ycumremk"
                    title="How to Post on Instagram"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'facebook' && (
            <>
              <div className="space-y-2">
                <h4 className="font-headline text-lg text-stone-700">
                  How to Create an Account
                </h4>
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/EYgKPSC32Po"
                    title="How to Create an Facebook Account"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-headline text-lg text-stone-700">
                  How to Post on Facebook
                </h4>
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/e4rdyntP0jw"
                    title="How to Post on Facebook"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-2 md:col-span-2 md:w-1/2 md:mx-auto">
              <h4 className="font-headline text-lg text-stone-700 text-center">
                WhatsApp Business Tutorial
              </h4>
              <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/YI2qPPP-3OY"
                  title="WhatsApp Business Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
