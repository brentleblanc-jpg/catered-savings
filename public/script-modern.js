// Modern JavaScript for HubSpot-inspired design
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Modern script loaded');
    
    // Initialize form handling
    initializeForm();
    
    // Load sponsored products
    loadSponsoredProducts();
    
    // Initialize category selection
    initializeCategorySelection();
    
    // Initialize logo click handler
    initializeLogoClick();
});

// Form handling
function initializeForm() {
    const form = document.getElementById('savingsForm');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) {
        console.error('❌ Form not found');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Form submitted');
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            const data = {
                email: formData.get('email'),
                firstName: formData.get('firstName'),
                categories: formData.getAll('categories'),
                exclusiveDeals: formData.get('exclusiveDeals') === 'true'
            };
            
            console.log('📤 Sending data:', data);
            
            const response = await fetch('/api/submit-savings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('📥 Response:', result);
            
            if (result.success) {
                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Load sponsored products after successful submission
                setTimeout(() => {
                    loadSponsoredProducts();
                }, 100);
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.message || 'Submission failed');
            }
            
        } catch (error) {
            console.error('❌ Form submission error:', error);
            console.error('❌ Error details:', error.message);
            console.error('❌ Error stack:', error.stack);
            alert(`Sorry, there was an error: ${error.message}. Please try again.`);
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Category selection with visual feedback
function initializeCategorySelection() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            
            // Toggle visual state
            if (checkbox.checked) {
                this.classList.add('selected');
            } else {
                this.classList.remove('selected');
            }
        });
    });
}

// Logo click handler - refresh home page
function initializeLogoClick() {
    const logo = document.querySelector('.logo');
    
    if (logo) {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🏠 Logo clicked - refreshing home page');
            
            // Reload the current page to refresh everything
            window.location.reload();
        });
        
        // Add cursor pointer to indicate it's clickable
        logo.style.cursor = 'pointer';
    }
}

// Load sponsored products
async function loadSponsoredProducts() {
    console.log('🚀 Loading sponsored products...');
    
    try {
        const response = await fetch('/api/sponsored-products');
        const data = await response.json();
        
        console.log('📦 API response:', data);
        
        if (data.success && data.products.length > 0) {
            displaySponsoredProducts(data.products);
        } else {
            console.log('⚠️ No sponsored products found');
            displayFallbackProducts();
        }
    } catch (error) {
        console.error('❌ Error loading sponsored products:', error);
        displayFallbackProducts();
    }
}

// Display sponsored products with modern design
function displaySponsoredProducts(products) {
    const container = document.getElementById('sponsoredProductsList');
    
    if (!container) {
        console.error('❌ Container not found');
        return;
    }
    
    const htmlContent = products.map(product => {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        
        return `
            <div class="sponsored-card">
                <img src="${product.imageUrl}" alt="${product.title}" class="sponsored-image" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA2OEg5M1Y3NEg4N1Y2OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'" />
                <div class="sponsored-content">
                    <h3 class="sponsored-name">${product.title}</h3>
                    <div class="sponsored-price">$${product.price.toFixed(2)}</div>
                    <div class="sponsored-original-price">$${product.originalPrice.toFixed(2)}</div>
                    <div class="sponsored-discount">${discount}% OFF</div>
                    <a href="${product.url}" target="_blank" class="sponsored-link">
                        Shop Now <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = htmlContent;
    console.log(`✅ Displayed ${products.length} sponsored products`);
}

// Fallback products if API fails
function displayFallbackProducts() {
    const container = document.getElementById('sponsoredProductsList');
    
    if (!container) return;
    
    const fallbackProducts = [
        {
            title: "Samsung 65\" QLED 4K TV",
            price: 1299.99,
            originalPrice: 1599.99,
            imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
            url: "https://amazon.com/samsung-qled-tv"
        },
        {
            title: "KitchenAid Stand Mixer",
            price: 279.99,
            originalPrice: 379.99,
            imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
            url: "https://amazon.com/kitchenaid-mixer"
        },
        {
            title: "Sony WH-1000XM4 Headphones",
            price: 249.99,
            originalPrice: 349.99,
            imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
            url: "https://amazon.com/sony-wh1000xm4"
        },
        {
            title: "Apple MacBook Air M2",
            price: 999.99,
            originalPrice: 1199.99,
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
            url: "https://amazon.com/macbook-air-m2"
        }
    ];
    
    displaySponsoredProducts(fallbackProducts);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.email || !formData.email.includes('@')) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.firstName || formData.firstName.trim().length < 2) {
        errors.push('Please enter your first name');
    }
    
    if (!formData.categories || formData.categories.length === 0) {
        errors.push('Please select at least one category');
    }
    
    return errors;
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.sponsored-card, .category-card, .form-container');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
