const fs = require('fs');

const API_KEY = 'sk-Q4F9brB0Ga1AFAQsEztQmTsXy7Ttcv1vNysX3KJFpyHScPIJ';
const BASE_URL = 'https://api.unorouter.com/v1/chat/completions';
const MODEL = 'glm-5.3-thinking:free';

async function generateCode(prompt, filePath = null) {
  let fileContext = '';
  if (filePath && fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fileContext = `\nExisting file content for ${filePath}:\n\`\`\`\n${content}\n\`\`\`\n`;
  }

  const systemMessage = "You are an expert software developer. Write clean, production-ready code.";
  const userMessage = `${fileContext}\nUser Request: ${prompt}`;

  console.log(`[GLM] Streaming from ${MODEL}...`);
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }

  let fullContent = '';
  let fullReasoning = '';
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep last incomplete line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.substring(6));
          const delta = json.choices[0]?.delta;
          if (delta?.content) {
            fullContent += delta.content;
            process.stdout.write(delta.content);
          }
          if (delta?.reasoning_content) {
            fullReasoning += delta.reasoning_content;
          }
        } catch (e) {
          // ignore partial parse errors
        }
      }
    }
  }

  return { content: fullContent, reasoning: fullReasoning };
}

// CLI usage: node glm_generate.js "<prompt>" "<optional-filepath>"
const args = process.argv.slice(2);
if (args.length > 0) {
  const prompt = args[0];
  const targetFile = args[1] || null;
  generateCode(prompt, targetFile)
    .then(result => {
      console.log('\n=== FINISHED ===');
    })
    .catch(err => {
      console.error('\n[Error]', err.message);
      process.exit(1);
    });
}

module.exports = { generateCode };
