// App.tsx (обновленный с вашим Layout)
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/use-cart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "./components/Layout"; // используем ваш Layout
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import {FAQPage} from "./pages/FAQPage";
import CreditPage from "./pages/CreditPage";
import CompanyPage from "./pages/CompanyPages";
import DeliveryPage from "./pages/DeliveryPage";
import ContactsPage from "./pages/ContactsPage";
import SearchResults from "./pages/SearchResult";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-confirmation" element={<OrderConfirmation />} />
                <Route path="category/:categorySlug" element={<Category />} />
                <Route path="category/:categorySlug/:subCategorySlug" element={<Category />} />
                <Route path="product/:productId" element={<ProductDetail />} />
                <Route path="FAQpage" element={<FAQPage />} />
                <Route path="CreditPage" element={<CreditPage />} />
                <Route path="about" element={<CompanyPage />} />
                <Route path="delivery" element={<DeliveryPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="admin" element={<Admin />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;