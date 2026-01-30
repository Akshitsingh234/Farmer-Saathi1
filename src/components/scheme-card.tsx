'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import {
  AlertTriangle,
  ArrowRight,
  BarChart,  CheckCircle2,
  Clock,  ExternalLink,  FileText,  Rocket,
  Target,
} from 'lucide-react';

interface SchemeCardProps {
  scheme: {
    id: string;
    name: string;
    aiScore: number;
    description: string;
    highlight: string;
    eligibilityMatch: number;
    benefitPotential: number;
    successProbability: number;
    immediateActions: string[];
    timeline: string;
    riskFactors: string[];
    portal: string;
  };
  onApply: () => void;
}

export function SchemeCard({ scheme, onApply }: SchemeCardProps) {
  const { t } = useLanguage();

  const getRiskFactorIcon = (factor: string) => {
    if (factor.includes('collateral')) {
      return <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />;
    } else if (factor.includes('processing time')) {
      return <Clock className="h-4 w-4 text-yellow-500 mr-2" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />;
  };

  return (
    <Card className="bg-white/60 backdrop-blur-md border border-stone-200/80 shadow-lg w-full mx-auto transition-all duration-300 hover:border-amber-400/80">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-stone-600">{scheme.description}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 mb-4 flex items-center">
          <Rocket className="h-5 w-5 text-amber-600 mr-3" />
          <p className="font-semibold text-amber-800">{t(scheme.highlight)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <Card className="bg-green-50/70 border-green-200/60">
            <CardContent className="p-4">
              <p className="font-bold text-3xl text-green-700">{scheme.eligibilityMatch}%</p>
              <p className="text-sm text-green-800">{t('eligibilityMatch')}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50/70 border-purple-200/60">
            <CardContent className="p-4">
              <p className="font-bold text-3xl text-purple-700">{scheme.benefitPotential}%</p>
              <p className="text-sm text-purple-800">{t('benefitPotential')}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50/70 border-orange-200/60">
            <CardContent className="p-4">
              <p className="font-bold text-3xl text-orange-700">{scheme.successProbability}%</p>
              <p className="text-sm text-orange-800">{t('successProbability')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-stone-700 flex items-center"><FileText className="h-5 w-5 mr-2 text-stone-500"/>{t('immediateActions')}</h3>
            <ul className="mt-2 space-y-1 text-stone-600">
              {scheme.immediateActions.map((action, index) => (
                <li key={index} className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2"/>{t(action)}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-stone-600 flex items-center"><Clock className="h-4 w-4 mr-2 text-stone-500"/><strong>{t('timeline')}:</strong> {t(scheme.timeline)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-red-700/80 flex items-center"><AlertTriangle className="h-5 w-5 mr-2"/>{t('riskFactors')}</h3>
            <ul className="mt-2 space-y-1 text-stone-600">
              {scheme.riskFactors.map((factor, index) => (
                <li key={index} className="flex items-center">{getRiskFactorIcon(factor)}{t(factor)}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <a href={scheme.portal} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 hover:text-sky-800 hover:underline flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            {t('portal')}: {scheme.portal}
          </a>
        </div>

      </CardContent>
    </Card>
  );
}
