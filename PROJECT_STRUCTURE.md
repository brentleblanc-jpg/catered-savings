# 🏗️ Catered Savings - Clean Project Structure

## 📁 **Core Files (Essential)**
```
Catered_Sales/
├── server.js                 # Main development server
├── server-production.js      # Production server (Railway)
├── package.json              # Dependencies
├── railway.json              # Railway deployment config
├── .env                      # Environment variables (local)
├── env.example               # Environment variables template
└── README.md                 # Project documentation
```

## 🗄️ **Database & Configuration**
```
prisma/
├── schema.prisma             # Database schema
├── seed.js                   # Database seeding
└── migrations/               # Database migration files
```

## 🌐 **Frontend (Public Files)**
```
public/
├── index.html                # Main landing page
├── index-modern.html         # Modern landing page
├── deals.html                # Personalized deals page
├── admin.html                # Admin dashboard
├── styles.css                # Main stylesheet
├── styles-modern.css         # Modern stylesheet
├── script.js                 # Main JavaScript
├── script-modern.js          # Modern JavaScript
├── admin.js                  # Admin dashboard JavaScript
└── admin-styles.css          # Admin-specific styles
```

## ⚙️ **Services & Business Logic**
```
services/
├── database.js               # Database operations
├── weekly-email-automation.js # Email automation
├── deal-discovery-manager.js  # Deal management
├── analyzers/
│   └── deal-analyzer.js      # Deal analysis
└── scrapers/                 # Web scraping services
    ├── amazon-scraper.js
    ├── bestbuy-scraper.js
    └── [other scrapers...]
```

## 📧 **Email Templates**
```
templates/
├── weekly-digest-template.html
├── tech-electronics-template.html
├── fashion-template.html
└── [category templates...]
```

## 📊 **Data & Assets**
```
data/
├── categories.js             # Product categories
└── sponsored-products.js     # Static product data

uploads/                      # File uploads directory
```

## 📋 **Documentation & Guides**
```
├── CSV_UPLOAD_GUIDE.md       # CSV upload instructions
├── DEPLOYMENT_GUIDE.md       # Deployment instructions
├── RULES_AND_REQUIREMENTS.md # Project requirements
└── PRODUCTION_TEST_PLAN.md   # Testing procedures
```

## 🗂️ **Templates & Samples**
```
├── csv-template.csv          # CSV upload template
├── products-template.csv     # Product template
└── sample-deals.csv          # Sample deal data
```

---

## ✅ **What We Removed:**
- 20+ test/development files
- 3 test HTML files
- Old production server files
- Duplicate configuration files
- Temporary migration scripts

## 🎯 **Result:**
- **Clean, focused structure**
- **Easy to navigate**
- **Only essential files**
- **Clear separation of concerns**
