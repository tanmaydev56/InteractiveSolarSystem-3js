
### Solar System Visualization with Three.js

![Solar System Screenshot](https://github.com/user-attachments/assets/fd5cfc8a-92ae-46ea-8278-a347f80e1839)

An interactive 3D model of our solar system built with Three.js. Explore the planets, view detailed information, and visualize gravitational fields in this immersive web experience.

## Features

- **Realistic 3D Models**: Accurately scaled planets with high-resolution textures
- **Interactive Controls**: 
  - Orbit around the solar system with mouse controls
  - Double-click to reset view
  - Click planets to focus and view details
- **Planet Information**: Detailed facts about each planet including:
  - Size, mass, and composition
  - Orbital characteristics
  - Surface conditions
  - Fun facts
- **Visual Effects**:
  - Atmospheric shaders for Earth and gas giants
  - Animated gravity field visualization
  - Dynamic starfield background
- **Responsive Design**: Adapts to different screen sizes

## Technologies Used

- [Three.js](https://threejs.org/) - 3D JavaScript library
- WebGL - For hardware-accelerated graphics
- JavaScript ES6+ - For application logic
- HTML/CSS - For UI and styling

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solar-system-threejs.git
   ```
2. Navigate to the project directory:
   ```bash
   cd solar-system-threejs
   ```
3. Install dependencies (if any):
   ```bash
   npm install
   ```
4. Run a local server (you can use Python's built-in server):
   ```bash
   python -m http.server 8000
   ```
5. Open your browser and navigate to:
   ```bash
   http://localhost:8000
   ```

## Usage

- **Navigation**:
  - Left-click and drag to rotate view
  - Right-click and drag to pan
  - Scroll to zoom in/out
  - Double-click to reset view

- **Planet Interaction**:
  - Click on any planet to focus and view information
  - Click again or use the "Close" button to return to solar system view
  - Use the navigation buttons at the bottom to quickly jump to specific planets

- **Gravity Fields**:
  - Toggle the "Show Gravity Fields" button to visualize planetary gravitational influences
  - Fields animate dynamically to show gravitational effects

## Project Structure

```bash
solar-system/
├── assets/                  # Planet textures and images
│   ├── earth.jpg
│   ├── jupiter.jpg
│   └── ...
├── js/
│   └── main.js              # Main Three.js application code
├── index.html               # Main HTML file
├── README.md                # This file
└── styles.css               # CSS styles
```

## Customization

To modify the solar system:

1. **Add/Modify Planets**:
   - Edit the `planets` array in `main.js`
   - Add new texture images to the `assets` folder
   - Use the `createPlanet()` function to add new celestial bodies

2. **Adjust Visuals**:
   - Modify lighting parameters in the scene setup
   - Adjust atmosphere shaders in the planet creation function
   - Change the starfield density by editing the `starVertices` array

3. **Add Information**:
   - Expand the `info` object for each planet to include additional facts
   - Modify the `showPlanetInfo()` function to display new data fields

## Performance Notes

- For best performance, use a modern browser with WebGL 2.0 support
- On mobile devices, consider reducing the star count or disabling shadows
- The gravity field visualization can be performance intensive - toggle it off if needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NASA for planetary texture images
- Three.js community for examples and documentation
- Space enthusiasts everywhere for inspiration
