"use client";

import { useId } from "react";

type OpeningFloralsProps = { position: "top" | "bottom" };

/** A light botanical corner, printed softly behind the opening stationery. */
export default function OpeningFlorals({ position }: OpeningFloralsProps) {
  const id = useId().replace(/:/g, "");
  const petal = `${id}-petal`;
  const heart = `${id}-heart`;
  const leaf = `${id}-leaf`;
  const rose = `${id}-rose`;
  const cosmos = `${id}-cosmos`;
  const leafShape = `${id}-leaf-shape`;

  return (
    <svg
      className={`opening-florals opening-florals--${position}`}
      viewBox="0 0 480 480"
      width="480"
      height="480"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={petal} cx=".39" cy=".27" r=".8">
          <stop stopColor="#fffef7" />
          <stop offset=".6" stopColor="#f5eddf" />
          <stop offset="1" stopColor="#e7d7bf" />
        </radialGradient>
        <radialGradient id={heart} cx=".44" cy=".35" r=".75">
          <stop stopColor="#fff9ee" />
          <stop offset=".65" stopColor="#e9d9c0" />
          <stop offset="1" stopColor="#cfb78e" />
        </radialGradient>
        <linearGradient id={leaf} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#dce0cf" stopOpacity=".78" />
          <stop offset="1" stopColor="#9da58d" stopOpacity=".48" />
        </linearGradient>
        <g id={leafShape}>
          <path d="M0 0C-21-6-34-25-28-47C-8-42 4-22 0 0Z" fill={`url(#${leaf})`} />
          <path d="M0 0C-10-15-19-29-27-45" stroke="#a1aa91" strokeOpacity=".42" strokeWidth=".8" />
        </g>
        <g id={rose} stroke="#bda783" strokeWidth=".75" strokeOpacity=".47" strokeLinejoin="round">
          <path d="M-4-51C10-66 31-57 36-39C57-41 70-20 59-1C69 15 58 37 37 40C29 60 5 66-10 51C-28 61-49 46-46 27C-68 18-66-9-49-21C-53-44-26-62-4-51Z" fill={`url(#${petal})`} />
          <path d="M-4-49C-21-36-34-20-27-6C-41 2-45 17-42 29M36-38C18-42 3-31 2-17C-10-27-28-24-35-14M58-1C44-15 24-13 15-1C12-17-3-28-17-22M36 39C37 20 25 7 10 7C22-3 17-23 5-28M-10 50C5 40 10 27 5 15C20 25 37 19 43 7M-44 26C-26 29-10 22-8 8C-21 17-38 10-41-3" />
          <path d="M-23-8C-23-26-3-36 11-24C28-26 38-10 29 3C34 19 19 32 5 26C-11 36-29 22-23 8C-35 2-35-9-23-8Z" fill={`url(#${petal})`} />
          <path d="M-22-7C-8-15 7-11 10 0C18-8 24-13 24-17M5 25C12 17 14 8 8 0C-2 9-14 8-23 3M-7-23C-15-11-7 1 6 3" />
          <path d="M-5-12C6-17 16-6 10 3C4 13-11 10-12 0C-14-7-9-13-5-12Z" fill={`url(#${heart})`} />
          <path d="M-8-4C0-9 8-5 6 1C4 6-2 7-5 3C-8 0-5-3-2-2" strokeOpacity=".7" />
        </g>
        <g id={cosmos} stroke="#c4ad87" strokeOpacity=".38" strokeWidth=".65">
          {[-8, 52, 112, 172, 232, 292].map((rotation) => (
            <path
              key={rotation}
              transform={`rotate(${rotation})`}
              d="M0 5C-19-4-31-24-22-38C-17-44-10-42-7-39C-4-46 6-47 12-40C24-24 17-6 0 5Z"
              fill={`url(#${petal})`}
            />
          ))}
          <path d="M-11 0C-12-9-3-15 4-11C13-11 17-2 10 5C7 14-6 14-10 6Z" fill={`url(#${heart})`} />
          <g stroke="#ab9169" strokeOpacity=".62" strokeLinecap="round">
            <path d="M-5-3L-7-6M1-5L2-8M5-1L8-2M3 4L5 7M-3 5L-4 8M-6 1L-9 2" />
            <path d="M0 0H.1M-3-1H-2.9M2 2H2.1" strokeWidth="2" />
          </g>
        </g>
      </defs>

      <g transform={position === "bottom" ? "translate(480 480) rotate(180)" : undefined}>
        <g stroke="#a7af98" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round">
          <path d="M34 355C61 288 89 215 143 151C185 101 238 68 319 38" />
          <path d="M62 282C31 242 21 198 29 153M94 211C60 172 55 128 62 88M162 131C171 88 173 53 164 24M219 86C260 92 300 79 344 57" />
          <path d="M50 316C77 303 101 286 118 260M123 173C145 179 163 178 184 171M278 53C296 29 318 15 340 11" />
        </g>

        <g opacity=".88">
          <use href={`#${leafShape}`} transform="translate(41 315) rotate(-52) scale(.92)" />
          <use href={`#${leafShape}`} transform="translate(63 275) rotate(98) scale(.9)" />
          <use href={`#${leafShape}`} transform="translate(83 237) rotate(-27) scale(.96)" />
          <use href={`#${leafShape}`} transform="translate(32 208) rotate(-15) scale(.8)" />
          <use href={`#${leafShape}`} transform="translate(29 166) rotate(58) scale(.7)" />
          <use href={`#${leafShape}`} transform="translate(62 124) rotate(-8) scale(.86)" />
          <use href={`#${leafShape}`} transform="translate(171 87) rotate(67) scale(.8)" />
          <use href={`#${leafShape}`} transform="translate(171 59) rotate(-17) scale(.69)" />
          <use href={`#${leafShape}`} transform="translate(266 85) rotate(121) scale(.78)" />
          <use href={`#${leafShape}`} transform="translate(309 72) rotate(88) scale(.69)" />
          <use href={`#${leafShape}`} transform="translate(312 26) rotate(35) scale(.57)" />
          <use href={`#${leafShape}`} transform="translate(102 277) rotate(86) scale(.64)" />
          <use href={`#${leafShape}`} transform="translate(168 176) rotate(108) scale(.65)" />
        </g>

        <use href={`#${cosmos}`} transform="translate(93 227) rotate(-22) scale(.77)" />
        <use href={`#${rose}`} transform="translate(112 132) rotate(-18) scale(1.02)" />
        <use href={`#${cosmos}`} transform="translate(218 93) rotate(14) scale(.83)" />

        <g stroke="#bca885" strokeWidth=".8" strokeOpacity=".48" strokeLinecap="round">
          <path d="M34 355C22 331 17 309 22 284M292 48C323 47 355 38 383 24" />
          <path d="M21 308L11 295M24 321L34 306M342 39L350 25M357 33L371 38" />
          <path d="M30 366C38 357 44 344 47 333M350 19C363 15 375 13 386 15" />
        </g>
        <g fill="#d4c1a0" opacity=".55">
          <ellipse cx="11" cy="293" rx="2" ry="3.2" transform="rotate(-28 11 293)" />
          <ellipse cx="22" cy="282" rx="2" ry="3.2" transform="rotate(8 22 282)" />
          <ellipse cx="35" cy="304" rx="2" ry="3.2" transform="rotate(33 35 304)" />
          <ellipse cx="350" cy="23" rx="2" ry="3.2" transform="rotate(32 350 23)" />
          <ellipse cx="373" cy="38" rx="3.2" ry="2" transform="rotate(-8 373 38)" />
          <ellipse cx="386" cy="24" rx="3.2" ry="2" transform="rotate(-25 386 24)" />
        </g>
      </g>
    </svg>
  );
}
