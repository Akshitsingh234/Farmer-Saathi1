'use client';

import { useState, useEffect } from 'react';
import type { Order, Todo, TodoStatus } from '@/lib/definitions';
import NewOrderForm from './NewOrderForm';
import TodoList from './ToDoList';
import { useToast } from '@/hooks/use-toast';
import NewTaskForm from './NewTaskForm';

export default function Dashboard() {
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
    setIsLoadingTodos(false);
  }, []);

  useEffect(() => {
    if (!isLoadingTodos) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isLoadingTodos]);

  const handleNewOrder = (order: Order, newTodos: Todo[]) => {
    setTodos((prevTodos) => [...newTodos, ...prevTodos]);
  };

  const handleNewTodos = (newTodos: Todo[]) => {
    setTodos((prevTodos) => [...newTodos, ...prevTodos]);
  };

  const handleStatusChange = async (todoId: string, status: TodoStatus) => {
    setTodos(todos.map(todo => todo.id === todoId ? { ...todo, status } : todo));
    toast({
        title: 'Task Updated',
        description: `Task marked as ${status}.`
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos(todos.filter(todo => todo.id !== todoId && todo.parentId !== todoId));
    toast({
        title: "Task Deleted",
        description: "The task has been removed from your list."
    });
  };

  const topLevelTodos = todos.filter(todo => !todo.parentId);
  const subtasks = todos.filter(todo => todo.parentId);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <NewOrderForm onOrderCreated={handleNewOrder} />
            <NewTaskForm onTaskCreated={handleNewTodos} />
        </div>
        <div className="lg:col-span-2">
            <TodoList 
              todos={topLevelTodos || []} 
              subtasks={subtasks || []}
              onStatusChange={handleStatusChange} 
              onDeleteTodo={handleDeleteTodo} 
              isLoading={isLoadingTodos}
            />
        </div>
    </div>
  );
}
