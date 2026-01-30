'use server';
// add these near other imports at the top of the file
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore"; // adjust path to the file that exports your Firestore `db`

import { identifyMaterialsFromPhoto } from "@/ai/assist_flow/identify-materials";
import { summarizePrices } from "@/ai/assist_flow/summarize-prices";
import { findEvents } from "@/ai/assist_flow/find-events-flow";

import { getEnhancementIdeas } from "@/ai/assist_flow/get-enhancement-ideas-flow";
import { getPriceSuggestion } from "@/ai/assist_flow/get-price-suggestion-flow";
import { findPlaces } from "@/ai/assist_flow/find-places-flow";
import { getTrendingProducts } from "@/ai/assist_flow/get-trending-products-flow";
import type { Material } from "./types";
import { MOCK_SUPPLIERS_FOR_SUMMARY } from "./mock-data";

import { z } from 'zod';
import type { Order, OrderItem, Todo, TodoStatus, TaskFormState, FormState } from './definitions';
import { generateTaskSuggestions } from '@/ai/todo_flow/generate-task-suggestions';
// import { summarizeTaskQuantities } from '@/ai/todo_flow/summarize-task-quantities';

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function identifyMaterialsFromPhotoAction(formData: FormData) {
  const file = formData.get("photo") as File;

  if (!file || file.size === 0) {
    return { error: "No file uploaded." };
  }

  try {
    const photoDataUri = await fileToDataURL(file);
    const result = await identifyMaterialsFromPhoto({ photoDataUri });
    return { materials: result.materials };
  } catch (error) {
    console.error(error);
    return { error: "Failed to identify materials from the photo." };
  }
}

export async function summarizePricesAction(materials: Material[]) {
  if (!materials || materials.length === 0) {
    return { error: "No materials provided for price summary." };
  }

  try {
    const result = await summarizePrices({
      materials: materials.map((m) => ({
        name: m.name,
        quantity: m.quantity,
        unit: m.unit,
      })),
      suppliers: MOCK_SUPPLIERS_FOR_SUMMARY,
    });
    return { summary: result.summary };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate price summary." };
  }
}


export async function getEnhancementIdeasAction(
  productName: string,
  productDescription: string,
  language: string = "en",
  languageLabel?: string,
  logoUrl?: string
) {
  try {
    // Default language label mapping
    const languageLabelMap: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      kn: "Kannada",
    };

    const finalLanguageLabel =
      languageLabel || languageLabelMap[language] || "English";

    // Default logo path (DEV ENVIRONMENT ONLY)
    const DEFAULT_LOGO_PATH =
      "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png"; 
    // Replace with '/artisan-logo.png' in production

    const result = await getEnhancementIdeas({
      productName,
      productDescription,
      language,
      languageLabel: finalLanguageLabel,
      logoUrl: logoUrl || DEFAULT_LOGO_PATH,
    });

    return { ideas: result.ideas };
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      error: `Failed to generate enhancement ideas: ${errorMessage}`,
    };
  }
}
// getPriceSuggestionAction - accepts both old signature and new object payload
export async function getPriceSuggestionAction(
  arg1: string | { product: string; currency: string; language?: string; languageLabel?: string; logoUrl?: string },
  arg2?: string
) {
  // Normalize payload
  let payload: {
    product: string;
    currency: string;
    language?: string;
    languageLabel?: string;
    logoUrl?: string;
  };

  if (typeof arg1 === "object" && arg2 === undefined) {
    payload = arg1;
  } else {
    payload = { product: arg1 as string, currency: (arg2 as string) || "INR" };
  }

  const { product, currency, language = "en", languageLabel, logoUrl } = payload;

  // DEV default logo path (exists in this chat/dev environment)
  const DEFAULT_LOGO_PATH = "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png";

  try {
    const result = await getPriceSuggestion({
      product,
      currency,
      language,
      languageLabel: languageLabel ?? (language === "hi" ? "Hindi" : language === "kn" ? "Kannada" : "English"),
      logoUrl: logoUrl ?? DEFAULT_LOGO_PATH,
    });
    return { suggestion: result };
  } catch (error: any) {
    console.error("getPriceSuggestionAction error:", error);
    return { error: error?.message ?? "Failed to suggest a price." };
  }
}


