import React from 'react';

interface ActivityDay {
  date: Date;
  count: number;
}

interface ActivityHeatmapProps {
  activities?: ActivityDay[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ activities = [] }) => {
  // Generate last 30 days
  const getLast30Days = (): ActivityDay[] => {
    const days: ActivityDay[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const activity = activities.find(
        (a) => a.date.toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        count: activity?.count || 0,
      });
    }
    return days;
  };

  const days = getLast30Days();

  // Group into weeks
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Determine color intensity based on count
  const getColorClass = (count: number): string => {
    if (count === 0) return 'bg-border-dark';
    if (count === 1) return 'bg-primary/30';
    if (count === 2) return 'bg-primary/50';
    if (count === 3) return 'bg-primary/70';
    return 'bg-primary';
  };

  // Format date for tooltip
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get the starting date and month transitions
  const startDate = days[0];
  const endDate = days[days.length - 1];
  
  // Find where month changes occur in weeks
  const getMonthLabel = (weekIndex: number): string | null => {
    const firstDay = weeks[weekIndex]?.[0];
    if (!firstDay) return null;
    
    if (weekIndex === 0) {
      return monthLabels[firstDay.date.getMonth()];
    }
    
    const prevWeek = weeks[weekIndex - 1];
    const prevMonth = prevWeek?.[0]?.date.getMonth();
    const currentMonth = firstDay.date.getMonth();
    
    if (currentMonth !== prevMonth) {
      return monthLabels[currentMonth];
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Activity</h3>
        <span className="text-xs text-text-secondary">
          {formatDate(startDate.date)} – {formatDate(endDate.date)}
        </span>
      </div>

      <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
        {/* Heatmap Grid */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {/* Week Label (only show for first week) */}
              {weekIndex === 0 && (
                <div className="h-6 w-10 flex items-center">
                  <span className="text-xs text-text-secondary font-medium">
                    {getMonthLabel(weekIndex) || ''}
                  </span>
                </div>
              )}
              
              {/* Month label for new months */}
              {weekIndex > 0 && getMonthLabel(weekIndex) && (
                <div className="h-6 w-10 flex items-center">
                  <span className="text-xs text-text-secondary font-medium">
                    {getMonthLabel(weekIndex)}
                  </span>
                </div>
              )}

              {/* Day cells for the week */}
              <div className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date.toISOString()}
                    title={`${formatDate(day.date)}: ${day.count} contributions`}
                    className={`
                      w-3 h-3 rounded-sm cursor-default
                      ${getColorClass(day.count)}
                      hover:ring-2 hover:ring-primary/50 transition-all
                    `}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border-dark text-xs text-text-secondary">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-border-dark rounded-sm" />
            <div className="w-3 h-3 bg-primary/30 rounded-sm" />
            <div className="w-3 h-3 bg-primary/50 rounded-sm" />
            <div className="w-3 h-3 bg-primary/70 rounded-sm" />
            <div className="w-3 h-3 bg-primary rounded-sm" />
          </div>
          <span>More</span>
        </div>

        {/* Info Text */}
        <div className="mt-4 pt-4 border-t border-border-dark">
          <p className="text-xs text-text-secondary text-center">
            Activity tracking will appear here as you create languages and content
          </p>
        </div>
      </div>
    </div>
  );
};
