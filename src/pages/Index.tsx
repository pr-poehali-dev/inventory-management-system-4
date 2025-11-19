import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceItem {
  product: Product;
  quantity: number;
}

interface Invoice {
  id: string;
  date: string;
  items: InvoiceItem[];
  total: number;
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Ноутбук Dell XPS 15', quantity: 12, price: 85000 },
    { id: '2', name: 'Монитор Samsung 27"', quantity: 25, price: 18500 },
    { id: '3', name: 'Клавиатура Logitech', quantity: 45, price: 3200 },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: 0, price: 0 });
  const [activeTab, setActiveTab] = useState('products');
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addProduct = () => {
    if (!newProduct.name || newProduct.quantity <= 0 || newProduct.price <= 0) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните все поля корректно',
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      ...newProduct,
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', quantity: 0, price: 0 });
    setIsAddProductOpen(false);
    toast({
      title: 'Товар добавлен',
      description: `${product.name} успешно добавлен на склад`,
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: 'Товар удален',
      description: 'Товар успешно удален из списка',
    });
  };

  const addToInvoice = (product: Product, quantity: number) => {
    if (quantity > product.quantity) {
      toast({
        variant: 'destructive',
        title: 'Недостаточно товара',
        description: `На складе только ${product.quantity} шт.`,
      });
      return;
    }

    const existingItem = selectedItems.find(item => item.product.id === product.id);
    if (existingItem) {
      setSelectedItems(
        selectedItems.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { product, quantity }]);
    }

    toast({
      title: 'Добавлено в накладную',
      description: `${product.name} x${quantity}`,
    });
  };

  const removeFromInvoice = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const createInvoice = () => {
    if (selectedItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Пустая накладная',
        description: 'Добавьте хотя бы один товар',
      });
      return;
    }

    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('ru-RU'),
      items: selectedItems,
      total: calculateTotal(),
    };

    selectedItems.forEach(item => {
      setProducts(products.map(p =>
        p.id === item.product.id ? { ...p, quantity: p.quantity - item.quantity } : p
      ));
    });

    setInvoices([invoice, ...invoices]);
    setSelectedItems([]);
    setIsCreateInvoiceOpen(false);
    toast({
      title: 'Накладная создана',
      description: `Накладная ${invoice.id} успешно создана`,
    });
  };

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Накладная ${invoice.id}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            font-family: 'Open Sans', Arial, sans-serif;
            margin: 0;
            padding: 20mm;
            display: flex;
            gap: 10mm;
          }
          .invoice {
            width: 148mm;
            height: 210mm;
            padding: 10mm;
            border: 1px solid #ddd;
            box-sizing: border-box;
          }
          h1 {
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 18pt;
            margin: 0 0 5mm;
            color: #6366F1;
          }
          .meta {
            margin-bottom: 8mm;
            font-size: 10pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 5mm 0;
            font-size: 9pt;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 3mm;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          .total {
            margin-top: 8mm;
            font-size: 14pt;
            font-weight: bold;
            text-align: right;
            color: #6366F1;
          }
          .text-right {
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <h1>НАКЛАДНАЯ</h1>
          <div class="meta">
            <div><strong>Номер:</strong> ${invoice.id}</div>
            <div><strong>Дата:</strong> ${invoice.date}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Наименование</th>
                <th class="text-right">Кол-во</th>
                <th class="text-right">Цена</th>
                <th class="text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product.name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${item.product.price.toLocaleString('ru-RU')} ₽</td>
                  <td class="text-right">${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="total">
            ИТОГО: ${invoice.total.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getTotalValue = () => {
    return products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Складская система</h1>
          <p className="text-muted-foreground">Управление товарами и создание накладных</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Package" size={20} className="text-primary" />
                Товаров на складе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{products.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="TrendingUp" size={20} className="text-primary" />
                Общая стоимость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{getTotalValue().toLocaleString('ru-RU')} ₽</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="FileText" size={20} className="text-primary" />
                Накладных создано
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="products" className="data-[state=active]:shadow-md py-3">
              <Icon name="Package" size={18} className="mr-2" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="invoice" className="data-[state=active]:shadow-md py-3">
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              Создать накладную
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:shadow-md py-3">
              <Icon name="History" size={18} className="mr-2" />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Список товаров</CardTitle>
                    <CardDescription>Управление ассортиментом склада</CardDescription>
                  </div>
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button className="shadow-md">
                        <Icon name="Plus" size={18} className="mr-2" />
                        Добавить товар
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый товар</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Наименование</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Введите название товара"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity">Количество</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={newProduct.quantity || ''}
                            onChange={e => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Цена (₽)</Label>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            value={newProduct.price || ''}
                            onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                          />
                        </div>
                        <Button onClick={addProduct} className="w-full">
                          Добавить
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Наименование</TableHead>
                      <TableHead className="text-right">Количество</TableHead>
                      <TableHead className="text-right">Цена</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={product.quantity < 10 ? 'destructive' : 'secondary'}>
                            {product.quantity} шт
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{product.price.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell className="text-right font-semibold">
                          {(product.quantity * product.price).toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProduct(product.id)}
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Выбор товаров</CardTitle>
                  <CardDescription>Добавьте товары в накладную</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {products.map(product => (
                    <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            В наличии: {product.quantity} шт • {product.price.toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          max={product.quantity}
                          placeholder="Кол-во"
                          className="w-24"
                          id={`qty-${product.id}`}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(`qty-${product.id}`) as HTMLInputElement;
                            const qty = parseInt(input.value) || 1;
                            addToInvoice(product, qty);
                            input.value = '';
                          }}
                          className="flex-1"
                        >
                          <Icon name="Plus" size={16} className="mr-1" />
                          Добавить
                        </Button>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Текущая накладная</CardTitle>
                  <CardDescription>Товары для оформления</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="ShoppingCart" size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Накладная пуста</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {selectedItems.map(item => (
                          <div key={item.product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity} шт × {item.product.price.toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="font-semibold text-primary">
                                {(item.quantity * item.product.price).toLocaleString('ru-RU')} ₽
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromInvoice(item.product.id)}
                              >
                                <Icon name="X" size={18} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Итого:</span>
                          <span className="text-primary">{calculateTotal().toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <Button onClick={createInvoice} className="w-full shadow-md" size="lg">
                          <Icon name="FileCheck" size={20} className="mr-2" />
                          Создать накладную
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>История накладных</CardTitle>
                <CardDescription>Все созданные накладные</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="FileText" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>История пуста</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map(invoice => (
                      <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-semibold text-lg">{invoice.id}</div>
                              <div className="text-sm text-muted-foreground">{invoice.date}</div>
                            </div>
                            <Button onClick={() => printInvoice(invoice)} size="sm" className="shadow">
                              <Icon name="Printer" size={16} className="mr-2" />
                              Печать
                            </Button>
                          </div>
                          <div className="space-y-1 text-sm mb-3">
                            {invoice.items.map(item => (
                              <div key={item.product.id} className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {item.product.name} × {item.quantity}
                                </span>
                                <span>{(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 flex justify-between font-semibold text-primary">
                            <span>Итого:</span>
                            <span>{invoice.total.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
