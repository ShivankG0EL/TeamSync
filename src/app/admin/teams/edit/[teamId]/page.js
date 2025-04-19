import EditTeam from '@/components/AdminPages/TeamManagement/EditTeam';

export default function EditTeamPage({ params }) {
  return <EditTeam teamId={params.teamId} />;
}
