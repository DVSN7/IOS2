#ifdef GL_ES
precision mediump float;
#endif

#define M_PI 3.14159265358979323846

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_cellSize;
uniform float u_noiseScale;
uniform int u_maxDepth;
uniform float u_noiseSeed;
uniform float u_flowSpeed;
uniform float u_paletteIndex1;
uniform float u_paletteIndex2;
uniform float u_scaleFactor;
uniform vec2 u_translation;
uniform float u_amplitude;
uniform float u_reactionInfluence;
uniform float u_rdParameterA;
uniform float u_rdParameterB;
uniform float u_paletteThreshold;
uniform float u_caInfluence;
uniform float u_seed;
uniform float u_frequency;
uniform float u_time;
uniform float u_domainWarpIntensity; // NEW: Control domain-warp strength

// NEW: Depth enhancement uniforms
uniform float u_layerNoiseThreshold; // NEW: Threshold for layer visibility
uniform float u_depthFalloffRate; // NEW: Rate of depth falloff

// NEW: Linework uniforms
uniform float u_lineworkEnabled;
uniform float u_lineworkIntensity;
uniform float u_lineworkThreshold;
uniform vec3 u_lineworkColor;
uniform float u_lineworkWidth;
uniform float u_lineworkType;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

float random(vec2 st, float seed) {
    return fract(sin(dot(st, vec2(12.9898, 78.233)) + seed) * 43758.5453);
}

float noise(vec2 st, float seed) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i, seed);
    float b = random(i + vec2(1., 0.), seed);
    float c = random(i + vec2(0., 1.), seed);
    float d = random(i + vec2(1., 1.), seed);
    vec2 u = f * f * (3. - 2. * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - c) * u.x * u.y;
}

vec3 mod289(vec3 x) {
    return x - floor(x * (1. / 289.)) * 289.;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1. / 289.)) * 289.;
}

vec3 permute(vec3 x) {
    return mod289(((x * 34.) + 1.) * x);
}

float simplexNoise(vec2 v, float time) {
    v += time * 0.;
    const vec4 C = vec4(.211324865, .366025404, -.577350269, .024390244);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
    m = m * m;
    m = m * m;
    vec3 x = 2. * fract(p * C.www) - 1.;
    vec3 h = abs(x) - .5;
    vec3 ox = floor(x + .5);
    vec3 a0 = x - ox;
    m *= 1.792842914 - .853734721 * (a0 * a0 + h * h);
    vec3 g = a0 * vec3(x0.x, x12.x, x12.z) + h * vec3(x0.y, x12.y, x12.w);
    return 130. * dot(m, g);
}

vec2 reactionDiffusion(vec2 st, float time) {
    vec2 lastReaction = vec2(0.);
    float a = simplexNoise(st * u_rdParameterA + lastReaction, time * 0.);
    float b = simplexNoise(st * u_rdParameterB + vec2(10.) + lastReaction, time * 0.);
    lastReaction = vec2(a, a * (1. - b));
    return lastReaction;
}

float fbmSimplexNoise(vec2 v, int octaves) {
    float total = 0.;
    float amplitude = .03;
    float frequency = u_frequency;
    vec2 lastState = vec2(0.);
    const int MAX_OCTAVES = 8;
    
    for(int i = 0; i < MAX_OCTAVES; i++) {
        if(i >= octaves) break;
        float a = simplexNoise(v * frequency + lastState.x, u_seed);
        float b = simplexNoise(v * frequency + vec2(10.) + lastState.y, u_seed);
        lastState = vec2(a, b * (1. - a));
        total += amplitude * a;
        frequency *= 2. + u_seed;
        amplitude *= .5;
    }
    return total;
}

float getCAState(vec2 gridCoord, float seed) {
    float caValue = random(gridCoord * u_cellSize + seed);
    return step(.3, caValue);
}

