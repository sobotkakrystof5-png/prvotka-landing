import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Logo Prvotky: znak (patkový dřík P + faktura s přeloženým rohem, jejíž spodek
 * tvoří fajfka) a nápis. Překreslené do vektoru z dodaného návrhu, bez
 * konstrukčních linek a bez sloganu. Barva přes `currentColor`.
 *
 * Nápis jsou křivky z Newsreader 400, opsz 72 (src/assets/fonts), prostrkání
 * −60/2000 em. Při změně `site.name` se nápis nezmění, jde o logo, ne o text.
 * Samostatné soubory pro tisk a dokumenty jsou v `src/assets/brand/`.
 */

interface LogoProps {
  className?: string;
}

/** Geometrie znaku v jednotkách 488 × 710. */
export const MARK = {
  stem: "M0 0H250L188 209Q168 242 168 284V614Q170 696 276 702V710H0V702Q66 696 68 614V94Q66 10 0 8Z",
  flap: "M293 4L466 167H293Z",
  edge: "M456 167H476L486 382H466Z",
  /** Silnější pravá hrana pro malé velikosti (do cca 24 px), jinak by zmizela. */
  edgeCompact: "M446 167H482L492 382H456Z",
  check: "M248 518L284 556L470 372",
};

function MarkPaths({ compact }: { compact?: boolean }) {
  return (
    <>
      <path d={MARK.stem} />
      <path d={MARK.flap} />
      <path d={compact ? MARK.edgeCompact : MARK.edge} />
      <path d={MARK.check} fill="none" stroke="currentColor" strokeWidth={46} />
    </>
  );
}

/**
 * Samotný znak (uzel workflow, okno aplikace, favicon).
 * `compact` zesílí tenkou pravou hranu pro výšku pod cca 24 px.
 */
