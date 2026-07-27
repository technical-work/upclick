import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, prompt } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();

    if (!adminDb) {
      console.warn('[api/ai/image] Firebase Admin SDK is not initialized.');
      return NextResponse.json({ error: 'Firebase Admin SDK is not initialized on server.' }, { status: 500 });
    }

    // 1. Fetch global AI credentials
    const globalDoc = await adminDb.collection('tenants').doc('global').get();
    if (!globalDoc.exists) {
      return NextResponse.json({ error: 'Global configuration not configured yet.' }, { status: 500 });
    }
    const globalData = globalDoc.data();
    let openaiApiKey = globalData.openaiApiKey;
    let imageEndpoint = 'https://api.openai.com/v1/images/generations';
    const creditsPerDollar = globalData.creditsPerDollar !== undefined ? Number(globalData.creditsPerDollar) : 100;
    const defaultUserCredit = (globalData.defaultUserCredit !== undefined ? Number(globalData.defaultUserCredit) : 5.00) * creditsPerDollar;
    const aiEnabled = globalData.aiEnabled !== false;

    if (!aiEnabled) {
      return NextResponse.json({ 
        error: 'خدمات الذكاء الاصطناعي معطلة حالياً من قبل إدارة المنصة.' 
      }, { status: 503 });
    }

    if (!openaiApiKey) {
      openaiApiKey = "sk-nry-sCBhTqkDeBcp8fp53eO5OQIJ96ztTuNCat9lorftjm4";
      imageEndpoint = "https://router.bynara.id/v1/images/generations";
    }

    // 2. Fetch user's credits
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }
    const userData = userDoc.data();
    const aiCredits = userData.aiCredits !== undefined ? Number(userData.aiCredits) : defaultUserCredit;

    const finalCreditsDeduction = globalData.costGenerateLogo !== undefined ? Number(globalData.costGenerateLogo) : 40;

    // 3. Insufficient credits check
    if (aiCredits < finalCreditsDeduction) {
      return NextResponse.json({ 
        error: `حسابك لا يحتوي على رصيد كافٍ لتوليد صورة. تحتاج إلى ${finalCreditsDeduction} كريديت على الأقل.` 
      }, { status: 403 });
    }

    // 4. Request image generation with fallback chain
    const modelsToTry = ['gpt-image-2', 'gpt-image-1', 'dall-e-3', 'dall-e-2'];
    let modelUsed = '';
    let imageUrl = '';
    let openAiError = 'Failed to connect to OpenAI';
    let cost = 0.04;

    for (const model of modelsToTry) {
      console.log(`Attempting image generation with model: ${model}`);
      try {
        const bodyPayload = {
          model: model,
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        };
        // DALL-E 3 supports quality: 'standard'
        if (model === 'dall-e-3') {
          bodyPayload.quality = 'standard';
        }

        const res = await fetch(imageEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify(bodyPayload)
        });

        if (res.ok) {
          const data = await res.json();
          const firstImage = data.data?.[0];
          if (firstImage) {
            if (firstImage.url) {
              imageUrl = firstImage.url;
            } else if (firstImage.b64_json) {
              imageUrl = `data:image/png;base64,${firstImage.b64_json}`;
            }
          }

          if (imageUrl) {
            modelUsed = model;
            cost = (model === 'gpt-image-2' || model === 'dall-e-3') ? 0.04 : 0.02;
            console.log(`Successfully generated image using model: ${model} (${firstImage?.url ? 'URL' : 'Base64'})`);
            break; // Success! Break the loop
          }
        } else {
          const errText = await res.text();
          try {
            const errJson = JSON.parse(errText);
            openAiError = errJson.error?.message || errText;
          } catch (e) {
            openAiError = errText;
          }
          console.warn(`Model ${model} failed: ${openAiError}`);
        }
      } catch (err) {
        console.error(`Error attempting model ${model}:`, err);
        openAiError = err.message || openAiError;
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ 
        error: `حسابك لا يدعم نماذج توليد الصور الحالية. خطأ من OpenAI: ${openAiError}` 
      }, { status: 500 });
    }

    // 5. Deduct credits & Log when image generation finishes successfully
    await userRef.update({
      aiCredits: FieldValue.increment(-finalCreditsDeduction)
    });

    await adminDb.collection('ai_logs').add({
      userId,
      userEmail: userData.email || '',
      userName: userData.name || '',
      model: modelUsed,
      inputTokens: 0,
      outputTokens: 0,
      cost: cost,
      creditsDeducted: finalCreditsDeduction,
      tool: 'Design Studio',
      timestamp: new Date()
    });

    await adminDb.collection('tenants').doc('global').update({
      totalAiSpend: FieldValue.increment(cost),
      totalAiCalls: FieldValue.increment(1)
    });

    return NextResponse.json({ url: imageUrl });

  } catch (error) {
    console.error('AI Image Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
