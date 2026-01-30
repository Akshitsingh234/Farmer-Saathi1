'use client';

import { artisanSchemes } from "@/lib/data";
import React, { useEffect, useState } from "react";

import AadhaarOcrCard from "./aadhaar-ocr-card";
import ApplicationForm from "./application-form";
import ProgressTracker from "./progress-tracker";
import ReminderCard from "./reminder-card";
import SchemeComparison from "./scheme-comparison";
import StatusChecklist from "./status-checklist";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppState } from "@/context/app-state-context";
import { useLanguage } from "@/context/language-context";
import { db } from "@/firebase/firestore";
import { useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Banknote,
  Briefcase,
  GitCompareArrows,
  Lightbulb,
  Rocket,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { SchemeCard } from "./scheme-card";

const benefitIcons: { [key: string]: React.ElementType } = {
  Recognition: Trophy,
  "Skill Upgradation": Briefcase,
  "Toolkit Incentive": Banknote,
  "Credit Support": Banknote,
  "Incentive for Digital Transaction": Lightbulb,
  "Marketing Support": TrendingUp,
  "Loan Facility": Banknote,
  "No Collateral": Banknote,
  "Significant Loan Amount": Banknote,
  Inclusive: Trophy,
};

const DEFAULT_AVATAR = "/b5db78fd-f64b-4589-b343-f53bcdd7d910.png";

export default function Dashboard() {
  const {
    stage,
    checklist,
    isFormOpen,
    setIsFormOpen,
    isFormSubmitted,
    isAdminApproved,
    handleFormSubmit,
    startApplication,
    selectedSchemeId,
    setSelectedSchemeId,
    isComparisonOpen,
    setIsComparisonOpen,
    comparisonScheme1Id,
    setComparisonScheme1Id,
    comparisonScheme2Id,
    setComparisonScheme2Id,
  } = useAppState();

  const { t } = useLanguage();

  const selectedScheme =
    artisanSchemes.find((s) => s.id === selectedSchemeId) || artisanSchemes[0];
  const comparisonScheme1 = artisanSchemes.find(
    (s) => s.id === comparisonScheme1Id
  );
  const comparisonScheme2 = artisanSchemes.find(
    (s) => s.id === comparisonScheme2Id
  );

  const { user } = useUser();
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      try {
        const profileDoc = doc(db, "profiles", user.uid);
        const snap = await getDoc(profileDoc);

        if (!mounted) return;

        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setProfile({
            uid: user.uid,
            artisanName: user.displayName ?? "",
            avatarUrl: user.photoURL ?? DEFAULT_AVATAR,
            email: user.email ?? "",
            mobileNumber: (user as any)?.phoneNumber ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (!mounted) return;
        setProfile({
          uid: user.uid,
          artisanName: user.displayName ?? "",
          avatarUrl: user.photoURL ?? DEFAULT_AVATAR,
          email: user.email ?? "",
          mobileNumber: (user as any)?.phoneNumber ?? "",
        });
      } finally {
        if (mounted) {
        }
      }
    };

    loadProfile();

    const onProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail ?? null;
      try {
        const eventUserId = detail?.artisanId;
        const aadhaarMasked = detail?.aadhaarMasked;

        if (eventUserId && eventUserId !== user.uid) return;

        if (aadhaarMasked) {
          setProfile((prev: any) => {
            if (!prev) return prev;
            return { ...prev, aadharMasked: aadhaarMasked };
          });
        }

        loadProfile();
      } catch (err) {
        console.error("profile:updated handler error", err);
        loadProfile();
      }
    };

    window.addEventListener("profile:updated", onProfileUpdated as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener(
        "profile:updated",
        onProfileUpdated as EventListener
      );
    };
  }, [user]);

  const getStatusBadge = () => {
    if (stage < 2)
      return (
        <Badge variant="outline" className="border-stone-400 text-stone-500">
          {t("statusNotStarted")}
        </Badge>
      );
    if (stage === 2 && !isAdminApproved)
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
          {t("statusPendingApproval")}
        </Badge>
      );
    if (stage >= 3)
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
          {t("statusActiveBeneficiary")}
        </Badge>
      );
    return null;
  };

  return (
    <div className="space-y-8 p-4 md:p-8 bg-gradient-to-b from-[#FBF9F6] to-amber-50">
      <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-stone-900">
            {t("schemeSelection")}
          </CardTitle>
          <CardDescription className="text-stone-600">
            {t("schemeSelectionDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select
            onValueChange={(v) => setSelectedSchemeId(v)}
            defaultValue={selectedSchemeId}
          >
            <SelectTrigger className="w-full bg-white/50 border-stone-300 focus:ring-amber-500">
              <SelectValue placeholder={t("selectScheme")} />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-lg border-stone-200">
              {artisanSchemes.map((scheme) => (
                <SelectItem key={scheme.id} value={scheme.id}>
                  {t(scheme.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setIsComparisonOpen(true)}
            className="border-amber-500 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
          >
            <GitCompareArrows className="mr-2 h-4 w-4" />
            {t("compareSchemes")}
          </Button>
        </CardContent>
      </Card>

      {selectedScheme && (
        <SchemeCard scheme={selectedScheme} onApply={startApplication} />
      )}

      <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl text-amber-700">
                {t("applicationJourney")}
              </CardTitle>
              <CardDescription className="text-stone-600">
                {t("applicationJourneyDesc")}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <ProgressTracker
            stages={selectedScheme.applicationStages}
            currentStage={stage}
          />
        </CardContent>
      </Card>

      <AadhaarOcrCard artisanId={profile?.uid ?? user?.uid ?? ""} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <StatusChecklist items={checklist} />

          {stage < 2 && !isFormSubmitted && (
            <Card className="bg-gradient-to-br from-amber-100 to-rose-200 text-center border border-amber-200/80 shadow-lg">
              <CardHeader>
                <h1 className="font-headline text-3xl font-bold text-amber-.700">
                  {t("title")}
                </h1>
                <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2 text-stone-900">
                  {t("readyToStart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-stone-700">{t("readyToStartDesc")}</p>
                <Button
                  size="lg"
                  onClick={startApplication}
                  className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {t("startNewApplication")}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-stone-900">
                {t("schemeBenefits")}
              </CardTitle>
              <CardDescription className="text-stone-600">
                {t("schemeBenefitsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {selectedScheme.benefits.map((benefit, index) => {
                  const Icon = benefitIcons[benefit.title] || Briefcase;
                  return (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="hover:bg-amber-50/50 hover:no-underline p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Icon className="h-5 w-5 text-amber-600" />
                          <span className="font-bold text-stone-800">
                            {t(benefit.title)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-stone-600 pt-2 pb-4 px-4">
                        {benefit.description}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <ReminderCard
            title={t("requiredDocs")}
            description={t("requiredDocsDesc")}
            documents={selectedScheme.requiredDocuments}
          />
          <ReminderCard
            title={t("eKycReminder")}
            description={t("eKycReminderDesc")}
          />
          
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-lg border-stone-200/80">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-amber-700">
              {t("newBeneficiaryReg")} for {t(selectedScheme.name)}
            </DialogTitle>
            <DialogDescription className="text-stone-600">
              {t("fillFormDesc")}
            </DialogDescription>
          </DialogHeader>

          <ApplicationForm
            userData={profile}
            onFormSubmit={handleFormSubmit}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-lg border-stone-200/80">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-amber-700">
              {t("compareSchemes")}
            </DialogTitle>
            <DialogDescription className="text-stone-600">
              {t("compareSchemesDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <Select
              onValueChange={setComparisonScheme1Id}
              defaultValue={comparisonScheme1Id}
            >
              <SelectTrigger className="bg-white/50 border-stone-300 focus:ring-amber-500">
                <SelectValue placeholder={t("selectScheme1")} />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-lg border-stone-200">
                {artisanSchemes.map((scheme) => (
                  <SelectItem
                    key={scheme.id}
                    value={scheme.id}
                    disabled={scheme.id === comparisonScheme2Id}
                  >
                    {t(scheme.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={setComparisonScheme2Id}
              defaultValue={comparisonScheme2Id}
            >
              <SelectTrigger className="bg-white/50 border-stone-300 focus:ring-amber-500">
                <SelectValue placeholder={t("selectScheme2")} />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-lg border-stone-200">
                {artisanSchemes.map((scheme) => (
                  <SelectItem
                    key={scheme.id}
                    value={scheme.id}
                    disabled={scheme.id === comparisonScheme1Id}
                  >
                    {t(scheme.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {comparisonScheme1 && comparisonScheme2 && (
            <SchemeComparison
              scheme1={comparisonScheme1}
              scheme2={comparisonScheme2}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
