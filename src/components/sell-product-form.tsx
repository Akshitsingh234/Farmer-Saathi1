
'use client';

import { useState } from 'react';
import { db } from '@/firebase/firestore';
import { doc, updateDoc, increment, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface SellProductFormProps {
  productId: string;
  productName: string;
  currentQuantity: number;
  onProductSold: () => void;
}

export default function SellProductForm({ productId, productName, currentQuantity, onProductSold }: SellProductFormProps) {
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(0);
  const { toast } = useToast();

  const totalAmount = sellQuantity * sellingPrice;
  const remaining = currentQuantity - sellQuantity;

  const handleSell = async () => {
    if (sellQuantity > currentQuantity) {
      toast({
        title: 'Error',
        description: 'Cannot sell more than the available quantity.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      const productData = productSnap.data();

      if (!productData) {
        throw new Error('Product not found!');
      }

      const costToMake = productData.costToMake || 0;
      const profit = (sellingPrice - costToMake) * sellQuantity;

      await updateDoc(productRef, { quantity: increment(-sellQuantity) });

      await addDoc(collection(db, "inventory_events"), {
        type: 'sell',
        productId: productId,
        sellingPrice: sellingPrice,
        quantity: sellQuantity,
        profit: profit,
        timestamp: serverTimestamp(),
        name: productName,
      });

      toast({
        title: '🎉 Sale Successful!',
        description: `You earned ₹${totalAmount}. Remaining stock: ${remaining}.`,
      });

      onProductSold();
    } catch (error) {
      console.error('Error selling product:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while selling the product.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Introduction */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Congratulations on your sale!</h2>
        <p className="text-muted-foreground">Let's record this milestone.</p>
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="text-sm font-medium">Enter Quantity to Sell</label>
        <Input
          type="number"
          value={sellQuantity}
          onChange={(e) => setSellQuantity(parseInt(e.target.value, 10))}
          min={1}
          max={currentQuantity}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Selling Price</label>
        <Input
          type="number"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(Number(e.target.value))}
          min={0}
          className="mt-1"
        />
      </div>

      {/* Sale Summary */}
      <Card className="mt-2 border border-muted/40 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="font-medium">Sale Summary</p>
          </div>

          <p>
            <strong>Quantity:</strong> {sellQuantity}
          </p>

          <p>
            <strong>Total Amount:</strong> {totalAmount} Rs.
          </p>

          <p>
            <strong>Remaining Stock:</strong> {remaining}
          </p>

          {remaining < 10 && (
            <div className="flex items-center gap-2 text-yellow-600 mt-2">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm"><strong>Low stock!</strong> You may want to make more units.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sell Button */}
      <Button onClick={handleSell} className="w-full">
        <CheckCircle className="w-4 h-4 mr-2" />
        Confirm Sale
      </Button>
    </div>
  );
}

// Allows voice command to sell directly
export async function submitDirectSellProduct(productId: string, productName: string, sellQuantity: number, sellingPrice: number) {
  if (!productId || !sellQuantity || sellQuantity <= 0) throw new Error("Invalid args");
  const productRef = doc(db, 'products', productId);
  const snap = await getDoc(productRef);
  const data = snap.data();
  if (!data) throw new Error("Product not found");

  const costToMake = data.costToMake || 0;
  const profit = (sellingPrice ?? 0 - costToMake) * sellQuantity;

  // decrement quantity
  await updateDoc(productRef, { quantity: increment(-sellQuantity) });

  // add event log
  await addDoc(collection(db, "inventory_events"), {
    type: "sell",
    productId,
    name: productName,
    quantity: sellQuantity,
    sellingPrice: sellingPrice ?? 0,
    profit,
    timestamp: serverTimestamp()
  });
}
