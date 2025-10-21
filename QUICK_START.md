# Quick Start Guide - MoySklad Integration

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Run Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 3. Login to Admin Panel
- Navigate to `/admin`
- **Email**: `admin@beltek.com`
- **Password**: `admin123`

## 📦 What's Working

### ✅ Client Side (Public)
- **Product Listing**: Browse all products from MoySklad
- **Product Details**: View individual product information
- **Categories**: Filter products by category and sub-category
- **Search**: Search products by name/description
- **Filters**: Filter by price, stock status
- **Cart**: Add products to cart (localStorage)
- **Images**: Product images from MoySklad

### ✅ Admin Panel (Read-Only)
- **View Products**: See all products from MoySklad
- **View Categories**: See category structure
- **View Brands**: See extracted brands

### ⚠️ Not Working (By Design)
- **Add/Edit/Delete Products**: Must be done in MoySklad
- **Add/Edit/Delete Categories**: Must be done in MoySklad
- **Excel Import**: Must be done in MoySklad
- **Image Upload**: Must be done in MoySklad

## 🔧 Configuration

### API Settings
Current configuration in `src/lib/moysklad.ts`:
```typescript
API URL: https://api.moysklad.ru/api/remap/1.2
Token: 3df691b112eee7a9e14a124222ff313ed0e7d646
```

### Environment Variables (Optional)
Create `.env` file:
```env
VITE_MOYSKLAD_API_URL=https://api.moysklad.ru/api/remap/1.2
VITE_MOYSKLAD_TOKEN=your_token_here
VITE_ADMIN_EMAIL=admin@beltek.com
VITE_ADMIN_PASSWORD=admin123
```

Then update `src/lib/moysklad.ts`:
```typescript
const MOYSKLAD_TOKEN = import.meta.env.VITE_MOYSKLAD_TOKEN;
```

## 📊 Data Structure

### Products in MoySklad
Your products should have:
- **Name**: Product name
- **Description**: Product description
- **Price**: Sale price (in kopecks)
- **PathName**: Category path (e.g., "1. Отдельно стоящая техника/Стиральные машины")
- **Attributes**: 
  - "Бренд" or "Brand" or "Производитель" for brand
  - Other attributes for product specifications
- **Images**: Product images

### Example Product Structure
```json
{
  "name": "Стиральная машина HITACHI BD-802HVOW",
  "description": "8кг\nБелый",
  "pathName": "1. Отдельно стоящая техника/Стиральные машины",
  "salePrices": [{ "value": 4100000 }],  // 41,000 rubles
  "attributes": [
    { "name": "Бренд", "value": "HITACHI" },
    { "name": "Вес", "value": "8кг" },
    { "name": "Цвет", "value": "Белый" }
  ]
}
```

## 🎯 Common Tasks

### View Products
1. Go to homepage
2. Products load automatically from MoySklad
3. Use filters/search to find products

### View Product Details
1. Click on any product card
2. View full details, images, specifications
3. Add to cart if needed

### Browse Categories
1. Use category navigation in header
2. Or use category filter on products page
3. Categories are built from MoySklad product folders

### Admin Panel
1. Login at `/admin`
2. View products, categories, brands
3. **Note**: Cannot edit data (read-only)

### Manage Products
1. Go to MoySklad web interface
2. Add/edit/delete products there
3. Changes will appear in app automatically (with cache refresh)

## 🐛 Troubleshooting

### Products Not Loading
**Problem**: Products page is empty

**Solutions**:
1. Check browser console for errors
2. Verify API token is valid
3. Check network tab for failed requests
4. Ensure MoySklad API is accessible

### Images Not Showing
**Problem**: Product images don't display

**Solutions**:
1. Check if products have images in MoySklad
2. Verify image URLs are accessible
3. Check browser console for CORS errors
4. Try refreshing the page

### Categories Not Showing
**Problem**: Category navigation is empty

**Solutions**:
1. Ensure products have `pathName` set in MoySklad
2. Check productFolder structure in MoySklad
3. Verify API token has access to productfolders

### Brands Not Appearing
**Problem**: Brand filter is empty

**Solutions**:
1. Add "Бренд" attribute to products in MoySklad
2. Or use "Brand" or "Производитель" as attribute name
3. Refresh the page to reload brands

### Admin Panel Not Working
**Problem**: Cannot login to admin

**Solutions**:
1. Use correct credentials: `admin@beltek.com` / `admin123`
2. Check browser localStorage
3. Try clearing browser cache

## 📚 Additional Resources

- **Full Migration Guide**: See `MOYSKLAD_MIGRATION.md`
- **Migration Summary**: See `MIGRATION_SUMMARY.md`
- **MoySklad API Docs**: https://dev.moysklad.ru/doc/api/remap/1.2/

## 🎉 You're Ready!

The application is now running with MoySklad integration. All product data comes directly from your MoySklad account.

**Remember**: To manage products, use the MoySklad web interface. The app will automatically reflect your changes.
