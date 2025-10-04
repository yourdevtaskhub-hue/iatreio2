# 🚀 Οδηγίες Deployment για Netlify

## ✅ Προετοιμασία για Deployment

### 1. Εγκατάσταση Dependencies
```bash
npm install
```

### 2. Build Test (Τοπικά)
```bash
npm run build
```

### 3. Preview Build
```bash
npm run preview
```

## 🌐 Netlify Deployment

### Αυτόματο Deployment (GitHub)
1. Συνδέστε το repository με το Netlify
2. Οι αλλαγές θα κάνουν auto-deploy

### Manual Deployment
1. Κάντε `npm run build`
2. Ανεβάστε το `dist/` folder στο Netlify

## ⚙️ Netlify Settings

### Build Settings:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18`

### Environment Variables (αν χρειάζονται):
- Δεν χρειάζονται για αυτό το project

## 🔧 Troubleshooting

### Αν το build αποτύχει:
1. Ελέγξτε ότι όλα τα dependencies είναι εγκατεστημένα
2. Ελέγξτε ότι δεν υπάρχουν TypeScript errors
3. Ελέγξτε ότι το `@supabase/supabase-js` είναι στο package.json

### Αν το Supabase δεν λειτουργεί:
- Το app θα λειτουργεί αλλά χωρίς database functionality
- Οι κριτικές θα εμφανίζονται από mock data
- Το Admin Panel θα λειτουργεί αλλά δεν θα αποθηκεύει δεδομένα

## 📁 Αρχεία που χρειάζονται:

### Υποχρεωτικά:
- `package.json` ✅
- `vite.config.ts` ✅
- `netlify.toml` ✅
- `src/` folder ✅
- `public/` folder ✅

### Προαιρετικά:
- `README.md`
- `DEPLOYMENT.md`
- `.gitignore` ✅

## 🎯 URLs μετά το Deployment:

- **Homepage**: `https://your-site.netlify.app/`
- **Admin Panel**: `https://your-site.netlify.app/admin`

## 📝 Σημειώσεις:

- Το app είναι πλήρως responsive
- Υποστηρίζει SPA routing
- Όλα τα assets είναι optimized
- Το build είναι production-ready
