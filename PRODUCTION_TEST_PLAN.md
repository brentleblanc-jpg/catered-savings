# Production End-to-End Test Plan

## 🎯 Test Overview
This document outlines the comprehensive end-to-end testing for the Catered Savers production deployment.

## 🔗 Production URLs
- **Main Site**: `https://catered-savings-production.up.railway.app/`
- **Admin Dashboard**: `https://catered-savings-production.up.railway.app/admin.html`
- **Deals Page**: `https://catered-savings-production.up.railway.app/deals/{token}`

## 📋 Test Scenarios

### 1. **Main Site Functionality**
- [ ] **Homepage Loads**: Verify main site loads with proper styling
- [ ] **Form Submission**: Test user signup form with categories
- [ ] **Token Generation**: Verify access token is returned after signup
- [ ] **Navigation**: Test all navigation links work

### 2. **Admin Dashboard**
- [ ] **Admin Access**: Verify admin page loads with proper styling
- [ ] **Product Management**: 
  - [ ] Add products via CSV upload
  - [ ] View products in table
  - [ ] Delete products
  - [ ] Clear all products
- [ ] **User Management**: View registered users
- [ ] **Data Persistence**: Verify changes persist across page refreshes

### 3. **Personalized Deals Page**
- [ ] **Page Load**: Verify deals page loads with new styling
- [ ] **Product Display**: 
  - [ ] Product images display correctly
  - [ ] Prices show with strikethrough original prices
  - [ ] Discount badges appear
  - [ ] "Shop Now" buttons are visible and functional
- [ ] **Styling**: 
  - [ ] Center alignment works
  - [ ] Professional card design
  - [ ] Orange accent colors
  - [ ] Responsive layout
- [ ] **Affiliate Links**: Verify "Shop Now" buttons link to correct Amazon URLs

### 4. **Database Integration**
- [ ] **User Storage**: Verify users are stored in PostgreSQL
- [ ] **Product Storage**: Verify products are stored in PostgreSQL
- [ ] **Token Authentication**: Verify personalized deals work with valid tokens
- [ ] **Data Consistency**: Verify admin changes reflect on deals page

### 5. **Error Handling**
- [ ] **Invalid Token**: Test deals page with invalid/expired token
- [ ] **No Products**: Test deals page when no products exist
- [ ] **API Errors**: Test error states and user feedback

## 🧪 Test Data

### Test User
- **Email**: `test-prod@example.com`
- **Name**: `Production Test User`
- **Categories**: `tech-electronics, home-garden`

### Test Product
```json
{
  "title": "Test Product for Production",
  "description": "This is a test product for production testing",
  "imageUrl": "https://via.placeholder.com/300x200?text=Test+Product",
  "affiliateUrl": "https://amzn.to/test123",
  "price": 29.99,
  "originalPrice": 59.99,
  "category": "tech-electronics"
}
```

## 🔍 Testing Steps

### Step 1: Main Site Test
1. Navigate to production URL
2. Fill out signup form with test data
3. Submit form and capture access token
4. Verify success message and token generation

### Step 2: Admin Dashboard Test
1. Navigate to admin dashboard
2. Clear all existing products
3. Add test product via CSV upload
4. Verify product appears in table
5. Test delete functionality
6. View registered users

### Step 3: Deals Page Test
1. Navigate to deals page using captured token
2. Verify page loads with new styling
3. Check product display and functionality
4. Test "Shop Now" button
5. Verify responsive design

### Step 4: Data Persistence Test
1. Refresh admin page - verify products still there
2. Refresh deals page - verify products still there
3. Add/remove products and verify changes

## ✅ Success Criteria
- [ ] All pages load without errors
- [ ] Styling is consistent and professional
- [ ] All functionality works as expected
- [ ] Data persists across sessions
- [ ] Affiliate links work correctly
- [ ] Mobile responsiveness works

## 🐛 Known Issues to Watch
- CSS caching issues (should be resolved with standalone page)
- Token authentication errors (should be resolved with recent fixes)
- Admin page styling differences (should be resolved with recent updates)

## 📝 Test Results
*Results will be filled in during testing*

### Test Date: ___________
### Tester: ___________
### Overall Status: ___________

### Issues Found:
1. 
2. 
3. 

### Resolutions:
1. 
2. 
3. 
