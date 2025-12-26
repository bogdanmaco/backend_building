import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const API_URL = 'http://localhost:5000/api';

interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  discount?: number;
  categoryId: string;
  subcategoryId?: string;
  stock: number;
  active: boolean;
  image?: string;
  images?: string[];
}

interface Category {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  children?: Category[];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    discount: '',
    categoryId: '',
    subcategoryId: '',
    stock: '',
    active: true,
    image: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/categories`)
      ]);
      
      const prods = productsRes.data.map((p: any) => ({
        ...p,
        id: p._id,
      }));
      setProducts(prods);

      // Fetch children for each category
      const catsWithChildren = await Promise.all(
        categoriesRes.data.map(async (c: any) => {
          try {
            const childrenRes = await axios.get(`${API_URL}/categories/${c._id}/children`);
            return {
              ...c,
              id: c._id,
              children: childrenRes.data.map((child: any) => ({
                ...child,
                id: child._id,
              })),
            };
          } catch (err) {
            return {
              ...c,
              id: c._id,
              children: [],
            };
          }
        })
      );
      setCategories(catsWithChildren);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Eroare la încărcarea datelor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Flatten categories for dropdown
  const flatCategories = useMemo(() => {
    const result: { id: string; name: string }[] = [];
    const flatten = (cats: Category[], prefix = '') => {
      cats.forEach(cat => {
        result.push({ 
          id: cat.id, 
          name: prefix + cat.name,
        });
        if (cat.children) {
          flatten(cat.children, prefix + cat.name + ' > ');
        }
      });
    };
    flatten(categories);
    return result;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const getCategoryName = (categoryId: string) => {
    return flatCategories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() || '',
        discount: product.discount?.toString() || '',
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || '',
        stock: product.stock.toString(),
        active: product.active,
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        discount: '',
        categoryId: '',
        subcategoryId: '',
        stock: '',
        active: true,
        image: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, categoryId, subcategoryId: '' });
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.categoryId || !formData.price) {
        toast({ title: 'Completează toate câmpurile obligatorii', variant: 'destructive' });
        return;
      }

      const dataToSend = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        discount: formData.discount ? parseInt(formData.discount) : undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        stock: parseInt(formData.stock) || 0,
        active: formData.active,
        image: formData.image,
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct._id || editingProduct.id}`, dataToSend);
        toast({ title: 'Produs actualizat cu succes' });
      } else {
        await axios.post(`${API_URL}/products`, dataToSend);
        toast({ title: 'Produs adăugat cu succes' });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      toast({ title: 'Eroare la salvarea produsului', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      toast({ title: 'Produs șters cu succes' });
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: 'Eroare la ștergerea produsului', variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string) => {
    const product = products.find(p => p.id === id || p._id === id);
    if (!product) return;
    
    try {
      await axios.put(`${API_URL}/products/${product._id || product.id}`, {
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        discount: product.discount,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        stock: product.stock,
        active: !product.active,
        image: product.image,
      });
      fetchData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({ title: 'Eroare la actualizarea produsului', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Produse">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută produse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate categoriile</SelectItem>
                {flatCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Produs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Nume Produs</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Numele produsului"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descriere</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrierea produsului"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preț (MDL)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preț Redus (MDL) - opțional</Label>
                    <Input
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reducere (%) - opțional</Label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categorie</Label>
                    <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {flatCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.categoryId && (
                    <div className="space-y-2">
                      <Label>Subcategorie (opțional)</Label>
                      <Select value={formData.subcategoryId} onValueChange={(value) => setFormData({ ...formData, subcategoryId: value === 'none' ? '' : value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">- Fără subcategorie -</SelectItem>
                          {flatCategories
                            .filter(cat => {
                              const selectedCategory = categories.find(c => c.id === formData.categoryId);
                              return selectedCategory?.children?.some(child => child.id === cat.id);
                            })
                            .map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name.split(' > ').pop()}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Stoc</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>URL Imagine</Label>
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label>Produs Activ</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Anulează
                </Button>
                <Button onClick={handleSave}>
                  {editingProduct ? 'Salvează' : 'Adaugă'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagine</TableHead>
                  <TableHead>Produs</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead className="text-right">Preț</TableHead>
                  <TableHead className="text-center">Stoc</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id} className={!product.active ? 'opacity-50' : ''} style={!product.active ? { filter: 'grayscale(100%)' } : {}}>
                    <TableCell>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getCategoryName(product.categoryId)}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.discountPrice ? (
                        <div>
                          <span className="line-through text-muted-foreground text-xs">
                            {product.price} MDL
                          </span>
                          <br />
                          <span className="font-medium text-green-600">
                            {product.discountPrice} MDL
                          </span>
                        </div>
                      ) : (
                        <span>{product.price} MDL</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={product.active}
                        onCheckedChange={() => toggleActive(product._id || product.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product._id || product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
