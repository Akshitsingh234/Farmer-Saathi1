'use client';

import { useState } from 'react';
import { db } from '@/firebase/firestore';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface IncreaseQuantityFormProps {
  productId: string;
  onQuantityIncreased: () => void;
}

export default function IncreaseQuantityForm({ productId, onQuantityIncreased }: IncreaseQuantityFormProps) {
  const [addQuantity, setAddQuantity] = useState(1);
  const { toast } = useToast();

  const handleIncrease = async () => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { quantity: increment(addQuantity) });

      toast({
        title: 'Success',
        description: `Added ${addQuantity} to the stock.`,
      });

      onQuantityIncreased();
    } catch (error) {
      console.error('Error increasing quantity:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while increasing the stock.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Quantity to Add</label>
        <Input
          type="number"
          value={addQuantity}
          onChange={(e) => setAddQuantity(parseInt(e.target.value, 10))}
          min={1}
          className="mt-1"
        />
      </div>

      <Button onClick={handleIncrease} className="w-full">
        Add to Stock
      </Button>
    </div>
  );
}

export async function submitDirectIncreaseProduct(productId: string, quantity: number) {
  if (!productId || !quantity || quantity <= 0) throw new Error("Invalid args");
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, { quantity: increment(quantity) });
}