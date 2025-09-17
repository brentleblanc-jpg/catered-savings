# Local Development Workflow

## 🚀 Quick Start

### Start Development Server
```bash
npm run dev
```
- Server runs on: http://localhost:3000
- Admin panel: http://localhost:3000/admin.html
- Health check: http://localhost:3000/health

### Stop Development Server
```bash
Ctrl+C
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:watch` | Start with auto-restart on file changes |
| `npm run deploy` | Deploy changes to production |
| `npm start` | Start production server (for testing) |

## 📁 File Structure

### Key Files for Development
- `dev-server.js` - Local development server
- `server-production.js` - Production server
- `public/` - Frontend files (HTML, CSS, JS)
- `services/` - Backend services
- `prisma/` - Database schema and migrations

### Frontend Files
- `public/index-modern.html` - Main landing page
- `public/script-modern.js` - Frontend JavaScript
- `public/styles-modern.css` - Frontend styles
- `public/admin.html` - Admin panel
- `public/admin.js` - Admin panel JavaScript

## 🎯 Development Workflow

### 1. Make Changes Locally
- Edit files in `public/` for frontend changes
- Edit `dev-server.js` for backend changes
- Test changes at http://localhost:3000

### 2. Test Features
- **Main site**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin.html
- **API endpoints**: http://localhost:3000/api/featured-deals

### 3. Deploy to Production
When ready to deploy:
```bash
npm run deploy
```
Or manually:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## 🔑 Admin Access

- **URL**: http://localhost:3000/admin.html
- **Password**: `admin123` (set in `.env` file)

## 📊 Environment Variables

Create a `.env` file with:
```
DATABASE_URL=your_database_url
ADMIN_PASSWORD=admin123
MAILCHIMP_API_KEY=your_mailchimp_key (optional)
MAILCHIMP_SERVER_PREFIX=your_server_prefix (optional)
```

## 🐛 Debugging

### Check Server Status
```bash
curl http://localhost:3000/health
```

### Check API Endpoints
```bash
# Featured deals
curl http://localhost:3000/api/featured-deals

# Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

### View Logs
The development server shows detailed logs in the terminal.

## 🚀 Production Deployment

1. **Test locally** with `npm run dev`
2. **Commit changes** with `git add . && git commit -m "Description"`
3. **Deploy** with `git push origin main`
4. **Verify** at https://cateredsavers.com

## 💡 Tips

- Always test changes locally before deploying
- Use the admin panel to manage featured deals
- Check the browser console for frontend errors
- Monitor server logs for backend issues
- Use `Ctrl+C` to stop the development server
