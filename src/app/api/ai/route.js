import { NextResponse } from 'next/server';
import { adminDb } from '@/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const maxDuration = 60;

const getModelRates = (modelName) => {
  const name = modelName.toLowerCase();
  if (name.includes('gpt-5.5') || name.includes('gpt-5.5-pro')) {
    return { input: 5.00 / 1000000, output: 30.00 / 1000000 };
  }
  if (name.includes('gpt-5.4-mini')) {
    return { input: 0.75 / 1000000, output: 4.50 / 1000000 };
  }
  if (name.includes('gpt-5.4')) {
    return { input: 2.50 / 1000000, output: 15.00 / 1000000 };
  }
  if (name.includes('gpt-5-mini')) {
    return { input: 0.25 / 1000000, output: 2.00 / 1000000 };
  }
  if (name.includes('gpt-5')) {
    return { input: 1.25 / 1000000, output: 10.00 / 1000000 };
  }
  if (name.includes('gpt-4.1-mini')) {
    return { input: 0.40 / 1000000, output: 1.60 / 1000000 };
  }
  if (name.includes('gpt-4.1')) {
    return { input: 2.00 / 1000000, output: 8.00 / 1000000 };
  }
  if (name.includes('gpt-4o-mini')) {
    return { input: 0.15 / 1000000, output: 0.60 / 1000000 };
  }
  if (name.includes('gpt-4o')) {
    return { input: 2.50 / 1000000, output: 10.00 / 1000000 };
  }
  if (name.includes('o3-mini')) {
    return { input: 1.10 / 1000000, output: 4.40 / 1000000 };
  }
  if (name.includes('o1-mini')) {
    return { input: 1.10 / 1000000, output: 4.40 / 1000000 };
  }
  if (name.includes('o1')) {
    return { input: 15.00 / 1000000, output: 60.00 / 1000000 };
  }
  if (name.includes('gpt-3.5-turbo')) {
    return { input: 0.50 / 1000000, output: 1.50 / 1000000 };
  }
  // Default fallback to gpt-4o-mini rates
  return { input: 0.15 / 1000000, output: 0.60 / 1000000 };
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, messages, tool, endpoint, apiKey, model } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin SDK is not initialized.' }, { status: 500 });
    }

    // 1. Fetch global AI credentials
    const globalDoc = await adminDb.collection('tenants').doc('global').get();
    if (!globalDoc.exists) {
      return NextResponse.json({ error: 'Global configuration not configured yet.' }, { status: 500 });
    }
    const globalData = globalDoc.data();
    
    let openaiApiKey = apiKey || globalData.openaiApiKey;
    let targetEndpoint = endpoint || 'https://api.openai.com/v1/chat/completions';
    let configuredModel = model || globalData.openaiModel || 'gpt-4o-mini';

    const defaultUserCredit = globalData.defaultUserCredit !== undefined ? Number(globalData.defaultUserCredit) : 5.00;
    const aiEnabled = globalData.aiEnabled !== false;
    const totalAiSpend = globalData.totalAiSpend !== undefined ? Number(globalData.totalAiSpend) : 0;
    const aiMaxMonthlyBudget = globalData.aiMaxMonthlyBudget !== undefined ? Number(globalData.aiMaxMonthlyBudget) : 100.00;

    if (!aiEnabled) {
      return NextResponse.json({ 
        error: 'خدمات الذكاء الاصطناعي معطلة حالياً من قبل إدارة المنصة.' 
      }, { status: 503 });
    }

    if (totalAiSpend >= aiMaxMonthlyBudget) {
      return NextResponse.json({ 
        error: 'عذراً، تم الوصول إلى الحد الأقصى لميزانية الذكاء الاصطناعي الشهرية المخصصة للمنصة حالياً.' 
      }, { status: 503 });
    }

    // Fallback to free/default router if API key is not configured
    if (!openaiApiKey) {
      openaiApiKey = "sk-nry-sCBhTqkDeBcp8fp53eO5OQIJ96ztTuNCat9lorftjm4";
      targetEndpoint = "https://router.bynara.id/v1/chat/completions";
      configuredModel = "glm-5";
    }

    // 2. Fetch user's credits
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }
    const userData = userDoc.data();
    const aiCredits = userData.aiCredits !== undefined ? Number(userData.aiCredits) : defaultUserCredit;

    // 3. Insufficient credits check
    if (aiCredits <= 0) {
      return NextResponse.json({ 
        error: 'حسابك لا يحتوي على رصيد كافٍ لاستخدام الذكاء الاصطناعي. يرجى التواصل مع الإدارة.' 
      }, { status: 403 });
    }

    // 3.5 Inject system instructions if configured
    let requestMessages = [...messages];
    if (globalData.aiSystemInstruction) {
      const systemMsgIndex = requestMessages.findIndex(m => m.role === 'system');
      if (systemMsgIndex !== -1) {
        requestMessages[systemMsgIndex] = {
          role: 'system',
          content: `${globalData.aiSystemInstruction}\n\n${requestMessages[systemMsgIndex].content}`
        };
      } else {
        requestMessages.unshift({
          role: 'system',
          content: globalData.aiSystemInstruction
        });
      }
    }

    // Prepare OpenAI request payload
    const openAiPayload = {
      model: configuredModel,
      messages: requestMessages,
      stream: true,
      stream_options: { include_usage: true }
    };

    if (globalData.aiTemperature !== undefined) {
      openAiPayload.temperature = Number(globalData.aiTemperature);
    }
    if (globalData.aiMaxTokens !== undefined) {
      openAiPayload.max_tokens = Number(globalData.aiMaxTokens);
    } else {
      openAiPayload.max_tokens = 4096;
    }

    // 4. Request OpenAI API with Streaming enabled
    const res = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      body: JSON.stringify(openAiPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      let openAiError = 'Failed to connect to OpenAI';
      try {
        const errJson = JSON.parse(errText);
        openAiError = errJson.error?.message || openAiError;
      } catch (e) {}
      return NextResponse.json({ error: openAiError }, { status: res.status });
    }

    // 5. Create a readable stream to pipe to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body.getReader();
        let buffer = '';
        let promptTokens = 0;
        let completionTokens = 0;
        let fullResponseText = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep last incomplete line in buffer

            for (const line of lines) {
              const cleanLine = line.trim();
              if (!cleanLine) continue;
              if (cleanLine === 'data: [DONE]') continue;

              if (cleanLine.startsWith('data: ')) {
                const jsonStr = cleanLine.substring(6);
                if (jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  
                  // Stream text content chunks to client
                  const textChunk = parsed.choices?.[0]?.delta?.content || '';
                  if (textChunk) {
                    fullResponseText += textChunk;
                    controller.enqueue(encoder.encode(textChunk));
                  }

                  // Accumulate usage token counts
                  if (parsed.usage) {
                    promptTokens = parsed.usage.prompt_tokens || 0;
                    completionTokens = parsed.usage.completion_tokens || 0;
                  }
                } catch (e) {
                  // Partial JSON chunk error bypass
                }
              }
            }
          }

          // Fallback token estimation if the proxy doesn't support stream_options
          if (promptTokens === 0) {
            promptTokens = Math.max(1, Math.ceil(JSON.stringify(messages).length / 3.0));
          }
          if (completionTokens === 0) {
            completionTokens = Math.max(1, Math.ceil(fullResponseText.length / 3.0));
          }

          // 6. Deduct credits & Log when the stream finishes successfully
          if (promptTokens > 0 || completionTokens > 0) {
            const rates = getModelRates(configuredModel);
            const cost = (promptTokens * rates.input) + (completionTokens * rates.output);
            const aiMarkupMultiplier = globalData.aiMarkupMultiplier !== undefined ? Number(globalData.aiMarkupMultiplier) : 1.0;
            const userDeductionCost = cost * aiMarkupMultiplier;
            const newCredits = Math.max(0, aiCredits - userDeductionCost);

            await userRef.update({
              aiCredits: newCredits
            });

            await adminDb.collection('ai_logs').add({
              userId,
              userEmail: userData.email || '',
              userName: userData.name || '',
              model: configuredModel,
              inputTokens: promptTokens,
              outputTokens: completionTokens,
              cost: cost,
              tool: tool || 'General',
              timestamp: new Date()
            });

            await adminDb.collection('tenants').doc('global').update({
              totalAiSpend: FieldValue.increment(cost),
              totalAiTokens: FieldValue.increment(promptTokens + completionTokens),
              totalAiCalls: FieldValue.increment(1)
            });
          }
        } catch (streamError) {
          console.error("Error processing OpenAI stream:", streamError);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
