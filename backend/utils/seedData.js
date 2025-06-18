/**
 * English CV Seed Data
 * Based on existing cvData.js
 */

const cvData = {
    personalInfo: {
      name: "YASSIR HAKIMI",
      title: "Full Stack Developer & IT Technician",
      contact: {
        phone: "+212605616855",
        email: "yassirhakimi60@gmail.com",
        location: "Av Med Hassar, Sala Al Jadida, Morocco",
        linkedin: "linkedin.com/in/yassir-hakimi-543678217",
        github: "github.com/yassjustice",
        portfolio:"yassir-hakimi.vercel.app"
      }
    },
    
    summary: "Versatile Full Stack Developer and IT Technician with experience in web and mobile application development using MERN stack, React Native, and ASP.NET. Currently providing freelance digital solutions to small businesses while actively seeking full-time opportunities to apply technical expertise in a collaborative team environment. Proficient in cloud services including AWS and Azure, UI/UX design, and end-to-end development processes. Complementary background in graphic design and business digitalization strategies.",
    
    skills: {
      frontend: ["React.js", "React Native", "HTML5", "CSS3", "JavaScript", "Electron.js"],
      backend: ["Node.js", "Express.js", "ASP.NET", "C#"],
      databases: ["MongoDB", "SQL Server"],
      cloud: ["AWS", "Azure"],
      tools: ["Git", "Visual Studio", "Bootstrap", "Figma"],
      other: ["Hadoop", "HiveQL", "MFA Security", "Technical Support"]
    },
    
    experience: [
      {
        title: "Full Stack Developer & Digital Solutions Consultant",
        company: "Freelance",
        period: "November 2024 - Present",
        responsibilities: [
          "Developing custom business catalogues and digitalization solutions for small businesses across diverse industries",
          "Creating responsive landing pages and web applications tailored to specific business requirements and target markets",
          "Implementing comprehensive design-to-development workflows, handling UI/UX design, frontend, and backend development independently",
          "Collaborating with 3+ coding startups as development partner to expand technical expertise and industry knowledge",
          "Researching market opportunities and developing strategic business plans for potential auto-entrepreneur or enterprise status within 6-month timeline"
        ]
      },
      {
        title: "IT Technician",
        company: "École Marocaine des Sciences de l'Ingénieur",
        period: "March 2024 - October 2024",
        responsibilities: [
          "Contributed to internal development of school platforms and innovative educational projects",
          "Provided technical support and troubleshooting for Azure cloud services, including user management, password resets, and MFA security",
          "Managed online meetings via Microsoft Teams and handled calendar planning for staff",
          "Assisted with data and educational application migration projects",
          "Gained hands-on experience with Hadoop and HiveQL environments"
        ]
      },
      {
        title: "React Developer",
        company: "CloudLink (Startup)",
        period: "January 2024 - March 2024",
        responsibilities: [
          "Received training on Amazon Web Services (AWS) cloud infrastructure",
          "Integrated APIs and data utilization in a React Native mobile application with AWS backend",
          "Converted Figma designs into responsive React web applications",
          "Transformed web applications into desktop applications using Electron.js"
        ]
      },
      {
        title: "Full Stack Developer",
        company: "ARK-X Talent Solutions",
        period: "July 2023 - January 2024",
        responsibilities: [
          "Completed an accelerated learning bootcamp focused on MERN technology stack (MongoDB, Express.js, React.js, Node.js)",
          "Developed technical and soft skills for professional interviews and industry events",
          "Created portfolio projects and competitive solutions to real-world problems",
          "Collaborated with peers on full-stack application development"
        ]
      },
      {
        title: "Web Developer (Intern)",
        company: "National Center for Road Studies and Research (CNER)",
        period: "March 2022 - May 2022",
        responsibilities: [
          "Collaborated on developing a solution for managing office equipment and supplies",
          "Utilized ASP.NET for front-end and main development components",
          "Gained valuable experience in real-world application development and teamwork",
          "Deepened knowledge in ASP.NET, JavaScript, HTML, CSS, C#, SQL Server, Visual Studio, and Bootstrap"
        ]
      },
      {
        title: "Freelance Illustrator and Graphic Designer",
        company: "Self-employed",
        period: "2020 - Present",
        responsibilities: [
          "Design and sell custom clothing and accessories on online platforms",
          "Create and market hand-drawn and digital illustrations",
          "Develop brand identities and logos for small businesses",
          "Apply design skills to enhance web and mobile application UIs"
        ]
      }
    ],

    // NEW PROJECTS SECTION
    projects: [
      {
        name: "VersatilesUI - React Component Library",
        description: "Handcrafted, visually stunning React component library with full light/dark mode support and multilingual capabilities (English, French, Arabic) including RTL support",
        technologies: ["React", "CSS3", "JavaScript", "Vite", "i18n"],
        keyFeatures: [
          "Full internationalization with RTL support for Arabic",
          "Theme system with light/dark mode and artistic design elements",
          "Comprehensive debugging system for development",
          "Scalable component architecture with fallback systems"
        ]
      },
      {
        name: "ClaudFolio - Personal Portfolio",
        description: "Modern, responsive portfolio website featuring dynamic project showcase, smooth animations, and theme toggle functionality",
        technologies: ["React", "React Router", "Framer Motion", "CSS Modules", "Vite"],
        keyFeatures: [
          "Responsive design with dark/light mode toggle",
          "Interactive project filtering and detailed project pages",
          "Smooth animations and page transitions",
          "Contact form with validation and accessibility features"
        ]
      },
      {
        name: "Trading Mobile App",
        description: "Comprehensive React Native trading application with real-time market data, portfolio management, and trading capabilities",
        technologies: ["React Native", "Redux", "REST APIs", "Chart Libraries", "Expo"],
        keyFeatures: [
          "Real-time market data integration and live stock prices",
          "Portfolio tracking with performance metrics and analytics",
          "Interactive charts and technical indicators",
          "Cross-platform compatibility for iOS and Android"
        ]
      },
      {
        name: "Task Management Application",
        description: "Feature-rich task management system with multiple view modes, project organization, and team collaboration capabilities",
        technologies: ["React", "Vite", "TailwindCSS", "IndexedDB", "Framer Motion"],
        keyFeatures: [
          "Multiple views: List, Kanban Board, and Timeline calendar",
          "Drag-and-drop task organization with priority management",
          "Project analytics and team member management",
          "Local data persistence and responsive design"
        ]
      },
      {
        name: "Moroccan Handmade E-Commerce",
        description: "Full-stack MERN e-commerce platform showcasing traditional Moroccan products with admin dashboard and secure authentication",
        technologies: ["MongoDB", "Express.js", "React", "Node.js", "Vite"],
        keyFeatures: [
          "MVC architecture with Controllers, Services, and Repositories",
          "Admin dashboard for product and order management",
          "Secure authentication with data sanitization middleware",
          "Responsive design promoting Moroccan culture globally"
        ]
      }
    ],
    
    education: [
      {
        degree: "Specialized Technician in Computer Development",
        institution: "Specialized Institute of Applied Technology (ISTA)",
        period: "September 2020 - July 2022",
        details: "Comprehensive training in software development, database management, web technologies, and project management methodologies"
      },
      {
        degree: "Physics and Chemistry (First Year)",
        institution: "Faculty of Sciences of Rabat - Mohammed V University",
        period: "September 2019 - July 2020",
        details: "Strong foundation in analytical thinking, problem-solving, and scientific methodology applicable to software development"
      },
      {
        degree: "Baccalaureate in Physics",
        institution: "Lycée Hassan II, Sala Al Jadida",
        period: "2018",
        details: "Mathematical and logical reasoning skills with focus on physics principles and analytical problem-solving"
      }
    ],
    
    certifications: [
      // Codecademy Professional Certifications
      {
        name: "Full-Stack Engineer Career Path",
        issuer: "Codecademy",
        type: "Professional Certificate",
        skills: "Complete web development lifecycle, front-end and back-end technologies"
      },
      {
        name: "Learn JavaScript Course",
        issuer: "Codecademy",
        type: "Course Certificate",
        skills: "JavaScript fundamentals, ES6+, DOM manipulation"
      },
      {
        name: "Learn JavaScript: Best Practices",
        issuer: "Codecademy",
        type: "Course Certificate",
        skills: "Code optimization, debugging, performance best practices"
      },
      {
        name: "Learn Intermediate JavaScript",
        issuer: "Codecademy",
        type: "Course Certificate",
        skills: "Advanced JavaScript concepts, asynchronous programming, modules"
      },
      {
        name: "Learn Node.js Course",
        issuer: "Codecademy",
        type: "Course Certificate",
        skills: "Server-side JavaScript, npm, backend development"
      },
      {
        name: "Learn MongoDB Course",
        issuer: "Codecademy",
        type: "Course Certificate",
        skills: "NoSQL database management, CRUD operations, data modeling"
      },
      {
        name: "Learn Express.js Course",
        issuer: "Codecademy",
        type: "Course Certificate",
        skills: "Web application framework, RESTful APIs, middleware"
      },
      {
        name: "Learn React Course",
        issuer: "Codecademy",
        type: "Course Certificate",
        skills: "Component-based development, state management, React ecosystem"
      },
      // ARK-X Talent Solutions Certifications
      {
        name: "Full-Stack JS MERN Bootcamp",
        issuer: "ARK-X Talent Solutions",
        type: "Bootcamp Certification",
        skills: "MongoDB, Express.js, React.js, Node.js full-stack development"
      },
      {
        name: "Prep Week - MERN Stack",
        issuer: "ARK-X Talent Solutions",
        type: "Preparatory Program",
        skills: "Development environment setup, fundamental concepts preparation"
      },
      {
        name: "LevelUP Professional Development",
        issuer: "ARK-X Talent Solutions",
        type: "Professional Certificate",
        skills: "Industry best practices, professional skills, career development"
      }
    ],
    
    additionalExperience: [
      {
        organization: "Club Robotic FSR - Université Mohammed V",
        period: "September 2019 - July 2020",
        details: "Gained practical experience with Arduino, C programming, and Robotics"
      }
    ],
      languages: [
      { language: "Arabic", level: "Native" },
      { language: "French", level: "Professional" },
      { language: "English", level: "Professional" }
    ],
    
    interests: ["Website Creation", "AI Model Training", "Drawing and Illustration", "UI/UX Design"]
  };
  
  module.exports = cvData;