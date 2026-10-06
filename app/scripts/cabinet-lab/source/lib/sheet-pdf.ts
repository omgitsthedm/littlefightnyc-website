/**
 * A minimal, dependency-free PDF writer for the study sheet.
 *
 * Shops trade in PDFs: they attach to an email, print at a real size, and drop into a job folder.
 * A PNG with baked-in text does none of that well. This wraps the composed sheet canvas as a
 * single-page, image-only PDF at letter proportions — no library, no build cost, and nothing
 * leaves the browser.
 */

const LATIN1 = (text: string): Uint8Array => {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) bytes[index] = text.charCodeAt(index) & 0xff;
  return bytes;
};

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/**
 * Chunks are concatenated with set(), never spread into push(). A JPEG of any real size blows
 * the argument limit — roughly 110k on V8 — and the whole export throws before it can download.
 */
function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Embeds the canvas as a JPEG (DCTDecode) — the one image filter every PDF reader has supported
 * since 1.0, so the file opens in Preview, Acrobat, and a phone mail client alike.
 */
export function canvasToPdfBlob(canvas: HTMLCanvasElement, title: string): Blob {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const jpeg = base64ToBytes(dataUrl.slice(dataUrl.indexOf(',') + 1));

  // Lay the sheet out at 150 dpi so a 1600px-wide canvas prints just under 11 inches wide.
  const pageWidth = (canvas.width / 150) * 72;
  const pageHeight = (canvas.height / 150) * 72;
  const round = (value: number) => value.toFixed(2);

  const objects: Uint8Array[] = [
    LATIN1('<< /Type /Catalog /Pages 2 0 R >>'),
    LATIN1('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    LATIN1(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${round(pageWidth)} ${round(pageHeight)}] `
      + '/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
    ),
    concatBytes([
      LATIN1(
        '<< /Type /XObject /Subtype /Image '
        + `/Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB `
        + `/BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      ),
      jpeg,
      LATIN1('\nendstream'),
    ]),
    (() => {
      const draw = `q ${round(pageWidth)} 0 0 ${round(pageHeight)} 0 0 cm /Im0 Do Q`;
      return LATIN1(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`);
    })(),
    LATIN1(
      '<< /Title (' + title.replace(/[\\()]/g, '') + ') '
      + '/Producer (Little Fight NYC Cabinet Lab) >>',
    ),
  ];

  const chunks: Uint8Array[] = [LATIN1('%PDF-1.4\n')];
  const offsets: number[] = [];
  let length = chunks[0]!.length;
  objects.forEach((body, index) => {
    offsets.push(length);
    const header = LATIN1(`${index + 1} 0 obj\n`);
    const footer = LATIN1('\nendobj\n');
    chunks.push(header, body, footer);
    length += header.length + body.length + footer.length;
  });

  // The cross-reference table is byte-offset addressed, so it has to be written last.
  const xref = length;
  const table = [LATIN1(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`)];
  for (const offset of offsets) table.push(LATIN1(`${String(offset).padStart(10, '0')} 00000 n \n`));
  table.push(LATIN1(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\n`
    + `startxref\n${xref}\n%%EOF\n`,
  ));

  const pdf = concatBytes([...chunks, ...table]);
  return new Blob([pdf.buffer as ArrayBuffer], { type: 'application/pdf' });
}
