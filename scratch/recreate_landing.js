const fs = require('fs');

const html = fs.readFileSync('Landing-Page.html', 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const styles = styleMatch ? styleMatch[1] : '';

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
let scripts = scriptMatch ? scriptMatch[1] : '';

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// Remove the script tag from the body content if it exists inside body
bodyContent = bodyContent.replace(/<script>[\s\S]*?<\/script>/g, '');

// Escape backticks and ${} in body and scripts and styles so they can be placed in a JS template string safely
const safeStyles = styles.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const safeScripts = scripts.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${').replace(/<\/script>/g, '<\\/script>');
const safeBody = bodyContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const reactComponent = `
'use client';

import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Add the script dynamically to global scope so inline onclicks work
    const scriptEl = document.createElement('script');
    scriptEl.innerHTML = \`${safeScripts}\`;
    document.body.appendChild(scriptEl);
    
    // Add global body overrides to fix the Next.js global flex layout issue
    const styleEl = document.createElement('style');
    styleEl.innerHTML = \`
      html { overflow: auto !important; height: auto !important; scroll-behavior: smooth; }
      body { 
        display: block !important; 
        overflow-x: hidden !important; 
        overflow-y: auto !important; 
        height: auto !important;
        background: #08080f !important;
      }
    \`;
    document.head.appendChild(styleEl);

    // Override any internal links to work with Next.js router
    const handleLinkClick = (e) => {
      const a = e.target.closest('a');
      if (a && a.getAttribute('href') === 'upklick-login.html') {
        e.preventDefault();
        router.push('/login');
      }
    };
    document.addEventListener('click', handleLinkClick);

    return () => {
      document.body.removeChild(scriptEl);
      document.head.removeChild(styleEl);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [router]);

  return (
    <div className="landing-page-root" ref={containerRef}>
      <style jsx global>{\`${safeStyles}\`}</style>
      <div dangerouslySetInnerHTML={{ __html: \`${safeBody}\` }} />
    </div>
  );
}
`;

fs.writeFileSync('src/app/page.js', reactComponent, 'utf8');
console.log('Successfully recreated exact landing page');
