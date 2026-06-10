import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import { templateAPI } from '../utils/api';
import toast from 'react-hot-toast';

const API = (process.env.REACT_APP_API_URL || 'https://resumeai-b3p4.onrender.com/api').replace(/\/$/, '');

// ── Constants ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'templates', label: 'Design Templates', icon: '🎨', desc: 'Choose a visual layout' },
  { id: 'samples',   label: 'Resume Samples',   icon: '📄', desc: 'Real-world examples' },
];

const TEMPLATE_CATEGORIES = ['All', 'Tech', 'Business', 'Design', 'Research'];

const SAMPLE_CATEGORIES = [
  { id: 'all',        label: 'All Fields',   icon: '🌐' },
  { id: 'technology', label: 'Technology',   icon: '💻' },
  { id: 'business',   label: 'Business',     icon: '📊' },
  { id: 'finance',    label: 'Finance',      icon: '💰' },
  { id: 'education',  label: 'Education',    icon: '🎓' },
  { id: 'freshers',   label: 'Freshers',     icon: '🌱' },
];

const LEVEL_COLORS = {
  fresher: '#10B981', junior: '#3B82F6', mid: '#8B5CF6',
  senior: '#F59E0B',  lead:   '#F43F5E',
};

const SAMPLES = [
  { id:1,  filename:'technology_01_arjun_mehta.pdf',        name:'Arjun Mehta',          title:'Senior Full Stack Developer',         category:'technology', level:'senior', ats:98,
    data:{ personal:{name:'Arjun Mehta',email:'arjun.mehta@gmail.com',phone:'+91 98765 43210',location:'Bangalore, Karnataka',linkedin:'linkedin.com/in/arjunmehta',title:'Senior Full Stack Developer',summary:'8+ years building scalable web applications with React, Node.js, and AWS. Led teams of 6–10 engineers delivering SaaS platforms serving 500K+ users.'},skills:{technical:['JavaScript','TypeScript','Python','Go','React','Next.js','Node.js','GraphQL'],soft:['Team Leadership','Mentoring','Agile'],tools:['AWS','Docker','Kubernetes','PostgreSQL','MongoDB']},experience:[{role:'Senior Full Stack Developer',company:'Razorpay',location:'Bangalore',startDate:'Jan 2021',endDate:'',current:true,description:'Architected microservices handling 2M+ daily transactions with 99.99% uptime.',bullets:['Led migration from monolith to microservices, reducing deployment time by 70%','Mentored team of 8 engineers, cutting bugs by 40%']},{role:'Full Stack Developer',company:'Freshworks',location:'Chennai',startDate:'Jun 2018',endDate:'Dec 2020',current:false,description:'Developed CRM features for 10,000+ enterprise clients.',bullets:['Optimized PostgreSQL queries reducing response time from 800ms to 120ms']}],education:[{institution:'IIT Bombay',degree:'B.Tech',field:'Computer Science',startYear:'2012',endYear:'2016',gpa:'8.7/10'}],projects:[{name:'OpenMetrics',description:'Open-source monitoring tool with 2.4K GitHub stars',technologies:['Go','Prometheus','Grafana'],url:'github.com/arjunmehta-dev/openmetrics'}]} },
  { id:2,  filename:'technology_02_priya_krishnamurthy.pdf', name:'Priya Krishnamurthy',  title:'Machine Learning Engineer',           category:'technology', level:'senior', ats:96,
    data:{ personal:{name:'Priya Krishnamurthy',email:'priya.k@protonmail.com',phone:'+91 87654 32109',location:'Hyderabad, Telangana',linkedin:'linkedin.com/in/priyakrishna-ml',title:'Machine Learning Engineer',summary:'ML Engineer with 5 years specializing in NLP and computer vision. Deployed production models serving 10M+ inferences/day. Published 3 papers in top-tier conferences.'},skills:{technical:['PyTorch','TensorFlow','Hugging Face','scikit-learn','Python','R','SQL'],soft:['Research','Communication','Problem Solving'],tools:['MLflow','SageMaker','Airflow','Spark','Docker']},experience:[{role:'Senior ML Engineer',company:'Flipkart',location:'Bangalore',startDate:'Mar 2022',endDate:'',current:true,description:'Built recommendation engine improving CTR by 23% (₹180Cr revenue impact).',bullets:['Deployed BERT-based search ranking model reducing irrelevant results by 35%','Designed MLOps pipeline cutting deployment time from 2 weeks to 4 hours']}],education:[{institution:'IIT Hyderabad',degree:'PhD',field:'Computer Science (AI/ML)',startYear:'2020',endYear:'2025',gpa:''},{institution:'BITS Pilani',degree:'M.Tech',field:'Artificial Intelligence',startYear:'2017',endYear:'2019',gpa:'9.1/10'}],projects:[{name:'IndoNLP Toolkit',description:'NLP library for Indian languages — 800+ GitHub stars',technologies:['Python','Transformers'],url:'github.com/priyakrishna-ai/indonlp'}]} },
  { id:3,  filename:'technology_03_rahul_singhania.pdf',     name:'Rahul Singhania',      title:'DevOps & Cloud Architect',            category:'technology', level:'lead',   ats:95,
    data:{ personal:{name:'Rahul Singhania',email:'rahul.singhania@outlook.com',phone:'+91 99887 76655',location:'Pune, Maharashtra',linkedin:'linkedin.com/in/rahulsinghania-devops',title:'DevOps & Cloud Architect',summary:'Cloud Architect with 10 years designing resilient, cost-optimized infrastructure on AWS and Azure. Reduced infrastructure costs by $2M+ across clients.'},skills:{technical:['AWS','Azure','GCP','Terraform','Kubernetes','Docker','Helm'],soft:['Architecture Design','Team Leadership'],tools:['Jenkins','GitHub Actions','ArgoCD','Prometheus','Grafana','Datadog']},experience:[{role:'Cloud Architect',company:'Wipro Digital',location:'Pune',startDate:'Apr 2020',endDate:'',current:true,description:'Designed multi-region AWS architecture for BFSI client handling ₹5000Cr daily transactions.',bullets:['Reduced cloud spend by $1.2M/year through optimization','Led Kubernetes migration for 200+ microservices with zero-downtime']}],education:[{institution:'University of Pune',degree:'B.E.',field:'Information Technology',startYear:'2010',endYear:'2014',gpa:'7.9/10'}],projects:[]} },
  { id:4,  filename:'technology_04_sneha_patel.pdf',         name:'Sneha Patel',          title:'Android Developer',                   category:'technology', level:'mid',    ats:94,
    data:{ personal:{name:'Sneha Patel',email:'sneha.patel.dev@gmail.com',phone:'+91 76543 21098',location:'Ahmedabad, Gujarat',linkedin:'linkedin.com/in/sneha-android',title:'Android Developer',summary:'Android Developer with 6 years building high-performance apps with 5M+ combined downloads. Expert in Kotlin, Jetpack Compose, and clean architecture.'},skills:{technical:['Kotlin','Java','Jetpack Compose','MVVM','Room DB'],soft:['Clean Code','Mentoring'],tools:['Android Studio','Firebase','Retrofit','Coroutines','JUnit','Espresso']},experience:[{role:'Senior Android Developer',company:'PhonePe',location:'Bangalore',startDate:'Feb 2021',endDate:'',current:true,description:'Rebuilt payments screen in Jetpack Compose improving rendering speed by 40%.',bullets:['Implemented biometric authentication for 150M+ users','Reduced app crash rate from 0.8% to 0.1%']}],education:[{institution:'NIT Surat',degree:'B.Tech',field:'Information Technology',startYear:'2014',endYear:'2018',gpa:'8.4/10'}],projects:[{name:'SpendWise',description:'Personal finance app — 200K+ downloads, 4.7★ Play Store',technologies:['Kotlin','Compose','Room'],url:'play.google.com/store/apps/spendwise'}]} },
  { id:5,  filename:'technology_05_vikram_nair.pdf',         name:'Vikram Nair',          title:'Cybersecurity Engineer',              category:'technology', level:'senior', ats:93,
    data:{ personal:{name:'Vikram Nair',email:'vikram.nair.sec@gmail.com',phone:'+91 88776 65544',location:'Kochi, Kerala',linkedin:'linkedin.com/in/vikramnair-security',title:'Cybersecurity Engineer',summary:'Cybersecurity professional with 7 years in penetration testing and incident response. Identified 200+ critical vulnerabilities for Fortune 500 clients. $85K+ in bug bounty rewards.'},skills:{technical:['Penetration Testing','Red Teaming','SIEM','Threat Hunting','Incident Response'],soft:['Analytical Thinking','Report Writing'],tools:['Metasploit','Burp Suite','Nmap','Wireshark','Splunk']},experience:[{role:'Lead Security Engineer',company:'Deloitte',location:'Kochi',startDate:'Sep 2020',endDate:'',current:true,description:'Conducted 40+ penetration tests for BFSI and healthcare clients, reporting 200+ critical CVEs.',bullets:['Led incident response for ransomware attack, restoring operations in 18 hours','Designed Zero Trust architecture reducing attack surface by 60%']}],education:[{institution:'College of Engineering Trivandrum',degree:'B.Tech',field:'Computer Science',startYear:'2013',endYear:'2017',gpa:'8.2/10'}],projects:[]} },
  { id:6,  filename:'business_01_ananya_sharma.pdf',         name:'Ananya Sharma',        title:'Product Manager',                     category:'business',   level:'senior', ats:97,
    data:{ personal:{name:'Ananya Sharma',email:'ananya.sharma.pm@gmail.com',phone:'+91 97654 32198',location:'Gurgaon, Haryana',linkedin:'linkedin.com/in/ananyasharma-pm',title:'Product Manager',summary:'Strategic Product Manager with 8 years driving 0→1 and scale products in fintech and e-commerce. Launched products generating $50M+ ARR. MBA from IIM Ahmedabad.'},skills:{technical:['Product Strategy','Roadmapping','A/B Testing','SQL','Data Analysis'],soft:['Leadership','Stakeholder Management','Communication'],tools:['JIRA','Confluence','Figma','Mixpanel','Amplitude','Tableau']},experience:[{role:'Senior Product Manager',company:'Paytm',location:'Gurgaon',startDate:'Mar 2021',endDate:'',current:true,description:'Owned P&L for Paytm Loans — grew disbursements from ₹200Cr to ₹1800Cr in 18 months.',bullets:['Launched credit score feature used by 8M+ users with 72 NPS','Led cross-functional team of 25 across engineering, design, data, marketing']}],education:[{institution:'IIM Ahmedabad',degree:'MBA',field:'Marketing & Strategy',startYear:'2014',endYear:'2016',gpa:'3.8/4.0'},{institution:'Lady Shri Ram College',degree:'B.Com (Hons)',field:'Commerce',startYear:'2011',endYear:'2014',gpa:''}],projects:[]} },
  { id:7,  filename:'business_02_rajesh_kulkarni.pdf',       name:'Rajesh Kulkarni',      title:'Operations Director',                 category:'business',   level:'lead',   ats:95,
    data:{ personal:{name:'Rajesh Kulkarni',email:'rajesh.kulkarni@gmail.com',phone:'+91 96543 21987',location:'Mumbai, Maharashtra',linkedin:'linkedin.com/in/rajeshkulkarni-ops',title:'Operations Director',summary:'Operations leader with 15 years streamlining supply chain for FMCG giants. Delivered $30M+ in cost savings. Six Sigma Black Belt. Led teams of 200+.'},skills:{technical:['Supply Chain Management','Inventory Optimization','Demand Planning','S&OP'],soft:['P&L Management','Cross-functional Leadership'],tools:['SAP','Oracle SCM','Power BI','Advanced Excel']},experience:[{role:'Director – Operations',company:'Hindustan Unilever',location:'Mumbai',startDate:'Jan 2019',endDate:'',current:true,description:'Managed ₹2500Cr supply chain for Home Care division across 28 states.',bullets:['Reduced logistics cost by 18% (₹45Cr savings)','Achieved 98.5% on-shelf availability up from 91%']}],education:[{institution:'XLRI Jamshedpur',degree:'MBA',field:'Operations Management',startYear:'2007',endYear:'2009',gpa:''},{institution:'VJTI Mumbai',degree:'B.E.',field:'Mechanical',startYear:'2003',endYear:'2007',gpa:''}],projects:[]} },
  { id:8,  filename:'business_03_meera_iyer.pdf',            name:'Meera Iyer',           title:'Business Development Manager',        category:'business',   level:'mid',    ats:94,
    data:{ personal:{name:'Meera Iyer',email:'meera.iyer.biz@gmail.com',phone:'+91 85432 10987',location:'Chennai, Tamil Nadu',linkedin:'linkedin.com/in/meeraiyer-bd',title:'Business Development Manager',summary:'Business Development professional with 7 years closing enterprise deals in SaaS. Generated $25M+ in new ARR. Consistent top performer — exceeded quota 6 consecutive years.'},skills:{technical:['Enterprise Sales','Solution Selling','Account Management','Pipeline Management'],soft:['Negotiation','Relationship Building','Presentation'],tools:['Salesforce','HubSpot','LinkedIn Sales Navigator','ZoomInfo']},experience:[{role:'Business Development Manager',company:'Zoho Corporation',location:'Chennai',startDate:'Apr 2020',endDate:'',current:true,description:'Grew enterprise segment from $2M to $8M ARR in 3 years.',bullets:['Closed 3 deals >$1M TCV with Fortune 500 companies','Maintained 118% of quota for 3 consecutive years']}],education:[{institution:'ISB Hyderabad',degree:'MBA',field:'Marketing & Strategy',startYear:'2015',endYear:'2017',gpa:''},{institution:'Stella Maris College',degree:'B.Com',field:'Commerce',startYear:'2012',endYear:'2015',gpa:''}],projects:[]} },
  { id:9,  filename:'business_04_karan_malhotra.pdf',        name:'Karan Malhotra',       title:'Human Resources Manager',             category:'business',   level:'mid',    ats:93,
    data:{ personal:{name:'Karan Malhotra',email:'karan.malhotra.hr@gmail.com',phone:'+91 93210 98765',location:'Delhi, NCR',linkedin:'linkedin.com/in/karanmalhotra-hr',title:'HR Manager',summary:'HR leader with 9 years building high-performing cultures in tech startups. Scaled two companies from 50 to 500 employees. Expert in talent acquisition and organizational design.'},skills:{technical:['Talent Acquisition','Performance Management','L&D','Comp & Benefits'],soft:['Culture Building','Coaching','Change Management'],tools:['Workday','Darwinbox','Keka','LinkedIn Recruiter']},experience:[{role:'HR Manager',company:'Swiggy',location:'Bangalore',startDate:'Feb 2020',endDate:'',current:true,description:'Scaled tech hiring from 80 to 350 engineers in 18 months during hypergrowth.',bullets:['Reduced time-to-hire from 65 days to 28 days','Built diversity program increasing women in tech from 18% to 34%']}],education:[{institution:'TISS Mumbai',degree:'MBA',field:'Human Resources',startYear:'2013',endYear:'2015',gpa:''},{institution:'Delhi University',degree:'B.A.',field:'Psychology',startYear:'2010',endYear:'2013',gpa:''}],projects:[]} },
  { id:10, filename:'business_05_divya_nambiar.pdf',         name:'Divya Nambiar',        title:'Marketing Manager',                   category:'business',   level:'mid',    ats:92,
    data:{ personal:{name:'Divya Nambiar',email:'divya.nambiar.mkt@gmail.com',phone:'+91 79876 54321',location:'Bangalore, Karnataka',linkedin:'linkedin.com/in/divyanambiar-marketing',title:'Marketing Manager',summary:'Performance-driven Marketing Manager with 6 years in digital marketing. Managed $5M+ annual media budgets. Grew organic traffic 8x at two startups.'},skills:{technical:['SEO/SEM','Performance Marketing','Email Marketing','Content Strategy'],soft:['Brand Storytelling','Creative Direction'],tools:['Google Analytics','HubSpot','Semrush','Meta Ads','Google Ads','Mixpanel']},experience:[{role:'Marketing Manager',company:'CRED',location:'Bangalore',startDate:'Jun 2021',endDate:'',current:true,description:'Managed ₹40Cr annual performance marketing budget with 3.2x ROAS.',bullets:['Grew SEO traffic from 200K to 1.6M monthly visitors in 18 months','Launched referral program acquiring 500K users at 60% lower CAC']}],education:[{institution:'SP Jain Institute',degree:'MBA',field:'Marketing',startYear:'2017',endYear:'2019',gpa:''},{institution:'Symbiosis Pune',degree:'B.Sc',field:'Mass Communication',startYear:'2014',endYear:'2017',gpa:''}],projects:[]} },
  { id:11, filename:'finance_01_aditya_gupta.pdf',           name:'Aditya Gupta',         title:'CA & Finance Manager',                category:'finance',    level:'senior', ats:96,
    data:{ personal:{name:'Aditya Gupta',email:'aditya.gupta.ca@gmail.com',phone:'+91 98901 23456',location:'Mumbai, Maharashtra',linkedin:'linkedin.com/in/adityagupta-ca',title:'CA & Finance Manager',summary:'CA with 8 years in financial reporting and taxation for listed companies and Big 4. Managed ₹2500Cr balance sheet. Expert in Ind AS/IFRS, GST, and direct tax.'},skills:{technical:['Ind AS/IFRS','Financial Reporting','Consolidation','Audit','Direct Tax','GST'],soft:['Attention to Detail','Stakeholder Communication'],tools:['SAP FICO','Tally ERP','Advanced Excel','Power BI']},experience:[{role:'Finance Manager',company:'Tata Consumer Products',location:'Mumbai',startDate:'Apr 2020',endDate:'',current:true,description:'Managed statutory and management reporting for ₹2500Cr revenue business unit.',bullets:['Led Ind AS 116 implementation across 85 entities saving ₹12Cr in tax','Drove working capital optimization reducing cash conversion cycle by 18 days']}],education:[{institution:'ICAI',degree:'Chartered Accountant',field:'Finance',startYear:'2013',endYear:'2016',gpa:'AIR 28'},{institution:'SRCC Delhi University',degree:'B.Com (Hons)',field:'Commerce',startYear:'2010',endYear:'2013',gpa:'First Class'}],projects:[]} },
  { id:12, filename:'finance_02_sunita_rao.pdf',             name:'Sunita Rao',           title:'Investment Banking Analyst',          category:'finance',    level:'mid',    ats:95,
    data:{ personal:{name:'Sunita Rao',email:'sunita.rao.ib@gmail.com',phone:'+91 87901 23456',location:'Mumbai, Maharashtra',linkedin:'linkedin.com/in/sunitarao-ib',title:'Investment Banking Analyst',summary:'Investment Banking professional with 5 years executing M&A, ECM, and DCM transactions worth $4B+. MBA from IIM Calcutta. CFA Charterholder.'},skills:{technical:['M&A Advisory','ECM/DCM','DCF Valuation','LBO Modeling','Merger Models'],soft:['Client Management','Presentation','Attention to Detail'],tools:['Bloomberg','Capital IQ','FactSet','Advanced Excel','PowerPoint']},experience:[{role:'Associate – Investment Banking',company:'Kotak Investment Banking',location:'Mumbai',startDate:'Jul 2021',endDate:'',current:true,description:'Executed $1.8B acquisition — largest India deal 2023.',bullets:['Managed IPO process for 3 companies raising ₹4200Cr total','Built complex merger models for C-suite strategic decisions']}],education:[{institution:'IIM Calcutta',degree:'MBA',field:'Finance',startYear:'2017',endYear:'2019',gpa:'3.9/4.0'},{institution:'IIT Madras',degree:'B.Tech',field:'Computer Science',startYear:'2013',endYear:'2017',gpa:'9.2/10'}],projects:[]} },
  { id:13, filename:'finance_03_amit_joshi.pdf',             name:'Amit Joshi',           title:'FP&A Manager',                        category:'finance',    level:'mid',    ats:94,
    data:{ personal:{name:'Amit Joshi',email:'amit.joshi.fpa@outlook.com',phone:'+91 76890 12345',location:'Pune, Maharashtra',linkedin:'linkedin.com/in/amitjoshi-fpa',title:'FP&A Manager',summary:'FP&A professional with 7 years partnering with business leaders through data-driven insights. Expert in financial modeling and strategic planning for $200M+ revenue businesses.'},skills:{technical:['Budgeting & Forecasting','Variance Analysis','Strategic Planning','Financial Modeling'],soft:['Business Partnering','Analytical Thinking'],tools:['Anaplan','SAP BPC','Hyperion','Power BI','Tableau']},experience:[{role:'FP&A Manager',company:'Bajaj Auto',location:'Pune',startDate:'Mar 2020',endDate:'',current:true,description:'Led annual budgeting for ₹35,000Cr revenue business with 500+ cost centers.',bullets:['Built rolling forecast model improving accuracy from 78% to 94%','Identified ₹220Cr cost reduction through zero-based budgeting']}],education:[{institution:'Symbiosis Institute of Business Management',degree:'MBA',field:'Finance',startYear:'2015',endYear:'2017',gpa:''},{institution:'Fergusson College',degree:'B.Com (Hons)',field:'Commerce',startYear:'2012',endYear:'2015',gpa:''}],projects:[]} },
  { id:14, filename:'finance_04_pooja_desai.pdf',            name:'Pooja Desai',          title:'Risk & Compliance Manager',           category:'finance',    level:'senior', ats:93,
    data:{ personal:{name:'Pooja Desai',email:'pooja.desai.risk@gmail.com',phone:'+91 98654 32109',location:'Mumbai, Maharashtra',linkedin:'linkedin.com/in/poojadesai-risk',title:'Risk & Compliance Manager',summary:'Risk and Compliance professional with 8 years in banking. Expert in credit risk, operational risk, and regulatory compliance (RBI, SEBI, Basel III). Led compliance for ₹5000Cr AUM NBFC.'},skills:{technical:['Credit Risk','Operational Risk','Market Risk','RBI Regulations','SEBI Guidelines','AML/KYC'],soft:['Regulatory Liaison','Report Writing'],tools:['SAS Risk Management','Moody\'s Analytics','Power BI','Excel']},experience:[{role:'Risk & Compliance Manager',company:'Piramal Finance',location:'Mumbai',startDate:'Jun 2019',endDate:'',current:true,description:'Built enterprise risk framework for ₹5000Cr AUM wholesale lending business.',bullets:['Reduced NPA ratio from 4.2% to 2.1% through improved underwriting models','Managed RBI inspection — zero major observations in 2022 and 2023']}],education:[{institution:'ICAI',degree:'Chartered Accountant',field:'Finance',startYear:'2013',endYear:'2016',gpa:''},{institution:'Narsee Monjee College',degree:'B.Com',field:'Commerce',startYear:'2010',endYear:'2013',gpa:''}],projects:[]} },
  { id:15, filename:'finance_05_rohan_bhat.pdf',             name:'Rohan Bhat',           title:'Tax Consultant',                      category:'finance',    level:'mid',    ats:92,
    data:{ personal:{name:'Rohan Bhat',email:'rohan.bhat.tax@gmail.com',phone:'+91 88654 21098',location:'Bangalore, Karnataka',linkedin:'linkedin.com/in/rohanbhat-tax',title:'Tax Consultant',summary:'Tax professional with 6 years in direct and indirect taxation for MNCs and startups. Managed tax planning for ₹500Cr+ companies. Expert in transfer pricing and GST.'},skills:{technical:['Corporate Tax','Transfer Pricing','International Tax','GST','Tax Litigation'],soft:['Client Advisory','Legal Research'],tools:['SAP','GSTN Portal','Income Tax Portal','Compliance Software']},experience:[{role:'Tax Manager',company:'Ernst & Young (EY India)',location:'Bangalore',startDate:'Sep 2021',endDate:'',current:true,description:'Managed tax compliance for 20+ MNC clients across technology and manufacturing.',bullets:['Led transfer pricing documentation for client with $500M intercompany transactions','Secured ₹35Cr tax refund through successful appeal']}],education:[{institution:'ICAI',degree:'Chartered Accountant',field:'Finance',startYear:'2015',endYear:'2018',gpa:''},{institution:'Christ University',degree:'B.Com',field:'Commerce',startYear:'2012',endYear:'2015',gpa:''}],projects:[]} },
  { id:16, filename:'education_01_lakshmi_subramaniam.pdf',  name:'Lakshmi Subramaniam', title:'Senior School Teacher – Mathematics', category:'education',  level:'senior', ats:95,
    data:{ personal:{name:'Lakshmi Subramaniam',email:'lakshmi.sub.teacher@gmail.com',phone:'+91 97543 21876',location:'Chennai, Tamil Nadu',linkedin:'linkedin.com/in/lakshmisubramaniam-edu',title:'Senior School Teacher – Mathematics',summary:'Dedicated Mathematics educator with 12 years transforming students\' relationship with numbers. National Award for Teachers recipient. Improved board exam scores by 40%.'},skills:{technical:['Curriculum Design','Differentiated Instruction','STEM Integration','Inquiry-Based Learning'],soft:['Patience','Communication','Mentoring'],tools:['Google Classroom','Khan Academy','Desmos','GeoGebra','Smart Board']},experience:[{role:'Senior Mathematics Teacher',company:'DAV Senior Secondary School',location:'Chennai',startDate:'Jul 2015',endDate:'',current:true,description:'Taught Mathematics to 400+ students annually across Class 9–12 (CBSE).',bullets:['Improved Class 12 board exam pass rate from 78% to 97%','Developed workbooks adopted by 8 schools in the DAV network']}],education:[{institution:'University of Madras',degree:'M.Sc',field:'Mathematics',startYear:'2010',endYear:'2012',gpa:'First Class Distinction'},{institution:'Stella Maris College',degree:'B.Sc',field:'Mathematics',startYear:'2007',endYear:'2010',gpa:''}],projects:[]} },
  { id:17, filename:'education_02_dr_suresh_pillai.pdf',     name:'Dr. Suresh Pillai',   title:'Associate Professor – CS',            category:'education',  level:'lead',   ats:94,
    data:{ personal:{name:'Dr. Suresh Pillai',email:'drsuresh.pillai@university.edu',phone:'+91 94321 09876',location:'Kochi, Kerala',linkedin:'linkedin.com/in/drsureshpillai-cs',title:'Associate Professor – Computer Science',summary:'Associate Professor with 14 years in academia. PhD in Distributed Systems from IIT Madras. Published 28 research papers (Scopus indexed). Secured ₹1.2Cr in research grants.'},skills:{technical:['Cloud Computing','Distributed Systems','Algorithms','Machine Learning','Operating Systems'],soft:['Research','Academic Writing','Mentoring'],tools:['MATLAB','Python','R','LaTeX','SPSS']},experience:[{role:'Associate Professor – Computer Science',company:'College of Engineering Trivandrum',location:'Kochi',startDate:'Jan 2018',endDate:'',current:true,description:'Teaching UG and PG courses in Cloud Computing, Distributed Systems, and ML.',bullets:['Supervised 12 M.Tech theses and 2 PhD scholars','Published 18 papers in Q1/Q2 Scopus journals since 2018','Secured ₹80L DST research grant on Edge Computing']}],education:[{institution:'IIT Madras',degree:'PhD',field:'Distributed Systems',startYear:'2009',endYear:'2012',gpa:''},{institution:'NIT Calicut',degree:'M.Tech',field:'Computer Science',startYear:'2005',endYear:'2007',gpa:''}],projects:[]} },
  { id:18, filename:'education_03_nandini_chopra.pdf',       name:'Nandini Chopra',      title:'Primary School Teacher',              category:'education',  level:'mid',    ats:93,
    data:{ personal:{name:'Nandini Chopra',email:'nandini.chopra.edu@gmail.com',phone:'+91 83456 78901',location:'New Delhi',linkedin:'linkedin.com/in/nandinichopra-teacher',title:'Primary School Teacher & Curriculum Designer',summary:'Passionate primary educator with 9 years creating joyful, inquiry-based learning environments. Montessori certified. Designed curriculum adopted by 40 schools in Delhi.'},skills:{technical:['Child-Centered Learning','Montessori Method','Project-Based Learning','Curriculum Design','IEP Development'],soft:['Empathy','Creativity','Parent Communication'],tools:['Google Classroom','Seesaw','Padlet','Canva for Education']},experience:[{role:'Senior Primary Teacher & Curriculum Coordinator',company:'The Shri Ram School',location:'New Delhi',startDate:'Apr 2018',endDate:'',current:true,description:'Teaching Classes 1–5 English and EVS to 120+ students.',bullets:['Designed integrated thematic curriculum adopted across 4 school branches','Established inclusive practices supporting 12 students with learning differences']}],education:[{institution:'IGNOU',degree:'M.Ed',field:'Early Childhood Education',startYear:'2015',endYear:'2017',gpa:''},{institution:'Miranda House, Delhi University',degree:'B.A.',field:'English Literature',startYear:'2011',endYear:'2014',gpa:''}],projects:[]} },
  { id:19, filename:'education_04_ravi_shankar.pdf',         name:'Ravi Shankar',        title:'School Principal',                    category:'education',  level:'lead',   ats:92,
    data:{ personal:{name:'Ravi Shankar',email:'ravi.shankar.principal@gmail.com',phone:'+91 99432 10876',location:'Hyderabad, Telangana',linkedin:'linkedin.com/in/ravishankar-principal',title:'School Principal & Education Administrator',summary:'Experienced school administrator with 20 years, including 8 years as Principal. Transformed a struggling school from C-grade to A+ CBSE accreditation. MBA in Education Management.'},skills:{technical:['School Management','Academic Planning','Staff Development','Budget Management','Quality Assurance'],soft:['Visionary Leadership','Stakeholder Engagement'],tools:['CBSE Compliance','ISO 9001','School ERP Systems']},experience:[{role:'Principal',company:'Glendale Academy CBSE School',location:'Hyderabad',startDate:'Apr 2016',endDate:'',current:true,description:'Led transformation from C-grade to A+ CBSE school in 3 years (1200 students).',bullets:['Increased enrolment from 800 to 1800 students','Reduced teacher attrition from 30% to 8%']}],education:[{institution:'IGNOU',degree:'MBA',field:'Education Management',startYear:'2009',endYear:'2011',gpa:''},{institution:'Osmania University',degree:'M.Ed',field:'Education',startYear:'2002',endYear:'2004',gpa:''}],projects:[]} },
  { id:20, filename:'education_05_aparna_menon.pdf',         name:'Aparna Menon',        title:'Corporate Trainer & L&D Specialist',  category:'education',  level:'senior', ats:91,
    data:{ personal:{name:'Aparna Menon',email:'aparna.menon.trainer@gmail.com',phone:'+91 91234 56789',location:'Kochi, Kerala',linkedin:'linkedin.com/in/aparname-trainer',title:'Corporate Trainer & L&D Specialist',summary:'Corporate Training professional with 10 years designing impactful L&D programs. Trained 15,000+ professionals across Fortune 500 companies. ATD Master Trainer certified.'},skills:{technical:['Instructional Design','Facilitation','Train the Trainer','E-Learning Design','Kirkpatrick Model'],soft:['Public Speaking','Empathy','Storytelling'],tools:['Articulate 360','Adobe Captivate','Moodle LMS','Kahoot','Mentimeter']},experience:[{role:'Senior L&D Manager',company:'Wipro',location:'Kochi',startDate:'Feb 2019',endDate:'',current:true,description:'Designed and delivered leadership program for 500 mid-managers across 12 locations.',bullets:['Built e-learning library of 120+ modules used by 45,000 employees','Saved ₹2.5Cr annually by converting to blended learning']}],education:[{institution:'Calicut University',degree:'M.A.',field:'English & Communication',startYear:'2012',endYear:'2014',gpa:''},{institution:'St. Teresa\'s College',degree:'B.A.',field:'English Literature',startYear:'2009',endYear:'2012',gpa:''}],projects:[]} },
  { id:21, filename:'freshers_01_rohan_verma.pdf',           name:'Rohan Verma',         title:'Fresher – CS Engineer',               category:'freshers',   level:'fresher',ats:88,
    data:{ personal:{name:'Rohan Verma',email:'rohan.verma.cs22@gmail.com',phone:'+91 89012 34567',location:'Jaipur, Rajasthan',linkedin:'linkedin.com/in/rohanverma-cs',github:'github.com/rohanverma-codes',title:'Computer Science Engineer',summary:'Passionate CS graduate from NIT Jaipur with strong DSA and full-stack skills. Built 4 projects with 500+ GitHub stars. SIH 2023 Grand Finalist. Seeking Software Developer role.'},skills:{technical:['C++','Python','JavaScript','Java','React','Node.js','Express'],soft:['Problem Solving','Quick Learning','Teamwork'],tools:['Git','VS Code','Postman','Linux','MySQL','MongoDB','Firebase']},experience:[{role:'Software Development Intern',company:'Juspay Technologies',location:'Bangalore (Remote)',startDate:'May 2023',endDate:'Jul 2023',current:false,description:'Built REST APIs for payment gateway SDK reducing integration time by 25%.',bullets:['Implemented Redis caching cutting API response time by 40%','Fixed 15 bugs in production React dashboard']}],education:[{institution:'NIT Jaipur',degree:'B.Tech',field:'Computer Science',startYear:'2020',endYear:'2024',gpa:'8.6/10'}],projects:[{name:'CodeCollab',description:'Real-time collaborative code editor supporting 10+ languages — 300+ GitHub stars',technologies:['React','Node.js','Socket.io','Monaco Editor'],url:'github.com/rohanverma-codes/codecollab'},{name:'StudyBuddy AI',description:'AI-powered study assistant — built in 48hr hackathon, won 2nd prize',technologies:['Python','OpenAI API','Flask'],url:''}]} },
  { id:22, filename:'freshers_02_ishaan_kapoor.pdf',         name:'Ishaan Kapoor',       title:'Fresher – Data Science',              category:'freshers',   level:'fresher',ats:87,
    data:{ personal:{name:'Ishaan Kapoor',email:'ishaan.kapoor.ds@gmail.com',phone:'+91 78901 23456',location:'Chandigarh, Punjab',linkedin:'linkedin.com/in/ishaankapoor-ds',github:'github.com/ishaankapoor-ml',title:'Data Science & Analytics',summary:'Data Science graduate with ML and statistical analysis experience. Built predictive models with 92%+ accuracy. Kaggle Expert (top 8%). Looking for Data Analyst / Data Scientist role.'},skills:{technical:['Machine Learning','Statistical Analysis','A/B Testing','Python','R','SQL'],soft:['Analytical Thinking','Data Storytelling'],tools:['Pandas','NumPy','Scikit-learn','TensorFlow','Tableau','Power BI','BigQuery']},experience:[{role:'Data Science Intern',company:'Groww',location:'Bangalore (Hybrid)',startDate:'Jun 2023',endDate:'Aug 2023',current:false,description:'Built churn prediction model with 89% accuracy identifying at-risk investors.',bullets:['Performed cohort analysis on 500K users revealing key retention drivers','Created Tableau dashboard for retention KPIs']}],education:[{institution:'BITS Pilani Goa',degree:'B.Sc',field:'Data Science & AI',startYear:'2020',endYear:'2024',gpa:'8.4/10'}],projects:[{name:'CreditRisk ML',description:'Loan default prediction — 92.3% AUC, deployed as web app',technologies:['Python','XGBoost','SHAP','Streamlit'],url:'github.com/ishaankapoor-ml/creditrisk'}]} },
  { id:23, filename:'freshers_03_tanvi_shah.pdf',            name:'Tanvi Shah',          title:'Fresher – MBA Marketing',             category:'freshers',   level:'fresher',ats:86,
    data:{ personal:{name:'Tanvi Shah',email:'tanvi.shah.mba@gmail.com',phone:'+91 96789 01234',location:'Ahmedabad, Gujarat',linkedin:'linkedin.com/in/tanvishah-marketing',title:'MBA Marketing Graduate',summary:'MBA Marketing graduate from NMIMS. Strong in digital marketing, brand management, and consumer research. Completed 3 internships. Grew D2C brand social following by 300%.'},skills:{technical:['Digital Marketing','Brand Management','Consumer Research','Campaign Planning','Social Media Marketing'],soft:['Creativity','Communication','Market Insight'],tools:['Google Analytics','Meta Ads','Canva','HubSpot','Mailchimp']},experience:[{role:'Marketing Intern',company:'Marico Limited',location:'Mumbai',startDate:'Apr 2023',endDate:'Jun 2023',current:false,description:'Assisted in brand planning for Saffola and ran social media campaigns.',bullets:['Campaign achieved 2.3M impressions','Conducted 80+ consumer interviews for product concept testing']}],education:[{institution:'NMIMS Mumbai',degree:'MBA',field:'Marketing',startYear:'2022',endYear:'2024',gpa:'3.7/4.0'},{institution:'HL College of Commerce',degree:'B.Com',field:'Commerce',startYear:'2019',endYear:'2022',gpa:'First Class'}],projects:[{name:'D2C Growth Strategy',description:'Grew skincare D2C brand revenue by 40% in 3 months through digital marketing',technologies:['Google Ads','Meta Ads','Email Marketing'],url:''}]} },
  { id:24, filename:'freshers_04_ayesha_khan.pdf',           name:'Ayesha Khan',         title:'Fresher – Civil Engineer',            category:'freshers',   level:'fresher',ats:85,
    data:{ personal:{name:'Ayesha Khan',email:'ayesha.khan.civil@gmail.com',phone:'+91 85678 90123',location:'Lucknow, Uttar Pradesh',linkedin:'linkedin.com/in/ayeshakhan-civil',title:'Civil Engineer',summary:'Civil Engineering graduate with strong foundation in structural design and AutoCAD. Completed 6-month internship with L&T Construction on metro rail project. GATE 2024 qualified.'},skills:{technical:['Structural Analysis','RCC Design','AutoCAD','STAAD.Pro','Revit','Project Planning'],soft:['Detail-Oriented','Site Coordination'],tools:['AutoCAD','STAAD.Pro','ETABS','Revit','MS Project']},experience:[{role:'Site Engineering Intern',company:'Larsen & Toubro Construction',location:'Lucknow Metro Project',startDate:'Jan 2024',endDate:'Jun 2024',current:false,description:'Assisted resident engineer in daily site supervision for 2km elevated viaduct section.',bullets:['Prepared daily progress reports and quality control checklists','Coordinated rebar placement and concrete pouring for 8 pier foundations']}],education:[{institution:'KNIT Sultanpur (UPTU)',degree:'B.Tech',field:'Civil Engineering',startYear:'2020',endYear:'2024',gpa:'8.1/10'}],projects:[{name:'Seismic Analysis of G+10 RCC Frame',description:'B.Tech thesis — comparative study of regular vs. irregular frames in Zone IV',technologies:['STAAD.Pro','IS 1893'],url:''}]} },
  { id:25, filename:'freshers_05_harsh_agarwal.pdf',         name:'Harsh Agarwal',       title:'Fresher – CA Aspirant',               category:'freshers',   level:'fresher',ats:84,
    data:{ personal:{name:'Harsh Agarwal',email:'harsh.agarwal.ca@gmail.com',phone:'+91 73456 78901',location:'Jaipur, Rajasthan',linkedin:'linkedin.com/in/harshagarwal-ca',title:'Commerce Graduate & CA Aspirant',summary:'B.Com graduate with CA Inter cleared (Both Groups) and 1 year articleship. Strong in accounting, audit, and taxation. Cleared CA Foundation in first attempt. Seeking articleship or junior accounting role.'},skills:{technical:['Financial Accounting','Cost Accounting','Tally ERP','Internal Audit','Statutory Audit','GST Filing'],soft:['Accuracy','Compliance Mindset'],tools:['Tally Prime','Advanced Excel','Income Tax Portal','GSTN Portal','SAP Basics']},experience:[{role:'Article Assistant',company:'M/s Agarwal & Associates, CAs',location:'Jaipur',startDate:'Jan 2023',endDate:'',current:true,description:'Assisted in statutory audits of 12 SME companies across manufacturing and trading.',bullets:['Prepared GST returns for 25+ clients monthly','Filed income tax returns for 40+ individuals and companies']}],education:[{institution:'ICAI',degree:'CA Inter',field:'Both Groups Cleared',startYear:'2022',endYear:'2023',gpa:'56% (Nov 2023)'},{institution:'University of Rajasthan',degree:'B.Com (Hons)',field:'Commerce',startYear:'2019',endYear:'2022',gpa:'First Division – 74%'}],projects:[]} },
];

