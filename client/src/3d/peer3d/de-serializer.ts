export const serializer = (payload: Payload) => {
    const dataArray = new Float64Array(7);
    dataArray[0] = payload.absoluteRotation.x;
    dataArray[1] = payload.absoluteRotation.y;
    dataArray[2] = payload.absoluteRotation.z;
    dataArray[3] = payload.absoluteRotation.w;
    dataArray[4] = payload.globalPosition.x;
    dataArray[5] = payload.globalPosition.y;
    dataArray[6] = payload.globalPosition.z;
    return dataArray.buffer;
};

export const deserializer = (buffer: any): Payload => {
    const dataArray = new Float64Array(buffer.buffer);
    return {
        absoluteRotation: {
            x: dataArray[0],
            y: dataArray[1],
            z: dataArray[2],
            w: dataArray[3]
        },
        globalPosition: {
            x: dataArray[4],
            y: dataArray[5],
            z: dataArray[6]
        }
    }
};

export interface Payload {
    absoluteRotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    globalPosition: {
        x: number;
        y: number;
        z: number;
    };
}