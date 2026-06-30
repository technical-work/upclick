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
    const { userId, messages, tool } = body;

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
    const openaiApiKey = globalData.openaiApiKey;
    const defaultUserCredit = globalData.defaultUserCredit !== undefined ? Number(globalData.defaultUserCredit) : 5.00;
    const configuredModel = globalData.openaiModel || 'gpt-4o-mini';

    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI API is not configured by the system administrator.' }, { status: 500 });
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

    // 4. Request OpenAI API
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: configuredModel,
        messages: messages
      })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return NextResponse.json({ error: 'API returned HTML (Cloudflare block?)', html: text.substring(0, 500) }, { status: 502 });
    }

    if (data.error) {
      return NextResponse.json(data);
    }

    // 5. Calculate cost and deduct credits
    const rates = getModelRates(configuredModel);
    const inputCount = data.usage?.prompt_tokens || 0;
    const outputCount = data.usage?.completion_tokens || 0;
    const cost = (inputCount * rates.input) + (outputCount * rates.output);

    const newCredits = Math.max(0, aiCredits - cost);

    await userRef.update({
      aiCredits: newCredits
    });

    try {
      await adminDb.collection('ai_logs').add({
        userId,
        userEmail: userData.email || '',
        userName: userData.name || '',
        model: configuredModel,
        inputTokens: inputCount,
        outputTokens: outputCount,
        cost: cost,
        tool: tool || 'General',
        timestamp: new Date()
      });

      await adminDb.collection('tenants').doc('global').update({
        totalAiSpend: FieldValue.increment(cost),
        totalAiTokens: FieldValue.increment(inputCount + outputCount),
        totalAiCalls: FieldValue.increment(1)
      });
    } catch (logError) {
      console.error('Failed to log AI call or increment metrics:', logError);
    }

    return NextResponse.json({
      ...data,
      updatedCredits: newCredits
    });

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
