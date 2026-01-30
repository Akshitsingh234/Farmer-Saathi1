"use client";

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firestore';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

import AddProductForm from './add-product-form';
import SellProductForm from './sell-product-form';
import AddMaterialForm from './add-material-form';
import UseMaterialForm from './use-material-form';
import IncreaseQuantityForm from './increase-quantity-form';
import IncreaseMaterialQuantityForm from './increase-material-quantity-form';
import { submitDirectSellProduct } from './sell-product-form';
import { submitDirectIncreaseProduct } from './increase-quantity-form';
import { submitDirectIncreaseMaterial } from './increase-material-quantity-form';
import { submitDirectUseMaterial } from './use-material-form';
import AccountsTab from './accounts-tab';
import { VoiceCommandButton } from './voice-command-button';
import { useToast } from '@/hooks/use-toast';
import { Package, AlertTriangle, Boxes, IndianRupee, Sparkles, Loader2 } from "lucide-react";
import { getInventoryInsightsFlow } from '@/ai/inventory_flow/get-inventory-insights';
import { useLanguage } from '@/context/language-context';

interface Product {
  id: string;
  name: string;
  quantity: number;
  costToMake: number;
  imageBase64: string;
}

interface Material {
  id: string;
  name: string;
  quantity: number;
}

export default function InventoryDashboard() {
  const router = useRouter();
  const { t } = useLanguage(); // <-- localization hook

  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSellProductOpen, setIsSellProductOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isUseMaterialOpen, setIsUseMaterialOpen] = useState(false);
  const [isIncreaseQuantityOpen, setIsIncreaseQuantityOpen] = useState(false);
  const [isIncreaseMaterialQuantityOpen, setIsIncreaseMaterialQuantityOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [voiceStatus, setVoiceStatus] = useState<null | "listening" | "analyzing" | "error" | "success">(null);

  // AI Suggestions State
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const { toast } = useToast();

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  };

  const fetchMaterials = async () => {
    const snap = await getDocs(collection(db, 'materials'));
    setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchProducts();
        await fetchMaterials();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
    fetchProducts();
    toast({ title: t("inventory.notifications.deletedProductTitle"), description: t("inventory.notifications.deletedProductDesc") });
  };

  const handleProductAdded = () => {
    setIsAddProductOpen(false);
    fetchProducts();
    toast({ title: t("inventory.notifications.addedProductTitle"), description: t("inventory.notifications.addedProductDesc") });
  };

  const handleProductSold = () => {
    setIsSellProductOpen(false);
    fetchProducts();
    toast({ title: t("inventory.notifications.soldProductTitle"), description: t("inventory.notifications.soldProductDesc") });
  };

  const handleQuantityIncreased = () => {
    setIsIncreaseQuantityOpen(false);
    fetchProducts();
    toast({ title: t("inventory.notifications.increasedQuantityTitle"), description: t("inventory.notifications.increasedQuantityDesc") });
  };

  const handleMaterialAdded = () => {
    setIsAddMaterialOpen(false);
    fetchMaterials();
    toast({ title: t("inventory.notifications.addedMaterialTitle"), description: t("inventory.notifications.addedMaterialDesc") });
  };

  const handleMaterialUsed = () => {
    setIsUseMaterialOpen(false);
    fetchMaterials();
    toast({ title: t("inventory.notifications.usedMaterialTitle"), description: t("inventory.notifications.usedMaterialDesc") });
  };

  const handleMaterialQuantityIncreased = () => {
    setIsIncreaseMaterialQuantityOpen(false);
    fetchMaterials();
    toast({ title: t("inventory.notifications.increasedMaterialTitle"), description: t("inventory.notifications.increasedMaterialDesc") });
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await deleteDoc(doc(db, "materials", materialId));
      await fetchMaterials();
      toast({ title: t("inventory.notifications.deletedMaterialTitle"), description: t("inventory.notifications.deletedMaterialDesc") });
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({ title: t("inventory.notifications.errorTitle"), description: t("inventory.notifications.errorDesc"), variant: "destructive" });
    }
  };

  const handleVoiceCommand = async (rawCommand: string) => {
    try {
      setVoiceStatus("analyzing");

      const command = rawCommand.trim().toLowerCase();
      console.log("Voice command:", command);

      // --- Helpers ---
      const extractFirstNumber = (text: string): number | null => {
        const m = text.match(/(\d+(\.\d+)?)/);
        return m ? Math.floor(Number(m[1])) : null;
      };

      const extractPrice = (text: string): number | null => {
        const m = text.match(/(?:for|at|rs|rupees|₹)?\s*(\d+(\.\d+)?)(?:\s*(?:rs|rupees|₹))?/);
        if (!m) return null;
        const allNums = [...text.matchAll(/(\d+(\.\d+)?)/g)].map(x => x[0]);
        if (allNums.length === 0) return null;
        const nums = allNums.map(n => Number(n));
        return Math.floor(Math.max(...nums));
      };

      const normalize = (s: string) => s.replace(/[^a-z0-9\s]/g, '').trim();

      const findBestProduct = (text: string) => {
        const tnorm = normalize(text);
        let best: Product | null = null;
        let bestScore = 0;
        for (const p of products) {
          const name = normalize(p.name);
          if (tnorm.includes(name)) return p;
          const tokens = name.split(/\s+/);
          let score = 0;
          for (const tok of tokens) if (tnorm.includes(tok)) score += tok.length;
          if (name.startsWith(tnorm) || tnorm.startsWith(name)) score += 5;
          if (score > bestScore) { bestScore = score; best = p; }
        }
        return bestScore > 0 ? best : null;
      };

      const findBestMaterial = (text: string) => {
        const tnorm = normalize(text);
        let best: Material | null = null;
        let bestScore = 0;
        for (const m of materials) {
          const name = normalize(m.name);
          if (tnorm.includes(name)) return m;
          const tokens = name.split(/\s+/);
          let score = 0;
          for (const tok of tokens) if (tnorm.includes(tok)) score += tok.length;
          if (name.startsWith(tnorm) || tnorm.startsWith(name)) score += 5;
          if (score > bestScore) { bestScore = score; best = m; }
        }
        return bestScore > 0 ? best : null;
      };

      // --- Parsing ---
      const qty = extractFirstNumber(command);
      const price = extractPrice(command);

      const isSell = /\bsell\b/.test(command);
      const isIncrease = /\b(increase|add|restock|receive|stock up|add stock)\b/.test(command);
      const isUse = /\b(use|consume|spent|deduct)\b/.test(command);

      const product = findBestProduct(command);
      const material = findBestMaterial(command);

      // SELL PRODUCT
      if (isSell) {
        if (!product) {
          setVoiceStatus("error");
          toast({
            title: t("inventory.voice.productNotFoundTitle"),
            description: t("inventory.voice.productNotFoundDesc"),
            variant: "destructive",
          });
          return;
        }

        if (qty && price) {
          await submitDirectSellProduct(product.id, product.name, qty, price);
          await fetchProducts();

          setVoiceStatus("success");
          toast({
            title: t("inventory.voice.saleRecordedTitle"),
            description: t("inventory.voice.saleRecordedDesc", { qty, product: product.name, price }),
          });
          return;
        }

        setSelectedProduct(product);
        setIsSellProductOpen(true);

        setVoiceStatus("success");
        toast({
          title: t("inventory.voice.sellTitle"),
          description: t("inventory.voice.fillSellDetailsDesc", { product: product.name }),
        });
        return;
      }

      // INCREASE PRODUCT / MATERIAL
      if (isIncrease) {

        if (product) {
          if (qty) {
            await submitDirectIncreaseProduct(product.id, qty);
            await fetchProducts();
            setVoiceStatus("success");
            toast({
              title: t("inventory.voice.stockAddedTitle"),
              description: t("inventory.voice.stockAddedDesc", { qty, product: product.name }),
            });
            return;
          }

          setSelectedProduct(product);
          setIsIncreaseQuantityOpen(true);

          setVoiceStatus("success");
          toast({
            title: t("inventory.voice.addStockTitle"),
            description: t("inventory.voice.addStockDesc", { product: product.name }),
          });
          return;
        }

        if (material) {
          if (qty) {
            await submitDirectIncreaseMaterial(material.id, qty);
            await fetchMaterials();

            setVoiceStatus("success");
            toast({
              title: t("inventory.voice.materialIncreasedTitle"),
              description: t("inventory.voice.materialIncreasedDesc", { qty, material: material.name }),
            });
            return;
          }

          setSelectedMaterial(material);
          setIsIncreaseMaterialQuantityOpen(true);

          setVoiceStatus("success");
          toast({
            title: t("inventory.voice.addMaterialStockTitle"),
            description: t("inventory.voice.addMaterialStockDesc"),
          });
          return;
        }

        setVoiceStatus("error");
        toast({
          title: t("inventory.voice.notFoundTitle"),
          description: t("inventory.voice.notFoundDesc"),
          variant: "destructive",
        });
        return;
      }

      // USE MATERIAL
      if (isUse) {
        if (!material) {
          setVoiceStatus("error");
          toast({
            title: t("inventory.voice.materialNotFoundTitle"),
            description: t("inventory.voice.materialNotFoundDesc"),
            variant: "destructive",
          });
          return;
        }

        if (qty) {
          await submitDirectUseMaterial(material.id, qty);
          await fetchMaterials();

          setVoiceStatus("success");
          toast({
            title: t("inventory.voice.materialUsedTitle"),
            description: t("inventory.voice.materialUsedDesc", { qty, material: material.name }),
          });
          return;
        }

        setSelectedMaterial(material);
        setIsUseMaterialOpen(true);

        setVoiceStatus("success");
        toast({
          title: t("inventory.voice.useMaterialTitle"),
          description: t("inventory.voice.useMaterialDesc", { material: material.name }),
        });
        return;
      }

      // NO MATCH
      setVoiceStatus("error");
      toast({
        title: t("inventory.voice.commandNotUnderstoodTitle"),
        description: t("inventory.voice.commandNotUnderstoodDesc"),
        variant: "destructive",
      });

    } catch (err) {
      console.error("Voice handling error:", err);

      setVoiceStatus("error");
      toast({
        title: t("inventory.notifications.errorTitle"),
        description: t("inventory.notifications.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setVoiceStatus(null), 1500);
    }
  };

  const handleSuggestProducts = async () => {
    setIsSuggesting(true);
    setIsSuggestionsOpen(true);
    setSuggestions([]); // Clear previous suggestions

    try {
      const result = await getInventoryInsightsFlow({
        products: products.map(p => ({ name: p.name, quantity: p.quantity })),
        materials: materials.map(m => ({ name: m.name, quantity: m.quantity })),
      });

      if (result && result.insights) {
        setSuggestions(result.insights);
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        title: t("inventory.notifications.errorTitle"),
        description: t("inventory.notifications.suggestionsFailedDesc"),
        variant: "destructive",
      });
      setIsSuggestionsOpen(false); // Close if error
    } finally {
      setIsSuggesting(false);
    }
  };


if (loading)
  return (
    <div className="space-y-4 animate-pulse py-4">
      <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
      <div className="h-4 w-full bg-gray-300 rounded"></div>
      <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
    </div>
  );


  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="products">{t("inventory.tabs.products")}</TabsTrigger>
        <TabsTrigger value="materials">{t("inventory.tabs.materials")}</TabsTrigger>
        <TabsTrigger value="accounts">{t("inventory.tabs.accounts")}</TabsTrigger>
      </TabsList>

      {/* PRODUCTS TAB */}
      <TabsContent value="products">
        <div className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className='flex items-center'>
              <h2 className="text-xl font-bold">{t("inventory.products.title")}</h2>
              <VoiceCommandButton
                onCommand={handleVoiceCommand}
                onStart={() => setVoiceStatus("listening")}
                onEnd={() => setVoiceStatus("analyzing")}
              />
            </div>

            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <DialogTrigger asChild><Button>{t("inventory.actions.addProduct")}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("inventory.modal.addProduct.title")}</DialogTitle></DialogHeader>
                <AddProductForm onProductAdded={handleProductAdded} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Improved Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/20 border border-blue-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.totalProducts")}</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{products.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/20 border border-yellow-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.lowStockProducts")}</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {products.filter(p => p.quantity < 10).length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/20 border border-green-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.totalStockQuantity")}</CardTitle>
                <Boxes className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {products.reduce((sum, p) => sum + p.quantity, 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/20 border border-purple-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.totalInventoryCost")}</CardTitle>
                <IndianRupee className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {t("inventory.currencyPrefix")} {
                    products.reduce(
                      (sum, p) => sum + (p.quantity * (p.costToMake ?? 0)),
                      0
                    )
                  }
                </p>
              </CardContent>
            </Card>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <Card key={product.id} className="rounded-xl overflow-hidden shadow hover:shadow-md transition">
                <div className="relative h-44 w-full">
                  <Image src={product.imageBase64} alt={product.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 right-2 bg-white text-black px-3 py-1 rounded-full text-xs font-semibold shadow">
                    {t("inventory.product.costLabel")}: {product.costToMake} {t("inventory.currencyShort")}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center">
                    <p>{t("inventory.product.stockLabel")}</p>
                    <span className={`px-2 py-1 rounded text-xs ${product.quantity === 0 ? "bg-red-200 text-red-700" :
                      product.quantity < 10 ? "bg-yellow-200 text-yellow-700" :
                        "bg-green-200 text-green-700"
                      }`}>
                      {product.quantity} {t("inventory.product.leftSuffix")}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="grid grid-cols-3 gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    {t("inventory.actions.delete")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsIncreaseQuantityOpen(true);
                    }}
                  >
                    {t("inventory.actions.addStock")}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsSellProductOpen(true);
                    }}
                  >
                    {t("inventory.actions.sell")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Sell Product Dialog */}
          <Dialog open={isSellProductOpen} onOpenChange={setIsSellProductOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inventory.dialogs.sell.title")} {selectedProduct?.name}</DialogTitle>
              </DialogHeader>

              {selectedProduct && (
                <SellProductForm
                  productId={selectedProduct.id}
                  productName={selectedProduct.name}
                  currentQuantity={selectedProduct.quantity}
                  onProductSold={handleProductSold}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Increase Quantity Dialog */}
          <Dialog open={isIncreaseQuantityOpen} onOpenChange={setIsIncreaseQuantityOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inventory.dialogs.addStockTo")} {selectedProduct?.name}</DialogTitle>
              </DialogHeader>

              {selectedProduct && (
                <IncreaseQuantityForm
                  productId={selectedProduct.id}
                  onQuantityIncreased={handleQuantityIncreased}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      {/* MATERIALS TAB */}
      <TabsContent value="materials">
        <div className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className='flex items-center'>
              <h2 className="text-xl font-bold">{t("inventory.materials.title")}</h2>
              <VoiceCommandButton
                onCommand={handleVoiceCommand}
                onStart={() => setVoiceStatus("listening")}
                onEnd={() => setVoiceStatus("analyzing")}
              />
            </div>

          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              className="gap-2 border-purple-200 hover:bg-purple-50 text-purple-700"
              onClick={handleSuggestProducts}
            >
              <Sparkles className="h-4 w-4" />
              {t("inventory.actions.suggestProducts")}
            </Button>

            <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
              <DialogTrigger asChild>
                <Button>{t("inventory.actions.addMaterial")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("inventory.modal.addMaterial.title")}</DialogTitle>
                </DialogHeader>
                <AddMaterialForm onMaterialAdded={handleMaterialAdded} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/20 border border-blue-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.totalMaterials")}</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{materials.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/20 border border-yellow-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.lowStockMaterials")}</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {materials.filter(m => m.quantity < 10).length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/20 border border-green-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.totalMaterialQuantity")}</CardTitle>
                <Boxes className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {materials.reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/20 border border-red-300/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("inventory.cards.outOfStockMaterials")}</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {materials.filter(m => m.quantity === 0).length}
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Material List */}
          <ul className="space-y-3">
            {materials.map((material) => (
              <li
                key={material.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">{material.name}</p>
                  <p className={`text-sm ${material.quantity < 10 ? "bg-yellow-200 text-yellow-600 rounded-lg inline-block px-2 py-1" : "text-muted-foreground"}`}>
                    {t("inventory.material.quantityPrefix")}: {material.quantity}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  {material.quantity < 10 && (
                    <Button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={() => router.push('/artisan-assist/sourcing-pricing')}
                    >
                      {t("inventory.actions.buyMaterial")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setIsIncreaseMaterialQuantityOpen(true);
                    }}
                  >
                    {t("inventory.actions.addStock")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setIsUseMaterialOpen(true);
                    }}
                  >
                    {t("inventory.actions.use")}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    {t("inventory.actions.delete")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* Use Material Dialog */}
          <Dialog open={isUseMaterialOpen} onOpenChange={setIsUseMaterialOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inventory.dialogs.use.title")} {selectedMaterial?.name}</DialogTitle>
              </DialogHeader>

              {selectedMaterial && (
                <UseMaterialForm
                  materialId={selectedMaterial.id}
                  currentQuantity={selectedMaterial.quantity}
                  onMaterialUsed={handleMaterialUsed}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Increase Material Quantity Dialog */}
          <Dialog open={isIncreaseMaterialQuantityOpen} onOpenChange={setIsIncreaseMaterialQuantityOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inventory.dialogs.addStockTo")} {selectedMaterial?.name}</DialogTitle>
              </DialogHeader>

              {selectedMaterial && (
                <IncreaseMaterialQuantityForm
                  materialId={selectedMaterial.id}
                  onQuantityIncreased={handleMaterialQuantityIncreased}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* AI Suggestions Dialog */}
          <Dialog open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {t("inventory.suggestions.title")}
                </DialogTitle>
              </DialogHeader>

              {isSuggesting ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                  <p className="text-muted-foreground animate-pulse">{t("inventory.suggestions.analyzing")}</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <Card key={index} className="border-purple-100 bg-purple-50/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-purple-900">{suggestion.productName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm text-purple-800 mb-1">{t("inventory.suggestions.whyThis")}</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-purple-800 mb-2">{t("inventory.suggestions.materialsRequired")}</h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.materialsRequired.map((material: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-white border border-purple-200 rounded-md text-xs font-medium text-purple-700 shadow-sm"
                                >
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("inventory.suggestions.none")}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      {/* ACCOUNTS TAB */}
      <TabsContent value="accounts">
        <AccountsTab />
      </TabsContent>

      {voiceStatus && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`
            px-4 py-2 rounded-lg shadow text-white text-sm font-medium
            ${voiceStatus === "listening" ? "bg-blue-500" : ""}
            ${voiceStatus === "analyzing" ? "bg-purple-600" : ""}
            ${voiceStatus === "success" ? "bg-green-600" : ""}
            ${voiceStatus === "error" ? "bg-red-600" : ""}
          `}>
            {voiceStatus === "listening" && t("inventory.voice.status.listening")}
            {voiceStatus === "analyzing" && t("inventory.voice.status.analyzing")}
            {voiceStatus === "success" && t("inventory.voice.status.success")}
            {voiceStatus === "error" && t("inventory.voice.status.error")}
          </div>
        </div>
      )}


    </Tabs>

  );
}
