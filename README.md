# 📱 QR Code URL Generator

A sleek, responsive, and high-performance **QR Code URL Generator** web application built with modern HTML, Vanilla CSS, and JavaScript.

![QR Code Generator Preview](https://img.shields.io/badge/QR_Code-Generator-6366f1?style=for-the-badge&logo=qr-code&logoColor=white)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

---

## ✨ Features

- 🔗 **Direct 1:1 URL Encoding**: Encodes the exact original URL string into the QR code. Zero intermediate redirects, no URL shortening, no tracking, and no external database needed.
- 🛡️ **Client-Side URL Validation**: Real-time checking ensuring valid `http://` / `https://` protocol and domain syntax. Displays clear inline error messages when input is invalid.
- 📥 **High-Resolution Downloads**:
  - **PNG Download**: Exports crisp `qr-code.png` at 512px, 1024px, or 2048px print quality.
  - **Vector SVG Export**: Scalable vector format for designers and print media.
- 📋 **Direct Clipboard Actions**:
  - Copy URL with animated confirmation toast.
  - Copy QR Code image directly to clipboard for pasting into Figma, Slack, Word, etc.
- 🎨 **Customization & Styles**:
  - Custom color themes (Slate Black, Royal Blue, Violet, Emerald, Ruby, and custom HEX picker).
  - Error correction level adjustment (Low 7%, Medium 15%, Quartile 25%, High 30%).
- 🔍 **Built-in Payload Verification**: Real-time on-device QR decoding using `jsQR` to visually verify 100% exact payload matching.
- 🌓 **Dark & Light Mode**: Seamless theme switcher with persistent user preference storage.
- 📱 **100% Responsive Design**: Optimized for mobile phones, tablets, and desktop displays.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sagargupta6259/QR_genarater.git
cd QR_genarater
```

2. Install dependencies:
```bash
npm install
```

3. Start local development server:
```bash
npm run dev
```

4. Open `http://localhost:5173` in your browser.

---

## 🛠️ Tech Stack

- **Core**: Vanilla HTML5, JavaScript (ES Modules)
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism, CSS Grid/Flexbox)
- **Libraries**:
  - `qrcode` (High precision QR matrix rendering)
  - `jsQR` (Client-side QR decoding & verification)
  - `canvas-confetti` (Celebration micro-interaction)
- **Build Tool**: Vite

---

## 🧪 Automated Tests

Run the automated validation & payload test suite:
```bash
node verify.test.js
```

---

## 📄 License

This project is licensed under the MIT License.
