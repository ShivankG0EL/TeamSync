# Team Task Management

A modern task management application built with Next.js that helps teams organize and track their work efficiently.

## Features

- Task creation and management
- Team collaboration
- Real-time updates
- Project organization
- User authentication
- Responsive design

## Tech Stack

- [Next.js 14](https://nextjs.org)
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth.js

## Getting Started

1. Clone the repository:
```bash
git clone git@github.com:ShivankG0EL/TeamSync.git
cd team-task-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env
```
Fill in your environment variables in the `.env` file.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
├── app/
│   ├── api/        # API routes
│   ├── components/ # Reusable components
│   ├── lib/        # Utility functions
│   └── pages/      # Application pages
├── prisma/         # Database schema
└── public/         # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
