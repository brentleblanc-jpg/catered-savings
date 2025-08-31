// Global functions for sponsored products
async function loadSponsoredProducts() {
    console.log('🚀 loadSponsoredProducts() called');
    try {
        console.log('📡 Fetching sponsored products from API...');
        const response = await fetch('/api/sponsored-products');
        const data = await response.json();
        
        console.log('📦 API response:', data);
        
        if (data.success && data.products.length > 0) {
            console.log(`🎯 Found ${data.products.length} sponsored products, displaying them...`);
            displaySponsoredProducts(data.products);
        } else {
            console.log('⚠️ No sponsored products found or API error');
            console.log('Data success:', data.success);
            console.log('Products length:', data.products ? data.products.length : 'products is undefined');
        }
    } catch (error) {
        console.error('❌ Error loading sponsored products:', error);
    }
}

function displaySponsoredProducts(products) {
    console.log('🎨 displaySponsoredProducts() called with:', products);
    const container = document.getElementById('sponsoredProductsList');
    
    if (!container) {
        console.error('❌ Could not find sponsoredProductsList container!');
        console.log('Available elements with "sponsored" in ID:', document.querySelectorAll('[id*="sponsored"]'));
        return;
    }
    
    console.log('✅ Found container:', container);
    console.log('📝 Updating container HTML...');
    
    const htmlContent = products.map(product => {
        // Calculate discount percentage
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        console.log(`Processing product: ${product.title} - ${discount}% off`);
        
        return `
        <div class="sponsored-product" data-product-id="${product.id}">
            <div class="sponsored-badge">Sponsored</div>
            <img src="${product.imageUrl}" alt="${product.title}" class="product-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA2OEg5M1Y3NEg4N1Y2OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+IiU2OEg5M1Y3NEg4N1Y2OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'" />
            <div class="product-title">${product.title}</div>
            <div class="product-retailer">from Amazon</div>
            <div class="product-pricing">
                <span class="sale-price">$${product.price.toFixed(2)}</span>
                <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                <span class="discount-badge">${discount}% OFF</span>
            </div>
            <div class="product-description">${product.description}</div>
            <button class="sponsored-cta" onclick="handleSponsoredClick('${product.id}', '${product.affiliateUrl}')">
                <i class="fas fa-external-link-alt"></i> Shop Now
            </button>
        </div>
        `;
    }).join('');
    
    console.log('📄 Generated HTML length:', htmlContent.length);
    container.innerHTML = htmlContent;
    console.log('✅ Container updated with', products.length, 'products');
}

// Catered Savings Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('savingsForm');
    const successMessage = document.getElementById('successMessage');
    
    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🚀 Form submission event triggered!');
        
        if (!validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }
        console.log('✅ Form validation passed');
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Handle multiple category selections
            const categoryCheckboxes = form.querySelectorAll('input[name="categories"]:checked');
            data.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
            
            console.log('📤 Sending form data:', data);
            
            const response = await fetch('/api/submit-savings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Form submitted successfully!');
                console.log('📝 Hiding form, showing success message...');
                
                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                console.log('🔄 Loading sponsored products...');
                // Load sponsored products with a small delay to ensure DOM is ready
                setTimeout(() => {
                    loadSponsoredProducts();
                }, 100);
                
                // Reset form for potential reuse
                form.reset();
                
                console.log('🎉 Success page should now be visible!');
            } else {
                throw new Error(result.message || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your preferences. Please try again.');
            
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Real-time validation for email field
    const emailField = document.getElementById('email');
    emailField.addEventListener('blur', function() {
        if (this.value.trim() && !isValidEmail(this.value)) {
            highlightField(this, true);
            showFieldError(this, 'Please enter a valid email address');
        } else {
            highlightField(this, false);
            hideFieldError(this);
        }
    });
    
    // Category selection enhancement
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const categoryBox = this.closest('.category-checkbox');
            if (this.checked) {
                categoryBox.style.borderColor = '#667eea';
                categoryBox.style.background = '#f0f4ff';
            } else {
                categoryBox.style.borderColor = '#e5e7eb';
                categoryBox.style.background = '#ffffff';
            }
            updateSelectionCounter();
        });
    });
    
    // Initialize selection counter
    updateSelectionCounter();
});