export function LogoMark({ className, compact }: LogoProps & { compact?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${compact ? 492 : 488} 710`}
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-7 w-auto", className)}
    >
      <MarkPaths compact={compact} />
    </svg>
  );
}

/** Nápis „Prvotka“ v křivkách, v jednotkách písma (2000/em, účaří y = 0). */
export const WORDMARK =
  "M1010 -1037Q1010 -1144 964 -1218Q918 -1293 812 -1332Q706 -1370 525 -1370H321V-1430H703Q888 -1430 1002 -1380Q1115 -1329 1168 -1243Q1220 -1157 1220 -1050Q1220 -940 1166 -848Q1112 -755 998 -700Q884 -645 703 -645H321V-705H655Q756 -705 836 -742Q917 -780 964 -854Q1010 -928 1010 -1037ZM453 -1430V-71L632 -29V0H68V-29L247 -71V-1360L68 -1401V-1430ZM1892 -1042Q1936 -1042 1962 -1017Q1988 -992 1988 -948Q1988 -895 1956 -862Q1923 -830 1873 -830Q1851 -830 1828 -836Q1806 -841 1781 -846Q1756 -852 1725 -852Q1696 -852 1670 -842Q1644 -831 1619 -813Q1594 -795 1567 -770V-814Q1642 -893 1694 -939Q1745 -985 1780 -1007Q1815 -1029 1841 -1036Q1867 -1042 1892 -1042ZM1579 -860V-57L1742 -27V0H1252V-27L1395 -57V-856Q1382 -864 1363 -876Q1344 -888 1316 -906Q1289 -923 1252 -946V-964L1575 -1055H1579ZM2966 -962 2551 26H2525L2073 -953L1945 -991V-1024H2422V-991L2277 -955L2628 -178H2584L2886 -961L2743 -991V-1024H3085V-991ZM3539 -24Q3636 -24 3702 -79Q3768 -134 3802 -242Q3835 -351 3835 -511Q3835 -672 3802 -780Q3769 -889 3704 -944Q3640 -1000 3545 -1000Q3448 -1000 3382 -945Q3316 -890 3282 -782Q3249 -673 3249 -513Q3249 -353 3282 -244Q3315 -135 3380 -80Q3444 -24 3539 -24ZM3537 20Q3401 20 3290 -48Q3178 -116 3112 -236Q3046 -357 3046 -513Q3046 -669 3114 -789Q3181 -909 3294 -976Q3408 -1044 3547 -1044Q3686 -1044 3797 -976Q3908 -908 3973 -788Q4038 -668 4038 -511Q4038 -355 3970 -235Q3901 -115 3787 -48Q3673 20 3537 20ZM4402 -262Q4402 -188 4448 -150Q4495 -113 4571 -113Q4615 -113 4663 -121Q4711 -129 4775 -148V-120Q4682 -65 4624 -34Q4567 -4 4526 8Q4485 21 4440 21Q4383 21 4332 -5Q4282 -31 4250 -88Q4218 -145 4218 -238V-896L4091 -974V-988Q4101 -995 4121 -1008Q4141 -1020 4168 -1038Q4196 -1056 4231 -1079Q4266 -1102 4307 -1128Q4348 -1155 4393 -1184H4402V-988ZM4340 -916V-1024H4747L4731 -916ZM5176 -594 5218 -637 5759 -56 5872 -27V0H5392V-27L5529 -54L5080 -536H5038V-582H5091L5562 -960L5415 -991V-1024H5799V-991L5652 -958ZM5073 -57 5216 -27V0H4746V-27L4889 -57V-1315Q4876 -1321 4852 -1332Q4829 -1342 4797 -1356Q4765 -1371 4726 -1389V-1407L5069 -1484H5073V-1320ZM6451 -666 6462 -624Q6321 -580 6234 -540Q6146 -500 6100 -460Q6054 -420 6037 -376Q6020 -332 6020 -279Q6020 -193 6070 -150Q6120 -106 6192 -106Q6250 -106 6293 -128Q6336 -151 6360 -194Q6385 -238 6385 -301V-760Q6385 -863 6334 -916Q6284 -969 6181 -969Q6132 -969 6082 -962Q6033 -954 6005 -940L6058 -980Q6055 -943 6048 -904Q6042 -864 6032 -832Q6023 -800 6010 -784Q5997 -768 5970 -759Q5944 -750 5916 -750Q5880 -750 5858 -764Q5837 -779 5837 -810Q5837 -852 5877 -894Q5917 -935 5980 -969Q6044 -1003 6118 -1024Q6191 -1044 6258 -1044Q6371 -1044 6439 -1011Q6507 -978 6538 -918Q6569 -859 6569 -779V-186Q6569 -153 6580 -133Q6590 -113 6609 -104Q6628 -95 6652 -95Q6686 -95 6720 -106Q6753 -117 6789 -142V-115Q6715 -27 6658 -4Q6601 20 6541 20Q6482 20 6448 -6Q6414 -33 6400 -83Q6385 -133 6382 -203H6385Q6368 -139 6330 -88Q6292 -38 6238 -9Q6184 20 6119 20Q5995 20 5912 -46Q5829 -112 5829 -238Q5829 -304 5852 -354Q5874 -405 5938 -451Q6003 -497 6126 -548Q6250 -599 6451 -666Z";

/**
 * Celé logo: znak + nápis. Znak je vysoký 1,39× výšky verzálek a svisle
 * vystředěný na verzálky, mezera 0,45× výšky verzálek (podle návrhu).
 * `markClassName` jde na vnitřní skupinu znaku, např. pro hover.
 */
export function LogoFull({
  className,
  markClassName,
  compact,
}: LogoProps & { markClassName?: string; compact?: boolean }) {
  return (
    <svg
      viewBox="0 -1572 8606 1868"
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-8 w-auto", className)}
    >
      <g transform="translate(0 -1572) scale(2.631)">
        <g className={markClassName}>
          <MarkPaths compact={compact} />
        </g>
      </g>
      <path transform="translate(1817 0)" d={WORDMARK} />
    </svg>
  );
}

/**
 * Logo místo názvu v textu: nápis má stejnou velikost a účaří jako okolní
 * písmo (výška 1868/2000 em, spodek 296/2000 em pod účařím), barva z textu.
 * Čtečky a vyhledávače dostanou název jako text.
 */
export function BrandName() {
  return (
    <>
      <LogoFull compact className="inline-block h-[0.934em] align-[-0.148em]" />
      <span className="sr-only">{site.name}</span>
    </>
  );
}
