import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';
import { adminDb } from '@/utils/firebaseAdmin';
import LiveSiteView from '@/components/sites/LiveSiteView';
import { normalizeHost, isPlatformHostname } from '@/lib/sites/publicSite';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const headersList = await headers();
  const host = headersList.get('x-custom-domain') || headersList.get('host') || '';
  const cleanHost = normalizeHost(host);

  // If accessed on a custom domain, render the live site / funnel root directly
  if (!isPlatformHostname(cleanHost)) {
    return <LiveSiteView host={cleanHost} path="/" />;
  }

  const filePath = path.join(process.cwd(), 'public', 'landing-page.html');
  let html = '';
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    html = '<!DOCTYPE html><html><body><h1>UpKlick</h1></body></html>';
  }

  try {
    if (adminDb) {
      const globalDoc = await adminDb.collection('tenants').doc('global').get();
      if (globalDoc.exists) {
        const data = globalDoc.data();
        const tc = data?.trackingCenter;
        if (tc) {
          let scriptsToInject = '';
          if (tc.meta?.connected && tc.meta?.pixel?.id) {
            const pixelId = tc.meta.pixel.id;
            scriptsToInject += `
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/></noscript>
`;
          }
          if (tc.google?.connected && tc.google?.property?.measurementId) {
            const gaId = tc.google.property.measurementId;
            scriptsToInject += `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>
`;
          }

          if (scriptsToInject) {
            html = html.replace('</head>', `${scriptsToInject}\n</head>`);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error injecting tracking scripts into landing page:", err);
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}
    />
  );
}
