
import { NextResponse } from 'next/server';
import { db } from '@/firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';

export async function GET() {
  try {
    // Add Products
    const products = [
      { name: 'Handmade Clay Pot', quantity: 50, inProgress: 15, price: 25.99, imageUrl: 'https://images.unsplash.com/photo-1604264726154-26480e76f4e1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { name: 'Embroidered Scarf', quantity: 75, inProgress: 25, price: 49.99, imageUrl: 'https://cdn-images.farfetch-contents.com/30/43/17/96/30431796_59506723_600.jpg' },
      { name: 'Wooden Elephant Statue', quantity: 30, inProgress: 10, price: 79.99, imageUrl: 'https://m.media-amazon.com/images/I/81RK1gMsriL.jpg' },
    ];
    const productCollection = collection(db, 'products');
    for (const product of products) {
      await addDoc(productCollection, product);
    }

    // Add Raw Materials
    const materials = [
      { name: 'Clay (kg)', quantity: 200 },
      { name: 'Yarn (meters)', quantity: 1000 },
      { name: 'Wood (blocks)', quantity: 100 },
    ];
    const materialCollection = collection(db, 'materials');
    for (const material of materials) {
      await addDoc(materialCollection, material);
    }

    // Add Orders
    const orders = [
      { productName: 'Handmade Clay Pot', quantity: 5, status: 'Pending' },
      { productName: 'Embroidered Scarf', quantity: 10, status: 'In Progress' },
      { productName: 'Wooden Elephant Statue', quantity: 2, status: 'Completed' },
    ];
    const orderCollection = collection(db, 'orders');
    for (const order of orders) {
      await addDoc(orderCollection, order);
    }

    return NextResponse.json({ message: 'Inventory data seeded successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
