import { FieldValue } from 'firebase/firestore';

export type TodoStatus = 'incomplete' | 'in progress' | 'complete';

export type Todo = {
  id: string;
  orderId: string | null;
  description: string;
  quantity: number;
  status: TodoStatus;
  createdAt: FieldValue | string; // string when received from server
  deadline?: string;
  parentId?: string | null;
};

export type Order = {
  id: string;
  clientName: string;
  deadline: string;
  status: 'in progress' | 'complete';
  createdAt: FieldValue | string; // string when received from server
};

export type Artisan = {
    uid?: string; // UID is the doc id, so it's not in the document itself
    email: string;
    name: string;
};

export type OrderItem = {
  description: string;
  quantity: number;
};

export type FormState = {
  type?: 'success' | 'error';
  message: string;
  errors?: {
    clientName?: string[];
    deadline?: string[];
    items?: string[];
    [key: string]: string[] | undefined;
  };
  data?: {
    order: Order;
    todos: Todo[];
  } | null;
  submissionId?: string;
};


export type TaskFormState = {
  type?: 'success' | 'error';
  message: string;
  errors?: {
    description?: string[];
    quantity?: string[];
    deadline?: string[];
  };
  data?: Todo | null;
  submissionId?: string;
};
