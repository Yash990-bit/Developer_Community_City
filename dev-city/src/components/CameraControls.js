import { forwardRef, useEffect, useRef } from "react";
import { CameraControls as DreiCameraControls, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const CameraControls = forwardRef(({ activeBuilding, activePlanet, activeDeveloperId }, ref) => {
  const controlsRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (controlsRef.current) {
      if (activeBuilding?.current) {
        // Zoom to specific building via ref (click)
        controlsRef.current.fitToBox(activeBuilding.current, true, { paddingTop: 2, paddingLeft: 2, paddingBottom: 2, paddingRight: 2 });
      } else if (activeDeveloperId) {
        // Zoom to specific building via ID (search)
        const buildingMesh = scene.getObjectByName(`building-${activeDeveloperId}`);
        if (buildingMesh) {
          controlsRef.current.fitToBox(buildingMesh, true, { paddingTop: 2, paddingLeft: 2, paddingBottom: 2, paddingRight: 2 });
        }
      } else if (activePlanet) {
        // District View
        controlsRef.current.setLookAt(60, 40, 60, 0, 0, 0, true);
        controlsRef.current.minDistance = 5;
        controlsRef.current.maxDistance = 200;
      } else {
        // Solar System View
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
        minDistance={30}
        maxDistance={600}
        smoothTime={0.4}
      />
    </>
  );
});

CameraControls.displayName = "CameraControls";
export default CameraControls;
