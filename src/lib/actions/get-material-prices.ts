'use server';

import { getMaterialPrices } from '@/ai/assist_flow/get-material-prices-flow';
import { revalidatePath } from 'next/cache';

export async function getMaterialPricesAction(material: string, currency: string) {
  try {
    const result = await getMaterialPrices({ material, currency });
    revalidatePath('/artisan-assist/sourcing-pricing');
    return result;
  } catch (error) {
    console.error('Error getting material prices:', error);
    return { error: 'Failed to get material prices. Please try again.' };
  }
}
