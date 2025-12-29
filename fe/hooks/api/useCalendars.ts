import { useQuery } from '@tanstack/react-query';
import { calendarsService } from '@/lib/api/services/calendars.service';
import { QUERY_CONFIG } from '@/lib/constants';

export const useCalendars = (custom = true) => {
  return useQuery({
    queryKey: ['calendars', custom],
    queryFn: () => calendarsService.getCalendars(custom),
    staleTime: QUERY_CONFIG.CALENDARS_STALE_TIME,
  });
};