vec2 applyCARDEffect(vec2 st, float time, vec2 gridCoord, float seed) {
    float caState = getCAState(gridCoord, seed);
    vec2 rdResult = reactionDiffusion(st, time * 0.);
    return rdResult * (1. + u_caInfluence * caState);
}

float ridgedMF(vec2 st, float time) {
    float total = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    float offset = 1.8;
    float gain = 3.5;
    const int MAX_RIDGED_OCTAVES = 16;
    
    for(int i = 0; i < MAX_RIDGED_OCTAVES; i++) {
        float n = abs(simplexNoise(st * frequency + u_seed, time * 0.));
        n = offset - n;
        n = n * n;
        total += n * amplitude;
        frequency *= 2.;
        amplitude *= gain;
    }
    return total;
}

// NEW: Domain-Warp Stacks function - Much more localized and gentle
vec2 domainWarp(vec2 p, float time, float intensity) {
    // Only apply very subtle, localized warping
    float warpScale = intensity * 0.001; // Extremely small scale factor
    
    // Single, very gentle noise-based warp
    float noise1 = simplexNoise(p * 0.01 + u_seed * 0.1, time * 0.05) * warpScale;
    float noise2 = simplexNoise(p * 0.015 + u_seed * 0.2, time * 0.07) * warpScale;
    
    // Return barely modified coordinates
    return p + vec2(noise1, noise2);
}

// NEW: Linework extraction function
vec3 extractLinework(vec3 baseColor, vec2 uv, float height) {
    if (u_lineworkEnabled < 0.5) {
        return baseColor; // Linework disabled
    }
    
    // Extract structural lines using the actual coordinate system
    vec2 pixelCoord = gl_FragCoord.xy;
    vec2 d = vec2(1.0, 1.0); // Single pixel offset
    
    // Sample the height field at neighboring pixels using the actual algorithm
    vec2 e = (uv * u_resolution - u_resolution * 0.5) * u_scaleFactor + u_translation;
    e = domainWarp(e, u_time, u_domainWarpIntensity);
    
    // Calculate height at current pixel
    float h00 = height;
    
    // Calculate height at neighboring pixels
    vec2 e1 = e + vec2(d.x, 0.0);
    vec2 e2 = e + vec2(0.0, d.y);
    
    // Use the same height calculation as the main algorithm
    float h10 = fbmSimplexNoise(e1 + noise(floor(e1 / u_cellSize) * 0.1, u_noiseSeed), 8);
    float h01 = fbmSimplexNoise(e2 + noise(floor(e2 / u_cellSize) * 0.1, u_noiseSeed), 8);
    
    float lineValue = 0.0;
    
    // Different linework types
    if (u_lineworkType < 0.5) {
        // EDGES: Basic edge detection using gradient magnitude
        vec2 gradient = vec2(h10 - h00, h01 - h00);
        float gradientMagnitude = length(gradient);
        lineValue = smoothstep(u_lineworkThreshold - 0.2, u_lineworkThreshold + 0.2, gradientMagnitude);
    } else if (u_lineworkType < 1.5) {
        // CONTOURS: Lines where height is constant (isocontours)
        float heightDiff = abs(h10 - h00) + abs(h01 - h00);
        lineValue = smoothstep(u_lineworkThreshold - 0.1, u_lineworkThreshold + 0.1, heightDiff);
        lineValue = 1.0 - lineValue; // Invert so contours show where height is similar
    } else if (u_lineworkType < 2.5) {
        // RIDGES: Lines along high points
        float ridge = max(h10, h01) - h00;
        lineValue = smoothstep(u_lineworkThreshold - 0.1, u_lineworkThreshold + 0.1, ridge);
    } else {
        // VALLEYS: Lines along low points
        float valley = h00 - min(h10, h01);
        lineValue = smoothstep(u_lineworkThreshold - 0.1, u_lineworkThreshold + 0.1, valley);
    }
    
    // Apply linework with intensity control
    vec3 lineColor = u_lineworkColor * lineValue * u_lineworkIntensity;
    
    // Blend with base color (additive blend for white lines)
    return baseColor + lineColor * lineValue * u_lineworkIntensity;
}

