'use client';

import { Trophy } from 'lucide-react';
import Image from 'next/image';
import { ArtworkCard } from '@/components/artwork-card';
import { useArtworks } from '@/context/artwork-context';
import { useLanguage } from '@/context/language-context';

export default function ChallengesPage() {
  const { artworks } = useArtworks();
  const { t, language, setLanguage } = useLanguage();

  // Filter challenge-tagged artworks
  const challengeArtworks = artworks.filter(artwork =>
    artwork.tags.includes('challenge')
  );

  // Current challenge info
  const currentChallenge = {
    title: t('challenges.currentChallenge.title'),
    description: t('challenges.currentChallenge.description'),
    imageUrl: 'https://picsum.photos/1200/400?random=100',
    aiHint: 'city plants',
  };

  const demoArtworks = [
    {
      id: 1001,
      title: 'Green Future City',
      description: 'A futuristic eco-friendly city with rooftop gardens.',
      imageUrl: 'https://picsum.photos/400/400?random=201',
      tags: ['challenge'],
      artist: 'Aarav Sharma',
      isUserSubmission: false,
      type: 'image',
      likes: 15,
      commentsCount: 3,
    },
    {
      id: 1002,
      title: 'Nature Meets Architecture',
      description: 'Buildings blending with giant trees and rivers.',
      imageUrl: 'https://picsum.photos/400/400?random=202',
      tags: ['challenge'],
      artist: 'Isha Verma',
      isUserSubmission: false,
      type: 'image',
      likes: 22,
      commentsCount: 5,
    },
    {
      id: 1003,
      title: 'Urban Jungle',
      description: 'A busy street transformed into a lush garden.',
      imageUrl: 'https://picsum.photos/400/400?random=203',
      tags: ['challenge'],
      artist: 'Rohan Patel',
      isUserSubmission: false,
      type: 'image',
      likes: 18,
      commentsCount: 2,
    },
  ];

  // If no real submissions, show demo
  const displayArtworks =
    challengeArtworks.length > 0 ? challengeArtworks : demoArtworks;

  return (
    <div>
      {/* Language Switcher */}
      <div className='flex justify-end p-4'>
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className='px-4 py-2 border rounded-lg text-sm'
        >
          {language === 'en' ? 'हिन्दी' : 'English'}
        </button>
      </div>

      {/* Challenge Header */}
      <div className='relative mb-12 bg-secondary/50'>
        <div className='absolute inset-0'>
          <Image
            src={currentChallenge.imageUrl}
            alt={currentChallenge.title}
            fill
            className='object-cover opacity-20'
            data-ai-hint={currentChallenge.aiHint}
          />
        </div>
        <div className='container relative py-16 sm:py-24 text-center'>
          <Trophy className='mx-auto h-12 w-12 text-primary mb-4' />
          <h1 className='text-4xl sm:text-5xl font-headline font-bold'>
            {t('challenges.pageTitle')}
          </h1>
          <h2 className='text-2xl sm:text-3xl font-headline text-primary/90 mt-2'>
            {currentChallenge.title}
          </h2>
          <p className='text-muted-foreground mt-4 max-w-3xl mx-auto text-base sm:text-lg'>
            {currentChallenge.description}
          </p>
        </div>
      </div>

      {/* Submissions */}
      <div className='container pb-8'>
        <h3 className='text-3xl font-headline font-semibold mb-8 text-center'>
          {t('challenges.submissionsTitle')}
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-5 duration-500'>
          {displayArtworks.map(artwork => (
            <div key={artwork.id} className='flex flex-col'>
              <ArtworkCard artwork={artwork} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
