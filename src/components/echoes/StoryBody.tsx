/** 極簡 Markdown：空行分段、**粗體**。伺服器與用戶端皆可使用。 */
export default function StoryBody({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`grid gap-5 ${className}`}>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para.split(/(\*\*[^*]+\*\*)/).map((seg, j) =>
            seg.startsWith("**") ? (
              <strong key={j} className="font-serif font-bold text-moon">
                {seg.slice(2, -2)}
              </strong>
            ) : (
              seg
            ),
          )}
        </p>
      ))}
    </div>
  );
}
