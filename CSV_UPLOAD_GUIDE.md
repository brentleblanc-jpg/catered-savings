# 📊 CSV Upload Guide for Products

## 🎯 CSV Structure

Your CSV file must have these **8 columns** (in any order):

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `title` | ✅ | Product name | "KitchenAid Artisan Stand Mixer" |
| `description` | ⚠️ | Product description (optional) | "5-Qt Stand Mixer with Pouring Shield" |
| `price` | ✅ | Sale price (numbers only) | 199.99 |
| `originalPrice` | ✅ | Original price (numbers only) | 399.99 |
| `imageUrl` | ✅ | Product image URL | "https://m.media-amazon.com/..." |
| `affiliateUrl` | ✅ | Amazon product URL | "https://www.amazon.com/dp/B08N5WRWNW" |
| `category` | ✅ | Product category (see list below) | "home-garden" |
| `productType` | ✅ | "deal" or "sponsored" | "deal" |

## 📂 Product Types

### 🏷️ Regular Deals (`productType: "deal"`)
- **Purpose**: 50%+ off deals for personalized user pages
- **Revenue**: Affiliate commissions from Amazon
- **Requirement**: Must be 50% off or more
- **Placement**: User's personalized deals pages

### 🌟 Sponsored Products (`productType: "sponsored"`)
- **Purpose**: Paid placements from retailers
- **Revenue**: Monthly fees from companies
- **Requirement**: No discount requirement
- **Placement**: Homepage and landing pages

## 🗂️ Valid Categories

Use these exact category values:

- `tech-electronics`
- `home-garden`
- `fashion`
- `sports-outdoors`
- `health-beauty`
- `food-dining`
- `travel`
- `kids-family`
- `automotive`
- `books-media`
- `entertainment`
- `office-education`
- `pets`
- `other`

## ✅ Validation Rules

1. **Discount Requirement**: Regular deals must be 50%+ off
2. **Affiliate ID**: Your Amazon affiliate ID (820cf-20) is automatically added
3. **Required Fields**: title, price, originalPrice, affiliateUrl, category, productType
4. **Price Format**: Use decimal numbers (e.g., 199.99, not $199.99)
5. **URLs**: Must be valid URLs starting with https://

## 📋 Example CSV Format

```csv
title,description,price,originalPrice,imageUrl,affiliateUrl,category,productType
"KitchenAid Stand Mixer","5-Qt Mixer",199.99,399.99,"https://image-url","https://amazon-url","home-garden","deal"
"Sony Headphones","Noise Canceling",199.99,349.99,"https://image-url","https://amazon-url","tech-electronics","sponsored"
```

## 🎯 Pro Tips

### Getting Product Information:
1. **Amazon URLs**: Use the main product page URL
2. **Images**: Right-click Amazon product image → "Copy image address"
3. **Prices**: Check current sale price vs original/list price
4. **Categories**: Match products to the most relevant category

### CSV Best Practices:
- **Quote text fields**: Wrap text in quotes if it contains commas
- **No currency symbols**: Use 199.99, not $199.99
- **Clean URLs**: Remove tracking parameters (everything after ?ref=)
- **Test with 1-2 rows first**: Upload small batches to test

## 🚀 Upload Process

1. **Go to Admin**: `http://localhost:3000/admin.html`
2. **Click**: "Upload CSV Deals" button
3. **Choose method**:
   - Paste CSV data directly in text area
   - Or upload your CSV file
4. **Preview**: Check the first 3 rows preview
5. **Process**: Click "Process Data"
6. **Review results**: Check how many were added/skipped/errors

## ⚠️ Common Errors

- **Not 50% off**: Regular deals under 50% discount are skipped
- **Missing fields**: All required columns must have values
- **Invalid prices**: Use decimal format (199.99)
- **Bad URLs**: URLs must start with https://
- **Wrong category**: Use exact category names from the list above

## 📁 Template Files

I've created these files for you:
- `csv-template.csv` - Example CSV with sample products
- `sample-deals.csv` - Additional examples

Use these as starting points for your own product uploads!
