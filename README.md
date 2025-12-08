# 🐌 Snail Face

A modern system insights dashboard for viewing host data collected by [snail-core](https://github.com/sluggisty/snail-core) and served by [snail-shell](https://github.com/sluggisty/snail-shell).

![Snail Face Dashboard](./docs/screenshot.png)

## Features

- **Dashboard Overview**: Quick stats on hosts, reports, and system health
- **Host Management**: View all reporting systems and their status
- **Report Viewer**: Detailed system information viewer with drill-down
- **Real-time Updates**: Auto-refresh with React Query
- **Beautiful UI**: Dark theme with snail-inspired amber and lime accents

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **TanStack Query** - Server state management
- **Recharts** - Charts and graphs
- **Lucide Icons** - Icon library
- **CSS Modules** - Scoped styling

## Quick Start

### Prerequisites

- Node.js 18+
- snail-shell running on `localhost:8080`

### Installation

```bash
# Clone the repository
git clone https://github.com/sluggisty/snail-face.git
cd snail-face

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run preview
```

## Configuration

### API Proxy

The development server proxies `/api` requests to `http://localhost:8080` (snail-shell). Edit `vite.config.ts` to change the target:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-snail-shell-server:8080',
      changeOrigin: true,
    },
  },
}
```

### Environment Variables

For production builds, set these environment variables:

```bash
VITE_API_URL=https://your-api-server.com
```

## Project Structure

```
snail-face/
├── public/
│   └── snail.svg           # App icon
├── src/
│   ├── api/
│   │   └── client.ts       # API client
│   ├── components/
│   │   ├── Layout.tsx      # App layout
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── Header.tsx      # Page header
│   │   ├── Card.tsx        # Card components
│   │   └── Table.tsx       # Table component
│   ├── pages/
│   │   ├── Dashboard.tsx   # Dashboard page
│   │   ├── Hosts.tsx       # Hosts list
│   │   ├── HostDetail.tsx  # Host details
│   │   ├── Reports.tsx     # Reports list
│   │   └── ReportDetail.tsx # Report details
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── App.tsx             # Routes
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Screenshots

### Dashboard
Overview of system health, recent reports, and active hosts.

### Host Details
Detailed view of a specific host with report history.

### Report Viewer
Full system report with OS, hardware, network, packages, and security info.

## Design Philosophy

Snail Face uses a dark theme with:
- **Shell Gold/Amber** (`#f59e0b`) - Primary accent color
- **Body Lime/Green** (`#84cc16`) - Secondary/success color
- **Deep Blue/Gray** backgrounds for comfortable viewing

Typography uses:
- **Outfit** - Clean, modern headings and body text
- **JetBrains Mono** - Code and data values

## Related Projects

- [snail-core](https://github.com/sluggisty/snail-core) - Python data collection agent
- [snail-shell](https://github.com/sluggisty/snail-shell) - Go backend API server
- [docs](https://github.com/sluggisty/docs) - Project documentation

## License

Apache License 2.0

