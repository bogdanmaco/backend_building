import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'http://localhost:5000/api';

type OrderStatus = 'pending' | 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderRecord {
  _id: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: string;
  deliveryMethod?: 'courier' | 'pickup';
  products: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-blue-500 text-white',
  new: 'bg-blue-500 text-white',
  processing: 'bg-yellow-500 text-white',
  shipped: 'bg-purple-500 text-white',
  delivered: 'bg-green-500 text-white',
  cancelled: 'bg-red-500 text-white',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Nouă',
  new: 'Nouă',
  processing: 'În procesare',
  shipped: 'Expediată',
  delivered: 'Livrată',
  cancelled: 'Anulată',
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { token, user } = useAuth();

  const filteredOrders = useMemo(
    () =>
      orders.filter(order =>
        statusFilter === 'all' ? true : order.status === statusFilter
      ),
    [orders, statusFilter]
  );

  const fetchOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (error) {
      toast({ title: 'Nu am putut încărca comenzile', description: 'Verifică dacă ești autentificat ca admin.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order =>
      order._id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
    try {
      if (token) {
        await axios.put(
          `${API_URL}/orders/${orderId}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast({ title: `Status comandă actualizat: ${statusLabels[newStatus]}` });
    } catch (error) {
      toast({ title: 'Eroare la actualizare', description: 'Reîncearcă actualizarea statusului.' });
      fetchOrders();
    }
  };

  const handleViewOrder = (order: OrderRecord) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    new: orders.filter(o => o.status === 'new').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }), [orders]);

  return (
    <AdminLayout title="Gestiune Comenzi">
      <div className="space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Toate', count: counts.all },
            { value: 'pending', label: 'Noi', count: counts.pending + counts.new },
            { value: 'processing', label: 'În procesare', count: counts.processing },
            { value: 'shipped', label: 'Expediate', count: counts.shipped },
            { value: 'delivered', label: 'Livrate', count: counts.delivered },
            { value: 'cancelled', label: 'Anulate', count: counts.cancelled },
          ].map(tab => (
            <Button
              key={tab.value}
              variant={statusFilter === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
              className="gap-2"
            >
              {tab.label}
              <Badge variant="secondary" className="text-xs">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        <Card className="border border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Comandă</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Produse</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const fullName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Client guest';
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-sm">#{order._id.slice(-6)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{fullName}</p>
                          <p className="text-xs text-muted-foreground">{order.customer?.email || '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{order.products.length} produs(e)</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {order.totalPrice} MDL
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value: OrderStatus) => handleStatusChange(order._id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <Badge className={`${statusColors[order.status]} text-xs`}>
                              {statusLabels[order.status]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Comandă #{selectedOrder?._id.slice(-6)}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium">{`${selectedOrder.customer?.firstName || ''} ${selectedOrder.customer?.lastName || ''}`.trim() || 'Client guest'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={`${statusColors[selectedOrder.status]}`}>
                      {statusLabels[selectedOrder.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedOrder.customer?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefon</p>
                    <p className="text-sm">{selectedOrder.customer?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Metodă Livrare</p>
                    <p className="text-sm">{selectedOrder.deliveryMethod === 'pickup' ? 'Ridicare Chișinău' : 'Curier'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Adresă Livrare</p>
                    <p className="text-sm">{selectedOrder.shippingAddress || '—'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Produse Comandate</p>
                  <div className="space-y-2">
                    {selectedOrder.products.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border border-border">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {item.price} MDL
                          </p>
                        </div>
                        <span className="font-medium">
                          {item.quantity * item.price} MDL
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Comandă</span>
                  <span className="text-xl font-bold">{selectedOrder.totalPrice} MDL</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Creat: {new Date(selectedOrder.createdAt).toLocaleString('ro-RO')}</p>
                  <p>Actualizat: {new Date(selectedOrder.updatedAt).toLocaleString('ro-RO')}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
