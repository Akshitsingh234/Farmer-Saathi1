
"use server";

import { assistKycReminder } from "@/ai/flows/data-assisted-kyc-reminder";
import { extractCardDetails } from "@/ai/flows/extract-card-details";
import { db } from "@/lib/db";
import { mapArtisanDataToForm } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/services/twilio";


export async function autofillPmKisanFormAction(currentFormData?: object) {
  try {
    const artisanId = "ARTISAN12345";
    const artisanData = await db.getArtisanById(artisanId);
    if (!artisanData) {
      return { success: false, error: "Artisan data not found." };
    }
    const filledData = mapArtisanDataToForm(artisanData);
    return { success: true, data: filledData };

  } catch (error: any) {
    console.error("Error in autofill action:", error);
    return { success: false, error: error.message || "Failed to autofill form. Please try again." };
  }
}

export async function getKycAssistanceAction(language: 'en' | 'hi' = 'en', artisanName?: string) {
    try {
        const userData = await db.getArtisanById("ARTISAN12345");
        if (!userData) {
          throw new Error("User not found");
        }
        const result = await assistKycReminder({
            artisanId: "ARTISAN12345",
            artisanName: artisanName,
            aadhaarNumber: userData.aadhaarNumber,
            bankAccountNumber: userData.bank.accountNumber,
            artisanTrade: userData.artisanTrade,
            language,
        });
        return { success: true, data: result.eKycAssistance };
    } catch (error: any) {
        console.error("Error in KYC assistance action:", error);
        return { success: false, error: error.message || "Failed to get KYC assistance. Please try again." };
    }
}

export async function sendWhatsAppNotificationAction(message: string) {
    const recipient = process.env.RECIPIENT_PHONE_NUMBER;
    if (!recipient) {
        console.error("RECIPIENT_PHONE_NUMBER not set in .env");
        return { success: false, error: "Recipient phone number not configured." };
    }
    try {
        await sendWhatsAppMessage(recipient, message);
        return { success: true };
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        return { success: false, error: "Failed to send WhatsApp notification." };
    }
}

export async function extractCardDetailsAction(imageDataUri: string) {
    try {
        const result = await extractCardDetails({ imageDataUri });
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error in extractCardDetailsAction:", error);
        return { success: false, error: error.message || "Failed to extract card details." };
    }
}

export async function updateAadhaarAction(artisanId: string, aadhaarNumber: string) {
    try {
        await db.updateArtisanData(artisanId, { aadhaarNumber });
        return { success: true };
    } catch (error: any) {
        console.error("Error in updateAadhaarAction:", error);
        return { success: false, error: error.message || "Failed to update Aadhaar number." };
    }
}
