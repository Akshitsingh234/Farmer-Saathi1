"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Leaf, TrendingUp, AlertTriangle, Plus, Minus } from "lucide-react";

export default function FarmInventoryPage() {
  const [crops, setCrops] = useState([
    { id: 1, name: "Wheat", quantity: 500, unit: "kg", value: 15000, status: "Good" },
    { id: 2, name: "Rice", quantity: 300, unit: "kg", value: 18000, status: "Good" },
    { id: 3, name: "Tomatoes", quantity: 50, unit: "kg", value: 2500, status: "Low" }
  ]);

  const [inputs, setInputs] = useState([
    { id: 1, name: "Wheat Seeds", quantity: 25, unit: "kg", value: 2500, status: "Good" },
    { id: 2, name: "NPK Fertilizer", quantity: 5, unit: "bags", value: 1500, status: "Low" },
    { id: 3, name: "Pesticide", quantity: 10, unit: "liters", value: 3000, status: "Good" },
    { id: 4, name: "Urea", quantity: 2, unit: "bags", value: 800, status: "Critical" }
  ]);

  const [newItem, setNewItem] = useState({ name: "", quantity: 0, unit: "", value: 0 });
  const [showAddForm, setShowAddForm] = useState({ crops: false, inputs: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good": return "bg-green-100 text-green-800";
      case "Low": return "bg-yellow-100 text-yellow-800";
      case "Critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const updateQuantity = (type: 'crops' | 'inputs', id: number, change: number) => {
    if (type === 'crops') {
      setCrops(crops.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQty, status: newQty < 100 ? 'Low' : newQty < 50 ? 'Critical' : 'Good' };
        }
        return item;
      }));
    } else {
      setInputs(inputs.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQty, status: newQty < 5 ? 'Critical' : newQty < 10 ? 'Low' : 'Good' };
        }
        return item;
      }));
    }
  };

  const addItem = (type: 'crops' | 'inputs') => {
    if (!newItem.name || newItem.quantity <= 0) {
      alert("Please fill all fields");
      return;
    }

    const item = {
      id: Date.now(),
      ...newItem,
      status: newItem.quantity < (type === 'crops' ? 100 : 10) ? 'Low' : 'Good'
    };

    if (type === 'crops') {
      setCrops([...crops, item]);
    } else {
      setInputs([...inputs, item]);
    }

    setNewItem({ name: "", quantity: 0, unit: "", value: 0 });
    setShowAddForm({ ...showAddForm, [type]: false });
  };

  const totalCropValue = crops.reduce((sum, item) => sum + item.value, 0);
  const totalInputValue = inputs.reduce((sum, item) => sum + item.value, 0);
  const lowStockCrops = crops.filter(item => item.status === 'Low' || item.status === 'Critical').length;
  const lowStockInputs = inputs.filter(item => item.status === 'Low' || item.status === 'Critical').length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Package className="h-8 w-8 text-green-600" />
          Farm Inventory
        </h1>
        <p className="text-muted-foreground">
          Track seeds, fertilizers, equipment, and harvest quantities efficiently
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Crops</p>
                <p className="text-2xl font-bold">₹{totalCropValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Inputs</p>
                <p className="text-2xl font-bold">₹{totalInputValue.toLocaleString()}</p>
              </div>
              <Leaf className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Crops</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockCrops}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Inputs</p>
                <p className="text-2xl font-bold text-red-600">{lowStockInputs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Tabs */}
      <Tabs defaultValue="crops" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crops">Crops/Produce</TabsTrigger>
          <TabsTrigger value="inputs">Seeds & Inputs</TabsTrigger>
        </TabsList>

        {/* Crops Tab */}
        <TabsContent value="crops" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Crops & Produce</h2>
            <Button 
              onClick={() => setShowAddForm({ ...showAddForm, crops: !showAddForm.crops })}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm.crops ? "Cancel" : "Add Crop"}
            </Button>
          </div>

          {showAddForm.crops && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Crop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Crop name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                  <Input
                    placeholder="Unit (kg, tons)"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Value (₹)"
                    value={newItem.value}
                    onChange={(e) => setNewItem({...newItem, value: Number(e.target.value)})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => addItem('crops')}>Add Crop</Button>
                  <Button variant="outline" onClick={() => setShowAddForm({ ...showAddForm, crops: false })}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops.map((crop) => (
              <Card key={crop.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{crop.name}</CardTitle>
                    <Badge className={getStatusColor(crop.status)}>{crop.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{crop.quantity} {crop.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <span className="font-medium">₹{crop.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQuantity('crops', crop.id, -10)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm">Update Stock</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQuantity('crops', crop.id, 10)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Inputs Tab */}
        <TabsContent value="inputs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Seeds & Inputs</h2>
            <Button 
              onClick={() => setShowAddForm({ ...showAddForm, inputs: !showAddForm.inputs })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm.inputs ? "Cancel" : "Add Input"}
            </Button>
          </div>

          {showAddForm.inputs && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Input name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                  <Input
                    placeholder="Unit (kg, bags, liters)"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Value (₹)"
                    value={newItem.value}
                    onChange={(e) => setNewItem({...newItem, value: Number(e.target.value)})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => addItem('inputs')}>Add Input</Button>
                  <Button variant="outline" onClick={() => setShowAddForm({ ...showAddForm, inputs: false })}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inputs.map((input) => (
              <Card key={input.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{input.name}</CardTitle>
                    <Badge className={getStatusColor(input.status)}>{input.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{input.quantity} {input.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <span className="font-medium">₹{input.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQuantity('inputs', input.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm">Update Stock</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQuantity('inputs', input.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
