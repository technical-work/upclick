'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { DB } from '../../data/mockData';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';
import CustomSelect from '../CustomSelect';

export default function CoursesView() {
  const { lang, L, t, formatMoney, GC, saveGC, confirmAction, promptAction } = useBusiness();

  // Global Filters
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const filterByDateRange = (itemDate, rangeType, customStart, customEnd) => {
    if (!itemDate) return true;
    const date = new Date(itemDate);
    if (isNaN(date.getTime())) return true;
    const now = new Date();
    switch (rangeType) {
      case 'week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return date >= startOfWeek;
      }
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= startOfMonth;
      }
      case 'year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return date >= startOfYear;
      }
      case 'last30': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return date >= thirtyDaysAgo;
      }
      case 'custom': {
        if (customStart && customEnd) {
          const start = new Date(customStart);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          return date >= start && date <= end;
        }
        return true;
      }
      case 'all':
      default:
        return true;
    }
  };

  const saveRevenueData = (updatedFields) => {
    const updatedGC = {
      ...GC,
      revenue: {
        ...(GC.revenue || {}),
        ...updatedFields
      }
    };
    saveGC(updatedGC);
  };

  const coursesList = GC.revenue?.courses || [];
  const filteredCourses = coursesList.filter(c =>
    filterByDateRange(c.created, filterPeriod, customStartDate, customEndDate)
  );
  const coursesRevenue = filteredCourses.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0);

  // Course Builder State
  const [courseTopic, setCourseTopic] = useState('');
  const [courseAudience, setCourseAudience] = useState('Beginner creators');
  const [coursePrice, setCoursePrice] = useState('97');
  const [courseDuration, setCourseDuration] = useState('4 Weeks');
  const [courseLevel, setCourseLevel] = useState('Beginner');
  const [courseLanguage, setCourseLanguage] = useState('Arabic');
  const [courseSkill, setCourseSkill] = useState('General');
  const [courseIsGenerating, setCourseIsGenerating] = useState(false);
  const [courseOutlineData, setCourseOutlineData] = useState(null);

  const handleBuildCourse = async () => {
    setCourseIsGenerating(true);
    setCourseOutlineData(null);

    const topic = courseTopic || L('Content Creation Mastery', 'إتقان إنشاء المحتوى');
    const priceVal = parseFloat(coursePrice.replace(/[^0-9.]/g, '')) || 97;
    const price = `$${priceVal}`;
    const aud = courseAudience;

    const defaultStudents = priceVal <= 35 ? '50–100' : priceVal <= 100 ? '30–60' : priceVal <= 250 ? '15–30' : '5–15';
    const defaultRev = `$${(priceVal * (priceVal <= 35 ? 75 : priceVal <= 100 ? 45 : priceVal <= 250 ? 22 : 10)).toLocaleString()}–$${(priceVal * (priceVal <= 35 ? 150 : priceVal <= 100 ? 90 : priceVal <= 250 ? 45 : 20)).toLocaleString()}`;
    const defaultOutline = DB.courseOutline[lang] || [];

    const prompt = `Create a detailed course syllabus structure for:
- Topic: ${topic}
- Target Audience: ${aud}
- Suggested Price: ${price}
- Duration: ${courseDuration}
- Difficulty Level: ${courseLevel}
- Language: ${courseLanguage}
- Skill Focus: ${courseSkill}

Please estimate the number of potential students and expected revenue range based on this pricing.
You MUST output your response as a valid JSON object ONLY. Do not include markdown wraps (like \`\`\`json) or any conversational text. Use exactly this JSON template:
{
  "topic": "${topic}",
  "aud": "${aud}",
  "price": "${price}",
  "rev": "expected revenue range (e.g. $2,000–$4,000)",
  "students": "expected number of students (e.g. 20–40)",
  "outline": [
    { "m": "Module 1: Title", "ls": ["Lesson 1: Intro", "Lesson 2: ..."] },
    { "m": "Module 2: Title", "ls": ["Lesson 1: ...", "Lesson 2: ..."] }
  ]
}`;

    try {
      const response = await callClaudeAPI(prompt, 'You are an educational designer and course creator. Output only valid JSON.', lang);
      const cleanJsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);
      if (parsed && parsed.outline) {
        setCourseOutlineData(parsed);
      } else {
        throw new Error('Invalid format');
      }
    } catch (e) {
      console.warn("AI generation failed, using fallback:", e);
      setCourseOutlineData({
        topic,
        price,
        aud,
        rev: defaultRev,
        students: defaultStudents,
        outline: defaultOutline
      });
    } finally {
      setCourseIsGenerating(false);
    }
  };

  const handleLaunchCourse = () => {
    if (!courseOutlineData) return;

    promptAction(L('Enter starting number of students:', 'أدخل عدد الطلاب البدائي:'), '10', (startingStr) => {
      const startingStudents = parseInt(startingStr) || 10;
      const priceVal = parseFloat(courseOutlineData.price.replace(/[^0-9.]/g, '')) || 97;

      const newCourse = {
        id: Date.now(),
        title: courseOutlineData.topic,
        audience: courseOutlineData.aud,
        price: priceVal,
        students: startingStudents,
        revenue: startingStudents * priceVal,
        rating: 4.8,
        outline: courseOutlineData.outline,
        created: new Date().toISOString(),
        status: 'active'
      };

      const updatedCourses = [newCourse, ...(GC.revenue?.courses || [])];
      saveRevenueData({ courses: updatedCourses });
      alert(L('Course launched and saved successfully!', 'تم إطلاق وحفظ الكورس بنجاح!'));
    });
  };

  return (
    <div className="pg on" id="pg-courses">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🎓</span>
          <span>{t('Courses')}</span>
        </div>
        <div className="pg-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <CustomSelect
            className="inp"
            style={{ width: '130px', height: '36px', padding: '6px 12px' }}
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="all">{L('All Time', 'كل الأوقات')}</option>
            <option value="week">{L('This Week', 'هذا الأسبوع')}</option>
            <option value="month">{L('This Month', 'هذا الشهر')}</option>
            <option value="last30">{L('Last 30 Days', 'آخر ٣٠ يوم')}</option>
            <option value="year">{L('This Year', 'هذه السنة')}</option>
            <option value="custom">{L('Custom Range...', 'نطاق مخصص...')}</option>
          </CustomSelect>
          {filterPeriod === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="inp"
                style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '36px', borderRadius: '8px' }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('to', 'إلى')}</span>
              <input
                type="date"
                className="inp"
                style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '36px', borderRadius: '8px' }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">📚 {L('Active Courses', 'الكورسات النشطة')}</div>
          <div className="stat-val">{filteredCourses.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Students', 'الطلاب')}</div>
          <div className="stat-val">{filteredCourses.reduce((sum, c) => sum + (c.students || 0), 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Revenue', 'الأرباح')}</div>
          <div className="stat-val">{formatMoney(coursesRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">⭐ {L('Rating', 'التقييم')}</div>
          <div className="stat-val">4.8</div>
        </div>
      </div>

      <div className="g2">
        <div className="card mb">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Course Topic', 'موضوع الكورس')}
              </label>
              <input
                className="inp"
                value={courseTopic}
                onChange={(e) => setCourseTopic(e.target.value)}
                placeholder="e.g. How to grow on Instagram from 0 to 100K"
              />
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Target Audience', 'الجمهور المستهدف')}
              </label>
              <CustomSelect
                className="inp"
                value={courseAudience}
                onChange={(e) => setCourseAudience(e.target.value)}
              >
                <option value="Beginner creators">{L('Beginner creators', 'منشئي محتوى مبتدئين')}</option>
                <option value="Intermediate influencers">{L('Intermediate influencers', 'مؤثرين متوسطين')}</option>
                <option value="Brands & businesses">{L('Brands & businesses', 'علامات تجارية وشركات')}</option>
                <option value="Arab market creators">{L('Arab market creators', 'صناع المحتوى في العالم العربي')}</option>
              </CustomSelect>
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Price Point ($)', 'السعر ($)')}
                  </label>
                  <input
                    type="text"
                    className="inp"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    placeholder="e.g. 97"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Course Duration', 'مدة الكورس')}
                  </label>
                  <CustomSelect className="inp" value={courseDuration} onChange={e => setCourseDuration(e.target.value)}>
                    <option value="4 Weeks">{L('4 Weeks', '٤ أسابيع')}</option>
                    <option value="6 Weeks">{L('6 Weeks', '٦ أسابيع')}</option>
                    <option value="8 Weeks">{L('8 Weeks', '٨ أسابيع')}</option>
                    <option value="12 Weeks">{L('12 Weeks', '١٢ أسبوع')}</option>
                  </CustomSelect>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Difficulty Level', 'مستوى الصعوبة')}
                  </label>
                  <CustomSelect className="inp" value={courseLevel} onChange={e => setCourseLevel(e.target.value)}>
                    <option value="Beginner">{L('Beginner', 'مبتدئ')}</option>
                    <option value="Intermediate">{L('Intermediate', 'متوسط')}</option>
                    <option value="Advanced">{L('Advanced', 'متقدم')}</option>
                  </CustomSelect>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Course Language', 'لغة الكورس')}
                  </label>
                  <CustomSelect className="inp" value={courseLanguage} onChange={e => setCourseLanguage(e.target.value)}>
                    <option value="Arabic">{L('Arabic', 'العربية')}</option>
                    <option value="English">{L('English', 'الإنجليزية')}</option>
                    <option value="Bilingual">{L('Bilingual', 'العربية والإنجليزية')}</option>
                  </CustomSelect>
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Skill Focus / Target Niches', 'المهارة المستهدفة / مجالات التخصص')}
              </label>
              <input
                type="text"
                className="inp"
                value={courseSkill}
                onChange={e => setCourseSkill(e.target.value)}
                placeholder="e.g. Sales, Instagram Reels, Notion"
              />
            </div>
            <button className="btn btn-prime" onClick={handleBuildCourse} disabled={courseIsGenerating} style={{ width: '100%', justifyContent: 'center' }}>
              {courseIsGenerating ? L('Generating Structure...', 'جاري التوليد بالذكاء الاصطناعي...') : `🤖 ${L('Generate Structure', 'إنشاء هيكل الكورس')}`}
            </button>
          </div>
        </div>
        <div className="card mb">
          <div className="sh"><div className="st">{L('Course Outline & Details', 'تفاصيل وهيكل الكورس')}</div></div>
          <div id="courseout" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {courseIsGenerating ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 1s ease-in-out infinite' }}>🤖</div>
                <div style={{ fontFamily: 'var(--ff)', fontSize: '14px', fontWeight: 600, color: 'var(--t1)' }}>
                  {L('AI is writing curriculum...', 'الذكاء الاصطناعي يقوم بصياغة المنهج والمميزات...')}
                </div>
              </div>
            ) : !courseOutlineData ? (
              <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                {L('Fill details and generate', 'املأ البيانات واضغط للإنشاء')}
              </div>
            ) : (
              <div>
                <div className="ai" style={{ marginBottom: '12px', padding: '10px', background: 'var(--orange-dim)', borderRadius: '8px' }}>
                  <strong>📚 "{courseOutlineData.topic}"</strong>
                  <br />
                  {L('Audience', 'الجمهور')}: {courseOutlineData.aud} · {L('Price', 'السعر')}: {courseOutlineData.price}
                  <br />
                  {L('Expected revenue', 'الإيرادات المتوقعة')} ({courseOutlineData.students} {L('students', 'طالب')}):{' '}
                  <strong style={{ color: 'var(--green)' }}>{courseOutlineData.rev}</strong>
                  <button className="btn btn-prime" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }} onClick={handleLaunchCourse}>
                    🚀 {L('Launch & Save Course', 'إطلاق وحفظ الكورس')}
                  </button>
                </div>
                {courseOutlineData.outline.map((m, mIdx) => (
                  <div style={{ marginBottom: '10px' }} key={mIdx}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--orange)', marginBottom: '5px' }}>
                      {m.m} ({m.ls.length} {L('lessons', 'دروس')})
                    </div>
                    {m.ls.map((ls, lIdx) => (
                      <div style={{ fontSize: '12px', color: 'var(--t2)', padding: '3px 0 3px 12px', borderLeft: '2px solid var(--edge2)' }} key={lIdx}>
                        ▸ {ls}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real course catalog list */}
      <div className="card mb">
        <div className="sh"><div className="st">{L('Your Courses', 'كورساتك')}</div></div>
        {(filteredCourses.length === 0) ? (
          <div style={{ padding: '20px', color: 'var(--t3)', textAlign: 'center', fontSize: '12.5px' }}>
            {L('No courses launched yet. Use the builder above to launch your first course!', 'لا توجد كورسات مطلقة بعد. استخدم المنشئ أعلاه لإطلاق أول كورس لك!')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredCourses.map(course => (
              <div key={course.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--edge)' }}>
                <div style={{ fontSize: '20px' }}>🎓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{course.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t2)' }}>
                    {course.audience} · {course.outline ? `${course.outline.length} modules` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--orange)' }}>
                      {formatMoney(course.price)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--t3)' }}>
                      {course.students} {L('students', 'طالب')}
                    </div>
                  </div>
                  <div style={{ minWidth: '80px', textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>
                      {formatMoney(course.revenue)}
                    </div>
                  </div>
                  <button
                    className="btn"
                    style={{ padding: '4px 8px', background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      confirmAction(L('Delete this course?', 'هل تريد حذف هذا الكورس؟'), () => {
                        const updated = GC.revenue.courses.filter(c => c.id !== course.id);
                        saveRevenueData({ courses: updated });
                      });
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
