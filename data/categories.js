// Categories and Deal Sources Database
// This file contains all the companies and URLs organized by category
// Users will receive emails with these sources based on their selected categories

const categoriesData = {
    "tech-electronics": {
        name: "Tech & Electronics",
        description: "Latest deals on laptops, phones, gadgets, and electronics",
        companies: [
            {
                name: "Best Buy",
                url: "https://www.bestbuy.com/site/home-appliances/major-appliances-sale-event/pcmcat321600050000.c?id=pcmcat321600050000",
                description: "✅ Labor Day: 50% off major appliances + extra $600 with codes SAVE10/SAVE20",
                affiliate: true
            },
            {
                name: "Newegg",
                url: "https://www.newegg.com/todays-deals",
                description: "✅ Shell Shocker deals up to 70% off daily",
                affiliate: true
            },
            {
                name: "Amazon Warehouse",
                url: "https://www.amazon.com/Warehouse-Deals/b?ie=UTF8&node=10158976011",
                description: "✅ Open-box items 20-50% off",
                affiliate: true
            },
            {
                name: "B&H Photo",
                url: "https://www.bhphotovideo.com",
                description: "Camera/electronics clearance",
                affiliate: true
            },
            {
                name: "Woot!",
                url: "https://www.woot.com/",
                description: "Daily tech deals",
                affiliate: true
            },
            {
                name: "Micro Center",
                url: "https://www.microcenter.com/",
                description: "PC components",
                affiliate: true
            }
        ]
    },
    "fashion": {
        name: "Fashion & Style",
        description: "Clothing, shoes, accessories, and style deals",
        companies: [
            {
                name: "Forever 21",
                url: "https://www.forever21.com/collections/sale",
                description: "✅ 50% off sitewide with code TAKE50",
                affiliate: true
            },
            {
                name: "H&M",
                url: "https://www2.hm.com/en_us/sale.html",
                description: "End-of-season clearance",
                affiliate: true
            },
            {
                name: "Zara",
                url: "https://www.zara.com/us/",
                description: "Seasonal sales",
                affiliate: true
            },
            {
                name: "ASOS",
                url: "https://www.asos.com/us/sale/",
                description: "Regular clearance",
                affiliate: true
            },
            {
                name: "Nordstrom Rack",
                url: "https://www.nordstromrack.com/",
                description: "Designer outlet",
                affiliate: true
            },
            {
                name: "T.J. Maxx",
                url: "https://tjmaxx.tjx.com/",
                description: "Discount designer",
                affiliate: true
            }
        ]
    },
    "home-garden": {
        name: "Home & Garden",
        description: "Furniture, decor, tools, and outdoor living",
        companies: [
            {
                name: "Lowe's",
                url: "https://www.lowes.com/pl/Weekly-ad-Special-offers/4294857781",
                description: "✅ Labor Day: Up to 50% off outdoor furniture + 35% off appliances",
                affiliate: true
            },
            {
                name: "Williams Sonoma",
                url: "https://www.williams-sonoma.com/shop/sale-special-offer/",
                description: "Cookware sales",
                affiliate: true
            },
            {
                name: "Wayfair",
                url: "https://www.wayfair.com/daily-sales",
                description: "Furniture clearance",
                affiliate: true
            },
            {
                name: "Overstock",
                url: "https://www.overstock.com/",
                description: "Home goods clearance",
                affiliate: true
            },
            {
                name: "Pottery Barn",
                url: "https://www.potterybarn.com/sale/",
                description: "Furniture/decor sales",
                affiliate: true
            }
        ]
    },
    "health-beauty": {
        name: "Health & Beauty",
        description: "Skincare, makeup, wellness, and personal care",
        companies: [
            {
                name: "Sephora",
                url: "https://www.sephora.com/beauty/sephora-sale",
                description: "⏰ One-Day Deals (50% off) - Next: Late August 2025",
                affiliate: true
            },
            {
                name: "Ulta",
                url: "https://www.ulta.com/promotion/21-days-of-beauty",
                description: "⏰ 21 Days of Beauty (50% off daily) - Aug 29-Sep 18, 2025",
                affiliate: true
            },
            {
                name: "Sally Beauty",
                url: "https://www.sallybeauty.com/",
                description: "Professional supplies clearance",
                affiliate: true
            }
        ]
    },
    "sports-outdoors": {
        name: "Sports & Outdoors",
        description: "Athletic gear, outdoor equipment, and fitness deals",
        companies: [
            {
                name: "Dick's Sporting Goods",
                url: "https://www.dickssportinggoods.com/f/clearance",
                description: "Regular clearance up to 50% off",
                affiliate: true
            },
            {
                name: "REI",
                url: "https://www.rei.com/rei-garage",
                description: "Outlet/garage sales",
                affiliate: true
            },
            {
                name: "Nike",
                url: "https://www.nike.com/w/sale-3yaep",
                description: "Clearance section",
                affiliate: true
            },
            {
                name: "Adidas",
                url: "https://www.adidas.com/us/outlet",
                description: "Outlet deals",
                affiliate: true
            }
        ]
    },
    "entertainment": {
        name: "Entertainment",
        description: "Movies, games, books, and streaming deals",
        companies: [
            {
                name: "GameStop",
                url: "https://www.gamestop.com/deals",
                description: "Video game deals",
                affiliate: true
            },
            {
                name: "Steam",
                url: "https://store.steampowered.com/",
                description: "PC game sales (seasonal)",
                affiliate: true
            },
            {
                name: "PlayStation Store",
                url: "https://store.playstation.com/",
                description: "Digital game sales",
                affiliate: true
            }
        ]
    },
    "food-dining": {
        name: "Food & Dining",
        description: "Restaurant deals, grocery savings, and meal delivery",
        companies: [
            {
                name: "Thrive Market",
                url: "https://thrivemarket.com/",
                description: "Organic/natural foods",
                affiliate: true
            },
            {
                name: "Vitacost",
                url: "https://www.vitacost.com/",
                description: "Health foods",
                affiliate: true
            }
        ]
    },
    "travel": {
        name: "Travel & Vacations",
        description: "Flights, hotels, vacation packages, and travel deals",
        companies: [
            {
                name: "Expedia",
                url: "https://www.expedia.com/Deals",
                description: "Travel package deals",
                affiliate: true
            },
            {
                name: "Groupon Getaways",
                url: "https://www.groupon.com/getaways",
                description: "Travel up to 70% off",
                affiliate: true
            },
            {
                name: "Priceline",
                url: "https://www.priceline.com/",
                description: "Express deals",
                affiliate: true
            }
        ]
    },
    "automotive": {
        name: "Automotive",
        description: "Car deals, parts, accessories, and maintenance",
        companies: [
            {
                name: "AutoZone",
                url: "https://www.autozone.com/specials-and-promotions",
                description: "Car parts promotions",
                affiliate: true
            },
            {
                name: "Advance Auto Parts",
                url: "https://shop.advanceautoparts.com/",
                description: "Auto supplies",
                affiliate: true
            },
            {
                name: "RockAuto",
                url: "https://www.rockauto.com/",
                description: "Discount parts",
                affiliate: true
            }
        ]
    },
    "books-media": {
        name: "Books & Media",
        description: "Books, magazines, digital content, and educational resources",
        companies: [
            {
                name: "Barnes & Noble",
                url: "https://www.barnesandnoble.com/b/bargain-books/_/N-8q8",
                description: "Bargain books",
                affiliate: true
            },
            {
                name: "ThriftBooks",
                url: "https://www.thriftbooks.com/",
                description: "Used books up to 90% off",
                affiliate: true
            },
            {
                name: "Book Outlet",
                url: "https://bookoutlet.com/",
                description: "Remainder books",
                affiliate: true
            }
        ]
    },
    "kids-family": {
        name: "Kids & Family",
        description: "Toys, baby gear, children's clothing, and family essentials",
        companies: [
            {
                name: "Carter's",
                url: "https://www.carters.com/c/deals",
                description: "✅ 50% off entire site and stores",
                affiliate: true
            },
            {
                name: "OshKosh B'gosh",
                url: "https://www.oshkosh.com/sale",
                description: "Children's clothing",
                affiliate: true
            },
            {
                name: "Buy Buy Baby",
                url: "https://www.buybuybaby.com/",
                description: "Baby gear",
                affiliate: true
            }
        ]
    },
    "office-education": {
        name: "Office & Education",
        description: "Office supplies, school materials, and educational tools",
        companies: [
            {
                name: "Staples",
                url: "https://www.staples.com/deals",
                description: "Office supplies deals",
                affiliate: true
            },
            {
                name: "Office Depot",
                url: "https://www.officedepot.com/",
                description: "Business supplies",
                affiliate: true
            }
        ]
    },

    
    "pets": {
        name: "Pet Supplies",
        description: "Pet food, supplies, and services",
        companies: [
            {
                name: "Petco",
                url: "https://www.petco.com/shop/en/petcostore/special-offers",
                description: "Pet supplies deals",
                affiliate: true
            },
            {
                name: "Chewy",
                url: "https://www.chewy.com/deals/",
                description: "Pet products",
                affiliate: true
            },
            {
                name: "PetSmart",
                url: "https://www.petsmart.com/deals-and-promotions/",
                description: "Pet supplies",
                affiliate: true
            }
        ]
    },
    
    "other": {
        name: "Other",
        description: "Miscellaneous deals and special offers",
        companies: [
            {
                name: "Amazon Daily Deals",
                url: "https://www.amazon.com/gp/goldbox",
                description: "Various categories",
                affiliate: true
            },
            {
                name: "eBay Daily Deals",
                url: "https://www.ebay.com/dth/daily-deals",
                description: "Auction/fixed price deals",
                affiliate: true
            },
            {
                name: "Groupon",
                url: "https://www.groupon.com/",
                description: "Local services/products",
                affiliate: true
            },
            {
                name: "Overstock",
                url: "https://www.overstock.com/",
                description: "Various departments",
                affiliate: true
            },
            {
                name: "Adobe",
                url: "https://www.adobe.com/creativecloud/plans.html",
                description: "Creative software sales",
                affiliate: true
            },
            {
                name: "Microsoft",
                url: "https://www.microsoft.com/en-us/store/b/sale",
                description: "Software/subscriptions",
                affiliate: true
            }
        ]
    }
};

module.exports = categoriesData;
