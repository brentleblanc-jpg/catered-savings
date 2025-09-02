// Sponsored Products Database
// This file contains products that retailers pay to display prominently after user signup
// Format: retailer pays monthly fee for featured product placement

const sponsoredProducts = [
    {
        id: 1,
        title: "Apple AirPods Pro (2nd Gen)",
        retailer: "Best Buy",
        originalPrice: 249.99,
        salePrice: 189.99,
        discount: 24,
        image: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6418/6418599_sd.jpg",
        url: "https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation-with-magsafe-case-usbc-white/6418599.p",
        // Affiliate tracking fields
        affiliateProgram: "bestbuy",
        affiliateId: "", // Add your Best Buy affiliate ID here
        trackingId: "", // Add your tracking ID if needed
        // End affiliate fields
        description: "Active Noise Cancellation, Transparency mode, Spatial audio",
        category: "tech-electronics",
        isSponsored: true,
        priority: 1, // Higher numbers show first
        monthlyFee: 500, // What retailer pays per month
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 2,
        title: "Nike Air Max 90",
        retailer: "Nike",
        originalPrice: 120.00,
        salePrice: 84.99,
        discount: 29,
        image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/fd17b420-b388-4c8a-aaaa-e0a98ddf175f/air-max-90-mens-shoes-6n7J06.png",
        url: "https://www.nike.com/w/sale-3yaep",
        // Affiliate tracking fields
        affiliateProgram: "nike",
        affiliateId: "", // Add your Nike affiliate ID here
        trackingId: "", // Add your tracking ID if needed
        // End affiliate fields
        description: "Classic comfort meets iconic style",
        category: "fashion",
        isSponsored: true,
        priority: 2,
        monthlyFee: 750,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-06-30"
    },
    {
        id: 3,
        title: "KitchenAid Stand Mixer",
        retailer: "Williams Sonoma",
        originalPrice: 429.95,
        salePrice: 299.95,
        discount: 30,
        image: "https://assets.wsimgs.com/wsimgs/rk/images/dp/wcm/202347/0070/kitchenaid-artisan-series-5-qt-stand-mixer-o.jpg",
        url: "https://www.williams-sonoma.com/shop/sale-special-offer/",
        // Affiliate tracking fields
        affiliateProgram: "williams-sonoma",
        affiliateId: "", // Add your Williams Sonoma affiliate ID here
        trackingId: "", // Add your tracking ID if needed
        // End affiliate fields
        description: "5-quart capacity, 10 speeds, includes 3 attachments",
        category: "home-garden",
        isSponsored: true,
        priority: 3,
        monthlyFee: 400,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 4,
        title: "Carter's Baby Outfit Set",
        retailer: "Carter's",
        originalPrice: 39.99,
        salePrice: 19.99,
        discount: 50,
        image: "https://www.carters.com/dw/image/v2/AAMK_PRD/on/demandware.static/-/Sites-carters_master_catalog/default/dw8c4a14cd/hi-res/V_126G770_MULTI.jpg",
        url: "https://www.carters.com/c/deals",
        // Affiliate tracking fields
        affiliateProgram: "carters",
        affiliateId: "", // Add your Carter's affiliate ID here
        trackingId: "", // Add your tracking ID if needed
        // End affiliate fields
        description: "3-piece cotton outfit set, sizes newborn-24 months",
        category: "kids-family",
        isSponsored: true,
        priority: 4,
        monthlyFee: 300,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 5,
        title: "Fitbit Charge 5",
        retailer: "Amazon",
        originalPrice: 199.95,
        salePrice: 149.95,
        discount: 25,
        image: "https://m.media-amazon.com/images/I/61ZjlBOp+rL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/gp/goldbox",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "Advanced fitness & health tracker with built-in GPS",
        category: "sports-outdoors",
        isSponsored: true,
        priority: 5,
        monthlyFee: 600,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 7,
        title: "Apple MacBook Air M2",
        retailer: "Amazon",
        originalPrice: 1199.00,
        salePrice: 599.00,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/Apple-MacBook-13-inch-256GB-Storage/dp/B0B3C2Q5ZP",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "13-inch MacBook Air with M2 chip, 8GB RAM, 256GB SSD - 50% off",
        category: "tech-electronics",
        isSponsored: true,
        priority: 7,
        monthlyFee: 1000,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 8,
        title: "Instant Pot Duo 7-in-1",
        retailer: "Amazon",
        originalPrice: 99.95,
        salePrice: 49.95,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
        url: "https://www.amazon.com/Instant-Pot-Duo-Evo-Plus/dp/B07W55DDFB",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "7-in-1 Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker & Warmer",
        category: "home-garden",
        isSponsored: true,
        priority: 8,
        monthlyFee: 400,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 9,
        title: "Sony WH-1000XM4 Headphones",
        retailer: "Amazon",
        originalPrice: 349.99,
        salePrice: 174.99,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
        url: "https://www.amazon.com/Sony-WH-1000XM4-Canceling-Headphones-phonecall/dp/B0863TXGM3",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "Industry Leading Noise Canceling Wireless Headphones with 30-hour Battery Life",
        category: "tech-electronics",
        isSponsored: true,
        priority: 9,
        monthlyFee: 700,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 10,
        title: "Ninja Foodi Personal Blender",
        retailer: "Amazon",
        originalPrice: 79.99,
        salePrice: 39.99,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/71YqZ8jWmmL._AC_SL1500_.jpg",
        url: "https://www.amazon.com/Ninja-PB1000-Personal-Blender-Smoothies/dp/B07ZPKN6YR",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "Personal Blender for Shakes, Smoothies, Food Prep, and Frozen Drinks with 18-Oz. BPA-Free Cup",
        category: "home-garden",
        isSponsored: true,
        priority: 10,
        monthlyFee: 300,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 11,
        title: "Echo Show 8 (2nd Gen)",
        retailer: "Amazon",
        originalPrice: 129.99,
        salePrice: 64.99,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/61jKI2O8rVL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/Echo-Show-8/dp/B08N5WRWNW",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "8-inch HD smart display with Alexa - 50% off",
        category: "tech-electronics",
        isSponsored: true,
        priority: 11,
        monthlyFee: 400,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 12,
        title: "Dyson V8 Cordless Vacuum",
        retailer: "Amazon",
        originalPrice: 399.99,
        salePrice: 199.99,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/61jKI2O8rVL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/Dyson-V8-Cordless-Vacuum/dp/B01LSUQSB0",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "Cordless stick vacuum with powerful suction - 50% off",
        category: "home-garden",
        isSponsored: true,
        priority: 12,
        monthlyFee: 500,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 13,
        title: "Nintendo Switch OLED",
        retailer: "Amazon",
        originalPrice: 349.99,
        salePrice: 174.99,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/61jKI2O8rVL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/Nintendo-Switch-OLED/dp/B098RKWHHZ",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "Nintendo Switch with 7-inch OLED screen - 50% off",
        category: "entertainment",
        isSponsored: true,
        priority: 13,
        monthlyFee: 600,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 14,
        title: "KitchenAid Stand Mixer",
        retailer: "Amazon",
        originalPrice: 429.95,
        salePrice: 214.97,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/61jKI2O8rVL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/KitchenAid-KSM150PSER-Artisan-Mixer/dp/B00005UP2P",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "5-quart stand mixer with 10 speeds - 50% off",
        category: "home-garden",
        isSponsored: true,
        priority: 14,
        monthlyFee: 400,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 15,
        title: "iPad Air (5th Generation)",
        retailer: "Amazon",
        originalPrice: 599.00,
        salePrice: 299.00,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/61jKI2O8rVL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/Apple-iPad-Air/dp/B09V3HN1KC",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "10.9-inch iPad Air with M1 chip - 50% off",
        category: "tech-electronics",
        isSponsored: true,
        priority: 15,
        monthlyFee: 700,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 16,
        title: "Nike Air Max 270",
        retailer: "Amazon",
        originalPrice: 150.00,
        salePrice: 75.00,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/61jKI2O8rVL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/Nike-Air-Max-270/dp/B07KZQZQZQ",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "Men's Air Max 270 running shoes - 50% off",
        category: "fashion",
        isSponsored: true,
        priority: 16,
        monthlyFee: 300,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 17,
        title: "Vitamix A3500 Blender",
        retailer: "Amazon",
        originalPrice: 599.95,
        salePrice: 299.97,
        discount: 50,
        image: "https://m.media-amazon.com/images/I/61jKI2O8rVL._AC_SL1000_.jpg",
        url: "https://www.amazon.com/Vitamix-A3500-Ascent-Series/dp/B07H8QMZPV",
        // Affiliate tracking fields
        affiliateProgram: "amazon",
        affiliateId: "820cf-20", // Amazon Associates tracking ID
        trackingId: "820cf-20", // Store ID
        // End affiliate fields
        description: "Professional-grade blender with 5 programs - 50% off",
        category: "home-garden",
        isSponsored: true,
        priority: 17,
        monthlyFee: 500,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    },
    {
        id: 6,
        title: "Samsung 65\" QLED 4K TV",
        retailer: "Best Buy",
        originalPrice: 1299.99,
        salePrice: 899.99,
        discount: 31,
        image: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6428/6428300_sd.jpg",
        url: "https://www.bestbuy.com/site/samsung-65-class-q60c-qled-4k-uhd-tizen-tv/6428300.p",
        // Affiliate tracking fields
        affiliateProgram: "bestbuy",
        affiliateId: "", // Add your Best Buy affiliate ID here
        trackingId: "", // Add your tracking ID if needed
        // End affiliate fields
        description: "Quantum HDR, Dual LED, Gaming Mode, Alexa Built-in",
        category: "tech-electronics",
        isSponsored: true,
        priority: 6,
        monthlyFee: 800,
        active: true,
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    }
];