// findPlacesAction - accepts both old positional signature and new object payload
export async function findPlacesAction(
  arg1:
    | string
    | {
        query: string;
        city: string;
        mode: "sell" | "buy";
        language?: string;
        languageLabel?: string;
        logoUrl?: string;
      },
  arg2?: string,
  arg3?: "sell" | "buy"
) {
  // Normalize payload
  let payload: {
    query: string;
    city: string;
    mode: "sell" | "buy";
    language?: string;
    languageLabel?: string;
    logoUrl?: string;
  };

  if (typeof arg1 === "object" && arg2 === undefined && arg3 === undefined) {
    payload = arg1;
  } else {
    // old signature: (query: string, city: string, mode: 'sell'|'buy')
    payload = { query: arg1 as string, city: arg2 as string, mode: arg3 as "sell" | "buy" };
  }

  const { query, city, mode, language = "en", languageLabel, logoUrl } = payload;

  // DEV default logo path (exists in this chat/dev environment)
  const DEFAULT_LOGO_PATH = "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png";

  try {
    const result = await findPlaces({
      query,
      city,
      mode,
      language,
      languageLabel: languageLabel ?? (language === "hi" ? "Hindi" : language === "kn" ? "Kannada" : "English"),
      logoUrl: logoUrl ?? DEFAULT_LOGO_PATH,
    });
    return { places: result.places };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("findPlacesAction error:", error);
    return { error: `Failed to find places: ${errorMessage}` };
  }
}