vec3 getColorFromPalette(int pIdx, float t) {
    vec3 c1, c2, c3, c4, c5, c6, c7, c8;
    
    if(pIdx == 0) {
        c1 = vec3(.05, .02, .01);
        c2 = vec3(.4, .2, .1);
        c3 = vec3(.75, .5, .3);
        c4 = vec3(.9, .7, .5);
        c5 = vec3(.2, .1, .05);
        c6 = vec3(.6, .4, .2);
        c7 = vec3(.95, .85, .7);
        c8 = vec3(.8, .6, .5);
    } else if(pIdx == 1) {
        c1 = vec3(.05, .02, .01);
        c2 = vec3(.15, .05, .03);
        c3 = vec3(.6, .1, .1);
        c4 = vec3(.85, .3, .2);
        c5 = vec3(.3, .05, .05);
        c6 = vec3(.8, .6, .5);
        c7 = vec3(.4, .15, .1);
        c8 = vec3(.9, .8, .7);
    } else if(pIdx == 2) {
        c1 = vec3(.28, .31, .23);
        c2 = vec3(.82, .27, .17);
        c3 = vec3(.03, .45, .54);
        c4 = vec3(.93, .47, .17);
        c5 = vec3(.08, .18, .19);
        c6 = vec3(.47, .5, .36);
        c7 = vec3(.71, .74, .63);
        c8 = vec3(.52, .31, .18);
    } else if(pIdx == 3) {
        c1 = vec3(.8, .2, .2);
        c2 = vec3(.6, .1, .1);
        c3 = vec3(.95, .5, .1);
        c4 = vec3(.9, .4, .2);
        c5 = vec3(.5, .2, .1);
        c6 = vec3(.9, .7, .4);
        c7 = vec3(.7, .1, .1);
        c8 = vec3(.3, .1, .1);
    } else if(pIdx == 4) {
        c1 = vec3(.9);
        c2 = vec3(.8);
        c3 = vec3(.7);
        c4 = vec3(.6);
        c5 = vec3(.5);
        c6 = vec3(.4);
        c7 = vec3(.3);
        c8 = vec3(.1);
    } else if(pIdx == 5) {
        c1 = vec3(.76, .62, .47);
        c2 = vec3(.35, .35, .27);
        c3 = vec3(.17, .21, .19);
        c4 = vec3(.57, .61, .52);
        c5 = vec3(.71, .71, .61);
        c6 = vec3(.46, .49, .4);
        c7 = vec3(.84, .8, .7);
        c8 = vec3(.62, .49, .35);
    } else if(pIdx == 6) {
        c1 = vec3(.1, .3, .1);
        c2 = vec3(.2, .5, .3);
        c3 = vec3(.6, .8, .7);
        c4 = vec3(.3, .5, .7);
        c5 = vec3(.5, .7, .9);
        c6 = vec3(.15, .4, .15);
        c7 = vec3(.7, .8, .9);
        c8 = vec3(.1, .5, .4);
    } else if(pIdx == 7) {
        c1 = vec3(.05, .1, .3);
        c2 = vec3(.2, .4, .6);
        c3 = vec3(.1, .3, .5);
        c4 = vec3(.2, .5, .4);
        c5 = vec3(.4, .6, .5);
        c6 = vec3(.1, .2, .3);
        c7 = vec3(.5, .7, .8);
        c8 = vec3(.3, .4, .6);
    } else if(pIdx == 8) {
        c1 = vec3(.52, .22, .24);
        c2 = vec3(.92, .18, .2);
        c3 = vec3(.08, .33, .57);
        c4 = vec3(.45, .42, .45);
        c5 = vec3(.07, .17, .33);
        c6 = vec3(.74, .38, .37);
        c7 = vec3(.78, .63, .63);
        c8 = vec3(.34, .62, .69);
    } else if(pIdx == 9) {
        c1 = vec3(.03, .09, .13);
        c2 = vec3(.98, .88, .72);
        c3 = vec3(.97, .56, .48);
        c4 = vec3(.43, .32, .26);
        c5 = vec3(.04, .39, .5);
        c6 = vec3(.72, .68, .57);
        c7 = vec3(.96, .48, .16);
        c8 = vec3(.48, .77, .74);
    } else if(pIdx == 10) {
        c1 = vec3(.96, .66, .55);
        c2 = vec3(.41, .63, .52);
        c3 = vec3(.1, .13, .13);
        c4 = vec3(.15, .67, .61);
        c5 = vec3(.54, .46, .34);
        c6 = vec3(.74, .62, .47);
        c7 = vec3(.44, .9, .72);
        c8 = vec3(.31, .33, .26);
    } else if(pIdx == 11) {
        c1 = vec3(.1, .2, .8);
        c2 = vec3(.3, .5, .9);
        c3 = vec3(.6, .7, .95);
        c4 = vec3(.95, .95, 1.);
        c5 = vec3(.2, .3, .7);
        c6 = vec3(.4, .5, .8);
        c7 = vec3(.6, .7, .9);
        c8 = vec3(.1, .2, .4);
    } else if(pIdx == 12) {
        c1 = vec3(.05, .05, .15);
        c2 = vec3(.1, .1, .15);
        c3 = vec3(.4, .2, .65);
        c4 = vec3(.15, .15, .2);
        c5 = vec3(.05, .05, .05);
        c6 = vec3(.1, .2, .3);
        c7 = vec3(.7, .1, .15);
        c8 = vec3(.1, .1, .1);
    } else if(pIdx == 13) {
        c1 = vec3(1., .2, .2);
        c2 = vec3(0., 1., .6);
        c3 = vec3(1., 1., 0.);
        c4 = vec3(0., .5, 1.);
        c5 = vec3(1., .4, 1.);
        c6 = vec3(.8, .1, .1);
        c7 = vec3(.9, .8, .2);
        c8 = vec3(0., .8, .6);
    } else if(pIdx == 14) {
        c1 = vec3(1., 0., 0.);
        c2 = vec3(0., 0., 1.);
        c3 = vec3(1., 1., 0.);
        c4 = vec3(0., 1., 0.);
        c5 = vec3(.8, 0., .8);
        c6 = vec3(.5, .5, .5);
        c7 = vec3(.2, .2, .2);
        c8 = vec3(1., .6, 0.);
    } else if(pIdx == 15) {
        c1 = vec3(.2, .6, 1.);
        c2 = vec3(1., .8, .1);
        c3 = vec3(1., .2, .5);
        c4 = vec3(1., .4, 0.);
        c5 = vec3(.1, .9, .2);
        c6 = vec3(1., .9, .5);
        c7 = vec3(0., .2, .9);
        c8 = vec3(.9, .1, .3);
    } else if(pIdx == 16) {
        c1 = vec3(1., .6, 0.);
        c2 = vec3(0., .9, .9);
        c3 = vec3(1., .2, .6);
        c4 = vec3(.8, .1, .5);
        c5 = vec3(1., 1., .2);
        c6 = vec3(.1, .7, .1);
        c7 = vec3(.4, 0., .8);
        c8 = vec3(.5, .8, 1.);
    } else if(pIdx == 17) {
        c1 = vec3(1., .85, 0.);
        c2 = vec3(.9, 0., .2);
        c3 = vec3(0., .7, 1.);
        c4 = vec3(.9, .2, .9);
        c5 = vec3(0., 1., .4);
        c6 = vec3(1., .4, 0.);
        c7 = vec3(.1, .1, .1);
        c8 = vec3(1., .6, 1.);
    } else if(pIdx == 18) {
        c1 = vec3(0., 1., 1.);
        c2 = vec3(1., 0., 1.);
        c3 = vec3(1., .2, .2);
        c4 = vec3(0., .9, .3);
        c5 = vec3(0., 0., 1.);
        c6 = vec3(1., .85, .2);
        c7 = vec3(1., .5, 0.);
        c8 = vec3(.5, 0., .8);
    } else if(pIdx == 19) {
        c1 = vec3(1., 0., 0.);
        c2 = vec3(0., 0., .8);
        c3 = vec3(1., .8, 0.);
        c4 = vec3(0., 1., 0.);
        c5 = vec3(1., .4, 0.);
        c6 = vec3(0., .7, 1.);
        c7 = vec3(.9, .1, .6);
        c8 = vec3(1., 1., 1.);
    } else if(pIdx == 20) {
        c1 = vec3(.2, .2, 1.);
        c2 = vec3(.9, .1, .2);
        c3 = vec3(1., 1., 0.);
        c4 = vec3(0., 1., .5);
        c5 = vec3(1., .5, 0.);
        c6 = vec3(.6, .2, .8);
        c7 = vec3(.8, .9, 1.);
        c8 = vec3(.9, .8, .1);
    } else if(pIdx == 21) {
        c1 = vec3(1., .4, 0.);
        c2 = vec3(0., .6, 1.);
        c3 = vec3(1., .2, .6);
        c4 = vec3(0., 1., .5);
        c5 = vec3(1., 1., 0.);
        c6 = vec3(.5, 0., .8);
        c7 = vec3(1., .6, .4);
        c8 = vec3(0., .9, 1.);
    } else if(pIdx == 22) {
        c1 = vec3(1., .1, .3);
        c2 = vec3(0., .9, .1);
        c3 = vec3(1., .8, 0.);
        c4 = vec3(.2, .6, 1.);
        c5 = vec3(1., .3, 1.);
        c6 = vec3(0., 1., 1.);
        c7 = vec3(1., .4, 0.);
        c8 = vec3(.5, .5, .5);
    } else if(pIdx == 23) {
        c1 = vec3(.25, .7, .95);
        c2 = vec3(.6, .8, .25);
        c3 = vec3(.9, .9, .1);
        c4 = vec3(.95, .55, .2);
        c5 = vec3(.8, .4, .15);
        c6 = vec3(.1, .5, .85);
        c7 = vec3(.7, .9, .4);
        c8 = vec3(.9, .8, .6);
    } else if(pIdx == 24) {
        c1 = vec3(.1, .65, .3);
        c2 = vec3(.9, .5, .1);
        c3 = vec3(.8, .2, .1);
        c4 = vec3(.25, .5, .9);
        c5 = vec3(.95, .9, .2);
        c6 = vec3(.3, .8, .4);
        c7 = vec3(.7, .5, .1);
        c8 = vec3(.9, .75, .5);
    } else if(pIdx == 25) {
        c1 = vec3(.2, .6, .9);
        c2 = vec3(.8, .85, .1);
        c3 = vec3(.9, .45, .15);
        c4 = vec3(.5, .8, .2);
        c5 = vec3(.95, .9, .4);
        c6 = vec3(.7, .2, .15);
        c7 = vec3(.85, .7, .2);
        c8 = vec3(.4, .7, .8);
    } else if(pIdx == 26) {
        c1 = vec3(.9, .85, .2);
        c2 = vec3(.15, .6, .25);
        c3 = vec3(.95, .6, .1);
        c4 = vec3(.3, .6, .9);
        c5 = vec3(.8, .2, .2);
        c6 = vec3(.7, .9, .3);
        c7 = vec3(.9, .4, .15);
        c8 = vec3(.6, .8, .7);
    } else if(pIdx == 27) {
        c1 = vec3(.9, .2, .2);
        c2 = vec3(.1, .6, .4);
        c3 = vec3(.9, .9, .2);
        c4 = vec3(.2, .45, .9);
        c5 = vec3(.8, .4, .15);
        c6 = vec3(.7, .9, .2);
        c7 = vec3(.5, .7, .3);
        c8 = vec3(.85, .5, .1);
    } else if(pIdx == 28) {
        c1 = vec3(.3, .6, .85);
        c2 = vec3(.1, .5, .7);
        c3 = vec3(.85, .65, .15);
        c4 = vec3(.9, .2, .25);
        c5 = vec3(.6, .85, .2);
        c6 = vec3(.15, .3, .6);
        c7 = vec3(.85, .85, .4);
        c8 = vec3(.8, .4, .2);
    } else if(pIdx == 29) {
        c1 = vec3(.9, .85, .25);
        c2 = vec3(.7, .2, .15);
        c3 = vec3(.3, .7, .3);
        c4 = vec3(.2, .5, .85);
        c5 = vec3(.85, .45, .1);
        c6 = vec3(.7, .85, .3);
        c7 = vec3(.15, .4, .7);
        c8 = vec3(.8, .6, .2);
    } else if(pIdx == 30) {
        c1 = vec3(.85, .25, .25);
        c2 = vec3(.1, .55, .85);
        c3 = vec3(.95, .8, .3);
        c4 = vec3(.75, .2, .1);
        c5 = vec3(.3, .7, .2);
        c6 = vec3(.9, .9, .2);
        c7 = vec3(.25, .5, .8);
        c8 = vec3(.85, .55, .1);
    } else if(pIdx == 31) {
        c1 = vec3(.85, .85, .1);
        c2 = vec3(.25, .6, .2);
        c3 = vec3(.95, .6, .15);
        c4 = vec3(.3, .6, .8);
        c5 = vec3(.85, .2, .15);
        c6 = vec3(.75, .8, .4);
        c7 = vec3(.5, .3, .1);
        c8 = vec3(.9, .85, .4);
    } else if(pIdx == 32) {
        c1 = vec3(.2, .55, .8);
        c2 = vec3(.6, .8, .25);
        c3 = vec3(.95, .85, .15);
        c4 = vec3(.8, .4, .2);
        c5 = vec3(.7, .25, .1);
        c6 = vec3(.15, .5, .75);
        c7 = vec3(.9, .6, .2);
        c8 = vec3(.85, .85, .5);
    } else if(pIdx == 33) {
        c1 = vec3(.05, .05, .15);
        c2 = vec3(.1, .1, .15);
        c3 = vec3(.4, .2, .65);
        c4 = vec3(.15, .15, .2);
        c5 = vec3(.05, .05, .05);
        c6 = vec3(.1, .2, .3);
        c7 = vec3(.7, .1, .15);
        c8 = vec3(.1, .1, .1);
    }
    
    t = clamp(t, 0., 1.) * 7.;
    vec3 result;
    if(t < 1.) result = mix(c1, c2, smoothstep(0., 1., t));
    else if(t < 2.) result = mix(c2, c3, smoothstep(1., 2., t - 1.));
    else if(t < 3.) result = mix(c3, c4, smoothstep(2., 3., t - 2.));
    else if(t < 4.) result = mix(c4, c5, smoothstep(3., 4., t - 3.));
    else if(t < 5.) result = mix(c5, c6, smoothstep(4., 5., t - 4.));
    else if(t < 6.) result = mix(c6, c7, smoothstep(5., 6., t - 5.));
    else result = mix(c7, c8, smoothstep(6., 7., t - 6.));
    
    return result;
}

