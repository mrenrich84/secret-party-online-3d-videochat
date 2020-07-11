import {Node, Quaternion, FreeCamera, Vector3, Axis, Scene} from "@babylonjs/core";

//TODO  import "./Inputs/freeCameraDeviceOrientationInput";

// We're mainly based on the logic defined into the FreeCamera code
/**
 * This is a camera specifically designed to react to device orientation events such as a modern mobile device
 * being tilted forward or back and left or right.
 */
export class CustomDeviceOrientationCamera extends FreeCamera {

    private _initialQuaternion: Quaternion | undefined;
    private _quaternionCache: Quaternion;
    private _tmpDragQuaternion = new Quaternion();
    private _disablePointerInputWhenUsingDeviceOrientation = true;
    private touchMoveSensibility: number;
    
    constructor(name: string, position: Vector3, scene: Scene, touchMoveSensibility = 80.0) {
        super(name, position, scene);
        this._quaternionCache = new Quaternion();
        this.inputs.addDeviceOrientation();
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
                                    this._initialQuaternion = new Quaternion();
                                }
                                // Rotate the initial space around the y axis to allow users to "turn around" via touch/mouse
                                Quaternion.FromEulerAnglesToRef(0, e.offsetX * this._dragFactor, 0, this._tmpDragQuaternion);
                                this._initialQuaternion.multiplyToRef(this._tmpDragQuaternion, this._initialQuaternion);

                                const speed = this._computeLocalCameraSpeed();
                                const direction = new Vector3(0, 0, speed * e.offsetY / this.touchMoveSensibility);
                                this.cameraDirection.addInPlace(Vector3.TransformCoordinates(direction, this._cameraRotationMatrix));
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
    public get disablePointerInputWhenUsingDeviceOrientation() {
        return this._disablePointerInputWhenUsingDeviceOrientation;
    }

    public set disablePointerInputWhenUsingDeviceOrientation(value: boolean) {
        this._disablePointerInputWhenUsingDeviceOrientation = value;
    }

    private _dragFactor = 0;
    /**
     * Enabled turning on the y axis when the orientation sensor is active
     * @param dragFactor the factor that controls the turn speed (default: 1/300)
     */
    public enableHorizontalDragging(dragFactor = 1 / 900) {
        this._dragFactor = dragFactor;
    }

    /**
     * Gets the current instance class name ("DeviceOrientationCamera").
     * This helps avoiding instanceof at run time.
     * @returns the class name
     */
    public getClassName(): string {
        return "DeviceOrientationCamera";
    }

    /**
     * @hidden
     * Checks and applies the current values of the inputs to the camera. (Internal use only)
     */
    public _checkInputs(): void {
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
    public resetToCurrentRotation(axis: Axis = Axis.Y): void {

        //can only work if this camera has a rotation quaternion already.
        if (!this.rotationQuaternion) { return; }

        if (!this._initialQuaternion) {
            this._initialQuaternion = new Quaternion();
        }

        this._initialQuaternion.copyFrom(this._quaternionCache || this.rotationQuaternion);

        ['x', 'y', 'z'].forEach((axisName) => {
            if (!(axis as any)[axisName]) {
                (this._initialQuaternion as any)[axisName] = 0;
            } else {
                (this._initialQuaternion as any)[axisName] *= -1;
            }
        });
        this._initialQuaternion.normalize();
        //force rotation update
        this._initialQuaternion.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
    }
}

Node.AddNodeConstructor("DeviceOrientationCamera", (name, scene) => {
    return () => new CustomDeviceOrientationCamera(name, Vector3.Zero(), scene);
});
