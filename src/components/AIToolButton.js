import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Lock } from 'lucide-react';

export default function AIToolButton({ toolId, onClick, loading, text, loadingText, className, style, icon }) {
  const { getToolConfig, L } = useBusiness();
  const config = typeof getToolConfig === 'function' ? getToolConfig(toolId) : { cost: 0, isAllowed: true, tag: '' };
  
  // Force Refresh

  const baseStyle = { 
    position: 'relative', 
    display: 'inline-flex', 
    alignItems: 'center',
    justifyContent: 'center',
    width: style?.width || 'auto'
  };

  const tagStyle = {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    background: 'linear-gradient(45deg, #FF6B35, #FF007F)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '10px',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  if (!config.isAllowed) {
    return (
      <div style={baseStyle}>
        {config.tag && <div style={tagStyle}>{config.tag}</div>}
        <button 
          className={className || "btn btn-prime"}
          style={{ ...style, opacity: 0.6, cursor: 'not-allowed' }}
          disabled={true}
          title={L('Please upgrade your plan to access this tool', 'يرجى الترقية لاستخدام هذه الأداة')}
        >
          <Lock size={14} style={{ marginRight: '6px' }} />
          {L('Premium Tool', 'أداة بريميوم')}
        </button>
      </div>
    );
  }

  return (
    <div style={baseStyle}>
      {config.tag && <div style={tagStyle}>{config.tag}</div>}
      <button 
        className={className || "btn btn-prime"} 
        style={style} 
        onClick={onClick} 
        disabled={loading}
      >
        {icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
        {loading ? (loadingText || L('Generating...', 'جاري التوليد...')) : `${text} (${config.cost} C)`}
      </button>
    </div>
  );
}
