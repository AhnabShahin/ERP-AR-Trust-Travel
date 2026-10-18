# 🟣 Hostinger এ Deploy করার Guide — AR Trust Travel ERP

এই project টা একটা **static Vite + React** app (আলাদা কোনো backend/database লাগে না)।
তাই Hostinger এর সবচেয়ে সহজ উপায় = **shared web hosting (public_html) এ static files upload**।

তোমার জন্য ready করা ফাইল: **`hostinger-deploy.zip`** (project folder এ আছে, ~34 MB)।
এই zip এর ভেতরে `index.html`, `.htaccess`, `assets/` সব root এ আছে — তাই extract করলেই সরাসরি কাজ করবে।

---

## ✅ ধাপে ধাপে (সবচেয়ে সহজ উপায়)

1. **hPanel এ login করো** → https://hpanel.hostinger.com
2. উপরে **Websites** → তোমার domain এর পাশে **Manage** এ ক্লিক করো।
3. বাম পাশের মেনু থেকে **Files → File Manager** খোলো।
4. **`public_html`** ফোল্ডারে ঢোকো।
5. ভেতরে Hostinger এর default ফাইল (`default.php` বা `index.html`) থাকলে সেগুলো **delete** করো।
6. উপরে **Upload** আইকনে ক্লিক করে **`hostinger-deploy.zip`** আপলোড করো।
7. আপলোড শেষে zip ফাইলটায় **right-click → Extract** করো, destination `/public_html` (অর্থাৎ `.`) দাও।
8. Extract শেষ হলে `hostinger-deploy.zip` ফাইলটা **delete** করে দাও।
9. **হয়ে গেছে!** এখন তোমার domain এ ঢুকলেই site live দেখবে।
   - SPA routing (`/dashboard`, `/login` ইত্যাদি) `.htaccess` দিয়ে automatic কাজ করবে।
   - Gzip compression + 1 বছরের browser cache ও auto চালু।

---

## ⚠️ গুরুত্বপূর্ণ কথা

- **Domain এর root এ রাখতে হবে।** Asset path গুলো `/assets/...` দিয়ে শুরু, তাই অবশ্যই `public_html` এর root এ (মানে `yourdomain.com/`) বসাতে হবে — কোনো subfolder (`yourdomain.com/app/`) এ দিলে CSS/JS লোড হবে না।
- **SSL (https):** hPanel → Security → SSL থেকে free SSL চালু করে নিও।
- **`.htaccess` দেখা না গেলে:** File Manager এর Settings এ **"Show hidden files"** on করে দাও, তাহলে dot-file গুলো দেখবে।

---

## 🔁 ভবিষ্যতে code পরিবর্তন করলে আবার deploy

```bash
npm run build
```

তারপর নতুন করে zip বানাও (অথবা শুধু `dist/` ফোল্ডারের ভেতরের সব কিছু File Manager এ টেনে public_html এ upload করে পুরোনোগুলো replace করো)।

---

## 🟢 বিকল্প: Hostinger এর "Node.js App" feature দিয়ে (optional)

তোমার plan এ যদি **Node.js hosting** থাকে, তাহলে static এর বদলে express server দিয়েও চালাতে পারো:

- **Startup file:** `server.js`
- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Node version:** 20+

তবে এই simple site এর জন্য **static (public_html) উপায়টাই recommended** — দ্রুত, সস্তা, আর কম ঝামেলার।

---

## 📝 পারফরম্যান্স টিপ (optional)

কিছু গাড়ির ছবি অনেক বড় (যেমন `mercedes-v-class.jpg` ~9.6 MB)। চাইলে ছবিগুলো আগে compress/resize করে নিলে site আরও দ্রুত লোড হবে। এটা বাধ্যতামূলক নয়, এখন deploy করলেও চলবে।
