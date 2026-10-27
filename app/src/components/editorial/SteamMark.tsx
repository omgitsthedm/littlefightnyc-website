import mark from "../../../preview-content/steam-mark.json";

/** Decorative, complete at first paint. The shared static-site controller owns playback. */
export default function SteamMark({ play = false }: { play?: boolean }) {
  return <span className="steam-mark steam-mark--thanks" data-steam-mark={play ? "confirmation" : "static"} aria-hidden="true">
    <svg viewBox={mark.viewBox} focusable="false">
      <g fill="#f97316" transform={mark.transform}>
        {mark.paths.map((d, index) => <path key={index} d={d} />)}
      </g>
    </svg>
  </span>;
}
