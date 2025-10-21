// MoySklad API Configuration and Service Layer
// Use proxy both in development and production to avoid CORS issues

// В dev режиме используем Vite proxy
// В prod режиме используем внешний прокси сервер (Render/Railway)
const isDevelopment = import.meta.env.DEV;
const MOYSKLAD_API_URL = isDevelopment 
  ? '/api/moysklad'  // Vite proxy в dev режиме
  : import.meta.env.VITE_API_URL || '/api/moysklad';  // Внешний прокси в prod

// API Headers - токен добавляется прокси сервером, не отправляем из браузера
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Types based on MoySklad API structure
export interface MoySkladProduct {
  meta: {
    href: string;
    metadataHref: string;
    type: string;
    mediaType: string;
    uuidHref: string;
  };
  id: string;
  accountId: string;
  owner?: any;
  shared: boolean;
  group?: any;
  updated: string;
  name: string;
  description?: string;
  code?: string;
  externalCode?: string;
  archived: boolean;
  pathName?: string;
  productFolder?: {
    meta: {
      href: string;
      metadataHref: string;
      type: string;
      mediaType: string;
      uuidHref: string;
    };
  };
  effectiveVat?: number;
  effectiveVatEnabled?: boolean;
  vat?: number;
  vatEnabled?: boolean;
  useParentVat?: boolean;
  images?: {
    meta: {
      href: string;
      type: string;
      mediaType: string;
      size: number;
      limit: number;
      offset: number;
    };
  };
  minPrice?: {
    value: number;
    currency: any;
  };
  salePrices?: Array<{
    value: number;
    currency: any;
    priceType: any;
  }>;
  buyPrice?: {
    value: number;
    currency: any;
  };
  barcodes?: Array<{
    ean13?: string;
    ean8?: string;
    code128?: string;
  }>;
  paymentItemType?: string;
  discountProhibited?: boolean;
  weight?: number;
  volume?: number;
  variantsCount?: number;
  isSerialTrackable?: boolean;
  trackingType?: string;
  attributes?: Array<{
    meta: any;
    id: string;
    name: string;
    type: string;
    value: any;
  }>;
}

export interface MoySkladProductFolder {
  meta: {
    href: string;
    metadataHref: string;
    type: string;
    mediaType: string;
    uuidHref: string;
  };
  id: string;
  accountId: string;
  owner?: any;
  shared: boolean;
  group?: any;
  updated: string;
  name: string;
  description?: string;
  code?: string;
  externalCode?: string;
  archived: boolean;
  pathName?: string;
  productFolder?: {
    meta: any;
  };
}

export interface MoySkladImage {
  meta: {
    href: string;
    type: string;
    mediaType: string;
    downloadHref: string;
  };
  title: string;
  filename: string;
  size: number;
  updated: string;
  miniature: {
    href: string;
    mediaType: string;
    downloadHref: string;
  };
  tiny: {
    href: string;
    mediaType: string;
    downloadHref: string;
  };
}

export interface MoySkladListResponse<T> {
  context: {
    employee: any;
  };
  meta: {
    href: string;
    type: string;
    mediaType: string;
    size: number;
    limit: number;
    offset: number;
  };
  rows: T[];
}

// API Service Functions
export const moySkladAPI = {
  // Products
  async getProducts(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filter?: string;
    order?: string;
  }): Promise<MoySkladListResponse<MoySkladProduct>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.filter) queryParams.append('filter', params.filter);
    if (params?.order) queryParams.append('order', params.order);

    const url = `${MOYSKLAD_API_URL}/entity/product?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoySklad API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async getProduct(id: string): Promise<MoySkladProduct> {
    const url = `${MOYSKLAD_API_URL}/entity/product/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoySklad API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async getProductImages(productId: string): Promise<MoySkladListResponse<MoySkladImage>> {
    const url = `${MOYSKLAD_API_URL}/entity/product/${productId}/images`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoySklad API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Product Folders (Categories)
  async getProductFolders(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filter?: string;
  }): Promise<MoySkladListResponse<MoySkladProductFolder>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.filter) queryParams.append('filter', params.filter);

    const url = `${MOYSKLAD_API_URL}/entity/productfolder?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoySklad API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async getProductFolder(id: string): Promise<MoySkladProductFolder> {
    const url = `${MOYSKLAD_API_URL}/entity/productfolder/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoySklad API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Attributes (for product characteristics)
  async getProductAttributes(): Promise<any> {
    const url = `${MOYSKLAD_API_URL}/entity/product/metadata`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoySklad API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};

