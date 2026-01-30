'use client';

import { useState } from 'react';
import { db } from '@/firebase/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface UseMaterialFormProps {
  materialId: string;
  currentQuantity: number;
  onMaterialUsed: () => void;
}

export default function UseMaterialForm({
  materialId,
  currentQuantity,
  onMaterialUsed
}: UseMaterialFormProps) {

  const [usedQuantity, setUsedQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  const remainingQuantity = currentQuantity - usedQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usedQuantity <= 0 || usedQuantity > currentQuantity) return;

    setLoading(true);

    try {
      await updateDoc(doc(db, 'materials', materialId), {
        quantity: remainingQuantity,
      });
      onMaterialUsed();
    } catch (error) {
      console.error('Error updating material quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Input */}
      <div className="space-y-2">
        <Label htmlFor="usedQuantity" className="text-sm font-medium">
          Quantity to Use
        </Label>

        <Input
          id="usedQuantity"
          type="number"
          value={usedQuantity}
          min={0}
          max={currentQuantity}
          onChange={(e) => setUsedQuantity(parseInt(e.target.value, 10) || 0)}
          placeholder="Enter amount to deduct"
        />
      </div>

      {/* Summary Card */}
      <Card className="border border-muted/40">
        <CardContent className="p-4 space-y-2">

          <p className="font-medium text-base">Material Usage Summary</p>

          <p className="text-sm">
            <strong>Using:</strong> {usedQuantity} units
          </p>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Remaining Stock:</p>
            <span
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                remainingQuantity <= 0
                  ? "bg-red-200 text-red-700"
                  : remainingQuantity < 20
                  ? "bg-yellow-200 text-yellow-700"
                  : "bg-green-200 text-green-700"
              }`}
            >
              {remainingQuantity < 0 ? 0 : remainingQuantity}
            </span>
          </div>

          {remainingQuantity < 20 && remainingQuantity >= 0 && (
            <div className="flex items-center gap-2 p-3 mt-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4" />
              <p>
                Low stock! Consider buying more raw material soon.
              </p>
            </div>
          )}

          {remainingQuantity <= 0 && (
            <div className="flex items-center gap-2 p-3 mt-2 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4" />
              <p>
                Stock depleted! You must purchase more material immediately.
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={
          loading || usedQuantity <= 0 || usedQuantity > currentQuantity
        }
      >
        {loading ? "Updating..." : "Confirm Usage"}
      </Button>
    </form>
  );
}

// Allows voice command to use (deduct) material directly
export async function submitDirectUseMaterial(materialId: string, quantity: number) {
  if (!materialId || !quantity || quantity <= 0) throw new Error("Invalid args");

  const ref = doc(db, 'materials', materialId);
  const snap = await getDoc(ref);
  const data = snap.data();
  if (!data) throw new Error("Material not found");

  const current = (data.quantity ?? 0);
  const remaining = Math.max(current - quantity, 0);
  await updateDoc(ref, { quantity: remaining });
}
