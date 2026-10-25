import CorrelationMatrix from "./CorrelationMatrix";

export default function TeamCorrelationMatrix({ teamId }: { teamId: string }) {
  return <CorrelationMatrix teamId={teamId} endpoint={`/api/teams/${encodeURIComponent(teamId)}/correlation`} emptyMessage="This team has no current holdings to compare." />;
}
