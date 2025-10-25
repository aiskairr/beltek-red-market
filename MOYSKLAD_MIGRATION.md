# MoySklad API Migration Guide

## Overview
This project has been successfully migrated from Supabase to MoySklad API. All product data, categories, and brands are now fetched directly from your MoySklad account.

## What Changed

### 1. **API Integration**
- **Old**: Supabase PostgreSQL database
- **New**: MoySklad REST API (https://api.moysklad.ru/api/remap/1.2)

### 2. **Authentication**
- **Old**: Supabase Auth
- **New**: Simple localStorage-based auth (admin@beltek.com / admin123)
- **Note**: For production, implement proper authentication

### 3. **Data Structure**

#### Products
- Products are fetched from MoySklad `/entity/product` endpoint
- **Price**: Converted from kopecks to rubles (divided by 100)
- **Categories**: Extracted from `pathName` field
  - Main category: First part of pathName (e.g., "1. Отдельно стоящая техника")
  - Sub-category: Second part of pathName (e.g., "Стиральные машины")
- **Brand**: Extracted from product attributes (looks for "Бренд", "Brand", or "Производитель")
- **Images**: Fetched separately from `/entity/product/{id}/images`
- **Templates**: Product attributes (excluding brand)

#### Categories
- Categories are built from MoySklad `/entity/productfolder` endpoint
- Hierarchical structure is preserved from `pathName`
- Main categories and sub-categories are automatically organized

#### Brands
- Brands are extracted from product attributes
- Dynamically generated from all products
- **Note**: Brands are read-only (managed through MoySklad product attributes)

## File Structure

### New Files Created
```
src/
├── lib/
│   └── moysklad.ts              # MoySklad API service layer
├── hooks/
│   ├── useMoySkladProducts.ts   # Product hooks
│   ├── useMoySkladCategories.ts # Category hooks
│   ├── useMoySkladBrands.ts     # Brand hooks (extracted from products)
│   ├── useProduct.ts            # Compatibility wrapper
│   ├── useCategories.ts         # Compatibility wrapper
│   └── useBrands.ts             # Compatibility wrapper
```

### Removed Files
- `src/lib/supabase.ts` - Removed Supabase client

### Modified Files
- `src/hooks/useAuth.ts` - Replaced with localStorage auth
- `package.json` - Removed @supabase/supabase-js dependency

## API Configuration

### Current Settings
```typescript
API URL: https://api.moysklad.ru/api/remap/1.2
Token: e66fb46aeaa51e135b6f00556916a1ffb63c9d48
```

**⚠️ IMPORTANT**: The API token is currently hardcoded in `src/lib/moysklad.ts`. For production:
1. Move token to environment variables
2. Create `.env` file:
   ```
   VITE_MOYSKLAD_TOKEN=your_token_here
   ```
3. Update `src/lib/moysklad.ts` to use:
   ```typescript
   const MOYSKLAD_TOKEN = import.meta.env.VITE_MOYSKLAD_TOKEN;
   ```

## Features

### ✅ Working Features
- **Product Listing**: Fetch products with pagination
- **Product Details**: View individual product information
- **Categories**: Browse products by category and sub-category
- **Search**: Search products by name, description
- **Filters**: Filter by category, price range, stock status
- **Brands**: View products by brand (extracted from attributes)
- **Images**: Product images are fetched and displayed
- **Caching**: React Query caching for better performance

### ⚠️ Read-Only Features
The following features are **READ-ONLY** from MoySklad:
- Adding/Editing/Deleting Products
- Adding/Editing/Deleting Categories
- Adding/Editing/Deleting Brands

**Note**: All data management must be done through the MoySklad interface. The app will automatically reflect changes made in MoySklad.

### 🔄 Admin Panel Limitations
The admin panel now displays data from MoySklad but cannot modify it. Consider:
1. Hiding admin CRUD operations
2. Adding a link to MoySklad dashboard
3. Implementing webhook listeners for real-time updates

## Data Mapping

### MoySklad Product → App Product
```typescript
{
  id: msProduct.id,                    // MoySklad UUID
  name: msProduct.name,                // Product name
  category: pathName[0],               // First part of pathName
  mini_category: pathName[1],          // Second part of pathName
  description: msProduct.description,  // Product description
  price: salePrices[0].value / 100,   // Price in rubles (from kopecks)
  brand: attributes['Бренд'],         // From product attributes
  images: [...],                       // From /images endpoint
  templates: attributes[...],          // Other attributes
  in_stock: !msProduct.archived,      // Inverse of archived flag
  code: msProduct.code,                // Product code
  barcode: barcodes[0].ean13,         // Barcode
}
```

### MoySklad ProductFolder → App Category
```typescript
{
  id: folder.id,                       // MoySklad UUID
  category: folder.name,               // Folder name
  pathName: folder.pathName,           // Full path
  mini_categories: [...],              // Sub-folders
  archived: folder.archived,           // Archive status
}
```

## Performance Optimizations

### Caching Strategy
- **Products**: 2 minutes stale time, 5 minutes cache time
- **Categories**: 5 minutes stale time, 10 minutes cache time
- **Brands**: 10 minutes stale time, 30 minutes cache time
- **Images**: Fetched on-demand and cached

### API Call Optimization
- Categories are cached in memory for 5 minutes
- Batch image fetching for product lists
- Pagination to limit data transfer
- Smart filtering (server-side where possible)

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

2. **Remove old Supabase packages** (if not done):
   ```bash
   npm uninstall @supabase/supabase-js
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Testing

### Manual Testing Checklist
- [ ] Product listing loads correctly
- [ ] Product details page works
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Price filters work correctly
- [ ] Images display properly
- [ ] Brand filtering works
- [ ] Pagination works
- [ ] Admin panel displays data (read-only)

### Known Issues
1. **Image Loading**: Images may load slowly on first request
2. **Brand Extraction**: Requires products to have "Бренд" attribute in MoySklad
3. **Admin CRUD**: All admin create/update/delete operations will show warnings

## Migration Checklist

- [x] Create MoySklad API service layer
- [x] Implement product hooks
- [x] Implement category hooks
- [x] Implement brand hooks
- [x] Update authentication
- [x] Remove Supabase dependencies
- [x] Create compatibility wrappers
- [ ] Move API token to environment variables
- [ ] Update admin panel UI for read-only mode
- [ ] Add MoySklad dashboard link
- [ ] Implement proper authentication
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Test all features thoroughly

## Troubleshooting

### Products not loading
- Check API token is valid
- Check network tab for API errors
- Verify MoySklad API is accessible

### Categories not showing
- Ensure products have `pathName` set in MoySklad
- Check productFolder structure in MoySklad

### Brands not appearing
- Add "Бренд" attribute to products in MoySklad
- Or use "Brand" or "Производитель" as attribute name

### Images not displaying
- Check product has images in MoySklad
- Verify image URLs are accessible
- Check browser console for CORS errors

## Future Improvements

1. **Environment Variables**: Move API credentials to .env
2. **Error Handling**: Add comprehensive error boundaries
3. **Loading States**: Improve loading indicators
4. **Webhooks**: Listen to MoySklad webhooks for real-time updates
5. **Caching**: Implement service worker for offline support
6. **Authentication**: Implement proper auth system
7. **Admin Panel**: Redesign for read-only mode or integrate MoySklad OAuth

## Support

For MoySklad API documentation, visit:
https://dev.moysklad.ru/doc/api/remap/1.2/

For project-specific issues, contact your development team.
