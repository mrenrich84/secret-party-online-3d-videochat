import {CustomDeviceOrientationCamera} from "./CustomDeviceOrientationCamera";
import {
    Camera,
    FreeCamera,
    Scene,
    SceneOptimizer,
    SceneOptimizerOptions,
    Vector3
} from '@babylonjs/core';

const isMobile = window.orientation !== undefined;

const createMobileCamera = (initialPosition: Vector3, scene: Scene): FreeCamera => {
    const camera = new CustomDeviceOrientationCamera("Camera", initialPosition, scene);
    camera.enableHorizontalDragging();
    scene.getEngine().onResizeObservable.add((engine) => {
        const canvas = engine.getRenderingCanvas();
        if (canvas) {
            camera.fovMode = canvas.height > canvas.width ? Camera.FOVMODE_VERTICAL_FIXED : Camera.FOVMODE_HORIZONTAL_FIXED;
        }
    });
    
    new SceneOptimizer(scene, SceneOptimizerOptions.HighDegradationAllowed());
    return camera;
};

const createDesktopCamera = (initialPosition: Vector3, scene: Scene): FreeCamera => {
    const camera = new FreeCamera("Camera", initialPosition, scene);
    camera.speed = 0.175;
    camera.inertia = 0.875;
    camera.angularSensibility = 6000;

    setTimeout(() => {
        window.addEventListener("click", () => {
            scene.getEngine().enterPointerlock();
        });
    }, 1000);

    return camera;
};

export function createCamera(scene: Scene, canvas: HTMLCanvasElement): void {
    const initialPosition =  new Vector3(0, 2, 0);
    const camera = isMobile 
        ? createMobileCamera(initialPosition, scene)
        : createDesktopCamera(initialPosition, scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);

    camera.fov = 1.2;
    camera.minZ = 0;
    
    //Set the ellipsoid around the camera (e.g. your player's size)
    camera.ellipsoid = new Vector3(0.2,0.8,0.2);
    
    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.applyGravity = true;
}