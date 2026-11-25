/**
 * 施工中畫面的中興鵝：坐在鍵盤後面用翅膀喀拉喀拉地敲。
 * typing=false 時停手（翅膀放下、不冒字），打字完成的空檔看起來像在檢查成果。
 * 動畫 keyframes 在 globals.css（goose-tap / goose-bob / goose-pop）。
 */
export default function TypingGoose({ typing, accent }: { typing: boolean; accent: string }) {
  const play = { animationPlayState: typing ? "running" : "paused" } as React.CSSProperties;
  return (
    <svg viewBox="0 0 220 200" className="goose h-auto w-full" role="img" aria-label="一隻中興鵝正在敲鍵盤">
      {/* 桌面 */}
      <line x1="10" y1="184" x2="210" y2="184" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />

      {/* 冒出來的「喀」「拉」 */}
      <g fontFamily="var(--font-serif)" fontWeight="700" fontSize="15" fill={accent}>
        <text x="20" y="152" className="goose-pop" style={play}>喀</text>
        <text x="188" y="150" className="goose-pop" style={{ ...play, animationDelay: "-0.45s" }}>拉</text>
      </g>

      {/* 身體 */}
      <ellipse cx="112" cy="132" rx="56" ry="40" fill="#F8FAFC" />
      <path d="M58 128 Q 40 112 52 100 Q 62 112 70 112 Z" fill="#E2E8F0" />

      {/* 脖子與頭：跟著節奏點頭 */}
      <g className="goose-bob" style={play}>
        <path d="M130 112 C 140 86, 118 66, 128 42" fill="none" stroke="#F8FAFC" strokeWidth="20" strokeLinecap="round" />
        <circle cx="131" cy="38" r="17" fill="#F8FAFC" />
        {/* 中國鵝的額瘤與嘴 */}
        <circle cx="146" cy="32" r="6" fill="#EA580C" />
        <path d="M144 36 L 170 45 Q 160 52 144 50 Z" fill="#F59E0B" />
        <circle cx="136" cy="34" r="2.6" fill="#0F172A" />
        <circle cx="136.8" cy="33.2" r="0.8" fill="#fff" />
        {/* 頭上的施工安全帽 */}
        <path d="M114 28 Q 116 10 132 9 Q 148 10 149 26 Z" fill="#FBBF24" />
        <rect x="110" y="25" width="42" height="5" rx="2.5" fill="#F59E0B" />
      </g>

      {/* 鍵盤 */}
      <rect x="40" y="158" width="150" height="24" rx="5" fill="#1E293B" stroke="currentColor" strokeOpacity="0.25" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`a${i}`} x={47 + i * 11.6} y="162" width="8.5" height="6" rx="1.5" fill="#334155" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={`b${i}`} x={52 + i * 11.6} y="171" width="8.5" height="6" rx="1.5" fill="#334155" />
      ))}

      {/* 兩隻翅膀輪流敲 */}
      {/* CSS 動畫會蓋掉 transform 屬性，所以旋轉放在 ellipse、動畫放在外層 g */}
      <g className="goose-tap" style={play}>
        <ellipse cx="86" cy="160" rx="22" ry="9" fill="#E2E8F0" transform="rotate(14 86 160)" />
      </g>
      <g className="goose-tap" style={{ ...play, animationDelay: "-0.15s" }}>
        <ellipse cx="140" cy="160" rx="22" ry="9" fill="#E2E8F0" transform="rotate(-14 140 160)" />
      </g>
    </svg>
  );
}
