import { forwardRef, useEffect, useRef, useState } from "react";
import { CameraControls as DreiCameraControls, PerspectiveCamera } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";

const CameraControls = forwardRef(({ activeBuilding, activePlanet, activeDeveloperId, movement: uiMovement }, ref) => {
  const controlsRef = useRef();
  const { scene } = useThree();
  const [keys, setKeys] = useState({ forward: false, backward: false, left: false, right: false });

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': setKeys(prev => ({ ...prev, forward: true })); break;
        case 's': case 'arrowdown': setKeys(prev => ({ ...prev, backward: true })); break;
        case 'a': case 'arrowleft': setKeys(prev => ({ ...prev, left: true })); break;
        case 'd': case 'arrowright': setKeys(prev => ({ ...prev, right: true })); break;
      }
    };
    const handleKeyUp = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': setKeys(prev => ({ ...prev, forward: false })); break;
        case 's': case 'arrowdown': setKeys(prev => ({ ...prev, backward: false })); break;
        case 'a': case 'arrowleft': setKeys(prev => ({ ...prev, left: false })); break;
        case 'd': case 'arrowright': setKeys(prev => ({ ...prev, right: false })); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update movement every frame
  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    const move = {
      forward: uiMovement.forward || keys.forward,
      backward: uiMovement.backward || keys.backward,
      left: uiMovement.left || keys.left,
      right: uiMovement.right || keys.right,
    };

    const speed = activePlanet ? 50 : 150; // Slower when zoomed into a planet
    
    if (move.forward) controlsRef.current.dolly(speed * delta, true);
    if (move.backward) controlsRef.current.dolly(-speed * delta, true);
    if (move.left) controlsRef.current.truck(-speed * delta, 0, true);
    if (move.right) controlsRef.current.truck(speed * delta, 0, true);
  });

  useEffect(() => {
    if (controlsRef.current) {
      if (activeBuilding?.current) {
        controlsRef.current.fitToBox(activeBuilding.current, true, { paddingTop: 2, paddingLeft: 2, paddingBottom: 2, paddingRight: 2 });
      } else if (activeDeveloperId) {
        const buildingMesh = scene.getObjectByName(`building-${activeDeveloperId}`);
        if (buildingMesh) {
          controlsRef.current.fitToBox(buildingMesh, true, { paddingTop: 2, paddingLeft: 2, paddingBottom: 2, paddingRight: 2 });
        }
      } else if (activePlanet) {
        controlsRef.current.setLookAt(60, 40, 60, 0, 0, 0, true);
        controlsRef.current.minDistance = 5;
        controlsRef.current.maxDistance = 200;
      } else {
        controlsRef.current.setLookAt(100, 80, 100, 0, 0, 0, true);
        controlsRef.current.minDistance = 30;
        controlsRef.current.maxDistance = 600;
      }
    }
  }, [activeBuilding, activePlanet, activeDeveloperId, scene]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[100, 80, 100]} fov={50} />
      <DreiCameraControls 
        ref={controlsRef}
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={3}
        maxDistance={800}
        smoothTime={0.2}
      />
    </>
  );
});

CameraControls.displayName = "CameraControls";
export default CameraControls;
