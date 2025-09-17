# 🚀 Deployment Checklist

## Pre-Deployment Checks

### ✅ Version Validation
- [ ] Run `curl http://localhost:3000/api/version-check` to verify correct files
- [ ] Check browser console for "✅ Version check passed" message
- [ ] Verify main page loads `styles-modern.css` and `script-modern.js`
- [ ] Test featured deals display correctly with card layout

### ✅ File Structure
- [ ] `public/index.html` should load modern files (NOT `index-old.html`)
- [ ] `public/index-old.html` exists as backup
- [ ] `public/version-check.js` is included in `index.html`
- [ ] No `public/index-modern.html` (should be renamed to `index.html`)

### ✅ Functionality Tests
- [ ] Main page displays featured deals with proper card styling
- [ ] Admin panel login works
- [ ] Featured deals can be added/edited in admin
- [ ] Analytics page displays correctly
- [ ] All API endpoints respond correctly

## Deployment Process

### 1. Local Testing
```bash
# Start development server
npm run dev

# Test version check
curl http://localhost:3000/api/version-check

# Test main page
open http://localhost:3000

# Test admin panel
open http://localhost:3000/admin.html
```

### 2. Deploy to Production
```bash
# Commit all changes
git add .
git commit -m "Your commit message"

# Push to production
git push origin main
```

### 3. Post-Deployment Verification
- [ ] Production site loads correctly
- [ ] Featured deals display with proper styling
- [ ] Admin panel accessible
- [ ] No console errors

## Emergency Rollback

If wrong version is deployed:

```bash
# Check current commit
git log --oneline -5

# Rollback to previous working commit
git reset --hard <previous-commit-hash>
git push origin main --force

# Verify rollback
curl https://your-production-url.com/api/version-check
```

## File Naming Convention

- `index.html` = **CURRENT/ACTIVE** version (modern)
- `index-old.html` = **BACKUP** version (legacy)
- `index-modern.html` = **NEVER** use this name (confusing)

## Common Issues & Solutions

### Issue: Main page shows old styling
**Solution**: Check that `index.html` loads `styles-modern.css` and `script-modern.js`

### Issue: Version check fails
**Solution**: Ensure `version-check.js` is included in `index.html`

### Issue: Wrong files being served
**Solution**: Verify file naming convention and server configuration

## Quick Commands

```bash
# Check version status
curl http://localhost:3000/api/version-check | jq

# Test main page
curl -s http://localhost:3000/ | grep -E "(script|styles).*\.(js|css)"

# Check git status
git status

# View recent commits
git log --oneline -5
```
