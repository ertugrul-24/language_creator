interface VisibilityBadgeProps {
  visibility: string;
}

const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({ visibility }) => {
  const badgeConfig: Record<string, { icon: string; label: string; bg: string }> = {
    private: { icon: '🔒', label: 'Private', bg: 'bg-red-500' },
    friends: { icon: '👥', label: 'Friends Only', bg: 'bg-yellow-500' },
    public: { icon: '🌐', label: 'Public', bg: 'bg-green-500' },
  };

  const config = badgeConfig[visibility] || badgeConfig.private;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white ${config.bg}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default VisibilityBadge;
