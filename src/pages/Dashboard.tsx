import { useEffect, useState } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Package, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { DashboardStats, OrderStatus } from '@/types/admin';

const API_URL = 'http://localhost:5000/api';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500 text-white',
  processing: 'bg-yellow-500 text-white',
  shipped: 'bg-purple-500 text-white',
  delivered: 'bg-green-500 text-white',
  cancelled: 'bg-red-500 text-white',
};

const statusLabels: Record<string, string> = {
  new: 'Nouă',
  processing: 'În procesare',
  shipped: 'Expediată',
  delivered: 'Livrată',
  cancelled: 'Anulată',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/dashboard`);
        const payload = res.data || {};

        setStats({
          totalOrders: payload.totalOrders || 0,
          monthlySales: payload.monthlySales || 0,
          totalProducts: payload.totalProducts || 0,
          activeUsers: payload.activeUsers || 0,
          salesData: payload.salesData || [],
          recentOrders: payload.recentOrders || [],
          lowStockProducts: payload.lowStockProducts || [],
        });

        setRecentOrders((payload.recentOrders || []).map((o: any) => ({
          id: o.id,
          customerName: o.customerName || 'Client',
          customerEmail: o.customerEmail || '',
          total: o.total || 0,
          status: (o.status as OrderStatus) || 'processing',
          createdAt: o.createdAt,
        })));
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă datele din baza de date...
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Comenzi
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
              <p className="text-xs text-muted-foreground">+12% față de luna trecută</p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vânzări Luna Curentă
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats?.monthlySales ?? 0).toLocaleString()} MDL</div>
              <p className="text-xs text-muted-foreground">+8% față de luna trecută</p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produse în Stoc
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts ?? 0}</div>
              <p className="text-xs text-muted-foreground">5 produse noi săptămâna aceasta</p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Utilizatori Activi
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers ?? 0}</div>
              <p className="text-xs text-muted-foreground">+15 utilizatori noi</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Vânzări Ultimele 7 Zile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.salesData || []}>
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} MDL`, 'Vânzări']}
                      contentStyle={{ borderRadius: 0, border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Comenzi Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nu există comenzi recente.</p>
                )}
                {recentOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-border">
                    <div>
                      <p className="font-medium text-sm">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ro-RO') : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{order.total} MDL</p>
                      <Badge className={`${statusColors[order.status]} text-xs`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Products */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-base">Produse cu Stoc Scăzut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(stats?.lowStockProducts || []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nu există produse cu stoc scăzut.</p>
              )}
              {(stats?.lowStockProducts || []).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border border-border">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url || ''}
                      alt={product.name}
                      className="w-10 h-10 object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.price} MDL</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Stoc: {product.stock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
