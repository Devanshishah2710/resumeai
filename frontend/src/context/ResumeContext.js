import React, { createContext, useContext, useState, useCallback } from 'react';

const ResumeContext = createContext(null);

const DEFAULT = {
  title: 'My Resume', template: 'modern', templateColor: '#3B82F6',
  personal: { name:'', email:'', phone:'', location:'', linkedin:'', github:'', website:'', title:'', summary:'' },
  experience: [], education: [], projects: [], certifications: [],
  skills: { technical:[], soft:[], languages:[], tools:[] },
  targetRole: '',
};

export const ResumeProvider = ({ children }) => {
  const [resume, setResume] = useState(DEFAULT);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mark = useCallback(() => setIsDirty(true), []);

  const updatePersonal = useCallback((field, value) => { setResume(p => ({ ...p, personal: { ...p.personal, [field]: value } })); mark(); }, [mark]);
  const updateResume = useCallback(updates => { setResume(p => ({ ...p, ...updates })); mark(); }, [mark]);
  const loadResume = useCallback(data => { setResume({ ...DEFAULT, ...data }); setActiveResumeId(data._id || null); setIsDirty(false); }, []);
  const resetResume = useCallback(() => { setResume(DEFAULT); setActiveResumeId(null); setIsDirty(false); }, []);

  const addExperience = useCallback(() => { setResume(p => ({ ...p, experience: [...p.experience, { company:'', role:'', location:'', startDate:'', endDate:'', current:false, description:'', bullets:[] }] })); mark(); }, [mark]);
  const updateExperience = useCallback((i, u) => { setResume(p => { const e=[...p.experience]; e[i]={...e[i],...u}; return {...p,experience:e}; }); mark(); }, [mark]);
  const removeExperience = useCallback(i => { setResume(p => ({ ...p, experience: p.experience.filter((_,j)=>j!==i) })); mark(); }, [mark]);

  const addEducation = useCallback(() => { setResume(p => ({ ...p, education: [...p.education, { institution:'', degree:'', field:'', startYear:'', endYear:'', gpa:'' }] })); mark(); }, [mark]);
  const updateEducation = useCallback((i, u) => { setResume(p => { const e=[...p.education]; e[i]={...e[i],...u}; return {...p,education:e}; }); mark(); }, [mark]);
  const removeEducation = useCallback(i => { setResume(p => ({ ...p, education: p.education.filter((_,j)=>j!==i) })); mark(); }, [mark]);

  const addSkill = useCallback((cat, skill) => { setResume(p => ({ ...p, skills: { ...p.skills, [cat]: [...(p.skills[cat]||[]), skill] } })); mark(); }, [mark]);
  const removeSkill = useCallback((cat, i) => { setResume(p => ({ ...p, skills: { ...p.skills, [cat]: p.skills[cat].filter((_,j)=>j!==i) } })); mark(); }, [mark]);

  const addProject = useCallback(() => { setResume(p => ({ ...p, projects: [...p.projects, { name:'', description:'', technologies:[], url:'', github:'' }] })); mark(); }, [mark]);
  const updateProject = useCallback((i, u) => { setResume(p => { const e=[...p.projects]; e[i]={...e[i],...u}; return {...p,projects:e}; }); mark(); }, [mark]);
  const removeProject = useCallback(i => { setResume(p => ({ ...p, projects: p.projects.filter((_,j)=>j!==i) })); mark(); }, [mark]);

  return (
    <ResumeContext.Provider value={{
      resume, activeResumeId, isDirty, isSaving, setIsSaving, setIsDirty,
      updatePersonal, updateResume, loadResume, resetResume,
      addExperience, updateExperience, removeExperience,
      addEducation, updateEducation, removeEducation,
      addSkill, removeSkill,
      addProject, updateProject, removeProject,
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => { const c = useContext(ResumeContext); if (!c) throw new Error('useResume outside ResumeProvider'); return c; };