// Function to build affiliate URLs with tracking
function buildAffiliateUrl(product) {
    if (!product.affiliateId) {
        return product.url; // Return original URL if no affiliate ID
    }
    
    const baseUrl = product.url;
    const separator = baseUrl.includes('?') ? '&' : '?';
    
    switch (product.affiliateProgram) {
        case 'amazon':
            // Amazon format: ?tag=YOUR_ID
            return `${baseUrl}${separator}tag=${product.affiliateId}`;
            
        case 'bestbuy':
            // Best Buy format: ?affiliate=YOUR_ID
            return `${baseUrl}${separator}affiliate=${product.affiliateId}`;
            
        case 'nike':
            // Nike format: ?affiliate=YOUR_ID
            return `${baseUrl}${separator}affiliate=${product.affiliateId}`;
            
        case 'williams-sonoma':
            // Williams Sonoma format: ?affiliate=YOUR_ID
            return `${baseUrl}${separator}affiliate=${product.affiliateId}`;
            
        case 'carters':
            // Carter's format: ?affiliate=YOUR_ID
            return `${baseUrl}${separator}affiliate=${product.affiliateId}`;
            
        default:
            return baseUrl;
    }
}

// Function to get active sponsored products sorted by priority
function getActiveSponsoredProducts(limit = 4) {
    const now = new Date();
    return sponsoredProducts
        .filter(product => {
            if (!product.active) return false;
            const start = new Date(product.startDate);
            const end = new Date(product.endDate);
            return now >= start && now <= end;
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);
}

// Function to get sponsored products by category
function getSponsoredProductsByCategory(category, limit = 2) {
    return getActiveSponsoredProducts()
        .filter(product => product.category === category)
        .slice(0, limit);
}

// Function to track sponsored product clicks (for analytics)
function trackSponsoredClick(productId, userId = null) {
    const clickData = {
        productId,
        userId,
        timestamp: new Date().toISOString(),
        type: 'sponsored_click',
        affiliateProgram: sponsoredProducts.find(p => p.id === productId)?.affiliateProgram || 'unknown'
    };
    // In production, send this to analytics service
    console.log('Sponsored product click tracked:', clickData);
    return clickData;
}

module.exports = {
    sponsoredProducts,
    getActiveSponsoredProducts,
    getSponsoredProductsByCategory,
    trackSponsoredClick,
    buildAffiliateUrl
};
