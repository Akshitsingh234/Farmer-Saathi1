"use client";

import { useAppState } from "@/context/app-state-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Inbox } from "lucide-react"; // Imported Inbox for empty state
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { Separator } from "@/components/ui/separator"; // Import Separator

// A helper component for a cleaner details layout
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => (
  <div>
    <p className="text-sm font-medium text-stone-500">{label}</p>
    <p className="text-lg font-semibold text-stone-800">{value || "N/A"}</p>
  </div>
);

export default function AdminPage() {
  const { isFormSubmitted, isAdminApproved, handleAdminApproval, formData } =
    useAppState();
  const { toast } = useToast();
  const { t } = useLanguage();

  const onApprove = () => {
    handleAdminApproval(true);
    toast({
      title: t("applicationApproved"),
      description: t("applicationApprovedDesc"),
    });
  };

  const onReject = () => {
    handleAdminApproval(false); // We'll assume this sets the status to 'Rejected'
    toast({
      variant: "destructive",
      title: t("applicationRejected"),
      description: t("applicationRejectedDesc"),
    });
  };

  return (
    // The main page inherits the gradient background from the layout
    <main className="flex-1 p-4 md:p-8">
      <div className="space-y-8">
        {/* --- Title Card --- */}
        <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-amber-700">
              {t("adminApprovalPanel")}
            </CardTitle>
            <CardDescription className="text-stone-600">
              {t("adminApprovalPanelDesc")}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* --- Content --- */}
        {!isFormSubmitted ? (
          // ## Beautiful Empty State ##
          <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-stone-700">
                {t("noApplications")}
              </p>
              <p className="text-stone-500">
                New submissions will appear here for review.
              </p>
            </CardContent>
          </Card>
        ) : (
          // ## Application Details Card ##
          <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg transition-all duration-300 hover:border-amber-300/80">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-stone-900">
                    {t("applicationFrom").replace(
                      "{farmerName}",
                      formData?.artisanName || "N/A"
                    )}
                  </CardTitle>
                  <CardDescription className="text-stone-600">
                    {t("applicationFor")}
                  </CardDescription>
                </div>
                {/* ## Updated Badges ## */}
                <Badge
                  className={
                    isAdminApproved
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }
                >
                  {isAdminApproved ? t("statusApproved") : t("statusPending")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ## Improved Layout ## */}
              <div>
                <h4 className="font-semibold text-stone-800 mb-3">
                  {t("personalDetails")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem label={t("state")} value={formData?.state} />
                  <DetailItem
                    label={t("district")}
                    value={formData?.district}
                  />
                  <DetailItem label={t("village")} value={formData?.village} />
                </div>
              </div>

              <Separator className="bg-stone-200" />

              <div>
                <h4 className="font-semibold text-stone-800 mb-3">
                  {t("bankDetails")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem
                    label={t("bankName")}
                    value={formData?.bankName}
                  />
                  <DetailItem
                    label={t("accountNumber")}
                    value={formData?.accountNumber}
                  />
                  <DetailItem
                    label={t("aadhaarNumber")}
                    value={formData?.aadhaarNumber}
                  />
                </div>
              </div>

              <Separator className="bg-stone-200" />

              {/* ## Updated Buttons ## */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={onApprove}
                  disabled={isAdminApproved}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {t("approve")}
                </Button>
                <Button
                  onClick={onReject}
                  variant="destructive"
                  // Logic fixed: Can reject an approved app (revoke) or a pending app.
                  disabled={false}
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all"
                >
                  <X className="mr-2 h-4 w-4" />
                  {isAdminApproved ? t("revoke") : t("reject")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
