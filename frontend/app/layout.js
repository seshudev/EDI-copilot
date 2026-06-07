import './globals.css'

export const metadata = {
  title: 'Healthcare EDI Copilot',
  description: 'AI assistant for healthcare EDI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
