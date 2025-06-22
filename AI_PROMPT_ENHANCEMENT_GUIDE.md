# 🤖 AI Prompt Enhancement Guide

This document provides detailed instructions on where and how to modify AI system prompts to implement the following enhancements:

1. **Skills Categorization**: Let AI automatically categorize skills into proper categories
2. **Professional Summary**: Let AI generate/enhance professional summaries
3. **Job Title Setup**: Let AI determine and set appropriate job titles

---

## 📍 **FILE LOCATIONS FOR AI PROMPTS**

All AI prompts are located in: `backend/routes/aiRoutes.js`

### **Key AI Model Used**
- **Model**: `gemini-2.0-flash-exp`
- **API**: Google Gemini AI
- **Environment Variable**: `GEMINI_API_KEY`

---

## 🎯 **ENHANCEMENT 1: SKILLS CATEGORIZATION**

### **Target Location**
- **File**: `backend/routes/aiRoutes.js`
- **Function**: `POST /api/ai/extract-cv` endpoint
- **Line Range**: ~180-220 (approximate)
- **Current Prompt Variable**: `prompt` (inside the router.post('/extract-cv'))

### **Current Skills Structure**
```javascript
"skills": [
  {
    "name": "",
    "level": "Beginner|Intermediate|Advanced|Expert"
  }
]
```

### **Enhanced Skills Structure** 
```javascript
"skills": {
  "technical": [
    {
      "name": "JavaScript",
      "level": "Advanced"
    }
  ],
  "soft": [
    {
      "name": "Leadership",
      "level": "Intermediate"
    }
  ],
  "languages": [
    {
      "name": "English",
      "level": "Native"
    }
  ],
  "tools": [
    {
      "name": "VS Code",
      "level": "Expert"
    }
  ],
  "frameworks": [
    {
      "name": "React",
      "level": "Advanced"
    }
  ]
}
```

### **Exact Modification Required**

**FIND THIS SECTION** (around line 200):
```javascript
"skills": [
  {
    "name": "",
    "level": "Beginner|Intermediate|Advanced|Expert"
  }
],
```

**REPLACE WITH**:
```javascript
"skills": {
  "technical": [
    {
      "name": "",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ],
  "soft": [
    {
      "name": "",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ],
  "languages": [
    {
      "name": "",
      "level": "Basic|Intermediate|Advanced|Native"
    }
  ],
  "tools": [
    {
      "name": "",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ],
  "frameworks": [
    {
      "name": "",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ],
  "other": [
    {
      "name": "",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ]
},
```

**ADD CATEGORIZATION INSTRUCTIONS** (add after the JSON structure):
```javascript
Important Instructions for Skills:
1. Categorize each skill into the appropriate category:
   - technical: Programming languages, databases, cloud platforms
   - soft: Communication, leadership, problem-solving, teamwork
   - languages: Human languages (English, French, Spanish, etc.)
   - tools: Software tools, IDEs, design tools
   - frameworks: Libraries, frameworks, platforms
   - other: Any skills that don't fit the above categories
   
2. Extract skill level accurately from context clues in the CV
3. If no level is mentioned, infer from experience level and context
4. Avoid duplicate skills across categories
```

---

## 🎯 **ENHANCEMENT 2: PROFESSIONAL SUMMARY**

### **Target Location**
- **File**: `backend/routes/aiRoutes.js`
- **Function**: `POST /api/ai/extract-cv` endpoint (same as skills)
- **Enhancement**: Add instructions for AI to improve/generate professional summary

### **Current Summary Structure**
```javascript
"summary": "",
```

### **Enhanced Summary Instructions**

**ADD THESE INSTRUCTIONS** (add before the CV Text section):
```javascript
Professional Summary Instructions:
1. If a summary/objective exists, enhance it to be more compelling and professional
2. If no summary exists, create one based on the experience and skills
3. Summary should be 2-3 sentences highlighting:
   - Years of experience and main expertise area
   - Key technical skills and achievements
   - Career goals or value proposition
4. Use action words and quantifiable achievements when possible
5. Tailor tone to be professional yet engaging
6. Maximum 150 words
```

### **Exact Modification Location**
Find the prompt string (around line 180) and add the summary instructions right before:
```javascript
CV Text:
${text}
```

---

## 🎯 **ENHANCEMENT 3: JOB TITLE SETUP**

### **Target Location**
- **File**: `backend/routes/aiRoutes.js`
- **Function**: `POST /api/ai/extract-cv` endpoint (same as above)
- **Enhancement**: Add AI logic to determine appropriate job title

### **Current PersonalInfo Structure**
```javascript
"personalInfo": {
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": ""
},
```

### **Enhanced PersonalInfo Structure**
```javascript
"personalInfo": {
  "firstName": "",
  "lastName": "",
  "title": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": ""
},
```

### **Exact Modification Required**

**FIND THIS SECTION** (around line 185):
```javascript
"personalInfo": {
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": ""
},
```

**REPLACE WITH**:
```javascript
"personalInfo": {
  "firstName": "",
  "lastName": "",
  "title": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": ""
},
```

**ADD JOB TITLE INSTRUCTIONS** (add after the JSON structure):
```javascript
Job Title Instructions:
1. Extract or infer the most appropriate professional title for this person
2. Base the title on their most recent role, expertise level, and career progression
3. Use industry-standard titles (e.g., "Senior Software Engineer", "Marketing Manager", "Data Scientist")
4. If multiple roles, choose the most senior or recent one
5. Avoid generic titles like "Professional" - be specific
6. Consider years of experience for seniority level (Junior, Mid-level, Senior, Lead, etc.)
```

---

## 🎯 **ENHANCEMENT 4: CV TAILORING IMPROVEMENTS**

