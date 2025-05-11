import * as THREE from 'three';
import mercuryTexture from './assets/mercury.jpg';
import venusTexture from './assets/venus.jpg';
import earthTexture from './assets/Earth.jpg';
import marsTexture from "./assets/mars.jpg";
import sunTexture from "./assets/sun.jpg";
import moonTexture from "./assets/moon.jpg"
import ioTexture from "./assets/io.jpg";
import europaTexture from "./assets/europia.jpg";
import jupiterTexture from './assets/jupiter.jpg';
import saturnTexture from './assets/saturn.jpg';
import saturnRingTexture from './assets/saturnRing.png';
import uranusTexture from './assets/uranus.jpg';
import neptuneTexture from './assets/neptune.jpg';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredPlanet = null;
let selectedPlanet = null;

const renderer = new THREE.WebGLRenderer({ 
  canvas: document.getElementById('solarCanvas'),
  antialias: true 
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 100, 0);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = 0;
controls.screenSpacePanning = true;

controls.addEventListener('change', () => {
  if (controls.getPolarAngle() > Math.PI * 0.9) {
    controls.reset(); 
  }
});

renderer.domElement.addEventListener('dblclick', () => {
  camera.position.set(0, 20, 50);
  camera.lookAt(0, 0, 0);
  controls.reset();
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('click', onPlanetClick);

const directionalLight1 = new THREE.DirectionalLight(0xfff4e6, 3);
directionalLight1.position.set(2, 5, 50);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xfff4e6, 3);
directionalLight2.position.set(-2, -5, -50);
scene.add(directionalLight2);

const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
topLight.position.set(0, 50, 0);
scene.add(topLight);

const bottomLight = new THREE.DirectionalLight(0x333333, 0.8);
bottomLight.position.set(0, -50, 0);
scene.add(bottomLight);

const ambientLight = new THREE.AmbientLight(0x222222, 0.5);
scene.add(ambientLight);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;

const loader = new THREE.TextureLoader();

const sunGeo = new THREE.SphereGeometry(5, 64, 64);
const sunMat = new THREE.MeshStandardMaterial({ 
  map: loader.load(sunTexture),
  emissive: 0xff6600,
  emissiveIntensity: 0.6,
  roughness: 0.9,
  metalness: 0.1
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanet({ 
  name,
  size, 
  texturePath, 
  distance, 
  orbitSpeed, 
  info,
  moons = [], 
  rings = null,
  hasAtmosphere = false,
  atmosphereColor = 0x00aaff,
  atmosphereSize = 1.1,
  atmosphereIntensity=1.5,
  storms=true,
}) {
  const texture = loader.load(texturePath);
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ 
    map: texture,
    roughness: 0.7,
    metalness: 0.1
  });
  const planet = new THREE.Mesh(geometry, material);
  planet.name = name;

  const orbit = new THREE.Object3D();
  orbit.name = `${name}_orbit`;
  orbit.userData = { isPlanet: true };
  orbit.add(planet);
  planet.position.x = distance;
  scene.add(orbit);

  if (hasAtmosphere) {
    const atmosGeometry = new THREE.SphereGeometry(
      size * atmosphereSize, 
      64,
      64
    );
    
    const atmosMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(atmosphereColor) },
        viewVector: { value: new THREE.Vector3() },
        time: { value: 0 },
        intensity: { value: atmosphereIntensity || 1 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float time;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        void main() {
          float rim = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          
          float storms = 0.0;
          ${storms ? `
            storms = smoothstep(0.4, 0.6, 
              random(vec2(vUv.y * 10.0, time * 0.1))) * 0.3;
          ` : ''}
          
          vec3 color = glowColor * (rim * intensity + storms);
          gl_FragColor = vec4(color, rim * 0.8);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    planet.add(atmosphere);
  
    if (storms) {
      const animateStorms = () => {
        atmosMaterial.uniforms.time.value += 0.01;
        requestAnimationFrame(animateStorms);
      };
      animateStorms();
    }
  
    const updateAtmosphere = () => {
      atmosMaterial.uniforms.viewVector.value = 
        new THREE.Vector3().subVectors(
          camera.position, 
          planet.getWorldPosition(new THREE.Vector3())
        ).normalize();
    };
    updateAtmosphere();
    window.addEventListener('mousemove', updateAtmosphere);
  }

  moons.forEach(moon => {
    const moonTexture = moon.texturePath ? loader.load(moon.texturePath) : texture;
    const moonGeometry = new THREE.SphereGeometry(moon.size, 16, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    
    const moonOrbit = new THREE.Object3D();
    moonOrbit.add(moonMesh);
    moonMesh.position.x = moon.distance;
    planet.add(moonOrbit);
    
    moonOrbit.userData = { speed: moon.orbitSpeed };
  });

  if (rings) {
    const ringTexture = loader.load(rings.texturePath);
    const ringGeometry = new THREE.RingGeometry(
      rings.innerRadius, 
      rings.outerRadius, 
      64
    );
    const ringMaterial = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2.5;
    planet.add(ringMesh);
  }
  const label = createSpaceLabel(name, size);
  planet.add(label);
  return { 
    name,
    size,
    info,
    orbit, 
    planet,
    label,
    speed: orbitSpeed,
    moons: moons.map(m => m.name) 
  };
}
const sunLabel = createSpaceLabel("APEX SUN", 5);
sunLabel.scale.set(20, 6, 4);
sunLabel.position.set(0, 8, 0);
sun.add(sunLabel);
const planets = [
  createPlanet({
      name: "Mercury",
      size: 0.38 * 0.7,
      texturePath: mercuryTexture,
      distance: 12,
      orbitSpeed: 0.04,
      tilt: 0.1,
      info: {
        diameter: "4,880 km",
        mass: "3.30 × 10²³ kg (0.055 Earths)",
        distanceFromSun: "57.9 million km",
        orbitalPeriod: "88 Earth days",
        surfaceTemp: "-173°C to 427°C",
        moons: 0,
        funFact: "Mercury is the smallest planet and has the most craters in our solar system. A year on Mercury is just 88 days long!",
        composition: "Rocky planet with a large iron core"
      }
  }),
  
  createPlanet({
      name: "Venus",
      size: 0.95 * 0.7,
      texturePath: venusTexture,
      distance: 18,
      orbitSpeed: 0.015,
      tilt: -0.08,
      info: {
        diameter: "12,104 km",
        mass: "4.87 × 10²⁴ kg (0.815 Earths)",
        distanceFromSun: "108.2 million km",
        orbitalPeriod: "225 Earth days",
        surfaceTemp: "462°C (hottest planet)",
        moons: 0,
        funFact: "Venus rotates backwards compared to other planets and has a day longer than its year!",
        atmosphere: "96.5% CO₂, 3.5% N₂ with thick clouds of sulfuric acid"
      }
  }),
  createPlanet({
    name: "Earth",
    size: 1.0 * 0.7,
    texturePath: earthTexture,
    distance: 25,
    orbitSpeed: 0.01,
    tilt: 0.23,
    hasAtmosphere: true,
    atmosphereColor: 0x00aaff,
    atmosphereSize: 1.1,
    moons: [
      {
        name: "Moon",
        size: 0.27 * 0.3,
        distance: 1.5,
        texturePath: moonTexture,
        orbitSpeed: 0.01
      }
    ],
    info: {
      diameter: "12,742 km",
      mass: "5.97 × 10²⁴ kg",
      distanceFromSun: "149.6 million km (1 AU)",
      orbitalPeriod: "365.25 days",
      surfaceTemp: "-88°C to 58°C",
      moons: 1,
      funFact: "Earth is the only known planet with liquid water on its surface and life as we know it.",
      composition: "Nitrogen-oxygen atmosphere, 71% water surface"
    }
  }),
  createPlanet({
      name: "Mars",
      size: 0.53 * 0.7,
      texturePath: marsTexture,
      distance: 32,
      orbitSpeed: 0.008,
      tilt: 0.17,
      moons: [
          {
              name: "Phobos",
              size: 0.01 * 0.5,
              distance: 0.8,
              orbitSpeed: 0.03
          },
          {
              name: "Deimos",
              size: 0.008 * 0.5,
              distance: 1.0,
              orbitSpeed: 0.02
          }
      ],
      info: {
        diameter: "6,779 km",
        mass: "6.39 × 10²³ kg (0.107 Earths)",
        distanceFromSun: "227.9 million km",
        orbitalPeriod: "687 Earth days",
        surfaceTemp: "-153°C to 20°C",
        moons: 2,
        funFact: "Mars has the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the solar system!",
        atmosphere: "95% CO₂, 3% N₂, 1.6% Ar"
      }
  }),
  createPlanet({
    name: "Jupiter",
    size: 11.2 * 0.4,
    texturePath: jupiterTexture,
    distance: 45,
    orbitSpeed: 0.002,
    tilt: 0.05,
    hasAtmosphere: true,
    atmosphereColor: 0xffcc99,
    atmosphereSize: 1.15,
    atmosphereIntensity: 1.5,
    storms: true,
    moons: [
      {
        name: "Io",
        size: 1.8 * 0.3,
        texturePath: ioTexture,
        distance: 5.5,
        orbitSpeed: 0.005
      },
      {
        name: "Europa",
        size: 1.3 * 0.3,
        texturePath: europaTexture,
        distance: 7.5,
        orbitSpeed: 0.004
      }
    ],
    info: {
      diameter: "139,820 km",
      mass: "1.90 × 10²⁷ kg (318 Earths)",
      distanceFromSun: "778.3 million km",
      orbitalPeriod: "4,333 Earth days (12 years)",
      surfaceTemp: "-108°C (cloud tops)",
      moons: 79,
      funFact: "Jupiter is so massive that it has 2.5 times the mass of all other planets combined!",
      features: "Great Red Spot (giant storm), strong magnetic field"
    }
  }),
  createPlanet({
      name: "Saturn",
      size: 9.45 * 0.4,
      texturePath: saturnTexture,
      distance: 60,
      orbitSpeed: 0.0009,
      tilt: 0.47,
      rings: {
          innerRadius: 8,
          outerRadius: 12,
          texturePath: saturnRingTexture
      },
      info: {
        diameter: "116,460 km",
        mass: "5.68 × 10²⁶ kg (95 Earths)",
        distanceFromSun: "1.4 billion km",
        orbitalPeriod: "10,756 Earth days (29.5 years)",
        surfaceTemp: "-139°C",
        moons: 82,
        funFact: "Saturn's rings are made of ice and rock particles, some as small as dust and others as large as mountains!",
        ringSystem: "Extends up to 282,000 km from planet"
      }
  }),
  createPlanet({
      name: "Uranus",
      size: 4.0 * 0.5,
      texturePath: uranusTexture,
      distance: 75,
      orbitSpeed: 0.0004,
      tilt: 1.02,
      info: {
        diameter: "50,724 km",
        mass: "8.68 × 10²⁵ kg (14.5 Earths)",
        distanceFromSun: "2.9 billion km",
        orbitalPeriod: "30,687 Earth days (84 years)",
        surfaceTemp: "-197°C",
        moons: 27,
        funFact: "Uranus rotates on its side (98° tilt) making its seasons extreme - each pole gets 42 years of continuous sunlight!",
        composition: "Ice giant with hydrogen, helium, and methane atmosphere"
      }
  }),
  createPlanet({
      name: "Neptune",
      size: 3.88 * 0.5,
      texturePath: neptuneTexture,
      distance: 85,
      orbitSpeed: 0.0001,
      tilt: 0.72,
      info: {
        diameter: "49,244 km",
        mass: "1.02 × 10²⁶ kg (17 Earths)",
        distanceFromSun: "4.5 billion km",
        orbitalPeriod: "60,190 Earth days (165 years)",
        surfaceTemp: "-201°C",
        moons: 14,
        funFact: "Neptune has the strongest winds in the solar system, reaching 2,100 km/h (1,300 mph)!",
        features: "Great Dark Spot (storm system), faint ring system"
      }
  })
];

// Add these variables at the top with your other declarations
let gravityFields = null;
let showGravity = false;
// let gravityAnimSpeed = 0.5;

// Modified showGravityFields function with animation capability
function showGravityFields() {
  if (gravityFields) scene.remove(gravityFields);
  
  const fieldLines = new THREE.Group();
  
  planets.forEach(planet => {
    if (planet.name === "Sun") return;
    
    const lines = 8;
    for (let i = 0; i < lines; i++) {
      const angle = (i / lines) * Math.PI * 2;
      const curve = new THREE.EllipseCurve(
        0, 0, 
        planet.size * 2, 
        planet.size * 3,
        0, Math.PI * 2,
        false,
        angle
      );
      
      const points = curve.getPoints(30);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // More interesting material with animation potential
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(`hsl(${Math.random() * 60 + 180}, 80%, 60%)`),
        transparent: true,
        opacity: 0.4,
        linewidth: 2
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.position.copy(planet.planet.position);
      line.userData = {
        isFieldLine: true,
        planet: planet.name,
        speed: Math.random() * 0.002 + 0.001,
        offset: Math.random() * Math.PI * 2
      };
      fieldLines.add(line);
    }
  });
  
  scene.add(fieldLines);
  gravityFields = fieldLines;
  return fieldLines;
}


const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.6,
  transparent: true
});
// const starVertices = [
//   -0.5, -0.5, -0.5,
//   0.5, -0.5, -0.5,
//   -0.5, 0.5, -0.5,
//   0.5, 0.5, -0.5,
//   -0.5, -0.5, 0.5,
//   0.5, -0.5, 0.5,
// ];
const starVertices = [];

for (let i = 0; i < 40000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starsField = new THREE.Points(starGeometry, starMaterial);
scene.add(starsField);

function checkCollisions() {
  for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
          const dist = planets[i].planet.position.distanceTo(planets[j].planet.position);
          const minDist = (planets[i].size + planets[j].size) * 1.5;
          
          if (dist < minDist) {
              const direction = new THREE.Vector3()
                  .subVectors(planets[i].planet.position, planets[j].planet.position)
                  .normalize();
              
              planets[i].planet.position.addScaledVector(direction, 0.1);
              planets[j].planet.position.addScaledVector(direction, -0.1);
          }
      }
  }
}

function animateCameraTo(targetPosition, targetLookAt) {
  const startPosition = camera.position.clone();
  const startLookAt = new THREE.Vector3();
  camera.getWorldDirection(startLookAt);
  
  const duration = 1000;
  const startTime = Date.now();
  
  function updateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
    
    const currentLookAt = new THREE.Vector3().lerpVectors(
      startLookAt.add(startPosition),
      targetLookAt,
      easeProgress
    );
    camera.lookAt(currentLookAt);
    
    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }
  
  updateCamera();
}

