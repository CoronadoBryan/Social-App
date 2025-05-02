// función edge Supabase: send-push-to-all.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
Deno.serve(async (req)=>{
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }
  // Espera un JSON con { categoria, titulo, body, imagen, data }
  const { categoria, titulo, body, imagen, data } = await req.json();
  // Obtén todos los tokens de la tabla users
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const users = await fetch(`${supabaseUrl}/rest/v1/users?select=expo_push_token`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  }).then((res)=>res.json());
  // Prepara los mensajes
  const tokens = users.map((u)=>u.expo_push_token).filter(Boolean);
  const messages = tokens.map((token)=>({
      to: token,
      sound: 'default',
      title: titulo || '¡Nuevos recursos gratis!',
      body: body || `Hay nuevos recursos en la categoría ${categoria}`,
      data: {
        categoria,
        ...data,
        ...imagen ? {
          image: imagen
        } : {}
      }
    }));
  // Envía las notificaciones en lotes de 100
  let expoResponses = [];
  for(let i = 0; i < messages.length; i += 100){
    const chunk = messages.slice(i, i + 100);
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chunk)
    });
    expoResponses.push(await expoRes.json());
  }
  // RESPUESTA FINAL CON HEADERS CORS
  return new Response(JSON.stringify({
    success: true,
    total: tokens.length,
    expoResponses
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
});
