# ResumeBuilder Project DNA

## Overview
ResumeBuilder is a full-stack application for creating, managing, and enhancing CVs and cover letters. It leverages AI for content generation, translation, and document enhancement. The project is organized into backend and frontend components, each with modular architecture and clear separation of concerns.

---

## Backend
- **Language:** Node.js (JavaScript)
- **Entry Point:** `backend/server.js`
- **Main Features:**
  - CV and Cover Letter generation, editing, and validation
  - AI-powered content generation and translation
  - PDF generation and smart page break handling
  - User authentication and theme management
  - Modular service and route structure
- **Key Directories:**
  - `controllers/`: Handles business logic for CVs, themes, etc.
  - `models/`: Mongoose models for CV, Theme, User
  - `routes/`: API endpoints for CV, AI, Auth, Theme, Language, etc.
  - `services/`: Core logic for PDF, AI, translation, layout, etc.
  - `middleware/`: Error handling, validation, performance
  - `config/`: Database configuration
  - `uploads/`: File uploads
  - `utils/`: Utility functions (date, seeding, validation)
  - `backups/`: Backup files for critical services/routes
- **AI Integration:**
  - `services/ai/`: AI service manager, cover letter, CV validation, translation, tailoring
  - Modular fallback and enhancement strategies
- **PDF & HTML Generation:**
  - `services/pdf/`, `services/html/`: Precise PDF and HTML generation, page break logic
- **Theme System:**
  - `models/Theme.js`, `services/themes/`, `routes/themeRoutes.js`

---

## Frontend
- **Language:** JavaScript (React)
- **Main Features:**
  - CV builder UI with AI-powered suggestions
  - Auth, language, layout, skills, and tailored CV components
  - Context-based state management (`contexts/`)
  - Utility and service layers for API communication
  - Tailwind CSS for styling (`tailwind.config.js`)
- **Key Directories:**
  - `src/components/`: Modular UI components (AI, Auth, CV, Debug, Language, Layout, Skills, TailoredCV, UI)
  - `src/contexts/`: React context providers for Auth and CV
  - `src/hooks/`: Custom React hooks
  - `src/pages/`: Page-level components
  - `src/services/`: Frontend service logic
  - `src/utils/`: Utility functions
  - `public/`: Static assets and manifest

---

## Data & Models
- **CV Model:** Personal info, education, experience, skills, languages, etc.
- **Theme Model:** Customizable themes for CV appearance
- **User Model:** Authentication and user data

---

## AI & Enhancement
- **AI Providers:** Modular support for multiple AI providers
- **Content Generation:** Automated CV and cover letter writing
- **Translation:** Multilingual support for CVs and cover letters
- **Validation:** Authenticity and quality checks for generated content

---

## PDF & HTML Output
- **PDF Generation:** Smart page breaks, translations, precise formatting
- **HTML Generation:** For preview and web display

---

## Utilities & Middleware
- **Error Handling:** Centralized error middleware
- **Validation:** Input and data validation
- **Performance:** Middleware for request optimization
- **Seeding:** Database seeding for development/testing

---

## Modular Architecture
- **Separation of Concerns:** Clear split between controllers, services, models, routes, and utilities
- **Extensibility:** Easy to add new AI providers, themes, or document types
- **Backup & Refactoring:** Backup files and modular refactoring summaries for maintainability

---

## Documentation
- **Docs:** Analysis, improvement guides, theme system, PDF preview documentation

---

## Summary
ResumeBuilder is a robust, modular, and extensible platform for CV and cover letter creation, leveraging AI for content generation, translation, and document enhancement. The codebase is organized for maintainability, scalability, and ease of integration with new features and providers.
