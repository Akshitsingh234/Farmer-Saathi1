"use client";

import { useRef, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Loader,
  ScanLine,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { extractCardDetailsAction, updateAadhaarAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Input } from "./ui/input";

type AadhaarOcrCardProps = {
  artisanId: string;
};

type OcrStatus = {
  loading: boolean;
  error: string | null;
  message: string | null;
  extractedNumber: string | null;
};

export default function AadhaarOcrCard({ artisanId }: AadhaarOcrCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOcrPending, startOcrTransition] = useTransition();
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>({
    loading: false,
    error: null,
    message: null,
    extractedNumber: null,
  });
  const { toast } = useToast();

  // DEV: local uploaded file path (per conversation). Server can transform this path to a URL if needed.
  // Use this only for dev/testing. Your server action should accept / transform it appropriately.
  const DEV_UPLOADED_AADHAAR_PATH = "/mnt/data/b5db78fd-f64b-4589-b343-f53bcdd7d910.png";

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const imageDataUri = reader.result as string;
      startOcrTransition(async () => {
        setOcrStatus({
          loading: true,
          error: null,
          message: "Analyzing document...",
          extractedNumber: null,
        });

        try {
          // run OCR (server action)
          const extractResult = await extractCardDetailsAction(imageDataUri);

          if (extractResult.success && extractResult.data) {
            const { aadhaarNumber, imageQuality } = extractResult.data;

            if (imageQuality?.isBlurry) {
              setOcrStatus({
                loading: false,
                error: "Image is too blurry. Please upload a clearer picture.",
                message: null,
                extractedNumber: null,
              });
              return;
            }

            if (imageQuality?.isDark) {
              setOcrStatus({
                loading: false,
                error: "Image is too dark. Please upload a picture with better lighting.",
                message: null,
                extractedNumber: null,
              });
              return;
            }

            if (aadhaarNumber) {
              // success: update UI immediately
              setOcrStatus({
                loading: false,
                error: null,
                message: "Aadhaar number extracted successfully!",
                extractedNumber: aadhaarNumber,
              });

              // Call server action to save Aadhaar (server should mask/store securely)
              // We pass an optional `fileUrl` param so server can map the dev local path -> real URL if needed.
              // In production this param can be omitted or be a public URL. Here we include the local dev path per conversation.
              const updateResult = await updateAadhaarAction(
                artisanId,
                aadhaarNumber
              );

              if (updateResult.success) {
                toast({
                  title: "Profile Updated",
                  description: "Aadhaar number has been saved to your profile.",
                });

                // Dispatch a global event so parent components can react (reload profile, refresh UI).
                const detail = {
                  artisanId,
                  aadhaarMasked: maskAadhaar(aadhaarNumber),
                };

                // send event
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("profile:updated", { detail }));
                }
              } else {
                toast({
                  variant: "destructive",
                  title: "Update Failed",
                  description: updateResult.error ?? "Failed to update profile.",
                });
              }
            } else {
              setOcrStatus({
                loading: false,
                error:
                  "Could not extract Aadhaar number. Please try again or enter it manually in the application form.",
                message: null,
                extractedNumber: null,
              });
            }
          } else {
            setOcrStatus({
              loading: false,
              error: extractResult.error || "Failed to process image.",
              message: null,
              extractedNumber: null,
            });
          }
        } catch (err: any) {
          console.error("OCR flow error:", err);
          setOcrStatus({
            loading: false,
            error: err?.message ?? "An unexpected error occurred.",
            message: null,
            extractedNumber: null,
          });
        }
      });
    };
  };

  function maskAadhaar(aadhaar: string | null) {
    if (!aadhaar) return "";
    const digits = aadhaar.replace(/\D/g, "");
    if (digits.length < 4) return "****";
    return "********" + digits.slice(-4);
  }

  return (
    // ## Updated Card Style ##
    <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl text-stone-900">
          {/* ## Updated Icon Color ## */}
          <ScanLine className="h-6 w-6 text-amber-700" />
          Update Aadhaar via OCR
        </CardTitle>
        <CardDescription className="text-stone-600">
          Upload a picture of your Aadhaar card to automatically update your
          profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ## Updated Button Style ## */}
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
          onClick={() => fileInputRef.current?.click()}
          disabled={isOcrPending}
        >
          {isOcrPending ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload Aadhaar Photo
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* ## Updated Alert Styles ## */}
        {isOcrPending && ocrStatus.message && (
          <Alert className="bg-blue-50/50 border-blue-200 text-blue-800">
            <Loader className="h-4 w-4 animate-spin text-blue-600" />
            <AlertTitle>Processing...</AlertTitle>
            <AlertDescription>{ocrStatus.message}</AlertDescription>
          </Alert>
        )}

        {ocrStatus.error && (
          <Alert
            variant="destructive"
            className="bg-red-50/50 border-red-200 text-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>OCR Error</AlertTitle>
            <AlertDescription>{ocrStatus.error}</AlertDescription>
          </Alert>
        )}

        {ocrStatus.extractedNumber && (
          <Alert className="bg-emerald-50/50 border-emerald-200 text-emerald-800">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="font-bold">Success!</AlertTitle>
            <AlertDescription>
              Your Aadhaar number has been extracted:{" "}
              <strong>{maskAadhaar(ocrStatus.extractedNumber)}</strong>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
