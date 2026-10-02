import TablepageView from "@/features/tablepage/tablepageView";

export default async function TablePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <TablepageView tableNumber={decodeURIComponent(number)} />;
}
