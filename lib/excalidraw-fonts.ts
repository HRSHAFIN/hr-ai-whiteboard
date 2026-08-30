// Excalidraw's hand-drawn canvas fonts (Excalifont/Virgil) sit in the
// browser's "unloaded" FontFace state until something actually forces them
// to load -- document.fonts.ready does NOT trigger that on its own. If text
// is measured/painted before that finishes, the canvas can render with
// different metrics than what was measured, visibly clipping text that
// should fit. Force them to load before adding any new text to the canvas.
export async function ensureExcalidrawFontsLoaded() {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const sizes = [12, 13, 14, 15, 16, 18, 28, 48];
  try {
    await Promise.all(
      sizes.flatMap((size) => [
        document.fonts.load(`${size}px "Excalifont"`),
        document.fonts.load(`${size}px "Virgil"`),
      ])
    );
  } catch {
    // Best-effort -- if font loading itself errors, proceed anyway rather
    // than blocking generation.
  }
}
