"use client";

import { useLanguage } from "@/context/language-context";
import type { ArtisanScheme } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle } from "lucide-react";

type SchemeComparisonProps = {
  scheme1: ArtisanScheme;
  scheme2: ArtisanScheme;
};

export default function SchemeComparison({
  scheme1,
  scheme2,
}: SchemeComparisonProps) {
  const { t } = useLanguage();

  const allBenefits = [
    ...new Set([
      ...scheme1.benefits.map((b) => b.title),
      ...scheme2.benefits.map((b) => b.title),
    ]),
  ];

  return (
    // ## Updated Card Style ##
    <Card className="bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-stone-50/50">
            <TableRow>
              <TableHead className="w-1/3 font-bold text-stone-800">
                {t("feature")}
              </TableHead>
              <TableHead className="text-center font-bold text-stone-800">
                {t(scheme1.name)}
              </TableHead>
              <TableHead className="text-center font-bold text-stone-800">
                {t(scheme2.name)}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-stone-200/80">
              <TableCell className="font-semibold text-stone-700">
                {t("description")}
              </TableCell>
              <TableCell className="text-sm text-stone-600">
                {t(scheme1.description)}
              </TableCell>
              <TableCell className="text-sm text-stone-600">
                {t(scheme2.description)}
              </TableCell>
            </TableRow>
            <TableRow className="border-stone-200/80">
              {/* ## Updated Section Header Style ## */}
              <TableCell
                colSpan={3}
                className="font-bold text-amber-700 bg-amber-50/50"
              >
                {t("benefits")}
              </TableCell>
            </TableRow>
            {allBenefits.map((benefitTitle) => (
              <TableRow key={benefitTitle} className="border-stone-200/80">
                <TableCell className="text-stone-700">
                  {t(benefitTitle)}
                </TableCell>
                <TableCell className="text-center">
                  {/* ## Updated Icon Color ## */}
                  {scheme1.benefits.some((b) => b.title === benefitTitle) && (
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {scheme2.benefits.some((b) => b.title === benefitTitle) && (
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-stone-200/80">
              <TableCell
                colSpan={3}
                className="font-bold text-amber-700 bg-amber-50/50"
              >
                {t("requiredDocs")}
              </TableCell>
            </TableRow>
            <TableRow className="border-stone-200/80">
              <TableCell></TableCell>
              <TableCell>
                <ul className="list-disc pl-4 text-sm text-stone-600">
                  {scheme1.requiredDocuments.map((doc) => (
                    <li key={doc}>{t(doc)}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>
                <ul className="list-disc pl-4 text-sm text-stone-600">
                  {scheme2.requiredDocuments.map((doc) => (
                    <li key={doc}>{t(doc)}</li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
