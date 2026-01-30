"use client";

import { useState, useTransition } from "react";
import type { Event } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";
import { findEventsAction } from "@/lib/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/context/language-context";

// ---------------------------------------------------------
// LOGO PATH
// ---------------------------------------------------------
const DEFAULT_LOGO_PATH = "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png";

// ---------------------------------------------------------
// DEMO DATA (LOCAL EVENTS) — INSTANT ON PAGE LOAD
// ---------------------------------------------------------
const DEMO_LOCAL_EVENTS: Event[] = [
  {
    name: "Jaipur Literature Festival",
    date: "January 23-27, 2026",
    location: "Jaipur, Diggi Palace",
    link: "https://jaipurliteraturefestival.org",
  },
  {
    name: "Jodhpur RIFF (Rajasthan International Folk Festival)",
    date: "October 26-30, 2026",
    location: "Jodhpur, Mehrangarh Fort",
    link: "https://www.jodhpurriff.org",
  },
  {
    name: "Shilpgram Utsav",
    date: "December 21-31, 2026",
    location: "Udaipur, Shilpgram (West Zone Cultural Centre)",
    link: "https://wzccindia.com/shilpgram-utsav/",
  },
  {
    name: "Pushkar Fair (Pushkar Mela)",
    date: "October 29 - November 4, 2026",
    location: "Pushkar, Rajasthan",
    link: "https://www.tourism.rajasthan.gov.in/pushkar-mela.html",
  },
  {
    name: "Handicraft & Art Exhibition at Jawahar Kala Kendra",
    date: "March 10-15, 2026",
    location: "Jaipur, Jawahar Kala Kendra",
    link: "https://jkkart.org",
  },
];


// ---------------------------------------------------------
// DEMO DATA (NATIONAL EVENTS) — INSTANT ON PAGE LOAD
// ---------------------------------------------------------
const DEMO_NATIONAL_EVENTS: Event[] = [
  {
    name: "IHGF Delhi Fair (Spring) 2026",
    date: "February 19-23, 2026",
    location: "India Expo Centre & Mart, Greater Noida, Delhi NCR",
    link: "https://ihgfdelhifair.in",
  },
  {
    name: "Kala Ghoda Arts Festival 2026",
    date: "February 1-9, 2026",
    location: "Kala Ghoda Precinct, Fort, Mumbai",
    link: "https://kalaghodaassociation.com",
  },
  {
    name: "Surajkund International Crafts Mela 2026",
    date: "February 1-16, 2026",
    location: "Surajkund, Faridabad, Haryana",
    link: "https://surajkundmelaauthority.in",
  },
  {
    name: "Hyderabad Artisan Bazaar 2026",
    date: "March 7-9, 2026",
    location: "HITEX Exhibition Center, Hyderabad",
    link: "https://www.hitex.co.in",
  },
  {
    name: "Chennai Craft & Textiles Expo 2026",
    date: "April 18-20, 2026",
    location: "Chennai Trade Centre, Chennai",
    link: "https://www.chennaitradecentre.org",
  },
];


// ---------------------------------------------------------

