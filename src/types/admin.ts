// Types for Admin Panel

export interface Banner {
  id: string;
  image: string;
  link: string;
  position: number;
  isActive: boolean;
}

export interface CategorySpecification {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  unit?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  specifications: CategorySpecification[];
  children?: Category[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface ProductSpecification {
  specificationId: string;
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  specifications: ProductSpecification[];
  images: ProductImage[];
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageSection {
  id: string;
  type: 'new_products' | 'discounts' | 'popular' | 'popular_categories';
  title: string;
  productIds?: string[];
  categoryIds?: string[];
  autoGenerate: boolean;
  maxItems: number;
  order: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string;
}

export interface DashboardStats {
  totalOrders: number;
  monthlySales: number;
  totalProducts: number;
  activeUsers: number;
  salesData: { date: string; amount: number }[];
  recentOrders: Order[];
  lowStockProducts: Product[];
}
