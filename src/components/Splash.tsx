/** 水滴外形（viewBox 20×28） */
const DROP = "M10 1C10 1 2 11 2 18a8 8 0 0 0 16 0C18 11 10 1 10 1Z";

/**
 * 載入閘門 + 首次進站的加載畫面。
 *
 * 「準備好」＝ 中文字型（Google Fonts）載入完成 ＋ 首頁背景的魚畫出第一格（頁面沒有魚就不等）。
 * - 第一次進站（每個分頁工作階段一次）：顯示五滴水加載畫面，準備好且至少 2.5 秒後淡出，最多 6 秒。
 * - 之後的重新整理／再次進站：不顯示加載畫面，但整頁先透明（html.preparing），
 *   準備好才一次淡入，避免字型替換、Hero 動畫、魚晚出現造成的「卡一下」；最多等 1.2 秒。
 *
 * 加載畫面預設就是顯示（#splash 是 <body> 第一個元素），第一次繪製就是它，不會先閃過首頁。
 * 全部邏輯在 <head> 的同步 script（不用 next/script：beforeInteractive 不保證早於首次繪製）；
 * 只切 html 的 class，不改 React 擁有的 DOM，避免水合不一致。
 */
const headScript = (fontsHref: string) => `(function(){var h=document.documentElement,w=window;
var l=document.createElement('link');l.rel='stylesheet';l.href=${JSON.stringify(fontsHref)};
var fontOk=false,koiOk=!!w.__koiReady,domOk=false,splash=true;
try{splash=!sessionStorage.getItem('splashed')}catch(e){splash=false}
h.classList.add(splash?'splashing':'preparing');if(!splash)h.classList.add('no-splash');
var t0=Date.now(),done=false;
function finish(){if(done)return;done=true;
 if(splash){try{sessionStorage.setItem('splashed','1')}catch(e){}
  var s=document.getElementById('splash');if(s)s.classList.add('splash-out');
  h.classList.remove('splashing');setTimeout(function(){h.classList.add('no-splash')},700)}
 else h.classList.remove('preparing')}
function check(){if(done||!fontOk||!koiOk||!domOk)return;
 setTimeout(finish,splash?Math.max(0,2500-(Date.now()-t0)):0)}
function fontDone(){fontOk=true;check()}
l.onload=function(){var f=document.fonts;if(!f||!f.load)return fontDone();
 Promise.all([f.load('700 1em "Noto Serif TC"','泱興大'),f.load('400 1em "Noto Sans TC"','泱興大')]).then(fontDone,fontDone)};
l.onerror=fontDone;document.head.appendChild(l);
w.addEventListener('koi-ready',function(){koiOk=true;check()});
document.addEventListener('DOMContentLoaded',function(){domOk=true;if(!document.querySelector('[data-koi]'))koiOk=true;check()});
setTimeout(finish,splash?6000:1200)})()`;

/** 放在 <head> 最前面（同步執行，早於 body 繪製）；同時負責非同步載入中文字型 */
export function SplashHeadScript({ fontsHref }: { fontsHref: string }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: headScript(fontsHref) }} />
      {/* 沒有 JS 時不顯示加載畫面、直接載入字型 */}
      <noscript>
        <style>{"#splash{display:none!important}"}</style>
        <link rel="stylesheet" href={fontsHref} />
      </noscript>
    </>
  );
}

/** 放在 <body> 最前面 */
export default function Splash() {
  return (
    <div id="splash" aria-hidden="true" suppressHydrationWarning>
      <div className="splash-inner">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} className="splash-drop" viewBox="0 0 20 28" style={{ "--i": i } as React.CSSProperties}>
            <defs>
              <clipPath id={`splash-drop-${i}`}>
                <path d={DROP} />
              </clipPath>
            </defs>
            <path className="drop-edge" d={DROP} />
            <g clipPath={`url(#splash-drop-${i})`}>
              <rect className="drop-water" x="0" y="0" width="20" height="28" />
            </g>
            <ellipse className="drop-shine" cx="7" cy="17" rx="1.4" ry="2.6" />
          </svg>
        ))}
      </div>
    </div>
  );
}
