const r = require('express').Router();
const TEMPLATES = [
  { id:'modern', name:'Modern Pro', color:'#3B82F6', color2:'#8B5CF6', category:'Tech', atsScore:98, tag:'Most Popular' },
  { id:'executive', name:'Executive', color:'#0F172A', color2:'#1E293B', category:'Business', atsScore:95, tag:'Premium' },
  { id:'creative', name:'Creative Flow', color:'#EC4899', color2:'#8B5CF6', category:'Design', atsScore:87, tag:'New' },
  { id:'minimal', name:'Minimal Clean', color:'#10B981', color2:'#06B6D4', category:'All', atsScore:96, tag:'Trending' },
  { id:'academic', name:'Academic', color:'#F59E0B', color2:'#EF4444', category:'Research', atsScore:94, tag:'' },
  { id:'startup', name:'Startup Hustle', color:'#6366F1', color2:'#EC4899', category:'Tech', atsScore:91, tag:'' },
];
r.get('/', (req, res) => {
  const { category } = req.query;
  res.json({ templates: category && category!=='All' ? TEMPLATES.filter(t => t.category===category||t.category==='All') : TEMPLATES });
});
r.get('/:id', (req, res) => {
  const t = TEMPLATES.find(t => t.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json({ template: t });
});
module.exports = r;
