// backend/src/routes/samples.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const SAMPLES_DIR = path.join(__dirname, '../../public/samples');

const SAMPLE_LIST = [
  { id: 1,  filename: 'technology_01_arjun_mehta.pdf',        name: 'Arjun Mehta',          title: 'Senior Full Stack Developer',         category: 'technology', level: 'Senior', ats: 98 },
  { id: 2,  filename: 'technology_02_priya_krishnamurthy.pdf', name: 'Priya Krishnamurthy',  title: 'Machine Learning Engineer',           category: 'technology', level: 'Senior', ats: 96 },
  { id: 3,  filename: 'technology_03_rahul_singhania.pdf',     name: 'Rahul Singhania',      title: 'DevOps & Cloud Architect',            category: 'technology', level: 'Lead',   ats: 95 },
  { id: 4,  filename: 'technology_04_sneha_patel.pdf',         name: 'Sneha Patel',          title: 'Android Developer',                   category: 'technology', level: 'Mid',    ats: 94 },
  { id: 5,  filename: 'technology_05_vikram_nair.pdf',         name: 'Vikram Nair',          title: 'Cybersecurity Engineer',              category: 'technology', level: 'Senior', ats: 93 },
  { id: 6,  filename: 'business_01_ananya_sharma.pdf',         name: 'Ananya Sharma',        title: 'Product Manager',                     category: 'business',   level: 'Senior', ats: 97 },
  { id: 7,  filename: 'business_02_rajesh_kulkarni.pdf',       name: 'Rajesh Kulkarni',      title: 'Operations Director',                 category: 'business',   level: 'Lead',   ats: 95 },
  { id: 8,  filename: 'business_03_meera_iyer.pdf',            name: 'Meera Iyer',           title: 'Business Development Manager',        category: 'business',   level: 'Mid',    ats: 94 },
  { id: 9,  filename: 'business_04_karan_malhotra.pdf',        name: 'Karan Malhotra',       title: 'Human Resources Manager',             category: 'business',   level: 'Mid',    ats: 93 },
  { id: 10, filename: 'business_05_divya_nambiar.pdf',         name: 'Divya Nambiar',        title: 'Marketing Manager',                   category: 'business',   level: 'Mid',    ats: 92 },
  { id: 11, filename: 'finance_01_aditya_gupta.pdf',           name: 'Aditya Gupta',         title: 'CA & Finance Manager',                category: 'finance',    level: 'Senior', ats: 96 },
  { id: 12, filename: 'finance_02_sunita_rao.pdf',             name: 'Sunita Rao',           title: 'Investment Banking Analyst',          category: 'finance',    level: 'Mid',    ats: 95 },
  { id: 13, filename: 'finance_03_amit_joshi.pdf',             name: 'Amit Joshi',           title: 'FP&A Manager',                        category: 'finance',    level: 'Mid',    ats: 94 },
  { id: 14, filename: 'finance_04_pooja_desai.pdf',            name: 'Pooja Desai',          title: 'Risk & Compliance Manager',           category: 'finance',    level: 'Senior', ats: 93 },
  { id: 15, filename: 'finance_05_rohan_bhat.pdf',             name: 'Rohan Bhat',           title: 'Tax Consultant',                      category: 'finance',    level: 'Mid',    ats: 92 },
  { id: 16, filename: 'education_01_lakshmi_subramaniam.pdf',  name: 'Lakshmi Subramaniam', title: 'Senior School Teacher – Mathematics', category: 'education',  level: 'Senior', ats: 95 },
  { id: 17, filename: 'education_02_dr_suresh_pillai.pdf',     name: 'Dr. Suresh Pillai',   title: 'Associate Professor – CS',            category: 'education',  level: 'Lead',   ats: 94 },
  { id: 18, filename: 'education_03_nandini_chopra.pdf',       name: 'Nandini Chopra',      title: 'Primary School Teacher',              category: 'education',  level: 'Mid',    ats: 93 },
  { id: 19, filename: 'education_04_ravi_shankar.pdf',         name: 'Ravi Shankar',        title: 'School Principal',                    category: 'education',  level: 'Lead',   ats: 92 },
  { id: 20, filename: 'education_05_aparna_menon.pdf',         name: 'Aparna Menon',        title: 'Corporate Trainer & L&D Specialist',  category: 'education',  level: 'Senior', ats: 91 },
  { id: 21, filename: 'freshers_01_rohan_verma.pdf',           name: 'Rohan Verma',         title: 'Fresher – Computer Science Engineer', category: 'freshers',   level: 'Fresher',ats: 88 },
  { id: 22, filename: 'freshers_02_ishaan_kapoor.pdf',         name: 'Ishaan Kapoor',       title: 'Fresher – Data Science',              category: 'freshers',   level: 'Fresher',ats: 87 },
  { id: 23, filename: 'freshers_03_tanvi_shah.pdf',            name: 'Tanvi Shah',          title: 'Fresher – MBA Marketing',             category: 'freshers',   level: 'Fresher',ats: 86 },
  { id: 24, filename: 'freshers_04_ayesha_khan.pdf',           name: 'Ayesha Khan',         title: 'Fresher – Civil Engineer',            category: 'freshers',   level: 'Fresher',ats: 85 },
  { id: 25, filename: 'freshers_05_harsh_agarwal.pdf',         name: 'Harsh Agarwal',       title: 'Fresher – CA Aspirant',              category: 'freshers',   level: 'Fresher',ats: 84 },
];

// GET /api/samples  — list (optional ?category=)
router.get('/', (req, res) => {
  const { category } = req.query;
  const results = category && category !== 'all'
    ? SAMPLE_LIST.filter(s => s.category === category)
    : SAMPLE_LIST;
  res.json({ samples: results, total: results.length });
});

// GET /api/samples/:filename  — stream PDF inline
router.get('/:filename', (req, res) => {
  const { filename } = req.params;

  // Security: only allow known filenames
  const allowed = SAMPLE_LIST.map(s => s.filename);
  if (!allowed.includes(filename)) {
    return res.status(404).json({ error: 'Sample not found' });
  }

  const filepath = path.join(SAMPLES_DIR, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'PDF file not found on server. Please upload the sample PDFs to backend/public/samples/' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(filepath);
});

module.exports = router;
