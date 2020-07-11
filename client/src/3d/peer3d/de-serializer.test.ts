import {serializer, deserializer} from './de-serializer';

const payload = {
    absoluteRotation: {
        x: 0.22262108506598186,
        y: -0.6879212069262144,
        z: 0.017944758787122827,
        w: 0.6905666253288373
    },
    globalPosition: {
        x: 50,
        y: 2,
        z: -20
    }
};

describe("serializer", () => {
    
    describe("it converts payload", () => {
        let view: Float64Array;
        beforeEach(() => {
            const arrayBuffer = serializer(payload);
            view = new Float64Array(arrayBuffer);
        });
        it("1st 64 bit is absoluteRotation.x", ()  => {
            expect(view[0]).toEqual(payload.absoluteRotation.x);
        });
        it("2nd 64 bit is absoluteRotation.y", ()  => {
            expect(view[1]).toEqual(payload.absoluteRotation.y);
        });
        it("3rd 64 bit is absoluteRotation.z", ()  => {
            expect(view[2]).toEqual(payload.absoluteRotation.z);
        });
        it("4th 64 bit is absoluteRotation.w", ()  => {
            expect(view[3]).toEqual(payload.absoluteRotation.w);
        });
        it("5th 64 bit is globalPosition.x", ()  => {
            expect(view[4]).toEqual(payload.globalPosition.x);
        });
        it("6th 64 bit is globalPosition.y", ()  => {
            expect(view[5]).toEqual(payload.globalPosition.y);
        });
        it("7th 64 bit is globalPosition.z", ()  => {
            expect(view[6]).toEqual(payload.globalPosition.z);
        });
    });
});

describe("deserializer", () => {
   it("decodes a dataBuffer", () => {
       const dataArray = new Float64Array(7);
       dataArray[0] = payload.absoluteRotation.x;
       dataArray[1] = payload.absoluteRotation.y;
       dataArray[2] = payload.absoluteRotation.z;
       dataArray[3] = payload.absoluteRotation.w;
       dataArray[4] = payload.globalPosition.x;
       dataArray[5] = payload.globalPosition.y;
       dataArray[6] = payload.globalPosition.z;
       expect(deserializer(dataArray)).toEqual(payload);
   });
});