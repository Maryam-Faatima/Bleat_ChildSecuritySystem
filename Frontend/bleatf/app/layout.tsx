import './globals.css';
import Navbar from './components/Navbar'

export const metadata = {
  title: 'bleat - Child Security System',
  description: 'Track and protect your child’s safety',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS (CDN) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          integrity="sha384-9ndCyUa6mY5Y2v3Q8mK6k2Q5Y1QZl1f6a6r9BqQ1Z6j6v1G1bV6b8f6a7c9d8e0f"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 d-flex flex-column align-items-center" style={{ minHeight: '100vh' }}>
       
        <main className="w-100 d-flex justify-content-center" style={{ flex: 1, padding: '2rem 1rem' }}>
          <div className="w-100" style={{ maxWidth: 768 }}>{children}</div>
        </main>
      </body>
    </html>
  );
}
