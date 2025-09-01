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

        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal();
        });

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

        document.getElementById('test-scraper').addEventListener('click', () => {
            this.testScraper();
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
            const productsResponse = await fetch('/api/sponsored-products');
            const productsData = await productsResponse.json();
            this.products = productsData.products || [];

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
                this.loadProductsTable();
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

    loadProductsTable() {
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';

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
                    <button class="action-btn delete-btn" onclick="adminDashboard.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
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

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.loadProductsTable();
            this.updateDashboardStats();
            this.loadRevenueData();
            this.showNotification('Product deleted successfully!', 'success');
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

    async loadAutomationStatus() {
        try {
            const response = await fetch('/api/weekly-automation/status');
            const result = await response.json();
            
            if (result.success) {
                const status = result.status;
                const statusElement = document.getElementById('automation-status');
                
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
                        <i class="fas fa-clock"></i>
                        <span>Last Send: ${status.lastCampaign ? new Date(status.lastCampaign).toLocaleDateString() : 'Never'}</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Status: ${status.status}</span>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading automation status:', error);
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
            syncStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Comparing user lists...';

            // Get our database users
            const dbResponse = await fetch('/api/admin/users');
            const dbData = await dbResponse.json();
            
            // Get Mailchimp users
            const mailchimpResponse = await fetch('/api/mailchimp/users');
            const mailchimpData = await mailchimpResponse.json();

            // Update comparison cards
            document.getElementById('db-user-count').textContent = dbData.users ? dbData.users.length : 0;
            document.getElementById('mailchimp-user-count').textContent = mailchimpData.totalSubscribers || 0;
            
            const discrepancy = Math.abs((dbData.users ? dbData.users.length : 0) - (mailchimpData.totalSubscribers || 0));
            document.getElementById('discrepancy-count').textContent = discrepancy;

            // Update sync status
            if (discrepancy === 0) {
                syncStatus.className = 'sync-status success';
                syncStatus.innerHTML = '<i class="fas fa-check-circle"></i> User lists are in sync!';
            } else if (discrepancy < 5) {
                syncStatus.className = 'sync-status warning';
                syncStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Minor discrepancy: ${discrepancy} users differ`;
            } else {
                syncStatus.className = 'sync-status error';
                syncStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Significant discrepancy: ${discrepancy} users differ`;
            }

            this.showNotification('Mailchimp sync completed', 'success');
            
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
}

// Initialize admin dashboard when page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
