import "@babylonjs/loaders/glTF";
import {Scene, SceneLoader, ShadowGenerator} from "@babylonjs/core";

export function importMesh(scene: Scene, filename: string, shadowGenerator: ShadowGenerator): void {
    SceneLoader.ImportMesh(
        "",
        "/asset/",
        filename,
        scene,
        (objs) => {
            objs.forEach(obj => {
                console.log("Imported ", obj.id, obj.name);
                obj.checkCollisions = true;
                obj.receiveShadows = true;
                shadowGenerator?.getShadowMap()?.renderList?.push(obj);
            });
        }, (event) => {
            console.log(event);
        }, (scene, error) => {
            console.log(error)
        });
}