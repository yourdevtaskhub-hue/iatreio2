# 🚀 Manual Upload Guide - GitHub Repository

## ❌ Πρόβλημα: Push Timeout

Το push κολλάει λόγω του μεγέθους των αρχείων (191 MB). Το GitHub έχει timeout για μεγάλα uploads.

## ✅ Λύση: Manual Upload

### **Βήμα 1: Πήγαινε στο Repository**
- Άνοιξε: https://github.com/sio2000/webiatrio
- Κάνε κλικ στο **"Add file"** (πάνω δεξιά)
- Επέλεξε **"Upload files"**

### **Βήμα 2: Upload τα Αρχεία**
- **Drag & drop** όλο το project folder στο GitHub
- Ή **"choose your files"** και διάλεξε όλα τα αρχεία
- **Περίμενε** να ολοκληρωθεί το upload (μπορεί να πάρει 5-10 λεπτά)

### **Βήμα 3: Commit**
- **Commit message:** `Cross-platform compatible medical website with image orientation fixes and cache control`
- Κάνε κλικ στο **"Commit changes"**

## 📋 Τι Περιλαμβάνει το Project

✅ **Cross-platform compatibility fixes**  
✅ **Image orientation fixes για Mac Safari**  
✅ **Cache control configuration**  
✅ **Responsive design για όλες τις συσκευές**  
✅ **Font loading optimization**  
✅ **Meta tags για mobile compatibility**  
✅ **Deployment scripts και testing tools**

## 🎯 Επόμενα Βήματα

### **1. Set up Deployment:**
- **GitHub Pages:** Settings → Pages → Source: Deploy from a branch
- **Netlify:** Drag & drop το `dist` folder

### **2. Test:**
- Test σε incognito/private window
- Test σε διαφορετικές συσκευές
- Test image orientation (ειδικά Mac Safari)

## 💡 Alternative: Git LFS

Αν θέλεις να δοκιμάσεις Git LFS για μεγάλα αρχεία:

```bash
git lfs install
git lfs track "*.jpg" "*.png" "*.mp4"
git add .gitattributes
git commit -m "Add LFS tracking"
git push origin main
```

## 🚀 Το Project είναι 100% Έτοιμο!

Όλα τα technical issues έχουν διορθωθεί:
- ✅ Image orientation (Mac Safari)
- ✅ Cache control (πάντα φρέσκα περιεχόμενα)
- ✅ Cross-platform compatibility
- ✅ Responsive design
- ✅ Font loading optimization

**Απλά χρειάζεται manual upload λόγω του μεγέθους!** 🎉
