import type { CSSProperties } from "react";

/** Keep a single readable phrase for assistive technology, with visual letter reveals. */
export default function SoftText({ text }: { text: string }) {
  let letter = 0;
  return <span className="soft-text"><span className="text-accessible">{text}</span><span aria-hidden="true">{text.split(/(\s+)/).map((word, wordIndex) => /^\s+$/.test(word) ? word : <span className="soft-word" key={wordIndex}>{Array.from(word).map((character, index) => <span className="soft-letter" key={index} style={{ "--letter-delay": `${Math.min(letter++ * 12, 360)}ms` } as CSSProperties}>{character}</span>)}</span>)}</span></span>;
}