// Helper functions to transform MoySklad data to our app format
export const transformMoySkladProduct = (msProduct: MoySkladProduct) => {
  // Extract category from pathName
  const pathParts = msProduct.pathName?.split('/') || [];
  const category = pathParts[0] || '';
  const miniCategory = pathParts[1] || '';

  // Get price (MoySklad stores in kopecks, divide by 100 for rubles)
  // Логируем все цены чтобы понять структуру
  if (msProduct.salePrices && msProduct.salePrices.length > 0) {
    console.log(`📦 Product: ${msProduct.name}`);
    console.log('All prices:', msProduct.salePrices.map(p => ({
      priceType: p.priceType?.name,
      value: (p.value || 0) / 100,
      currency: p.currency
    })));
  }
  
  // Берем первую непустую цену
  let price = 0;
  if (msProduct.salePrices && msProduct.salePrices.length > 0) {
    const nonZeroPrice = msProduct.salePrices.find(p => p.value && p.value > 0);
    price = nonZeroPrice ? nonZeroPrice.value / 100 : 0;
  }
  
  console.log(`✅ Selected price: ${price}`);

  // Extract brand from attributes
  const brandAttr = msProduct.attributes?.find(
    attr => attr.name.toLowerCase() === 'бренд' || 
            attr.name.toLowerCase() === 'brand' ||
            attr.name.toLowerCase() === 'производитель'
  );
  const brand = brandAttr ? String(brandAttr.value || '') : '';

  // Transform attributes to templates (exclude brand as it's a separate field)
  const templates = msProduct.attributes
    ?.filter(attr => 
      attr.name.toLowerCase() !== 'бренд' && 
      attr.name.toLowerCase() !== 'brand' &&
      attr.name.toLowerCase() !== 'производитель'
    )
    .map(attr => ({
      name: attr.name,
      value: String(attr.value || ''),
    })) || [];

  return {
    id: msProduct.id,
    name: msProduct.name,
    category: category,
    mini_category: miniCategory || undefined,
    pathName: msProduct.pathName || '',
    description: msProduct.description || '',
    price: price,
    brand: brand,
    image: '', // Will be fetched separately
    images: [], // Will be fetched separately
    templates: templates,
    in_stock: !msProduct.archived,
    created_at: msProduct.updated,
    code: msProduct.code,
    externalCode: msProduct.externalCode,
    barcode: msProduct.barcodes?.[0]?.ean13 || msProduct.barcodes?.[0]?.ean8 || '',
  };
};

export const transformMoySkladProductFolder = (msFolder: MoySkladProductFolder) => {
  // В МойСклад pathName содержит путь к РОДИТЕЛЬСКОЙ папке, а не полный путь
  // Например:
  // - Главная категория "1. Отдельно стоящая техника": pathName = ""
  // - Подкатегория "Холодильники": pathName = "1. Отдельно стоящая техника"
  const pathName = msFolder.pathName || '';
  
  // Главная категория - когда pathName пустой (нет родителя)
  const isMainCategory = !pathName || pathName.trim() === '';
  
  // Для отладки
  console.log(`Folder: "${msFolder.name}", pathName: "${pathName}", isMain: ${isMainCategory}`);
  
  return {
    id: msFolder.id,
    name: msFolder.name,
    pathName: pathName,
    isMainCategory: isMainCategory,
    parentPath: isMainCategory ? null : pathName, // pathName уже содержит путь к родителю
    description: msFolder.description,
    archived: msFolder.archived,
  };
};

// Cache for categories to avoid repeated API calls
let categoriesCache: any = null;
let categoriesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCategoriesWithCache = async () => {
  const now = Date.now();
  
  if (categoriesCache && (now - categoriesCacheTime) < CACHE_DURATION) {
    return categoriesCache;
  }

  const response = await moySkladAPI.getProductFolders({ limit: 1000 });
  categoriesCache = response.rows;
  categoriesCacheTime = now;
  
  return categoriesCache;
};

export const clearCategoriesCache = () => {
  categoriesCache = null;
  categoriesCacheTime = 0;
};