// Updated findEventsAction — forwards language, languageLabel and logoUrl to the server flow
export async function findEventsAction(payload: {
  country: string;
  state?: string;
  language?: string;
  languageLabel?: string;
  logoUrl?: string;
}) {
  const { country, state, language = 'en', languageLabel, logoUrl } = payload;

  // Default logo path used during development/testing in this conversation.
  // NOTE: This path (/mnt/data/...) is only valid inside this ChatGPT environment.
  // For production, move your logo into /public (e.g. /artisan-logo.png) and update DEFAULT_LOGO_PATH.
  const DEFAULT_LOGO_PATH = '/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png';

  try {
    const result = await findEvents({
      country,
      state,
      // pass language fields expected by your ai flow
      language,
      languageLabel: languageLabel ?? (language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English'),
      logoUrl: logoUrl ?? DEFAULT_LOGO_PATH,
    });

    // `findEvents` returns the structured result per your flow
    return { events: result.events };
  } catch (error: any) {
    console.error("findEventsAction error:", error);
    return { error: error?.message ?? "Failed to find events." };
  }
}






export async function getTrendingProductsAction(
  language: string = "en",
  languageLabel?: string,
  logoUrl?: string
) {
  try {
    const languageLabelMap: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      kn: "Kannada",
    };

    // DEV default logo path from this chat session (replace with '/artisan-logo.png' in production)
    const DEFAULT_LOGO_PATH = "/mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png";

    const result = await getTrendingProducts({
      language,
      languageLabel: languageLabel ?? languageLabelMap[language] ?? "English",
      logoUrl: logoUrl ?? DEFAULT_LOGO_PATH,
    });

    return { products: result.products };
  } catch (error: any) {
    console.error("getTrendingProductsAction error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { error: `Failed to fetch trending products: ${errorMessage}` };
  }
}



// Helper to generate a more unique ID
const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;


const OrderSchema = z.object({
  clientName: z.string().min(2, 'Client name must be at least 2 characters.'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  items: z.array(z.object({
    description: z.string().min(3, 'Item description is too short.'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  })).min(1, 'Order must have at least one item.'),
});

const TodoSchema = z.object({
  description: z.string().min(3, 'Task description must be at least 3 characters long.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  deadline: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  subtasks: z.array(z.string()).optional(),
});

export async function createMultipleTodosAction(prevState: any, formData: FormData): Promise<any> {
  const submissionId = generateUniqueId('sub');
  const descriptions = formData.getAll('descriptions[]') as string[];
  const deadline = formData.get('deadline') as string;
  const parentId = formData.get('parentId') as string | null;

  if (!descriptions || descriptions.length === 0) {
    return {
      type: 'error',
      message: 'No tasks selected to add.',
      submissionId,
    };
  }
  
  if (!deadline || isNaN(Date.parse(deadline))) {
    return {
      type: 'error',
      message: 'Please provide a valid deadline.',
      submissionId,
    };
  }

  const newTodos: Todo[] = descriptions.map(description => ({
    id: generateUniqueId('todo'),
    description,
    quantity: 1, // Default quantity to 1, can be changed later
    status: 'incomplete',
    createdAt: new Date().toISOString(),
    orderId: null,
    deadline,
    parentId: parentId,
  }));

  return {
    type: 'success',
    message: `Successfully added ${newTodos.length} tasks.`,
    submissionId,
    data: newTodos,
  };
}

export async function createTodoAction(prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const submissionId = generateUniqueId('sub');
  const validatedFields = TodoSchema.safeParse({
    description: formData.get('description'),
    quantity: formData.get('quantity'),
    deadline: formData.get('deadline'),
    subtasks: formData.getAll('subtasks[]'),

  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Failed to create task. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      submissionId,
    };
  }

  const { description, quantity, deadline, subtasks } = validatedFields.data;


  const mainTask: Todo = {
    id: generateUniqueId('todo'),
    description,
    quantity,
    status: 'incomplete',
    createdAt: new Date().toISOString(),
    orderId: null,
    deadline,
    parentId: null,
  };

  const subtaskList: Todo[] = (subtasks || []).map(subtask => ({
    id: generateUniqueId('todo'),
    description: subtask,
    quantity: 1,
    status: 'incomplete',
    createdAt: new Date().toISOString(),
    orderId: null,
    deadline,
    parentId: mainTask.id,
  }));

  return {
    type: 'success',
    message: `Task "${description}" created.`,
    submissionId,
    data: mainTask
  };
}

export async function createOrder(prevState: FormState, formData: FormData): Promise<FormState> {
  const submissionId = generateUniqueId('sub');
  const rawData = {
    clientName: formData.get('clientName'),
    deadline: formData.get('deadline'),
    items: JSON.parse(formData.get('items') as string) as OrderItem[],
  };

  const validatedFields = OrderSchema.safeParse(rawData);
  
  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Failed to create order. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      submissionId,
    };
  }
  
  const { clientName, deadline, items } = validatedFields.data;

  const newOrderId = generateUniqueId('order');
  const newOrder: Order = {
    id: newOrderId,
    clientName,
    deadline,
    status: 'in progress',
    createdAt: new Date().toISOString(),
  };

  const mainTask: Todo = {
    id: generateUniqueId('todo'),
    orderId: newOrderId,
    description: `Order for ${clientName}`,
    quantity: 1,
    status: 'incomplete',
    createdAt: new Date().toISOString(),
    deadline,
    parentId: null,
  };

  const newTodos: Todo[] = items.map(item => ({
    id: generateUniqueId('todo'),
    orderId: newOrderId,
    description: item.description,
    quantity: item.quantity,
    status: 'incomplete',
    createdAt: new Date().toISOString(),
    deadline,
    parentId: mainTask.id,
  }));

  return {
    type: 'success',
    message: `Order for ${clientName} created.`,
    data: { order: newOrder, todos: [mainTask, ...newTodos] },
    submissionId,
  };
}

export async function updateTodoStatus(todoId: string, status: TodoStatus) {
  return { success: true, message: `Task status updated to ${status}.` };
}

export async function getAiTaskSuggestions(customerName: string, orderDetails: string) {
    if (!customerName || !orderDetails) return [];
    try {
        const result = await generateTaskSuggestions({ customerName, productName: orderDetails });
        return result.suggestions;
    } catch (e) {
        console.error(e);
        return [];
    }
}


// interface TaskSummaryInput {
//   taskDescription: string;
//   quantity: number;
// }

// export async function getAiSummary(tasks: TaskSummaryInput[]) {
//     console.log(tasks)
//     if (tasks.length === 0) return "No tasks to summarize.";
//     try {
//         console.log(tasks)
//         const summary = await summarizeTaskQuantities(tasks.map(t => ({ taskDescription: t.description, quantity: t.quantity })));
//         return summary;
//     } catch (e) {

//         console.error("AI Summary Error:", e);
//         return "Could not generate summary at this time.";
//     }
// }

// server-side update; paste/replace the existing function
export async function updateAadhaarAction(
  artisanId: string,
  aadhaarNumber: string,
  fileUrl?: string
) {
  try {
    if (!artisanId) {
      return { success: false, error: "Missing artisanId" };
    }

    if (!aadhaarNumber) {
      return { success: false, error: "Missing Aadhaar number" };
    }

    // Normalize: remove non-digit chars (handles spaces/dashes)
    const digits = aadhaarNumber.replace(/\D/g, "");
    if (digits.length !== 12) {
      return { success: false, error: "Invalid Aadhaar number (must be 12 digits)." };
    }

    // Mask: ********1234
    const masked = "********" + digits.slice(-4);

    // Use passed fileUrl or dev fallback (dev-only path)
    const devImagePath = "/mnt/data/b5db78fd-f64b-4589-b343-f53bcdd7d910.png";
    const storagePath = fileUrl ?? devImagePath;

    // Write ONLY masked Aadhaar and storagePath to Firestore
    // Note: change "profiles" -> "artisans" if your collection uses that name
    const ref = doc(db, "profiles", artisanId);
    await updateDoc(ref, {
      aadharMasked: masked,
      aadharStoragePath: storagePath,
      updatedAt: new Date().toISOString(),
    });

    // Return result to client — client (aadhaar-ocr-card) will dispatch profile:updated
    return { success: true, aadharMasked: masked };
  } catch (err: any) {
    console.error("updateAadhaarAction error:", err);
    return { success: false, error: err?.message ?? "Failed to update Aadhaar" };
  }
}
