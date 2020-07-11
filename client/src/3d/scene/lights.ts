import {HemisphericLight, PointLight, Scene, Vector3} from "@babylonjs/core";
import {ShadowLight} from "@babylonjs/core/Lights/shadowLight";

export function addTo(scene: Scene): ShadowLight {
    const ambientLight = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.3;
    const sunLight = new PointLight("pointLight", new Vector3(0, 999, 0), scene);
    sunLight.intensity = 2999999;
    return sunLight;
}