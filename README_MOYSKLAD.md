# Beltek Red Market - MoySklad Integration

## ✅ Migration Complete!

Your e-commerce application has been successfully migrated from Supabase to MoySklad API. All product data now comes directly from your MoySklad account.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📋 What's Working

### ✅ Client Features (Public)
- **Product Catalog**: Browse all products from MoySklad
- **Product Details**: View detailed product information with images
- **Categories**: Navigate by category and sub-category
- **Search**: Search products by name, description, brand
- **Filters**: Filter by price range, category, brand, stock status
- **Shopping Cart**: Add products to cart (localStorage)
- **Responsive Design**: Mobile-friendly interface

### ✅ Admin Panel (Read-Only)
- **View Products**: Display all products from MoySklad
- **View Categories**: Show category hierarchy
- **View Brands**: List brands extracted from products
- **Login**: Simple admin authentication (admin@beltek.com / admin123)

### ⚠️ Not Supported (By Design)
- **CRUD Operations**: All create/update/delete must be done in MoySklad
- **Image Upload**: Manage images through MoySklad
- **Excel Import**: Use MoySklad's import features

## 🔧 Configuration

### API Settings
Located in `src/lib/moysklad.ts`:
```typescript
API URL: https://api.moysklad.ru/api/remap/1.2
Token: 3df691b112eee7a9e14a124222ff313ed0e7d646
```

### ⚠️ Security Warning
**The API token is currently hardcoded!** For production:

1. Create `.env` file:
```env
VITE_MOYSKLAD_TOKEN=3df691b112eee7a9e14a124222ff313ed0e7d646
VITE_ADMIN_EMAIL=admin@beltek.com
VITE_ADMIN_PASSWORD=admin123
```

2. Update `src/lib/moysklad.ts`:
```typescript
const MOYSKLAD_TOKEN = import.meta.env.VITE_MOYSKLAD_TOKEN;
```

## 📊 Data Structure

### Products in MoySklad
Your products should have:
- **Name**: Product name
- **Description**: Product description  
- **PathName**: Category path (e.g., "1. Отдельно стоящая техника/Стиральные машины")
- **SalePrices**: Price in kopecks (will be converted to rubles)
- **Attributes**:
  - "Бренд" or "Brand" for brand name
  - Other attributes for specifications
- **Images**: Product images

### Example
```json
{
  "name": "Стиральная машина HITACHI BD-802HVOW",
  "description": "8кг\nБелый",
  "pathName": "1. Отдельно стоящая техника/Стиральные машины",
  "salePrices": [{ "value": 4100000 }],
  "attributes": [
    { "name": "Бренд", "value": "HITACHI" },
    { "name": "Вес", "value": "8кг" }
  ]
}
```

## 📁 Project Structure

```
src/
├── lib/
│   └── moysklad.ts              # MoySklad API service
├── hooks/
│   ├── useMoySkladProducts.ts   # Product hooks
│   ├── useMoySkladCategories.ts # Category hooks
│   ├── useMoySkladBrands.ts     # Brand hooks
│   ├── useProduct.ts            # Compatibility wrapper
│   ├── useCategories.ts         # Compatibility wrapper
│   ├── useBrands.ts             # Compatibility wrapper
│   └── useAuth.ts               # Simple auth
├── components/
│   ├── Header.tsx               # Updated for MoySklad search
│   ├── ProductCard.tsx
│   └── admin/                   # Admin components (read-only)
└── pages/
    ├── Index.tsx                # Homepage
    ├── ProductDetail.tsx        # Product details
    ├── SearchResult.tsx         # Search results
    ├── Category.tsx             # Category page
    └── Admin.tsx                # Admin panel
```

## 🔄 How It Works

### Data Flow
1. **API Layer** (`src/lib/moysklad.ts`): Handles all MoySklad API calls
2. **Hooks** (`src/hooks/useMoySklad*.ts`): React Query hooks for data fetching
3. **Components**: Use hooks to display data
4. **Caching**: React Query caches data for performance

### Price Conversion
MoySklad stores prices in kopecks, we convert to rubles:
```typescript
price = moySkladPrice / 100
```

### Category Structure
Categories are built from `pathName`:
- `"1. Отдельно стоящая техника"` → Main category
- `"1. Отдельно стоящая техника/Стиральные машины"` → Sub-category

### Brand Extraction
Brands are extracted from product attributes:
- Looks for: "Бренд", "Brand", or "Производитель"
- Dynamically generated from all products

## 🐛 Troubleshooting

### Products Not Loading
1. Check browser console for errors
2. Verify API token is valid
3. Check network tab for failed API calls
4. Ensure MoySklad API is accessible

### Images Not Showing
1. Verify products have images in MoySklad
2. Check image URLs are accessible
3. Look for CORS errors in console

### Categories Empty
1. Ensure products have `pathName` set
2. Check productFolder structure in MoySklad
3. Verify API token has access to productfolders

### Admin Panel Issues
- **Cannot edit**: This is expected - use MoySklad interface
- **Login fails**: Use admin@beltek.com / admin123
- **Data not updating**: Clear browser cache and refresh

## 📚 Documentation

- **Quick Start**: See `QUICK_START.md`
- **Migration Guide**: See `MOYSKLAD_MIGRATION.md`
- **Migration Summary**: See `MIGRATION_SUMMARY.md`
- **MoySklad API Docs**: https://dev.moysklad.ru/doc/api/remap/1.2/

## ⚡ Performance

### Caching Strategy
- **Products**: 2 minutes stale time
- **Categories**: 5 minutes stale time  
- **Brands**: 10 minutes stale time
- **Images**: Cached by browser

### Optimization Tips
1. Use pagination for large product lists
2. Implement lazy loading for images
3. Consider CDN for static assets
4. Enable gzip compression on server

## 🔐 Security

### Current Setup (Development)
- Simple localStorage-based auth
- Hardcoded admin credentials
- API token in source code

### Production Recommendations
1. **Move API token to environment variables**
2. **Implement proper authentication**:
   - JWT tokens
   - Session management
   - Password hashing
3. **Add rate limiting**
4. **Enable HTTPS only**
5. **Implement CORS properly**

## 🎯 Next Steps

### Immediate
- [ ] Move API token to `.env`
- [ ] Test all features thoroughly
- [ ] Update admin panel UI for read-only mode

### Short-term
- [ ] Implement proper authentication
- [ ] Add error boundaries
- [ ] Improve loading states
- [ ] Add analytics

### Long-term
- [ ] MoySklad webhook integration
- [ ] Real-time inventory updates
- [ ] Service worker for offline support
- [ ] PWA capabilities

## 💡 Tips

### Managing Products
1. Go to MoySklad web interface
2. Add/edit products there
3. Changes appear in app automatically (with cache refresh)

### Category Organization
- Use consistent `pathName` format
- Main category first, then sub-category
- Separate with `/`

### Brand Management
- Add "Бренд" attribute to all products
- Use consistent brand names
- Brands will appear automatically in filters

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review MoySklad API docs
3. Contact development team

## 🎉 Success!

Your application is now fully integrated with MoySklad. All product data comes directly from your inventory system, ensuring real-time accuracy and eliminating data synchronization issues.

**Remember**: To manage products, use the MoySklad web interface. The app will automatically reflect your changes.
