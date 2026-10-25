import FeedbackBoard from "@/components/feedback/FeedbackBoard";
import { feedbackPagePath } from "@/lib/feedback/types";

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  const params = await searchParams;
  return <FeedbackBoard initialPagePath={feedbackPagePath(params.from)} />;
}
