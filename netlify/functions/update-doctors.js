const fetch = require('node-fetch');

exports.handler = async (event) => {
  // السماح فقط لـ POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { action, code } = JSON.parse(event.body);
  const owner = 'nitcosaraff';
  const repo = 'nitcosaraff.github.io';
  const path = 'doctors.json';
  const token = process.env.GITHUB_TOKEN;

  try {
    // 1. جلب الملف الحالي
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    const fileData = await fileRes.json();
    const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());

    // 2. تعديل البيانات
    if (action === 'add') {
      if (!content.doctors.includes(code)) {
        content.doctors.push(code);
      }
    } else if (action === 'delete') {
      content.doctors = content.doctors.filter(c => c !== code);
    }

    // 3. رفع الملف المعدل
    const updateRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `${action === 'add' ? 'Add' : 'Delete'} doctor code: ${code}`,
          content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
          sha: fileData.sha
        })
      }
    );

    if (updateRes.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      throw new Error('GitHub API error');
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
