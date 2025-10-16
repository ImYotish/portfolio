export async function api(text, onToken) {

  const data = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
    messages: text,
    model: 'openai/gpt-oss-120b',
    stream: true
    })
  });

    const decoder = new TextDecoder('utf-8')
    const reader = await data.body.getReader()
    let buffer = ''

    while (true) {
    
    const { value, done } = await reader.read()
    if (done) break;
    const chunk = decoder.decode(value, {stream: true})

    buffer += chunk
    let lines = buffer.split('\n')
    buffer = lines.pop()
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed === 'data: [DONE]') continue;

      const json = trimmed.replace(/^data:\s*/, '')
      const obj = JSON.parse(json);
      const token = obj.choices?.[0]?.delta?.content;
      if (token) { onToken(token) };
    }
  }
}