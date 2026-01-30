'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createOrder, getAiTaskSuggestions } from '@/lib/actions';
import type { Todo, FormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Sparkles, Trash2, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import VoiceInput from '@/components/VoiceInput';

const taskItemSchema = z.object({
  description: z.string().min(3, 'Subtask description must be at least 3 characters.'),
});

const formSchema = z.object({
  taskName: z.string().min(2, 'Task name must be at least 2 characters.'),
  deadline: z.string().refine(val => !isNaN(Date.parse(val)), 'A valid deadline is required.'),
  items: z.array(taskItemSchema),
});

type TaskFormValues = z.infer<typeof formSchema>;

const initialState: FormState = { message: '', type: undefined };

interface NewTaskFormProps {
  onTaskCreated: (todos: Todo[]) => void;
}

export default function NewTaskForm({ onTaskCreated }: NewTaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskName: '',
      deadline: '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const [state, formAction, isPending] = useActionState(createOrder, initialState);
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const submissionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.submissionId && submissionIdRef.current !== state.submissionId) {
      submissionIdRef.current = state.submissionId;

      if (state.type === 'success') {
        toast({
          title: 'Task Created',
          description: state.message,
        });
        if (state.data) {
          onTaskCreated(state.data.todos);
        }
        form.reset();
      } else if (state.type === 'error') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      }
    }
  }, [state, onTaskCreated, form, toast]);

  const handleGetSuggestions = async () => {
    const taskName = form.getValues('taskName');
    if (!taskName) {
        toast({
            variant: 'destructive',
            title: 'Cannot get suggestions',
            description: 'Please provide a main task name first.'
        });
        return;
    }
    
    setIsSuggesting(true);
    try {
      const suggestions = await getAiTaskSuggestions("an artisan", `a task to '${taskName}'`);
      if(suggestions && suggestions.length > 0) {
          remove(); // remove all current subtasks
          suggestions.forEach((suggestion: { description: string }) => append({ description: suggestion.description }));
      } else {
          toast({
              title: 'No suggestions found',
              description: 'Could not generate AI suggestions for this task.'
          });
      }
    } catch (error) {
        console.error('Failed to get AI suggestions:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to get AI suggestions.' });
    } finally {
        setIsSuggesting(false);
    }
  }

  const processForm = (data: TaskFormValues) => {
    const formData = new FormData();
    formData.append('clientName', data.taskName);
    formData.append('deadline', data.deadline);
    formData.append('items', JSON.stringify(data.items.map(item => ({...item, quantity: 1}))));
    formAction(formData);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>Add a new task and its subtasks. These will be added to your to-do list.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(processForm)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="taskName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Task Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input placeholder="e.g., Craft new pottery collection" {...field} />
                        <VoiceInput onTranscription={(text) => form.setValue('taskName', text)} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Subtasks</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleGetSuggestions} disabled={isSuggesting || isPending}>
                    {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    AI Suggest
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input placeholder={`Subtask ${index + 1} description`} {...field} />
                            <VoiceInput onTranscription={(text) => form.setValue(`items.${index}.description`, text)} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Subtask
              </Button>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
