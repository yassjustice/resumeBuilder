import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { flattenSkillsObject, categorizeSkillsArray } from '../../utils/skillsCategorization';

const CategorizedSkillsInput = ({ skills = {}, onChange, isRTL }) => {
  const [categorizedSkills, setCategorizedSkills] = useState({});
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillName, setNewSkillName] = useState('');

  // Convert skills to categorized format on mount or when skills change
  useEffect(() => {
    console.log('🎯 CategorizedSkillsInput received skills:', {
      type: typeof skills,
      isArray: Array.isArray(skills),
      keys: skills ? Object.keys(skills) : 'null/undefined',
      value: skills
    });

    let processedSkills = {};
    
    if (Array.isArray(skills)) {
      // Convert array format to categorized format
      processedSkills = categorizeSkillsArray(skills);
    } else if (skills && typeof skills === 'object') {
      // Already in categorized format
      processedSkills = { ...skills };
    }

    console.log('🔄 Processed skills for categorized display:', processedSkills);
    setCategorizedSkills(processedSkills);
  }, [skills]);

  // Add a new skill to a category
  const addSkillToCategory = (category, skillName) => {
    if (!skillName.trim()) return;

    const updated = { ...categorizedSkills };
    if (!updated[category]) {
      updated[category] = [];
    }
    updated[category].push(skillName.trim());
    
    setCategorizedSkills(updated);
    onChange(updated);
  };

  // Remove a skill from a category
  const removeSkillFromCategory = (category, skillIndex) => {
    const updated = { ...categorizedSkills };
    if (updated[category] && updated[category][skillIndex] !== undefined) {
      updated[category].splice(skillIndex, 1);
      
      // Remove empty categories
      if (updated[category].length === 0) {
        delete updated[category];
      }
    }
    
    setCategorizedSkills(updated);
    onChange(updated);
  };

  // Add a new category
  const addNewCategory = () => {
    if (!newSkillCategory.trim() || !newSkillName.trim()) return;

    addSkillToCategory(newSkillCategory.trim(), newSkillName.trim());
    setNewSkillCategory('');
    setNewSkillName('');
  };

  // Edit a skill name
  const editSkill = (category, skillIndex, newName) => {
    const updated = { ...categorizedSkills };
    if (updated[category] && updated[category][skillIndex] !== undefined) {
      updated[category][skillIndex] = newName;
      setCategorizedSkills(updated);
      onChange(updated);
    }
  };

  const categories = Object.keys(categorizedSkills);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Skills by Category</h3>
        <div className="text-sm text-gray-500">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </div>
      </div>

      {/* Existing Categories */}
      {categories.map((category) => (
        <div key={category} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800 capitalize">{category}</h4>
            <span className="text-sm text-gray-500">
              {categorizedSkills[category]?.length || 0} skills
            </span>
          </div>
          
          <div className="space-y-2">
            {(categorizedSkills[category] || []).map((skill, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  value={skill}
                  onChange={(e) => editSkill(category, index, e.target.value)}
                  className="flex-1"
                  placeholder="Skill name"
                />
                <button
                  onClick={() => removeSkillFromCategory(category, index)}
                  className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                  title="Remove skill"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {/* Quick add skill to existing category */}
            <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
              <Input
                placeholder={`Add skill to ${category}`}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkillToCategory(category, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.parentNode.querySelector('input');
                  addSkillToCategory(category, input.value);
                  input.value = '';
                }}
                className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm"
                title="Add skill"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Category */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
        <h4 className="font-medium text-gray-700 mb-3">Add New Category</h4>
        <div className="space-y-3">
          <Input
            placeholder="Category name (e.g., 'Technical Skills', 'Languages')"
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
          />
          <Input
            placeholder="First skill in this category"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addNewCategory();
              }
            }}
          />
          <Button
            onClick={addNewCategory}
            variant="outline"
            size="sm"
            disabled={!newSkillCategory.trim() || !newSkillName.trim()}
            className="w-full"
          >
            Add Category & Skill
          </Button>
        </div>
      </div>

      {/* Summary */}
      {categories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-700">
            <strong>Skills Summary:</strong> {
              categories.reduce((total, cat) => total + (categorizedSkills[cat]?.length || 0), 0)
            } skills across {categories.length} categories
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Categories: {categories.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorizedSkillsInput;