void main() {
    vec2 e = (vTexCoord * u_resolution - u_resolution * 0.5) * u_scaleFactor + u_translation;
    
    // NEW: Apply domain-warp to create layered spatial distortion
    e = domainWarp(e, u_time, u_domainWarpIntensity);
    
    vec2 u = floor(e / u_cellSize);
    
    float f = fbmSimplexNoise(e + noise(u * 0.1, u_noiseSeed), 8);
    float d = fbmSimplexNoise(u * 0.1, 5);
    f = f * 0.8 + d * 0.2;
    
    vec2 v = u * u_cellSize + u_cellSize * 0.5;
    vec2 i = vec2(f) * u_cellSize * 30.3;
    v = e - v - i;

    f = smoothstep(u_cellSize * 0.4, u_cellSize * 0.1, length(v));
    //original
    //    f = smoothstep(u_cellSize * 0.4, u_cellSize * 0.1, length(v));

    i = applyCARDEffect(v, u_time * 0., u, u_noiseSeed);
    float m = u_cellSize * mix(0.5, 2., d);
    
    // MAGNETIC FIELD RD - Creates radial, explosion-like patterns
    vec2 center = u_resolution * 0.5;
    vec2 toCenter = center - v;
    float distance = length(toCenter);
    vec2 magneticForce = normalize(toCenter) * (1000.0 / (distance + 50.0));
    v += magneticForce * 0.5;
    v += vec2(cos(u_time * 0.2), sin(u_time * 0.2)) * 15.0;
    
    // Keep some of the original flow for additional organic movement
    float s = ridgedMF(v * 0.05 + 0.1, 0.) * 2. * M_PI;
    float n = u_noiseScale * (3. + 0.1 * sin(u_time * 0.1) + 0.3 * u_amplitude);
    v = (v + u * m) * (n * 0.4);
    
    s = fbmSimplexNoise(v * 1.5 + vec2(u_noiseSeed), 12) * 2. * M_PI;
    v += vec2(cos(s), sin(s)) * 5.0 * 3.0;
    
    u = applyCARDEffect(v, u_time, u, u_noiseSeed);
    v += u * u_reactionInfluence;
    u = u_resolution * 0.5;
    
    s = fbmSimplexNoise(e * 0.02 + i * 0.1, 14);
    n = fbmSimplexNoise(v, 8);
    
    int r = int(float(int(mod((n * 0.8 + d * 0.2) * float(u_maxDepth), float(u_maxDepth))) + 1) * 
                clamp(1. - length(e - u) * (2. + 6.5 * s) * 4e-6, 0., 1.));
    
    vec4 a = vec4(0);
    int eIdx = int(u_paletteIndex1);
    int nIdx = int(u_paletteIndex2);
    const float INV_20 = 1.0 / 20.0;
    
    float vTween = 0.5 + 0.5 * sin(u_time * u_flowSpeed);
    vTween = vTween * vTween * (3. - 2. * vTween);
    
    for(int li = 0; li < 20; li++) {
        if(li >= r) break;
        
        float layerNoise = noise(v * float(li + 1), u_noiseSeed);
        if(layerNoise > u_layerNoiseThreshold) {
            // Layered depth system for stronger depth perception
            float baseDepth = 1.0 - (float(li) * 0.1); // Linear falloff - each layer 10% smaller
            float detailDepth = 1.0 - (float(li) * 0.05); // Subtle detail variation - each layer 5% smaller
            float depthScale = baseDepth * detailDepth; // Combine both depth systems
            float scaleStep = m * depthScale;
            vec2 cellMod = mod(e, scaleStep);
            
            if(random(cellMod) > 0.5) {
                float tF = float(li) * INV_20;
                float tt = smoothstep(0., 1., tF);
                
                vec3 palA = getColorFromPalette(eIdx, tt);
                vec3 color;
                if(tF < u_paletteThreshold) {
                    color = palA;
                } else {
                    vec3 palB = getColorFromPalette(nIdx, tt);
                    color = mix(palA, palB, vTween);
                }
                
                float randVal = random(vec2(float(li), u_noiseSeed));
                vec3 randomCol = getColorFromPalette(nIdx, randVal);
                color = mix(color, randomCol, 0.3 * tF);
                
                a.xyz *= 3.;
                a += vec4(color, 1.) * (1. - layerNoise);
                a.xyz *= 1. - f;
            }
        }
        
        if(a.w > 0.999) break;
    }
    
    if(a.w == 0.) a = vec4(0, 0, 0, 1);
    
    // NEW: Apply linework overlay to final color
    vec3 finalColor = extractLinework(a.xyz, vTexCoord, a.w);
    
    gl_FragColor = vec4(finalColor, a.w);
}