const express = require('express');
const path = require('path');
const router = express.Router();

const SAMPLES = [
  // Technology
  { id:1, filename:'technology_01_arjun_mehta.pdf', name:'Arjun Mehta', title:'Senior Full Stack Developer', category:'technology', level:'senior', ats:98 },
  { id:2, filename:'technology_02_priya_krishnamurthy.pdf', name:'Priya Krishnamurthy', title:'Machine Learning Engineer', category:'technology', level:'senior', ats:96 },
  { id:3, filename:'technology_03_rahul_singhania.pdf', name:'Rahul Singhania', title:'DevOps & Cloud Architect', category:'technology', level:'lead', ats:95 },
  { id:4, filename:'technology_04_sneha_patel.pdf', name:'Sneha Patel', title:'Android Developer', category:'technology', level:'mid', ats:94 },
  { id:5, filename:'technology_05_vikram_nair.pdf', name:'Vikram Nair', title:'Cybersecurity Engineer', category:'technology', level:'senior', ats:93 },
  // Business
  { id:6, filename:'business_01_ananya_sharma.pdf', name:'Ananya Sharma', title:'Product Manager', category:'business', level:'senior', ats:97 },
  { id:7, filename:'business_02_rajesh_kulkarni.pdf', name:'Rajesh Kulkarni', title:'Operations Director', category:'business', level:'lead', ats:95 },
  { id:8, filename:'business_03_meera_iyer.pdf', name:'Meera Iyer', title:'Business Development Manager', category:'business', level:'mid', ats:94 },
  { id:9, filename:'business_04_karan_malhotra.pdf', name:'Karan Malhotra', title:'HR Manager', category:'business', level:'mid', ats:93 },
  { id:10, filename:'business_05_divya_nambiar.pdf', name:'Divya Nambiar', title:'Marketing Manager', category:'business', level:'mid', ats:92 },
  // Finance
  { id:11, filename:'finance_01_aditya_gupta.pdf', name:'Aditya Gupta', title:'Chartered Accountant & Finance Manager', category:'finance', level:'senior', ats:96 },
  { id:12, filename:'finance_02_sunita_rao.pdf', name:'Sunita Rao', title:'Investment Banking Analyst', category:'finance', level:'mid', ats:95 },
  { id:13, filename:'finance_03_amit_joshi.pdf', name:'Amit Joshi', title:'FP&A Manager', category:'finance', level:'mid', ats:94 },
  { id:14, filename:'finance_04_pooja_desai.pdf', name:'Pooja Desai', title:'Risk & Compliance Manager', category:'finance', level:'senior', ats:93 },
  { id:15, filename:'finance_05_rohan_bhat.pdf', name:'Rohan Bhat', title:'Tax Consultant', category:'finance', level:'mid', ats:92 },
  // Education
  { id:16, filename:'education_01_lakshmi_subramaniam.pdf', name:'Lakshmi Subramaniam', title:'Senior School Teacher – Mathematics', category:'education', level:'senior', ats:95 },
  { id:17, filename:'education_02_dr_suresh_pillai.pdf', name:'Dr. Suresh Pillai', title:'Associate Professor – Computer Science', category:'education', level:'lead', ats:94 },
  { id:18, filename:'education_03_nandini_chopra.pdf', name:'Nandini Chopra', title:'Primary School Teacher', category:'education', level:'mid', ats:93 },
  { id:19, filename:'education_04_ravi_shankar.pdf', name:'Ravi Shankar', title:'School Principal', category:'education', level:'lead', ats:92 },
  { id:20, filename:'education_05_aparna_menon.pdf', name:'Aparna Menon', title:'Corporate Trainer & L&D Specialist', category:'education', level:'senior', ats:91 },
  // Freshers
  { id:21, filename:'freshers_01_rohan_verma.pdf', name:'Rohan Verma', title:'Fresher – Computer Science Engineer', category:'freshers', level:'fresher', ats:88 },
  { id:22, filename:'freshers_02_ishaan_kapoor.pdf', name:'Ishaan Kapoor', title:'Fresher – Data Science & Analytics', category:'freshers', level:'fresher', ats:87 },
  { id:23, filename:'freshers_03_tanvi_shah.pdf', name:'Tanvi Shah', title:'Fresher – MBA Marketing Graduate', category:'freshers', level:'fresher', ats:86 },
  { id:24, filename:'freshers_04_ayesha_khan.pdf', name:'Ayesha Khan', title:'Fresher – Civil Engineer', category:'freshers', level:'fresher', ats:85 },
  { id:25, filename:'freshers_05_harsh_agarwal.pdf', name:'Harsh Agarwal', title:'Fresher – CA Aspirant', category:'freshers', level:'fresher', ats:84 },
];

// GET /api/samples — list all or filter by category
router.get('/', (req, res) => {
  const { category, level } = req.query;
  let results = SAMPLES;
  if (category) results = results.filter(s => s.category === category);
  if (level)    results = results.filter(s => s.level === level);
  res.json({ samples: results, total: results.length });
});

// GET /api/samples/:filename — stream PDF
router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const allowed = SAMPLES.map(s => s.filename);
  if (!allowed.includes(filename)) return res.status(404).json({ error: 'Not found' });
  const filepath = path.join(__dirname, '../../public/samples', filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filepath);
});

module.exports = router;