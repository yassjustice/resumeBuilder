import React from 'react';
import { motion } from 'framer-motion';

const TailoredCVPreview = ({ cv, jobOffer }) => {
  if (!cv) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No tailored CV data available for preview</p>
      </div>
    );
  }

  const renderSkills = (skills) => {
    if (!skills || typeof skills !== 'object') return null;
    
    return Object.entries(skills).map(([category, skillList]) => (
      <div key={category} className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">{category}</h4>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(skillList) ? skillList.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
            >
              {skill}
            </span>
          )) : null}
        </div>
      </div>
    ));
  };

  const renderExperience = (experience) => {
    if (!experience || !Array.isArray(experience)) return null;
    
    return experience.map((exp, index) => (
      <div key={index} className="mb-6 last:mb-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">
              {exp.position || exp.title}
            </h4>
            <p className="text-blue-600 font-medium">{exp.company}</p>
          </div>
          <div className="text-sm text-gray-600 text-right">
            <p>{exp.period || `${exp.startDate} - ${exp.endDate}`}</p>
            {exp.location && <p>{exp.location}</p>}
          </div>
        </div>
        
        {/* Enhanced achievements */}
        {exp.keyAchievements && exp.keyAchievements.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium text-gray-700 mb-1">Key Achievements:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {exp.keyAchievements.map((achievement, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Description */}
        {exp.description && (
          <div className="mb-3">
            <div className="text-sm text-gray-600">
              {exp.description.split('•').filter(item => item.trim()).map((item, i) => (
                <div key={i} className="flex items-start mb-1">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  {item.trim()}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Technologies used */}
        {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 mr-2">Technologies:</span>
            <div className="inline-flex flex-wrap gap-1">
              {exp.technologiesUsed.map((tech, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Relevance score indicator */}
        {exp.relevanceScore && (
          <div className="mt-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Job Relevance:</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${exp.relevanceScore}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 ml-2">{exp.relevanceScore}%</span>
            </div>
          </div>
        )}
      </div>
    ));
  };

  const renderProjects = (projects) => {
    if (!projects || !Array.isArray(projects)) return null;
    
    return projects.map((project, index) => (
      <div key={index} className="mb-6 last:mb-0">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900">{project.name}</h4>
          {project.relevanceScore && (
            <div className="flex items-center">
              <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${project.relevanceScore}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{project.relevanceScore}%</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{project.description}</p>
        
        {project.impact && (
          <div className="mb-3">
            <span className="text-sm font-medium text-green-700">Impact: </span>
            <span className="text-sm text-gray-600">{project.impact}</span>
          </div>
        )}
        
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 mr-2">Technologies:</span>
            <div className="inline-flex flex-wrap gap-1">
              {project.technologies.map((tech, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {project.keyFeatures && project.keyFeatures.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-500">Key Features:</span>
            <ul className="text-xs text-gray-600 mt-1 ml-4 list-disc">
              {project.keyFeatures.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      {/* Header with job targeting info */}
      {cv.metadata && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                Tailored for: {cv.metadata.tailoredFor}
              </h3>
              <p className="text-sm text-blue-700">
                Match Score: {cv.metadata.matchScore}% | 
                Tailored on: {new Date(cv.metadata.tailoredDate).toLocaleDateString()}
              </p>
            </div>
            {cv.metadata.optimizationSummary && (
              <div className="text-sm text-blue-700">
                <div className="flex flex-wrap gap-2">
                  {cv.metadata.optimizationSummary.titleChanged && (
                    <span className="px-2 py-1 bg-blue-100 rounded">Title Enhanced</span>
                  )}
                  {cv.metadata.optimizationSummary.experienceOptimized && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Experience Optimized</span>
                  )}
                  {cv.metadata.optimizationSummary.skillsReorganized && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Skills Reorganized</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Personal Information */}
        {cv.personalInfo && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cv.personalInfo.name}
            </h1>
            <h2 className="text-xl text-blue-600 font-semibold mb-4">
              {cv.personalInfo.title}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {cv.personalInfo.contact?.email && (
                <span>📧 {cv.personalInfo.contact.email}</span>
              )}
              {cv.personalInfo.contact?.phone && (
                <span>📞 {cv.personalInfo.contact.phone}</span>
              )}
              {cv.personalInfo.contact?.location && (
                <span>📍 {cv.personalInfo.contact.location}</span>
              )}
              {cv.personalInfo.contact?.linkedin && (
                <span>💼 LinkedIn</span>
              )}
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {cv.summary && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              Professional Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{cv.summary}</p>
          </div>
        )}

        {/* Skills */}
        {cv.skills && Object.keys(cv.skills).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Skills
            </h3>
            {renderSkills(cv.skills)}
          </div>
        )}

        {/* Experience */}
        {cv.experience && cv.experience.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Professional Experience
            </h3>
            {renderExperience(cv.experience)}
          </div>
        )}

        {/* Projects */}
        {cv.projects && cv.projects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Key Projects
            </h3>
            {renderProjects(cv.projects)}
          </div>
        )}

        {/* Education */}
        {cv.education && cv.education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Education
            </h3>
            {cv.education.map((edu, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-blue-600">{edu.institution}</p>
                    {edu.details && (
                      <p className="text-sm text-gray-600 mt-1">{edu.details}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{edu.period}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {cv.certifications && cv.certifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Certifications
            </h3>
            {cv.certifications.map((cert, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    <p className="text-blue-600">{cert.issuer}</p>
                    {cert.relevance && (
                      <p className="text-sm text-green-600 mt-1">
                        <span className="font-medium">Relevance:</span> {cert.relevance}
                      </p>
                    )}
                    {cert.skills && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Skills:</span> {cert.skills}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {cert.date && (
                      <p className="text-sm text-gray-600">{cert.date}</p>
                    )}
                    {cert.priority && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-1">Priority:</span>
                        <div className="w-8 h-1 bg-gray-200 rounded">
                          <div 
                            className="h-1 bg-orange-500 rounded"
                            style={{ width: `${cert.priority * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {cv.languages && cv.languages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Languages
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cv.languages.map((lang, index) => (
                <div key={index}>
                  <span className="font-medium text-gray-900">{lang.language}</span>
                  <span className="text-gray-600 ml-2">({lang.level})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TailoredCVPreview;
