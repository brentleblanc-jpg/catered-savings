// Script to add products to production database via API

const techElectronicsProducts = [
  {
    title: "iPhone 15 Pro",
    description: "iPhone 15 Pro with A17 Pro chip and titanium design",
    imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Apple-iPhone-15-Pro/dp/B0CHX1W1XY?tag=820cf-20",
    price: 499.99,
    originalPrice: 999.99,
    category: "tech-electronics"
  },
  {
    title: "Samsung Galaxy S24 Ultra",
    description: "Samsung Galaxy S24 Ultra 256GB with S Pen",
    imageUrl: "https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Samsung-Galaxy-S24-Ultra/dp/B0CRJDHZ7K?tag=820cf-20",
    price: 599.99,
    originalPrice: 1199.99,
    category: "tech-electronics"
  },
  {
    title: "Google Pixel 8 Pro",
    description: "Google Pixel 8 Pro with AI-powered camera",
    imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Google-Pixel-8-Pro/dp/B0CHX1W1XY?tag=820cf-20",
    price: 399.99,
    originalPrice: 899.99,
    category: "tech-electronics"
  },
  {
    title: "MacBook Pro 14-inch M3",
    description: "MacBook Pro 14-inch with M3 chip",
    imageUrl: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Apple-MacBook-Pro-14-inch/dp/B0CHX1W1XY?tag=820cf-20",
    price: 999.99,
    originalPrice: 1999.99,
    category: "tech-electronics"
  },
  {
    title: "Dell XPS 15 Laptop",
    description: "Dell XPS 15 9530 15.6-inch laptop",
    imageUrl: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Dell-XPS-15-9530-Laptop/dp/B0CHX1W1XY?tag=820cf-20",
    price: 799.99,
    originalPrice: 1599.99,
    category: "tech-electronics"
  },
  {
    title: "HP Spectre x360 Laptop",
    description: "HP Spectre x360 2-in-1 laptop",
    imageUrl: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/HP-Spectre-x360-Laptop/dp/B0CHX1W1XY?tag=820cf-20",
    price: 699.99,
    originalPrice: 1399.99,
    category: "tech-electronics"
  },
  {
    title: "iPad Pro 12.9-inch M2",
    description: "iPad Pro 12.9-inch with M2 chip",
    imageUrl: "https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Apple-iPad-Pro-12-9-inch/dp/B0CHX1W1XY?tag=820cf-20",
    price: 599.99,
    originalPrice: 1099.99,
    category: "tech-electronics"
  },
  {
    title: "Samsung Galaxy Tab S9",
    description: "Samsung Galaxy Tab S9 11-inch tablet",
    imageUrl: "https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Samsung-Galaxy-Tab-S9/dp/B0CHX1W1XY?tag=820cf-20",
    price: 399.99,
    originalPrice: 799.99,
    category: "tech-electronics"
  },
  {
    title: "Sony WH-1000XM5 Headphones",
    description: "Sony WH-1000XM5 wireless noise canceling headphones",
    imageUrl: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Sony-WH-1000XM5-Headphones/dp/B09XS7JWHH?tag=820cf-20",
    price: 199.99,
    originalPrice: 399.99,
    category: "tech-electronics"
  },
  {
    title: "Bose QuietComfort 45",
    description: "Bose QuietComfort 45 wireless headphones",
    imageUrl: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Bose-QuietComfort-45-Headphones/dp/B098FKXT8L?tag=820cf-20",
    price: 179.99,
    originalPrice: 329.99,
    category: "tech-electronics"
  },
  {
    title: "Sennheiser HD 660S",
    description: "Sennheiser HD 660S open-back headphones",
    imageUrl: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Sennheiser-HD-660S-Headphones/dp/B0CHX1W1XY?tag=820cf-20",
    price: 199.99,
    originalPrice: 499.99,
    category: "tech-electronics"
  },
  {
    title: "Apple Watch Series 9",
    description: "Apple Watch Series 9 GPS 45mm",
    imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Apple-Watch-Series-9-GPS/dp/B0CHX1W1XY?tag=820cf-20",
    price: 199.99,
    originalPrice: 429.99,
    category: "tech-electronics"
  },
  {
    title: "Samsung Galaxy Watch 6",
    description: "Samsung Galaxy Watch 6 44mm smartwatch",
    imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Samsung-Galaxy-Watch-6/dp/B0CHX1W1XY?tag=820cf-20",
    price: 149.99,
    originalPrice: 299.99,
    category: "tech-electronics"
  },
  {
    title: "Nintendo Switch OLED",
    description: "Nintendo Switch OLED Model with 7-inch screen",
    imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Nintendo-Switch-OLED-Model/dp/B098RKWHHZ?tag=820cf-20",
    price: 199.99,
    originalPrice: 349.99,
    category: "tech-electronics"
  },
  {
    title: "PlayStation 5 Console",
    description: "PlayStation 5 gaming console",
    imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/PlayStation-5-Console/dp/B0CHX1W1XY?tag=820cf-20",
    price: 249.99,
    originalPrice: 499.99,
    category: "tech-electronics"
  },
  {
    title: "Xbox Series X Console",
    description: "Xbox Series X gaming console",
    imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Xbox-Series-X-Console/dp/B0CHX1W1XY?tag=820cf-20",
    price: 249.99,
    originalPrice: 499.99,
    category: "tech-electronics"
  },
  {
    title: "Samsung 65-inch QLED 4K TV",
    description: "Samsung 65-inch QLED 4K UHD Smart TV",
    imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Samsung-65-inch-QLED-Smart-TV/dp/B0CHX1W1XY?tag=820cf-20",
    price: 599.99,
    originalPrice: 1199.99,
    category: "tech-electronics"
  },
  {
    title: "LG 55-inch OLED 4K TV",
    description: "LG 55-inch OLED 4K UHD Smart TV",
    imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/LG-55-inch-OLED-Smart-TV/dp/B0CHX1W1XY?tag=820cf-20",
    price: 699.99,
    originalPrice: 1399.99,
    category: "tech-electronics"
  },
  {
    title: "Amazon Echo Show 15",
    description: "Amazon Echo Show 15 smart display",
    imageUrl: "https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg",
    affiliateUrl: "https://www.amazon.com/Amazon-Echo-Show-15/dp/B0CHX1W1XY?tag=820cf-20",
    price: 124.99,
    originalPrice: 249.99,
    category: "tech-electronics"
  },
  {
    title: "Google Nest Hub Max",
    description: "Google Nest Hub Max smart display",
    imageUrl: "https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg",
    affiliateUrl: "https://www.amazon.com/Google-Nest-Hub-Max/dp/B0CHX1W1XY?tag=820cf-20",
    price: 99.99,
    originalPrice: 229.99,
    category: "tech-electronics"
  }
];

async function addProductsToProduction() {
  try {
    console.log('🚀 Adding tech-electronics products to production...');
    
    const response = await fetch('https://cateredsavers.com/api/admin/add-multiple-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: techElectronicsProducts })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success:', result.message);
      console.log(`📊 Added: ${result.added}, Skipped: ${result.skipped}`);
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run the script
addProductsToProduction();
