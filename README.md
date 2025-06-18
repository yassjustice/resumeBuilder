# CV Builder Full Stack Application

A comprehensive CV building application with a React frontend and Node.js backend, enabling users to create, edit, and preview professional CVs with real-time PDF generation.

## Features

- **Intuitive CV Editor**: Section-based editor for managing all CV content
- **Real-time PDF Preview**: Instantly see how your CV will look
- **Theme System**: Choose from Professional, Modern, and Minimal themes
- **Multi-language Support**: English and French language options
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Auto-save**: Never lose your work with automatic saving
- **Smart PDF Generation**: Advanced page break control for professional results

## Theme System

The application features a comprehensive theme system with three built-in themes:

### Professional Theme
- **Primary Color**: `#2c3e50` (Deep Blue-Gray)
- **Typography**: Georgia serif for authority and tradition
- **Border Style**: Solid lines with conservative spacing
- **Use Case**: Corporate environments, traditional industries

### Modern Theme
- **Primary Color**: `#3498db` (Bright Blue)
- **Typography**: Roboto for clean, contemporary feel
- **Visual Elements**: Accent lines and progressive design elements
- **Use Case**: Tech companies, startups, creative roles

### Minimal Theme
- **Primary Color**: `#333333` (Charcoal)
- **Typography**: Open Sans for maximum readability
- **Border Style**: Subtle gray lines with generous whitespace
- **Use Case**: Design-focused roles, minimalist preferences

## Project Structure

- **Frontend**: React with styled-components and React Router
- **Backend**: Node.js with Express and MongoDB
- **PDF Generation**: Custom HTML/CSS to PDF conversion with smart layout

## Getting Started

### Prerequisites
- Node.js 14+ and npm
- MongoDB 4.4+

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/cv-builder-fullstack.git
cd cv-builder-fullstack
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with:
```
MONGODB_URI=mongodb://localhost:27017/cv-builder
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Seed the database with initial data
```bash
cd backend
npm run seed-themes
```

5. Start the application
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm start
```

## API Endpoints

### CV Endpoints
- `GET /api/cvs` - Get all CVs
- `POST /api/cvs` - Create a new CV
- `GET /api/cvs/:id` - Get a specific CV
- `PUT /api/cvs/:id` - Update a CV
- `DELETE /api/cvs/:id` - Delete a CV
- `GET /api/cvs/:id/pdf-precise` - Generate PDF
- `POST /api/cvs/:id/pdf-precise` - Generate PDF with options
- `PATCH /api/cvs/:id/theme` - Update CV theme

### Theme Endpoints
- `GET /api/themes` - Get all available themes
- `GET /api/themes/:id` - Get a specific theme

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- PDF generation uses enhanced smart page break algorithm
- Responsive design inspired by modern UI/UX practices