'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';

export default function BulkQRModal({
  isOpen = true,
  isRtl = false,
  onClose,
  onBulkCreate,
  showToast = () => {}
}) {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedRows(results.data || []);
      },
      error: (err) => {
        console.error('CSV parse error:', err);
        showToast(isRtl ? 'حدث خطأ في قراءة ملف CSV' : 'Error parsing CSV file');
      }
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      'Name,Type,Target_URL_or_Phone,Message_or_Subject\n' +
      'Summer Campaign 2026,website,https://example.com/summer,\n' +
      'Support WhatsApp,whatsapp,+201145680938,Hello I need help\n' +
      'Sales Hotline,call,+201145680938,\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'qr_bulk_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) {
      showToast(isRtl ? 'الملف لا يحتوي على صفوف بيانات صالحة' : 'CSV has no valid data rows');
      return;
    }

    setIsProcessing(true);
    const createdQRs = parsedRows.map((row, idx) => {
      const type = (row.Type || 'website').toLowerCase();
      const target = row.Target_URL_or_Phone || row.URL || row.Phone || 'https://app.upklick.io';
      const name = row.Name || `Bulk-QR-${Date.now()}-${idx + 1}`;

      return {
        id: `qr_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        type: ['website', 'call', 'whatsapp', 'email', 'review'].includes(type) ? type : 'website',
        data: {
          url: target,
          phone: target,
          countryCode: '+20',
          message: row.Message_or_Subject || ''
        },
        design: {
          bgColor: '#ffffff',
          dotsColor: '#000000',
          eyeFrame: 'square'
        },
        scans: 0,
        createdAt: new Date().toISOString(),
        analytics: { totalScans: 0, uniqueScans: 0 }
      };
    });

    if (onBulkCreate) onBulkCreate(createdQRs);
    if (showToast) showToast(isRtl ? `تم استيراد وإنشاء ${createdQRs.length} رمز QR بنجاح!` : `Successfully imported ${createdQRs.length} QR codes!`);
    setIsProcessing(false);
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '20px',
          maxWidth: '580px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'إنشاء رموز QR مجمعة (Bulk)' : 'Bulk QR Codes Generator'}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                {isRtl ? 'ارفع ملف CSV لإنشاء مئات الرموز دفعة واحدة' : 'Upload CSV to generate hundreds of QRs at once'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '24px' }}>
          <div
            style={{
              border: '2px dashed var(--edge)',
              borderRadius: '12px',
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--surface2)',
              marginBottom: '16px'
            }}
            onClick={() => document.getElementById('bulk-csv-input')?.click()}
          >
            <input
              id="bulk-csv-input"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <FileSpreadsheet size={36} color="var(--a)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>
              {csvFile ? csvFile.name : (isRtl ? 'اضغط هنا لرفع ملف CSV' : 'Click to browse and upload CSV')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
              {parsedRows.length > 0
                ? (isRtl ? `تم العثور على ${parsedRows.length} صف جاهز للإنشاء` : `Found ${parsedRows.length} valid rows ready to generate`)
                : (isRtl ? 'ملف CSV يحتوي على الأعمدة: Name, Type, Target_URL_or_Phone' : 'Format: Name, Type, Target_URL_or_Phone')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--a)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              {isRtl ? 'تحميل نموذج CSV التجريبي' : 'Download Sample CSV Template'}
            </button>

            <button
              onClick={handleImport}
              disabled={parsedRows.length === 0 || isProcessing}
              style={{
                background: parsedRows.length > 0 ? 'var(--a)' : 'var(--edge)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: parsedRows.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              {isRtl ? `إنشاء (${parsedRows.length}) رمز` : `Generate (${parsedRows.length}) QRs`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
