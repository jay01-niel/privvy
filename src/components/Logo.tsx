export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="PrivyCash"
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}
