// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentTab = 'dashboard';
        this.products = [];
        this.users = [];
        this.clicks = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.setDefaultDates();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // CSV Upload functionality
        this.setupCSVUpload();

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeProductModal();
        });

        // Cancel button
        document.getElementById('cancel-product-btn').addEventListener('click', () => {
            this.closeProductModal();
        });

        // Product form submission
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Settings save buttons
        document.getElementById('save-mailchimp-btn').addEventListener('click', () => {
            this.saveMailchimpSettings();
        });

        document.getElementById('save-site-btn').addEventListener('click', () => {
            this.saveSiteSettings();
        });

        // User search
        document.getElementById('user-search').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeProductModal();
            }
        });

        // Database action buttons
        document.getElementById('refresh-database').addEventListener('click', () => {
            this.refreshDatabase();
        });

        // Weekly automation buttons
        document.getElementById('run-weekly-automation').addEventListener('click', () => {
            this.runWeeklyAutomation();
        });

        document.getElementById('update-mailchimp-only').addEventListener('click', () => {
            this.updateMailchimpOnly();
        });

        // Deal discovery buttons (moved from database tab)
        document.getElementById('run-deal-discovery').addEventListener('click', () => {
            this.runDealDiscovery();
        });

        document.getElementById('scrape-amazon-deals').addEventListener('click', () => {
            this.scrapeAmazonDeals();
        });

        document.getElementById('test-scraper').addEventListener('click', () => {
            this.testScraper();
        });

        document.getElementById('update-product-images').addEventListener('click', () => {
            this.updateProductImages();
        });

        // User management buttons
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.openUserModal();
        });

        document.getElementById('sync-mailchimp-btn').addEventListener('click', () => {
            this.syncWithMailchimp();
        });

        // User modal events
        document.getElementById('close-user-modal').addEventListener('click', () => {
            this.closeUserModal();
        });

        document.getElementById('cancel-user-btn').addEventListener('click', () => {
            this.closeUserModal();
        });

        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // Affiliate modal events
        document.querySelectorAll('#affiliate-modal .close, #cancel-affiliate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAffiliateModal();
            });
        });

        document.getElementById('save-affiliate-btn').addEventListener('click', () => {
            this.saveAffiliateChanges();
        });

        // Close affiliate modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.id === 'affiliate-modal') {
                this.closeAffiliateModal();
            }
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update header
        this.updatePageHeader(tabName);

        // Load tab-specific data
        this.loadTabData(tabName);

        this.currentTab = tabName;
    }

    updatePageHeader(tabName) {
        const titles = {
            dashboard: 'Dashboard',
            products: 'Sponsored Products',
            analytics: 'Analytics',
            users: 'User Management',
            revenue: 'Revenue Tracking',
            database: 'Database Views',
            automation: 'Weekly Automation',
            settings: 'Settings'
        };

        const descriptions = {
            dashboard: 'Overview of your Catered Savings business',
            products: 'Manage sponsored products and pricing',
            analytics: 'View detailed performance metrics',
            users: 'Monitor user signups and preferences',
            revenue: 'Track monthly and projected revenue',
            database: 'Quick access to all database information and API endpoints',
            automation: 'Send fresh deals to all subscribers with one click',
            settings: 'Configure Mailchimp and site settings'
        };

        document.getElementById('page-title').textContent = titles[tabName];
        document.getElementById('page-description').textContent = descriptions[tabName];
    }

    async loadDashboardData() {
        try {
            // Load sponsored products
            console.log('Loading sponsored products...');
            const productsResponse = await fetch('/api/sponsored-products');
            console.log('Products response status:', productsResponse.status);
            const productsData = await productsResponse.json();
            console.log('Products data:', productsData);
            this.products = productsData.products || [];
            console.log('Loaded products count:', this.products.length);

            // Load users
            const usersResponse = await fetch('/api/admin/users');
            const usersData = await usersResponse.json();
            this.users = usersData.users || [];

            // Load clicks (if available)
            try {
                const clicksResponse = await fetch('/api/admin/clicks');
                const clicksData = await clicksResponse.json();
                this.clicks = clicksData.clicks || [];
            } catch (error) {
                this.clicks = [];
            }

            this.updateDashboardStats();
            this.loadTabData(this.currentTab);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats() {
        // Total users
        document.getElementById('total-users').textContent = this.users.length;

        // Active products
        const activeProducts = this.products.filter(p => p.active);
        document.getElementById('active-products').textContent = activeProducts.length;

        // Monthly revenue
        const monthlyRevenue = activeProducts.reduce((sum, p) => sum + (p.monthlyFee || 0), 0);
        document.getElementById('monthly-revenue').textContent = `$${monthlyRevenue.toLocaleString()}`;

        // Total clicks
        document.getElementById('total-clicks').textContent = this.clicks.length;
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadDashboardCharts();
                break;
            case 'products':
                this.loadAllProducts();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'users':
                this.loadUsersTable();
                break;
            case 'revenue':
                this.loadRevenueData();
                break;
            case 'settings':
                this.loadSettings();
                break;
            case 'automation':
                this.loadAutomationStatus();
                break;
        }
    }

    loadDashboardCharts() {
        // Placeholder for charts - in production, you'd use Chart.js or similar
        document.getElementById('signups-chart').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-chart-line" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                <p>Chart coming soon!</p>
                <small>${this.users.length} total signups</small>
            </div>
        `;

        document.getElementById('categories-chart').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-chart-pie" style="font-size: 3rem; color: #764ba2; margin-bottom: 1rem;"></i>
                <p>Chart coming soon!</p>
                <small>Category distribution</small>
            </div>
        `;
    }

    async loadProductsTable() {
        console.log('Loading products table...');
        
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Loading products...</td></tr>';

        try {
            // Fetch fresh data from server
            const response = await fetch('/api/admin/sponsored-products');
            const data = await response.json();
            
            if (data.success) {
                this.products = data.products;
            } else {
                throw new Error('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            this.products = [];
        }
        
        tbody.innerHTML = '';

        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: #6b7280;">
                        <i class="fas fa-box" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <p>No sponsored products found</p>
                        <small>Add products using the CSV upload feature</small>
                    </td>
                </tr>
            `;
            return;
        }

        this.products.forEach(product => {
            const row = document.createElement('tr');
            const discount = Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100);
            
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNSAxNUgyNVYyNUgxNVYxNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'}" 
                             alt="${product.title}" 
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600; color: #1a1a1a;">${product.title}</div>
                            <div style="font-size: 0.8rem; color: #6b7280;">${product.category}</div>
                        </div>
                    </div>
                </td>
                <td>${product.retailer}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 600; color: #e53e3e;">$${product.salePrice}</span>
                        <span style="text-decoration: line-through; color: #9ca3af; font-size: 0.9rem;">$${product.originalPrice}</span>
                        <span style="background: #dcfce7; color: #166534; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${discount}% OFF</span>
                    </div>
                </td>
                <td>$${product.monthlyFee}/month</td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.8rem; color: #6b7280;">${product.affiliateId || 'Not set'}</span>
                        <button class="action-btn edit-btn" onclick="adminDashboard.editAffiliate(${product.id})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                            <i class="fas fa-link"></i> Edit
                        </button>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${product.active ? 'status-active' : 'status-inactive'}">
                        ${product.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${this.getProductClicks(product.id)}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="adminDashboard.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Add event listeners for delete buttons
        tbody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = button.getAttribute('data-product-id');
                console.log('Delete button clicked via event listener, product ID:', productId);
                this.deleteProduct(productId);
            });
        });
    }

    loadAnalytics() {
        // Signup trends
        document.getElementById('signup-trends').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-chart-line" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                <p>Signup trends chart</p>
                <small>${this.users.length} total signups</small>
            </div>
        `;

        // Category distribution
        const categoryCounts = {};
        this.users.forEach(user => {
            if (user.categories) {
                user.categories.forEach(cat => {
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                });
            }
        });

        document.getElementById('category-distribution').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-chart-pie" style="font-size: 3rem; color: #764ba2; margin-bottom: 1rem;"></i>
                <p>Category distribution</p>
                <div style="margin-top: 1rem;">
                    ${Object.entries(categoryCounts).map(([cat, count]) => 
                        `<div style="margin: 0.5rem 0; padding: 0.5rem; background: #f3f4f6; border-radius: 8px;">
                            <strong>${cat}:</strong> ${count} users
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;

        // Click performance
        document.getElementById('click-performance').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-chart-bar" style="font-size: 3rem; color: #059669; margin-bottom: 1rem;"></i>
                <p>Click performance</p>
                <small>${this.clicks.length} total clicks</small>
            </div>
        `;
    }

    loadUsersTable() {
        // Call the proper loadUsers method that fetches data and renders the table with delete buttons
        this.loadUsers();
    }

    loadRevenueData() {
        const activeProducts = this.products.filter(p => p.active);
        const monthlyRevenue = activeProducts.reduce((sum, p) => sum + (p.monthlyFee || 0), 0);
        const annualRevenue = monthlyRevenue * 12;

        document.getElementById('monthly-revenue-amount').textContent = `$${monthlyRevenue.toLocaleString()}`;
        document.getElementById('annual-revenue').textContent = `$${annualRevenue.toLocaleString()}`;

        // Revenue breakdown chart
        document.getElementById('revenue-breakdown-chart').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-chart-bar" style="font-size: 3rem; color: #059669; margin-bottom: 1rem;"></i>
                <p>Revenue by product</p>
                <div style="margin-top: 1rem;">
                    ${activeProducts.map(product => 
                        `<div style="margin: 0.5rem 0; padding: 0.5rem; background: #f3f4f6; border-radius: 8px;">
                            <strong>${product.title}:</strong> $${product.monthlyFee}/month
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    loadSettings() {
        // Load current settings from localStorage or server
        document.getElementById('site-name').value = localStorage.getItem('siteName') || 'Catered Savings';
        document.getElementById('contact-email').value = localStorage.getItem('contactEmail') || '';
        
        // Load Mailchimp settings (you'd typically get these from server)
        document.getElementById('mailchimp-api-key').value = '';
        document.getElementById('mailchimp-server').value = '';
        document.getElementById('mailchimp-list-id').value = '';
    }

    openProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('product-form');

        if (productId) {
            // Edit mode
            const product = this.products.find(p => p.id === productId);
            if (product) {
                modalTitle.textContent = 'Edit Product';
                this.populateProductForm(product);
            }
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Product';
            form.reset();
            this.setDefaultDates();
        }

        modal.style.display = 'block';
    }

    closeProductModal() {
        document.getElementById('product-modal').style.display = 'none';
        document.getElementById('product-form').reset();
    }

    populateProductForm(product) {
        document.getElementById('product-title').value = product.title;
        document.getElementById('product-retailer').value = product.retailer;
        document.getElementById('product-original-price').value = product.originalPrice;
        document.getElementById('product-sale-price').value = product.salePrice;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-monthly-fee').value = product.monthlyFee;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image || '';
        document.getElementById('product-url').value = product.url;
        document.getElementById('product-start-date').value = product.startDate;
        document.getElementById('product-end-date').value = product.endDate;
        document.getElementById('product-active').checked = product.active;
    }

    setDefaultDates() {
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        
        document.getElementById('product-start-date').value = today.toISOString().split('T')[0];
        document.getElementById('product-end-date').value = nextYear.toISOString().split('T')[0];
    }

    async saveProduct() {
        const formData = {
            title: document.getElementById('product-title').value,
            retailer: document.getElementById('product-retailer').value,
            originalPrice: parseFloat(document.getElementById('product-original-price').value),
            salePrice: parseFloat(document.getElementById('product-sale-price').value),
            category: document.getElementById('product-category').value,
            monthlyFee: parseInt(document.getElementById('product-monthly-fee').value),
            description: document.getElementById('product-description').value,
            image: document.getElementById('product-image').value,
            url: document.getElementById('product-url').value,
            startDate: document.getElementById('product-start-date').value,
            endDate: document.getElementById('product-end-date').value,
            active: document.getElementById('product-active').checked,
            priority: this.products.length + 1
        };

        try {
            // In a real app, you'd send this to your server
            // For now, we'll just add it to the local array
            const newProduct = {
                id: Date.now(),
                ...formData,
                isSponsored: true
            };

            this.products.push(newProduct);
            this.closeProductModal();
            this.loadProductsTable();
            this.updateDashboardStats();
            this.loadRevenueData();

            // Show success message
            this.showNotification('Product saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Error saving product', 'error');
        }
    }

    editProduct(productId) {
        this.openProductModal(productId);
    }

    async deleteProduct(productId) {
        console.log('Delete product called with ID:', productId);
        if (confirm('Are you sure you want to delete this product?')) {
            console.log('User confirmed deletion');
            try {
                const response = await fetch('/api/admin/delete-product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId: productId })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    this.showNotification('Product deleted successfully!', 'success');
                    await this.loadProductsTable(); // Refresh the products table with fresh data
                } else {
                    throw new Error(result.message || 'Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                this.showNotification('Error deleting product: ' + error.message, 'error');
            }
        }
    }

    async loadAllProducts() {
        try {
            const response = await fetch('/api/sponsored-products');
            const data = await response.json();
            
            if (data.success && data.products) {
                this.products = data.products;
                this.renderProductsTable();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showEmptyState();
        }
    }

    renderProductsTable() {
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';

        if (this.products.length === 0) {
            this.showEmptyState();
            return;
        }

        this.products.forEach(product => {
            const discount = product.originalPrice ? 
                Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="product-info">
                        <div class="product-image">
                            <img src="${product.imageUrl || 'https://via.placeholder.com/50'}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/50'">
                        </div>
                        <div class="product-details">
                            <h4>${product.title}</h4>
                            <p>${product.description || 'No description'}</p>
                        </div>
                    </div>
                </td>
                <td>${product.category || 'N/A'}</td>
                <td>$${product.price || '0'}</td>
                <td>$${product.originalPrice || '0'}</td>
                <td>${discount}%</td>
                <td>
                    <span class="type-badge ${product.productType === 'deal' ? 'deal' : 'sponsored'}">
                        ${product.productType || 'deal'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${product.clickCount || 0}</td>
                <td>
                    <button class="action-btn delete-btn" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Add event listeners for delete buttons
        tbody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = button.getAttribute('data-product-id');
                console.log('Delete button clicked via event listener, product ID:', productId);
                this.deleteProduct(productId);
            });
        });
    }

    showEmptyState() {
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-content">
                        <i class="fas fa-box"></i>
                        <p>No products found</p>
                        <p>Upload a CSV file to add products</p>
                    </div>
                </td>
            </tr>
        `;
    }

    async clearAllProducts() {
        if (confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
            try {
                const response = await fetch('/api/admin/clear-all-products', {
                    method: 'POST'
                });
                
                if (response.ok) {
                    this.showNotification('All products deleted successfully!', 'success');
                    this.loadAllProducts();
                } else {
                    throw new Error('Failed to delete products');
                }
            } catch (error) {
                console.error('Error clearing products:', error);
                this.showNotification('Error clearing products', 'error');
            }
        }
    }

    // Affiliate Management Functions
    editAffiliate(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Populate the affiliate modal
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-affiliate-id').value = product.affiliateId || '';
        document.getElementById('edit-tracking-id').value = product.trackingId || '';
        
        // Show current affiliate URL
        const currentUrl = product.affiliateUrl || product.url;
        document.getElementById('current-affiliate-url').textContent = currentUrl;
        
        // Show the modal
        document.getElementById('affiliate-modal').style.display = 'block';
    }

    async saveAffiliateChanges() {
        const productId = parseInt(document.getElementById('edit-product-id').value);
        const affiliateId = document.getElementById('edit-affiliate-id').value;
        const trackingId = document.getElementById('edit-tracking-id').value;

        try {
            const response = await fetch('/api/admin/update-affiliate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    affiliateId,
                    trackingId
                })
            });

            if (response.ok) {
                // Update local product data
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    product.affiliateId = affiliateId;
                    product.trackingId = trackingId;
                    // Refresh the affiliate URL
                    product.affiliateUrl = this.buildAffiliateUrl(product);
                }

                this.closeAffiliateModal();
                this.loadProductsTable();
                this.showNotification('Affiliate ID updated successfully!', 'success');
            } else {
                throw new Error('Failed to update affiliate ID');
            }
        } catch (error) {
            console.error('Error updating affiliate ID:', error);
            this.showNotification('Error updating affiliate ID', 'error');
        }
    }

    closeAffiliateModal() {
        document.getElementById('affiliate-modal').style.display = 'none';
        document.getElementById('affiliate-form').reset();
    }

    buildAffiliateUrl(product) {
        if (!product.affiliateId) {
            return product.url;
        }
        
        const baseUrl = product.url;
        const separator = baseUrl.includes('?') ? '&' : '?';
        
        switch (product.affiliateProgram) {
            case 'amazon':
                return `${baseUrl}${separator}tag=${product.affiliateId}`;
            case 'bestbuy':
            case 'nike':
            case 'williams-sonoma':
            case 'carters':
                return `${baseUrl}${separator}affiliate=${product.affiliateId}`;
            default:
                return baseUrl;
        }
    }

    viewUser(email) {
        const user = this.users.find(u => u.email === email);
        if (user) {
            alert(`User Details:\nEmail: ${user.email}\nName: ${user.firstName || 'Anonymous'}\nCategories: ${user.categories ? user.categories.join(', ') : 'None'}\nSignup: ${new Date(user.timestamp || user.id).toLocaleDateString()}`);
        }
    }

    filterUsers(searchTerm) {
        const tbody = document.getElementById('users-table-body');
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const email = row.cells[0].textContent.toLowerCase();
            const name = row.cells[1].textContent.toLowerCase();
            const categories = row.cells[2].textContent.toLowerCase();

            if (email.includes(searchTerm.toLowerCase()) || 
                name.includes(searchTerm.toLowerCase()) || 
                categories.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    saveMailchimpSettings() {
        const apiKey = document.getElementById('mailchimp-api-key').value;
        const server = document.getElementById('mailchimp-server').value;
        const listId = document.getElementById('mailchimp-list-id').value;

        // In a real app, you'd save these to your server
        localStorage.setItem('mailchimpApiKey', apiKey);
        localStorage.setItem('mailchimpServer', server);
        localStorage.setItem('mailchimpListId', listId);

        this.showNotification('Mailchimp settings saved!', 'success');
    }

    saveSiteSettings() {
        const siteName = document.getElementById('site-name').value;
        const contactEmail = document.getElementById('contact-email').value;

        localStorage.setItem('siteName', siteName);
        localStorage.setItem('contactEmail', contactEmail);

        this.showNotification('Site settings saved!', 'success');
    }

    getProductClicks(productId) {
        return this.clicks.filter(click => click.productId === productId).length;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#059669';
                break;
            case 'error':
                notification.style.background = '#dc2626';
                break;
            default:
                notification.style.background = '#667eea';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Database action methods
    async runDealDiscovery() {
        const button = document.getElementById('run-deal-discovery');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            button.disabled = true;
            
            const response = await fetch('/api/deal-discovery/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Deal discovery completed successfully!', 'success');
                // Refresh the page to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                this.showNotification('Deal discovery failed: ' + result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error running deal discovery: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async scrapeAmazonDeals() {
        const button = document.getElementById('scrape-amazon-deals');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scraping...';
            button.disabled = true;
            
            const response = await fetch('/api/admin/scrape-amazon-deals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Found ${result.count} Amazon deals with 50%+ off!`, 'success');
                console.log('Amazon deals:', result.deals);
            } else {
                this.showNotification('Amazon scraping failed: ' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Amazon scraping error: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async testScraper() {
        const button = document.getElementById('test-scraper');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
            button.disabled = true;
            
            const response = await fetch('/api/deal-discovery/test/fresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Test scraper found ${result.deals.length} deals!`, 'success');
            } else {
                this.showNotification('Test scraper failed: ' + result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error testing scraper: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async refreshDatabase() {
        const button = document.getElementById('refresh-database');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            button.disabled = true;
            
            // Refresh dashboard data
            await this.loadDashboardData();
            this.showNotification('Database data refreshed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error refreshing database: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    // Weekly Automation Methods
    async runWeeklyAutomation() {
        const button = document.getElementById('run-weekly-automation');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Emails...';
            button.disabled = true;
            
            this.addLog('🚀 Starting weekly automation...');
            
            const response = await fetch('/api/weekly-automation/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addLog('✅ Weekly automation completed successfully!');
                this.addLog(`📧 Emails sent to all subscribers`);
                this.showNotification('Weekly emails sent successfully!', 'success');
                await this.loadAutomationStatus();
            } else {
                throw new Error(result.message || 'Weekly automation failed');
            }
        } catch (error) {
            this.addLog(`❌ Error: ${error.message}`);
            this.showNotification('Error sending weekly emails: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async updateMailchimpOnly() {
        const button = document.getElementById('update-mailchimp-only');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            button.disabled = true;
            
            this.addLog('📧 Updating Mailchimp with fresh data...');
            
            const response = await fetch('/api/weekly-automation/update-mailchimp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addLog('✅ Mailchimp updated successfully!');
                this.addLog('📊 Fresh deal data sent to Mailchimp');
                this.showNotification('Mailchimp updated successfully!', 'success');
            } else {
                throw new Error(result.message || 'Mailchimp update failed');
            }
        } catch (error) {
            this.addLog(`❌ Error: ${error.message}`);
            this.showNotification('Error updating Mailchimp: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async testScraper() {
        const button = document.getElementById('test-scraper');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
            button.disabled = true;
            
            const response = await fetch('/api/admin/test-scraper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Scraper test successful! Found ${result.count} test deals`, 'success');
                console.log('Test results:', result.deals);
            } else {
                this.showNotification('Scraper test failed: ' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Scraper test error: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async runDealDiscovery() {
        const button = document.getElementById('run-deal-discovery');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Discovering...';
            button.disabled = true;
            
            this.addLog('🔍 Starting deal discovery...');
            
            const response = await fetch('/api/admin/run-deal-discovery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addLog(`✅ Deal discovery completed! Found ${result.count} new deals`);
                this.showNotification(`Found ${result.count} new deals!`, 'success');
                console.log('New deals:', result.deals);
            } else {
                this.addLog(`❌ Deal discovery failed: ${result.error}`);
                this.showNotification('Deal discovery failed: ' + result.error, 'error');
            }
        } catch (error) {
            this.addLog(`❌ Deal discovery error: ${error.message}`);
            this.showNotification('Deal discovery error: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async updateProductImages() {
        const button = document.getElementById('update-product-images');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating Images...';
            button.disabled = true;
            
            this.addLog('🖼️ Starting product image update...');
            
            const response = await fetch('/api/admin/update-product-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addLog(`✅ Updated ${result.updatedCount} product images successfully!`);
                this.showNotification(`Updated ${result.updatedCount} product images!`, 'success');
                console.log('Image update results:', result);
            } else {
                this.addLog(`❌ Image update failed: ${result.error}`);
                this.showNotification('Image update failed: ' + result.error, 'error');
            }
        } catch (error) {
            this.addLog(`❌ Image update error: ${error.message}`);
            this.showNotification('Image update error: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async loadAutomationStatus() {
        const statusElement = document.getElementById('automation-status');
        
        try {
            const response = await fetch('/api/weekly-automation/status');
            const result = await response.json();
            
            if (result.success) {
                const status = result.status;
                
                statusElement.innerHTML = `
                    <div class="status-item">
                        <i class="fas fa-users"></i>
                        <span>Subscribers: ${status.listMembers}</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-paper-plane"></i>
                        <span>Campaigns: ${status.recentCampaigns}</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-database"></i>
                        <span>Database Users: ${status.userCount}</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-clock"></i>
                        <span>Last Updated: ${new Date(status.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                `;
            } else {
                throw new Error(result.error || 'Failed to load status');
            }
        } catch (error) {
            console.error('Error loading automation status:', error);
            statusElement.innerHTML = `
                <div class="status-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Failed to load status: ${error.message}</span>
                </div>
            `;
        }
    }

    addLog(message) {
        const logsContainer = document.getElementById('automation-logs');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
        
        logsContainer.insertBefore(logEntry, logsContainer.firstChild);
        
        // Keep only last 10 log entries
        while (logsContainer.children.length > 10) {
            logsContainer.removeChild(logsContainer.lastChild);
        }
    }

    // User Management Methods
    openUserModal() {
        document.getElementById('user-modal').style.display = 'block';
        document.getElementById('user-modal-title').textContent = 'Add New User';
        document.getElementById('user-form').reset();
        document.getElementById('add-to-mailchimp').checked = true;
    }

    closeUserModal() {
        document.getElementById('user-modal').style.display = 'none';
    }

    async saveUser() {
        const formData = {
            email: document.getElementById('user-email').value,
            name: document.getElementById('user-name').value,
            categories: Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(cb => cb.value),
            status: document.getElementById('user-status').value,
            addToMailchimp: document.getElementById('add-to-mailchimp').checked
        };

        if (formData.categories.length === 0) {
            this.showNotification('Please select at least one category', 'error');
            return;
        }

        try {
            const response = await fetch('/api/submit-savings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('User added successfully!', 'success');
                this.closeUserModal();
                this.loadUsers();
                this.loadDashboardData();
            } else {
                this.showNotification('Error adding user: ' + result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error adding user: ' + error.message, 'error');
        }
    }

    async syncWithMailchimp() {
        const button = document.getElementById('sync-mailchimp-btn');
        const originalText = button.innerHTML;
        const syncStatus = document.getElementById('sync-status');
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            button.disabled = true;
            
            syncStatus.className = 'sync-status';
            syncStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing users...';

            // Actually perform the sync (this will add database users to Mailchimp)
            const syncResponse = await fetch('/api/admin/sync-mailchimp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const syncResult = await syncResponse.json();
            
            if (!syncResult.success) {
                throw new Error(syncResult.error || 'Sync failed');
            }

            // Get updated user counts after sync
            const dbResponse = await fetch('/api/admin/users');
            const dbData = await dbResponse.json();
            
            const mailchimpResponse = await fetch('/api/mailchimp/users');
            const mailchimpData = await mailchimpResponse.json();

            // Update comparison cards
            document.getElementById('db-user-count').textContent = dbData.users ? dbData.users.length : 0;
            document.getElementById('mailchimp-user-count').textContent = mailchimpData.totalSubscribers || 0;
            
            const discrepancy = Math.abs((dbData.users ? dbData.users.length : 0) - (mailchimpData.totalSubscribers || 0));
            document.getElementById('discrepancy-count').textContent = discrepancy;

            // Update sync status with detailed results
            const syncDetails = `
                <div style="text-align: left; margin-top: 10px;">
                    <strong>Sync Results:</strong><br>
                    • Users synced: ${syncResult.syncedCount}<br>
                    • Added to Mailchimp: ${syncResult.usersAddedToMailchimp || 0}<br>
                    • Added to Database: ${syncResult.usersAddedToDb || 0}<br>
                    • Database users: ${syncResult.dbUsersCount || 0}<br>
                    • Mailchimp subscribers: ${syncResult.mailchimpMembersCount || 0}
                </div>
            `;

            if (discrepancy === 0) {
                syncStatus.className = 'sync-status success';
                syncStatus.innerHTML = '<i class="fas fa-check-circle"></i> User lists are in sync!' + syncDetails;
            } else if (discrepancy < 5) {
                syncStatus.className = 'sync-status warning';
                syncStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Minor discrepancy: ${discrepancy} users differ` + syncDetails;
            } else {
                syncStatus.className = 'sync-status error';
                syncStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Significant discrepancy: ${discrepancy} users differ` + syncDetails;
            }

            // Show detailed notification
            let notificationMessage = `Mailchimp sync completed! ${syncResult.syncedCount} users synced. Added ${syncResult.usersAddedToMailchimp || 0} to Mailchimp, ${syncResult.usersAddedToDb || 0} to database.`;
            
            // Add error information if any
            if (syncResult.errors && syncResult.errors.length > 0) {
                notificationMessage += ` ${syncResult.errors.length} errors occurred.`;
                console.warn('Sync errors:', syncResult.errors);
            }
            
            this.showNotification(notificationMessage, 'success');
            
        } catch (error) {
            syncStatus.className = 'sync-status error';
            syncStatus.innerHTML = '<i class="fas fa-times-circle"></i> Sync failed: ' + error.message;
            this.showNotification('Error syncing with Mailchimp: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('User deleted successfully', 'success');
                this.loadUsers();
                this.loadDashboardData();
            } else {
                this.showNotification('Error deleting user: ' + result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error deleting user: ' + error.message, 'error');
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            
            this.users = data.users || [];
            this.renderUsersTable();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.categories ? user.categories.join(', ') : 'N/A'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${user.status || 'active'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>
                    <span class="mailchimp-status ${user.mailchimpStatus || 'unknown'}">
                        <i class="fas fa-${user.mailchimpStatus === 'subscribed' ? 'check' : 'times'}"></i>
                        ${user.mailchimpStatus || 'unknown'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="adminDashboard.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // CSV Upload functionality
    setupCSVUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('csv-file-input');
        const browseBtn = document.getElementById('browse-files-btn');
        const downloadTemplateBtn = document.getElementById('download-template-btn');
        const processBtn = document.getElementById('process-csv-btn');
        const cancelBtn = document.getElementById('cancel-upload-btn');

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Browse button
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // Download template
        downloadTemplateBtn.addEventListener('click', () => {
            this.downloadTemplate();
        });

        // Process CSV
        processBtn.addEventListener('click', () => {
            this.processCSV();
        });

        // Cancel upload
        cancelBtn.addEventListener('click', () => {
            this.cancelUpload();
        });

        // Clear all products
        const clearAllBtn = document.getElementById('clear-all-products-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllProducts();
            });
        }
    }

    handleFileSelect(file) {
        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.parseCSV(e.target.result);
        };
        reader.readAsText(file);
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = this.parseCSVLine(lines[0]);
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = this.parseCSVLine(lines[i]);
                const product = {};
                
                headers.forEach((header, index) => {
                    product[header] = values[index] || '';
                });
                
                // Convert price fields to numbers
                if (product.price) product.price = parseFloat(product.price);
                if (product.originalPrice) product.originalPrice = parseFloat(product.originalPrice);
                
                products.push(product);
            }
        }

        this.csvData = products;
        this.showCSVPreview(products.slice(0, 3), headers);
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    showCSVPreview(products, headers) {
        const previewTable = document.getElementById('preview-table');
        const csvPreview = document.getElementById('csv-preview');
        
        // Clear existing content
        previewTable.innerHTML = '';
        
        // Create header row
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        previewTable.appendChild(headerRow);
        
        // Create data rows
        products.forEach(product => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = product[header] || '';
                row.appendChild(td);
            });
            previewTable.appendChild(row);
        });
        
        csvPreview.style.display = 'block';
    }

    async processCSV() {
        if (!this.csvData || this.csvData.length === 0) {
            alert('No data to process');
            return;
        }

        const processBtn = document.getElementById('process-csv-btn');
        const originalText = processBtn.innerHTML;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        processBtn.disabled = true;

        try {
            const response = await fetch('/api/admin/add-multiple-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ products: this.csvData })
            });

            const result = await response.json();
            this.showUploadResults(result);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            processBtn.innerHTML = originalText;
            processBtn.disabled = false;
        }
    }

    showUploadResults(result) {
        const resultsDiv = document.getElementById('results-summary');
        const uploadResults = document.getElementById('upload-results');
        
        resultsDiv.innerHTML = `
            <div class="result-stat">
                <div class="number">${result.added || 0}</div>
                <div class="label">Added</div>
            </div>
            <div class="result-stat">
                <div class="number">${result.skipped || 0}</div>
                <div class="label">Skipped</div>
            </div>
            <div class="result-stat">
                <div class="number">${(result.added || 0) + (result.skipped || 0)}</div>
                <div class="label">Total Processed</div>
            </div>
        `;
        
        uploadResults.style.display = 'block';
        
        // Refresh products table
        this.loadProductsTable();
    }

    downloadTemplate() {
        const templateContent = `title,description,price,originalPrice,imageUrl,affiliateUrl,category,productType
"KitchenAid Artisan Stand Mixer","KitchenAid Artisan Series 5-Qt Stand Mixer with Pouring Shield - Perfect for baking and cooking",199.99,399.99,"https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg","https://www.amazon.com/dp/B08N5WRWNW","home-garden","deal"
"Instant Pot Duo 7-in-1","Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart, 14 One-Touch Programs",49.97,99.95,"https://m.media-amazon.com/images/I/71QHvW2hl7L._AC_SL1500_.jpg","https://www.amazon.com/dp/B00FLYWNYQ","home-garden","deal"
"Sony WH-1000XM4 Headphones","Industry Leading Noise Canceling Overhead Headphones with Mic for Phone-Call and Alexa Voice Control",199.99,349.99,"https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg","https://www.amazon.com/dp/B0863TXGM3","tech-electronics","deal"`;

        const blob = new Blob([templateContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    cancelUpload() {
        document.getElementById('csv-preview').style.display = 'none';
        document.getElementById('upload-results').style.display = 'none';
        document.getElementById('csv-file-input').value = '';
        this.csvData = null;
    }
}

// Initialize admin dashboard when page loads
let adminDashboard;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
    // Make adminDashboard globally accessible for onclick handlers
    window.adminDashboard = adminDashboard;
    
    // Test function to verify global scope
    window.testDelete = function() {
        console.log('Test delete function called!');
        console.log('adminDashboard exists:', !!window.adminDashboard);
        console.log('adminDashboard.deleteProduct exists:', !!window.adminDashboard?.deleteProduct);
    };
    
    console.log('Admin dashboard initialized');
    console.log('adminDashboard available globally:', !!window.adminDashboard);
});