document.getElementById('toggleGravityBtn').addEventListener('click', () => {
  showGravity = !showGravity;
  
  if (showGravity) {
    if (!gravityFields) showGravityFields();
    gravityFields.visible = true;
    
    // Animate button state
    document.getElementById('toggleGravityBtn').classList.add('active');
    document.getElementById('toggleGravityBtn').textContent = 'Hide Gravity Fields';
  } else {
    if (gravityFields) gravityFields.visible = false;
    document.getElementById('toggleGravityBtn').classList.remove('active');
    document.getElementById('toggleGravityBtn').textContent = 'Show Gravity Fields';
  }
});

function createSpaceLabel(planetName, planetSize) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  
  // Make completely transparent background
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Text styling
  context.font = 'Bold 42px Orbitron';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Glow effect (no background)
  context.shadowColor = '#55ffff';
  context.shadowBlur = 10;
  context.fillStyle = 'rgba(255,255,255,255)';
  context.fillText(planetName, canvas.width/2, canvas.height/2);
  
  // Inner text (no glow)
  context.shadowBlur = 0;
  context.fillStyle = '#ffffff';
  context.fillText(planetName, canvas.width/2, canvas.height/2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true,
    opacity: 0.9, // Adjust transparency here
    depthTest: false,
    depthWrite: false
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(planetSize * 4, planetSize * 1.2, 1);
  sprite.position.set(0, planetSize * 2.5, 0);
  sprite.userData = { isLabel: true };
  sprite.renderOrder = 999;
  
  return sprite;
}



