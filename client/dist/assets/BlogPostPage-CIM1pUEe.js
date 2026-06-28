import{i as e,l as t,n,r}from"./LanguageContext-CLv_3AZt.js";import{t as i}from"./proxy-BK_-GYl2.js";import{M as a,P as o,R as s}from"./index-CTdvxKrJ.js";var c=t(e(),1),l=r(),u=`http://localhost:3001/api`;function d(e){return e?Math.max(1,Math.ceil(e.split(/\s+/).length/200)):1}function f(e){return e?e.replace(/^### (.+)$/gm,`<h3>$1</h3>`).replace(/^## (.+)$/gm,`<h2>$1</h2>`).replace(/^# (.+)$/gm,`<h1>$1</h1>`).replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`).replace(/\*(.+?)\*/g,`<em>$1</em>`).replace(/!\[([^\]]*)\]\(([^)]+)\)/g,`<figure class="my-8"><img src="$2" alt="$1" style="max-width:100%;border-radius:12px" loading="lazy" /><figcaption class="text-xs mt-2 text-center" style="color:var(--text-muted)">$1</figcaption></figure>`).replace(/\[([^\]]+)\]\(([^)]+)\)/g,`<a href="$2" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;text-underline-offset:3px">$1</a>`).replace(/^> (.+)$/gm,`<blockquote style="border-left:3px solid var(--accent);padding-left:1.5rem;margin:1.5rem 0;font-style:italic;color:var(--text-secondary)">$1</blockquote>`).replace(/<video /g,`<video style="max-width:100%;border-radius:12px" `).replace(/^---$/gm,`<hr style="border:none;border-top:1px solid var(--border);margin:2rem 0" />`).split(`

`).map(e=>e.startsWith(`<`)?e:`<p>${e}</p>`).join(`
`):``}function p(){let{t:e,lang:t}=n(),{dark:r}=a(),{slug:p}=s(),[m,h]=(0,c.useState)(null),[g,_]=(0,c.useState)(!0);if((0,c.useEffect)(()=>{fetch(`${u}/blog/${p}`).then(e=>e.ok?e.json():null).then(e=>{h(e),_(!1)}).catch(()=>_(!1))},[p]),g)return(0,l.jsx)(`div`,{style:{backgroundColor:`var(--bg)`,minHeight:`100vh`},children:(0,l.jsxs)(`div`,{className:`animate-pulse`,children:[(0,l.jsx)(`div`,{className:`h-72 md:h-96`,style:{backgroundColor:r?`#141414`:`#F0F0F0`}}),(0,l.jsxs)(`div`,{className:`max-w-3xl mx-auto px-4 py-12 space-y-4`,children:[(0,l.jsx)(`div`,{className:`h-4 w-32 rounded`,style:{backgroundColor:r?`#1a1a1a`:`#E8E8EC`}}),(0,l.jsx)(`div`,{className:`h-10 w-3/4 rounded`,style:{backgroundColor:r?`#1a1a1a`:`#E8E8EC`}}),(0,l.jsx)(`div`,{className:`h-4 w-full rounded`,style:{backgroundColor:r?`#1a1a1a`:`#E8E8EC`}}),(0,l.jsx)(`div`,{className:`h-4 w-2/3 rounded`,style:{backgroundColor:r?`#1a1a1a`:`#E8E8EC`}})]})]})});if(!m)return(0,l.jsx)(`div`,{style:{backgroundColor:`var(--bg)`},children:(0,l.jsxs)(`div`,{className:`max-w-3xl mx-auto px-4 py-24 text-center`,children:[(0,l.jsx)(`div`,{className:`w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full`,style:{backgroundColor:`var(--accent-bg)`},children:(0,l.jsx)(`svg`,{className:`w-8 h-8`,fill:`none`,stroke:`var(--accent)`,strokeWidth:`1`,viewBox:`0 0 24 24`,children:(0,l.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z`})})}),(0,l.jsx)(`p`,{className:`text-lg font-bold mb-3`,style:{color:`var(--text-primary)`},children:e(`blog.not_found`,`Post not found`)}),(0,l.jsxs)(o,{to:`/blog`,className:`text-sm inline-flex items-center gap-2 transition-colors`,style:{color:`var(--accent)`},children:[(0,l.jsx)(`svg`,{className:`w-4 h-4`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,viewBox:`0 0 24 24`,children:(0,l.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18`})}),e(`blog_admin.back_to_blog`)]})]})});let v=d(m.body),y=m.published_at?new Date(m.published_at).toLocaleDateString(t===`fr`?`fr-FR`:`en-US`,{year:`numeric`,month:`long`,day:`numeric`}):``;return(0,l.jsxs)(`div`,{style:{backgroundColor:`var(--bg)`},children:[m.cover_image&&(0,l.jsxs)(i.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.8},className:`relative w-full h-64 md:h-96 overflow-hidden`,style:{backgroundColor:`var(--bg-overlay)`},children:[(0,l.jsx)(`img`,{src:m.cover_image,alt:m.title,className:`w-full h-full object-cover`}),(0,l.jsx)(`div`,{className:`absolute inset-0`,style:{background:`linear-gradient(to top, ${r?`rgba(15,15,20,0.8)`:`rgba(255,255,255,0.8)`} 0%, transparent 60%)`}})]}),(0,l.jsx)(`article`,{className:`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8`,style:{marginTop:m.cover_image?`-4rem`:`3rem`,position:`relative`},children:(0,l.jsxs)(i.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6,delay:.2},children:[(0,l.jsxs)(o,{to:`/blog`,className:`inline-flex items-center gap-2 text-xs uppercase tracking-wider mb-8 transition-colors`,style:{color:`var(--accent)`,fontWeight:`600`},children:[(0,l.jsx)(`svg`,{className:`w-4 h-4`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,viewBox:`0 0 24 24`,children:(0,l.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18`})}),e(`blog_admin.back_to_blog`)]}),(0,l.jsxs)(`div`,{className:`flex items-center gap-3 mb-4`,children:[y&&(0,l.jsx)(`time`,{className:`text-xs`,style:{color:`var(--text-muted)`},children:y}),(0,l.jsx)(`span`,{className:`w-1 h-1 rounded-full`,style:{backgroundColor:`var(--text-muted)`}}),(0,l.jsxs)(`span`,{className:`text-xs`,style:{color:`var(--text-muted)`},children:[v,` `,e(`admin.editor_reading_time`)]})]}),(0,l.jsx)(`h1`,{className:`text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight`,style:{color:`var(--text-primary)`,letterSpacing:`-0.02em`},children:m.title}),m.excerpt&&(0,l.jsx)(`p`,{className:`text-lg md:text-xl leading-relaxed mb-10`,style:{color:`var(--text-secondary)`,fontWeight:300,maxWidth:`60ch`,lineHeight:`1.7`},children:m.excerpt}),(0,l.jsx)(`div`,{className:`mb-10`,style:{borderTop:`1px solid var(--border)`}}),(0,l.jsx)(`div`,{className:`blog-content`,style:{color:`var(--text-primary)`,fontSize:`17px`,lineHeight:`1.8`,maxWidth:`65ch`},dangerouslySetInnerHTML:{__html:f(m.body)}})]})}),(0,l.jsx)(`div`,{className:`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16`,children:(0,l.jsx)(`div`,{style:{borderTop:`1px solid var(--border)`},className:`pt-8`,children:(0,l.jsxs)(o,{to:`/blog`,className:`inline-flex items-center gap-2 text-sm font-medium transition-colors`,style:{color:`var(--accent)`},children:[(0,l.jsx)(`svg`,{className:`w-4 h-4`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,viewBox:`0 0 24 24`,children:(0,l.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18`})}),e(`blog_admin.back_to_blog`)]})})}),(0,l.jsx)(`style`,{children:`
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
        }
        .blog-content p:first-of-type::first-letter {
          font-size: 3.5em;
          font-weight: 700;
          float: left;
          line-height: 0.85;
          margin-right: 0.1em;
          margin-top: 0.05em;
          color: var(--accent);
        }
        .blog-content strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        .blog-content a {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }
        .blog-content a:hover {
          opacity: 0.8;
        }
        .blog-content blockquote {
          font-size: 1.125rem;
          line-height: 1.7;
        }
        .blog-content ul, .blog-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content figure {
          margin: 2rem 0;
        }
        .blog-content figure img {
          display: block;
        }
        .blog-content video {
          display: block;
          margin: 2rem 0;
        }
        @media (max-width: 768px) {
          .blog-content p:first-of-type::first-letter {
            font-size: 2.5em;
          }
        }
      `})]})}export{p as default};