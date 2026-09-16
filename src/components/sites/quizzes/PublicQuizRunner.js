'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Award,
  Timer,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { saveQuizSubmission, trackQuizView, findLocalQuizById } from '@/lib/sites/userSitesScope';

export default function PublicQuizRunner({ quiz: initialQuiz, quizId, isRtl = false }) {
  const [quiz, setQuiz] = useState(initialQuiz || null);
  const [loading, setLoading] = useState(!initialQuiz && !!quizId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0..questions.length-1, then lead_capture, then results
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOption }
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' });
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (initialQuiz) {
      setQuiz(initialQuiz);
      setLoading(false);
      trackQuizView(initialQuiz.id);
      return;
    }

    if (quizId) {
      const cleanId = quizId.startsWith('quiz_') ? quizId.replace('quiz_', '') : quizId;
      const found = findLocalQuizById(quizId) || findLocalQuizById(cleanId) || findLocalQuizById(`qz_${cleanId}`);
      if (found) {
        setQuiz(found);
        trackQuizView(found.id);
      }
      setLoading(false);
    }
  }, [initialQuiz, quizId]);

  // Extract questions from quiz object
  const questions = React.useMemo(() => {
    if (!quiz) return [];
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
      return quiz.questions.map((q, idx) => {
        const formBlock = Array.isArray(q.canvas) ? q.canvas.find((el) => el.type === 'form') : null;
        const formField = formBlock?.fields?.[0];
        const headlineBlock = Array.isArray(q.canvas) ? q.canvas.find((el) => el.type === 'headline') : null;
        const paraBlock = Array.isArray(q.canvas) ? q.canvas.find((el) => el.type === 'paragraph') : null;

        const options = formField?.options || q.options || ['Option A', 'Option B', 'Option C', 'Option D'];
        const correctAnswer = formField?.correctAnswer || q.correctAnswer || (isRtl ? q.correctAnswerAr : null) || options[0] || '';
        const points = Number(formField?.points !== undefined ? formField.points : (q.points !== undefined ? q.points : 25));
        const explanation = formField?.explanation || q.explanation || (isRtl ? q.explanationAr : '') || '';

        return {
          ...q,
          id: q.id || `q_${idx + 1}`,
          title: formField?.label || formBlock?.title || headlineBlock?.content || (isRtl ? q.titleAr || q.title : q.title) || `Question ${idx + 1}`,
          description: formBlock?.subtitle || paraBlock?.content || (isRtl ? q.descriptionAr || q.description : q.description) || '',
          type: formField?.type || q.type || 'radio',
          options,
          correctAnswer,
          points,
          explanation
        };
      });
    }
    if (Array.isArray(quiz.slides) && quiz.slides.length > 0) {
      return quiz.slides.map((s, idx) => {
        const el = s.elements?.[0] || {};
        return {
          id: el.id || s.id || `q_${idx + 1}`,
          title: s.title || el.label || `Question ${idx + 1}`,
          description: s.subtitle || el.placeholder || '',
          type: el.type || 'radio',
          options: el.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: el.correctAnswer || el.options?.[0] || 'Option A',
          points: el.points || 25,
          explanation: el.explanation || ''
        };
      });
    }
    return [
      {
        id: 'q_default_1',
        title: 'Sample Question 1',
        type: 'radio',
        options: ['Choice 1 (Correct)', 'Choice 2', 'Choice 3'],
        correctAnswer: 'Choice 1 (Correct)',
        points: 25,
        explanation: 'This is the verified correct answer.'
      }
    ];
  }, [quiz, isRtl]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentStepIndex];

  // Timer countdown if configured
  useEffect(() => {
    if (quiz?.settings?.showTimer && quiz?.settings?.timeLimitMinutes && !isFinished) {
      const totalSeconds = quiz.settings.timeLimitMinutes * 60;
      setTimeLeft(totalSeconds);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            calculateAndFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [quiz, isFinished]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
        Loading Quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8', maxWidth: '420px' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
            {isRtl ? 'الاختبار غير موجود' : 'Quiz Not Found'}
          </h2>
          <p>{isRtl ? 'تأكد من صحة الرابط أو اتصل بمسؤول الحساب.' : 'Please verify the URL or contact the quiz administrator.'}</p>
        </div>
      </div>
    );
  }

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const calculateAndFinish = (respondentLead = leadData) => {
    let totalScore = 0;
    let maxScore = 0;
    const answerBreakdown = [];

    questions.forEach((q) => {
      const pts = Number(q.points) || 25;
      maxScore += pts;
      const selected = answers[q.id];
      const correct = q.correctAnswer || (isRtl ? q.correctAnswerAr : null) || q.options?.[0];

      const clean = (s) => String(s || '').trim().toLowerCase();
      const isCorrect = Boolean(
        selected && correct && (
          clean(selected) === clean(correct) ||
          (isRtl && q.correctAnswerAr && clean(selected) === clean(q.correctAnswerAr))
        )
      );

      if (isCorrect) {
        totalScore += pts;
      }

      answerBreakdown.push({
        questionId: q.id,
        questionTitle: (isRtl ? q.titleAr || q.title : q.title) || 'Question',
        selectedAnswer: selected || (isRtl ? 'لم تتم الإجابة' : 'No Answer'),
        correctAnswer: correct,
        isCorrect,
        pointsAwarded: isCorrect ? pts : 0,
        explanation: isRtl ? q.explanationAr || q.explanation : q.explanation
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passingThreshold = Number(quiz.passingScore) || 70;
    const passed = percentage >= passingThreshold;

    const resultObj = {
      score: totalScore,
      totalPossibleScore: maxScore,
      totalPoints: maxScore,
      percentage,
      passed,
      answers: answerBreakdown,
      name: respondentLead.name || leadData.name || (isRtl ? 'مُختبر مباشر' : 'Live Participant'),
      email: respondentLead.email || leadData.email || '',
      phone: respondentLead.phone || leadData.phone || '',
      submittedAt: new Date().toISOString()
    };

    setFinalResult(resultObj);
    setIsFinished(true);

    // Save to localStorage
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    saveQuizSubmission(quiz.id, {
      id: submissionId,
      ...resultObj
    });
  };

  const handleNext = () => {
    if (currentStepIndex < totalQuestions - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Check if lead capture is required
      if (quiz.settings?.requireLeadCapture !== false && !isFinished) {
        setCurrentStepIndex(totalQuestions); // Show lead capture screen
      } else {
        calculateAndFinish();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    calculateAndFinish(leadData);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentStepIndex(0);
    setIsFinished(false);
    setFinalResult(null);
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / totalQuestions) * 100);
  const themeBg = quiz.settings?.backgroundColor || '#0b0f19';
  const cardBg = quiz.settings?.cardBg || '#131b2e';
  const buttonColor = quiz.settings?.buttonColor || '#2563eb';
  const textColor = quiz.settings?.textColor || '#ffffff';
  const radius = quiz.settings?.borderRadius || '16px';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: themeBg,
        color: textColor,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: cardBg,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: radius,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease'
        }}
      >
        {/* Header with Title and Progress */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: buttonColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {quiz.category || 'Quiz Assessment'}
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: textColor }}>
              {quiz.name}
            </h1>
          </div>

          {/* Optional Timer */}
          {timeLeft !== null && !isFinished && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                color: timeLeft < 60 ? '#ef4444' : '#e2e8f0'
              }}
            >
              <Timer size={15} />
              <span>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!isFinished && currentStepIndex < totalQuestions && (
          <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.06)' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${buttonColor}, #60a5fa)`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '32px 28px' }}>
          {/* Question Step */}
          {!isFinished && currentStepIndex < totalQuestions && currentQuestion && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>
                  {isRtl ? `السؤال ${currentStepIndex + 1} من ${totalQuestions}` : `Question ${currentStepIndex + 1} of ${totalQuestions}`}
                </span>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#e2e8f0',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  +{currentQuestion.points || 20} {isRtl ? 'نقاط' : 'pts'}
                </span>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: textColor, margin: '0 0 8px', lineHeight: '1.4' }}>
                {isRtl ? currentQuestion.titleAr || currentQuestion.title : currentQuestion.title}
              </h2>

              {(currentQuestion.description || (isRtl && currentQuestion.descriptionAr)) && (
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 20px', lineHeight: '1.5' }}>
                  {isRtl ? currentQuestion.descriptionAr || currentQuestion.description : currentQuestion.description}
                </p>
              )}

              {/* Options List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '24px 0' }}>
                {((isRtl && currentQuestion.optionsAr) || currentQuestion.options || []).map((opt, oIdx) => {
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(currentQuestion.id, opt)}
                      style={{
                        background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? `2px solid ${buttonColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: isSelected ? `2px solid ${buttonColor}` : '2px solid rgba(255, 255, 255, 0.3)',
                            background: isSelected ? buttonColor : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '800'
                          }}
                        >
                          {isSelected ? <Check size={14} /> : String.fromCharCode(65 + oIdx)}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: isSelected ? '700' : '500', color: isSelected ? textColor : '#cbd5e1' }}>
                          {opt}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px' }}>
                <button
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: currentStepIndex === 0 ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ChevronLeft size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                  {isRtl ? 'السابق' : 'Previous'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  style={{
                    background: answers[currentQuestion.id] ? buttonColor : 'rgba(255, 255, 255, 0.1)',
                    color: answers[currentQuestion.id] ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: answers[currentQuestion.id] ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: answers[currentQuestion.id] ? `0 4px 14px ${buttonColor}50` : 'none'
                  }}
                >
                  {currentStepIndex === totalQuestions - 1
                    ? (isRtl ? 'إنهاء وحساب النتيجة' : 'Submit & Grade')
                    : (isRtl ? 'التالي' : 'Next Question')}
                  <ChevronRight size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>
            </div>
          )}

          {/* Lead Capture Step (Optional) */}
          {!isFinished && currentStepIndex === totalQuestions && (
            <form onSubmit={handleLeadSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'rgba(37, 99, 235, 0.15)',
                    color: buttonColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <Award size={28} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: textColor, margin: '0 0 6px' }}>
                  {isRtl ? 'اكتملت جميع الأسئلة!' : 'You Completed All Questions!'}
                </h2>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                  {isRtl
                    ? 'أدخل بياناتك لعرض تقرير نتيجتك التفصيلية ونقاط القوة.'
                    : 'Enter your contact details to view your official score and answers breakdown.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                    {isRtl ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? 'أحمد محمد' : 'John Doe'}
                    value={leadData.name}
                    onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      color: textColor,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      color: textColor,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: buttonColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: `0 4px 16px ${buttonColor}60`
                }}
              >
                {isRtl ? 'عرض النتيجة والتصحيح' : 'View My Score & Results'}
              </button>
            </form>
          )}

          {/* Results Screen */}
          {isFinished && finalResult && (
            <div>
              {/* Pass / Fail Hero Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: finalResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `2px solid ${finalResult.passed ? '#10b981' : '#ef4444'}`,
                    color: finalResult.passed ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  {finalResult.passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    background: finalResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: finalResult.passed ? '#10b981' : '#ef4444',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '13px',
                    marginBottom: '10px'
                  }}
                >
                  {finalResult.passed ? (isRtl ? 'اجتياز بنجاح (PASSED)' : 'PASSED') : (isRtl ? 'لم يتم الاجتياز (FAILED)' : 'FAILED')}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '900', color: textColor, margin: '0 0 8px' }}>
                  {finalResult.passed
                    ? (isRtl ? (quiz.settings?.passTitleAr || quiz.settings?.passTitle || '🎉 تهانينا! لقد اجتزت الاختبار بنجاح!') : (quiz.settings?.passTitle || '🎉 Congratulations! You Passed!'))
                    : (isRtl ? (quiz.settings?.failTitleAr || quiz.settings?.failTitle || 'محاولة جيدة! واصل التعلم!') : (quiz.settings?.failTitle || 'Keep Going! Nice Attempt!'))}
                </h2>

                <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '480px', margin: '0 auto', lineHeight: '1.5' }}>
                  {finalResult.passed
                    ? (isRtl ? (quiz.settings?.passMessageAr || quiz.settings?.passMessage || 'أداء رائع يعكس فهماً عميقاً ومتميزاً.') : (quiz.settings?.passMessage || 'Outstanding performance. Your skills are verified!'))
                    : (isRtl ? (quiz.settings?.failMessageAr || quiz.settings?.failMessage || `تحتاج إلى ${quiz.passingScore || 70}% للاجتياز. راجع الإجابات بالأسفل وأعد المحاولة.`) : (quiz.settings?.failMessage || `You need ${quiz.passingScore || 70}% or higher to pass. Review correct answers below.`))}
                </p>
              </div>

              {/* Score Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '28px',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{isRtl ? 'درجتك' : 'Your Score'}</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: finalResult.passed ? '#10b981' : '#ef4444' }}>
                    {finalResult.percentage}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{isRtl ? 'حد الاجتياز' : 'Passing Score'}</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#60a5fa' }}>
                    {quiz.passingScore || 70}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{isRtl ? 'النقاط' : 'Points Earned'}</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: textColor }}>
                    {finalResult.score} / {finalResult.totalPossibleScore}
                  </div>
                </div>
              </div>

              {/* Detailed Question Review List */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: textColor, margin: '0 0 14px' }}>
                  {isRtl ? 'مراجعة وتصحيح الأسئلة التفصيلية' : 'Questions & Answers Breakdown'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(finalResult.answers || []).map((ans, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        borderRadius: '10px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>
                          Q{idx + 1}: {ans.questionTitle}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            color: ans.isCorrect ? '#10b981' : '#ef4444',
                            background: ans.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {ans.isCorrect ? (isRtl ? '✅ إجابة صحيحة' : '✅ CORRECT') : (isRtl ? '❌ إجابة خاطئة' : '❌ INCORRECT')}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#e2e8f0', margin: '4px 0' }}>
                        <strong style={{ color: '#94a3b8' }}>{isRtl ? 'إجابتك المختارة:' : 'Your Answer:'} </strong>
                        <span style={{ color: ans.isCorrect ? '#10b981' : '#ef4444' }}>{ans.selectedAnswer}</span>
                      </div>

                      {!ans.isCorrect && ans.correctAnswer && (
                        <div style={{ fontSize: '13px', color: '#10b981', margin: '4px 0' }}>
                          <strong style={{ color: '#94a3b8' }}>{isRtl ? 'الإجابة النموذجية الصحيحة:' : 'Correct Answer:'} </strong>
                          {ans.correctAnswer}
                        </div>
                      )}

                      {ans.explanation && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#cbd5e1',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            marginTop: '8px',
                            borderLeft: isRtl ? 'none' : '3px solid #60a5fa',
                            borderRight: isRtl ? '3px solid #60a5fa' : 'none'
                          }}
                        >
                          💡 {ans.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleRetry}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: textColor,
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={15} />
                  {isRtl ? 'إعادة الاختبار' : 'Retry Quiz'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
