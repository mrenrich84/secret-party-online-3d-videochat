import {Scene, ShadowGenerator} from "@babylonjs/core";
import {importMesh} from "./mesh-importer";

const assetList = [
    'Bar decimated.glb',
    'Bridge decimated compressed.glb',
    'Gazebo 1 decimated compressed.glb',
    'Isle Base compressed.glb',
    'Isle table decimated compressed.glb',
    'Isle tent compressed.glb',
    'Perimeter.glb',
    'Poltrona 1 decimated compressed.glb',
    'Poltrona 2 decimated compressed.glb',
    'Round poltrona 2 compressed.glb',
    'Round poltrona compressed.glb',
    'Sofa 2 decimated compressed.glb',
    'Sofa decimated.glb',
    'Sofa table compressed.glb',
    'Stool 2 decimated compressed.glb',
    'Stool 3 decimated compressed.glb',
    'Stool 4 decimated compressed.glb',
    'Stool decimated compressed.glb',
    'Sun bed 2 decimated compressed.glb',
    'Sun bed 3 decimated compressed.glb',
    'Sun bed 4 decimated compressed.glb',
    'Sun bed decimated compressed.glb',
    'Swimming pool decimated compressed.glb',
    'Tent.glb',
    'Tree 2 decimated compressed.glb',
    'Tree 3 decimated compressed.glb',
    'Tree 4 decimated compressed.glb',
    'Tree 5 decimated compressed.glb',
    'Tree 6 decimated compressed.glb',
    'Tree 7 decimated compressed.glb',
    'Tree decimated compressed.glb',
    'Umbrella.glb',
    'Yakuzi decimated compressed.glb',
    'Yakuzi tent decimated compressed.glb'
];

export const loadAssets = (scene: Scene, shadowGenerator: ShadowGenerator): void => assetList.forEach(filename => importMesh(scene, filename, shadowGenerator));