# 🚀 Οδηγίες Deployment και Cache Clearing

## Προβλήματα που λύθηκαν

### 1. **Image Orientation Issue (Mac/iOS)**
Η φωτογραφία της Δρ. Φύτρου εμφανιζόταν γυρισμένη στα Mac λόγω EXIF metadata.

**Λύση:** Προστέθηκε CSS στο `src/index.css`:
```css
img {
  image-orientation: from-image;
  -webkit-transform: none;
  transform: none;
}
```

### 2. **Cache Issues**
Οι χρήστες έβλεπαν παλιές εκδόσεις της ιστοσελίδας.

**Λύση:** Προστέθηκαν cache-control headers στο `netlify.toml`:
- HTML files: `max-age=0, must-revalidate` (πάντα φρέσκια έκδοση)
- Assets (JS/CSS/images): `max-age=31536000, immutable` (1 χρόνο cache με hash filenames)

---

## 📋 Βήματα για Deployment

### 1. **Build το project τοπικά**
```bash
npm run build
```

### 2. **Commit τις αλλαγές**
```bash
git add .
git commit -m "Fix image orientation and cache issues"
git push origin main
```

### 3. **Deploy στο Netlify**
Αν έχεις συνδέσει το GitHub με Netlify, το deployment θα γίνει αυτόματα.

Αν όχι:
```bash
# Εγκατάσταση Netlify CLI (μια φορά)
npm install -g netlify-cli

# Login στο Netlify
netlify login

# Deploy
netlify deploy --prod
```

---

## 🧹 Πώς να καθαρίσει ο φίλος σου το Cache (Mac)

### Safari (Mac):
1. **Option 1 - Hard Refresh:**
   - Πάτα `Cmd + Option + R` στη σελίδα
   - Ή πάτα `Cmd + R` κρατώντας πατημένο το `Shift`

2. **Option 2 - Clear Cache:**
   - Safari → Settings (Cmd + ,)
   - Advanced tab → "Show Develop menu in menu bar"
   - Develop → Empty Caches
   - Refresh τη σελίδα (Cmd + R)

3. **Option 3 - Private Window:**
   - Άνοιξε νέο Private Window (Cmd + Shift + N)
   - Πήγαινε στην ιστοσελίδα

### Chrome (Mac):
1. **Hard Refresh:**
   - Πάτα `Cmd + Shift + R`
   
2. **Clear Cache:**
   - Chrome → Clear Browsing Data (Cmd + Shift + Delete)
   - Επέλεξε "Cached images and files"
   - Click "Clear data"

### Firefox (Mac):
1. **Hard Refresh:**
   - Πάτα `Cmd + Shift + R`
   
2. **Clear Cache:**
   - Firefox → Preferences → Privacy & Security
   - Cookies and Site Data → "Clear Data"
   - Επέλεξε μόνο "Cached Web Content"

---

## 🔍 Πώς να ελέγξεις αν έχει τις τελευταίες αλλαγές

### 1. **Check το Build Date:**
Άνοιξε Developer Tools (F12 ή Cmd + Option + I) και στο Console γράψε:
```javascript
console.log(document.lastModified);
```

### 2. **Check τα CSS filenames:**
View Source (Cmd + Option + U) και δες αν τα filenames των CSS/JS έχουν διαφορετικά hashes:
```html
<link rel="stylesheet" href="/assets/index-CSnUusDG.css">
```

### 3. **Network Tab:**
- Developer Tools → Network tab
- Reload τη σελίδα
- Κοίτα στη στήλη "Size" - αν λέει "(disk cache)" ή "(memory cache)", κάνε hard refresh

---

## ⚠️ Σημαντικά

### Για μελλοντικές αλλαγές:

1. **Πάντα κάνε build πριν το push:**
   ```bash
   npm run build
   git add .
   git commit -m "Your message"
   git push
   ```

2. **Verify το deployment:**
   - Περίμενε 1-2 λεπτά μετά το push
   - Πήγαινε στο Netlify Dashboard και δες το deploy status
   - Κάνε hard refresh στην production URL

3. **Πες στους χρήστες:**
   Αν κάνεις σημαντικές αλλαγές, στείλε μήνυμα στους χρήστες να κάνουν hard refresh (Cmd + Shift + R)

---

## 🛠️ Αντιμετώπιση Προβλημάτων

### Το πρόβλημα εξακολουθεί να υπάρχει;

1. **Έλεγξε το Netlify Dashboard:**
   - Πήγαινε στο Netlify Dashboard
   - Κοίτα το "Production deploys"
   - Βεβαιώσου ότι το τελευταίο deploy είναι "Published"

2. **Purge το Netlify Cache:**
   ```bash
   netlify deploy --prod --force
   ```

3. **Έλεγξε τα Headers:**
   Στο Developer Tools → Network tab, κάνε κλικ σε ένα αρχείο και δες τα Response Headers:
   ```
   cache-control: public, max-age=0, must-revalidate
   ```

4. **CDN Cache:**
   Μερικές φορές το CDN κρατάει παλιά αρχεία. Το Netlify έχει instant cache invalidation, αλλά αν το πρόβλημα εξακολουθεί:
   - Netlify Dashboard → Site settings → Build & deploy → Post processing → Asset optimization
   - Disable/Enable ξανά το "Asset optimization"

---

## 📱 Mobile Browsers (iOS/Android)

Για iPhone/iPad:
- Settings → Safari → Clear History and Website Data

Για Android Chrome:
- Chrome → Settings → Privacy → Clear browsing data → Cached images and files

---

## ✅ Checklist

Πριν πεις ότι τελείωσες:

- [ ] Κάνε `npm run build` τοπικά
- [ ] Commit και push στο GitHub
- [ ] Verify deployment στο Netlify Dashboard
- [ ] Test σε ιδιωτικό/incognito window
- [ ] Test σε διαφορετικό browser
- [ ] Στείλε μήνυμα στους χρήστες για hard refresh αν χρειάζεται

---

## 🎯 Επόμενα Βήματα

Για να αποφύγεις παρόμοια προβλήματα στο μέλλον:

1. **Βελτιστοποίηση της μεγάλης εικόνας (11.6 MB):**
   ```bash
   # Compress την εικόνα profile.png
   # Χρησιμοποίησε online tool όπως tinypng.com ή squoosh.app
   # Target size: κάτω από 500 KB
   ```

2. **Automated deployment testing:**
   - Πρόσθεσε smoke tests που τρέχουν μετά το deployment
   - Έλεγξε ότι όλα τα sections φορτώνουν σωστά

3. **Version display:**
   Πρόσθεσε ένα version number στο footer για εύκολο debugging:
   ```javascript
   const BUILD_VERSION = "1.0.2"; // Update manually κάθε φορά
   ```

