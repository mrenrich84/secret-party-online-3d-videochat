import {AbstractMesh, Mesh, Scene, SceneLoader, ShadowGenerator} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

const assetRootUrl = '/asset/';
const assets = {
    bar: 'Bar decimated.glb',
    barTent: 'Tent.glb',
    barStool: 'Stool decimated compressed.glb',
    jacuzzi: 'Yakuzi decimated compressed.glb',
    jacuzziTent: 'Yakuzi tent decimated compressed.glb',
    isleArmchair: 'Poltrona 1 decimated compressed.glb',
    isleBase: 'Isle Base compressed.glb',
    isleBridge: 'Bridge decimated compressed.glb',
    isleTent: 'Isle tent compressed.glb',
    perimeter: 'Perimeter.glb',
    roundArmchair: 'Round poltrona compressed.glb',
    roundArmchairTent: 'Gazebo 1 decimated compressed.glb',
    sofa: 'Sofa decimated.glb',
    sofaUmbrella: 'Umbrella.glb',
    sunBed: 'Sun bed decimated compressed.glb',
    swimmingPool: 'Swimming pool decimated compressed.glb',
    tree: 'Tree decimated compressed.glb'
};

type LoadAssets = (scene: Scene, shadowGenerator: ShadowGenerator) => void;

const meshesSetDefaultOpts = (shadowGenerator: ShadowGenerator) => ({meshes}: { meshes: AbstractMesh[] }) => {
    meshes.forEach(mesh => {
        // console.log("Imported ", obj.id, obj.name);
        mesh.checkCollisions = true;
        mesh.receiveShadows = true;
        shadowGenerator?.getShadowMap()?.renderList?.push(mesh);
    });
    return {meshes};
};

const meshImportWithDefaultsFactory = (scene: Scene, shadowGenerator: ShadowGenerator) => (filename: string) =>
    SceneLoader.ImportMeshAsync(
        "",
        assetRootUrl,
        filename,
        scene)
        .then(meshesSetDefaultOpts(shadowGenerator))
        .catch(console.error);

const loadPerimeter: LoadAssets = (scene, shadowGenerator) => {
    meshImportWithDefaultsFactory(scene, shadowGenerator)(assets.perimeter);
};

const setupBarStools = (objs: void | { meshes: AbstractMesh[] }) => {
    if (objs && objs.meshes) {
        objs.meshes.forEach(mesh => {
            // console.log("Imported ", mesh.id, mesh.name);
            mesh.isVisible = false;
            if (mesh instanceof Mesh) {
                for (let index = 1; index <= 3; index++) {
                    const newInstance = mesh.createInstance(mesh.name + "_" + index);
                    newInstance.setParent(mesh.parent);
                    newInstance.position.x = mesh.position.x + 2;
                    newInstance.isVisible = true;
                }
            }
        });
    }
};

const loadBar: LoadAssets = async (scene, shadowGenerator) => {
    meshImportWithDefaultsFactory(scene, shadowGenerator)(assets.bar);
    meshImportWithDefaultsFactory(scene, shadowGenerator)(assets.barTent);
    meshImportWithDefaultsFactory(scene, shadowGenerator)(assets.barStool).then(setupBarStools);
};

export const loadAssets: LoadAssets = (scene, shadowGenerator) => {
    loadPerimeter(scene, shadowGenerator);
    loadBar(scene, shadowGenerator);
    // loadJacuzzi(scene, shadowGenerator);
    // loadIsle(scene, shadowGenerator);
    // loadRoundArmchair(scene, shadowGenerator);
    // loadSofa(scene, shadowGenerator);
    // loadSunBed(scene, shadowGenerator);
    // loadSwimmingPool(scene, shadowGenerator);
    // loadTree(scene, shadowGenerator);
};