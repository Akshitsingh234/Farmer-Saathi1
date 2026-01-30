'use client';

import type { Todo, TodoStatus } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import React from 'react';

interface TodoListProps {
  todos: Todo[];
  subtasks: Todo[];
  onStatusChange: (todoId: string, status: TodoStatus) => void;
  onDeleteTodo: (todoId: string) => void;
  isLoading: boolean;
}

const statusVariant: { [key in TodoStatus]: 'default' | 'secondary' | 'outline' } = {
    'complete': 'default',
    'in progress': 'secondary',
    'incomplete': 'outline',
};

const statusLabel: { [key in TodoStatus]: string } = {
    'complete': 'Complete',
    'in progress': 'In Progress',
    'incomplete': 'Incomplete',
};

export default function TodoList({ todos, subtasks, onStatusChange, onDeleteTodo, isLoading }: TodoListProps) {

    
  return (
    <Card>
      <CardHeader>
        <CardTitle>To-Do List</CardTitle>
        <CardDescription>All the tasks required to complete your orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Task Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Deadline</TableHead>
              <TableHead className="text-center">State</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 float-right" /></TableCell>
                    </TableRow>
                ))
            ) : todos.length > 0 ? (
              todos.map(todo => (
                <React.Fragment key={todo.id}>
                    <TableRow>
                    <TableCell>
                        <TooltipProvider>
                  
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Checkbox
                                checked={todo.status === 'complete'}
                                onCheckedChange={(checked) =>
                                onStatusChange(todo.id, checked ? 'complete' : 'incomplete')
                                }
                                aria-label={`Mark ${todo.description} as ${todo.status === 'complete' ? 'incomplete' : 'complete'}`}
                            />
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Mark as {todo.status === 'complete' ? 'incomplete' : 'complete'}</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </TableCell>
                    <TableCell className={`font-medium ${todo.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                        {todo.description}
                    </TableCell>
                    <TableCell className={`text-center ${todo.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                        {todo.quantity}
                    </TableCell>
                    <TableCell className={`text-center ${todo.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                        {todo.deadline ? new Date(todo.deadline).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1 h-auto flex items-center gap-2 mx-auto">
                                <Badge variant={statusVariant[todo.status]}>{statusLabel[todo.status]}</Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {(Object.keys(statusLabel) as TodoStatus[]).map((status) => (
                            <DropdownMenuItem key={status} onSelect={() => onStatusChange(todo.id, status)}>
                                {statusLabel[status]}
                            </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => onDeleteTodo(todo.id)} className="text-stone-500 hover:text-red-600">
                                        <Trash2 className="h-5 w-5"/>
                                        <span className="sr-only">Delete Task</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete Task</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TableCell>
                    </TableRow>
                    {subtasks.filter(sub => sub.parentId === todo.id).map(subtask => (
                        <TableRow key={subtask.id}>
                            <TableCell className="pl-8">
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Checkbox
                                        checked={subtask.status === 'complete'}
                                        onCheckedChange={(checked) =>
                                        onStatusChange(subtask.id, checked ? 'complete' : 'incomplete')
                                        }
                                        aria-label={`Mark ${subtask.description} as ${subtask.status === 'complete' ? 'incomplete' : 'complete'}`}
                                    />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                    <p>Mark as {subtask.status === 'complete' ? 'incomplete' : 'complete'}</p>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className={`font-medium ${subtask.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                                <span className="text-muted-foreground mr-2">└─</span>
                                {subtask.description}
                            </TableCell>
                            <TableCell className={`text-center ${subtask.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                                {subtask.quantity}
                            </TableCell>
                            <TableCell className={`text-center ${subtask.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                                {subtask.deadline ? new Date(subtask.deadline).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="p-1 h-auto flex items-center gap-2 mx-auto">
                                        <Badge variant={statusVariant[subtask.status]}>{statusLabel[subtask.status]}</Badge>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {(Object.keys(statusLabel) as TodoStatus[]).map((status) => (
                                    <DropdownMenuItem key={status} onSelect={() => onStatusChange(subtask.id, status)}>
                                        {statusLabel[status]}
                                    </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-right">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => onDeleteTodo(subtask.id)} className="text-stone-500 hover:text-red-600">
                                                <Trash2 className="h-5 w-5"/>
                                                <span className="sr-only">Delete Task</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Delete Task</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    ))}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tasks yet. Create an order to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
