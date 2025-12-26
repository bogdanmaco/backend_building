import { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Banner } from '@/types/admin';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:5000/api';

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    image: '',
    link: '',
    isActive: true,
  });

  // Fetch banners din API
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/banners`);
      const bannersWithId = response.data.map((banner: any) => ({
        ...banner,
        id: banner._id,
      }));
      setBanners(bannersWithId);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({ title: 'Eroare la încărcarea bannerelor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        image: banner.image,
        link: banner.link,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        image: '',
        link: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingBanner) {
        // Update banner
        await axios.put(`${API_URL}/banners/${editingBanner.id}`, formData);
        toast({ title: 'Banner actualizat cu succes' });
      } else {
        // Create new banner
        await axios.post(`${API_URL}/banners`, formData);
        toast({ title: 'Banner adăugat cu succes' });
      }
      setIsDialogOpen(false);
      fetchBanners(); // Refresh list
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({ title: 'Eroare la salvarea bannerului', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/banners/${id}`);
      toast({ title: 'Banner șters cu succes' });
      fetchBanners(); // Refresh list
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({ title: 'Eroare la ștergerea bannerului', variant: 'destructive' });
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await axios.put(`${API_URL}/banners/${banner.id}`, {
        image: banner.image,
        link: banner.link,
        isActive: !banner.isActive,
      });
      fetchBanners(); // Refresh list
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({ title: 'Eroare la actualizare', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Bannere Hero">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gestionează bannerele afișate pe pagina principală
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? 'Editează Banner' : 'Adaugă Banner Nou'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                <div className="space-y-2">
                  <Label>Link (URL destinație)</Label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/pagina-destinatie"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Activ</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Anulează
                </Button>
                <Button onClick={handleSave}>
                  {editingBanner ? 'Salvează' : 'Adaugă'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Încărcare...</div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <Card key={banner.id} className={`border border-border ${!banner.isActive ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    </div>
                    <img
                      src={banner.image}
                      alt="Banner"
                      className="w-48 h-24 object-cover border border-border"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mt-1">
                        Link: {banner.link}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => toggleActive(banner)}
                      />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(banner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