### **Target Location**
- **File**: `backend/routes/aiRoutes.js`
- **Function**: `POST /api/ai/tailor-cv` endpoint
- **Line Range**: ~415-440 (approximate)

### **Current Tailoring Prompt Enhancement**

**FIND THIS SECTION** (around line 425):
```javascript
Instructions:
1. Reorder and emphasize experiences that match the job requirements
2. Highlight relevant skills and technologies mentioned in the job offer
3. Optimize the professional summary for this specific role
4. Use keywords from the job description for ATS optimization
5. Maintain all factual information - do not invent or exaggerate
6. Return the same JSON structure as the original CV
```

**REPLACE WITH ENHANCED INSTRUCTIONS**:
```javascript
Instructions:
1. Reorder and emphasize experiences that match the job requirements
2. Categorize and highlight relevant skills from all categories (technical, soft, tools, frameworks)
3. Optimize the professional summary specifically for this role and company
4. Ensure the job title in personalInfo.title matches or aligns with the target role
5. Use keywords from the job description for ATS optimization
6. Maintain all factual information - do not invent or exaggerate
7. Prioritize skills mentioned in the job offer across all skill categories
8. Return the same JSON structure as the original CV

Specific Focus Areas:
- Professional Summary: Rewrite to emphasize relevance to target role
- Skills Categorization: Ensure skills are properly categorized and relevant ones are highlighted
- Job Title: Adjust to match the target role level and requirements
```

---

## 🎯 **IMPLEMENTATION STEPS**

### **Step 1: Backup Current File**
```bash
cp backend/routes/aiRoutes.js backend/routes/aiRoutes.js.backup
```

### **Step 2: Apply Skills Categorization**
1. Open `backend/routes/aiRoutes.js`
2. Find the `/extract-cv` endpoint (around line 157)
3. Locate the prompt variable (around line 180)
4. Replace the skills structure as shown above
5. Add the categorization instructions

### **Step 3: Apply Professional Summary Enhancement**
1. In the same prompt, add the summary instructions before the `CV Text:` section

### **Step 4: Apply Job Title Setup**
1. In the same prompt, add the `title` field to personalInfo
2. Add the job title instructions

### **Step 5: Enhance CV Tailoring**
1. Find the `/tailor-cv` endpoint (around line 395)
2. Replace the instructions as shown above

### **Step 6: Test the Changes**
```bash
# Restart the backend server
cd backend
npm start

# Test with a sample CV upload
# Check that skills are properly categorized
# Verify professional summary is enhanced
# Confirm job title is appropriately set
```

---

## 🎯 **TESTING CHECKLIST**

### **Skills Categorization Test**
- [ ] Upload a CV with mixed skills
- [ ] Verify skills are categorized into technical, soft, languages, tools, frameworks, other
- [ ] Check that skill levels are appropriately assigned
- [ ] Ensure no duplicate skills across categories

### **Professional Summary Test**
- [ ] Upload a CV with a basic summary
- [ ] Verify the summary is enhanced and more compelling
- [ ] Upload a CV without a summary
- [ ] Verify a professional summary is generated

### **Job Title Test**
- [ ] Upload a CV with unclear job title
- [ ] Verify an appropriate professional title is assigned
- [ ] Check that title matches experience level and skills

### **Integration Test**
- [ ] Test the complete flow: Upload → Extract → Edit → Generate PDF
- [ ] Verify PDF displays categorized skills correctly
- [ ] Confirm professional summary appears in PDF
- [ ] Check that job title shows in PDF header

---

## 🎯 **EXPECTED OUTPUTS**

### **Before Enhancement**
```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "summary": "Experienced developer",
  "skills": [
    {"name": "JavaScript", "level": "Advanced"},
    {"name": "Communication", "level": "Intermediate"}
  ]
}
```

### **After Enhancement**
```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "title": "Senior Full Stack Developer"
  },
  "summary": "Experienced Full Stack Developer with 5+ years of expertise in JavaScript, React, and Node.js. Proven track record of delivering scalable web applications and leading cross-functional teams. Strong problem-solving skills with a passion for clean code and user experience.",
  "skills": {
    "technical": [
      {"name": "JavaScript", "level": "Advanced"},
      {"name": "React", "level": "Advanced"}
    ],
    "soft": [
      {"name": "Communication", "level": "Intermediate"},
      {"name": "Leadership", "level": "Intermediate"}
    ],
    "tools": [
      {"name": "VS Code", "level": "Expert"}
    ]
  }
}
```

---

## 🛠️ **TROUBLESHOOTING**

### **Common Issues**

1. **JSON Parsing Errors**
   - Check that the JSON structure is valid
   - Ensure all brackets and quotes are properly closed
   - Test with a simple CV first

2. **Skills Not Categorized**
   - Verify the instructions are clear in the prompt
   - Check that the AI model is receiving the updated prompt
   - Test with different types of skills

3. **Missing Job Titles**
   - Ensure the title field is added to personalInfo
   - Check that the AI has enough context to infer a title
   - Verify the instructions are specific enough

### **Debug Steps**
1. Check server logs for AI responses
2. Test individual endpoints with Postman
3. Verify environment variables are set
4. Check that the Gemini API key is valid

---

## 📝 **NOTES**

- All modifications are in the same file: `backend/routes/aiRoutes.js`
- The AI model `gemini-2.0-flash-exp` is capable of following complex instructions
- Test incrementally - implement one enhancement at a time
- Keep backups of working versions
- Monitor API usage to stay within limits
- Consider adding validation for the new structured data

---

**🎯 This guide provides exact locations and modifications needed to implement AI-powered skills categorization, professional summary enhancement, and job title setup in your CV Builder application.**
