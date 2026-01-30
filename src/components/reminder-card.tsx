'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FileText, MapPin, BellRing, BrainCircuit, Loader, Frown } from 'lucide-react';
import { getKycAssistanceAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/context/language-context';
import { cscLocationsData } from '@/lib/csc-locations';
import { Separator } from './ui/separator';

type ReminderCardProps = {
  title: string;
  description: string;
  documents?: string[];
};

export default function ReminderCard({
  title,
  description,
  documents,
}: ReminderCardProps) {
  const [isPending, startTransition] = useTransition();
  const [assistance, setAssistance] = useState('');
  const [city, setCity] = useState('jaipur');
  const [cscLocations, setCscLocations] = useState(cscLocationsData.jaipur || []);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleKycAssistance = () => {
    startTransition(async () => {
      const result = await getKycAssistanceAction(language === 'kn' ? 'en' : language);
      if (result.success) {
        setAssistance(result.data || '');
        toast({
          title: t('aiAssistanceReady'),
          description: t('aiAssistanceReadyDesc'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('aiError'),
          description: result.error,
        });
      }
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handleSearch = () => {
    const locations = cscLocationsData[city.toLowerCase() as keyof typeof cscLocationsData] || [];
    setCscLocations(locations);
  };

  const handleViewOnMap = (name: string, address: string) => {
    const query = `${name}, ${address}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`;
    window.open(url, '_blank');
  };

  return (
    <Card className='bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80'>
      <CardHeader className='flex flex-row items-start gap-4 space-y-0'>
        <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-200 text-amber-700 flex-shrink-0'>
          <BellRing className='h-6 w-6' />
        </div>
        <div className='flex-1'>
          <CardTitle className='font-headline text-xl text-stone-900'>
            {title}
          </CardTitle>
          <CardDescription className='text-stone-600'>
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {title === 'e-KYC Reminder' && (
          <div className='space-y-4'>
            <Button
              onClick={handleKycAssistance}
              disabled={isPending}
              className='w-full bg-amber-100 text-amber-800 hover:bg-amber-200/80'
            >
              {isPending ? (
                <Loader className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <BrainCircuit className='mr-2 h-4 w-4' />
              )}
              {t('getAiAssistance')}
            </Button>
            {assistance && (
              <Alert className='bg-amber-50/50 border-amber-200'>
                <AlertTitle className='font-bold text-amber-800'>
                  {t('aiKycGuide')}
                </AlertTitle>
                <AlertDescription>
                  <pre className='whitespace-pre-wrap font-body text-sm text-stone-700'>
                    {assistance}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
            
            <Separator className="my-6 bg-stone-200/80" />

            <h4 className="font-bold text-stone-800 -mb-2">{t("nearbyCsc")}</h4>
            <div className='flex gap-2 pt-2'>
              <Input
                type='text'
                value={city}
                onChange={handleCityChange}
                placeholder={t('sourcingPricingPage.inCity')}
                className='w-full bg-white/50 border-stone-300 focus:ring-amber-500'
              />
              <Button
                onClick={handleSearch}
                className='bg-amber-500 text-white hover:bg-amber-600'
              >
                {t('sourcingPricingPage.find')}
              </Button>
            </div>
            
            <ul className='space-y-3 pt-2'>
              {cscLocations.length > 0 ? (
                cscLocations.map((loc, i) => (
                  <li
                    key={i}
                    className='flex flex-col gap-2 p-3 rounded-lg bg-stone-50/50 border border-stone-200/80'
                  >
                    <div className='flex items-start gap-4'>
                      <MapPin className='h-5 w-5 flex-shrink-0 text-amber-600 mt-1' />
                      <div>
                        <p className='font-semibold text-stone-700'>{loc.name}</p>
                        <p className='text-sm text-stone-500'>{loc.address}</p>
                        <p className='text-sm text-stone-500'>Hours: {loc.hours}</p>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleViewOnMap(loc.name, loc.address)}
                      className='w-full mt-2 border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700'
                    >
                      <MapPin className='mr-2 h-4 w-4' />
                      {t('sourcingPricingPage.map')}
                    </Button>
                  </li>
                ))
              ) : (
                <div className="text-center py-8">
                  <Frown className="mx-auto h-10 w-10 text-stone-400" />
                  <p className="mt-4 text-stone-600 font-semibold">{t('sourcingPricingPage.noPlacesFound')}</p>
                  <p className="text-sm text-stone-500">{t('sourcingPricingPage.tryDifferentSearch')}</p>
                </div>
              )}
            </ul>
          </div>
        )}
        {documents && (
          <ul className='space-y-3'>
            {documents.map((doc, i) => (
              <li key={i} className='flex items-center gap-4'>
                <FileText className='h-5 w-5 flex-shrink-0 text-amber-600' />
                <span className='text-stone-700'>{t(doc)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
