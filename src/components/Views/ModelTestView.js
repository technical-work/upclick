'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function ModelTestView() {
  const { lang, GC, t } = useBusiness();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  
  useEffect(() => {
    let interval;
    if (loading) {
      const start = Date.now();
      interval = setInterval(() => {
        setElapsed(Date.now() - start);
      }, 50); // Update every 50ms for smooth bar
    } else {
      setElapsed(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleTest = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResponse('');
    setFinalTime(null);
    
    const startMs = Date.now();
    let hasReceivedFirstChunk = false;

    try {
      const systemPrompt = "أنت مساعد ذكي. يرجى الإجابة على طلب المستخدم بدقة ووضوح.";
      const res = await callClaudeAPI(
        prompt, 
        systemPrompt, 
        lang, 
        GC, 
        'Model Test', 
        (chunk) => {
          if (!hasReceivedFirstChunk) {
            hasReceivedFirstChunk = true;
            setLoading(false);
            setFinalTime(Date.now() - startMs);
          }
          setResponse(prev => prev + chunk);
        }
      );
      if (res && !hasReceivedFirstChunk) {
        setResponse(res);
      }
    } catch (err) {
      setResponse("❌ خطأ أثناء الاتصال بالموديل: " + err.message);
    } finally {
      if (!hasReceivedFirstChunk) {
        setFinalTime(Date.now() - startMs);
        setLoading(false);
      }
    }
  };

  // Convert elapsed to seconds
  const currentSecs = (elapsed / 1000).toFixed(2);
  const totalSecs = finalTime ? (finalTime / 1000).toFixed(2) : '0.00';

  // Calculate progress percentage for a fake loading effect that slows down as it gets closer to 100%
  const expectedMaxSeconds = 15;
  const progressPercent = Math.min((elapsed / 1000) / expectedMaxSeconds * 100, 95); // Caps at 95% until done

  return (
    <div className="view-container fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--t1)' }}>اختبار الموديل (Model Test)</h1>
        <p style={{ color: 'var(--t2)', fontSize: '14px', marginTop: '8px' }}>
          هذه الصفحة مخصصة لاختبار سرعة استجابة الموديل والتأكد من أنه يعمل بشكل صحيح. قم بإدخال الأمر وراقب الوقت المستغرق.
        </p>
      </div>

      <div className="card" style={{ padding: '20px', background: 'var(--surface2)', borderRadius: '12px', border: '1px solid var(--edge)', marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--t1)' }}>اكتب الأمر هنا:</label>
        <textarea 
          className="inp"
          style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', fontFamily: 'inherit' }}
          placeholder="مثال: اكتب لي تغريدة عن التسويق الرقمي..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        
        <button 
          className="btn btn-prime"
          style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          onClick={handleTest}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              جاري معالجة الطلب...
            </>
          ) : 'إرسال واختبار الموديل'}
        </button>
      </div>

      {loading && (
        <div style={{ marginBottom: '24px', background: 'var(--surface2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--edge)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--t2)', fontSize: '15px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--orange)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
              جاري انتظار رد الموديل...
            </span>
            <span style={{ fontWeight: 'bold', color: 'var(--orange)', fontFamily: 'monospace', fontSize: '16px' }}>{currentSecs} ثانية</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'var(--surface3)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--orange), var(--red))',
              width: `${progressPercent}%`,
              transition: 'width 0.1s linear',
              borderRadius: '6px'
            }}></div>
          </div>
        </div>
      )}

      {finalTime !== null && !loading && (
        <div className="fade-in" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
          <div>
            <div style={{ color: '#25D366', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
              اكتمل الرد بنجاح!
            </div>
            <div style={{ color: 'var(--t2)', fontSize: '14px' }}>
              الوقت الإجمالي المستغرق: <span style={{ color: 'var(--t1)', fontWeight: 'bold' }}>{totalSecs} ثانية</span>
            </div>
          </div>
        </div>
      )}

      {response && !loading && (
        <div className="card fade-in" style={{ padding: '24px', background: 'var(--surface2)', borderRadius: '12px', border: '1px solid var(--edge)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--t1)', fontSize: '18px', borderBottom: '1px solid var(--edge)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤖</span> نتيجة الموديل:
          </h3>
          <div 
            style={{ 
              color: 'var(--t1)', 
              lineHeight: '1.8',
              fontSize: '15px',
              background: 'var(--surface1)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--edge2)',
              overflowX: 'auto'
            }}
            dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br>') }}
          />
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}} />
    </div>
  );
}
