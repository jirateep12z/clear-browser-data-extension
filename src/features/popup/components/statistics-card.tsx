import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FormatDate } from '@/lib/format-date';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { memo } from 'react';
import { FormatCompactCount } from '../lib/format-compact-count';
import type { StatisticsCardProps } from '../types/props';

export const StatisticsCard = memo(function StatisticsCard({
  statistics
}: StatisticsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Statistics
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              Total Count
            </p>
            <p className="text-2xl font-bold">
              {FormatCompactCount(statistics.total_count)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Last Updated
            </p>
            <p className="text-sm font-medium">
              {FormatDate(statistics.last_date)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
