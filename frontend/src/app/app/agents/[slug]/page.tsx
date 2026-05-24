import AgentDetail from '../../../../components/agents/AgentDetail'

export default function AgentDetailPage({ params }: { params: { slug: string } }) {
  return <AgentDetail agentSlug={params.slug} />
}