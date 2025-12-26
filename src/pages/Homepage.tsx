import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, GripVertical, Sparkles, Tag, TrendingUp, FolderHeart, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const API_URL = 'http://localhost:5000/api';

type SectionType = 'new_products' | 'discounts' | 'popular' | 'popular_categories';

interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  discount?: number;
  categoryId: string;
  stock: number;
  active: boolean;
  image?: string;
  createdAt?: string;
}

interface Category {
  id: string;
  _id?: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

interface HomepageSection {
  id: string;
  type: SectionType;
  title: string;
  productIds?: string[];
  categoryIds?: string[];
  autoGenerate: boolean;
  maxItems: number;
  order: number;
  active: boolean;
}

const defaultSections: HomepageSection[] = [
  {
    id: 'new-products',
    type: 'new_products',
    title: 'Produse Noi',
    productIds: [],
    autoGenerate: true,
    maxItems: 6,
    order: 1,
    active: true,
  },
  {
    id: 'discounts',
    type: 'discounts',
    title: 'Reduceri',
    productIds: [],
    autoGenerate: true,
    maxItems: 6,
    order: 2,
    active: true,
  },
  {
    id: 'popular',
    type: 'popular',
    title: 'Cele Mai Căutate',
    productIds: [],
    autoGenerate: true,
    maxItems: 6,
    order: 3,
    active: true,
  },
  {
    id: 'popular-categories',
    type: 'popular_categories',
    title: 'Categorii Populare',
    categoryIds: [],
    autoGenerate: false,
    maxItems: 6,
    order: 4,
    active: true,
  },
];

const sectionIcons: Record<string, any> = {
  new_products: Sparkles,
  discounts: Tag,
  popular: TrendingUp,
  popular_categories: FolderHeart,
};

const sectionLabels: Record<string, string> = {
  new_products: 'Produse Noi',
  discounts: 'Reduceri',
  popular: 'Cele Mai Căutate',
  popular_categories: 'Categorii Populare',
};

export default function Homepage() {
  const [sections, setSections] = useState<HomepageSection[]>(defaultSections);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, sectionsRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/homepage`),
        ]);

        const mappedProducts: Product[] = productsRes.data.map((p: any) => ({
          ...p,
          id: p._id,
        }));
        const mappedCategories: Category[] = categoriesRes.data.map((c: any) => ({
          ...c,
          id: c._id,
        }));
        const mappedSections: HomepageSection[] = (sectionsRes.data || []).map((section: any) => ({
          ...section,
          id: section._id || section.id,
        }));

        setProducts(mappedProducts);
        setCategories(mappedCategories);
        setSections(mappedSections.length ? mappedSections : defaultSections);
      } catch (error) {
        console.error('Error fetching homepage data', error);
        toast({ title: 'Eroare la încărcarea datelor', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const flatCategories = useMemo(() => {
    const result: Category[] = [];
    const flatten = (cats: Category[]) => {
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children) flatten(cat.children);
      });
    };
    flatten(categories);
    return result;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    const base = products.filter(p => p.active);
    if (!term) return base;
    return base.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  }, [products, productSearch]);

  const persistSections = async (nextSections: HomepageSection[], successMessage = 'Configurarea a fost salvată') => {
    try {
      setIsSaving(true);
      await axios.put(`${API_URL}/homepage`, {
        sections: nextSections.map(({ id, ...rest }) => rest),
      });
      toast({ title: successMessage });
    } catch (error) {
      console.error('Error saving homepage configuration', error);
      toast({ title: 'Eroare la salvarea configurării', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDialog = (section: HomepageSection) => {
    setEditingSection(section);
    setSelectedProducts(section.productIds || []);
    setSelectedCategories(section.categoryIds || []);
    setProductSearch('');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingSection) return;

    const updatedSections = sections.map(s =>
      s.id === editingSection.id
        ? {
            ...s,
            productIds: selectedProducts,
            categoryIds: selectedCategories,
          }
        : s
    );

    setSections(updatedSections);
    await persistSections(updatedSections, 'Secțiune actualizată cu succes');
    setIsDialogOpen(false);
  };

  const toggleSectionActive = (id: string) => {
    const updatedSections = sections.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    setSections(updatedSections);
    void persistSections(updatedSections, 'Configurare actualizată');
  };

  const toggleAutoGenerate = (id: string) => {
    const updatedSections = sections.map(s =>
      s.id === id ? { ...s, autoGenerate: !s.autoGenerate } : s
    );
    setSections(updatedSections);
    void persistSections(updatedSections, 'Configurare actualizată');
  };

  const updateMaxItems = (id: string, maxItems: number) => {
    const updatedSections = sections.map(s =>
      s.id === id ? { ...s, maxItems } : s
    );
    setSections(updatedSections);
    void persistSections(updatedSections, 'Configurare actualizată');
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getProductsForSection = (section: HomepageSection): Product[] => {
    if (section.type === 'popular_categories') return [];

    const activeProducts = products.filter(p => p.active);

    if (section.autoGenerate) {
      if (section.type === 'new_products') {
        return [...activeProducts]
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, section.maxItems);
      }

      if (section.type === 'discounts') {
        return activeProducts
          .filter(p => {
            const hasDiscountPrice = p.discountPrice !== undefined && p.discountPrice < p.price;
            const hasDiscountPercent = p.discount !== undefined && p.discount > 0;
            return hasDiscountPrice || hasDiscountPercent;
          })
          .slice(0, section.maxItems);
      }

      if (section.type === 'popular') {
        return [...activeProducts]
          .sort((a, b) => (b.stock || 0) - (a.stock || 0))
          .slice(0, section.maxItems);
      }
    }

    return activeProducts.filter(p => section.productIds?.includes(p.id)).slice(0, section.maxItems);
  };

  const getCategoriesForSection = (section: HomepageSection): Category[] => {
    if (section.type !== 'popular_categories') return [];

    if (section.autoGenerate) {
      return flatCategories.filter(c => !c.parentId).slice(0, section.maxItems);
    }

    return flatCategories.filter(c => section.categoryIds?.includes(c.id)).slice(0, section.maxItems);
  };

  return (
    <AdminLayout title="Configurare Homepage">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-muted-foreground">
            Configurează secțiunile afișate pe pagina principală a magazinului
          </p>
          <Button
            onClick={() => persistSections(sections)}
            disabled={loading || isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Se salvează...
              </span>
            ) : (
              'Salvează configurarea'
            )}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă produse și categorii...
          </div>
        )}

        <div className="space-y-4">
          {sections.map(section => {
            const Icon = sectionIcons[section.type];
            const products = getProductsForSection(section);
            const categories = getCategoriesForSection(section);

            return (
              <Card key={section.id} className={`border border-border ${!section.active ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {sectionLabels[section.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Max:</Label>
                        <Input
                          type="number"
                          value={section.maxItems}
                          onChange={(e) => updateMaxItems(section.id, parseInt(e.target.value) || 4)}
                          className="w-16 h-8 text-sm"
                        />
                      </div>
                      {section.type !== 'popular_categories' && (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={section.autoGenerate}
                            onCheckedChange={() => toggleAutoGenerate(section.id)}
                          />
                          <Label className="text-xs">Auto</Label>
                        </div>
                      )}
                      <Switch
                        checked={section.active}
                        onCheckedChange={() => toggleSectionActive(section.id)}
                      />
                      <Dialog open={isDialogOpen && editingSection?.id === section.id} onOpenChange={(open) => {
                        if (!open) setIsDialogOpen(false);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(section)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editează
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editează: {section.title}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            {section.type === 'popular_categories' ? (
                              <div className="space-y-3">
                                <Label>Selectează Categoriile Populare</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                                  {flatCategories.filter(c => !c.parentId).map(cat => (
                                    <div
                                      key={cat.id}
                                      className={`flex items-center gap-2 p-3 border cursor-pointer transition-colors ${
                                        selectedCategories.includes(cat.id)
                                          ? 'border-primary bg-primary/5'
                                          : 'border-border hover:bg-muted/50'
                                      }`}
                                      onClick={() => toggleCategorySelection(cat.id)}
                                    >
                                      <Checkbox checked={selectedCategories.includes(cat.id)} />
                                      <span className="font-medium">{cat.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Label>Selectează Produsele</Label>
                                <div className="relative">
                                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                  <Input
                                    className="pl-9"
                                    placeholder="Caută produs după nume sau descriere"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                  />
                                </div>
                                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                                  {filteredProducts.map(product => (
                                    <div
                                      key={product.id}
                                      className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                                        selectedProducts.includes(product.id)
                                          ? 'border-primary bg-primary/5'
                                          : 'border-border hover:bg-muted/50'
                                      }`}
                                      onClick={() => toggleProductSelection(product.id)}
                                    >
                                      <Checkbox checked={selectedProducts.includes(product.id)} />
                                      {product.image && (
                                        <img
                                          src={product.image}
                                          alt={product.name}
                                          className="w-10 h-10 object-cover"
                                        />
                                      )}
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {product.discountPrice ? (
                                            <>
                                              <span className="line-through">{product.price}</span>{' '}
                                              <span className="text-green-600">{product.discountPrice} MDL</span>
                                            </>
                                          ) : (
                                            `${product.price} MDL`
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Anulează
                            </Button>
                            <Button onClick={handleSave}>Salvează</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {section.type === 'popular_categories' ? (
                      categories.length > 0 ? (
                        categories.map(cat => (
                          <Badge key={cat.id} variant="outline" className="text-xs">
                            {cat.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Nicio categorie selectată
                        </span>
                      )
                    ) : (
                      products.length > 0 ? (
                        products.map(product => (
                          <div key={product.id} className="flex items-center gap-2 p-2 border border-border">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-8 h-8 object-cover"
                              />
                            )}
                            <span className="text-xs">{product.name}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {section.autoGenerate ? 'Generat automat' : 'Niciun produs selectat'}
                        </span>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
