// TEMPORARY — delete after log test. Safe: no DB access, always returns 200.
const { log } = require('./_lib');

module.exports = (req, res) => {
  log('TEST', 'INFO',  'Test info log  — everything is working normally', { note: 'safe to ignore' });
  log('TEST', 'WARN',  'Test warn log  — this is just a drill',           { note: 'safe to ignore' });
  log('TEST', 'ERROR', 'Test error log — this is just a drill',           { note: 'safe to ignore' });
  res.status(200).json({ ok: true, message: 'Test logs fired — check Vercel logs for [TEST] entries.' });
};
