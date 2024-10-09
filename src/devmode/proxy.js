addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Notion-Version",
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  const url = new URL(request.url)
  let targetURL = url.pathname.slice(1);

  if (!targetURL) {
    return new Response('Usage: /https://api.notion.com/v1/...', { 
      status: 400,
      headers: corsHeaders
    });
  }

  targetURL = decodeURIComponent(targetURL);

  // Ensure the target URL starts with 'https://'
  if (!targetURL.startsWith('https://')) {
    targetURL = 'https://' + targetURL;
  }

  if (!isValidURL(targetURL)) {
    return new Response('Invalid URL', { 
      status: 400,
      headers: corsHeaders
    });
  }

  console.log('Request URL:', request.url);
  console.log('Target URL before processing:', targetURL);

  console.log('Processed Target URL:', targetURL);

  try {
    console.log('Proxying request to:', targetURL);
    console.log('Request headers:', Object.fromEntries(request.headers));

    let requestBody;
    if (request.method === 'POST' || request.method === 'PATCH') {
      requestBody = await request.text();
    }

    let response = await fetch(targetURL, {
      method: request.method,
      headers: request.headers,
      body: requestBody
    });

    const responseBody = await response.text();

    response = new Response(responseBody, response);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (e) {
    return new Response(JSON.stringify({error: e.message, stack: e.stack}), { 
      status: 500,
      headers: {...corsHeaders, 'Content-Type': 'application/json'}
    });
  }
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}