// Reset Form Function
function resetForm() {
    const form = document.getElementById('savingsForm');
    const successMessage = document.getElementById('successMessage');
    
    // Reset the form
    form.reset();
    
    // Show the form and hide success message
    form.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Reset category styling
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    categoryCheckboxes.forEach(categoryBox => {
        categoryBox.style.borderColor = '#e5e7eb';
        categoryBox.style.background = '#ffffff';
    });
    
    // Reset selection counter
    updateSelectionCounter();
    
    // Scroll to top of form
    form.scrollIntoView({ behavior: 'smooth' });
}



// Validation Functions
function validateForm() {
    const form = document.getElementById('savingsForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            highlightField(field, true);
        } else {
            highlightField(field, false);
        }
        
        // Special validation for email
        if (field.type === 'email' && field.value.trim()) {
            if (!isValidEmail(field.value)) {
                isValid = false;
                highlightField(field, true);
                showFieldError(field, 'Please enter a valid email address');
            } else {
                hideFieldError(field);
            }
        }
    });
    
    // Check if at least one category is selected
    const selectedCategories = form.querySelectorAll('input[name="categories"]:checked');
    if (selectedCategories.length === 0) {
        isValid = false;
        showCategoryError();
    } else {
        hideCategoryError();
    }
    
    // Check terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        isValid = false;
        highlightField(agreeTerms, true);
        showFieldError(agreeTerms, 'Please agree to receive weekly deal emails');
    } else {
        highlightField(agreeTerms, false);
        hideFieldError(agreeTerms);
    }
    
    return isValid;
}

function highlightField(field, hasError) {
    if (hasError) {
        field.style.borderColor = '#e53e3e';
        field.style.backgroundColor = '#fed7d7';
    } else {
        field.style.borderColor = '#e2e8f0';
        field.style.backgroundColor = '#f8fafc';
    }
}

function showFieldError(field, message) {
    // Remove existing error message
    hideFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#e53e3e';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showCategoryError() {
    const categoriesSection = document.querySelector('.form-section');
    let existingError = categoriesSection.querySelector('.category-error');
    
    if (!existingError) {
        existingError = document.createElement('div');
        existingError.className = 'category-error';
        existingError.style.color = '#e53e3e';
        existingError.style.fontSize = '0.875rem';
        existingError.style.marginTop = '10px';
        existingError.style.textAlign = 'center';
        existingError.textContent = 'Please select at least one category';
        
        const categoriesGrid = categoriesSection.querySelector('.categories-grid');
        categoriesGrid.parentNode.insertBefore(existingError, categoriesGrid.nextSibling);
    }
}

function hideCategoryError() {
    const existingError = document.querySelector('.category-error');
    if (existingError) {
        existingError.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Selection Counter Function
function updateSelectionCounter() {
    const selectedCategories = document.querySelectorAll('input[name="categories"]:checked');
    const counter = document.getElementById('selectedCount');
    if (counter) {
        counter.textContent = selectedCategories.length;
    }
}



// Reset Form Function
function resetForm() {
    const form = document.getElementById('savingsForm');
    const successMessage = document.getElementById('successMessage');
    
    form.reset();
    form.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Clear any error highlighting
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        highlightField(field, false);
        hideFieldError(field);
    });
    
    // Reset category styling
    const categoryCheckboxes = form.querySelectorAll('.category-checkbox');
    categoryCheckboxes.forEach(box => {
        box.style.borderColor = '#e2e8f0';
        box.style.background = '#f8fafc';
    });
    
    // Clear category error
    hideCategoryError();
    
    // Reset selection counter
    updateSelectionCounter();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

    // Function to handle sponsored product clicks (tracking + redirect)
    window.handleSponsoredClick = async function(productId, url) {
        try {
            // Track the click
            await fetch('/api/track-sponsored-click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId })
            });
        } catch (error) {
            console.error('Error tracking sponsored click:', error);
        }
        
        // Redirect to product page
        window.open(url, '_blank');
    }

// Auto-submit on Enter key for email field
document.getElementById('email').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('savingsForm').dispatchEvent(new Event('submit'));
    }
});
