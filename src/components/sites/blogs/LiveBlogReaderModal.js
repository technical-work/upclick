'use client';

import React from 'react';
import { X, Calendar, User, Share2, ArrowLeft, ArrowRight, Eye, Bookmark, Tag } from 'lucide-react';

export default function LiveBlogReaderModal({
  isOpen,
  onClose,
  post,
  blogSite,
  isRtl = false,
  showToast
}) {
  if (!isOpen || !post) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    if (showToast) showToast(isRtl ? 'تم نسخ رابط المقال للمشاركة 🔗' : 'Article link copied to clipboard 🔗');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '24px',
      direction: isRtl ? 'rtl' : 'ltr',
      animation: 'fadeIn 0.2s ease'
    }}>
      
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        color: 'var(--t1)'
      }}>
        
        {/* Top Floating Close & Share Bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--edge2)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2563eb' }}>{blogSite?.name || 'UpKlick Blog'}</span>
            <span>/</span>
            <span>{post.category || 'Article'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleShare}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                color: 'var(--t1)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={14} />
              <span>{isRtl ? 'مشاركة' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--surface2)',
                border: 'none',
                color: 'var(--t2)',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div style={{ padding: '36px 44px 60px' }}>
          
          {/* Post Header */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: '800',
              padding: '4px 10px',
              borderRadius: '6px',
              display: 'inline-block',
              marginBottom: '14px'
            }}>
              {post.category || 'Insights'}
            </span>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '900',
              lineHeight: 1.3,
              margin: '0 0 16px',
              color: 'var(--t1)'
            }}>
              {post.title}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px',
              color: 'var(--t3)',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--edge2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--t1)', fontWeight: '700' }}>
                <User size={15} />
                <span>{post.author || 'Admin'}</span>
              </div>
              <span>·</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} />
                <span>{post.lastUpdated || 'Today'}</span>
              </div>
              <span>·</span>
              <span>{post.readTime || '4 min read'}</span>
            </div>
          </div>

          {/* Featured Cover Image */}
          {post.coverImage && (
            <div style={{
              width: '100%',
              height: '360px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '32px',
              border: '1px solid var(--edge2)'
            }}>
              <img
                src={post.coverImage}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Rendered HTML Content */}
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: '16px',
              lineHeight: 1.9,
              color: 'var(--t1)'
            }}
          />

          {/* Footer Callout */}
          <div style={{
            marginTop: '48px',
            padding: '24px',
            background: 'var(--surface2)',
            borderRadius: '12px',
            border: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--t1)', marginBottom: '4px' }}>
                {isRtl ? 'هل أعجبك هذا المقال؟' : 'Did you find this article helpful?'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t3)' }}>
                {isRtl ? 'شارك المعرفة مع فريقك وشبكتك الاحترافية.' : 'Share this post with your professional network.'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={15} />
              <span>{isRtl ? 'مشاركة المقال' : 'Share article'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
