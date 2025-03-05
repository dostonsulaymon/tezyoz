import { Transform } from 'class-transformer';

export function TransformToInt() {
  return Transform(
    ({ value }) => {
      return typeof value !== 'string' ? undefined : parseInt(value, 10);
    },
    { toClassOnly: true }
  );
}
