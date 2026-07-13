'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function CalendarView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  const events = GC.calendar?.events || [];

  // Get dynamic today's date
  const todayDate = new Date();
  const tDay = todayDate.getDate();
  const tMonth = todayDate.getMonth();
  const tYear = todayDate.getFullYear();

  // Dynamic Calendar Navigation & Selection States
  const [currentMonth, setCurrentMonth] = useState(tMonth); 
  const [currentYear, setCurrentYear] = useState(tYear);
  const [selectedDay, setSelectedDay] = useState(tDay);
  const [filterType, setFilterType] = useState('all'); // 'all', 'content', 'coaching'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState(tDay);
  const [newType, setNewType] = useState('content');
  const [newTime, setNewTime] = useState('12:00 PM');

  // Populate default events if database has none
  useEffect(() => {
    if (events.length === 0) {
      const defaultEvents = [
        { id: 1, title: L('Morning Routine Reel', 'ريل روتين الصباح'), day: 15, month: 5, year: 2026, type: 'content', time: '9:00 AM' },
        { id: 2, title: L('Product Review Carousel', 'كاروسيل مراجعة منتج'), day: 16, month: 5, year: 2026, type: 'content', time: '6:00 PM' },
        { id: 3, title: L('Q&A Session', 'جلسة أسئلة وأجوبة'), day: 18, month: 5, year: 2026, type: 'content', time: '3:00 PM' },
        { id: 4, title: L('Nora Al-Rashidi — 1hr Strategy Session', 'نورة الرشيدي — جلسة استراتيجية ساعة'), day: 15, month: 5, year: 2026, type: 'coaching', time: '11:00 AM' },
        { id: 5, title: L('Ahmed Khalil — 30min Consult', 'أحمد خليل — استشارة ٣٠ دقيقة'), day: 16, month: 5, year: 2026, type: 'coaching', time: '2:00 PM' }
      ];
      saveGC({
        ...GC,
        calendar: {
          ...GC.calendar,
          events: defaultEvents
        }
      });
    }
  }, []);

  // Sync selected day with the form's day field
  useEffect(() => {
    if (selectedDay) {
      setNewDay(selectedDay);
    }
  }, [selectedDay]);

  const getEventMonth = (ev) => ev.month !== undefined ? ev.month : 5;
  const getEventYear = (ev) => ev.year !== undefined ? ev.year : 2026;

  // Filter events for the currently visible month and year
  const visibleEvents = events.filter(e => {
    const m = getEventMonth(e);
    const y = getEventYear(e);
    return m === currentMonth && y === currentYear;
  });

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(1);
  };

  const handleDayClick = (day) => {
    if (day) {
      setSelectedDay(day);
      setNewDay(day);
      setShowDayEventsModal(true);
    }
  };

  const handleAddClick = (e, day) => {
    e.stopPropagation();
    setSelectedDay(day);
    setNewDay(day);
    setShowAddModal(true);
  };

  const handleAddEvent = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const newEv = {
      id: Date.now(),
      title: newTitle,
      day: parseInt(newDay) || 1,
      month: currentMonth,
      year: currentYear,
      type: newType,
      time: newTime
    };

    const updatedEvents = [...events, newEv];
    saveGC({
      ...GC,
      calendar: {
        ...GC.calendar,
        events: updatedEvents
      }
    });

    setNewTitle('');
    alert(L('Event added to calendar!', 'تمت إضافة الحدث للتقويم!'));
  };

  const handleDeleteEvent = (id) => {
    const updatedEvents = events.filter(e => e.id !== id);
    saveGC({
      ...GC,
      calendar: {
        ...GC.calendar,
        events: updatedEvents
      }
    });
  };

  const handleOptimizeSchedule = () => {
    alert(L('AI Schedule optimization: Your content calendar has been aligned with peak engagement hours (6:00 PM for carousels, 9:00 AM for reels).', 'تحسين الجدول بالـ AI: تمت محاذاة منشوراتك مع ساعات التفاعل القصوى للجمهور.'));
  };

  // Grid logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const paddingCells = Array.from({ length: startWeekday }, (_, i) => null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridCells = [...paddingCells, ...dayCells];

  const weekDays = lang === 'ar' 
    ? ['أح', 'اث', 'ثلا', 'أر', 'خم', 'جم', 'سب'] 
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const selectedDayEvents = visibleEvents.filter(e => e.day === selectedDay);
  const monthContentCount = visibleEvents.filter(e => e.type === 'content').length;
  const monthCoachingCount = visibleEvents.filter(e => e.type === 'coaching').length;

  return (
    <div className="pg on" id="pg-calendar">
      {/* Dynamic Inline Styles for Premium Micro-interactions */}
      <style>{`
        .cal-day-cell {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s, box-shadow 0.2s !important;
        }
        .cal-day-cell:hover {
          transform: translateY(-2px) scale(1.04) !important;
          border-color: var(--orange) !important;
          box-shadow: 0 4px 12px rgba(255,107,53,0.18) !important;
          background: var(--surface3) !important;
        }
        .btn-chevron {
          background: var(--surface2);
          border: 1px solid var(--edge2);
          color: var(--t1);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.15s ease;
        }
        .btn-chevron:hover {
          background: linear-gradient(135deg, var(--orange), var(--purple));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(255,107,53,0.3);
        }
        .filter-chip {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--edge2);
          background: var(--surface2);
          color: var(--t2);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-chip:hover {
          color: var(--t1);
          background: var(--surface3);
        }
        .filter-chip.on {
          background: linear-gradient(135deg, var(--orange), var(--purple));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 10px rgba(255, 107, 53, 0.25);
        }
        .day-add-btn {
          opacity: 0.7;
          transition: all 0.2s ease !important;
        }
        .day-add-btn:hover {
          opacity: 1 !important;
          background: var(--orange) !important;
          color: #fff !important;
          border-color: transparent !important;
          transform: scale(1.1) !important;
        }
      `}</style>

      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">📅</span>
          <span>{L('Smart Calendar', 'التقويم الذكي')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={handleOptimizeSchedule}>
            {L('Optimize Schedule', 'تحسين الجدول')}
          </button>
        </div>
      </div>

      <div className="g21">
        <div>
          <div className="card mb">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button className="btn-chevron" onClick={handlePrevMonth} title={L('Previous Month', 'الشهر السابق')}>◀</button>
                  <div className="sec-title" style={{ fontSize: '17px', fontWeight: 800, minWidth: '130px', textAlign: 'center' }}>
                    {L(`${monthNamesEn[currentMonth]} ${currentYear}`, `${monthNamesAr[currentMonth]} ${currentYear}`)}
                  </div>
                  <button className="btn-chevron" onClick={handleNextMonth} title={L('Next Month', 'الشهر التالي')}>▶</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', color: 'var(--t3)', marginTop: '6px', justifyContent: 'center' }}>
                  <span>📱 {monthContentCount} {L('Posts', 'منشورات')}</span>
                  <span>•</span>
                  <span>🤝 {monthCoachingCount} {L('Coaching', 'جلسات')}</span>
                </div>
              </div>

              {/* Filtering Chips */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className={`filter-chip ${filterType === 'all' ? 'on' : ''}`} 
                  onClick={() => setFilterType('all')}
                >
                  {L('All', 'الكل')}
                </button>
                <button 
                  className={`filter-chip ${filterType === 'content' ? 'on' : ''}`} 
                  onClick={() => setFilterType('content')}
                >
                  📱 {L('Content', 'المحتوى')}
                </button>
                <button 
                  className={`filter-chip ${filterType === 'coaching' ? 'on' : ''}`} 
                  onClick={() => setFilterType('coaching')}
                >
                  🤝 {L('Coaching', 'الكوتشينج')}
                </button>
              </div>
            </div>

            {/* Calendar Grid Week Labels */}
            <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
              {weekDays.map(d => (
                <div className="cal-lbl" style={{ fontWeight: 700, fontSize: '12px', color: 'var(--t2)' }} key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Grid Days */}
            <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {gridCells.map((day, idx) => {
                if (day === null) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      style={{ 
                        aspectRatio: '1', 
                        background: 'transparent', 
                        border: '1px dashed rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px'
                      }} 
                    />
                  );
                }

                const dayEvents = visibleEvents.filter(e => e.day === day);
                const dayFilteredEvents = dayEvents.filter(e => filterType === 'all' || e.type === filterType);
                const hasEv = dayFilteredEvents.length > 0;
                
                // Context matches for today's representation
                const isTodayCell = day === tDay && currentMonth === tMonth && currentYear === tYear;
                const isSelectedCell = day === selectedDay;

                return (
                  <div 
                    key={`day-${day}`}
                    className={`cal-day cal-day-cell ${hasEv ? 'has-event' : ''} ${isTodayCell ? 'today' : ''}`}
                    style={{
                      aspectRatio: '1',
                      padding: '8px 6px',
                      borderRadius: '8px',
                      background: isTodayCell 
                        ? 'linear-gradient(135deg, var(--orange-d), var(--purple-dim))' 
                        : isSelectedCell 
                          ? 'var(--surface3)' 
                          : 'var(--surface2)',
                      border: isTodayCell 
                        ? '2px solid var(--orange)' 
                        : isSelectedCell 
                          ? '2px solid var(--purple)' 
                          : hasEv 
                            ? '1px solid rgba(255,107,53,0.3)' 
                            : '1px solid var(--edge)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'stretch',
                      fontSize: '13px',
                      fontWeight: isTodayCell || isSelectedCell ? 700 : 500,
                      color: isTodayCell ? 'var(--orange)' : isSelectedCell ? 'var(--purple)' : 'var(--t1)',
                      boxShadow: isSelectedCell ? '0 0 10px rgba(108, 53, 255, 0.25)' : 'none',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}
                    onClick={() => handleDayClick(day)}
                  >
                    {/* Day Number Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{day}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isTodayCell && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--orange)', boxShadow: '0 0 6px var(--orange)' }} />
                        )}
                        <button 
                          className="day-add-btn" 
                          onClick={(e) => handleAddClick(e, day)}
                          style={{
                            background: 'var(--surface3)',
                            border: '1px solid var(--edge2)',
                            borderRadius: '4px',
                            color: 'var(--t2)',
                            fontSize: '10px',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                          title={L('Add Event', 'إضافة حدث')}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Event pills */}
                    {hasEv && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', overflow: 'hidden' }}>
                        {dayFilteredEvents.slice(0, 2).map((ev, i) => (
                          <div 
                            key={ev.id} 
                            style={{ 
                              width: '100%', 
                              fontSize: '9.5px', 
                              padding: '2px 4px', 
                              borderRadius: '4px', 
                              background: ev.type === 'coaching' ? 'var(--green-d)' : 'rgba(108, 53, 255, 0.12)', 
                              color: ev.type === 'coaching' ? 'var(--green)' : 'var(--purple)',
                              borderLeft: `2.5px solid ${ev.type === 'coaching' ? 'var(--green)' : 'var(--purple)'}`,
                              textAlign: lang === 'ar' ? 'right' : 'left',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              boxSizing: 'border-box',
                              lineHeight: '1.2'
                            }}
                            title={`${ev.time} - ${ev.title}`}
                          >
                            <span style={{ fontWeight: 700, marginRight: '3px' }}>{ev.time.replace(/ AM| PM/g, '')}</span>
                            {ev.title}
                          </div>
                        ))}
                        {dayFilteredEvents.length > 2 && (
                          <div style={{ fontSize: '8.5px', color: 'var(--t3)', fontWeight: 700, paddingLeft: '4px', paddingTop: '1px' }}>
                            +{dayFilteredEvents.length - 2} {L('more', 'المزيد')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Day Details Panel */}
          <div className="card mb">
            <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--edge)', paddingBottom: '10px', marginBottom: '12px' }}>
              <div className="sec-title">
                📅 {L(`Events on ${monthNamesEn[currentMonth]} ${selectedDay}, ${currentYear}`, `أحداث يوم ${selectedDay} ${monthNamesAr[currentMonth]}، ${currentYear}`)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="btn btn-prime" 
                  style={{ padding: '4px 10px', fontSize: '11.5px' }} 
                  onClick={() => setShowAddModal(true)}
                >
                  + {L('Add Event', 'إضافة حدث')}
                </button>
                <span className="badge b-purple">{selectedDayEvents.length}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--t3)', textAlign: 'center', padding: '16px 10px' }}>
                  {L('No events scheduled for this day.', 'لا توجد أحداث مجدولة لهذا اليوم.')}
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div 
                    key={ev.id} 
                    className="row" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: '12px', 
                      padding: '10px 12px', 
                      background: 'var(--surface2)', 
                      borderRadius: '8px', 
                      borderLeft: `4px solid ${ev.type === 'coaching' ? 'var(--green)' : 'var(--purple)'}`,
                      borderBottom: 'none'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span className={`badge ${ev.type === 'coaching' ? 'b-green' : 'b-purple'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {ev.type === 'coaching' ? L('Coaching', 'جلسة') : L('Content', 'محتوى')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>⏰ {ev.time}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{ev.title}</div>
                    </div>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => handleDeleteEvent(ev.id)} 
                      style={{ 
                        padding: '4px 8px', 
                        color: 'var(--red)', 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title={L('Delete Event', 'حذف الحدث')}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

      {/* Day Events Modal Popup */}
      {showDayEventsModal && (
        <div className="modal-overlay" onClick={() => setShowDayEventsModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDayEventsModal(false)}>✕</button>
            
            <div className="sec-hd" style={{ marginBottom: '16px', borderBottom: '1px solid var(--edge)', paddingBottom: '10px' }}>
              <div className="sec-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                📅 {L(`Events on ${monthNamesEn[currentMonth]} ${selectedDay}, ${currentYear}`, `أحداث يوم ${selectedDay} ${monthNamesAr[currentMonth]}، ${currentYear}`)}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--t3)', textAlign: 'center', padding: '24px 10px' }}>
                  {L('No events scheduled for this day.', 'لا توجد أحداث مجدولة لهذا اليوم.')}
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div 
                    key={ev.id} 
                    className="row" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: '12px', 
                      padding: '10px 12px', 
                      background: 'var(--surface2)', 
                      borderRadius: '8px', 
                      borderLeft: `4px solid ${ev.type === 'coaching' ? 'var(--green)' : 'var(--purple)'}`,
                      borderBottom: 'none'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span className={`badge ${ev.type === 'coaching' ? 'b-green' : 'b-purple'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {ev.type === 'coaching' ? L('Coaching', 'جلسة') : L('Content', 'محتوى')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>⏰ {ev.time}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{ev.title}</div>
                    </div>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => handleDeleteEvent(ev.id)} 
                      style={{ 
                        padding: '4px 8px', 
                        color: 'var(--red)', 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title={L('Delete Event', 'حذف الحدث')}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowDayEventsModal(false)}>
                {L('Close', 'إغلاق')}
              </button>
              <button 
                className="btn btn-prime" 
                onClick={() => {
                  setShowDayEventsModal(false);
                  setShowAddModal(true);
                }}
              >
                + {L('Add Event', 'إضافة حدث')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Event Modal Popup */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            
            <div className="sec-hd" style={{ marginBottom: '16px', borderBottom: '1px solid var(--edge)', paddingBottom: '10px' }}>
              <div className="sec-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                ✍️ {L(`Schedule Event: ${monthNamesEn[currentMonth]} ${newDay}, ${currentYear}`, `جدولة حدث: ${newDay} ${monthNamesAr[currentMonth]}، ${currentYear}`)}
              </div>
            </div>
            
            <form onSubmit={(e) => { handleAddEvent(e); setShowAddModal(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Event Title', 'عنوان الحدث')}</label>
                <input 
                  className="inp" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder={L('e.g. Q&A Live Session', 'مثال: بث مباشر أسئلة وأجوبة')} 
                  required 
                  autoFocus
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L(`Day (1-${daysInMonth})`, `اليوم (١-${daysInMonth})`)}</label>
                  <input 
                    className="inp" 
                    type="number" 
                    min="1" 
                    max={daysInMonth} 
                    value={newDay} 
                    onChange={e => setNewDay(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Time', 'الوقت')}</label>
                  <input 
                    className="inp" 
                    value={newTime} 
                    onChange={e => setNewTime(e.target.value)} 
                    placeholder="e.g. 12:00 PM" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Event Category', 'تصنيف الحدث')}</label>
                <select className="inp" value={newType} onChange={e => setNewType(e.target.value)}>
                  <option value="content">{L('Social Post / Content', 'منشور / محتوى')}</option>
                  <option value="coaching">{L('Coaching Session', 'جلسة كوتشينج')}</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  {L('Cancel', 'إلغاء')}
                </button>
                <button type="submit" className="btn btn-prime">
                  + {L('Add Event', 'إضافة الحدث')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

        <div>
          {/* Upcoming Content Panel */}
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">📋 {L('Content Posts Scheduled', 'منشورات المحتوى المجدولة')}</div></div>
            <div id="cal-upcoming-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.filter(e => e.type === 'content').length === 0 ? (
                <div style={{ fontSize: '12.5px', color: 'var(--t3)', textAlign: 'center', padding: '12px' }}>
                  {L('No content scheduled.', 'لا يوجد محتوى مجدول.')}
                </div>
              ) : (
                events.filter(e => e.type === 'content').map((e) => {
                  const evMonth = getEventMonth(e);
                  const evYear = getEventYear(e);
                  return (
                    <div className="row" key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                      <div className="rn" style={{ 
                        fontSize: '12.5px', 
                        fontWeight: 600,
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {L(
                          `Day ${e.day} (${monthNamesEn[evMonth]} ${evYear}) @ ${e.time} — ${e.title}`, 
                          `يوم ${e.day} (${monthNamesAr[evMonth]} ${evYear}) @ ${e.time} — ${e.title}`
                        )}
                      </div>
                      <button className="btn btn-ghost" onClick={() => handleDeleteEvent(e.id)} style={{ padding: '2px 6px', color: 'var(--red)', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Coaching Sessions Panel */}
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">🎯 {L('Coaching Sessions', 'جلسات الكوتشينج')}</div></div>
            <div id="cal-sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.filter(e => e.type === 'coaching').length === 0 ? (
                <div style={{ fontSize: '12.5px', color: 'var(--t3)', textAlign: 'center', padding: '12px' }}>
                  {L('No coaching sessions scheduled.', 'لا توجد جلسات كوتشينج جدولة.')}
                </div>
              ) : (
                events.filter(e => e.type === 'coaching').map((e) => {
                  const evMonth = getEventMonth(e);
                  const evYear = getEventYear(e);
                  return (
                    <div className="row" key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                      <div style={{ flex: 1 }}>
                        <div className="rn" style={{ 
                          fontSize: '12.5px', 
                          fontWeight: 600,
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {L(
                            `Day ${e.day} (${monthNamesEn[evMonth]} ${evYear}) @ ${e.time} — ${e.title}`, 
                            `يوم ${e.day} (${monthNamesAr[evMonth]} ${evYear}) @ ${e.time} — ${e.title}`
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge b-green">{L('Confirmed', 'مؤكدة')}</span>
                        <button className="btn btn-ghost" onClick={() => handleDeleteEvent(e.id)} style={{ padding: '2px 6px', color: 'var(--red)', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
