"use client";

import { useState, useRef } from "react";
import { db } from "@/firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const MAX_IMAGE_SIZE_MB = 1;

// Same compression function as CreateStory
async function compressImage(dataUrl: string, fileType?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = dataUrl;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas error"));

      let { width, height } = image;
      const MAX_WIDTH = 1024;
      const MAX_HEIGHT = 1024;

      if (width > height && width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      } else if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);

      let quality = 0.9;
      let compressedDataUrl = canvas.toDataURL(fileType || "image/jpeg", quality);

      while (
        compressedDataUrl.length > MAX_IMAGE_SIZE_MB * 1024 * 1024 &&
        quality > 0.1
      ) {
        quality -= 0.1;
        compressedDataUrl = canvas.toDataURL(fileType || "image/jpeg", quality);
      }

      resolve(compressedDataUrl);
    };
    image.onerror = reject;
  });
}

export default function AddProductForm({ onProductAdded }: { onProductAdded: () => void }) {
  const [name, setName] = useState("");
  const [costToMake, setCostToMake] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target?.result) return;

      const originalDataUrl = event.target.result as string;
      const compressedDataUrl = await compressImage(originalDataUrl, file.type);

      setCompressedImage(compressedDataUrl);
      setImagePreview(compressedDataUrl);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressedImage) {
      console.error("Image missing");
      return;
    }

    try {
      const productRef = await addDoc(collection(db, "products"), {
        name,
        costToMake,
        quantity,
        imageBase64: compressedImage, // ⬅ Store image directly in Firestore
        inProgress: 0,
        createdAt: new Date(),
      });

      await addDoc(collection(db, "inventory_events"), {
        type: 'add',
        productId: productRef.id,
        cost: costToMake,
        quantity: quantity,
        timestamp: serverTimestamp(),
        name: name,
      });

      onProductAdded();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="costToMake">Cost to Make</Label>
        <Input
          id="costToMake"
          type="number"
          value={costToMake}
          onChange={(e) => setCostToMake(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <Label>Product Image</Label>
        <Input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          required
        />
      </div>

      {imagePreview && (
        <div className="border rounded-lg p-2">
          <Image
            src={imagePreview}
            alt="Preview"
            width={300}
            height={300}
            className="rounded-md"
          />
        </div>
      )}

      <Button type="submit">Add Product</Button>
    </form>
  );
}
