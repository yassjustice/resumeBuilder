import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Textarea from '../UI/Textarea';
import { useTailoredCV } from '../../contexts/TailoredCVContext';

const TailoredCVEditor = ({ cv, onSave, onCancel }) => {
  const [editedCV, setEditedCV] = useState(cv || {});
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [hasChanges, setHasChanges] = useState(false);
  const { updateTailoredCVSection } = useTailoredCV();

  const sections = [
    { id: 'personalInfo', label: 'Personal Info', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'skills', label: 'Skills', icon: '🎯' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'certifications', label: 'Certifications', icon: '📜' },
    { id: 'languages', label: 'Languages', icon: '🌐' }
  ];

  const updateSection = (section, data) => {
    setEditedCV(prev => ({
      ...prev,
      [section]: data
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Update context with all changes
    Object.keys(editedCV).forEach(section => {
      if (editedCV[section] !== cv[section]) {
        updateTailoredCVSection(section, editedCV[section]);
      }
    });
    
    onSave && onSave(editedCV);
    setHasChanges(false);
  };

  const renderPersonalInfoEditor = () => (
    <div className="space-y-4">
      <Input
        label="Full Name"
        value={editedCV.personalInfo?.name || ''}
        onChange={(e) => updateSection('personalInfo', {
          ...editedCV.personalInfo,
          name: e.target.value
        })}
      />
      <Input
        label="Professional Title"
        value={editedCV.personalInfo?.title || ''}
        onChange={(e) => updateSection('personalInfo', {
          ...editedCV.personalInfo,
          title: e.target.value
        })}
        placeholder="e.g., Senior Software Developer"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={editedCV.personalInfo?.contact?.email || ''}
          onChange={(e) => updateSection('personalInfo', {
            ...editedCV.personalInfo,
            contact: {
              ...editedCV.personalInfo?.contact,
              email: e.target.value
            }
          })}
        />
        <Input
          label="Phone"
          value={editedCV.personalInfo?.contact?.phone || ''}
          onChange={(e) => updateSection('personalInfo', {
            ...editedCV.personalInfo,
            contact: {
              ...editedCV.personalInfo?.contact,
              phone: e.target.value
            }
          })}
        />
        <Input
          label="Location"
          value={editedCV.personalInfo?.contact?.location || ''}
          onChange={(e) => updateSection('personalInfo', {
            ...editedCV.personalInfo,
            contact: {
              ...editedCV.personalInfo?.contact,
              location: e.target.value
            }
          })}
        />
        <Input
          label="LinkedIn"
          value={editedCV.personalInfo?.contact?.linkedin || ''}
          onChange={(e) => updateSection('personalInfo', {
            ...editedCV.personalInfo,
            contact: {
              ...editedCV.personalInfo?.contact,
              linkedin: e.target.value
            }
          })}
        />
      </div>
    </div>
  );

  const renderSummaryEditor = () => (
    <div className="space-y-4">
      <Textarea
        label="Professional Summary"
        value={editedCV.summary || ''}
        onChange={(e) => updateSection('summary', e.target.value)}
        rows={6}
        placeholder="Write a compelling professional summary that highlights your key strengths and alignment with the target role..."
      />
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 AI Optimization Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Start with a powerful value proposition</li>
          <li>• Include specific years of relevant experience</li>
          <li>• Highlight 2-3 key achievements that match job requirements</li>
          <li>• Use keywords naturally from the job description</li>
          <li>• End with a forward-looking statement</li>
        </ul>
      </div>
    </div>
  );

  const renderSkillsEditor = () => {
    const skillCategories = editedCV.skills || {};
    
    const addSkillCategory = () => {
      const categoryName = prompt('Enter category name:');
      if (categoryName) {
        updateSection('skills', {
          ...skillCategories,
          [categoryName]: []
        });
      }
    };

    const updateSkillCategory = (category, skills) => {
      updateSection('skills', {
        ...skillCategories,
        [category]: skills
      });
    };

    const deleteSkillCategory = (category) => {
      const { [category]: removed, ...rest } = skillCategories;
      updateSection('skills', rest);
    };

    return (
      <div className="space-y-6">
        {Object.entries(skillCategories).map(([category, skills]) => (
          <div key={category} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">{category}</h4>
              <Button
                onClick={() => deleteSkillCategory(category)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
            <Textarea
              value={Array.isArray(skills) ? skills.join(', ') : ''}
              onChange={(e) => updateSkillCategory(category, e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              placeholder="Enter skills separated by commas..."
              rows={2}
            />
          </div>
        ))}
        
        <div className="text-center">
          <Button onClick={addSkillCategory} variant="outline">
            + Add Skill Category
          </Button>
        </div>
      </div>
    );
  };

  const renderExperienceEditor = () => {
    const experiences = editedCV.experience || [];
    
    const updateExperience = (index, field, value) => {
      const updated = [...experiences];
      updated[index] = { ...updated[index], [field]: value };
      updateSection('experience', updated);
    };

    const addExperience = () => {
      updateSection('experience', [...experiences, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        keyAchievements: [],
        technologiesUsed: [],
        relevanceScore: 75
      }]);
    };

    const deleteExperience = (index) => {
      updateSection('experience', experiences.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
              <div className="flex items-center space-x-2">
                {exp.relevanceScore && (
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Relevance:</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${exp.relevanceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{exp.relevanceScore}%</span>
                  </div>
                )}
                <Button
                  onClick={() => deleteExperience(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Job Title"
                value={exp.position || exp.title || ''}
                onChange={(e) => updateExperience(index, 'position', e.target.value)}
              />
              <Input
                label="Company"
                value={exp.company || ''}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
              />
              <Input
                label="Start Date"
                value={exp.startDate || ''}
                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
              />
              <Input
                label="End Date"
                value={exp.endDate || ''}
                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
              />
            </div>
            
            <Input
              label="Location"
              value={exp.location || ''}
              onChange={(e) => updateExperience(index, 'location', e.target.value)}
              className="mb-4"
            />
            
            <Textarea
              label="Job Description & Achievements"
              value={exp.description || ''}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              rows={6}
              placeholder="Describe your role, responsibilities, and key achievements. Use bullet points (•) to separate different points..."
              className="mb-4"
            />
            
            {exp.keyAchievements && exp.keyAchievements.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Achievements
                </label>
                {exp.keyAchievements.map((achievement, i) => (
                  <div key={i} className="flex items-start mb-2">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <Input
                      value={achievement}
                      onChange={(e) => {
                        const updated = [...exp.keyAchievements];
                        updated[i] = e.target.value;
                        updateExperience(index, 'keyAchievements', updated);
                      }}
                      placeholder="Describe a specific achievement with metrics..."
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies Used
                </label>
                <Textarea
                  value={exp.technologiesUsed.join(', ')}
                  onChange={(e) => updateExperience(index, 'technologiesUsed', 
                    e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  )}
                  placeholder="Enter technologies separated by commas..."
                  rows={2}
                />
              </div>
            )}
          </div>
        ))}
        
        <div className="text-center">
          <Button onClick={addExperience} variant="outline">
            + Add Experience
          </Button>
        </div>
      </div>
    );
  };

  const renderProjectsEditor = () => {
    const projects = editedCV.projects || [];
    
    const updateProject = (index, field, value) => {
      const updated = [...projects];
      updated[index] = { ...updated[index], [field]: value };
      updateSection('projects', updated);
    };

    const addProject = () => {
      updateSection('projects', [...projects, {
        name: '',
        description: '',
        technologies: [],
        keyFeatures: [],
        impact: '',
        relevanceScore: 75
      }]);
    };

    const deleteProject = (index) => {
      updateSection('projects', projects.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
              <div className="flex items-center space-x-2">
                {project.relevanceScore && (
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Relevance:</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${project.relevanceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{project.relevanceScore}%</span>
                  </div>
                )}
                <Button
                  onClick={() => deleteProject(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <Input
              label="Project Name"
              value={project.name || ''}
              onChange={(e) => updateProject(index, 'name', e.target.value)}
              className="mb-4"
            />
            
            <Textarea
              label="Project Description"
              value={project.description || ''}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              rows={4}
              placeholder="Describe the project, your role, and the challenges solved..."
              className="mb-4"
            />
            
            <Input
              label="Business/Technical Impact"
              value={project.impact || ''}
              onChange={(e) => updateProject(index, 'impact', e.target.value)}
              placeholder="e.g., Reduced processing time by 40%, Increased user engagement by 25%"
              className="mb-4"
            />
            
            <Textarea
              label="Technologies Used"
              value={Array.isArray(project.technologies) ? project.technologies.join(', ') : ''}
              onChange={(e) => updateProject(index, 'technologies', 
                e.target.value.split(',').map(s => s.trim()).filter(s => s)
              )}
              placeholder="Enter technologies separated by commas..."
              rows={2}
              className="mb-4"
            />
            
            <Textarea
              label="Key Features"
              value={Array.isArray(project.keyFeatures) ? project.keyFeatures.join('\n') : ''}
              onChange={(e) => updateProject(index, 'keyFeatures', 
                e.target.value.split('\n').map(s => s.trim()).filter(s => s)
              )}
              placeholder="Enter key features, one per line..."
              rows={3}
            />
          </div>
        ))}
        
        <div className="text-center">
          <Button onClick={addProject} variant="outline">
            + Add Project
          </Button>
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personalInfo':
        return renderPersonalInfoEditor();
      case 'summary':
        return renderSummaryEditor();
      case 'skills':
        return renderSkillsEditor();
      case 'experience':
        return renderExperienceEditor();
      case 'projects':
        return renderProjectsEditor();
      // Add other sections as needed
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p>Editor for {activeSection} section coming soon...</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Tailored CV
          </h3>
          <div className="flex space-x-2">
            {hasChanges && (
              <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
            <Button onClick={onCancel} variant="outline" size="sm">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary" size="sm" disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Section Navigation */}
        <div className="w-64 border-r border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Sections</h4>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <h4 className="text-lg font-medium text-gray-900 mb-6">
              {sections.find(s => s.id === activeSection)?.icon} {' '}
              {sections.find(s => s.id === activeSection)?.label}
            </h4>
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TailoredCVEditor;
