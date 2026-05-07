import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

/** Web: убираем системные полосы прокрутки, скролл остаётся (колёсико/тач). */
const hideScrollbarsCss = `
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  *::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }
`;

export default function HtmlRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style id="gocourses-hide-scrollbars" dangerouslySetInnerHTML={{ __html: hideScrollbarsCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
