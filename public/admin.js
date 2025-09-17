// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentTab = 'dashboard';
        this.products = [];
        this.users = [];
        this.clicks = [];
        this.isAuthenticated = false;
        this.authToken = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDates();
        this.checkAuthentication();
    }

    loadSavedTab() {
        // Load saved tab from localStorage, fallback to 'dashboard'
        const savedTab = localStorage.getItem('adminActiveTab') || 'dashboard';
        
        // Validate that the saved tab exists
        const validTabs = ['dashboard', 'products', 'featured-deals', 'analytics', 'users', 'settings'];
        const tabToLoad = validTabs.includes(savedTab) ? savedTab : 'dashboard';
        
        // Only switch if it's not the default dashboard
        if (tabToLoad !== 'dashboard') {
            this.switchTab(tabToLoad);
        }
    }

    checkAuthentication() {
        const token = localStorage.getItem('adminToken');
        const expiresAt = localStorage.getItem('adminTokenExpires');
        
        if (token && expiresAt) {
            const now = new Date();
            const expiration = new Date(expiresAt);
            
            if (now < expiration) {
                this.isAuthenticated = true;
                this.authToken = token;
                this.showAdminInterface();
                this.loadDashboardData();
                // Load saved tab after everything is loaded
                window.addEventListener('load', () => {
                    this.loadSavedTab();
                });
            } else {
                this.clearAuth();
                this.showLoginForm();
            }
        } else {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('admin-container').style.display = 'none';
    }

    showAdminInterface() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
    }

    async login(password) {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                this.isAuthenticated = true;
                this.authToken = data.token;
                
                // Store token and expiration
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminTokenExpires', data.expiresAt);
                
                this.showAdminInterface();
                this.loadDashboardData();
                
                // Load saved tab
                this.loadSavedTab();
                
                return true;
            } else {
                this.showError(data.error || 'Login failed');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please try again.');
            return false;
        }
    }

    logout() {
        this.clearAuth();
        this.showLoginForm();
        
        // Clear any cached data
        this.products = [];
        this.users = [];
        this.clicks = [];
    }

    clearAuth() {
        this.isAuthenticated = false;
        this.authToken = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminTokenExpires');
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer admin123`,
            'Content-Type': 'application/json'
        };
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('admin-password').value;
            await this.login(password);
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
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

        const syncButton = document.getElementById('sync-mailchimp-btn');
        if (syncButton) {
            console.log('Sync button found, adding event listener');
            syncButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Sync button clicked!');
                this.syncWithMailchimp();
            });
        } else {
            console.error('Sync button not found!');
        }

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

        // Featured deals buttons
        const addBtn = document.getElementById('add-featured-deal-btn');
        if (addBtn) {
            console.log('Setting up add featured deal button listener');
            addBtn.addEventListener('click', () => {
                console.log('Add featured deal button clicked');
                this.addFeaturedDeal();
            });
        } else {
            console.error('Add featured deal button not found');
        }

        document.getElementById('refresh-featured-deals-btn').addEventListener('click', () => {
            this.loadFeaturedDeals();
        });

        // Featured deal modal event listeners
        document.getElementById('close-featured-deal-modal').addEventListener('click', () => {
            this.closeFeaturedDealModal();
        });

        document.getElementById('cancel-featured-deal-btn').addEventListener('click', () => {
            this.closeFeaturedDealModal();
        });

        document.getElementById('featured-deal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const dealData = {
                title: formData.get('title'),
                description: formData.get('description'),
                imageUrl: formData.get('imageUrl'),
                affiliateUrl: formData.get('affiliateUrl'),
                price: parseFloat(formData.get('price')) || null,
                originalPrice: parseFloat(formData.get('originalPrice')) || null,
                discount: parseInt(formData.get('discount')) || null,
                category: formData.get('category'),
                retailer: formData.get('retailer'),
                displayOrder: parseInt(formData.get('displayOrder')) || 0,
                startDate: formData.get('startDate') ? new Date(formData.get('startDate')) : new Date(),
                endDate: formData.get('endDate') ? new Date(formData.get('endDate')) : null
            };

            await this.saveFeaturedDeal(dealData);
        });

        // Close modal when clicking outside
        document.getElementById('featured-deal-modal').addEventListener('click', (e) => {
            if (e.target.id === 'featured-deal-modal') {
                this.closeFeaturedDealModal();
            }
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Update header
        this.updatePageHeader(tabName);

        // Load tab-specific data
        this.loadTabData(tabName);

        this.currentTab = tabName;
        
        // Save current tab to localStorage
        localStorage.setItem('adminActiveTab', tabName);
    }

    updatePageHeader(tabName) {
        const titles = {
            dashboard: 'Dashboard',
            products: 'Sponsored Products',
            'featured-deals': 'Featured Deals',
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
            'featured-deals': 'Manage featured deals for homepage display',
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
            const productsResponse = await fetch('/api/admin/sponsored-products', {
                headers: this.getAuthHeaders()
            });
            const productsData = await productsResponse.json();
            this.products = productsData.products || [];

            // Load users
            const usersResponse = await fetch('/api/admin/users', {
                headers: this.getAuthHeaders()
            });
            const usersData = await usersResponse.json();
            this.users = usersData.users || [];

            // Load clicks (if available)
            try {
                const clicksResponse = await fetch('/api/admin/clicks', {
                    headers: this.getAuthHeaders()
                });
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
        // Total users (subscribers)
        const userCount = this.users ? this.users.length : 0;
        const totalUsersElement = document.getElementById('total-users');
        if (totalUsersElement) {
            totalUsersElement.textContent = userCount;
        }

        // Active products
        const activeProducts = this.products ? this.products.filter(p => p.isActive) : [];
        const productCount = activeProducts.length;
        const activeProductsElement = document.getElementById('active-products');
        if (activeProductsElement) {
            activeProductsElement.textContent = productCount;
        }

        // Monthly revenue and Total clicks are now "Coming Soon" - no need to update
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                // Dashboard charts removed - no action needed
                break;
            case 'products':
                this.loadAllProducts();
                break;
            case 'featured-deals':
                this.loadFeaturedDeals();
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


    async loadProductsTable() {
        console.log('Loading products table...');
        
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Loading products...</td></tr>';

        try {
            // Fetch fresh data from server
            const response = await fetch('/api/admin/sponsored-products', {
                headers: this.getAuthHeaders()
            });
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
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({ productId: productId })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    this.showNotification('Product deleted successfully!', 'success');
                    await this.loadProductsTable(); // Refresh the products table with fresh data
                    await this.loadDashboardData(); // Update dashboard numbers
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
            const response = await fetch('/api/admin/sponsored-products', {
                headers: this.getAuthHeaders()
            });
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
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
                
                if (response.ok) {
                    this.showNotification('All products deleted successfully!', 'success');
                    this.loadAllProducts();
                    this.loadDashboardData(); // Update dashboard numbers
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
        console.log('syncWithMailchimp function called!');
        const button = document.getElementById('sync-mailchimp-btn');
        const originalText = button.innerHTML;
        const syncStatus = document.getElementById('sync-status');
        
        console.log('Button found:', !!button);
        console.log('Sync status found:', !!syncStatus);
        
        if (!button || !syncStatus) {
            console.error('Required elements not found!');
            this.showNotification('Error: Required elements not found', 'error');
            return;
        }
        
        try {
            // Update button state
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            button.disabled = true;
            button.style.opacity = '0.7';
            
            // Update status
            syncStatus.className = 'sync-status syncing';
            syncStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing users with Mailchimp...';

            // Actually perform the sync (this will add database users to Mailchimp)
            const syncResponse = await fetch('/api/admin/sync-mailchimp', {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            
            const syncResult = await syncResponse.json();
            
            if (!syncResult.success) {
                throw new Error(syncResult.error || 'Sync failed');
            }

            // Get updated user counts after sync
            const dbResponse = await fetch('/api/admin/users', {
                headers: this.getAuthHeaders()
            });
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
            
            // Update sync status with success message
            syncStatus.className = 'sync-status success';
            syncStatus.innerHTML = `<i class="fas fa-check-circle"></i> Sync completed! ${syncResult.syncedCount} users synced.`;
            
            // Update dashboard with new user data
            this.loadDashboardData();
            
        } catch (error) {
            syncStatus.className = 'sync-status error';
            syncStatus.innerHTML = '<i class="fas fa-times-circle"></i> Sync failed: ' + error.message;
            this.showNotification('Error syncing with Mailchimp: ' + error.message, 'error');
        } finally {
            // Reset button state
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
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

    copyUrl(url) {
        console.log('Copying URL:', url);
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                console.log('URL copied successfully');
                this.showNotification('URL copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Clipboard API failed:', err);
                this.fallbackCopy(url);
            });
        } else {
            console.log('Using fallback copy method');
            this.fallbackCopy(url);
        }
    }
    
    fallbackCopy(url) {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('Fallback copy successful');
                this.showNotification('URL copied to clipboard!', 'success');
            } else {
                console.error('Fallback copy failed');
                this.showNotification('Failed to copy URL', 'error');
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
            this.showNotification('Failed to copy URL', 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: this.getAuthHeaders()
            });
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

        // Category mapping with icons and colors
        const categoryMap = {
            'tech-electronics': { name: 'Tech', icon: 'fas fa-laptop', color: '#3b82f6' },
            'home-garden': { name: 'Home', icon: 'fas fa-home', color: '#10b981' },
            'fashion-accessories': { name: 'Fashion', icon: 'fas fa-gem', color: '#f59e0b' },
            'mens-fashion': { name: 'Men', icon: 'fas fa-male', color: '#8b5cf6' },
            'womens-fashion': { name: 'Women', icon: 'fas fa-female', color: '#ec4899' },
            'health-beauty': { name: 'Health', icon: 'fas fa-heart', color: '#ef4444' },
            'sports-outdoors': { name: 'Sports', icon: 'fas fa-dumbbell', color: '#06b6d4' },
            'automotive': { name: 'Auto', icon: 'fas fa-car', color: '#6b7280' },
            'books-media': { name: 'Books', icon: 'fas fa-book', color: '#84cc16' },
            'food-dining': { name: 'Food', icon: 'fas fa-utensils', color: '#f97316' },
            'kids-family': { name: 'Kids', icon: 'fas fa-child', color: '#8b5cf6' },
            'pets': { name: 'Pets', icon: 'fas fa-paw', color: '#10b981' },
            'travel': { name: 'Travel', icon: 'fas fa-plane', color: '#3b82f6' },
            'office-education': { name: 'Office', icon: 'fas fa-briefcase', color: '#6366f1' },
            'entertainment': { name: 'Entertainment', icon: 'fas fa-gamepad', color: '#ec4899' },
            'other': { name: 'Other', icon: 'fas fa-ellipsis-h', color: '#6b7280' }
        };

        this.users.forEach(user => {
            const row = document.createElement('tr');
            
            // Create categories display
            let categoriesDisplay = 'N/A';
            if (user.categories && user.categories.length > 0) {
                let categoryTags = user.categories.slice(0, 3).map(cat => {
                    const catInfo = categoryMap[cat] || { name: cat, icon: 'fas fa-tag', color: '#6b7280' };
                    return `<span class="category-tag" style="background: ${catInfo.color}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin: 1px; display: inline-block;">
                        <i class="${catInfo.icon}" style="font-size: 8px; margin-right: 2px;"></i>${catInfo.name}
                    </span>`;
                }).join('');
                
                if (user.categories.length > 3) {
                    categoryTags += `<span class="category-more" style="color: #6b7280; font-size: 10px; margin-left: 4px;">+${user.categories.length - 3} more</span>`;
                }
                
                categoriesDisplay = categoryTags;
            }
            
            // Generate personalized URL
            const baseUrl = window.location.origin;
            const personalizedUrl = user.accessToken ? `${baseUrl}/deals/${user.accessToken}` : 'No token';
            
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.name || 'N/A'}</td>
                <td style="max-width: 200px; overflow: hidden;">${categoriesDisplay}</td>
                <td style="max-width: 300px;">
                    ${user.accessToken ? 
                        `<div class="url-container">
                            <input type="text" value="${personalizedUrl}" readonly class="url-input" onclick="this.select()">
                            <button class="btn btn-sm btn-copy" data-url="${personalizedUrl}" title="Copy URL">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>` : 
                        '<span class="text-muted">No token</span>'
                    }
                </td>
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
        
        // Add event listeners to copy buttons
        this.setupCopyButtons();
    }
    
    setupCopyButtons() {
        // Remove existing event listeners to avoid duplicates
        document.querySelectorAll('.btn-copy').forEach(button => {
            button.removeEventListener('click', this.handleCopyClick);
        });
        
        // Add event listeners to all copy buttons
        document.querySelectorAll('.btn-copy').forEach(button => {
            button.addEventListener('click', this.handleCopyClick.bind(this));
        });
    }
    
    handleCopyClick(event) {
        const url = event.target.closest('.btn-copy').getAttribute('data-url');
        this.copyUrl(url);
    }

    // CSV Upload functionality
    setupCSVUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('csv-file-input');
        const browseBtn = document.getElementById('browse-files-btn');
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
                headers: this.getAuthHeaders(),
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
        
        // Refresh products table and dashboard
        this.loadProductsTable();
        this.loadDashboardData();
    }


    cancelUpload() {
        document.getElementById('csv-preview').style.display = 'none';
        document.getElementById('upload-results').style.display = 'none';
        document.getElementById('csv-file-input').value = '';
        this.csvData = null;
    }

    // Featured Deals Management
    async loadFeaturedDeals() {
        try {
            const response = await fetch('/api/admin/featured-deals', {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch featured deals');
            }
            
            const data = await response.json();
            this.featuredDeals = data.deals || [];
            this.displayFeaturedDeals();
        } catch (error) {
            console.error('Error loading featured deals:', error);
            this.showError('Failed to load featured deals');
        }
    }

    displayFeaturedDeals() {
        const tableBody = document.getElementById('featured-deals-table-body');
        if (!tableBody) return;

        if (this.featuredDeals.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-star"></i>
                        <p>No featured deals found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.featuredDeals.map(deal => `
            <tr>
                <td>${deal.displayOrder}</td>
                <td>
                    <img src="${deal.imageUrl}" alt="${deal.title}" class="product-thumbnail" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNyAzNEgyM1Y0MEgxN1YzNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'" />
                </td>
                <td class="product-title">${deal.title}</td>
                <td>${deal.retailer || 'Amazon'}</td>
                <td>$${deal.price?.toFixed(2) || '0.00'}</td>
                <td>${deal.discount || 0}%</td>
                <td>
                    <span class="status-badge ${deal.isActive ? 'active' : 'inactive'}">
                        ${deal.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${deal.clickCount || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.editFeaturedDeal('${deal.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteFeaturedDeal('${deal.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    addFeaturedDeal() {
        console.log('addFeaturedDeal called'); // Debug log
        
        try {
            // Check if elements exist
            const form = document.getElementById('featured-deal-form');
            const modal = document.getElementById('featured-deal-modal');
            const title = document.getElementById('featured-deal-modal-title');
            
            if (!form || !modal || !title) {
                console.error('Required elements not found:', { form: !!form, modal: !!modal, title: !!title });
                alert('Error: Modal form not found. Please refresh the page.');
                return;
            }
            
            // Reset form
            form.reset();
            title.textContent = 'Add Featured Deal';
            
            // Set default values
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const startDateInput = document.getElementById('deal-start-date');
            const endDateInput = document.getElementById('deal-end-date');
            const displayOrderInput = document.getElementById('deal-display-order');
            
            if (startDateInput) startDateInput.value = now.toISOString().slice(0, 16);
            if (endDateInput) endDateInput.value = tomorrow.toISOString().slice(0, 16);
            if (displayOrderInput) displayOrderInput.value = (this.featuredDeals?.length || 0) + 1;
            
            // Show modal
            modal.style.display = 'block';
            console.log('Modal should be visible now');
            
        } catch (error) {
            console.error('Error in addFeaturedDeal:', error);
            alert('Error opening add deal form: ' + error.message);
        }
    }

    async saveFeaturedDeal(dealData) {
        try {
            const response = await fetch('/api/admin/featured-deals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(dealData)
            });

            if (!response.ok) {
                throw new Error('Failed to create featured deal');
            }

            const result = await response.json();
            this.showSuccess('Featured deal created successfully');
            this.closeFeaturedDealModal();
            this.loadFeaturedDeals();
        } catch (error) {
            console.error('Error creating featured deal:', error);
            this.showError('Failed to create featured deal');
        }
    }

    closeFeaturedDealModal() {
        document.getElementById('featured-deal-modal').style.display = 'none';
    }

    async editFeaturedDeal(dealId) {
        const deal = this.featuredDeals.find(d => d.id === dealId);
        if (!deal) return;

        const newTitle = prompt('Enter new title:', deal.title);
        const newDescription = prompt('Enter new description:', deal.description);
        const newImageUrl = prompt('Enter new image URL:', deal.imageUrl);
        const newAffiliateUrl = prompt('Enter new affiliate URL:', deal.affiliateUrl);
        const newPrice = parseFloat(prompt('Enter new price:', deal.price));
        const newOriginalPrice = parseFloat(prompt('Enter new original price:', deal.originalPrice));
        const newDiscount = parseInt(prompt('Enter new discount percentage:', deal.discount));
        const newCategory = prompt('Enter new category:', deal.category);
        const newRetailer = prompt('Enter new retailer:', deal.retailer);
        const newDisplayOrder = parseInt(prompt('Enter new display order:', deal.displayOrder));

        if (!newTitle || !newAffiliateUrl) {
            alert('Title and affiliate URL are required');
            return;
        }

        const updateData = {
            title: newTitle,
            description: newDescription,
            imageUrl: newImageUrl,
            affiliateUrl: newAffiliateUrl,
            price: newPrice,
            originalPrice: newOriginalPrice,
            discount: newDiscount,
            category: newCategory,
            retailer: newRetailer,
            displayOrder: newDisplayOrder
        };

        try {
            const response = await fetch(`/api/admin/featured-deals/${dealId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update featured deal');
            }

            this.showSuccess('Featured deal updated successfully');
            this.loadFeaturedDeals();
        } catch (error) {
            console.error('Error updating featured deal:', error);
            this.showError('Failed to update featured deal');
        }
    }

    async deleteFeaturedDeal(dealId) {
        if (!confirm('Are you sure you want to delete this featured deal?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/featured-deals/${dealId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete featured deal');
            }

            this.showSuccess('Featured deal deleted successfully');
            this.loadFeaturedDeals();
        } catch (error) {
            console.error('Error deleting featured deal:', error);
            this.showError('Failed to delete featured deal');
        }
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
