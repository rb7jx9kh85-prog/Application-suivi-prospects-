module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const gh = process.env.GITHUB_TOKEN || ''
  return res.status(200).json({
    GITHUB_TOKEN: !!gh,
    GITHUB_TOKEN_prefix: gh ? gh.slice(0, 10) + '...' : 'NON DEFINI',
    APP_SECRET: !!process.env.APP_SECRET,
  })
}