function animate() {
  requestAnimationFrame(animate);
  
  // Solar system animations only
  planets.forEach(p => {
    p.orbit.rotation.y += p.speed;
    p.planet.rotation.y += 0.005;
    checkCollisions();
    p.planet.children.forEach(child => {
      if (child.userData?.speed) {
        child.rotation.y += child.userData.speed;
      }
    });

    // Gravity field lines animation
    if (gravityFields && showGravity) {
      gravityFields.children.forEach(line => {
        if (line.userData.planet === p.name) {
          const planetPosition = p.planet.getWorldPosition(new THREE.Vector3());
          line.position.copy(planetPosition);
          
          line.material.opacity = 0.3 + Math.sin(Date.now() * 0.001 + line.userData.offset) * 0.2;
          
          const positions = line.geometry.attributes.position;
          const basePositions = line.geometry.attributes.basePosition || positions.clone();
          
          for (let i = 0; i < positions.count; i++) {
            const wave = Math.sin(Date.now() * line.userData.speed + i * 0.1) * 0.1;
            positions.setXYZ(
              i,
              basePositions.getX(i),
              basePositions.getY(i),
              basePositions.getZ(i) + wave
            );
          }
          positions.needsUpdate = true;
        }
      });
    }
  });

  // Sun rotation
  sun.rotation.y += 0.001;
  
  // Always update controls and render
  controls.update();
  renderer.render(scene, camera);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  const intersects = raycaster.intersectObjects(
    planets.map(p => p.planet), 
    true
  );
  
  if (hoveredPlanet && hoveredPlanet !== selectedPlanet) {
    hoveredPlanet.planet.material.emissive.setHex(0x000000);
  }
  
  if (intersects.length > 0 && !selectedPlanet) {
    const planetMesh = intersects[0].object;
    hoveredPlanet = planets.find(p => p.planet === planetMesh || p.planet.children.includes(planetMesh));
    
    if (hoveredPlanet) {
      hoveredPlanet.planet.material.emissive.setHex(0x333333);
      document.body.style.cursor = 'pointer';
      hoveredPlanet.originalSpeed = hoveredPlanet.speed;
      hoveredPlanet.speed *= 0.3;
    }
  } else {
    document.body.style.cursor = 'auto';
    if (hoveredPlanet && hoveredPlanet !== selectedPlanet) {
      hoveredPlanet.speed = hoveredPlanet.originalSpeed || hoveredPlanet.speed;
      hoveredPlanet = null;
    }
  }
}

