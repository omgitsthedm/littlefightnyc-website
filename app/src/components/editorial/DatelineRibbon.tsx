import PhoneAction from "./PhoneAction";
import "./DatelineRibbon.css";

type Props = {
  issue?: string;
  date?: string;
};

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

function formatDateline(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function DatelineRibbon({
  issue = "№01",
  date = formatDateline(new Date()),
}: Props) {
  return (
    <div className="lf-dateline" role="banner" aria-label="Issue dateline">
      <div className="lf-container lf-dateline__inner">
        <span className="lf-mono lf-dateline__date">{date}</span>
        <span className="lf-dateline__divider" aria-hidden="true" />
        <span className="lf-mono lf-dateline__issue">
          ISSUE <span className="lf-dateline__issue-num">{issue}</span>
        </span>
        <span className="lf-dateline__divider" aria-hidden="true" />
        <span className="lf-mono lf-dateline__locale">NEW YORK CITY</span>
        <PhoneAction
          className="lf-mono lf-dateline__phone"
          ariaLabel="Call or text Little Fight NYC"
          align="right"
        >
          <span aria-hidden="true">→</span> (646) 360-0318
        </PhoneAction>
      </div>
    </div>
  );
}
