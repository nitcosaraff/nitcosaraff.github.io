const fetch = require('node-fetch');

exports.handler = async () => {
  const owner = 'nitcosaraff';
  const repo = 'nitcosaraff.github.io';
  const path = 'doctors.json';
  const token = process.env.GITHUB_TOKEN;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    const data = await res.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString());
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // ⭐ مهم جداً
        'Access-Control-Allow-Origin': '*' // ⭐ للسماح بـ CORS
      },
      body: JSON.stringify(content)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, doctors: [] })
    };
  }
};
