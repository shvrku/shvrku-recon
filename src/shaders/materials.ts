export const DOM_SYNC_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const DOM_SYNC_FRAG = /* glsl */ `
uniform sampler2D map;
uniform sampler2D mapHover;
uniform vec4 uRect;
uniform float uHoverRevealProgress;
uniform float uDotPixelSize;
uniform vec2 uViewportPx;
uniform float uCurlStrength;
uniform float uCurlOnly;
uniform float uRevealProgress;

varying vec2 vUv;

vec2 applyCurl(vec2 screenUv) {
  float centered = 2.0 * screenUv.y - 1.0;
  float profile = 1.0 - sqrt(max(0.0, 1.0 - centered * centered));
  float uvScale = 1.0 - profile * uCurlStrength;
  float distortedX = (screenUv.x - 0.5) * uvScale + 0.5;
  return vec2(distortedX, screenUv.y);
}

void main() {
  vec2 screenUv = applyCurl(vUv);
  vec2 localUv = (screenUv - uRect.xy) / uRect.zw;
  vec2 edge = min(localUv, 1.0 - localUv);
  float inside = step(0.0, edge.x) * step(0.0, edge.y);
  if (inside < 0.5) discard;

  vec4 baseColor = texture2D(map, clamp(localUv, 0.0, 1.0));
  vec4 color = baseColor;

  if (uCurlOnly < 0.5) {
    vec4 hoverColor = texture2D(mapHover, clamp(localUv, 0.0, 1.0));
    float progress = clamp(uHoverRevealProgress, 0.0, 1.0);

    if (progress >= 0.995) {
      color = hoverColor;
    } else if (progress > 0.001) {
      vec2 viewportPx = max(uViewportPx, vec2(1.0));
      vec2 cellSizeUv = vec2(max(2.0, uDotPixelSize)) / viewportPx;
      vec2 cellUv = fract(screenUv / cellSizeUv);
      float squareDist = max(abs(cellUv.x - 0.5), abs(cellUv.y - 0.5));

      float rectWidthPx = max(uRect.z * uViewportPx.x, 1.0);
      float rectHeightPx = max(uRect.w * uViewportPx.y, 1.0);
      float rectAspect = rectWidthPx / rectHeightPx;
      vec2 centered = localUv * 2.0 - 1.0;
      centered.x *= rectAspect;
      float distToCenter = length(centered);
      float maxRadius = length(vec2(rectAspect, 1.0));
      float radius = progress * (maxRadius + 0.12);
      float grow = 1.0 - smoothstep(radius - 0.12, radius + 0.12, distToCenter);

      float squareAa = max(fwidth(squareDist), 0.0001);
      float squareExtent = mix(0.0, 0.5 + squareAa * 3.0, grow);
      float squareMask = 1.0 - smoothstep(squareExtent - squareAa, squareExtent + squareAa, squareDist);
      color = mix(baseColor, hoverColor, clamp(squareMask, 0.0, 1.0));
    }
  }

  color.a = 1.0;
  vec3 veilColor = vec3(0.031, 0.031, 0.027);
  color.rgb = mix(veilColor, color.rgb, clamp(uRevealProgress, 0.0, 1.0));
  gl_FragColor = color;
}
`;
