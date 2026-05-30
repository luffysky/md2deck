import type { Metadata } from "next";
import StudioFrame from "@/components/StudioFrame";

export const metadata: Metadata = {
  title: "工具",
  description: "拖入檔案、挑樣式、即時預覽、下載漂亮 HTML。全在本機。",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return <StudioFrame />;
}
