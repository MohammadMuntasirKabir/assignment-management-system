interface EmptyStateProps {
  children: React.ReactNode;
}

export default function EmptyState({ children }: EmptyStateProps) {
  return <div className="empty-state">{children}</div>;
}
