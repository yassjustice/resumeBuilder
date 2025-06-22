# CV Builder App DNA

## 🎯 **Core Purpose**
AI-powered CV Builder that creates professional CVs and tailored job applications with downloadable PDFs.

## 🏗️ **Architecture**
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + MongoDB
- **AI**: Google Gemini 2.0 Flash (free tier)
- **PDF**: Puppeteer-based generation

## 🔧 **Key Features**
1. **CV Import**: Upload PDF/DOCX/TXT → AI extracts structured data
2. **CV Builder**: Step-by-step form (Personal → Experience → Education → Skills → Review)
3. **Job Targeting**: Paste job offer → AI tailors CV + generates cover letter
4. **PDF Download**: Clean, professional PDF output
5. **User Accounts**: Session-based auth with CV persistence

## 📊 **Data Flow**
```
File Upload → AI Extract → Form Edit → Save CV → Generate PDF
Job Offer → AI Tailor → Download Targeted CV + Cover Letter
```

## 🚀 **Current Status**
- ✅ Frontend: Complete React app with all pages and contexts
- ✅ Backend: Full API with CV CRUD, AI endpoints, PDF generation
- ✅ PDF: Puppeteer-based generation working (fixed multiple request issues)
- ✅ Auth: JWT-based authentication system
- 🔧 **Recent Fixes**: Job title extraction, skills categorization, duplicate request prevention

## 🎨 **UI/UX**
- Modern, clean design with smooth animations
- Mobile-responsive
- Step-by-step wizard interface
- Real-time validation and feedback

## 🔐 **Security**
- JWT tokens with expiration
- Input validation and sanitization
- CORS configuration
- Environment-based configuration

## 📱 **User Journey**
1. Register/Login → Dashboard
2. Upload CV OR build from scratch
3. Edit/refine CV data
4. Download professional PDF
5. Optional: Apply for jobs with tailored CV + cover letter

## 🛠️ **Tech Stack**
```
Frontend: React, Tailwind, Framer Motion, React Router, Axios
Backend: Express, MongoDB, Mongoose, JWT, Multer, Mammoth, PDF-Parse
AI: Google Gemini 2.0 Flash
PDF: Puppeteer with smart page breaks
```

## 🎯 **Value Proposition**
Transform any CV into a professional, ATS-friendly document with AI-powered job targeting capabilities.