// ── Template Card ──────────────────────────────────────────────────────────
function TemplateCard({ t, onSelect }) {
  const ref = useRef(null);
  const [h, setH] = useState(false);
  const onMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; setH(false); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseEnter={() => setH(true)}
      style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: `1px solid ${h ? t.color + '66' : 'rgba(255,255,255,0.07)'}`, transition: 'all .3s ease', transform: h ? 'scale(1.02)' : 'scale(1)', boxShadow: h ? `0 20px 60px ${t.color}22` : '0 4px 20px rgba(0,0,0,0.3)', transformStyle: 'preserve-3d', animation: 'fadeUp .6s ease both' }}>
      <div style={{ height: 200, background: `linear-gradient(135deg,${t.color}22,${t.color2}33)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 130, height: 170, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', transform: h ? 'scale(1.05) rotateZ(-1deg)' : 'scale(1)', transition: 'transform .3s ease' }}>
          <div style={{ height: 6, borderRadius: 3, background: `linear-gradient(90deg,${t.color},${t.color2})` }} />
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', width: '60%' }} />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
          {[65, 80, 55, 70, 60].map((w, i) => <div key={i} style={{ height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.07)', width: `${w}%` }} />)}
        </div>
        {t.tag && <div style={{ position: 'absolute', top: 12, right: 12, padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: t.tag === 'Most Popular' ? 'rgba(59,130,246,0.3)' : t.tag === 'New' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)', color: t.tag === 'Most Popular' ? '#60A5FA' : t.tag === 'New' ? '#34D399' : '#A78BFA', border: `1px solid ${t.tag === 'Most Popular' ? '#3B82F6' : t.tag === 'New' ? '#10B981' : '#8B5CF6'}44` }}>{t.tag}</div>}
      </div>
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{t.category}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>{t.atsScore}% ATS</div>
            <div style={{ fontSize: 10, color: '#475569' }}>Score</div>
          </div>
        </div>
        <button onClick={() => onSelect(t)} style={{ width: '100%', padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', background: h ? `linear-gradient(135deg,${t.color},${t.color2})` : 'rgba(255,255,255,0.06)', color: h ? '#fff' : '#94A3B8', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .3s ease' }}>
          {h ? 'Use This Template →' : 'Select Template'}
        </button>
      </div>
    </div>
  );
}

// ── Sample Card ────────────────────────────────────────────────────────────
function SampleCard({ s, onPreview, onUseAsTemplate }) {
  const [h, setH] = useState(false);
  const color = LEVEL_COLORS[s.level] || '#3B82F6';
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: `1px solid ${h ? color + '55' : 'rgba(255,255,255,0.07)'}`, transition: 'all .3s ease', transform: h ? 'translateY(-3px)' : 'none', boxShadow: h ? `0 16px 40px ${color}18` : 'none', animation: 'fadeUp .5s ease both' }}>
      {/* Thumbnail */}
      <div style={{ height: 170, background: `linear-gradient(135deg,${color}18,${color}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: 110, height: 148, background: 'white', borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ height: 5, borderRadius: 3, background: color }} />
          <div style={{ height: 3, borderRadius: 2, background: '#e2e8f0', width: '65%' }} />
          <div style={{ height: 2, borderRadius: 1, background: '#f1f5f9', width: '45%' }} />
          <div style={{ height: 1, background: '#e2e8f0', margin: '3px 0' }} />
          {[70, 90, 60, 80, 55, 75, 50].map((w, i) => <div key={i} style={{ height: 2, borderRadius: 1, background: i % 3 === 0 ? '#e2e8f0' : '#f8fafc', width: `${w}%` }} />)}
          <div style={{ marginTop: 3, height: 2, borderRadius: 1, background: color, width: '35%', opacity: .5 }} />
        </div>
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: `${color}25`, color, border: `1px solid ${color}44`, textTransform: 'capitalize' }}>{s.level}</div>
        <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>ATS {s.ats}%</div>
      </div>
      {/* Info */}
      <div style={{ padding: '13px 16px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{s.name}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>{s.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onPreview(s)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#F1F5F9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}>
            👁 Preview
          </button>
          <button onClick={() => onUseAsTemplate(s)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg,${color},${color}bb)`, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', boxShadow: h ? `0 4px 15px ${color}44` : 'none' }}>
            ✏️ Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PDF Preview Modal ──────────────────────────────────────────────────────
function PreviewModal({ sample, onClose, onEdit }) {
  const color = LEVEL_COLORS[sample.level] || '#3B82F6';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 900, height: '90vh', background: '#0D1525', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{sample.name}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>{sample.title} · <span style={{ color, textTransform: 'capitalize' }}>{sample.level}</span> · ATS {sample.ats}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => { onEdit(sample); onClose(); }} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${color},${color}bb)`, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
              ✏️ Use & Edit This Resume
            </button>
            <a href={`${API}/samples/${sample.filename}`} target="_blank" rel="noreferrer" style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ⬇ Download
            </a>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#64748B', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}>✕</button>
          </div>
        </div>
        {/* PDF iframe */}
        <iframe src={`${API}/samples/${sample.filename}`} style={{ flex: 1, border: 'none', background: 'white' }} title={sample.name} />
      </div>
    </div>
  );
}

