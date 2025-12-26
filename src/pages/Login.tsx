import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    const savedRemember = localStorage.getItem('remember_enabled');
    if (savedEmail) setEmail(savedEmail);
    if (savedRemember === 'true') setRemember(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email.trim(), password.trim());
      if (remember) {
        localStorage.setItem('remember_email', email);
        localStorage.setItem('remember_enabled', 'true');
      } else {
        localStorage.removeItem('remember_email');
        localStorage.removeItem('remember_enabled');
      }
      const redirectTo = (location.state as any)?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
      toast({ title: 'Autentificare reușită' });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Autentificare eșuată';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Autentificare" hideSidebar>
      <div className="flex items-center justify-center py-10">
        <Card className="w-full max-w-md border border-border">
          <CardHeader className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Autentificare Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  name="username"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parolă</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parola admin"
                  name="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="remember">Ține minte emailul</Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se autentifică...
                  </span>
                ) : (
                  'Autentifică-te'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
