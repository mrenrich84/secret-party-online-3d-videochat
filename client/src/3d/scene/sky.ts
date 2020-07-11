import {Mesh, Scene} from "@babylonjs/core";
import {SkyMaterial} from "@babylonjs/materials/sky";

export function createSky(scene: Scene) {
    const skyMaterial = new SkyMaterial("skyMaterial", scene);
    skyMaterial.luminance = 1;
    skyMaterial.inclination = 0;
    skyMaterial.turbidity = 40;
    skyMaterial.backFaceCulling = false;
    const skybox = Mesh.CreateBox("skyBox", 1000, scene);
    skybox.material = skyMaterial;
}