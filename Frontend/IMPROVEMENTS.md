# Frontend Yaxshilashlari

## 🔴 Muhim Muammolar va Yechimlar

### 1. API Error Handling yo'q
**Muammo:** Axios interceptor va global error handler yo'q
**Yechim:**

```typescript
// app/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - error handling va token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired - refresh qilish
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/v1/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh ham ishlamasa - logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 2. Loading States yo'q
**Muammo:** API so'rovlarda loading state boshqarilmaydi
**Yechim:**

```typescript
// app/hooks/useApi.ts
import { useState } from 'react';
import api from '@/app/lib/axios';

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    payload?: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api[method](url, payload);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Xatolik yuz berdi';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, execute };
}
```

### 3. Form Validation yo'q
**Muammo:** Formalar validatsiyasiz
**Yechim:**

```bash
npm install react-hook-form zod @hookform/resolvers
```

```typescript
// app/lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string()
    .min(9, 'Telefon raqam 9 ta raqamdan kam bo\'lmasligi kerak')
    .regex(/^998[0-9]{9}$/, 'Telefon raqam 998 bilan boshlanishi kerak'),
  password: z.string()
    .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Parol katta va kichik harflar hamda raqamlardan iborat bo\'lishi kerak'),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string()
    .min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak')
    .max(100, 'Ism 100 ta belgidan oshmasligi kerak'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parollar mos kelmaydi',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

```typescript
// app/(pages)/login/page.tsx - misol
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/app/lib/validations/auth';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('phone')} />
      {errors.phone && <span>{errors.phone.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Kirish</button>
    </form>
  );
}
```

### 4. SEO Optimization yo'q
**Muammo:** Metadata va SEO sozlanmagan
**Yechim:**

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'N27 LMS - O\'quv Platformasi',
    template: '%s | N27 LMS',
  },
  description: 'Zamonaviy online o\'quv platformasi. Kurslar, darslar va imtihonlar.',
  keywords: ['online kurslar', 'o\'quv platformasi', 'LMS', 'N27'],
  authors: [{ name: 'N27 Team' }],
  openGraph: {
    title: 'N27 LMS',
    description: 'Zamonaviy online o\'quv platformasi',
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'N27 LMS',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

```typescript
// app/(pages)/courses/[id]/page.tsx - dinamik metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const course = await fetchCourse(params.id);

  return {
    title: course.name,
    description: course.description,
    openGraph: {
      title: course.name,
      description: course.description,
      images: [course.banner],
    },
  };
}
```

### 5. Environment Variables xavfsizligi
**Muammo:** `.env.local` faylida API URL hardcoded
**Yechim:**

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend uchun (server-side)
API_URL=http://localhost:3000/api/v1
```

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // ...
};
```

### 6. Image Optimization
**Muammo:** Rasmlar optimizatsiya qilinmagan
**Yechim:**

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      quality={85}
    />
  );
}
```

### 7. Toast Notifications Yaxshilash
**Muammo:** Toast system sodda
**Yechim:**

```bash
npm install sonner
```

```typescript
// app/providers/toast-provider.tsx
'use client';

import { Toaster } from 'sonner';

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
      />
    </>
  );
}
```

```typescript
// Ishlatish
import { toast } from 'sonner';

toast.success('Muvaffaqiyatli saqlandi!');
toast.error('Xatolik yuz berdi!');
toast.loading('Yuklanmoqda...');
```

### 8. Auth State Management
**Muammo:** Auth state management yaxshilanishi kerak
**Yechim:**

```typescript
// app/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  fullName: string;
  phone: string;
  role: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 9. Protected Routes
**Muammo:** Route protection yo'q
**Yechim:**

```typescript
// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register', '/courses'];
const authRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/profile', '/my-courses'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Auth routelarga kirganida token bo'lsa - dashboard
  if (authRoutes.some(route => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routelarga kirganida token yo'q bo'lsa - login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 10. Performance Optimization
**Muammo:** Code splitting va lazy loading yo'q
**Yechim:**

```typescript
// Dynamic imports
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <div>Yuklanmoqda...</div>,
  ssr: false,
});

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

```typescript
// React.lazy va Suspense
import { lazy, Suspense } from 'react';

const CourseCard = lazy(() => import('@/components/CourseCard'));

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CourseCard />
    </Suspense>
  );
}
```

## 🎨 UI/UX Yaxshilashlari

### 11. Skeleton Loaders
```typescript
// components/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

// Ishlatish
export function CourseCardSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

### 12. Infinite Scroll yoki Pagination
```bash
npm install react-intersection-observer
```

```typescript
// hooks/useInfiniteScroll.ts
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasMore) {
      callback();
    }
  }, [inView, hasMore, callback]);

  return ref;
}
```

### 13. Analytics Integration
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 📱 PWA Support
```bash
npm install next-pwa
```

```typescript
// next.config.ts
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

export default config;
```

## 🧪 Testing
```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
};
```
