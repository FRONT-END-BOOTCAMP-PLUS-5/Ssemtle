declare module 'canvas-confetti' {
  interface ConfettiOrigin {
    x?: number;
    y?: number;
  }
  interface ConfettiParams {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    ticks?: number;
    gravity?: number;
    origin?: ConfettiOrigin;
    scalar?: number;
    drift?: number;
    [key: string]: unknown;
  }

  function confetti(options?: ConfettiParams): void;
  export default confetti;
}
