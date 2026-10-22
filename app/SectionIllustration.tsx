import "./illustrations.css";

type IllustrationKind = "story" | "day" | "venue" | "gallery" | "details" | "gifts" | "godparents" | "rsvp";

type SectionIllustrationProps = {
  kind: IllustrationKind;
  className?: string;
};

function Line({ d, className = "" }: { d: string; className?: string }) {
  return <path className={`motif-line ${className}`} pathLength="1" d={d} />;
}

/** A hand-drawn olive branch, shared like a tiny signature across the stationery. */
function Sprig({ transform = "" }: { transform?: string }) {
  return (
    <g className="motif-botanical" transform={transform}>
      <Line d="M0 38C9 29 18 16 22 0" />
      <Line className="motif-leaf" d="M6 31C-2 29-5 24-4 18C3 18 7 23 6 31Z" />
      <Line className="motif-leaf" d="M11 24C17 26 23 23 25 18C18 16 13 19 11 24Z" />
      <Line className="motif-leaf" d="M15 17C8 16 5 11 6 6C12 7 16 11 15 17Z" />
      <Line className="motif-leaf" d="M19 10C25 11 30 7 30 2C24 1 20 4 19 10Z" />
      <Line className="motif-leaf" d="M22 1C17-3 17-8 20-12C25-8 25-3 22 1Z" />
    </g>
  );
}

function Story() {
  return (
    <>
      <ellipse className="motif-wash" cx="90" cy="70" rx="57" ry="23" />
      <Line d="M90 47C85 40 78 36 70 36C54 36 43 48 43 63C43 78 54 90 70 90C84 90 95 79 96 66" />
      <Line d="M83 75C88 82 96 87 104 87C119 87 131 75 131 60C131 45 119 33 104 33C89 33 78 45 78 60C78 64 79 67 80 70" />
      <Line className="motif-fine" d="M87 46C82 41 77 39 70 39C56 39 46 50 46 63" />
      <Line className="motif-fine" d="M83 71C87 79 95 84 104 84C117 84 128 73 128 60" />
      <Line className="motif-heart" d="M86 22C83 18 77 18 77 23C77 27 83 30 86 33C89 30 95 27 95 23C95 18 89 18 86 22Z" />
      <Sprig transform="translate(125 67) rotate(24) scale(.72)" />
      <Line className="motif-ground" d="M41 99C69 102 111 102 139 99" />
    </>
  );
}

function Day() {
  return (
    <>
      <ellipse className="motif-wash" cx="87" cy="72" rx="50" ry="26" />
      <Line d="M55 32H116C119 32 121 34 121 37V91C121 94 119 96 116 96H55C52 96 50 94 50 91V37C50 34 52 32 55 32Z" />
      <Line d="M50 48H121M65 25V39M106 25V39" />
      <Line className="motif-fine" d="M59 57H67M80 57H88M101 57H109M59 69H67M59 81H67M101 81H109" />
      <Line className="motif-heart" d="M88 70C83 62 74 64 74 70C74 76 82 81 88 86C94 81 102 76 102 70C102 64 93 62 88 70Z" />
      <Line className="motif-fine" d="M129 26L134 20M136 37L144 35M117 20L119 13" />
      <Sprig transform="translate(36 68) rotate(-23) scale(.61)" />
      <Line className="motif-ground" d="M45 104H128" />
    </>
  );
}

function Venue() {
  return (
    <>
      <path className="motif-wash" d="M55 100V56C55 12 125 12 125 56V100Z" />
      <Line d="M52 100V55C52 34 69 17 90 17C111 17 128 34 128 55V100" />
      <Line d="M61 100V56C61 40 74 27 90 27C106 27 119 40 119 56V100" />
      <Line className="motif-fine" d="M90 29V100M63 56H117M69 39L88 56M111 39L92 56M66 63H84V91H66M96 63H114V91H96" />
      <Line d="M45 100H135M41 105H139M84 74V78M96 74V78" />
      <Sprig transform="translate(32 72) rotate(-14) scale(.75)" />
      <Sprig transform="translate(145 91) rotate(188) scale(.69)" />
      <Line className="motif-fine" d="M30 104C35 98 38 91 38 84M140 104C143 99 146 96 151 93" />
    </>
  );
}

function Gallery() {
  return (
    <>
      <path className="motif-wash" d="M35 36L89 27L100 94L46 103ZM90 33L145 42L135 105L80 96Z" />
      <g transform="rotate(-9 71 65)">
        <Line d="M44 26H97V99H44Z" />
        <Line className="motif-fine" d="M49 31H92V84H49Z" />
        <Line className="motif-fine" d="M50 74C61 61 68 59 77 67C83 57 89 58 92 61M50 78C65 72 77 78 91 72" />
        <Line className="motif-fine" d="M76 45C76 49 70 49 70 45C70 41 76 41 76 45Z" />
        <Line className="motif-fine" d="M64 91H77" />
      </g>
      <g transform="rotate(9 112 69)">
        <Line d="M89 35H141V105H89Z" />
        <Line className="motif-fine" d="M94 40H136V91H94Z" />
        <Line className="motif-heart" d="M115 58C110 52 103 54 103 60C103 66 110 70 115 75C120 70 127 66 127 60C127 54 120 52 115 58Z" />
        <Line className="motif-fine" d="M108 98H122" />
      </g>
      <Sprig transform="translate(33 77) rotate(-38) scale(.65)" />
      <Line className="motif-fine" d="M124 23L126 16M135 28L141 23" />
    </>
  );
}

