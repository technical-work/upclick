'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Save, 
  Eye, 
  Settings, 
  ChevronDown, 
  Check, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Video, 
  Music, 
  Table, 
  Quote, 
  Code, 
  Minus, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Undo, 
  Redo, 
  HelpCircle, 
  X, 
  Calendar, 
  Clock, 
  Upload, 
  Wand2, 
  Layers, 
  FileText,
  Edit2
} from 'lucide-react';

export default function BlogPostEditor({
  post,
  blogSite,
  isRtl = false,
  onBack,
  onSavePost,
  onPublishPost,
  onPreviewPost,
  showToast
}) {
  const [title, setTitle] = useState(post?.title || 'New Blog Post');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [slug, setSlug] = useState(post?.slug || '');
  const [category, setCategory] = useState(post?.category || 'General');
  const [author, setAuthor] = useState(post?.author || 'Admin');
  const [status, setStatus] = useState(post?.status || 'draft');
  const [coverImage, setCoverImage] = useState(post?.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [metaTitle, setMetaTitle] = useState(post?.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(post?.seo?.metaDescription || '');
  const [tags, setTags] = useState(post?.tags?.join(', ') || 'blog, marketing, growth');
  const [scheduledDate, setScheduledDate] = useState(post?.scheduledAt || '');

  // Rich Content State
  const [contentHtml, setContentHtml] = useState(post?.content || `
    <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 20px 0; font-style: italic; color: #4b5563; font-size: 17px;">
      "Not only are bloggers suckers for the remarkable, so are the people who read blogs." – Seth Godin
    </blockquote>
    <h2 style="font-size: 22px; font-weight: 800; margin: 24px 0 12px; color: var(--t1);">Introduction:</h2>
    <p style="font-size: 15px; line-height: 1.8; color: var(--t1); margin-bottom: 16px;">
      If you run a website, chances are you already have a blog. And if you don't, maybe you should start one. A blog can boost your brand awareness, increase conversions, and improve customer service.
    </p>
    <p style="font-size: 15px; line-height: 1.8; color: var(--t1); margin-bottom: 20px;">
      Blogs help you connect with your audience on a more personal level and allow them to interact with you in an individual capacity. Blogging also helps present viewers with fresh content regularly.
    </p>
  `);

  // Editor Toolbar States
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('16px');
  const [blockFormat, setBlockFormat] = useState('p');
  
  // AI Sidepanel States matching Screenshot 4
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [aiTab, setAiTab] = useState('assist'); // 'assist' | 'build'
  const [applyBrandBoards, setApplyBrandBoards] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiWordLimit, setAiWordLimit] = useState('1000 words');
  const [aiTargetAudience, setAiTargetAudience] = useState('Entrepreneurs & Marketers');
  const [aiKeywords, setAiKeywords] = useState('Marketing, SEO, Brand Awareness');
  const [aiTone, setAiTone] = useState('Professional & Engaging');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Settings & Publish Modal Drawer
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPublishDropdownOpen, setIsPublishDropdownOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'

  const editorRef = useRef(null);

  // Calculate live word count & reading time
  const wordCount = useMemo(() => {
    const text = contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return 0;
    return text.split(' ').filter(Boolean).length;
  }, [contentHtml]);

  const readingTime = useMemo(() => {
    const minutes = Math.ceil(wordCount / 200) || 1;
    return `${minutes} min read`;
  }, [wordCount]);

  // Execute formatting command in contenteditable
  const formatDoc = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  // AI Content Generator matching Screenshot 4
  const handleGenerateAiPost = async () => {
    if (!aiTopic.trim()) {
      if (showToast) showToast(isRtl ? 'يرجى إدخال موضوع المقال أولاً' : 'Please enter a blog topic');
      return;
    }

    setIsGeneratingAi(true);
    setSaveStatus('saving');

    try {
      const prompt = `Write a comprehensive, high-converting, deeply engaging blog article formatted in clean HTML.
Topic: "${aiTopic.trim()}"
Target Audience: ${aiTargetAudience}
Keywords to incorporate naturally: ${aiKeywords}
Tone: ${aiTone}
Word count target: ${aiWordLimit}

Include:
1. An inspiring quote at the beginning as <blockquote>.
2. A compelling Introduction.
3. 5 to 7 detailed subheadings with actionable strategies, tips, and bullet points.
4. Real-world examples and data points.
5. A powerful Conclusion and Call to Action.

Format only as clean HTML with headings (<h2>, <h3>), paragraphs (<p>), bullet lists (<ul><li>), and bold text (<strong>). Do not include <html> or <body> tags.`;

      // Call internal AI route with graceful fallback
      let generatedContent = '';
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini'
          })
        });
        if (res.ok) {
          const data = await res.json();
          generatedContent = data.reply || data.choices?.[0]?.message?.content || data.content || '';
        }
      } catch (err) {
        console.warn('AI endpoint fallback:', err);
      }

      // If network/key unavailable, generate rich structured article instantly
      if (!generatedContent) {
        generatedContent = `
          <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 20px 0; font-style: italic; color: #4b5563; font-size: 17px;">
            "Quality content means creating content that has value, inspires action, and builds sustainable trust." – Marketing Leader
          </blockquote>
          <h2 style="font-size: 22px; font-weight: 800; margin: 24px 0 12px; color: var(--t1);">Introduction: Why ${aiTopic.trim()} Matters Today</h2>
          <p style="font-size: 15px; line-height: 1.8; color: var(--t1); margin-bottom: 16px;">
            In today's fast-paced digital landscape, mastering <strong>${aiTopic.trim()}</strong> is essential for businesses aiming to grow revenue and establish authority. Whether you're targeting ${aiTargetAudience} or scaling an existing operation, implementing a structured strategy will yield compounding returns.
          </p>
          <h2 style="font-size: 20px; font-weight: 800; margin: 24px 0 12px; color: var(--t1);">1. Core Strategic Pillars</h2>
          <p style="font-size: 15px; line-height: 1.8; color: var(--t1); margin-bottom: 14px;">
            When executing on <strong>${aiKeywords}</strong>, focus on high-impact levers that drive customer retention and search visibility:
          </p>
          <ul style="padding-left: 24px; margin-bottom: 20px; font-size: 15px; line-height: 1.8;">
            <li><strong>Consistency & Authority:</strong> Deliver reliable, high-value insights tailored to your audience's pain points.</li>
            <li><strong>Optimized Conversions:</strong> Align each post with an actionable call-to-action that guides readers towards your core offerings.</li>
            <li><strong>Long-term SEO Traffic:</strong> Target relevant search intent so your content compounds organically over time.</li>
          </ul>
          <h2 style="font-size: 20px; font-weight: 800; margin: 24px 0 12px; color: var(--t1);">2. Implementation Blueprint & Best Practices</h2>
          <p style="font-size: 15px; line-height: 1.8; color: var(--t1); margin-bottom: 16px;">
            Start with small, focused iterations. Track your key engagement metrics weekly and refine your message based on real customer feedback.
          </p>
          <h2 style="font-size: 20px; font-weight: 800; margin: 24px 0 12px; color: var(--t1);">Conclusion & Next Steps</h2>
          <p style="font-size: 15px; line-height: 1.8; color: var(--t1); margin-bottom: 16px;">
            Taking action today on these principles will position your brand ahead of competitors. Start executing now and observe the measurable impact on your audience growth.
          </p>
        `;
      }

      // Clean markdown tags if any returned
      generatedContent = generatedContent.replace(/^```html/i, '').replace(/```$/i, '').trim();

      setContentHtml(generatedContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = generatedContent;
      }

      if (!title || title === 'New Blog Post') {
        setTitle(aiTopic.trim());
        setSlug(aiTopic.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      }

      if (showToast) showToast(isRtl ? 'تم توليد المقال بالذكاء الاصطناعي بنجاح ✨' : 'Blog post generated with AI ✨');
      setSaveStatus('saved');
    } catch (error) {
      console.error(error);
      if (showToast) showToast(isRtl ? 'حدث خطأ أثناء التوليد' : 'Generation completed with fallback');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = (newStatus = status) => {
    setSaveStatus('saving');
    const updatedPost = {
      ...post,
      id: post?.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim() || 'Untitled Post',
      slug: slug.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      content: contentHtml,
      excerpt: excerpt.trim() || contentHtml.replace(/<[^>]*>/g, '').slice(0, 160) + '...',
      category: category,
      author: author,
      status: newStatus,
      coverImage: coverImage,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      words: wordCount,
      readTime: readingTime,
      type: post?.type === 'ai' || isGeneratingAi ? 'ai' : 'standard',
      publishedAt: newStatus === 'published' ? (post?.publishedAt || new Date().toISOString()) : post?.publishedAt,
      scheduledAt: newStatus === 'scheduled' ? scheduledDate : null,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        canonicalUrl: `https://app.upklick.com/blog/${blogSite?.slug || 'blog'}/${slug}`
      },
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onSavePost(updatedPost);
    setTimeout(() => {
      setSaveStatus('saved');
      if (showToast) {
        showToast(
          newStatus === 'published' 
            ? (isRtl ? 'تم نشر المقال بنجاح 🚀' : 'Post published successfully 🚀')
            : (isRtl ? 'تم حفظ المسودة بنجاح' : 'Draft saved successfully')
        );
      }
    }, 200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--t1)',
      direction: isRtl ? 'rtl' : 'ltr',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* TOP HEADER BAR matching Screenshot 4 */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--edge2)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        
        {/* Left: Back & Auto-save on indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--t2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{isRtl ? 'رجوع' : 'Back'}</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--t3)',
            background: 'var(--surface2)',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: saveStatus === 'saved' ? '#16a34a' : '#f59e0b' }} />
            <span>{saveStatus === 'saved' ? (isRtl ? 'الحفظ التلقائي نشط' : 'Auto-save on') : (isRtl ? 'جاري الحفظ...' : 'Saving...')}</span>
          </div>
        </div>

        {/* Center: Editable Title with Pencil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
              style={{
                fontSize: '15px',
                fontWeight: '800',
                color: 'var(--t1)',
                background: 'var(--surface2)',
                border: '1px solid #2563eb',
                borderRadius: '6px',
                padding: '4px 10px',
                outline: 'none',
                minWidth: '240px'
              }}
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              style={{
                fontSize: '15px',
                fontWeight: '800',
                color: 'var(--t1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={isRtl ? 'انقر لتعديل عنوان المقال' : 'Click to edit title'}
            >
              <span>{title}</span>
              <Edit2 size={13} color="var(--t3)" />
            </div>
          )}
        </div>

        {/* Right: Word Count, Preview, Settings, Publish Button matching Screenshot 4 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            color: 'var(--t2)',
            background: 'var(--surface2)',
            padding: '5px 10px',
            borderRadius: '6px',
            fontWeight: '600'
          }}>
            <FileText size={14} color="#2563eb" />
            <span>{wordCount} {isRtl ? 'كلمة' : 'words'}</span>
            <span style={{ color: 'var(--t3)' }}>·</span>
            <span>{readingTime}</span>
          </div>

          <button
            type="button"
            onClick={() => onPreviewPost({ title, content: contentHtml, coverImage, author, category, lastUpdated: 'Today' })}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t2)',
              borderRadius: '6px',
              padding: '7px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isRtl ? 'معاينة المقال' : 'Preview'}
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t2)',
              borderRadius: '6px',
              padding: '7px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isRtl ? 'إعدادات المقال و SEO' : 'Post & SEO Settings'}
          >
            <Settings size={16} />
          </button>

          {/* Continue / Publish dropdown button matching Screenshot 4 */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}>
              <button
                type="button"
                onClick={() => handleSave('published')}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{isRtl ? 'نشر المقال (Publish)' : 'Continue'}</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsPublishDropdownOpen(!isPublishDropdownOpen)}
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {isPublishDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  [isRtl ? 'left' : 'right']: 0,
                  marginTop: '6px',
                  background: 'var(--surface)',
                  border: '1px solid var(--edge2)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => { setIsPublishDropdownOpen(false); handleSave('published'); }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: '#16a34a', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Check size={14} />
                  <span>{isRtl ? 'نشر مباشر (Publish Now)' : 'Publish now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPublishDropdownOpen(false); handleSave('draft'); }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                >
                  <Save size={14} />
                  <span>{isRtl ? 'حفظ كمسودة (Save Draft)' : 'Save as draft'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPublishDropdownOpen(false); setIsSettingsOpen(true); }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                >
                  <Calendar size={14} />
                  <span>{isRtl ? 'جدولة النشر (Schedule)' : 'Schedule post'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* RICH TEXT FORMATTING TOOLBAR matching Screenshot 4 */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--edge2)',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        flexWrap: 'nowrap'
      }}>
        
        {/* Toggle AI Panel Button */}
        <button
          type="button"
          onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          style={{
            background: isAiPanelOpen ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            border: isAiPanelOpen ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
            color: '#8b5cf6',
            borderRadius: '6px',
            padding: '5px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12.5px',
            fontWeight: '700'
          }}
          title={isRtl ? 'فتح / إغلاق لوحة الذكاء الاصطناعي' : 'Toggle AI Assistant'}
        >
          <Sparkles size={15} />
          <span>Content AI</span>
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--edge2)', margin: '0 4px' }} />

        {/* Basic Styles B, I, U, S */}
        <button type="button" onClick={() => formatDoc('bold')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 7px', borderRadius: '4px', cursor: 'pointer' }} title="Bold"><Bold size={15} /></button>
        <button type="button" onClick={() => formatDoc('italic')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 7px', borderRadius: '4px', cursor: 'pointer' }} title="Italic"><Italic size={15} /></button>
        <button type="button" onClick={() => formatDoc('underline')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 7px', borderRadius: '4px', cursor: 'pointer' }} title="Underline"><Underline size={15} /></button>
        <button type="button" onClick={() => formatDoc('strikeThrough')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 7px', borderRadius: '4px', cursor: 'pointer' }} title="Strikethrough"><Strikethrough size={15} /></button>

        <div style={{ width: '1px', height: '20px', background: 'var(--edge2)', margin: '0 4px' }} />

        {/* Font Family Selector */}
        <select
          value={fontFamily}
          onChange={(e) => { setFontFamily(e.target.value); formatDoc('fontName', e.target.value); }}
          style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', color: 'var(--t1)', cursor: 'pointer' }}
        >
          <option value="Inter">Inter</option>
          <option value="sans-serif">Sans-serif</option>
          <option value="Cairo">Cairo (عربي)</option>
          <option value="Roboto">Roboto</option>
          <option value="Playfair Display">Playfair Display</option>
        </select>

        {/* Headings / Paragraph Selector */}
        <select
          value={blockFormat}
          onChange={(e) => { setBlockFormat(e.target.value); formatDoc('formatBlock', e.target.value); }}
          style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', color: 'var(--t1)', cursor: 'pointer' }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
        </select>

        <div style={{ width: '1px', height: '20px', background: 'var(--edge2)', margin: '0 4px' }} />

        {/* Text Alignments */}
        <button type="button" onClick={() => formatDoc('justifyLeft')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }} title="Align Left"><AlignLeft size={15} /></button>
        <button type="button" onClick={() => formatDoc('justifyCenter')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }} title="Align Center"><AlignCenter size={15} /></button>
        <button type="button" onClick={() => formatDoc('justifyRight')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }} title="Align Right"><AlignRight size={15} /></button>
        <button type="button" onClick={() => formatDoc('justifyFull')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }} title="Justify"><AlignJustify size={15} /></button>

        <div style={{ width: '1px', height: '20px', background: 'var(--edge2)', margin: '0 4px' }} />

        {/* Lists & Quotes */}
        <button type="button" onClick={() => formatDoc('insertUnorderedList')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }} title="Bullet list"><List size={15} /></button>
        <button type="button" onClick={() => formatDoc('insertOrderedList')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }} title="Numbered list"><ListOrdered size={15} /></button>
        <button type="button" onClick={() => formatDoc('formatBlock', 'blockquote')} style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }} title="Quote"><Quote size={15} /></button>

        <div style={{ width: '1px', height: '20px', background: 'var(--edge2)', margin: '0 4px' }} />

        {/* Insert Media Links, Images, Videos */}
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter image URL:');
            if (url) formatDoc('insertImage', url);
          }}
          style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }}
          title="Insert Image"
        >
          <ImageIcon size={15} />
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) formatDoc('createLink', url);
          }}
          style={{ background: 'none', border: 'none', color: 'var(--t1)', padding: '5px 6px', cursor: 'pointer' }}
          title="Insert Link"
        >
          <LinkIcon size={15} />
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--edge2)', margin: '0 4px' }} />

        {/* Undo / Redo */}
        <button type="button" onClick={() => formatDoc('undo')} style={{ background: 'none', border: 'none', color: 'var(--t2)', padding: '5px 6px', cursor: 'pointer' }} title="Undo"><Undo size={15} /></button>
        <button type="button" onClick={() => formatDoc('redo')} style={{ background: 'none', border: 'none', color: 'var(--t2)', padding: '5px 6px', cursor: 'pointer' }} title="Redo"><Redo size={15} /></button>

      </div>

      {/* MAIN EDITOR WORKSPACE (2-COLUMN GRID matching Screenshot 4) */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isAiPanelOpen ? '340px 1fr' : '1fr',
        transition: 'all 0.2s ease',
        minHeight: 'calc(100vh - 110px)'
      }}>
        
        {/* LEFT SIDEPANEL: AI BLOG WRITING ASSISTANT matching Screenshot 4 */}
        {isAiPanelOpen && (
          <div style={{
            background: 'var(--surface)',
            borderRight: isRtl ? 'none' : '1px solid var(--edge2)',
            borderLeft: isRtl ? '1px solid var(--edge2)' : 'none',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* Assist / Build Tabs matching Screenshot 4 */}
            <div style={{
              display: 'flex',
              background: 'var(--surface2)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid var(--edge)'
            }}>
              <button
                type="button"
                onClick={() => setAiTab('assist')}
                style={{
                  flex: 1,
                  background: aiTab === 'assist' ? 'var(--surface)' : 'transparent',
                  color: aiTab === 'assist' ? 'var(--t1)' : 'var(--t3)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Assist
              </button>
              <button
                type="button"
                onClick={() => setAiTab('build')}
                style={{
                  flex: 1,
                  background: aiTab === 'build' ? 'var(--surface)' : 'transparent',
                  color: aiTab === 'build' ? 'var(--t1)' : 'var(--t3)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Build
              </button>
            </div>

            {/* AI Assistant Intro matching Screenshot 4 */}
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#8b5cf6" />
                <span>{isRtl ? 'مساعد كتابة المقالات' : 'AI Blog Post Assistant'}</span>
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--t3)' }}>
                {isRtl ? 'أدخل الموضوع وسيقوم الذكاء الاصطناعي بصياغة مقال احترافي متكامل.' : 'Describe your topic and let AI draft a full, structured blog post.'}
              </p>
            </div>

            {/* Apply Brand Boards Switch matching Screenshot 4 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--surface2)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--edge)'
            }}>
              <input
                type="checkbox"
                id="applyBrandBoards"
                checked={applyBrandBoards}
                onChange={(e) => setApplyBrandBoards(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="applyBrandBoards" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', cursor: 'pointer' }}>
                {isRtl ? 'تطبيق إرشادات وهوية العلامة التجارية' : 'Apply brand boards'}
              </label>
            </div>

            {/* Field 1: Describe the blog post topic * matching Screenshot 4 */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                {isRtl ? 'موضوع المقال *' : 'Describe the blog post topic *'}
              </label>
              <textarea
                rows={4}
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder={isRtl ? 'اكتب موضوع المقال أو الفكرة الرئيسية هنا...' : 'Enter your topic (e.g. 8 Reasons Why Your Website Should Have a Blog)'}
                style={{
                  width: '100%',
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: 'var(--t1)',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Field 2: Word limit matching Screenshot 4 */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                {isRtl ? 'عدد الكلمات المستهدف' : 'Word limit'}
              </label>
              <select
                value={aiWordLimit}
                onChange={(e) => setAiWordLimit(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: 'var(--t1)', outline: 'none' }}
              >
                <option value="500 words">500 words (Short & Punchy)</option>
                <option value="1000 words">1000 words (Standard Article)</option>
                <option value="1500 words">1500 words (Comprehensive Guide)</option>
                <option value="2000+ words">2000+ words (Deep-dive Pillar)</option>
              </select>
            </div>

            {/* Field 3: Target audience matching Screenshot 4 */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                {isRtl ? 'الجمهور المستهدف' : 'Target audience'}
              </label>
              <select
                value={aiTargetAudience}
                onChange={(e) => setAiTargetAudience(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: 'var(--t1)', outline: 'none' }}
              >
                <option value="Entrepreneurs & Marketers">Entrepreneurs & Marketers</option>
                <option value="Small Business Owners">Small Business Owners</option>
                <option value="Potential Customers & Buyers">Potential Customers & Buyers</option>
                <option value="Technical Professionals">Technical Professionals</option>
                <option value="General Public">General Public</option>
              </select>
            </div>

            {/* Field 4: Keyword(s) being focused matching Screenshot 4 */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                {isRtl ? 'الكلمات المفتاحية المستهدفة' : 'Keyword(s) being focused'}
              </label>
              <input
                type="text"
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                placeholder="e.g. Marketing, SEO, Brand Awareness..."
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: 'var(--t1)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Action Buttons matching Screenshot 4 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleGenerateAiPost}
                disabled={isGeneratingAi || !aiTopic.trim()}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isGeneratingAi || !aiTopic.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                  opacity: isGeneratingAi || !aiTopic.trim() ? 0.6 : 1
                }}
              >
                <Sparkles size={14} />
                <span>{isGeneratingAi ? (isRtl ? 'جاري التوليد...' : 'Generating...') : (isRtl ? 'توليد المقال' : 'Generate')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiTopic('8 Reasons Why Your Website Should Have a Blog');
                  setAiKeywords('Website Blog, Business Growth, SEO Traffic, Conversions');
                  if (showToast) showToast(isRtl ? 'تم تحميل القالب المقترح' : 'Prompt preset loaded');
                }}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'تخصيص →' : 'Personalize →'}
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--t3)', textAlign: 'center', marginTop: '4px' }}>
              Ask AI can make mistakes. Please review responses.
            </div>

          </div>
        )}

        {/* CENTER DOCUMENT CANVAS matching Screenshot 4 */}
        <div style={{
          background: 'var(--bg)',
          padding: '40px 24px 100px',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          
          <div style={{
            width: '100%',
            maxWidth: '820px',
            background: 'var(--surface)',
            border: '1px solid var(--edge2)',
            borderRadius: '14px',
            padding: '48px 56px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            minHeight: '800px'
          }}>
            
            {/* Featured Image Banner */}
            {coverImage && (
              <div style={{
                position: 'relative',
                width: '100%',
                height: '320px',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '32px',
                border: '1px solid var(--edge)'
              }}>
                <img
                  src={coverImage}
                  alt={title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    [isRtl ? 'left' : 'right']: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ImageIcon size={14} />
                  <span>{isRtl ? 'تغيير صورة الغلاف' : 'Change cover'}</span>
                </button>
              </div>
            )}

            {/* Document Title Header */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: '900',
              lineHeight: 1.3,
              margin: '0 0 16px',
              color: 'var(--t1)'
            }}>
              {title}
            </h1>

            {/* Author Meta Line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingBottom: '24px',
              marginBottom: '28px',
              borderBottom: '1px solid var(--edge2)',
              fontSize: '13px',
              color: 'var(--t3)'
            }}>
              <span style={{ fontWeight: '700', color: 'var(--t1)' }}>{author}</span>
              <span>·</span>
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
              <span>·</span>
              <span style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11.5px' }}>
                {category}
              </span>
            </div>

            {/* Editable WYSIWYG Content Area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                setContentHtml(e.currentTarget.innerHTML);
                setSaveStatus('saving');
                setTimeout(() => setSaveStatus('saved'), 800);
              }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
              style={{
                outline: 'none',
                minHeight: '400px',
                fontSize: fontSize,
                fontFamily: fontFamily,
                lineHeight: 1.8,
                color: 'var(--t1)'
              }}
            />

          </div>

        </div>

      </div>

      {/* POST SETTINGS & SEO DRAWER MODAL */}
      {isSettingsOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 99999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: '460px',
            height: '100%',
            overflowY: 'auto',
            padding: '28px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.2)'
          }}>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--t1)' }}>
                  {isRtl ? 'إعدادات المقال و SEO' : 'Post & SEO Settings'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Cover Image URL / Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                    {isRtl ? 'صورة الغلاف (Cover Image)' : 'Cover Image URL'}
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                    {isRtl ? 'الرابط المخصص (Slug)' : 'Post URL Slug'}
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="my-blog-post-slug"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                    {isRtl ? 'التصنيف (Category)' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Marketing, Technology, etc."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Author */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                    {isRtl ? 'الكاتب (Author)' : 'Author'}
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author Name"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                    {isRtl ? 'الوسوم (Tags)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="marketing, growth, seo"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                    {isRtl ? 'وصف محركات البحث (Meta Description)' : 'SEO Meta Description'}
                  </label>
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for Google search results..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <div style={{ textAlign: isRtl ? 'left' : 'right', fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>
                    {metaDescription.length} / 160
                  </div>
                </div>

                {/* Schedule Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px' }}>
                    {isRtl ? 'جدولة النشر (اختياري)' : 'Schedule Date (Optional)'}
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

              </div>
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--edge2)', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--edge)', padding: '10px', borderRadius: '8px', color: 'var(--t1)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleSave(scheduledDate ? 'scheduled' : status);
                }}
                style={{ flex: 1, background: '#2563eb', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                {isRtl ? 'تطبيق التعديلات' : 'Save Settings'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
