'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

const filterByDateRange = (itemDate, rangeType, customStart, customEnd) => {
  if (!itemDate) return rangeType === 'all';
  const date = new Date(itemDate);
  if (isNaN(date.getTime())) return rangeType === 'all';

  const now = new Date();

  switch (rangeType) {
    case 'today': {
      const today = new Date();
      today.setHours(0,0,0,0);
      return date >= today;
    }
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

export default function AutomationHubView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { t, L, setAiPanelOpen, GC, saveGC, lang } = useBusiness();
  const [activeTab, setActiveTab] = useState('all');

  const authHub = GC.automationHub || {
    connectionUrl: '',
    apiKey: '',
    connected: false,
    cbTrigger: 'New Telegram message received',
    cbAction: '',
    cbApps: [],
    cbCreds: '',
    buildResult: '',
    workflowCategories: {}
  };

  const [n8nUrl, setN8nUrl] = useState(authHub.connectionUrl || '');
  const [n8nKey, setN8nKey] = useState(authHub.apiKey || '');
  
  const [cbTrigger, setCbTrigger] = useState(authHub.cbTrigger || 'New Telegram message received');
  const [cbAction, setCbAction] = useState(authHub.cbAction || '');
  const [cbApps, setCbApps] = useState(authHub.cbApps || []);
  const [cbCreds, setCbCreds] = useState(authHub.cbCreds || '');
  const [buildResult, setBuildResult] = useState(authHub.buildResult || '');
  const [building, setBuilding] = useState(false);

  const [workflows, setWorkflows] = useState([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [workflowsError, setWorkflowsError] = useState('');
  
  const [editingJsonWf, setEditingJsonWf] = useState(null);
  const [jsonContent, setJsonContent] = useState('');
  const [fetchingJson, setFetchingJson] = useState(false);
  const [savingJson, setSavingJson] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const [isImportingWf, setIsImportingWf] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importWfName, setImportWfName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const [editorTab, setEditorTab] = useState('code'); // 'code' or 'ui'
  const [selectedNodeName, setSelectedNodeName] = useState(null);
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamVal, setNewParamVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [togglingWf, setTogglingWf] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const closeModals = () => {
    setEditingJsonWf(null);
    setIsImportingWf(false);
    setJsonContent('');
    setImportJson('');
    setImportWfName('');
    setJsonError('');
    setImportError('');
    setEditorTab('code');
    setSelectedNodeName(null);
    setNewParamKey('');
    setNewParamVal('');
  };

  // Sync state if database updates
  useEffect(() => {
    if (GC.automationHub) {
      setN8nUrl(GC.automationHub.connectionUrl || '');
      setN8nKey(GC.automationHub.apiKey || '');
      setCbTrigger(GC.automationHub.cbTrigger || 'New Telegram message received');
      setCbAction(GC.automationHub.cbAction || '');
      setCbApps(GC.automationHub.cbApps || []);
      setCbCreds(GC.automationHub.cbCreds || '');
      setBuildResult(GC.automationHub.buildResult || '');
    }
  }, [GC.automationHub]);

  // Raise main container z-index when full-screen modal is open to overlay the sidebar
  useEffect(() => {
    const mn = document.getElementById('mn');
    if (mn) {
      if (isImportingWf || editingJsonWf) {
        mn.style.zIndex = '99999';
      } else {
        mn.style.zIndex = '';
      }
    }
    return () => {
      if (mn) mn.style.zIndex = '';
    };
  }, [isImportingWf, editingJsonWf]);

  const refreshWorkflows = () => {
    if (authHub.connected && authHub.connectionUrl && authHub.apiKey) {
      setLoadingWorkflows(true);
      setWorkflowsError('');
      fetch('/api/n8n/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: authHub.connectionUrl,
          apiKey: authHub.apiKey,
          endpoint: '/workflows'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data && data.data.data) {
          setWorkflows(data.data.data);
        } else {
          setWorkflowsError(data.error || 'Failed to load workflows');
        }
      })
      .catch(err => {
        setWorkflowsError(err.message);
      })
      .finally(() => {
        setLoadingWorkflows(false);
      });
    }
  };

  useEffect(() => {
    refreshWorkflows();
  }, [authHub.connected, authHub.connectionUrl, authHub.apiKey]);

  const handleOpenJsonEditor = async (wf) => {
    setEditingJsonWf(wf);
    setFetchingJson(true);
    setJsonError('');
    setJsonContent('');
    
    try {
      const res = await fetch('/api/n8n/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: authHub.connectionUrl,
          apiKey: authHub.apiKey,
          endpoint: `/workflows/${wf.id}`,
          method: 'GET'
        })
      });
      const result = await res.json();
      if (result.ok && result.data) {
        setJsonContent(JSON.stringify(result.data, null, 2));
      } else {
        setJsonError(result.error || L('Failed to load workflow JSON', 'فشل تحميل بيانات المشروع'));
      }
    } catch (err) {
      setJsonError(L('Network error', 'خطأ في الشبكة'));
    } finally {
      setFetchingJson(false);
    }
  };

  const sanitizeN8nNode = (node) => {
    if (!node || typeof node !== 'object') return {};
    const cleanNode = {
      name: node.name,
      type: node.type,
      typeVersion: parseFloat(node.typeVersion) || 1,
      position: Array.isArray(node.position) ? [parseFloat(node.position[0]), parseFloat(node.position[1])] : [100, 100],
      parameters: node.parameters || {},
    };
    if (node.id) cleanNode.id = node.id;
    if (node.credentials) cleanNode.credentials = node.credentials;
    if (typeof node.disabled === 'boolean') cleanNode.disabled = node.disabled;
    if (node.notes) cleanNode.notes = node.notes;
    if (typeof node.notesInFlow === 'boolean') cleanNode.notesInFlow = node.notesInFlow;
    if (typeof node.continueOnFail === 'boolean') cleanNode.continueOnFail = node.continueOnFail;
    if (typeof node.retryOnFail === 'boolean') cleanNode.retryOnFail = node.retryOnFail;
    if (typeof node.maxTries === 'number') cleanNode.maxTries = node.maxTries;
    if (typeof node.waitBetweenTries === 'number') cleanNode.waitBetweenTries = node.waitBetweenTries;
    if (typeof node.alwaysOutputData === 'boolean') cleanNode.alwaysOutputData = node.alwaysOutputData;
    if (typeof node.executeOnce === 'boolean') cleanNode.executeOnce = node.executeOnce;
    return cleanNode;
  };

  const sanitizeN8nConnections = (connections) => {
    if (!connections || typeof connections !== 'object') return {};
    const cleanConns = {};
    Object.entries(connections).forEach(([sourceName, connectionPorts]) => {
      if (connectionPorts && typeof connectionPorts === 'object') {
        const cleanPorts = {};
        Object.entries(connectionPorts).forEach(([portType, connectionArray]) => {
          if (Array.isArray(connectionArray)) {
            cleanPorts[portType] = connectionArray.map((outputGroup) => {
              if (Array.isArray(outputGroup)) {
                return outputGroup.map((target) => {
                  const cleanTarget = {
                    node: target.node,
                    type: target.type,
                    index: typeof target.index === 'number' ? target.index : 0
                  };
                  return cleanTarget;
                }).filter(t => t.node && t.type);
              }
              return [];
            });
          }
        });
        cleanConns[sourceName] = cleanPorts;
      }
    });
    return cleanConns;
  };

  const sanitizeN8nPayload = (payload) => {
    const clean = {
      name: payload.name || L('Imported Custom Automation', 'قالب أتمتة مستورد'),
      nodes: Array.isArray(payload.nodes) ? payload.nodes.map(sanitizeN8nNode) : [],
      connections: sanitizeN8nConnections(payload.connections),
      settings: payload.settings || {},
    };
    if (payload.staticData) clean.staticData = payload.staticData;
    if (payload.meta) clean.meta = payload.meta;
    if (payload.pinData) clean.pinData = payload.pinData;
    if (typeof payload.active === 'boolean') clean.active = payload.active;
    if (Array.isArray(payload.tags)) clean.tags = payload.tags;
    return clean;
  };

  const handleSaveJson = async () => {
    setSavingJson(true);
    setJsonError('');
    let parsedPayload;
    
    try {
      parsedPayload = JSON.parse(jsonContent);
    } catch (e) {
      setJsonError(L('Invalid JSON format', 'تنسيق JSON غير صالح، يرجى مراجعة الكود'));
      setSavingJson(false);
      return;
    }
    
    const cleanPayload = sanitizeN8nPayload(parsedPayload);
    
    try {
      const res = await fetch('/api/n8n/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: authHub.connectionUrl,
          apiKey: authHub.apiKey,
          endpoint: `/workflows/${editingJsonWf.id}`,
          method: 'PUT',
          payload: cleanPayload
        })
      });
      const result = await res.json();
      if (result.ok) {
        closeModals();
        refreshWorkflows();
      } else {
        setJsonError(result.error || L('Failed to save workflow', 'فشل في حفظ المشروع'));
      }
    } catch (err) {
      setJsonError(L('Network error', 'خطأ في الشبكة'));
    } finally {
      setSavingJson(false);
    }
  };

  const handleImportWorkflow = async () => {
    setImporting(true);
    setImportError('');
    let parsedPayload;
    
    try {
      parsedPayload = JSON.parse(importJson);
    } catch (e) {
      setImportError(L('Invalid JSON format', 'تنسيق JSON غير صالح، يرجى مراجعة الكود'));
      setImporting(false);
      return;
    }
    
    const cleanPayload = sanitizeN8nPayload(parsedPayload);
    if (importWfName.trim()) {
      cleanPayload.name = importWfName.trim();
    }
    
    if (!cleanPayload.nodes || !Array.isArray(cleanPayload.nodes)) {
      setImportError(L('Missing "nodes" array in n8n JSON schema', 'مصفوفة "nodes" مفقودة في هيكل n8n JSON'));
      setImporting(false);
      return;
    }

    try {
      const res = await fetch('/api/n8n/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: authHub.connectionUrl,
          apiKey: authHub.apiKey,
          endpoint: '/workflows',
          method: 'POST',
          payload: cleanPayload
        })
      });
      
      const result = await res.json();
      if (result.ok) {
        closeModals();
        alert(L('Workflow imported successfully! ⚡', 'تم استيراد قالب الأتمتة بنجاح! ⚡'));
        refreshWorkflows();
      } else {
        setImportError(result.error || L('Failed to import workflow', 'فشل في استيراد المشروع'));
      }
    } catch (err) {
      setImportError(L('Network error', 'خطأ في الشبكة'));
    } finally {
      setImporting(false);
    }
  };

  const handleImportNameChange = (newName) => {
    setImportWfName(newName);
    try {
      if (importJson && importJson.trim()) {
        const parsed = JSON.parse(importJson);
        parsed.name = newName;
        setImportJson(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {}
  };

  const handleImportJsonChange = (val) => {
    setImportJson(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed && parsed.name) {
        setImportWfName(parsed.name);
      }
    } catch (e) {}
  };

  // UI parsing & mapping utilities
  const currentContent = editingJsonWf ? jsonContent : importJson;
  let parsedWorkflow = null;
  let parseError = null;

  try {
    if (currentContent && currentContent.trim()) {
      parsedWorkflow = JSON.parse(currentContent);
      if (!parsedWorkflow.nodes) parsedWorkflow.nodes = [];
      if (!parsedWorkflow.connections) parsedWorkflow.connections = {};
    }
  } catch (e) {
    parseError = e.message;
  }

  const updateWorkflowInJson = (updated) => {
    const jsonStr = JSON.stringify(updated, null, 2);
    if (editingJsonWf) {
      setJsonContent(jsonStr);
    } else {
      setImportJson(jsonStr);
    }
  };

  const handleRenameNode = (oldName, newName) => {
    if (!parsedWorkflow) return;
    const updated = { ...parsedWorkflow };
    updated.nodes = updated.nodes.map(n => n.name === oldName ? { ...n, name: newName } : n);
    
    if (updated.connections) {
      const newConnections = {};
      Object.entries(updated.connections).forEach(([source, connData]) => {
        const key = source === oldName ? newName : source;
        const newConnData = { ...connData };
        if (newConnData.main) {
          newConnData.main = newConnData.main.map(group => {
            if (Array.isArray(group)) {
              return group.map(target => target.node === oldName ? { ...target, node: newName } : target);
            }
            return group;
          });
        }
        newConnections[key] = newConnData;
      });
      updated.connections = newConnections;
    }
    
    updateWorkflowInJson(updated);
    if (selectedNodeName === oldName) {
      setSelectedNodeName(newName);
    }
  };

  const handleUpdateParam = (key, value) => {
    if (!parsedWorkflow || !selectedNodeName) return;
    const updated = { ...parsedWorkflow };
    updated.nodes = updated.nodes.map(n => {
      if (n.name === selectedNodeName) {
        return {
          ...n,
          parameters: {
            ...(n.parameters || {}),
            [key]: value
          }
        };
      }
      return n;
    });
    updateWorkflowInJson(updated);
  };

  const handleDeleteParam = (key) => {
    if (!parsedWorkflow || !selectedNodeName) return;
    const updated = { ...parsedWorkflow };
    updated.nodes = updated.nodes.map(n => {
      if (n.name === selectedNodeName) {
        const params = { ...(n.parameters || {}) };
        delete params[key];
        return {
          ...n,
          parameters: params
        };
      }
      return n;
    });
    updateWorkflowInJson(updated);
  };

  const handleAddParam = () => {
    if (!newParamKey.trim()) return;
    handleUpdateParam(newParamKey.trim(), newParamVal);
    setNewParamKey('');
    setNewParamVal('');
  };

  const renderVisualCanvas = () => {
    if (parseError) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', padding: '24px', background: '#1e1e1e', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>⚠️</div>
            <div style={{ fontWeight: 600 }}>{L('Invalid JSON structure for Visual Editor', 'تنسيق كود JSON غير صالح لعرض الواجهة المرئية')}</div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>{parseError}</div>
          </div>
        </div>
      );
    }

    if (!parsedWorkflow || !parsedWorkflow.nodes || parsedWorkflow.nodes.length === 0) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', padding: '24px', background: 'var(--surface2)', borderRadius: '8px', border: '1px dashed var(--edge)' }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>⚡</div>
            <div style={{ fontWeight: 600 }}>{L('No nodes in this workflow', 'لا توجد عناصر في هذا القالب')}</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{L('Paste code on JSON Code tab first to render nodes.', 'ألصق كود JSON في التبويب الآخر أولاً لتظهر العناصر هنا.')}</div>
          </div>
        </div>
      );
    }

    const nodes = parsedWorkflow.nodes.map((node, idx) => {
      let x = 0;
      let y = 0;
      if (node.position && Array.isArray(node.position) && node.position.length >= 2) {
        x = parseFloat(node.position[0]);
        y = parseFloat(node.position[1]);
        if (isNaN(x)) x = 100 + (idx * 220) % 600;
        if (isNaN(y)) y = 100 + Math.floor(idx / 3) * 120;
      } else {
        x = 100 + (idx * 220) % 600;
        y = 100 + Math.floor(idx / 3) * 120;
      }
      return { ...node, position: [x, y] };
    });

    const minX = Math.min(...nodes.map(n => n.position[0]));
    const minY = Math.min(...nodes.map(n => n.position[1]));
    const offsetX = minX < 0 ? -minX + 50 : 50;
    const offsetY = minY < 0 ? -minY + 50 : 50;

    const maxX = Math.max(...nodes.map(n => n.position[0]));
    const maxY = Math.max(...nodes.map(n => n.position[1]));
    const canvasWidth = Math.max(maxX + offsetX + 300, 1000);
    const canvasHeight = Math.max(maxY + offsetY + 200, 800);

    const connectionsList = [];
    if (parsedWorkflow.connections) {
      Object.entries(parsedWorkflow.connections).forEach(([sourceName, connectionData]) => {
        if (connectionData) {
          Object.entries(connectionData).forEach(([connType, connectionTypeArray]) => {
            if (Array.isArray(connectionTypeArray)) {
              connectionTypeArray.forEach((outputGroup) => {
                if (Array.isArray(outputGroup)) {
                  outputGroup.forEach((target) => {
                    if (target && target.node) {
                      connectionsList.push({
                        source: sourceName,
                        target: target.node,
                        type: connType
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    const selectedNode = selectedNodeName ? nodes.find(n => n.name === selectedNodeName) : null;

    const renderNodeIcon = (type) => {
      const t = String(type || '').toLowerCase();
      if (t.includes('webhook')) return '🌐';
      if (t.includes('openai') || t.includes('chat') || t.includes('agent')) return '🤖';
      if (t.includes('telegram')) return '💬';
      if (t.includes('sheet') || t.includes('excel')) return '📊';
      if (t.includes('email') || t.includes('gmail') || t.includes('mail')) return '✉️';
      if (t.includes('code') || t.includes('javascript')) return '💻';
      if (t.includes('schedule') || t.includes('cron') || t.includes('interval')) return '⏰';
      if (t.includes('slack')) return '🔌';
      return '⚡';
    };

    const getLineColor = (type) => {
      const t = String(type || '').toLowerCase();
      if (t.includes('languagemodel') || t.includes('agent')) return 'var(--purple)';
      if (t.includes('memory')) return '#10B981';
      return 'var(--orange)';
    };

    const getLineColorName = (type) => {
      const t = String(type || '').toLowerCase();
      if (t.includes('languagemodel') || t.includes('agent')) return 'purple';
      if (t.includes('memory')) return 'green';
      return 'orange';
    };

    return (
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%', border: '1px solid var(--edge)', borderRadius: '8px' }}>
        <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'var(--surface2)', backgroundImage: 'radial-gradient(var(--edge) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: `${canvasWidth}px`, height: `${canvasHeight}px`, pointerEvents: 'none', zIndex: 1 }}>
            <defs>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="var(--orange)" />
              </marker>
              <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="var(--purple)" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#10B981" />
              </marker>
            </defs>
            {connectionsList.map((conn, idx) => {
              const srcNode = nodes.find(n => String(n.name).trim().toLowerCase() === String(conn.source).trim().toLowerCase());
              const dstNode = nodes.find(n => String(n.name).trim().toLowerCase() === String(conn.target).trim().toLowerCase());
              if (!srcNode || !dstNode) return null;

              const x1 = srcNode.position[0] + offsetX + 180;
              const y1 = srcNode.position[1] + offsetY + 35;
              const x2 = dstNode.position[0] + offsetX;
              const y2 = dstNode.position[1] + offsetY + 35;

              const diffX = Math.abs(x2 - x1);
              const ctrlX1 = x1 + Math.max(40, diffX * 0.4);
              const ctrlX2 = x2 - Math.max(40, diffX * 0.4);

              const d = `M ${x1} ${y1} C ${ctrlX1} ${y1}, ${ctrlX2} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  key={idx}
                  d={d}
                  fill="none"
                  stroke={getLineColor(conn.type)}
                  strokeWidth="2.5"
                  markerEnd={`url(#arrow-${getLineColorName(conn.type)})`}
                  style={{ opacity: 0.75 }}
                />
              );
            })}
          </svg>

          {nodes.map((node, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedNodeName(node.name)}
              style={{
                position: 'absolute',
                left: `${node.position[0] + offsetX}px`,
                top: `${node.position[1] + offsetY}px`,
                width: '180px',
                height: '70px',
                background: selectedNodeName === node.name ? 'var(--surface3)' : 'var(--surface)',
                border: selectedNodeName === node.name ? '2px solid var(--prime)' : '1px solid var(--edge)',
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: selectedNodeName === node.name ? '0 4px 15px rgba(236,92,49,0.2)' : '0 4px 10px rgba(0,0,0,0.1)',
                zIndex: 10,
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
            >
              <div style={{ fontSize: '22px' }}>{renderNodeIcon(node.type)}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</div>
                <div style={{ fontSize: '9.5px', color: 'var(--t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.type.split('.').pop()}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedNode && (
          <div style={{ width: '300px', borderLeft: '1px solid var(--edge)', background: 'var(--surface)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', zIndex: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--edge)', paddingBottom: '10px' }}>
              <h4 style={{ margin: 0, color: 'var(--t1)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>⚙️ {L('Node Parameters', 'إعدادات العنصر')}</h4>
              <button onClick={() => setSelectedNodeName(null)} style={{ background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>
            
            <div>
              <label style={{ fontSize: '10px', color: 'var(--t3)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>{L('NAME', 'الاسم')}</label>
              <input 
                type="text" 
                className="inp" 
                value={selectedNode.name} 
                onChange={(e) => handleRenameNode(selectedNode.name, e.target.value)} 
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--t3)', fontWeight: 600, borderBottom: '1px solid var(--edge)', paddingBottom: '4px' }}>{L('PARAMETERS', 'المعلمات')}</div>
              {Object.entries(selectedNode.parameters || {}).map(([key, val]) => (
                <div key={key} style={{ background: 'var(--surface2)', padding: '8px', borderRadius: '6px', border: '1px solid var(--edge)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 600 }}>{key}</span>
                    <button 
                      onClick={() => handleDeleteParam(key)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '12px' }}
                      title={L('Delete', 'حذف')}
                    >
                      ✕
                    </button>
                  </div>
                  {typeof val === 'boolean' ? (
                    <select 
                      className="inp" 
                      value={String(val)} 
                      onChange={(e) => handleUpdateParam(key, e.target.value === 'true')}
                      style={{ width: '100%', fontSize: '11px', padding: '2px 6px' }}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : typeof val === 'object' ? (
                    <textarea 
                      className="inp" 
                      value={JSON.stringify(val)} 
                      onChange={(e) => {
                        try {
                          handleUpdateParam(key, JSON.parse(e.target.value));
                        } catch (err) {}
                      }}
                      style={{ width: '100%', fontSize: '10.5px', padding: '4px', fontFamily: 'monospace', height: '50px', resize: 'vertical' }}
                    />
                  ) : (
                    <input 
                      type="text" 
                      className="inp" 
                      value={String(val)} 
                      onChange={(e) => handleUpdateParam(key, e.target.value)}
                      style={{ width: '100%', fontSize: '11px', padding: '2px 6px' }}
                    />
                  )}
                </div>
              ))}

              <div style={{ marginTop: '6px', borderTop: '1px dashed var(--edge)', paddingTop: '10px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--t2)', marginBottom: '6px', fontWeight: 600 }}>{L('+ Add Parameter', '+ إضافة معلمة')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input 
                    type="text" 
                    className="inp" 
                    placeholder={L('Key', 'المفتاح')} 
                    value={newParamKey} 
                    onChange={e => setNewParamKey(e.target.value)}
                    style={{ width: '100%', fontSize: '11px', padding: '4px 6px' }}
                  />
                  <input 
                    type="text" 
                    className="inp" 
                    placeholder={L('Value', 'القيمة')} 
                    value={newParamVal} 
                    onChange={e => setNewParamVal(e.target.value)}
                    style={{ width: '100%', fontSize: '11px', padding: '4px 6px' }}
                  />
                  <button 
                    onClick={handleAddParam}
                    style={{ background: 'var(--prime)', border: 'none', color: '#fff', padding: '5px', borderRadius: '4px', fontSize: '10.5px', cursor: 'pointer', width: '100%' }}
                  >
                    {L('Add Parameter', 'إضافة')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const workflowCategories = authHub.workflowCategories || {};
  
  const dateFilteredWorkflows = workflows.filter(w => {
    const wfDate = w.createdAt || w.updatedAt || '';
    return filterByDateRange(wfDate, filterPeriod, customStartDate, customEndDate);
  });

  const filteredWorkflows = activeTab === 'all' 
    ? dateFilteredWorkflows 
    : dateFilteredWorkflows.filter(wf => {
        const customCat = workflowCategories[wf.id];
        if (customCat) return customCat === activeTab;

        return wf.tags && wf.tags.some(t => {
          const tn = (t.name || t).toLowerCase();
          const tabStr = activeTab.toLowerCase();
          return tn.includes(tabStr) || tabStr.includes(tn);
        });
      });

  const searchedAndSortedWorkflows = [...filteredWorkflows]
    .filter(wf => {
      if (statusFilter === 'active') return wf.active;
      if (statusFilter === 'inactive') return !wf.active;
      return true;
    })
    .filter(wf => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (wf.name || '').toLowerCase().includes(q) || 
             (wf.description || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });

  // Helper for tab switching
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleCategoryChange = (wfId, categoryId) => {
    saveGC({
      ...GC,
      automationHub: {
        ...authHub,
        workflowCategories: {
          ...(authHub.workflowCategories || {}),
          [wfId]: categoryId
        }
      }
    });
  };



  const toggleWorkflow = async (wf) => {
    if (togglingWf) return;
    setTogglingWf(wf.id);
    const endpoint = wf.active ? `/workflows/${wf.id}/deactivate` : `/workflows/${wf.id}/activate`;
    
    try {
      const res = await fetch('/api/n8n/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: authHub.connectionUrl,
          apiKey: authHub.apiKey,
          endpoint: endpoint,
          method: 'POST'
        })
      });
      const data = await res.json();
      if (data.ok) {
        setWorkflows(workflows.map(w => w.id === wf.id ? { ...w, active: !w.active } : w));
      } else {
        alert(L(`Failed to toggle workflow: ${data.error}`, `فشل في تغيير حالة المشروع: ${data.error}`));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingWf(null);
    }
  };

  const handleConnectN8n = () => {
    if (!n8nUrl.trim()) {
      alert(L('Please enter a valid n8n URL', 'الرجاء إدخال رابط n8n صحيح'));
      return;
    }
    saveGC({
      ...GC,
      automationHub: {
        ...authHub,
        connectionUrl: n8nUrl,
        apiKey: n8nKey,
        connected: true
      }
    });
    alert(L('n8n connected successfully! ⚡', 'تم توصيل n8n بنجاح! ⚡'));
  };

  const handleDisconnectN8n = () => {
    saveGC({
      ...GC,
      automationHub: {
        ...authHub,
        connectionUrl: '',
        apiKey: '',
        connected: false
      }
    });
    setN8nUrl('');
    setN8nKey('');
    alert(L('n8n disconnected.', 'تم قطع اتصال n8n.'));
  };

  const handleAppToggle = (app) => {
    let updated;
    if (cbApps.includes(app)) {
      updated = cbApps.filter(a => a !== app);
    } else {
      updated = [...cbApps, app];
    }
    setCbApps(updated);
  };

  const handleBuildCustom = () => {
    if (!cbAction.trim()) {
      alert(L('Please describe the action first', 'الرجاء وصف الإجراء المطلوب أولاً'));
      return;
    }
    setBuilding(true);
    setBuildResult('');
    
    // Simulate API call
    setTimeout(() => {
      setBuilding(false);
      const jsonCode = `{\n  "nodes": [\n    {\n      "parameters": {\n        "trigger": "${cbTrigger}"\n      },\n      "name": "Webhook Trigger",\n      "type": "n8n-nodes-base.webhook",\n      "position": [100, 200]\n    },\n    {\n      "parameters": {\n        "action": "${cbAction}"\n      },\n      "name": "AI Agent Node",\n      "type": "n8n-nodes-base.openAi",\n      "position": [300, 200]\n    }\n  ]\n}`;
      const msg = L('Automation JSON generated successfully! Copy it to import into n8n:\n\n' + jsonCode, 'تم إنشاء كود JSON للأتمتة بنجاح! انسخه واستورده في n8n:\n\n' + jsonCode);
      
      saveGC({
        ...GC,
        automationHub: {
          ...authHub,
          cbTrigger,
          cbAction,
          cbApps,
          cbCreds,
          buildResult: msg
        }
      });
      setBuildResult(msg);
    }, 2000);
  };

  const tabs = [
    { id: 'all', label: L('🔥 All Templates', '🔥 كل القوالب') },
    { id: 'sales', label: L('💰 Sales & CRM', '💰 المبيعات') },
    { id: 'content', label: L('✍️ Content', '✍️ المحتوى') },
    { id: 'telegram', label: L('💬 Telegram', '💬 تليجرام') },
    { id: 'social', label: L('📱 Social Media', '📱 السوشيال ميديا') },
    { id: 'finance', label: L('💳 Finance', '💳 المالية') },
    { id: 'community', label: L('👥 Community', '👥 المجتمع') },
    { id: 'ai', label: L('🤖 AI Workflows', '🤖 مسارات الذكاء') },
    { id: 'custom', label: L('✦ Custom Builder', '✦ البناء المخصص') },
  ];

  return (
    <div className="pg on" id="pg-automation">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⚡</span>
          {L('Automation Hub', 'مركز الأتمتة')}
          <span style={{ fontSize: '12px', color: 'var(--t3)', fontFamily: 'var(--fb)', fontWeight: 400, marginLeft: '8px' }}>
            powered by n8n
          </span>
        </div>
        <div className="pg-actions">
          {/* Period Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginInlineEnd: '10px' }}>
            <span style={{ fontSize: '13px' }}>📅</span>
            <select
              className="inp"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '110px', height: '32px', borderRadius: '8px' }}
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">{L('All Time', 'كل الأوقات')}</option>
              <option value="today">{L('Today', 'اليوم')}</option>
              <option value="week">{L('This Week', 'هذا الأسبوع')}</option>
              <option value="month">{L('This Month', 'هذا الشهر')}</option>
              <option value="last30">{L('Last 30 Days', 'آخر ٣٠ يوم')}</option>
              <option value="year">{L('This Year', 'هذا العام')}</option>
              <option value="custom">{L('Custom Range', 'نطاق مخصص')}</option>
            </select>

            {filterPeriod === 'custom' && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="inp"
                  style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('to', 'إلى')}</span>
                <input
                  type="date"
                  className="inp"
                  style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {authHub.connected && (
            <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 13px', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setIsImportingWf(true)}>
              ➕ {L('Import Template (JSON)', 'استيراد قالب (JSON)')}
            </button>
          )}
          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 13px' }} onClick={() => setActiveTab('custom')}>
            📋 {L('My Automations', 'أتمتاتي')}
          </button>
          <button 
            className="btn-ai" 
            onClick={() => setAiPanelOpen(true)}
          >
            ✦ {L('AI Suggest', 'اقتراح الذكاء')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">⚡ {L('Total Workflows', 'إجمالي المشاريع')}</div>
          <div className="stat-val ch-up">{dateFilteredWorkflows.length || 0}</div>
          <div className="stat-ch ch-nu">{L('currently available', 'مشاريعك الحالية')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Active Workflows', 'المشاريع النشطة')}</div>
          <div className="stat-val">{dateFilteredWorkflows.filter(w => w.active).length || 0}</div>
          <div className="stat-ch ch-nu">{L('currently running', 'تعمل حالياً')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">⏸️ {L('Inactive Workflows', 'المشاريع المتوقفة')}</div>
          <div className="stat-val" style={{ color: 'var(--t3)' }}>{dateFilteredWorkflows.filter(w => !w.active).length || 0}</div>
          <div className="stat-ch ch-nu">{L('needs activation', 'بحاجة لتفعيل')}</div>
        </div>
        <div className="stat-card" style={{ background: authHub.connected ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', borderColor: authHub.connected ? 'var(--green)' : 'var(--edge)' }}>
          <div className="stat-lbl">⚡ {L('n8n Status', 'حالة n8n')}</div>
          <div className="stat-val" style={{ color: authHub.connected ? 'var(--green)' : 'var(--t2)', fontSize: '20px' }}>
            {authHub.connected ? L('Connected', 'متصل') : L('Disconnected', 'غير متصل')}
          </div>
          <div className="stat-ch ch-nu">{L('connection status', 'حالة الاتصال')}</div>
        </div>
      </div>

      {/* n8n Connection Banner */}
      <div className="card mb" style={{ background: 'linear-gradient(135deg,rgba(255,107,53,.08),rgba(108,53,255,.08))', borderColor: 'rgba(255,107,53,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '32px' }}>⚡</div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontFamily: 'var(--ff)', fontSize: '15px', fontWeight: 800, color: 'var(--t1)', marginBottom: '4px' }}>
              {L('Connect your n8n instance', 'اربط حسابك في n8n')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)' }}>
              {L('Enter your n8n URL to deploy automations directly. Use n8n.cloud or self-hosted.', 'أدخل رابط n8n لنشر الأتمتة مباشرة.')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              className="inp" 
              placeholder="https://your-instance.n8n.cloud" 
              style={{ width: '260px', fontSize: '13px' }} 
              value={n8nUrl}
              onChange={e => setN8nUrl(e.target.value)}
            />
            <input 
              className="inp" 
              type="password"
              placeholder={L('API Key (optional)', 'مفتاح API (اختياري)')} 
              style={{ width: '160px', fontSize: '13px' }} 
              value={n8nKey}
              onChange={e => setN8nKey(e.target.value)}
            />
            {authHub.connected ? (
              <button className="btn btn-ghost" style={{ whiteSpace: 'nowrap', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={handleDisconnectN8n}>
                {L('Disconnect', 'قطع الاتصال')}
              </button>
            ) : (
              <button className="btn btn-prime" style={{ whiteSpace: 'nowrap' }} onClick={handleConnectN8n}>
                {L('Connect ⚡', 'توصيل ⚡')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="tabs-bar" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'on' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab !== 'custom' && authHub.connected ? (
        <div className="tab-panel on">
          {loadingWorkflows ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--t2)' }}>
              {L('Loading workflows...', 'جاري تحميل المشاريع...')}
            </div>
          ) : workflowsError ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="es-icon">⚠️</div>
              <div className="es-title" style={{ color: 'var(--red)' }}>{L('Error loading workflows', 'خطأ في تحميل المشاريع')}</div>
              <div className="es-sub">{workflowsError}</div>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="es-icon">⚡</div>
              <div className="es-title">{L('No workflows found', 'لا توجد مشاريع')}</div>
              <div className="es-sub">{L('You dont have any workflows in this category.', 'لا توجد مشاريع في هذا التصنيف.')}</div>
            </div>
          ) : searchedAndSortedWorkflows.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="es-icon">🔍</div>
              <div className="es-title">{L('No matching workflows found', 'لا توجد مشاريع تطابق بحثك')}</div>
              <div className="es-sub">{L('Try typing a different name or keyword.', 'جرّب البحث بكلمة أو عبارة أخرى.')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', gap: '16px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--t1)', margin: 0 }}>
                  {activeTab === 'all' ? L('Your Workflows', 'جميع المشاريع') : tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Search Input Box */}
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="inp" 
                      placeholder={L('Search projects...', 'ابحث عن مشروع...')} 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      style={{ fontSize: '12px', padding: '6px 12px 6px 30px', minWidth: '200px' }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '13px' }}>🔍</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                    <button onClick={() => setStatusFilter('all')} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: statusFilter === 'all' ? 'var(--surface2)' : 'transparent', color: statusFilter === 'all' ? 'var(--t1)' : 'var(--t2)', border: 'none', fontWeight: statusFilter === 'all' ? 600 : 400 }}>{L('All', 'الكل')}</button>
                    <button onClick={() => setStatusFilter('active')} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: statusFilter === 'active' ? 'var(--surface2)' : 'transparent', color: statusFilter === 'active' ? 'var(--t1)' : 'var(--t2)', border: 'none', fontWeight: statusFilter === 'active' ? 600 : 400 }}>{L('Active', 'نشط')}</button>
                    <button onClick={() => setStatusFilter('inactive')} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: statusFilter === 'inactive' ? 'var(--surface2)' : 'transparent', color: statusFilter === 'inactive' ? 'var(--t1)' : 'var(--t2)', border: 'none', fontWeight: statusFilter === 'inactive' ? 600 : 400 }}>{L('Inactive', 'غير نشط')}</button>
                  </div>
                </div>
              </div>
              <div style={{ overflow: 'visible', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--edge)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', color: 'var(--t2)', fontSize: '13px' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>{L('Workflow Name', 'اسم المشروع')}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>{L('Tags', 'العلامات')}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>{L('Category', 'التصنيف')}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>{L('Created', 'تاريخ الإنشاء')}</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>{L('Status', 'الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedAndSortedWorkflows.map(wf => (
                      <tr key={wf.id} style={{ borderBottom: '1px solid var(--edge)', transition: 'background 0.2s', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px', fontSize: '14px', color: 'var(--t1)', fontWeight: 600, maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={wf.name}>
                          <span onClick={() => handleOpenJsonEditor(wf)} style={{ cursor: 'pointer', borderBottom: '1px dashed var(--t3)' }}>
                            {wf.name}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {wf.tags && wf.tags.length > 0 ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {wf.tags.slice(0, 2).map(t => (
                                <span key={t.id || t.name || t} style={{ background: 'var(--surface3)', color: 'var(--t1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', whiteSpace: 'nowrap', border: '1px solid var(--edge)' }}>
                                  {t.name || t}
                                </span>
                              ))}
                              {wf.tags.length > 2 && <span style={{ fontSize: '11px', color: 'var(--t3)', alignSelf: 'center' }}>+{wf.tags.length - 2}</span>}
                            </div>
                          ) : <span style={{ color: 'var(--t3)', fontSize: '12px' }}>—</span>}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setOpenDropdown(null)}>
                            <div 
                              onClick={() => setOpenDropdown(openDropdown === wf.id ? null : wf.id)}
                              style={{ 
                                background: 'var(--surface2, #362852)', 
                                color: 'var(--t1)', 
                                border: '1px solid var(--edge, rgba(255,255,255,0.1))', 
                                borderRadius: '6px', 
                                padding: '4px 10px', 
                                fontSize: '11px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {workflowCategories[wf.id] ? tabs.find(t => t.id === workflowCategories[wf.id])?.label.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, '').trim() : L('Uncategorized', 'غير مصنف')}
                              <span style={{ fontSize: '8px', opacity: 0.5 }}>▼</span>
                            </div>
                            {openDropdown === wf.id && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                marginTop: '4px',
                                background: 'var(--surface3, #413160)', 
                                border: '1px solid var(--edge, rgba(255,255,255,0.1))', 
                                borderRadius: '6px', 
                                padding: '4px', 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '2px',
                                zIndex: 100,
                                minWidth: '120px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                              }}>
                                <div 
                                  onClick={() => { handleCategoryChange(wf.id, ''); setOpenDropdown(null); }}
                                  style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--t1)', cursor: 'pointer', borderRadius: '4px', background: !workflowCategories[wf.id] ? 'var(--surface4, #52407A)' : 'transparent' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface4, #52407A)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = !workflowCategories[wf.id] ? 'var(--surface4, #52407A)' : 'transparent'}
                                >
                                  {L('Uncategorized', 'غير مصنف')}
                                </div>
                                {tabs.filter(t => t.id !== 'all' && t.id !== 'custom').map(t => (
                                  <div 
                                    key={t.id}
                                    onClick={() => { handleCategoryChange(wf.id, t.id); setOpenDropdown(null); }}
                                    style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--t1)', cursor: 'pointer', borderRadius: '4px', background: workflowCategories[wf.id] === t.id ? 'var(--surface4, #52407A)' : 'transparent' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface4, #52407A)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = workflowCategories[wf.id] === t.id ? 'var(--surface4, #52407A)' : 'transparent'}
                                  >
                                    {t.label.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, '').trim()}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--t2)', whiteSpace: 'nowrap' }}>
                          {new Date(wf.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div 
                            onClick={() => toggleWorkflow(wf)}
                            style={{ 
                              display: 'inline-block',
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              fontSize: '12px', 
                              fontWeight: 600,
                              background: wf.active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                              color: wf.active ? 'var(--green)' : 'var(--t2)',
                              cursor: togglingWf === wf.id ? 'wait' : 'pointer',
                              opacity: togglingWf === wf.id ? 0.5 : 1,
                              transition: 'all 0.2s',
                              userSelect: 'none',
                              whiteSpace: 'nowrap'
                            }}>
                            {togglingWf === wf.id ? '...' : wf.active ? L('Active', 'مفعل') : L('Inactive', 'غير مفعل')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : activeTab !== 'custom' && (
        <div className="tab-panel on">
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="es-icon">⚡</div>
            <div className="es-title">{L('Templates coming soon', 'القوالب قريباً')}</div>
            <div className="es-sub">{L('Automations for this category are being prepared. Click Custom Builder to create workflow.', 'يتم تجهيز قوالب الأتمتة لهذا القسم. اضغط على البناء المخصص.')}</div>
            <button className="btn btn-prime" onClick={() => setActiveTab('custom')}>
              ✦ {L('Open Custom Builder', 'افتح البناء المخصص')}
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM BUILDER */}
      {activeTab === 'custom' && (
        <div className="tab-panel on" id="at-custom">
          <div className="g2" style={{ alignItems: 'start' }}>
            <div className="card">
              <div className="sec-hd"><div className="sec-title">✦ {L('AI Automation Builder', 'بناء الأتمتة بالذكاء الاصطناعي')}</div></div>
              <div style={{ fontSize: '13.5px', color: 'var(--t2)', marginBottom: '16px', lineHeight: 1.7 }}>
                {L('Describe what you want to automate — I\'ll build the complete n8n workflow JSON for you, ready to import.', 'صف ما تريد أتمتته وسأقوم بإنشاء كود JSON كامل لمسار عمل n8n جاهز للاستيراد.')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('What trigger starts this automation?', 'ما الذي يطلق هذه الأتمتة؟')}
                  </label>
                  <select className="inp" value={cbTrigger} onChange={(e) => setCbTrigger(e.target.value)}>
                    <option>{L('New Telegram message received', 'استلام رسالة تليجرام جديدة')}</option>
                    <option>{L('New lead added in CRM', 'إضافة عميل محتمل في CRM')}</option>
                    <option>{L('New form submission', 'إرسال نموذج جديد')}</option>
                    <option>{L('New payment received', 'استلام دفعة جديدة')}</option>
                    <option>{L('Scheduled time (daily/weekly)', 'وقت مجدول (يومي/أسبوعي)')}</option>
                    <option>{L('Webhook (custom)', 'Webhook مخصص')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('What should happen? (describe clearly)', 'ما الذي يجب أن يحدث؟ (اشرح بوضوح)')}
                  </label>
                  <textarea 
                    className="inp" 
                    rows="3" 
                    value={cbAction}
                    onChange={(e) => setCbAction(e.target.value)}
                    placeholder={L('e.g. Send a welcome Telegram message, then add them to my CRM as a new lead...', 'مثال: إرسال رسالة ترحيب عبر التليجرام ثم إضافتهم إلى CRM كعميل محتمل...')}
                  ></textarea>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Apps / Services involved', 'التطبيقات/الخدمات المعنية')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px' }}>
                    {[
                      { id: 'telegram', icon: '💬', name: 'Telegram' },
                      { id: 'telegram', icon: '✈️', name: 'Telegram' },
                      { id: 'gmail', icon: '📧', name: 'Gmail' },
                      { id: 'sheets', icon: '📊', name: 'Sheets' },
                      { id: 'notion', icon: '📝', name: 'Notion' },
                      { id: 'stripe', icon: '💳', name: 'Stripe' },
                      { id: 'openai', icon: '🤖', name: 'OpenAI' }
                    ].map(app => (
                      <label 
                        key={app.id} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 9px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--t2)' }}
                      >
                        <input 
                          type="checkbox" 
                          checked={cbApps.includes(app.id)}
                          onChange={() => handleAppToggle(app.id)}
                          style={{ accentColor: 'var(--orange)' }} 
                        /> 
                        {app.icon} {app.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Any specific account info / credentials needed?', 'هل هناك تفاصيل أو بيانات اعتماد مطلوبة؟')}
                  </label>
                  <textarea 
                    className="inp" 
                    rows="2" 
                    value={cbCreds}
                    onChange={(e) => setCbCreds(e.target.value)}
                    placeholder={L('e.g. My Telegram Business number: +966...', 'مثال: رقم التليجرام للأعمال الخاص بي...')}
                  ></textarea>
                </div>
                <button 
                  className="btn btn-prime" 
                  onClick={handleBuildCustom} 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
                >
                  ⚡ {L('Build My Automation', 'بناء الأتمتة')}
                </button>
              </div>
              
              {building && (
                <div className="ai-box" style={{ marginTop: '14px', animation: 'pulse 1.5s infinite', textAlign: 'center' }}>
                  {L('Generating JSON workflow...', 'جاري إنشاء مسار العمل JSON...')}
                </div>
              )}

              {buildResult && !building && (
                <div className="ai-box" style={{ marginTop: '14px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '11px', overflowX: 'auto', background: 'var(--surface3)' }}>
                  {buildResult}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card" style={{ borderColor: 'rgba(255,107,53,.2)' }}>
                <div className="sec-hd"><div className="sec-title" style={{ color: 'var(--orange)' }}>📖 {L('How to Import to n8n', 'كيفية الاستيراد لـ n8n')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { step: 1, title: L('Copy the JSON', 'نسخ JSON'), desc: L('Click "Copy JSON" on any generated automation', 'انقر على نسخ من أي أتمتة تم توليدها') },
                    { step: 2, title: L('Open n8n', 'افتح n8n'), desc: L('Go to New Workflow → Menu (⋮) → Import from JSON', 'اذهب لمسار عمل جديد واستورد من القائمة') },
                    { step: 3, title: L('Connect your credentials', 'اربط حساباتك'), desc: L('Fill in your API keys for each service', 'أدخل مفاتيح الربط لكل خدمة') },
                    { step: 4, title: L('Activate & Test', 'تفعيل واختبار'), desc: L('Toggle the switch and run a test execution', 'شغل مسار العمل وجربه') }
                  ].map(s => (
                    <div key={s.step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {s.step}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{s.title}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="https://n8n.io/cloud" target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '13px' }}>
                  Get n8n Free → n8n.io/cloud
                </a>
              </div>

              <div className="card">
                <div className="sec-hd"><div className="sec-title">💡 {L('Automation Ideas', 'أفكار للأتمتة')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '13px' }}>
                  {[
                    '💬 Auto-reply to Telegram inquiries with AI',
                    '📊 Daily revenue report to Telegram at 8am',
                    '🎓 Auto-enroll paid students to course platform',
                    '📱 Post to all social media from one trigger',
                    '🧾 Auto-generate and email invoices on payment',
                    '🤖 AI writes captions for your content automatically'
                  ].map((idea, i) => (
                    <div 
                      key={i} 
                      style={{ padding: '9px 12px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--edge)', transition: 'all .15s' }}
                      onClick={() => setCbAction(idea.substring(2))}
                    >
                      {idea}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingJsonWf && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', width: editorTab === 'ui' ? '98vw' : '90%', maxWidth: editorTab === 'ui' ? 'none' : '800px', height: editorTab === 'ui' ? '96vh' : '80%', borderRadius: '16px', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', transition: 'all 0.3s ease' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--edge)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{L('Edit Workflow', 'تعديل مشروع الأتمتة')}: {editingJsonWf.name}</div>
                <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', padding: '2px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                  <button onClick={() => setEditorTab('code')} style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', border: 'none', background: editorTab === 'code' ? 'var(--surface2)' : 'transparent', color: editorTab === 'code' ? 'var(--t1)' : 'var(--t2)', fontWeight: editorTab === 'code' ? 600 : 400 }}>
                    {L('JSON Code', 'كود JSON')}
                  </button>
                  <button onClick={() => setEditorTab('ui')} style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', border: 'none', background: editorTab === 'ui' ? 'var(--surface2)' : 'transparent', color: editorTab === 'ui' ? 'var(--t1)' : 'var(--t2)', fontWeight: editorTab === 'ui' ? 600 : 400 }}>
                    {L('Visual Interface', 'الواجهة المرئية')}
                  </button>
                </div>
              </div>
              <button onClick={closeModals} style={{ background: 'transparent', border: 'none', color: 'var(--t2)', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {editorTab === 'ui' ? (
                renderVisualCanvas()
              ) : fetchingJson ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)' }}>
                  {L('Loading JSON...', 'جاري تحميل الكود...')}
                </div>
              ) : (
                <textarea 
                  dir="ltr"
                  value={jsonContent}
                  onChange={e => setJsonContent(e.target.value)}
                  style={{ flex: 1, width: '100%', padding: '16px', background: '#1e1e1e', color: '#d4d4d4', border: '1px solid var(--edge)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', resize: 'none', textAlign: 'left', direction: 'ltr' }}
                  spellCheck={false}
                />
              )}
            </div>
            
            {jsonError && (
              <div style={{ padding: '8px 24px', color: 'var(--red)', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)' }}>
                {jsonError}
              </div>
            )}
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--edge)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--surface2)' }}>
              <button onClick={closeModals} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface3)', color: 'var(--t1)', cursor: 'pointer' }}>
                {L('Cancel', 'إلغاء')}
              </button>
              <button onClick={handleSaveJson} disabled={fetchingJson || savingJson} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--prime)', color: '#fff', cursor: 'pointer', opacity: (fetchingJson || savingJson) ? 0.5 : 1 }}>
                {savingJson ? L('Saving...', 'جاري الحفظ...') : L('Save Changes', 'حفظ التعديلات')}
              </button>
            </div>
          </div>
        </div>
      )}
      {isImportingWf && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', width: editorTab === 'ui' ? '98vw' : '90%', maxWidth: editorTab === 'ui' ? 'none' : '800px', height: editorTab === 'ui' ? '96vh' : '80%', borderRadius: '16px', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', transition: 'all 0.3s ease' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--edge)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{L('Import Custom n8n Workflow (JSON)', 'استيراد قالب أتمتة مخصص n8n بكود JSON')}</div>
                <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', padding: '2px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                  <button onClick={() => setEditorTab('code')} style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', border: 'none', background: editorTab === 'code' ? 'var(--surface2)' : 'transparent', color: editorTab === 'code' ? 'var(--t1)' : 'var(--t2)', fontWeight: editorTab === 'code' ? 600 : 400 }}>
                    {L('JSON Code', 'كود JSON')}
                  </button>
                  <button onClick={() => setEditorTab('ui')} style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', border: 'none', background: editorTab === 'ui' ? 'var(--surface2)' : 'transparent', color: editorTab === 'ui' ? 'var(--t1)' : 'var(--t2)', fontWeight: editorTab === 'ui' ? 600 : 400 }}>
                    {L('Visual Interface', 'الواجهة المرئية')}
                  </button>
                </div>
              </div>
              <button onClick={closeModals} style={{ background: 'transparent', border: 'none', color: 'var(--t2)', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 600 }}>{L('Workflow Name', 'اسم مشروع الأتمتة')}</label>
                <input 
                  type="text" 
                  className="inp" 
                  value={importWfName} 
                  onChange={e => handleImportNameChange(e.target.value)} 
                  placeholder={L('Enter automation name...', 'أدخل اسماً لمشروع الأتمتة...')}
                  style={{ width: '100%', fontSize: '12.5px', padding: '8px 12px' }}
                />
              </div>

              {editorTab === 'ui' ? (
                renderVisualCanvas()
              ) : (
                <>
                  <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                    {L('Paste the n8n workflow JSON structure. Make sure it contains valid nodes and connections fields.', 'ألصق كود JSON الخاص بالمشروع من n8n. تأكد من صحة الحقول والعلاقات.')}
                  </div>
                  <textarea 
                    dir="ltr"
                    value={importJson}
                    onChange={e => handleImportJsonChange(e.target.value)}
                    placeholder='{ "nodes": [ ... ], "connections": { ... }, "name": "My Custom Workflow" }'
                    style={{ flex: 1, width: '100%', padding: '16px', background: '#1e1e1e', color: '#d4d4d4', border: '1px solid var(--edge)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', resize: 'none', textAlign: 'left', direction: 'ltr' }}
                    spellCheck={false}
                  />
                </>
              )}
            </div>
            
            {importError && (
              <div style={{ padding: '8px 24px', color: 'var(--red)', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)' }}>
                {importError}
              </div>
            )}
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--edge)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--surface2)' }}>
              <button onClick={closeModals} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface3)', color: 'var(--t1)', cursor: 'pointer' }}>
                {L('Cancel', 'إلغاء')}
              </button>
              <button onClick={handleImportWorkflow} disabled={importing} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--prime)', color: '#fff', cursor: 'pointer', opacity: importing ? 0.5 : 1 }}>
                {importing ? L('Importing...', 'جاري الاستيراد...') : L('Import Workflow', 'استيراد القالب')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
