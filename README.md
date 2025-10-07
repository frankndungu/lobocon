# Lobocon

> Construction Project Management System designed for the East African market

Lobocon is a comprehensive, multi-tenant SaaS platform that streamlines construction project management from estimation through completion. Built specifically for construction companies in Kenya and East Africa, it handles BOQ (Bill of Quantities) management, real-time labor tracking, expense monitoring, and critical path scheduling.

## Core Features

### BOQ Management

- **KSMM Clause Library**: Pre-loaded with 336 Kenya Standard Method of Measurement clauses
- **Automated BOQ Generation**: Build BOQs using standard clauses or custom items
- **Version Control**: Track BOQ revisions (A, B, C) for bid iterations
- **Bid Tracking**: Monitor submission status (Draft → Submitted → Accepted/Rejected)
- **Client Communication**: Send BOQs directly to clients with follow-up tracking
- **Export Options**: PDF and Excel exports with company branding

### Project Management

- **Multi-View Projects**: Table, thumbnail, and map-based project views
- **Location-Based**: GPS coordinates for geospatial project tracking
- **BOQ to Project Conversion**: One-click conversion when bids are accepted
- **Real-Time Progress**: Track completion percentage across all work packages

### Work Breakdown Structure (WBS)

- **Hierarchical Organization**: Multi-level work package breakdown
- **BOQ Integration**: Seamlessly map BOQ items to WBS packages
- **Cost Tracking**: Budget vs actual cost analysis per package
- **Man-Days Estimation**: Days-based labor planning (not hours)

### Labor Tracking

- **Daily Attendance**: Simple check-in system for Kenyan construction context
- **Worker Type Management**: Masons, carpenters, laborers, steel fixers, etc.
- **Standard Rates Library**: User-configurable productivity rates
- **Duration Auto-Calculation**: System calculates task duration based on:
  - Work quantity from BOQ
  - Worker count assigned
  - Standard productivity rates

### Expense Tracking

- **Customizable Categories**: Materials, labor, equipment, transport, permits, overhead
- **Receipt Management**: Upload receipts to AWS S3
- **Budget vs Actual**: Real-time comparison against BOQ baseline
- **Approval Workflows**: Pending → Approved → Rejected flow

### Task Management & Critical Path

- **Three Views**: Kanban, Table, Gantt chart
- **Auto-Scheduling**: CPM (Critical Path Method) calculations
- **Dependency Tracking**: Predecessor/successor relationships with lag time
- **Float Analysis**: Total float and free float calculations
- **Days-Based Duration**: Aligned with East African construction practices

## Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **UI Design**: Tailwind CSS + shadcn/ui
- **State Management**: React Query
- **Prototyping**: v0.app for rapid iteration

### Backend

- **Framework**: NestJS (TypeScript)
- **Architecture**: Modular monolith
- **API**: RESTful + GraphQL

### Database & Storage

- **Database**: PostgreSQL 15+
- **ORM**: TypeOrm 5.x
- **File Storage**: AWS S3
- **CDN**: CloudFront
- **Caching**: Redis

### Infrastructure

- **Hosting**: OVH VPS (European data centers)
- **CDN/Security**: Cloudflare
- **Email**: Brevo (transactional emails)
- **Payments**: Paystack (African payment gateway)

### Monitoring & Analytics

- **Product Analytics**: PostHog
- **Error Tracking**: Sentry
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 15+
- Redis 7+
- AWS account (for S3)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lobocon.git
cd lobocon

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
cd ../backend
npx prisma migrate dev
npx prisma db seed  # Seeds KSMM clauses

# Start development servers
npm run start:dev  # Backend (port 3000)
cd ../frontend
npm run dev        # Frontend (port 3001)
```
