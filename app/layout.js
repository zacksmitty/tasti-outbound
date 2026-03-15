export const metadata = {
  title: "Tasti Outbound Engine",
  description: "LinkedIn outbound sales engine for Tasti partnerships & affiliate programs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; width: 100%; }
          body { 
            background: #0f1419;
            color: #fff;
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            overflow: hidden;
          }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideIn { from { transform: translateX(-12px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          #__next { height: 100%; width: 100%; }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
