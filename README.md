
<div align="center">
  <img src="frontend/public/logo_banner.png" alt="KhojDu Logo" width="300" height="100" />
  
<span align="center" style="color: orange; font-size: 18px; font-weight: normal; font-family: 'Nothing You Could Do', cursive; margin: 0;">
  KhojDu
</span> (खोज्दु) – “Search for” in Nepali  

The name <span style="color: orange; font-weight: bold; font-family: 'Nothing You Could Do', cursive;">KhojDu</span> carries multiple shades of meaning in Nepali:  
- **Let me search (पस्चिमेली बोलिचालमा “खोज्दु”)** – casual phrasing in Western Nepali dialects.  
- **Khoj-D-U ?→ “Search for you?”** – a playful, conversational twist across English/Nepali.  
- **“खोजिदेउ”- Khoji-D-u → requesting someone to search** – like politely asking *“Please search for me.”*  

This flexibility makes the name approachable, friendly, and meaningful in both Nepali and English contexts.  

  
  <p align="center">
    <strong>🎯 Your Gateway to Perfect Rental Properties in Nepal</strong><br/>
    Connecting landlords and tenants through a modern, user-friendly platform
  </p>

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

  [🌐 Live Demo](https://khojdu.com) • [📖 Documentation](./docs/) • [🐛 Report Bug](https://github.com/mesubash/KhojDu/issues) • [💡 Request Feature](https://github.com/mesubash/KhojDu/issues)

</div>

---

## 🌟 **What is <span style="color: orange; font-weight: bold; font-family: 'Nothing You Could Do', cursive;">KhojDu ?</span>**

<span style="color: orange; font-weight: bold; font-family: 'Nothing You Could Do', cursive;">KhojDu</span> is Nepal's premier rental property platform designed to solve the housing search challenges in Kathmandu Valley and beyond. Our platform bridges the gap between property owners and seekers through:

- 🔍 **Smart Search**: Advanced filtering by location, budget, amenities, and preferences  
- ✅ **Verified Listings**: Authenticated properties and landlords for your safety  
- 💬 **Direct Communication**: Connect instantly with property owners via chat or WhatsApp  
- ⭐ **Community Reviews**: Real feedback from previous tenants  
- 📱 **Mobile-First Design**: Seamless experience across all devices  

---

## 🎯 **Key Features**

<table>
  <tr>
    <td width="50%">

### 👤 **For Tenants**
- 🏠 **Smart Property Search** - Find rooms, flats, and houses with advanced filters  
- 📍 **Location-Based Results** - Interactive maps with nearby amenities  
- 📱 **Instant Contact** - Direct messaging and WhatsApp integration  
- ⭐ **Reviews & Ratings** - Transparent feedback from previous tenants  
- 💖 **Wishlist Management** - Save and compare your favorite properties  
- 🔔 **Real-time Notifications** - Get alerted about new matching properties  

    </td>
    <td width="50%">

### 🏡 **For Landlords**
- 📝 **Easy Listing Creation** - Post properties with rich media support  
- 📊 **Performance Analytics** - Track views, inquiries, and occupancy rates  
- 💬 **Tenant Communication** - Manage all inquiries in one dashboard  
- ✅ **Verification System** - Build trust with verified landlord badges  
- 📈 **Revenue Optimization** - Pricing insights and market trends  
- 🛠️ **Property Management** - Edit, pause, or remove listings easily  

    </td>
  </tr>
</table>

### 🔧 **For Administrators**
- 🛡️ **Content Moderation** - Review and verify all listings  
- 👥 **User Management** - Handle landlord verification and user support  
- 📊 **Platform Analytics** - Monitor growth and user engagement  
- 🚫 **Spam Protection** - Advanced tools to detect and remove fake listings  

---

## 🛠️ **Technology Stack**

<div align="center">

### **Frontend Architecture**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Shadcn/ui** | Latest | Modern component library |
| **Framer Motion** | 10.x | Smooth animations |

### **Backend Architecture**  
| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.x | RESTful API development |
| **Spring Security** | 6.x | Authentication & authorization |
| **PostgreSQL** | 15+ | Primary database |
| **Redis** | 7.x | Caching & session management |
| **AWS S3** | - | File storage & CDN |

### **DevOps & Tools**
| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD Pipeline |
| **Vercel** | Frontend deployment |
| **AWS EC2** | Backend hosting |
| **CloudFlare** | CDN & Security |

</div>

---

## 🎨 **Design System**

<div align="center">

### **🎨 Color Palette**
```

🧡 Primary Orange:   #F97316 (Warm, welcoming)
🟡 Secondary Yellow: #F59E0B (Energetic accent)
🟢 Success Green:    #10B981 (Trust & verification)
🔵 Info Blue:        #3B82F6 (Professional tone)
⚫ Dark Slate:       #1E293B (Premium contrast)

```

### **✍️ Typography**
- **Brand Font**: "Nothing You Could Do" - Friendly, handwritten feel  
- **Subtitle Font**: "Delius" - Clean, approachable  
- **Body Font**: "Inter" - Maximum readability  

### **🎭 Visual Identity**
- **Logo Variants**: Circular icon + horizontal banner  
- **Style**: Modern, clean with warm personality  
- **Accessibility**: WCAG 2.1 AA compliant  

</div>

---

## 📂 **Project Architecture**

```

📁 KhojDu/
├── 🌐 app/                    # Next.js App Router pages
│   ├── 🏠 page.tsx           # Landing page
│   ├── 🔍 search/            # Property search
│   ├── 🏡 listing/\[id]/      # Property details
│   ├── 📱 dashboard/         # Landlord dashboard
│   ├── 👤 profile/           # User profiles
│   ├── 💬 messages/          # Chat system
│   └── 🔐 auth/              # Authentication
│       ├── login/
│       └── signup/
├── 🧩 components/             # Reusable UI components
│   ├── ui/                   # Shadcn components
│   ├── header.tsx            # Global navigation
│   ├── footer.tsx            # Site footer
│   └── logo.tsx              # Brand assets
├── 🎣 hooks/                  # Custom React hooks
├── 📚 lib/                    # Utilities & configurations
├── 🎨 public/                 # Static assets (images, icons)
└── 📄 README.md               # You are here!

````

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Node.js 18.x or higher  
- PostgreSQL 15+  
- Git  

### **1️⃣ Clone & Setup**
```bash
git clone https://github.com/mesubash/KhojDu.git
cd KhojDu

npm install
````

### **2️⃣ Environment Configuration**

```bash
cp .env.example .env.local
```

Fill values like:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/khojdu"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_MAPS_API_KEY="your-google-maps-key"
CLOUDINARY_URL="your-cloudinary-url"
```

### **3️⃣ Database Setup**

```bash
npx prisma migrate dev
npx prisma db seed
```

### **4️⃣ Launch Development Server**

```bash
npm run dev
```

---

## 🚧 **Roadmap**

* ✅ MVP: listings, search, auth
* 🚀 Phase 2: maps, analytics, push notifications
* 💳 Phase 3: payments, premium listings
* 🤖 Phase 4: AI-powered recommendations

---

## 📄 **License**

MIT License © 2024 <span style="color: orange; font-weight: bold; font-family: 'Nothing You Could Do', cursive;">KhojDu</span> Team

---

<div align="center">

**Made with ❤️ by Subash**

<span style="color: orange; font-weight: bold; fond-size: 10px;font-family: 'Nothing You Could Do', cursive;">KhojDu</span> - <span style="color: black; font-size: 11px; font-weight: bold; font-family: 'Delius';">FIND YOUR ROOF</span>

</div>