function Details() {
  return (
    <>
      <ellipse className="motif-wash" cx="89" cy="70" rx="56" ry="24" />
      <Line className="motif-silk" d="M82 51C65 34 42 21 34 30C26 39 34 57 44 62C56 67 70 59 82 55" />
      <Line className="motif-silk" d="M98 51C114 34 136 21 145 30C153 39 146 57 136 62C124 67 110 59 98 55" />
      <Line className="motif-fine" d="M81 53C65 46 45 32 35 32M99 53C116 46 135 32 144 32M43 58C54 61 68 55 80 53M137 58C127 61 112 55 100 53" />
      <Line className="motif-silk" d="M83 57C80 72 67 88 54 98L55 79L39 81C54 73 69 64 81 54" />
      <Line className="motif-silk" d="M98 57C102 71 114 87 128 97L127 79L143 81C127 73 112 64 100 54" />
      <Line className="motif-fine" d="M81 59C72 71 64 81 55 89M100 59C109 71 118 83 127 89" />
      <Line d="M84 47C88 45 94 45 98 48L100 57C95 60 87 60 81 57Z" />
      <Line className="motif-fine" d="M88 48L86 57M94 48L96 57" />
      <Line className="motif-ground" d="M72 106H108" />
    </>
  );
}

function Gifts() {
  return (
    <>
      <ellipse className="motif-wash" cx="90" cy="78" rx="66" ry="23" />
      <Line d="M31 59H77V96H31ZM27 51H81V60H27Z" />
      <Line className="motif-fine" d="M50 52V96M58 52V96" />
      <Line className="motif-silk" d="M54 51C46 49 36 43 38 37C41 29 52 38 54 51ZM54 51C62 49 72 43 70 37C67 29 56 38 54 51Z" />
      <Line className="motif-fine" d="M54 50L43 43M54 50L65 43" />
      <Line d="M98 57H154V95H98ZM98 57L126 76L154 57M98 95L118 76M154 95L134 76" />
      <Line className="motif-heart" d="M126 80C124 77 120 78 120 81C120 84 124 86 126 88C129 86 132 84 132 81C132 78 128 77 126 80Z" />
      <Line className="motif-fine" d="M108 55V34H145V55M112 51V39H141V54" />
      <Line className="motif-fine" d="M128 44C125 41 121 44 124 46C128 48 125 52 121 49M125 42L123 51M115 45H116M136 45H137" />
      <Line className="motif-ground" d="M25 103H82M99 103H157" />
      <Line className="motif-fine" d="M89 43V49M86 46H92" />
    </>
  );
}

function Godparents() {
  return (
    <>
      <ellipse className="motif-wash" cx="91" cy="74" rx="58" ry="24" />
      <Line className="motif-silk" d="M43 70C58 60 73 56 88 58C99 55 108 48 113 38C116 32 121 31 126 35C130 39 129 45 125 49L146 47L131 58C138 65 150 70 161 74C141 80 122 76 107 70C91 79 68 81 50 75L39 83Z" />
      <circle cx="121" cy="39" r="1" fill="currentColor" />
      <Line className="motif-fine" d="M75 59C71 44 74 29 83 17C97 28 106 42 108 56M55 72C67 73 80 71 91 67M87 59C98 58 108 54 117 48" />
      <Line className="motif-fine" d="M146 47C152 41 158 36 166 32M153 41C151 36 154 32 159 31C159 36 157 40 153 41ZM159 36C164 38 168 35 169 31C165 29 161 32 159 36ZM164 32C162 27 165 23 169 21C171 25 169 30 164 32Z" />
      <Line className="motif-ground" d="M44 101C70 98 111 98 139 101" />
    </>
  );
}

function Rsvp() {
  return (
    <>
      <ellipse className="motif-wash" cx="84" cy="76" rx="56" ry="24" />
      <Line d="M39 57L80 27L121 57V100H39Z" />
      <path className="motif-paper" d="M50 37H109V84H50Z" />
      <Line d="M50 64V37H109V64" />
      <Line className="motif-heart" d="M80 48C75 42 68 44 68 50C68 56 75 60 80 65C85 60 92 56 92 50C92 44 85 42 80 48Z" />
      <Line className="motif-fine" d="M69 72H91M73 77H87" />
      <path className="motif-paper" d="M39 57L80 84L121 57V100H39Z" />
      <Line d="M39 57L80 84L121 57M39 100L68 77M121 100L92 77" />
      <Line className="motif-fine" d="M127 94C126 74 131 55 144 36" />
      <Line className="motif-silk" d="M131 73C125 57 134 34 154 24C155 46 147 65 131 73Z" />
      <Line className="motif-fine" d="M139 50L140 39M136 57L137 45M133 65L143 58M136 57L148 48" />
      <Line className="motif-ground" d="M34 105H132" />
    </>
  );
}

const illustrations = { story: Story, day: Day, venue: Venue, gallery: Gallery, details: Details, gifts: Gifts, godparents: Godparents, rsvp: Rsvp };

/** Decorative stationery art. Headings carry the section's accessible description. */
export default function SectionIllustration({ kind, className = "" }: SectionIllustrationProps) {
  const Drawing = illustrations[kind];
  return (
    <svg
      className={`section-illustration illustration-${kind} ${className}`.trim()}
      viewBox="0 0 180 118"
      width="180"
      height="118"
      aria-hidden="true"
      focusable="false"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Drawing />
    </svg>
  );
}
