# Pheno Hunter - Cannabis Plant Tracker

A React-based single page application for tracking cannabis plants from seed to harvest, featuring the friendly Billy Bong mascot.

## 🌱 Features

- **Plant Registration**: Add plants from seeds or clones
- **Growth Tracking**: Maintain detailed diary entries and photos
- **Clone Management**: Create clones from mother plants with generation tracking
- **Harvest Records**: Log harvest details including weight and potency
- **Demo Data**: Built-in sample plants to explore features
- **Billy Bong Mascot**: Friendly guide throughout the app

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Opens at http://localhost:5173

### Build for Production
```bash
npm run build
```

## 🎯 How to Use

1. **Login/Signup**: Create an account or login (demo authentication)
2. **Dashboard**: View statistics and navigate to key features
3. **Add Plants**: Register new plants from the dashboard or navigation
4. **Manage Collection**: View, edit, and track your plants
5. **Clone & Harvest**: Use the detail view to clone plants or log harvests
6. **Demo Data**: Load sample plants to explore features

## 💾 Data Storage

- All data is stored locally in the browser's localStorage
- Images are stored as base64 data strings
- Data persists between sessions
- Use demo data controls to reset or clear data

## 🎨 Theme

Patriotic color scheme featuring:
- Navy Blue (#1e3a8a) - Primary
- Crimson Red (#dc2626) - Accents
- White (#ffffff) - Backgrounds
- Light Gray (#f3f4f6) - Neutral

## 🧪 Demo Features

The app includes comprehensive demo data featuring:
- Multiple plant varieties (Blue Dream, OG Kush, White Widow)
- Different growth stages and statuses
- Mother plants with clones showing generational tracking
- Harvest records with detailed statistics
- Realistic diary entries showing typical growing journey

## 📱 Mobile Support

Fully responsive design optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Touch interactions

## 🛠 Technical Stack

- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router 6
- **State**: React Hooks & Context
- **Storage**: localStorage
- **Build**: Vite bundler

## 📂 Project Structure

```
src/
├── components/
│   ├── auth/          # Login/signup forms
│   ├── plants/        # Plant management
│   └── Dashboard.jsx  # Main dashboard
├── hooks/             # Custom React hooks
├── utils/             # Utilities and data management
└── assets/            # Images and static files
```

## 🐛 Known Limitations

- localStorage has browser storage limits (~5-10MB)
- Base64 images increase storage usage
- No real backend authentication
- Data is browser-specific (not synced across devices)

## 🔮 Future Enhancements

- Real backend integration
- User accounts and data sync
- Advanced analytics and reporting
- Calendar integration
- Export/import functionality
- Push notifications for watering/feeding schedules

## 📄 License

This is a demo application for educational/portfolio purposes.

---

*Featuring Billy Bong, your friendly cannabis cultivation companion!* 🌿