function onPlanetClick() {
  if (hoveredPlanet && !selectedPlanet) {
    selectedPlanet = hoveredPlanet;
    selectedPlanet.planet.material.emissive.setHex(0x666666);
    selectedPlanet.speed = 0;

    const planetPosition = selectedPlanet.planet.getWorldPosition(new THREE.Vector3());
    const targetPosition = planetPosition.clone().multiplyScalar(1.5);
    animateCameraTo(targetPosition, planetPosition);
    
    camera.position.copy(planetPosition).multiplyScalar(1.5);
    camera.lookAt(planetPosition);
    
    showPlanetInfo(selectedPlanet);
  } else if (selectedPlanet) {
    animateCameraTo(new THREE.Vector3(0, 100, 0), new THREE.Vector3(0, 0, 0));
    selectedPlanet.planet.material.emissive.setHex(0x000000);
    selectedPlanet.speed = selectedPlanet.originalSpeed || selectedPlanet.speed;
    selectedPlanet = null;
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);
    hidePlanetInfo();
  }
}

function showPlanetInfo(planet) {
  const planetInfo = planets.find(p => p.name === planet.name);
  const infoElement = document.getElementById('planetInfo');
  const planetNameElement = document.getElementById('planetName');
  const detailsElement = document.getElementById('planetDetails');

  if (!planetInfo) {
    console.error("Planet not found");
    return;
  }

  planetNameElement.textContent = planetInfo.name;
  
  let detailsElementHTML = '';
  
  const infoFields = {
    diameter: "Diameter",
    mass: "Mass",
    distanceFromSun: "Distance from Sun",
    orbitalPeriod: "Orbital Period",
    surfaceTemp: "Surface Temperature",
    moons: "Number of Moons",
    funFact: "Fun Fact",
    composition: "Composition",
    atmosphere: "Atmosphere",
    features: "Notable Features",
    ringSystem: "Ring System"
  };
  
  for (const [key, label] of Object.entries(infoFields)) {
    if (planetInfo.info[key] !== undefined) {
      detailsElementHTML += `
        <div class="mb-2">
          <span class="font-bold">${label}:</span> ${planetInfo.info[key]}
        </div>`;
    }
  }
  
  if (planetInfo.info.moons && planetInfo.info.moons.length > 0) {
    const moonNames = planetInfo.moons.map(m => m.name).join(', ');
    detailsElementHTML += `
      <div class="mb-2">
        <span class="font-bold">Major Moons:</span> ${moonNames}
      </div>`;
  }

  detailsElement.innerHTML = detailsElementHTML;
  infoElement.classList.remove('hidden');
  infoElement.style.zIndex = '100';
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

document.querySelectorAll('#planetNav button').forEach(button => {
  button.addEventListener('click', () => {
    const planetName = button.dataset.planet;
    const planet = planets.find(p => p.name.toLowerCase() === planetName);
    
    if (planet) {
      if (selectedPlanet) {
        selectedPlanet.planet.material.emissive.setHex(0x000000);
        selectedPlanet.speed = selectedPlanet.originalSpeed || selectedPlanet.speed;
      }
      
      selectedPlanet = planet;
      selectedPlanet.planet.material.emissive.setHex(0x666666);
      selectedPlanet.speed = 0;
      
      const planetPosition = selectedPlanet.planet.getWorldPosition(new THREE.Vector3());
      camera.position.copy(planetPosition).multiplyScalar(1.5);
      camera.lookAt(planetPosition);
      
      showPlanetInfo(selectedPlanet);
    }
  });
});

function hidePlanetInfo() {
  const infoElement = document.getElementById('planetInfo');
  infoElement.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('closePlanetInfo').addEventListener('click', hidePlanetInfo);
});

animate();