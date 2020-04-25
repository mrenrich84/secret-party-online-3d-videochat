// import { FreeCamera } from "./freeCamera";
// import { Scene } from "../scene";
// import { Quaternion, Vector3 } from "../Maths/math.vector";
// import { Node } from "../node";
//
// import "./Inputs/freeCameraDeviceOrientationInput";
// import { Axis } from '../Maths/math.axis';
import {Quaternion} from "@babylonjs/core/Maths/math.vector";

BABYLON.Node.AddNodeConstructor("DeviceOrientationCamera", (name, scene) => {
    return () => new CustomDeviceOrientationCamera(name, Vector3.Zero(), scene);
});

// We're mainly based on the logic defined into the FreeCamera code
/**
 * This is a camera specifically designed to react to device orientation events such as a modern mobile device
 * being tilted forward or back and left or right.
 */
export class CustomDeviceOrientationCamera extends BABYLON.FreeCamera {

    /**
     * Creates a new device orientation camera
     * @param name The name of the camera
     * @param position The start position camera
     * @param scene The scene the camera belongs to
     */
    constructor(name, position, scene, touchMoveSensibility = 20.0) {
        super(name, position, scene);
        this._quaternionCache = new BABYLON.Quaternion();
        this.inputs.addDeviceOrientation();
        this._tmpDragBABYLON = {};
        this._tmpDragBABYLON.Quaternion = new BABYLON.Quaternion();
        this._disablePointerInputWhenUsingDeviceOrientation = true;
        this._dragFactor = 0;
        this._tmpDragQuaternion = new BABYLON.Quaternion();
        this.touchMoveSensibility = touchMoveSensibility;

        // When the orientation sensor fires it's first event, disable mouse input
        if (this.inputs._deviceOrientationInput) {
            this.inputs._deviceOrientationInput._onDeviceOrientationChangedObservable.addOnce(() => {
                if (this._disablePointerInputWhenUsingDeviceOrientation) {
                    if (this.inputs._mouseInput) {
                        this.inputs._mouseInput._allowCameraRotation = false;
                        this.inputs._mouseInput.onPointerMovedObservable.add((e) => {
                            if (this._dragFactor != 0) {
                                if (!this._initialQuaternion) {
                                    this._initialQuaternion = new BABYLON.Quaternion();
                                }
                                // Rotate the initial space around the y axis to allow users to "turn around" via touch/mouse
                                BABYLON.Quaternion.FromEulerAnglesToRef(0, e.offsetX * this._dragFactor, 0, this._tmpDragQuaternion);
                                this._initialQuaternion.multiplyToRef(this._tmpDragQuaternion, this._initialQuaternion);

                                var speed = this._computeLocalCameraSpeed();
                                var direction = new BABYLON.Vector3(0, 0, speed * e.offsetY / this.touchMoveSensibility);
                                this.cameraDirection.addInPlace(BABYLON.Vector3.TransformCoordinates(direction, this._cameraRotationMatrix));
                            }
                        });
                    }
                }
            });
        }
    }

    /**
     * Gets or sets a boolean indicating that pointer input must be disabled on first orientation sensor update (Default: true)
     */
    get disablePointerInputWhenUsingDeviceOrientation() {
        return this._disablePointerInputWhenUsingDeviceOrientation;
    }

    set disablePointerInputWhenUsingDeviceOrientation(value) {
        this._disablePointerInputWhenUsingDeviceOrientation = value;
    }

    /**
     * Enabled turning on the y axis when the orientation sensor is active
     * @param dragFactor the factor that controls the turn speed (default: 1/300)
     */
    enableHorizontalDragging(dragFactor = 1 / 900) {
        this._dragFactor = dragFactor;
    }

    /**
     * Gets the current instance class name ("DeviceOrientationCamera").
     * This helps avoiding instanceof at run time.
     * @returns the class name
     */
    getClassName() {
        return "DeviceOrientationCamera";
    }

    /**
     * @hidden
     * Checks and applies the current values of the inputs to the camera. (Internal use only)
     */
    _checkInputs() {
        super._checkInputs();
        this._quaternionCache.copyFrom(this.rotationQuaternion);
        if (this._initialQuaternion) {
            this._initialQuaternion.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
        }
    }

    /**
     * Reset the camera to its default orientation on the specified axis only.
     * @param axis The axis to reset
     */
    resetToCurrentRotation(axis = BABYLON.Axis.Y) {

        //can only work if this camera has a rotation quaternion already.
        if (!this.rotationQuaternion) { return; }

        if (!this._initialQuaternion) {
            this._initialQuaternion = new BABYLON.Quaternion();
        }

        this._initialQuaternion.copyFrom(this._quaternionCache || this.rotationQuaternion);

        ['x', 'y', 'z'].forEach((axisName) => {
            if (!axis[axisName]) {
                this._initialQuaternion[axisName] = 0;
            } else {
                this._initialQuaternion[axisName] *= -1;
            }
        });
        this._initialQuaternion.normalize();
        //force rotation update
        this._initialQuaternion.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
    }
}