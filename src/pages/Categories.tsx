import { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Building2, Paintbrush, LayoutGrid, DoorOpen, Bath, Droplets, Flame, Zap, Lightbulb, Wrench, Hammer, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_URL = 'http://localhost:5000/api';

// Iconiți disponibile pentru categorii
const AVAILABLE_ICONS = [
  { name: 'Building2', label: 'Clădire' },
  { name: 'Paintbrush', label: 'Vopsea' },
  { name: 'LayoutGrid', label: 'Gresie' },
  { name: 'DoorOpen', label: 'Ușă' },
  { name: 'Bath', label: 'Baie' },
  { name: 'Droplets', label: 'Apă' },
  { name: 'Flame', label: 'Flacără' },
  { name: 'Zap', label: 'Electricitate' },
  { name: 'Lightbulb', label: 'Lumină' },
  { name: 'Wrench', label: 'Cheie' },
  { name: 'Hammer', label: 'Ciocan' },
  { name: 'Package', label: 'Pachet' },
];

const ICON_MAP: Record<string, any> = {
  Building2,
  Paintbrush,
  LayoutGrid,
  DoorOpen,
  Bath,
  Droplets,
  Flame,
  Zap,
  Lightbulb,
  Wrench,
  Hammer,
  Package,
};

interface Category {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  children?: Category[];
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentId: '',
    icon: 'Package',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      const categoriesWithChildren = await Promise.all(
        response.data.map(async (category: any) => {
          const childrenRes = await axios.get(`${API_URL}/categories/${category._id}/children`);
          return {
            ...category,
            id: category._id,
            children: childrenRes.data.map((c: any) => ({ ...c, id: c._id })),
          };
        })
      );
      setCategories(categoriesWithChildren);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({ title: 'Eroare la încărcarea categoriilor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleOpenDialog = (category?: Category, parentId?: string) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        icon: category.icon || 'Package',
        parentId: category.parentId || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        icon: 'Package',
        parentId: parentId || '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast({ title: 'Completează numele categoriei', variant: 'destructive' });
        return;
      }

      const dataToSend = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        icon: formData.parentId ? undefined : formData.icon, // Icon doar pentru categorii principale
        parentId: formData.parentId && formData.parentId.trim() !== '' ? formData.parentId : null,
      };

      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory.id}`, dataToSend);
        toast({ title: 'Categorie actualizată cu succes' });
      } else {
        await axios.post(`${API_URL}/categories`, dataToSend);
        toast({ title: 'Categorie adăugată cu succes' });
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response?.data);
      toast({ title: 'Eroare la salvarea categoriei', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      toast({ title: 'Categorie ștearsă cu succes' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Eroare la ștergerea categoriei', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Categorii">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gestionează categoriile și subcategoriile produselor
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Categorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editează Categorie' : 'Adaugă Categorie Nouă'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {formData.parentId && (
                  <div className="space-y-2">
                    <Label>Subcategorie din</Label>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm font-medium">
                        {categories.find((c) => c.id === formData.parentId)?.name}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Nume Categorie</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Materiale de construcții"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descriere</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrierea categoriei"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Imagine</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.image && (
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-full h-32 object-cover border border-border mt-2"
                    />
                  )}
                </div>
                
                {!formData.parentId && (
                  <div className="space-y-2">
                    <Label>Iconiță (doar pentru categoria principală)</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((icon) => {
                          const IconComponent = ICON_MAP[icon.name];
                          return (
                            <SelectItem key={icon.name} value={icon.name}>
                              <div className="flex items-center gap-2">
                                {IconComponent && <IconComponent size={16} className="inline" />}
                                <span>{icon.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Anulează
                </Button>
                <Button onClick={handleSave}>
                  {editingCategory ? 'Salvează' : 'Adaugă'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Încărcare...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nu există categorii. Adaugă una!
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {category.children && category.children.length > 0 && (
                          <button
                            onClick={() => toggleExpand(category.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            {expandedIds.includes(category.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-20 h-20 object-cover border border-border rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base">{category.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {category.description}
                            </p>
                            {category.children && category.children.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {category.children.length} subcategorii
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(undefined, category.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {expandedIds.includes(category.id) && category.children && category.children.length > 0 && (
                      <div className="mt-4 ml-6 space-y-2 border-l border-border pl-4">
                        {category.children.map((subcategory) => (
                          <Card key={subcategory.id} className="bg-muted/50">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3 justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm">{subcategory.name}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                    {subcategory.description}
                                  </p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(subcategory)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(subcategory.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed"
                          onClick={() => handleOpenDialog(undefined, category.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adaugă Subcategorie
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
