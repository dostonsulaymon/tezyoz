import { Transform } from 'class-transformer';
import { DateTime } from 'luxon';

export function TransformToDate(): PropertyDecorator {
  return Transform(
    ({ value }): Date | undefined => {
      if (!value || typeof value !== 'string') {
        return undefined;
      }

      const date = DateTime.fromISO(value, { zone: 'utc' }).toJSDate();

      return isNaN(date.getTime()) ? undefined : date;
    },
    { toClassOnly: true }
  );
}
