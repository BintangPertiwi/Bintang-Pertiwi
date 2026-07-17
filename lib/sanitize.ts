import sanitize from "sanitize-html";

export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: [
      "b", "i", "em", "strong", "a", "p", "br",
      "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "span", "img"
    ],
    allowedAttributes: {
      "*": ["class"],
      "a": ["href", "target", "rel"],
      "img": ["src", "alt", "width", "height"]
    },
    // Skema eksplisit: blokir javascript:, data:, dsb pada href/src.
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    // Paksa rel aman pada semua link (cegah reverse tabnabbing untuk target=_blank).
    transformTags: {
      a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });
}
