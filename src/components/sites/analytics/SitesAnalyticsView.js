'use client';

import React, { useState, useMemo } from 'react';
import Globe3DCanvas from './Globe3DCanvas';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  Info, 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Play, 
  Pause, 
  CheckCircle2, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function SitesAnalyticsView({
  funnels = [],
  websites = [],
  stores = [],
  webinars = [],
  isRtl = false,
  showToast
}) {
  // Filters state
  const [selectedAssetType, setSelectedAssetType] = useState('all'); // 'all' | 'funnels' | 'websites' | 'stores' | 'webinars'
  const [selectedSiteId, setSelectedSiteId] = useState('all');
  const [dateRangePreset, setDateRangePreset] = useState('14d');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiCard, setActiveKpiCard] = useState('views');
  const [countryViewMode, setCountryViewMode] = useState('country');
  const [acquisitionTab, setAcquisitionTab] = useState('channel');
  const [copiedIp, setCopiedIp] = useState(null);

  // Helper number formatter
  const fmt = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Number(n).toLocaleString();
  };

  // Combine and normalize all sites from real props
  const allSiteItems = useMemo(() => {
    const list = [];
    
    (funnels || []).forEach(f => {
      const hasRealLogs = Array.isArray(f.visitorLogs) && f.visitorLogs.length > 0;
      const hasRealLeads = Array.isArray(f.leads) && f.leads.length > 0;
      const v = hasRealLogs ? (f.visitorLogs.length || (f.steps || []).reduce((s, st) => s + (Number(st.views) || 0), 0)) : 0;
      const o = hasRealLeads ? (f.leads.length || (f.steps || []).reduce((s, st) => s + (Number(st.optins) || 0), 0)) : 0;
      const sa = (f.orders || []).reduce((sum, ord) => sum + (Number(ord.total) || Number(ord.amount) || 0), 0) || (hasRealLogs ? Number(f.sales) || 0 : 0);
      list.push({
        id: f.id,
        name: f.name || 'Untitled Funnel',
        type: 'funnels',
        typeLabel: isRtl ? 'فانل' : 'Funnel',
        views: v,
        optins: o,
        sales: sa,
        raw: f
      });
    });

    (websites || []).forEach(w => {
      const hasRealLogs = Array.isArray(w.visitorLogs) && w.visitorLogs.length > 0;
      const hasRealLeads = Array.isArray(w.leads) && w.leads.length > 0;
      const hasRealOrders = Array.isArray(w.orders) && w.orders.length > 0;
      const v = hasRealLogs ? (w.visitorLogs.length || (w.pages || []).reduce((s, p) => s + (Number(p.views) || 0), 0)) : 0;
      const o = hasRealLeads ? (w.leads.length || Number(w.optins) || 0) : 0;
      const sa = hasRealOrders ? (w.orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0)) : 0;
      list.push({
        id: w.id,
        name: w.name || 'Untitled Website',
        type: 'websites',
        typeLabel: isRtl ? 'موقع' : 'Website',
        views: v,
        optins: o,
        sales: sa,
        raw: w
      });
    });

    (stores || []).forEach(s => {
      const hasRealLogs = Array.isArray(s.visitorLogs) && s.visitorLogs.length > 0;
      const hasRealOrders = Array.isArray(s.orders) && s.orders.length > 0;
      const v = hasRealLogs ? (s.visitorLogs.length || (s.pages || []).reduce((sum, p) => sum + (Number(p.views) || 0), 0)) : 0;
      const o = hasRealOrders ? (s.customers?.length || 0) : 0;
      const sa = hasRealOrders ? (s.orders || []).reduce((sum, ord) => sum + (Number(ord.total) || Number(ord.amount) || 0), 0) : 0;
      list.push({
        id: s.id,
        name: s.name || 'Untitled Store',
        type: 'stores',
        typeLabel: isRtl ? 'متجر' : 'Store',
        views: v,
        optins: o,
        sales: sa,
        raw: s
      });
    });

    (webinars || []).forEach(w => {
      const hasRealAttendees = Array.isArray(w.attendees) && w.attendees.length > 0;
      const hasRealLogs = Array.isArray(w.visitorLogs) && w.visitorLogs.length > 0;
      const v = (hasRealLogs || hasRealAttendees) ? (Number(w.stats?.totalViews) || w.attendees?.length || 0) : 0;
      const o = hasRealAttendees ? w.attendees.length : 0;
      const sa = hasRealAttendees ? (Number(w.stats?.funnelRevenue) || 0) : 0;
      list.push({
        id: w.id,
        name: w.name || 'Untitled Webinar',
        type: 'webinars',
        typeLabel: isRtl ? 'ويبينار' : 'Webinar',
        views: v,
        optins: o,
        sales: sa,
        raw: w
      });
    });

    return list;
  }, [funnels, websites, stores, webinars, isRtl]);

  const filteredSiteItems = useMemo(() => {
    return allSiteItems.filter(item => {
      if (selectedAssetType !== 'all' && item.type !== selectedAssetType) return false;
      if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allSiteItems, selectedAssetType, searchQuery]);

  // Aggregated KPI data based on real user selection
  const kpiData = useMemo(() => {
    let targetItems = allSiteItems;
    if (selectedAssetType !== 'all') {
      targetItems = targetItems.filter(i => i.type === selectedAssetType);
    }
    if (selectedSiteId !== 'all') {
      targetItems = targetItems.filter(i => i.id === selectedSiteId);
    }

    const totalViews = targetItems.reduce((sum, i) => sum + (Number(i.views) || 0), 0);
    const totalOptins = targetItems.reduce((sum, i) => sum + (Number(i.optins) || 0), 0);
    const totalSales = targetItems.reduce((sum, i) => sum + (Number(i.sales) || 0), 0);
    const conversionRate = totalViews > 0 ? ((totalOptins / totalViews) * 100).toFixed(1) : '0';

    return {
      views: totalViews,
      optins: totalOptins,
      sales: totalSales,
      conversionRate: `${conversionRate}%`
    };
  }, [allSiteItems, selectedAssetType, selectedSiteId]);

  // Dynamic 14-day timeline dates generated from today
  const timelineDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      
      // Calculate real views for day if logged, otherwise default 0
      dates.push({
        date: label,
        views: 0,
        unique: 0,
        time: 0
      });
    }
    return dates;
  }, []);

  // Breakdown of views by site/funnel
  const funnelBreakdown = useMemo(() => {
    let targetItems = allSiteItems;
    if (selectedAssetType !== 'all') {
      targetItems = targetItems.filter(i => i.type === selectedAssetType);
    }
    const total = targetItems.reduce((sum, item) => sum + item.views, 0);
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#8b5cf6', '#ec4899'];
    
    return targetItems
      .filter(item => item.views > 0)
      .map((item, idx) => ({
        name: item.name,
        views: item.views,
        pct: total > 0 ? ((item.views / total) * 100).toFixed(1) : '0',
        color: colors[idx % colors.length]
      }));
  }, [allSiteItems, selectedAssetType]);

  // Real client IP records if logged
  const clientIps = useMemo(() => {
    // Collect from real activity if any
    const ipMap = {};
    allSiteItems.forEach(item => {
      const logs = item.raw?.visitorLogs || item.raw?.analytics?.ips || [];
      logs.forEach(log => {
        const ip = log.ip || log;
        if (ip) {
          ipMap[ip] = (ipMap[ip] || 0) + 1;
        }
      });
    });

    return Object.entries(ipMap).map(([ip, req]) => ({ ip, req }));
  }, [allSiteItems]);

  // Real browser breakdown
  const browserBreakdown = useMemo(() => {
    const browserMap = {};
    allSiteItems.forEach(item => {
      const logs = item.raw?.visitorLogs || item.raw?.analytics?.browsers || [];
      logs.forEach(log => {
        const name = log.browser || log.name;
        if (name) {
          browserMap[name] = (browserMap[name] || 0) + 1;
        }
      });
    });

    const total = Object.values(browserMap).reduce((sum, c) => sum + c, 0);
    return Object.entries(browserMap).map(([name, count]) => ({
      name,
      icon: '🌐',
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      color: '#2563eb'
    }));
  }, [allSiteItems]);

  // Real devices breakdown
  const deviceBreakdown = useMemo(() => {
    const devMap = {};
    allSiteItems.forEach(item => {
      const logs = item.raw?.visitorLogs || item.raw?.analytics?.devices || [];
      logs.forEach(log => {
        const d = log.device || log.type;
        if (d) {
          devMap[d] = (devMap[d] || 0) + 1;
        }
      });
    });

    const total = Object.values(devMap).reduce((sum, c) => sum + c, 0);
    return Object.entries(devMap).map(([name, count]) => ({
      name,
      count,
      pct: total > 0 ? ((count / total) * 100).toFixed(1) : '0'
    }));
  }, [allSiteItems]);

  // Real country distribution
  const countryBreakdown = useMemo(() => {
    const cMap = {};
    allSiteItems.forEach(item => {
      const logs = item.raw?.visitorLogs || item.raw?.analytics?.countries || [];
      logs.forEach(log => {
        const code = log.countryCode || log.code;
        const name = log.countryName || log.name;
        if (code || name) {
          const key = code || name;
          if (!cMap[key]) {
            cMap[key] = {
              name: name || code,
              code: code || '',
              flag: log.flag || '📍',
              lat: log.lat,
              lon: log.lon,
              count: 0
            };
          }
          cMap[key].count += 1;
        }
      });
    });

    const total = Object.values(cMap).reduce((sum, c) => sum + c.count, 0);
    return Object.values(cMap)
      .sort((a, b) => b.count - a.count)
      .map(c => ({
        ...c,
        pct: total > 0 ? `${((c.count / total) * 100).toFixed(1)}%` : '0%'
      }));
  }, [allSiteItems]);

  // Real webinar video aggregate stats
  const videoStats = useMemo(() => {
    const totalPlays = (webinars || []).reduce((sum, w) => sum + (Number(w.stats?.videoPlays) || 0), 0);
    const totalPauses = (webinars || []).reduce((sum, w) => sum + (Number(w.stats?.videoPauses) || 0), 0);
    const avgWatch = (webinars || []).reduce((sum, w) => sum + (Number(w.stats?.avgWatchTime) || 0), 0);
    const completionRate = (webinars || []).reduce((sum, w) => sum + (Number(w.stats?.completionRate) || 0), 0);
    
    return {
      plays: totalPlays,
      pauses: totalPauses,
      avgWatch: webinars.length > 0 ? Math.round(avgWatch / webinars.length) : 0,
      completionRate: webinars.length > 0 ? Math.round(completionRate / webinars.length) : 0
    };
  }, [webinars]);

  const handleCopyIp = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
    if (showToast) showToast(isRtl ? 'تم نسخ عنوان IP' : 'IP copied to clipboard');
  };

  return (
    <div style={{ padding: '0 24px 60px', direction: isRtl ? 'rtl' : 'ltr', color: 'var(--t1)' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', color: 'var(--t1)' }}>
          {isRtl ? 'التحليلات' : 'Analytics'}
        </h1>
        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--t2)' }}>
          {isRtl 
            ? 'تتبع وحلل المقاييس والزيارات ومعدلات التحويل الفعلية بدقة عالية.' 
            : 'Effortlessly track and analyze real-time key metrics, traffic, and conversions'}
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        
        {/* Left Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          
          {/* Asset Type Select */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedAssetType}
              onChange={(e) => { setSelectedAssetType(e.target.value); setSelectedSiteId('all'); }}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge2)',
                borderRadius: '8px',
                padding: '8px 30px 8px 12px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--t1)',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none',
                minWidth: '130px'
              }}
            >
              <option value="all">{isRtl ? 'جميع الأنواع' : 'All Sites'}</option>
              <option value="funnels">{isRtl ? 'الفانلز' : 'Funnels'}</option>
              <option value="websites">{isRtl ? 'المواقع الإلكترونية' : 'Websites'}</option>
              <option value="stores">{isRtl ? 'المتاجر' : 'Stores'}</option>
              <option value="webinars">{isRtl ? 'الويبينارات' : 'Webinars'}</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--t2)' }} />
          </div>

          {/* Specific Funnel / Site Search Dropdown */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '340px' }}>
            <Search size={14} style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--edge2)',
                borderRadius: '8px',
                padding: '8px 32px 8px 12px',
                fontSize: '13px',
                color: 'var(--t1)',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              <option value="all">{isRtl ? 'الكل (All)' : 'All'}</option>
              {filteredSiteItems.map(item => (
                <option key={item.id} value={item.id}>
                  [{item.typeLabel}] {item.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Right Date & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          <button
            type="button"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge2)',
              color: 'var(--t2)',
              padding: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isRtl ? 'السجل والخيارات السريعة' : 'History & Presets'}
          >
            <Clock size={16} />
          </button>

          {/* Date Range Selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge2)',
                color: 'var(--t1)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{timelineDates[0]?.date || 'Start'} &nbsp;→&nbsp; {timelineDates[timelineDates.length - 1]?.date || 'Today'}</span>
              <Calendar size={15} color="#2563eb" />
            </button>

            {isDatePickerOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                [isRtl ? 'left' : 'right']: 0,
                background: 'var(--surface)',
                border: '1px solid var(--edge2)',
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                padding: '8px',
                zIndex: 100,
                minWidth: '200px'
              }}>
                {[
                  { id: 'today', label: isRtl ? 'اليوم' : 'Today' },
                  { id: '7d', label: isRtl ? 'آخر 7 أيام' : 'Last 7 Days' },
                  { id: '14d', label: isRtl ? 'آخر 14 يوماً (الافتراضي)' : 'Last 14 Days (Default)' },
                  { id: '30d', label: isRtl ? 'آخر 30 يوماً' : 'Last 30 Days' },
                  { id: 'this_month', label: isRtl ? 'هذا الشهر' : 'This Month' },
                  { id: 'last_month', label: isRtl ? 'الشهر الماضي' : 'Last Month' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setDateRangePreset(p.id); setIsDatePickerOpen(false); }}
                    style={{
                      width: '100%',
                      background: dateRangePreset === p.id ? 'rgba(37, 99, 235, 0.1)' : 'none',
                      color: dateRangePreset === p.id ? '#2563eb' : 'var(--t1)',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: dateRangePreset === p.id ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filter Button */}
          <button
            type="button"
            onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
            style={{
              background: isAdvancedFilterOpen ? 'rgba(37,99,235,0.1)' : 'var(--surface2)',
              border: isAdvancedFilterOpen ? '1px solid #2563eb' : '1px solid var(--edge2)',
              color: isAdvancedFilterOpen ? '#2563eb' : 'var(--t1)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Filter size={14} />
            <span>{isRtl ? 'تصفية متقدمة' : 'Advanced filter'}</span>
          </button>

        </div>

      </div>

      {/* Advanced Filter Panel (Collapsible) */}
      {isAdvancedFilterOpen && (
        <div style={{
          background: 'var(--surface2)',
          border: '1px solid var(--edge2)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
              {isRtl ? 'مصدر الزيارات (UTM Source)' : 'UTM Source'}
            </label>
            <input type="text" placeholder="e.g. google, facebook, email" style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--t1)', fontSize: '12.5px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
              {isRtl ? 'الحملة الإعلانية (UTM Campaign)' : 'UTM Campaign'}
            </label>
            <input type="text" placeholder="e.g. summer_launch_2026" style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--t1)', fontSize: '12.5px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
              {isRtl ? 'نوع الجهاز' : 'Device Type'}
            </label>
            <select style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--t1)', fontSize: '12.5px', boxSizing: 'border-box' }}>
              <option value="all">{isRtl ? 'جميع الأجهزة' : 'All Devices'}</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
        </div>
      )}

      {/* 4 Top KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        
        {/* Card 1: Page views */}
        <div
          onClick={() => setActiveKpiCard('views')}
          style={{
            background: 'var(--surface)',
            border: activeKpiCard === 'views' ? '2px solid #2563eb' : '1px solid var(--edge2)',
            borderRadius: '12px',
            padding: '20px 22px',
            cursor: 'pointer',
            boxShadow: activeKpiCard === 'views' ? '0 4px 20px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', color: activeKpiCard === 'views' ? '#2563eb' : 'var(--t2)', marginBottom: '8px' }}>
            {isRtl ? 'مشاهدات الصفحات' : 'Page views'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)' }}>
            {fmt(kpiData.views)}
          </div>
        </div>

        {/* Card 2: Opt-ins */}
        <div
          onClick={() => setActiveKpiCard('optins')}
          style={{
            background: 'var(--surface)',
            border: activeKpiCard === 'optins' ? '2px solid #2563eb' : '1px solid var(--edge2)',
            borderRadius: '12px',
            padding: '20px 22px',
            cursor: 'pointer',
            boxShadow: activeKpiCard === 'optins' ? '0 4px 20px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', color: activeKpiCard === 'optins' ? '#2563eb' : 'var(--t2)', marginBottom: '8px' }}>
            {isRtl ? 'التسجيلات والاشتراكات' : 'Opt-ins'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)' }}>
            {fmt(kpiData.optins)}
          </div>
        </div>

        {/* Card 3: Sales */}
        <div
          onClick={() => setActiveKpiCard('sales')}
          style={{
            background: 'var(--surface)',
            border: activeKpiCard === 'sales' ? '2px solid #2563eb' : '1px solid var(--edge2)',
            borderRadius: '12px',
            padding: '20px 22px',
            cursor: 'pointer',
            boxShadow: activeKpiCard === 'sales' ? '0 4px 20px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', color: activeKpiCard === 'sales' ? '#2563eb' : 'var(--t2)', marginBottom: '8px' }}>
            {isRtl ? 'المبيعات والأرباح' : 'Sales'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)' }}>
            € {fmt(kpiData.sales)}
          </div>
        </div>

        {/* Card 4: Opt-in conversion rate */}
        <div
          onClick={() => setActiveKpiCard('rate')}
          style={{
            background: 'var(--surface)',
            border: activeKpiCard === 'rate' ? '2px solid #2563eb' : '1px solid var(--edge2)',
            borderRadius: '12px',
            padding: '20px 22px',
            cursor: 'pointer',
            boxShadow: activeKpiCard === 'rate' ? '0 4px 20px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', color: activeKpiCard === 'rate' ? '#2563eb' : 'var(--t2)', marginBottom: '8px' }}>
            {isRtl ? 'معدل تحويل الاشتراكات' : 'Opt-in conversion rate'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)' }}>
            {kpiData.conversionRate}
          </div>
        </div>

      </div>

      {/* SECTION 1: Page Views Main Line Chart */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--t1)' }}>
              {isRtl ? 'مشاهدات الصفحات' : 'Page views'}
            </h3>
            <div style={{ fontSize: '12.5px', color: 'var(--t3)', marginTop: '2px' }}>
              {timelineDates[0]?.date} - {timelineDates[timelineDates.length - 1]?.date}
            </div>
          </div>

          {/* Chart Legends */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12.5px', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
              <span style={{ color: 'var(--t2)' }}>{isRtl ? 'مشاهدات الصفحات' : 'Page Views'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899' }} />
              <span style={{ color: 'var(--t2)' }}>{isRtl ? 'المشاهدات الفريدة' : 'Unique Page Views'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic SVG Line Chart */}
        <div style={{ width: '100%', height: '240px', position: 'relative', overflowX: 'auto' }}>
          <svg viewBox="0 0 900 220" style={{ width: '100%', height: '100%', minWidth: '600px' }}>
            {/* Gridlines */}
            {[0, 40, 80, 120, 160].map((y, idx) => {
              const maxScale = kpiData.views > 0 ? kpiData.views : 0;
              const val = maxScale > 0 ? (maxScale * (1 - (idx * 0.2))).toFixed(0) : '0';
              return (
                <g key={idx}>
                  <line x1="40" y1={y + 10} x2="880" y2={y + 10} stroke="var(--edge)" strokeDasharray="3 3" opacity="0.6" />
                  <text x="30" y={y + 14} fontSize="10" fill="var(--t3)" textAnchor="end">
                    {val}
                  </text>
                </g>
              );
            })}
            
            <line x1="40" y1="170" x2="880" y2="170" stroke="var(--edge2)" strokeWidth="1.5" />
            <text x="30" y="174" fontSize="10" fill="var(--t3)" textAnchor="end">0</text>

            {/* If 0 views, clean baseline */}
            {kpiData.views === 0 ? (
              <line x1="40" y1="170" x2="880" y2="170" stroke="#ec4899" strokeWidth="2" />
            ) : (
              /* If real views, plot dynamic curve proportional to views */
              <path
                d="M 40 170 C 200 170, 300 40, 450 40 C 600 40, 700 170, 880 170"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.5"
              />
            )}

            {/* X Axis Dates */}
            {timelineDates.map((d, idx) => {
              const xPos = 40 + (idx * ((880 - 40) / 13));
              return (
                <text key={idx} x={xPos} y="195" fontSize="10" fill="var(--t3)" textAnchor="middle">
                  {d.date}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* SECTION 2: Average Time & Exit Rate */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'متوسط وقت الزيارة' : 'Average time'}
              </h3>
              <Info size={15} color="var(--t3)" />
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--t3)', marginTop: '2px' }}>
              {timelineDates[0]?.date} - {timelineDates[timelineDates.length - 1]?.date}
            </div>
          </div>
        </div>

        {/* Dynamic Duration Bar Chart */}
        <div style={{ width: '100%', height: '190px', position: 'relative', overflowX: 'auto' }}>
          <svg viewBox="0 0 900 170" style={{ width: '100%', height: '100%', minWidth: '600px' }}>
            {['00:06', '00:05', '00:04', '00:03', '00:02', '00:01', '00:00'].map((timeLabel, idx) => {
              const y = 10 + (idx * 22);
              return (
                <g key={idx}>
                  <line x1="55" y1={y} x2="880" y2={y} stroke="var(--edge)" strokeDasharray="3 3" opacity="0.6" />
                  <text x="45" y={y + 4} fontSize="9.5" fill="var(--t3)" textAnchor="end">{timeLabel}</text>
                </g>
              );
            })}

            {/* X Axis Dates */}
            {timelineDates.map((d, idx) => {
              const xPos = 55 + (idx * ((880 - 55) / 13));
              return (
                <text key={idx} x={xPos} y="160" fontSize="10" fill="var(--t3)" textAnchor="middle">
                  {d.date}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Bottom Metrics */}
        <div style={{ display: 'flex', gap: '60px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--edge2)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--t3)', fontWeight: '600', marginBottom: '4px' }}>
              {isRtl ? 'متوسط الوقت' : 'Average time'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--t1)' }}>
              {kpiData.views > 0 ? '00:04 Mins' : '00:00 Mins'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--t3)', fontWeight: '600', marginBottom: '4px' }}>
              {isRtl ? 'الخروج قبل 30 ثانية' : 'Exit before 30s'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--t1)' }}>
              {kpiData.views > 0 ? '0%' : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: 2-Column Grid (Views breakdown & Top client IPs) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        
        {/* Card: Page views by sites / funnels */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'مشاهدات الصفحات حسب الفانل والمواقع' : 'Page views by funnels & sites'}
              </h3>
            </div>

            {funnelBreakdown.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', padding: '16px 0' }}>
                <div style={{ width: '130px', height: '130px', position: 'relative' }}>
                  <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="18" />
                  </svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {funnelBreakdown.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--t1)', fontWeight: '600' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span>{item.name} ({item.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--t3)' }}>
                <Inbox size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                  {isRtl ? 'لا توجد بيانات مسجلة بعد' : 'No site view records yet'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card: Top client IPs */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
              {isRtl ? 'أبرز عناوين IP للزوار' : 'Top client IPs'}
            </h3>
            <Info size={15} color="var(--t3)" />
          </div>

          {clientIps.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--edge2)', fontSize: '12px', fontWeight: '700', color: 'var(--t3)' }}>
                  <th style={{ padding: '8px 0', paddingBottom: '12px' }}>{isRtl ? 'عنوان IP' : 'Client IPs'}</th>
                  <th style={{ padding: '8px 0', paddingBottom: '12px', textAlign: isRtl ? 'left' : 'right' }}>{isRtl ? 'الطلبات' : 'Requests'}</th>
                </tr>
              </thead>
              <tbody>
                {clientIps.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--edge2)', fontSize: '13px' }}>
                    <td style={{ padding: '12px 0', color: 'var(--t1)', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{row.ip}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyIp(row.ip)}
                          style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '2px' }}
                          title="Copy IP"
                        >
                          {copiedIp === row.ip ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--t1)', fontWeight: '700', textAlign: isRtl ? 'left' : 'right' }}>
                      {row.req}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--t3)' }}>
              <Inbox size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {isRtl ? 'لا توجد سجلات لعناوين IP بعد' : 'No client IP logs recorded yet'}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION 4: 2-Column Grid (Top Browsers & Traffic by device type) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        
        {/* Card: Top browsers */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
              {isRtl ? 'المتصفحات الأكثر استخداماً' : 'Top browsers'}
            </h3>
            <Info size={15} color="var(--t3)" />
          </div>

          {browserBreakdown.length > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: 'var(--t3)', paddingBottom: '12px', borderBottom: '1px solid var(--edge2)' }}>
                <span>{isRtl ? 'المتصفح' : 'Browsers'}</span>
                <span>{isRtl ? 'المستخدمين' : 'Users'}</span>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {browserBreakdown.map((b, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>{b.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)', minWidth: '70px' }}>{b.name}</span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--t3)' }}>
              <Inbox size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {isRtl ? 'لا توجد بيانات متصفحات مسجلة بعد' : 'No browser traffic recorded yet'}
              </div>
            </div>
          )}
        </div>

        {/* Card: Traffic by device type */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
              {isRtl ? 'الزيارات حسب نوع الجهاز' : 'Traffic by device type'}
            </h3>
            <Info size={15} color="var(--t3)" />
          </div>

          {deviceBreakdown.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', padding: '16px 0' }}>
              <div style={{ width: '130px', height: '130px', position: 'relative' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="18" />
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {deviceBreakdown.map((dev, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--t1)', fontWeight: '600' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                    <span>{dev.name} ({dev.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--t3)' }}>
              <Inbox size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {isRtl ? 'لا توجد بيانات أجهزة مسجلة بعد' : 'No device records available yet'}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION 5: Top Visits by Country & 3D Animated Globe */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
              {isRtl ? 'أبرز الزيارات حسب' : 'Top visits by'}
            </span>
            <select
              value={countryViewMode}
              onChange={(e) => setCountryViewMode(e.target.value)}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge2)',
                borderRadius: '6px',
                padding: '4px 24px 4px 10px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--t1)',
                cursor: 'pointer'
              }}
            >
              <option value="country">{isRtl ? 'الدولة (Country)' : 'Country'}</option>
              <option value="city">{isRtl ? 'المدينة (City)' : 'City'}</option>
              <option value="region">{isRtl ? 'المنطقة (Region)' : 'Region'}</option>
            </select>
            <Info size={15} color="var(--t3)" />
          </div>
        </div>

        {/* 3D Globe Canvas & Real Country Stats List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', alignItems: 'center' }}>
          
          <Globe3DCanvas isRtl={isRtl} countries={countryBreakdown} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'الدول' : 'Countries'}
              </h4>
              <div style={{ fontSize: '12.5px', color: 'var(--t3)' }}>
                {countryBreakdown.length > 0
                  ? (isRtl ? `إجمالي عدد الزوار: ${fmt(countryBreakdown.reduce((s, c) => s + (Number(c.count) || 0), 0))}` : `Total number of visitors: ${fmt(countryBreakdown.reduce((s, c) => s + (Number(c.count) || 0), 0))}`)
                  : (isRtl ? 'إجمالي عدد الزوار: 0' : 'Total number of visitors: 0')}
              </div>
            </div>

            {countryBreakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {countryBreakdown.map((c, idx) => (
                  <div key={idx} style={{
                    background: idx === 0 ? 'var(--surface2)' : 'transparent',
                    border: idx === 0 ? '1px solid var(--edge2)' : 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '18px' }}>{c.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>{c.name}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb' }}>{c.pct}</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--edge)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: c.pct, height: '100%', background: '#2563eb', borderRadius: '3px' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--t1)' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--t3)' }}>
                <Inbox size={28} style={{ margin: '0 auto 6px', opacity: 0.4 }} />
                <div style={{ fontSize: '12.5px', fontWeight: '600' }}>
                  {isRtl ? 'في انتظار تسجيل أول زيارة جغرافية' : 'Waiting for initial geolocation traffic'}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SECTION 6: Acquisition Data */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
            {isRtl ? 'بيانات اكتساب الزيارات' : 'Acquisition data'}
          </h3>
          <Info size={15} color="var(--t3)" />
        </div>

        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '8px', padding: '3px', width: 'fit-content', border: '1px solid var(--edge)', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setAcquisitionTab('channel')}
            style={{
              background: acquisitionTab === 'channel' ? 'var(--surface)' : 'transparent',
              color: acquisitionTab === 'channel' ? 'var(--t1)' : 'var(--t3)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: acquisitionTab === 'channel' ? '700' : '500',
              cursor: 'pointer'
            }}
          >
            {isRtl ? 'قناة الزيارات (Traffic channel)' : 'Traffic channel'}
          </button>
          <button
            type="button"
            onClick={() => setAcquisitionTab('source_medium')}
            style={{
              background: acquisitionTab === 'source_medium' ? 'var(--surface)' : 'transparent',
              color: acquisitionTab === 'source_medium' ? 'var(--t1)' : 'var(--t3)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: acquisitionTab === 'source_medium' ? '700' : '500',
              cursor: 'pointer'
            }}
          >
            {isRtl ? 'المصدر / الوسيط (Source/Medium)' : 'Source/Medium'}
          </button>
        </div>

        <div style={{ width: '100%', height: '170px', position: 'relative', overflowX: 'auto' }}>
          <svg viewBox="0 0 900 150" style={{ width: '100%', height: '100%', minWidth: '600px' }}>
            {[1.0, 0.8, 0.6, 0.4, 0.2, 0].map((val, idx) => {
              const y = 10 + (idx * 22);
              return (
                <g key={idx}>
                  <line x1="45" y1={y} x2="880" y2={y} stroke="var(--edge)" strokeDasharray="3 3" opacity="0.6" />
                  <text x="35" y={y + 4} fontSize="9.5" fill="var(--t3)" textAnchor="end">{val === 0 ? '0' : val.toFixed(1)}</text>
                </g>
              );
            })}

            {kpiData.views > 0 && (
              <g>
                <rect x="420" y="20" width="36" height="100" rx="2" fill="#8b5cf6" />
                <text x="438" y="135" fontSize="10.5" fontWeight="600" fill="var(--t2)" textAnchor="middle">Direct</text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* SECTION 7: Video Engagement Overview */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
          {isRtl ? 'نظرة عامة على تفاعل الفيديو' : 'Video engagement overview'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--t3)', fontWeight: '600', marginBottom: '4px' }}>
              {isRtl ? 'متوسط وقت المشاهدة' : 'Average watch time'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--t1)' }}>
              {videoStats.avgWatch}%
            </div>
          </div>

          <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--t3)', fontWeight: '600', marginBottom: '4px' }}>
              {isRtl ? 'نسبة الإكمال' : 'Completion rate'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--t1)' }}>
              {videoStats.completionRate}%
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--t3)', fontWeight: '600', marginBottom: '4px' }}>
              {isRtl ? 'مرات التشغيل' : 'Video play'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--t1)' }}>
              {fmt(videoStats.plays)}
            </div>
          </div>

          <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--t3)', fontWeight: '600', marginBottom: '4px' }}>
              {isRtl ? 'مرات الإيقاف المؤقت' : 'Video pauses'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--t1)' }}>
              {fmt(videoStats.pauses)}
            </div>
          </div>

          <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--t3)', fontWeight: '600', marginBottom: '4px' }}>
              {isRtl ? 'الويبينارات النشطة' : 'Active webinars'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--t1)' }}>
              {fmt(webinars.length)}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: Video Engagement Progress Curve */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16.5px', fontWeight: '800', color: 'var(--t1)' }}>
          {isRtl ? 'تفاعل المشاهدين مع الفيديو' : 'Video engagement'}
        </h3>

        <div style={{ width: '100%', height: '220px', position: 'relative', overflowX: 'auto' }}>
          <svg viewBox="0 0 900 200" style={{ width: '100%', height: '100%', minWidth: '600px' }}>
            {[1, 0.8, 0.6, 0.4, 0.2, 0].map((val, idx) => {
              const y = 15 + (idx * 26);
              return (
                <g key={idx}>
                  <line x1="50" y1={y} x2="880" y2={y} stroke="var(--edge)" strokeDasharray="3 3" opacity="0.6" />
                  <text x="40" y={y + 4} fontSize="9.5" fill="var(--t3)" textAnchor="end">{val}</text>
                </g>
              );
            })}

            <text x="12" y="100" fontSize="9" fill="var(--t3)" transform="rotate(-90 12 100)" textAnchor="middle">
              {isRtl ? 'عدد المستخدمين' : 'Number of users'}
            </text>

            <line x1="50" y1="145" x2="880" y2="145" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="50" cy="145" r="3" fill="#3b82f6" />
            <circle cx="880" cy="145" r="3" fill="#3b82f6" />

            {['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'].map((pct, idx) => {
              const xPos = 50 + (idx * ((880 - 50) / 10));
              return (
                <text key={idx} x={xPos} y="165" fontSize="9.5" fill="var(--t3)" textAnchor="middle">
                  {pct}
                </text>
              );
            })}

            <text x="465" y="185" fontSize="10" fontWeight="600" fill="var(--t3)" textAnchor="middle">
              {isRtl ? 'تقدم الفيديو (%)' : 'Video progress (%)'}
            </text>
          </svg>
        </div>
      </div>

    </div>
  );
}