// ── Main TemplatesPage ─────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templateFilter, setTemplateFilter] = useState('All');
  const [sampleFilter, setSampleFilter] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [previewSample, setPreviewSample] = useState(null);
  const { isAuthenticated } = useAuth();
  const { loadResume } = useResume();
  const navigate = useNavigate();

  useEffect(() => {
    templateAPI.list()
      .then(r => setTemplates(r.data.templates || []))
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  const filteredTemplates = templateFilter === 'All'
    ? templates
    : templates.filter(t => t.category === templateFilter || t.category === 'All');

  const filteredSamples = sampleFilter === 'all'
    ? SAMPLES
    : SAMPLES.filter(s => s.category === sampleFilter);

  const handleSelectTemplate = (t) => {
    if (!isAuthenticated) { toast.error('Sign in to start building'); navigate('/auth'); return; }
    navigate(`/builder?template=${t.id}&color=${encodeURIComponent(t.color)}`);
  };

  const handleUseAsTemplate = (sample) => {
    if (!isAuthenticated) { toast.error('Sign in to use this resume'); navigate('/auth'); return; }
    // Load sample data into resume context and open builder
    loadResume({
      ...sample.data,
      title: `${sample.name} Resume`,
      template: 'modern',
      templateColor: LEVEL_COLORS[sample.level] || '#3B82F6',
    });
    toast.success(`Loaded ${sample.name}'s resume — customize it!`);
    navigate('/builder');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 40, lineHeight: 1.1, marginBottom: 14 }}>
            Templates & <span className="gradient-text">Sample Resumes</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 16 }}>Choose a design template or start from a real-world example — then edit it your way</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 6, width: 'fit-content', margin: '0 auto 44px' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: activeTab === tab.id ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'transparent', color: activeTab === tab.id ? '#fff' : '#64748B', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8, boxShadow: activeTab === tab.id ? '0 4px 15px rgba(59,130,246,0.3)' : 'none' }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── DESIGN TEMPLATES TAB ── */}
        {activeTab === 'templates' && (
          <>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
              {TEMPLATE_CATEGORIES.map(c => (
                <button key={c} onClick={() => setTemplateFilter(c)} style={{ padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: templateFilter === c ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'rgba(255,255,255,0.04)', color: templateFilter === c ? '#fff' : '#64748B', border: templateFilter === c ? 'none' : '1px solid rgba(255,255,255,0.08)', transition: 'all .2s' }}>{c}</button>
              ))}
            </div>
            {loadingTemplates ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
                {filteredTemplates.map(t => <TemplateCard key={t.id} t={t} onSelect={handleSelectTemplate} />)}
              </div>
            )}
          </>
        )}

        {/* ── RESUME SAMPLES TAB ── */}
        {activeTab === 'samples' && (
          <>
            {/* Info banner */}
            <div style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>
                Click <strong style={{ color: '#F1F5F9' }}>👁 Preview</strong> to view the full PDF. Click <strong style={{ color: '#F1F5F9' }}>✏️ Edit</strong> to load it into the builder and customize it as your own resume.
              </p>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
              {SAMPLE_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setSampleFilter(c.id)} style={{ padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: sampleFilter === c.id ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'rgba(255,255,255,0.04)', color: sampleFilter === c.id ? '#fff' : '#64748B', border: sampleFilter === c.id ? 'none' : '1px solid rgba(255,255,255,0.08)', transition: 'all .2s' }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Count */}
            <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginBottom: 28 }}>
              Showing {filteredSamples.length} sample{filteredSamples.length !== 1 ? 's' : ''}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
              {filteredSamples.map(s => (
                <SampleCard key={s.id} s={s} onPreview={setPreviewSample} onUseAsTemplate={handleUseAsTemplate} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewSample && (
        <PreviewModal
          sample={previewSample}
          onClose={() => setPreviewSample(null)}
          onEdit={handleUseAsTemplate}
        />
      )}
    </div>
  );
}