"use client";
export default function StudioFrame() {
  return (
    <iframe
      src="/studio.html"
      title="md2deck Studio"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
