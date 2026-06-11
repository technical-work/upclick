'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function CalendarView() {
  const { lang, L, t } = useBusiness();

  const eventDays = [3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 28];
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="pg on" id="pg-calendar">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">📅</span>
          <span>{L('Smart Calendar', 'التقويم الذكي')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={() => alert('Optimize schedule...')}>
            {L('Optimize Schedule', 'تحسين الجدول')}
          </button>
          <button className="btn btn-prime" onClick={() => alert(L('Add event modal opened', 'تم فتح إضافة حدث'))}>
            + {L('New Event', 'حدث جديد')}
          </button>
        </div>
      </div>

      <div className="g21">
        <div className="card mb">
          <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div className="sec-title">{L('June 2026', 'يونيو ٢٠٢٦')}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: '11px' }}>‹</button>
              <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: '11px' }}>▶</button>
            </div>
          </div>
          <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '6px' }}>
            {(lang === 'ar' ? ['أح', 'اث', 'ثلا', 'أر', 'خم', 'جم', 'سب'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map(d => (
              <div className="cal-lbl" style={{ fontWeight: 600, fontSize: '11px', color: 'var(--t2)' }} key={d}>{d}</div>
            ))}
          </div>
          <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {calendarDays.map(day => {
              const hasEv = eventDays.includes(day);
              const isToday = day === 15;
              return (
                <div 
                  key={day}
                  className={`cal-day ${hasEv ? 'has-event' : ''} ${isToday ? 'today' : ''}`}
                  style={{
                    padding: '12px 6px',
                    borderRadius: '6px',
                    background: isToday ? 'var(--orange-d)' : 'var(--surface2)',
                    border: isToday ? '1.5px solid var(--orange)' : hasEv ? '1px solid var(--purple-d)' : '1px solid var(--edge)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: isToday ? 700 : 500
                  }}
                  onClick={() => alert(L(`Day ${day} — Click to add event`, `يوم ${day} — اضغط لإضافة حدث`))}
                >
                  {day}
                  {hasEv && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--purple)', margin: '4px auto 0' }}></div>}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">📋 {L('Upcoming Events', 'الفعاليات القادمة')}</div></div>
            <div id="cal-upcoming-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                L('Today 9:00 AM — Morning Routine Reel', 'اليوم ٩:٠٠ ص — ريل روتين الصباح'),
                L('Tomorrow 6:00 PM — Product Review Carousel', 'غداً ٦:٠٠ م — كاروسيل مراجعة منتج'),
                L('Fri 3:00 PM — Q&A Session', 'الجمعة ٣:٠٠ م — جلسة أسئلة وأجوبة')
              ].map((e, idx) => (
                <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                  <div className="rn" style={{ fontSize: '12.5px', fontWeight: 600 }}>{e}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">🎯 {L('Coaching Sessions', 'جلسات الكوتشينج')}</div></div>
            <div id="cal-sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                L('Nora Al-Rashidi — 1hr Strategy Session', 'نورة الرشيدي — جلسة استراتيجية ساعة'),
                L('Ahmed Khalil — 30min Consult', 'أحمد خليل — استشارة ٣٠ دقيقة')
              ].map((e, idx) => (
                <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                  <div style={{ flex: 1 }}>
                    <div className="rn" style={{ fontSize: '12.5px', fontWeight: 600 }}>{e}</div>
                  </div>
                  <span className="badge b-green">{L('Confirmed', 'مؤكدة')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
