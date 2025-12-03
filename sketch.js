import p5 from 'p5';

// Import shader files as raw text for Vite bundling
import shaderVert from './shader.vert?raw';
import shaderFrag from './shader.frag?raw';

// Create p5 instance with all sketch code
const sketch = (p) => {
  let theShader;
  let cellSize = 3;
  let noiseScale;
  let maxDepth;
  let noiseSeed;
  let flowSpeed = 0.05;
  let paletteIndex1;
  let paletteIndex2;
  let randomScaleSeed;
  let rotationAngle;
  let noiseOffsetX;
  let noiseOffsetY;
  let scaleFactor = 30;
  let translateX = 0;
  let translateY = 0;
  let previousMouseX;
  let previousMouseY;
  let amplitudeValues = [0.1];
  let reactionInfluence = 2;
  let caInfluence = 0.5;
  let layerNoiseThreshold = 0.65;
  let depthFalloffRate = 0.85;
  let rdParameters = [
      { 'a': 0.5, 'b': 1 },
      { 'a': 0.1, 'b': 0.1 },
      { 'a': 0.8, 'b': 0.2 },
      { 'a': 1, 'b': 1 },
      { 'a': 0.3, 'b': 0.7 },
      { 'a': 1.2, 'b': 1.2 },
      { 'a': 0.05, 'b': 0.9 },
      { 'a': 0.7, 'b': 1.8 },
      { 'a': 0.3, 'b': 0.3 },
      { 'a': 1, 'b': 4 }
  ];
  let paletteThreshold = 0.25;
  let freq;
  let randomSeed;
  let isAnimating = false;
  let frameCounter = 0;
  const maxFrames = 100;
  let hasInitialAnimationRun = false;
  let elapsedTime = 0;
  let domainWarpIntensity;

  // Linework Overlay System
  let lineworkEnabled = true;
  let lineworkIntensity = 0.3;
  let lineworkThreshold = 0.4;
  let lineworkColor = [1.0, 1.0, 1.0];
  let lineworkWidth = 1.0;
  let lineworkBlendMode = 'multiply';
  let lineworkType = 'ridges';

  // Theme Preset System
  let currentTheme;
  let themePresets = {
      'filament': {
          name: 'Filament',
          description: 'Thin, thread-like structures',
          constraints: {
              cellSize: [3, 5],
              maxDepth: [800, 1200],
              flowSpeed: [0.03, 0.07],
              noiseScale: [0.00002, 0.00006],
              frequency: [0.005, 0.01]
          }
      },
      'bloom': {
          name: 'Bloom', 
          description: 'Soft, expanding cloud-like forms',
          constraints: {
              cellSize: [8, 12],
              maxDepth: [600, 900],
              flowSpeed: [0.08, 0.15],
              noiseScale: [0.00008, 0.00015],
              frequency: [0.001, 0.005]
          }
      },
      'cellular': {
          name: 'Cellular',
          description: 'Honeycomb-like cellular patterns',
          constraints: {
              cellSize: [6, 9],
              maxDepth: [700, 1000],
              flowSpeed: [0.05, 0.1],
              noiseScale: [0.00005, 0.0001],
              frequency: [0.003, 0.008]
          }
      },
      'vortex': {
          name: 'Vortex',
          description: 'Swirling, spiral-like formations',
          constraints: {
              cellSize: [4, 7],
              maxDepth: [900, 1300],
              flowSpeed: [0.12, 0.18],
              noiseScale: [0.00003, 0.00008],
              frequency: [0.008, 0.015]
          }
      },
      'crystal': {
          name: 'Crystal',
          description: 'Sharp, geometric crystalline structures',
          constraints: {
              cellSize: [2, 4],
              maxDepth: [1000, 1500],
              flowSpeed: [0.02, 0.05],
              noiseScale: [0.00001, 0.00004],
              frequency: [0.01, 0.02]
          }
      },
      'organic': {
          name: 'Organic',
          description: 'Natural, flowing biological forms',
          constraints: {
              cellSize: [10, 15],
              maxDepth: [500, 800],
              flowSpeed: [0.06, 0.12],
              noiseScale: [0.0001, 0.0002],
              frequency: [0.002, 0.006]
          }
      },
      'fractal': {
          name: 'Fractal',
          description: 'Self-similar patterns at multiple scales',
          constraints: {
              cellSize: [3, 6],
              maxDepth: [1200, 1800],
              flowSpeed: [0.04, 0.08],
              noiseScale: [0.00002, 0.00005],
              frequency: [0.006, 0.012]
          }
      },
      'liquid': {
          name: 'Liquid',
          description: 'Fluid, droplet-like formations',
          constraints: {
              cellSize: [8, 12],
              maxDepth: [600, 900],
              flowSpeed: [0.15, 0.25],
              noiseScale: [0.00006, 0.00012],
              frequency: [0.003, 0.007]
          }
      },
      'neural': {
          name: 'Neural',
          description: 'Brain-like network structures',
          constraints: {
              cellSize: [2, 5],
              maxDepth: [1000, 1400],
              flowSpeed: [0.03, 0.07],
              noiseScale: [0.00001, 0.00003],
              frequency: [0.008, 0.016]
          }
      },
      'cosmic': {
          name: 'Cosmic',
          description: 'Space-like nebula formations',
          constraints: {
              cellSize: [8, 14],
              maxDepth: [500, 800],
              flowSpeed: [0.06, 0.12],
              noiseScale: [0.00008, 0.00015],
              frequency: [0.002, 0.006]
          }
      },
      'magnetic': {
          name: 'Magnetic',
          description: 'Field-like, force-directed patterns',
          constraints: {
              cellSize: [5, 8],
              maxDepth: [800, 1100],
              flowSpeed: [0.09, 0.16],
              noiseScale: [0.00004, 0.00009],
              frequency: [0.004, 0.009]
          }
      },
      'wave': {
          name: 'Wave',
          description: 'Ocean wave-like undulating forms',
          constraints: {
              cellSize: [9, 13],
              maxDepth: [600, 900],
              flowSpeed: [0.11, 0.19],
              noiseScale: [0.00007, 0.00013],
              frequency: [0.003, 0.008]
          }
      },
      'particle': {
          name: 'Particle',
          description: 'Dust-like, scattered formations',
          constraints: {
              cellSize: [1, 3],
              maxDepth: [1400, 2000],
              flowSpeed: [0.02, 0.05],
              noiseScale: [0.000005, 0.00002],
              frequency: [0.015, 0.025]
          }
      }
  };

  // Function to apply theme parameters
  function applyThemeParameters(themeName) {
      if (themeName === 'random' || !themePresets[themeName]) {
          return;
      }
      
      const theme = themePresets[themeName];
      console.log('Applying theme parameters for: ' + theme.name);
      
      if (theme.constraints.cellSize) {
          cellSize = p.random(theme.constraints.cellSize[0], theme.constraints.cellSize[1]);
          theShader.setUniform('u_cellSize', cellSize);
          console.log('Cell size set to: ' + cellSize);
      }
      
      if (theme.constraints.maxDepth) {
          maxDepth = p.random(theme.constraints.maxDepth[0], theme.constraints.maxDepth[1]);
          theShader.setUniform('u_maxDepth', maxDepth);
          console.log('Max depth set to: ' + maxDepth);
      }
      
      if (theme.constraints.flowSpeed) {
          flowSpeed = p.random(theme.constraints.flowSpeed[0], theme.constraints.flowSpeed[1]);
          theShader.setUniform('u_flowSpeed', flowSpeed);
          console.log('Flow speed set to: ' + flowSpeed);
      }
      
      if (theme.constraints.noiseScale) {
          noiseScale = p.random(theme.constraints.noiseScale[0], theme.constraints.noiseScale[1]);
          theShader.setUniform('u_noiseScale', noiseScale);
          console.log('Noise scale set to: ' + noiseScale);
      }
      
      if (theme.constraints.frequency) {
          freq = p.random(theme.constraints.frequency[0], theme.constraints.frequency[1]);
          theShader.setUniform('u_frequency', freq);
          console.log('Frequency set to: ' + freq);
      }
  }

  p.preload = function() {
      theShader = p.createShader(shaderVert, shaderFrag);
      console.log('Shader loaded:', theShader ? 'SUCCESS' : 'FAILED');
  };

  p.setup = function() {
      const aspectRatio = 4/5;
      let canvasWidth = p.windowWidth;
      let canvasHeight = p.windowWidth / aspectRatio;
      
      if (canvasHeight > p.windowHeight) {
          canvasHeight = p.windowHeight;
          canvasWidth = p.windowHeight * aspectRatio;
      }
      
      p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
      randomSeed = Math.random();
      p.background(0);
      p.noStroke();
      p.pixelDensity(2);
      p.shader(theShader);
      
      noiseOffsetX = p.random(2000);
      noiseOffsetY = p.random(2000);
      
      let randomTranslateX = p.random(-2000, 2000);
      let randomTranslateY = p.random(-2000, 2000);
      p.translate(randomTranslateX, randomTranslateY);
      
      noiseSeed = p.random(1000);
      let maxDepthOptions = [1500, 2000, 2500];
      maxDepth = p.random(maxDepthOptions);
      
      paletteIndex1 = p.int(p.random(34));
      paletteIndex2 = p.int(p.random(34));
      while (paletteIndex2 === paletteIndex1) {
          paletteIndex2 = p.int(p.random(34));
      }
      
      randomScaleSeed = p.random(1000);
      let rotationOptions = [0, 30, 60, 90];
      rotationAngle = rotationOptions[p.int(p.random(rotationOptions.length))];
      
      freq = p.random([0.01, 0.005, 0.001]);
      console.log('Frequency: ' + freq);
      
      let domainWarpOptions = [0.0, 1.0, 3.0, 6.0, 10.0];
      domainWarpIntensity = p.random(domainWarpOptions);
      console.log('Domain-Warp Intensity: ' + domainWarpIntensity);
      
      let themeKeys = Object.keys(themePresets);
      currentTheme = themeKeys[p.int(p.random(themeKeys.length))];
      console.log('Selected theme: ' + themePresets[currentTheme].name);
      console.log('Theme description: ' + themePresets[currentTheme].description);
      
      applyThemeParameters(currentTheme);
      
      noiseScale = p.random([0.00001, 0.00004, 0.0001]);
      console.log('NoiseScale: ' + noiseScale);
      
      let selectedAmplitude = amplitudeValues[p.int(p.random(amplitudeValues.length))];
      let selectedRdParams = rdParameters[p.int(p.random(rdParameters.length))];
      let rdParameterA = selectedRdParams['a'];
      let rdParameterB = selectedRdParams['b'];
      
      console.log('Selected rdParameterA: ' + rdParameterA + ', rdParameterB: ' + rdParameterB);
      
      theShader.setUniform('u_resolution', [p.width, p.height]);
      theShader.setUniform('u_cellSize', cellSize);
      theShader.setUniform('u_flowSpeed', flowSpeed);
      theShader.setUniform('u_paletteIndex1', paletteIndex1);
      theShader.setUniform('u_paletteIndex2', paletteIndex2);
      theShader.setUniform('u_noiseSeed', noiseSeed);
      theShader.setUniform('u_randomScaleSeed', randomScaleSeed);
      theShader.setUniform('u_rotationAngle', p.radians(rotationAngle));
      theShader.setUniform('u_noiseOffset', [noiseOffsetX, noiseOffsetY]);
      theShader.setUniform('u_amplitude', selectedAmplitude);
      theShader.setUniform('u_maxDepth', maxDepth);
      theShader.setUniform('u_paletteThreshold', paletteThreshold);
      theShader.setUniform('u_reactionInfluence', reactionInfluence);
      theShader.setUniform('u_caInfluence', caInfluence);
      theShader.setUniform('u_rdParameterA', rdParameterA);
      theShader.setUniform('u_rdParameterB', rdParameterB);
      theShader.setUniform('u_seed', randomSeed);
      theShader.setUniform('u_frequency', freq);
      theShader.setUniform('u_domainWarpIntensity', domainWarpIntensity);
      
      theShader.setUniform('u_layerNoiseThreshold', layerNoiseThreshold);
      theShader.setUniform('u_depthFalloffRate', depthFalloffRate);
      
      theShader.setUniform('u_lineworkEnabled', lineworkEnabled ? 1.0 : 0.0);
      theShader.setUniform('u_lineworkIntensity', lineworkIntensity);
      theShader.setUniform('u_lineworkThreshold', lineworkThreshold);
      theShader.setUniform('u_lineworkColor', lineworkColor);
      theShader.setUniform('u_lineworkWidth', lineworkWidth);
      theShader.setUniform('u_lineworkType', parseFloat(['edges', 'contours', 'ridges', 'valleys'].indexOf(lineworkType)));
      
      console.log('Linework uniforms set in setup:');
      console.log('  Enabled:', lineworkEnabled ? 1.0 : 0.0);
      console.log('  Intensity:', lineworkIntensity);
      console.log('  Threshold:', lineworkThreshold);
      console.log('  Color:', lineworkColor);
      console.log('  Width:', lineworkWidth);
      console.log('  Type:', lineworkType, '(index:', ['edges', 'contours', 'ridges', 'valleys'].indexOf(lineworkType) + ')');
      
      console.log('Shader uniforms set. Testing basic rendering...');
      
      const gl = p._renderer.GL;
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
  };

  p.draw = function() {
      if (!hasInitialAnimationRun) {
          frameCounter++;
          elapsedTime = p.millis() / 1000;
          if (frameCounter >= maxFrames) {
              hasInitialAnimationRun = true;
          }
      } else if (isAnimating) {
          elapsedTime = p.millis() / 1000;
      }
      
      if (p.keyIsDown(p.UP_ARROW)) {
          scaleFactor += 10.1;
      }
      if (p.keyIsDown(p.DOWN_ARROW)) {
          scaleFactor -= 10.1;
      }
      
      scaleFactor = Math.round(scaleFactor * 10) / 10;
      scaleFactor = p.constrain(scaleFactor, 2.0, 400);
      
      if (p.mouseIsPressed && p.mouseButton === p.LEFT) {
          if (previousMouseX !== undefined && previousMouseY !== undefined) {
              let deltaX = p.mouseX - previousMouseX;
              let deltaY = p.mouseY - previousMouseY;
              translateX -= deltaX * scaleFactor;
              translateY += deltaY * scaleFactor;
          }
          previousMouseX = p.mouseX;
          previousMouseY = p.mouseY;
      } else {
          previousMouseX = undefined;
          previousMouseY = undefined;
      }
      
      p.resetMatrix();
      p.translate(translateX, translateY);
      
      theShader.setUniform('u_scaleFactor', scaleFactor);
      theShader.setUniform('u_translation', [translateX, translateY]);
      theShader.setUniform('u_time', elapsedTime);
      theShader.setUniform('u_noiseScale', noiseScale);
      theShader.setUniform('u_domainWarpIntensity', domainWarpIntensity);
      theShader.setUniform('u_caInfluence', caInfluence);
      
      if (p.frameCount % 60 === 0) {
          let themeInfo = themePresets[currentTheme].name;
          let themeDetails = ' | Cell:' + cellSize + ' | Depth:' + maxDepth + ' | Flow:' + flowSpeed.toFixed(3) + ' | Noise:' + noiseScale.toFixed(6) + ' | Freq:' + freq.toFixed(4);
          let depthInfo = ' | LayerThresh:' + layerNoiseThreshold.toFixed(2) + ' | Falloff:' + depthFalloffRate.toFixed(2);
          let lineworkInfo = lineworkEnabled ? ' | Linework:ON(' + lineworkIntensity.toFixed(2) + ')' : '';
          console.log('Frame:', p.frameCount, 'Theme:', themeInfo, 'Domain-Warp:', domainWarpIntensity, 'Scale:', scaleFactor + themeDetails + depthInfo + lineworkInfo);
      }
      
      if (p.frameCount === 1) {
          console.log('Linework: Enabled by default with ridge lines');
      }
      
      p.beginShape();
      p.vertex(-1, -1, 0, 0, 0);
      p.vertex(1, -1, 0, 1, 0);
      p.vertex(1, 1, 0, 1, 1);
      p.vertex(-1, 1, 0, 0, 1);
      p.endShape(p.CLOSE);
  };

  p.keyPressed = function() {
      if (p.key === '1') {
          paletteThreshold = p.max(0, paletteThreshold - 0.1);
      } else if (p.key === '2') {
          paletteThreshold = p.min(1, paletteThreshold + 0.1);
      } else if (p.key === 'S' || p.key === 's') {
          if (hasInitialAnimationRun) {
              isAnimating = !isAnimating;
          }
      } else if (p.key === 'R' || p.key === 'r') {
          translateX = 0;
          translateY = 0;
          p.redraw();
      }
      
      theShader.setUniform('u_paletteThreshold', paletteThreshold);
  };

  p.windowResized = function() {
      const aspectRatio = 4/5;
      let newWidth = p.windowWidth;
      let newHeight = p.windowWidth / aspectRatio;
      
      if (newHeight > p.windowHeight) {
          newHeight = p.windowHeight;
          newWidth = p.windowHeight * aspectRatio;
      }
      
      p.resizeCanvas(newWidth, newHeight);
      theShader.setUniform('u_resolution', [newWidth, newHeight]);
  };
};

new p5(sketch);
