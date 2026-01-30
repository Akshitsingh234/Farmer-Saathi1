'use client';

import { useState } from 'react';
import { db } from '@/firebase/firestore';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddMaterialFormProps {
  onMaterialAdded: () => void;
}

export default function AddMaterialForm({ onMaterialAdded }: AddMaterialFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || quantity <= 0) {
      return;
    }
    setLoading(true);

    try {
        const materialsRef = collection(db, 'materials');
        const q = query(materialsRef, where("name", "==", name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            const newQuantity = existingDoc.data().quantity + quantity;
            await updateDoc(doc(db, 'materials', existingDoc.id), {
                quantity: newQuantity
            });
        } else {
            await addDoc(materialsRef, {
                name,
                quantity,
            });
        }

      onMaterialAdded();
    } catch (error) {
      console.error('Error adding material:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Material Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Clay"
          required
        />
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          placeholder="e.g., 10"
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Material'}
      </Button>
    </form>
  );
}