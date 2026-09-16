'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Folder, 
  Clock, 
  List, 
  Grid, 
  MoreVertical, 
  Globe, 
  Video, 
  Radio, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Edit3, 
  Calendar,
  Layers,
  Sparkles,
  Users,
  Home
} from 'lucide-react';

export default function WebinarListView({
  webinars = [],
  isRtl,
  onSelectWebinar,
  onOpenCreateModal,
  onDuplicateWebinar,
  onDeleteWebinar
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);

  // Filter webinars by search query
  const filteredWebinars = webinars.filter(w => 
    w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '0 24px', direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Top Header matching Screenshot 1 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
            {isRtl ? 'مسارات الويبينار (Webinar funnels)' : 'Webinar funnels'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--t2)' }}>
            {isRtl ? 'إنشاء وإدارة مسارات الويبينار لجمع المشتركين والعملاء وتوجيههم لغرفة البث' : 'Create and manage webinar funnels'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Folders Button */}
          <button
            type="button"
            onClick={() => alert(isRtl ? 'إدارة المجلدات' : 'Folder Management')}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge2)',
              borderRadius: '8px',
              padding: '9px 12px',
              color: 'var(--t2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isRtl ? 'المجلدات' : 'Folders'}
          >
            <Folder size={18} />
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? '+ مسار ويبينار جديد' : '+ New webinar funnel'}</span>
          </button>
        </div>
      </div>

      {/* Main Table Container matching Screenshot 1 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        
        {/* Navigation & Search Tool Bar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--edge2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Breadcrumb path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t2)', fontSize: '13px' }}>
            <Home size={16} />
            <span>/</span>
            <span style={{ fontWeight: '700', color: 'var(--t1)' }}>{isRtl ? 'جميع الويبينارات' : 'All webinars'}</span>
          </div>

          {/* Right Tools: History, View toggle, Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--t3)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isRtl ? 'السجل' : 'History'}
            >
              <Clock size={17} />
            </button>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '6px', padding: '2px', border: '1px solid var(--edge)' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  color: viewMode === 'table' ? 'var(--t1)' : 'var(--t3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  color: viewMode === 'grid' ? 'var(--t1)' : 'var(--t3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Grid size={15} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: isRtl ? 'auto' : '10px',
                  right: isRtl ? '10px' : 'auto',
                  color: 'var(--t3)'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث في مسارات الويبينار...' : 'Search for webinars'}
                style={{
                  padding: '7px 12px',
                  paddingLeft: isRtl ? '12px' : '32px',
                  paddingRight: isRtl ? '32px' : '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--edge2)',
                  background: 'var(--surface2)',
                  color: 'var(--t1)',
                  fontSize: '13px',
                  width: '200px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Empty State matching Screenshot 1 */}
        {filteredWebinars.length === 0 ? (
          <div style={{
            padding: '70px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px'
          }}>
            {/* Clean Browser / Video Mockup Illustration */}
            <div style={{
              width: '180px',
              height: '110px',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
              </div>
              <div style={{ width: '100%', height: '40px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <Video size={22} />
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '40%', height: '6px', background: '#cbd5e1', borderRadius: '3px' }} />
                <div style={{ width: '30%', height: '6px', background: '#e2e8f0', borderRadius: '3px' }} />
              </div>
            </div>

            <h3 style={{ margin: '10px 0 0', fontSize: '18px', fontWeight: '800', color: 'var(--t1)' }}>
              {isRtl ? 'ابدأ بإنشاء أول ويبينار' : 'Start by creating a webinar'}
            </h3>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--t2)', maxWidth: '440px', lineHeight: '1.5' }}>
              {isRtl
                ? 'أنشئ مسارات ويبينار متكاملة لتسجيل العملاء والمهتمين وتوجيههم لغرفة البث المباشر أو المسجل!'
                : 'Create and manage webinar funnels to register prospects and customers for your webinars!'}
            </p>

            <button
              type="button"
              onClick={onOpenCreateModal}
              style={{
                marginTop: '10px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>{isRtl ? '+ مسار ويبينار جديد' : '+ New webinar funnel'}</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge2)', color: 'var(--t2)', fontSize: '12.5px', fontWeight: '700' }}>
                  <th style={{ padding: '14px 20px' }}>{isRtl ? 'اسم الويبينار' : 'Name'}</th>
                  <th style={{ padding: '14px 20px' }}>{isRtl ? 'النوع' : 'Type'}</th>
                  <th style={{ padding: '14px 20px' }}>{isRtl ? 'آخر تحديث' : 'Last updated'}</th>
                  <th style={{ padding: '14px 20px' }}>{isRtl ? 'صفحات الويبينار' : 'Webinar pages'}</th>
                  <th style={{ padding: '14px 20px', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredWebinars.map((webinar, idx) => (
                  <tr
                    key={webinar.id || idx}
                    onClick={() => onSelectWebinar(webinar)}
                    style={{
                      borderBottom: '1px solid var(--edge2)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: webinar.type === 'live' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                          color: webinar.type === 'live' ? '#ef4444' : '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {webinar.type === 'live' ? <Radio size={18} /> : <Video size={18} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--t1)' }}>
                            {webinar.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--t3)' }}>
                            {webinar.domain || 'upklick.com/w/' + webinar.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        background: webinar.type === 'live' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                        color: webinar.type === 'live' ? '#ef4444' : '#2563eb'
                      }}>
                        {webinar.type === 'live' ? (isRtl ? '📡 بث مباشر' : '📡 Live stream') : (isRtl ? '⚡ عند الطلب' : '⚡ On demand')}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--t2)' }}>
                      {webinar.lastUpdated || 'Today'}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--edge)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--t1)'
                      }}>
                        {webinar.pages?.length || 4} {isRtl ? 'خطوات / صفحات' : 'steps / pages'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuIdx(activeMenuIdx === idx ? null : idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuIdx === idx && (
                        <div style={{
                          position: 'absolute',
                          top: '40px',
                          left: isRtl ? '20px' : 'auto',
                          right: isRtl ? 'auto' : '20px',
                          background: 'var(--surface)',
                          border: '1px solid var(--edge2)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          padding: '6px',
                          zIndex: 100,
                          minWidth: '150px'
                        }}>
                          <button
                            type="button"
                            onClick={() => { setActiveMenuIdx(null); onSelectWebinar(webinar); }}
                            style={{ width: '100%', background: 'none', border: 'none', padding: '8px 10px', fontSize: '13px', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left' }}
                          >
                            <Edit3 size={14} />
                            <span>{isRtl ? 'تعديل المسار' : 'Edit Funnel'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setActiveMenuIdx(null); if (onDuplicateWebinar) onDuplicateWebinar(webinar); }}
                            style={{ width: '100%', background: 'none', border: 'none', padding: '8px 10px', fontSize: '13px', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left' }}
                          >
                            <Copy size={14} />
                            <span>{isRtl ? 'نسخ الويبينار' : 'Duplicate'}</span>
                          </button>
                          <div style={{ height: '1px', background: 'var(--edge2)', margin: '4px 0' }} />
                          <button
                            type="button"
                            onClick={() => { setActiveMenuIdx(null); if (onDeleteWebinar) onDeleteWebinar(webinar.id); }}
                            style={{ width: '100%', background: 'none', border: 'none', padding: '8px 10px', fontSize: '13px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left' }}
                          >
                            <Trash2 size={14} />
                            <span>{isRtl ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* GRID CARDS VIEW */
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredWebinars.map((webinar, idx) => (
              <div
                key={webinar.id || idx}
                onClick={() => onSelectWebinar(webinar)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge2)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: webinar.type === 'live' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                    color: webinar.type === 'live' ? '#ef4444' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {webinar.type === 'live' ? <Radio size={20} /> : <Video size={20} />}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: webinar.type === 'live' ? '#fee2e2' : '#eff6ff',
                    color: webinar.type === 'live' ? '#dc2626' : '#2563eb'
                  }}>
                    {webinar.type === 'live' ? 'LIVE' : 'ON DEMAND'}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '800', color: 'var(--t1)' }}>
                    {webinar.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--t3)' }}>
                    {webinar.pages?.length || 4} {isRtl ? 'صفحات ومراحل' : 'funnel pages'}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--edge)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--t2)' }}>
                  <span>{webinar.lastUpdated || 'Today'}</span>
                  <span style={{ color: '#2563eb', fontWeight: '700' }}>{isRtl ? 'فتح المسار ←' : 'Open funnel →'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
