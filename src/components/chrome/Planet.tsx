export function Planet() {
  const meridians = Array.from({ length: 6 }, (_, i) => i);
  return (
    <svg
      width="48"
      height="24"
      viewBox="0 0 48 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-current"
    >
      <ellipse
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        cx="24"
        cy="12"
        rx="22"
        ry="11"
      />
      <path
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        d="M2 12H46"
      />
      {meridians.map((i) => (
        <g key={i} transform="translate(24 12)">
          <g>
            <animateTransform
              attributeName="transform"
              type="scale"
              dur="2600ms"
              repeatCount="indefinite"
              values="1 1;-1 1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.42 0 0.58 1"
              begin={`${-i * (2600 / 6)}ms`}
            />
            <path
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              d="M24 23C11.8497 23 2 18.0751 2 12C2 5.92487 11.8497 1 24 1"
              transform="translate(-24 -12)"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
