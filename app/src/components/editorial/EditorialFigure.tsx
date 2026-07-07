import { responsiveImageProps } from "@/lib/responsiveImages";
import "./EditorialFigure.css";

type Props = {
  src: string;
  alt: string;
  number?: string;
  caption: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export default function EditorialFigure({
  src,
  alt,
  number,
  caption,
  className = "",
  width,
  height,
  priority = false,
}: Props) {
  return (
    <figure className={`lf-fig ${className}`}>
      <div className="lf-fig__frame">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          {...responsiveImageProps(
            src,
            "(min-width: 1024px) 620px, (min-width: 640px) 60vw, 100vw",
            [480, 640, 900],
          )}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" } : {})}
        />
      </div>
      <figcaption className="lf-fig__caption">
        {number && (
          <span className="lf-mono lf-fig__number">{number}</span>
        )}
        <span className="lf-fig__text">{caption}</span>
      </figcaption>
    </figure>
  );
}
