import { useQuery } from '@tanstack/react-query';
import { calendarsService } from '../../lib/api/services/calendars.service';

export const useCalendars = (custom = true) => {
  return useQuery({
    queryKey: ['calendars', custom],
    queryFn: () => calendarsService.getCalendars(custom),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};