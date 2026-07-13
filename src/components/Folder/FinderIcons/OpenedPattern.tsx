export const OpenedPattern = ({ id }: { id: string }) => (
  <defs>
    <pattern id={id} width="4" height="2" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="white" />
      <rect x="0" y="0" width="1" height="1" fill="black" />
      <rect x="2" y="1" width="1" height="1" fill="black" />
    </pattern>
  </defs>
);