export default function EventsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [isFindingEvents, startFindingEvents] = useTransition();
  const [isFindingLocalEvents, startFindingLocalEvents] = useTransition();

  // Show demo data immediately
  const [localEvents, setLocalEvents] = useState<Event[]>(DEMO_LOCAL_EVENTS);
  const [events, setEvents] = useState<Event[]>(DEMO_NATIONAL_EVENTS);

  const [localEventState, setLocalEventState] = useState<string>("Rajasthan");
  const [localEventCountry, setLocalEventCountry] = useState<string>("India");
  const [eventCountry, setEventCountry] = useState<string>("India");

  const languageLabelMap: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    kn: "Kannada",
  };
  const languageLabel = languageLabelMap[language] || language;

  // ---------------------------------------------------------
  // Handle National Events
  // ---------------------------------------------------------
  const handleFindEvents = () => {
    setEvents([]); // Clear + show loader
    startFindingEvents(async () => {
      try {
        const result = await findEventsAction({
          country: eventCountry,
          language,
          languageLabel,
          logoUrl: DEFAULT_LOGO_PATH,
        });

        if ((result as any).error) {
          toast({
            variant: "destructive",
            title: t("eventsPage.error"),
            description: (result as any).error,
          });
        } else {
          setEvents((result as any).events || []);
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: t("eventsPage.error"),
          description: err?.message || String(err),
        });
      }
    });
  };

  // ---------------------------------------------------------
  // Handle Local Events
  // ---------------------------------------------------------
  const handleFindLocalEvents = () => {
    setLocalEvents([]); // Clear + show loader
    startFindingLocalEvents(async () => {
      try {
        const result = await findEventsAction({
          country: localEventCountry,
          state: localEventState,
          language,
          languageLabel,
          logoUrl: DEFAULT_LOGO_PATH,
        });

        if ((result as any).error) {
          toast({
            variant: "destructive",
            title: t("eventsPage.error"),
            description: (result as any).error,
          });
        } else {
          setLocalEvents((result as any).events || []);
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: t("eventsPage.error"),
          description: err?.message || String(err),
        });
      }
    });
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  const renderEventsTable = (
    list: Event[],
    loading: boolean,
    emptyMessage: string
  ) => (
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={4} className="text-center h-24">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
          </TableCell>
        </TableRow>
      ) : list.length > 0 ? (
        list.map((event, i) => (
          <TableRow key={i} className="border-stone-200/80">
            <TableCell className="font-medium text-stone-800">
              {event.name}
            </TableCell>
            <TableCell className="text-stone-600">{event.date}</TableCell>
            <TableCell className="text-stone-600">{event.location}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              >
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  {t("eventsPage.register")}
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} className="text-center h-24 text-stone-500">
            {emptyMessage}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  return (
    <div className="grid grid-cols-1 gap-6 flex-grow p-4 md:p-8 bg-gradient-to-b from-[#FBF9F6] to-amber-50">
      {/* ----------------------- LOCAL EVENTS CARD ----------------------- */}
      <Card className="flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-stone-900">
            {t("eventsPage.findLocalEvents")}
          </CardTitle>
          <CardDescription className="text-stone-600">
            {t("eventsPage.findLocalEventsDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow">
          <div className="flex flex-wrap items-end gap-2 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>{t("eventsPage.stateRegion")}</Label>
              <Input
                value={localEventState}
                onChange={(e) => setLocalEventState(e.target.value)}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>{t("eventsPage.country")}</Label>
              <Input
                value={localEventCountry}
                onChange={(e) => setLocalEventCountry(e.target.value)}
              />
            </div>

            <Button
              onClick={handleFindLocalEvents}
              disabled={isFindingLocalEvents}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white"
            >
              {isFindingLocalEvents ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {t("eventsPage.findLocalEventsButton")}
            </Button>
          </div>

          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("eventsPage.event")}</TableHead>
                  <TableHead>{t("eventsPage.date")}</TableHead>
                  <TableHead>{t("eventsPage.location")}</TableHead>
                  <TableHead className="text-right">
                    {t("eventsPage.link")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              {renderEventsTable(
                localEvents,
                isFindingLocalEvents,
                t("eventsPage.noLocalEvents")
              )}
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ----------------------- NATIONAL EVENTS CARD ----------------------- */}
      <Card className="flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-stone-900">
            {t("eventsPage.findNationalEvents")}
          </CardTitle>
          <CardDescription className="text-stone-600">
            {t("eventsPage.findNationalEventsDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow">
          <div className="flex flex-wrap items-end gap-2 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>{t("eventsPage.country")}</Label>
              <Input
                value={eventCountry}
                onChange={(e) => setEventCountry(e.target.value)}
              />
            </div>

            <Button
              onClick={handleFindEvents}
              disabled={isFindingEvents}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white"
            >
              {isFindingEvents ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {t("eventsPage.findNationalEventsButton")}
            </Button>
          </div>

          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("eventsPage.event")}</TableHead>
                  <TableHead>{t("eventsPage.date")}</TableHead>
                  <TableHead>{t("eventsPage.location")}</TableHead>
                  <TableHead className="text-right">
                    {t("eventsPage.link")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              {renderEventsTable(
                events,
                isFindingEvents,
                t("eventsPage.noNationalEvents")
              )}
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
