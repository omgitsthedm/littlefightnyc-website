export function responsiveImageProps(
  src: string,
  sizes: string,
  widths = [480, 900],
) {
  if (!src.endsWith(".webp")) {
    return { sizes };
  }

  const base = src.slice(0, -".webp".length);

  return {
    sizes,
    srcSet: widths.map((width) => `${base}-${width}.webp ${width}w`).join(", "),
  };
}
