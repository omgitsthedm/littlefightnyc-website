import { useScrollReveal } from "./useScrollReveal";
import "./EditorialBody.css";

type Props = {
  children: React.ReactNode;
  /** Apply a drop cap to the first paragraph. Use sparingly — once per page max. */
  dropcap?: boolean;
  /** Wider measure for long-form articles. Default false. */
  wide?: boolean;
};

/**
 * Long-form body content wrapper. Serif type, optional one-shot drop cap,
 * scroll-revealed. No pull quote machinery, no marginalia gimmicks.
 */
export default function EditorialBody({ children, dropcap = false, wide = false }: Props) {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`lf-body ${dropcap ? "lf-body--dropcap" : ""} ${wide ? "lf-body--wide" : ""}`}
    >
      {children}
    </div>
  );
}
