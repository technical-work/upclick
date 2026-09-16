'use client';

import React, { useEffect, useRef } from 'react';

export default function LandingPageHost({ html }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Immediately reveal all sections in case scripts take time to execute
    const reveals = containerRef.current.querySelectorAll('.reveal');
    reveals.forEach((el) => el.classList.add('in'));

    // 2. Extract and execute all scripts sequentially
    const scripts = Array.from(containerRef.current.querySelectorAll('script'));
    
    function runScriptSequential(index) {
      if (index >= scripts.length) return;
      const oldScript = scripts[index];
      const newScript = document.createElement('script');

      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (oldScript.src) {
        newScript.onload = () => runScriptSequential(index + 1);
        newScript.onerror = () => runScriptSequential(index + 1);
        document.body.appendChild(newScript);
      } else {
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
        runScriptSequential(index + 1);
      }
    }

    if (scripts.length > 0) {
      runScriptSequential(0);
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}
    />
  );
}
