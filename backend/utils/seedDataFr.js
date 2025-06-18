/**
 * French CV Seed Data
 * Based on existing cvDataFr.js
 */

const cvData = {
    personalInfo: {
      name: "YASSIR HAKIMI",
      title: "Développeur Full Stack & Technicien Informatique",
      contact: {
        phone: "+212605616855",
        email: "yassirhakimi60@gmail.com",
        location: "Av Med Hassar, Sala Al Jadida, Maroc",
        linkedin: "linkedin.com/in/yassir-hakimi-543678217",
        github: "github.com/yassjustice",
        portfolio: "yassir-hakimi.vercel.app"
      }
    },
    
    summary: "Développeur Full Stack polyvalent et Technicien Informatique avec expérience en développement d'applications web et mobiles utilisant le stack MERN, React Native et ASP.NET. Fournit actuellement des solutions digitales freelance aux petites entreprises tout en recherchant activement des opportunités à temps plein pour appliquer l'expertise technique dans un environnement d'équipe collaboratif. Maîtrise des services cloud AWS et Azure, UI/UX design, et processus de développement end-to-end. Expérience complémentaire en design graphique et stratégies de digitalisation d'entreprises.",
    
    skills: {
      frontend: ["React.js", "React Native", "HTML5", "CSS3", "JavaScript", "Electron.js"],
      backend: ["Node.js", "Express.js", "ASP.NET", "C#"],
      databases: ["MongoDB", "SQL Server"],
      cloud: ["AWS", "Azure"],
      tools: ["Git", "Visual Studio", "Bootstrap", "Figma"],
      other: ["Hadoop", "HiveQL", "Sécurité MFA", "Support Technique"]
    },
    
    experience: [
      {
        title: "Développeur Full Stack & Consultant Solutions Digitales",
        company: "Freelance",
        period: "Novembre 2024 - Présent",
        responsibilities: [
          "Développement de catalogues d'entreprises personnalisés et solutions de digitalisation pour 8+ petites entreprises dans diverses industries",
          "Création de pages d'accueil responsives et applications web adaptées aux exigences spécifiques d'entreprise et marchés cibles",
          "Implémentation de workflows complets design-développement, gérant UI/UX design, frontend et backend de manière indépendante",
          "Collaboration avec 3+ startups de développement comme partenaire pour élargir l'expertise technique et connaissance du secteur",
          "Recherche d'opportunités de marché et développement de plans stratégiques pour statut auto-entrepreneur ou entreprise dans un délai de 6 mois"
        ]
      },
      {
        title: "Technicien Informatique",
        company: "École Marocaine des Sciences de l'Ingénieur",
        period: "Mars 2024 - Octobre 2024",
        responsibilities: [
          "Participation au développement interne des plateformes scolaires et de projets éducatifs innovants",
          "Assistance technique et dépannage des services cloud Azure, y compris la gestion des utilisateurs, la réinitialisation des mots de passe et la sécurité MFA",
          "Gestion des réunions en ligne via Microsoft Teams et planification du calendrier du personnel",
          "Aide à la migration des données et des applications éducatives",
          "Expérience pratique avec les environnements Hadoop et HiveQL"
        ]
      },
      {
        title: "Développeur React",
        company: "CloudLink (Startup)",
        period: "Janvier 2024 - Mars 2024",
        responsibilities: [
          "Formation sur l'infrastructure cloud d'Amazon Web Services (AWS)",
          "Intégration d'API et exploitation des données dans une application mobile React Native avec un backend AWS",
          "Conversion de maquettes Figma en applications web responsives avec React",
          "Transformation d'applications web en applications de bureau avec Electron.js"
        ]
      },
      {
        title: "Développeur Full Stack",
        company: "ARK-X Talent Solutions",
        period: "Juillet 2023 - Janvier 2024",
        responsibilities: [
          "Participation à un bootcamp intensif axé sur la technologie MERN (MongoDB, Express.js, React.js, Node.js)",
          "Développement de compétences techniques et interpersonnelles pour les entretiens professionnels et les événements du secteur",
          "Création de projets de portfolio et solutions compétitives à des problèmes réels",
          "Collaboration avec des pairs pour le développement d'applications full-stack"
        ]
      },
      {
        title: "Développeur Web (Stagiaire)",
        company: "Centre National d'Études et de Recherches Routières (CNER)",
        period: "Mars 2022 - Mai 2022",
        responsibilities: [
          "Collaboration sur le développement d'une solution de gestion des équipements et fournitures de bureau",
          "Utilisation d'ASP.NET pour le développement front-end et les composants principaux",
          "Expérience précieuse en développement d'applications réelles et en travail d'équipe",
          "Approfondissement des connaissances en ASP.NET, JavaScript, HTML, CSS, C#, SQL Server, Visual Studio et Bootstrap"
        ]
      },
      {
        title: "Illustrateur et Designer Graphique Freelance",
        company: "Indépendant",
        period: "2020 - Présent",
        responsibilities: [
          "Conception et vente de vêtements et accessoires personnalisés sur des plateformes en ligne",
          "Création et commercialisation d'illustrations dessinées à la main et numériques",
          "Développement d'identités visuelles et de logos pour petites entreprises",
          "Application des compétences en design pour améliorer les interfaces utilisateur des applications web et mobiles"
        ]
      }
    ],

    // NOUVELLE SECTION PROJETS
    projects: [
      {
        name: "VersatilesUI - Bibliothèque de Composants React",
        description: "Bibliothèque de composants React artisanale et visuellement époustouflante avec support complet mode clair/sombre et capacités multilingues (Anglais, Français, Arabe) incluant le support RTL",
        technologies: ["React", "CSS3", "JavaScript", "Vite", "i18n"],
        keyFeatures: [
          "Internationalisation complète avec support RTL pour l'arabe",
          "Système de thèmes avec mode clair/sombre et éléments de design artistiques",
          "Système de débogage complet pour le développement",
          "Architecture de composants évolutive avec systèmes de secours"
        ]
      },
      {
        name: "ClaudFolio - Portfolio Personnel",
        description: "Site web portfolio moderne et responsive avec vitrine de projets dynamique, animations fluides et fonctionnalité de basculement de thème",
        technologies: ["React", "React Router", "Framer Motion", "CSS Modules", "Vite"],
        keyFeatures: [
          "Design responsive avec basculement mode sombre/clair",
          "Filtrage interactif de projets et pages de projets détaillées",
          "Animations fluides et transitions de pages",
          "Formulaire de contact avec validation et fonctionnalités d'accessibilité"
        ]
      },
      {
        name: "Application Mobile de Trading",
        description: "Application de trading React Native complète avec données de marché en temps réel, gestion de portefeuille et capacités de trading",
        technologies: ["React Native", "Redux", "API REST", "Bibliothèques de Graphiques", "Expo"],
        keyFeatures: [
          "Intégration de données de marché en temps réel et prix d'actions en direct",
          "Suivi de portefeuille avec métriques de performance et analyses",
          "Graphiques interactifs et indicateurs techniques",
          "Compatibilité cross-platform pour iOS et Android"
        ]
      },
      {
        name: "Application de Gestion de Tâches",
        description: "Système de gestion de tâches riche en fonctionnalités avec modes de vue multiples, organisation de projets et capacités de collaboration d'équipe",
        technologies: ["React", "Vite", "TailwindCSS", "IndexedDB", "Framer Motion"],
        keyFeatures: [
          "Vues multiples : Liste, Tableau Kanban et Calendrier chronologique",
          "Organisation de tâches par glisser-déposer avec gestion des priorités",
          "Analyses de projets et gestion des membres d'équipe",
          "Persistance de données locale et design responsive"
        ]
      },
      {
        name: "E-Commerce Artisanat Marocain",
        description: "Plateforme e-commerce MERN full-stack présentant des produits marocains traditionnels avec tableau de bord administrateur et authentification sécurisée",
        technologies: ["MongoDB", "Express.js", "React", "Node.js", "Vite"],
        keyFeatures: [
          "Architecture MVC avec Contrôleurs, Services et Référentiels",
          "Tableau de bord administrateur pour la gestion des produits et commandes",
          "Authentification sécurisée avec middleware de désinfection des données",
          "Design responsive promouvant la culture marocaine mondialement"
        ]
      }
    ],
    
    education: [
      {
        degree: "Technicien Spécialisé en Développement Informatique",
        institution: "Institut Spécialisé de Technologie Appliquée (ISTA)",
        period: "Septembre 2020 - Juillet 2022",
        details: "Formation complète en développement logiciel, gestion de bases de données, technologies web et méthodologies de gestion de projet"
      },
      {
        degree: "Physique et Chimie (Première année)",
        institution: "Faculté des Sciences de Rabat - Université Mohammed V",
        period: "Septembre 2019 - Juillet 2020",
        details: "Base solide en pensée analytique, résolution de problèmes et méthodologie scientifique applicable au développement logiciel"
      },
      {
        degree: "Baccalauréat en Physique",
        institution: "Lycée Hassan II, Sala Al Jadida",
        period: "2018",
        details: "Compétences de raisonnement mathématique et logique avec focus sur les principes physiques et la résolution analytique de problèmes"
      }
    ],
    
    certifications: [
      // Certifications Professionnelles Codecademy
      {
        name: "Parcours Carrière Ingénieur Full-Stack",
        issuer: "Codecademy",
        type: "Certificat Professionnel",
        skills: "Cycle complet de développement web, technologies front-end et back-end"
      },
      {
        name: "Cours JavaScript",
        issuer: "Codecademy",
        type: "Certificat de Cours",
        skills: "Fondamentaux JavaScript, ES6+, manipulation DOM"
      },
      {
        name: "JavaScript : Meilleures Pratiques",
        issuer: "Codecademy",
        type: "Certificat de Cours",
        skills: "Optimisation de code, débogage, meilleures pratiques de performance"
      },
      {
        name: "JavaScript Intermédiaire",
        issuer: "Codecademy",
        type: "Certificat de Cours",
        skills: "Concepts JavaScript avancés, programmation asynchrone, modules"
      },
      {
        name: "Cours Node.js",
        issuer: "Codecademy",
        type: "Certificat de Cours",
        skills: "JavaScript côté serveur, npm, développement backend"
      },
      {
        name: "Cours MongoDB",
        issuer: "Codecademy",
        type: "Certificat de Cours",
        skills: "Gestion base de données NoSQL, opérations CRUD, modélisation de données"
      },
      {
        name: "Cours Express.js",
        issuer: "Codecademy",
        type: "Certificat de Cours",
        skills: "Framework d'applications web, APIs RESTful, middleware"
      },
      {
        name: "Cours React",
        issuer: "Codecademy",
        type: "Certificat de Cours",
        skills: "Développement par composants, gestion d'état, écosystème React"
      },
      // Certifications ARK-X Talent Solutions
      {
        name: "Bootcamp Full-Stack JS MERN",
        issuer: "ARK-X Talent Solutions",
        type: "Certification Bootcamp",
        skills: "Développement full-stack MongoDB, Express.js, React.js, Node.js"
      },
      {
        name: "Semaine Préparatoire - Stack MERN",
        issuer: "ARK-X Talent Solutions",
        type: "Programme Préparatoire",
        skills: "Configuration environnement de développement, préparation concepts fondamentaux"
      },
      {
        name: "Développement Professionnel LevelUP",
        issuer: "ARK-X Talent Solutions",
        type: "Certificat Professionnel",
        skills: "Meilleures pratiques industrie, compétences professionnelles, développement carrière"
      }
    ],
    
    additionalExperience: [
      {
        organization: "Club Robotique FSR - Université Mohammed V",
        period: "Septembre 2019 - Juillet 2020",
        details: "Expérience pratique avec Arduino, programmation en C et Robotique"
      }
    ],
    
    languages: [
      { language: "Arabe", level: "Langue maternelle" },
      { language: "Français", level: "Professionnel" },
      { language: "Anglais", level: "Professionnel" }
    ],
      interests: ["Création de sites web", "Entraînement de modèles d'IA", "Dessin et illustration", "UI/UX Design"]
  };
  
  module.exports = cvData;
