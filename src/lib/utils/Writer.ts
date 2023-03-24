import { Float16Array } from "@petamoriken/float16";

let GLOBAL_ENDIANNESS = true;

const encoder = new TextEncoder();

/**
 * A binary Writer for ease of use
 */
export class Writer {
  data: ArrayBuffer;
  offset: number;
  length: number;
  view: DataView;

  constructor(data: Uint8Array | Int8Array | ArrayBuffer) {
    this.data = this.#isUint8Array(data) ? data.buffer : data;
    this.view = new DataView(this.data);
    this.length = new Uint8Array(this.data).length;
    this.offset = 0;
  }

  #isUint8Array(data: Uint8Array | ArrayBuffer): data is Uint8Array {
    return (data as Uint8Array).buffer !== undefined;
  }

  private expandCapacity() {
    const newDat = new ArrayBuffer(this.length * 2);
    const uint8Arr = new Uint8Array(newDat);
    uint8Arr.set(new Uint8Array(this.data), 0);

    this.data = newDat;
    this.view = new DataView(this.data);
    this.length = new Uint8Array(this.data).length;
  }

  /**
   * Removes all trailing 0x00 bytes from the writer
   */
  trim() {
    const newDat = this.data.slice(0, this.offset);

    this.data = newDat;
    this.view = new DataView(this.data);
    this.length = new Uint8Array(this.data).length;
  }

  #writeI(
    method: keyof DataView,
    length: number
  ): (data: any, endianness?: boolean) => number {
    if (this.remaining() <= length) {
      this.expandCapacity();
    }
    return (data: any, endianness?: boolean) => {
      // @ts-ignore
      this.view[method](
        this.offset,
        data,
        endianness ? endianness : GLOBAL_ENDIANNESS
      );
      this.offset += length;
      return length;
    };
  }

  /**
   * seeks to the current offset
   * @param  {number} offset the new offset.
   * @param  {number} position the position to update from. 0 = start, 1 = current offset, 2 = end.
   */
  seek(offset: number, position: number = 0) {
    if (position == 0) {
      this.offset = Number(offset);
    } else if (position == 1) {
      this.offset = this.offset + Number(offset);
    } else if (position == 2) {
      this.offset = Number(this.data.byteLength) - Number(offset);
    } else {
      throw Error(
        `Unexpected position value. Expected 0, 1, or 2, but got ${position}.`
      );
    }
  }

  /**
   * Returns the number of bytes left in the Writer
   * @returns the number of bytes left in the Writer
   */
  remaining(): number {
    return this.length - (this.offset + 1);
  }

  /**
   * Write a byte to the current offset.
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   */
  writeByte = this.#writeI("setInt8", 1);

  /**
   * Writes the provide char to the current offset of the Writer. Returns the number of bytes written
   * @param  {string} data the char to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeChar(data: string, endianness?: boolean) {
    return this.#writeI("setInt8", 1)(data.charCodeAt(0), endianness);
  }

  /**
   * Writes the signed data to the current offset.
   * @param  {Int8Array} data the data to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   */
  writeSignedBytes(data: Int8Array, endianness?: boolean) {
    if (this.remaining() <= data.length) {
      this.expandCapacity();
    }
    const nDat = new Int8Array(this.data);
    nDat.set(
      (endianness ? endianness : GLOBAL_ENDIANNESS) ? data : data.reverse(),
      this.offset
    );
    this.data = nDat.buffer;
    this.view = new DataView(this.data);
    this.offset += data.length;
    return data.length;
  }

  /**
   * Writes the unsigned data to the current offset.
   * @param  {Uint8Array} data the data to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   */
  writeUnsignedBytes(data: Uint8Array, endianness?: boolean) {
    if (this.remaining() <= data.length) {
      this.expandCapacity();
    }
    const nDat = new Uint8Array(this.data);
    nDat.set(
      (endianness ? endianness : GLOBAL_ENDIANNESS) ? data : data.reverse(),
      this.offset
    );
    this.data = nDat.buffer;
    this.view = new DataView(this.data);
    this.offset += data.length;
    return data.length;
  }

  /**
   * Writes the provided Uint8 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeUint8 = this.#writeI("setUint8", 1);

  /**
   * Writes the provided Uint16 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeUint16 = this.#writeI("setUint16", 2);

  /**
   * Writes the provided Uint32 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeUint32 = this.#writeI("setUint32", 4);

  /**
   * Writes the provided BigUint64 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeUint64 = this.#writeI("setBigUint64", 8);

  /**
   * Writes the provided Int8 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeInt8 = this.#writeI("setInt8", 1);

  /**
   * Writes the provided Int16 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeInt16 = this.#writeI("setInt16", 2);

  /**
   * Writes the provided Int32 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeInt32 = this.#writeI("setInt32", 4);

  /**
   * Writes the provided BigInt64 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeInt64 = this.#writeI("setBigInt64", 8);

  /**
   * Writes the provided Float16 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeFloat16(data: number, endianness: boolean = true) {
    if (this.remaining() <= 2) {
      this.expandCapacity();
    }
    const res = new Float16Array([data]);

    const nDat = new Float16Array(this.data);
    nDat.set(
      (endianness ? endianness : GLOBAL_ENDIANNESS) ? res : res.reverse(),
      this.offset
    );
    this.data = nDat.buffer;
    this.view = new DataView(this.data);

    this.offset += 2;
    return 1;
  }

  /**
   * Writes the provided Float32 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeFloat32 = this.#writeI("setFloat32", 4);

  /**
   * Writes the provided Float64 to the current offset
   * @param {number} data the number to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeFloat64 = this.#writeI("setFloat64", 8);

  /**
   * Writes the provided string to the current offset, prefixed by the length as an Int32
   * @param {string} str the string to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeLenPrefixString(str: string, endianness: boolean = true): number {
    const length = str.length;
    if (this.remaining() <= length) {
      this.expandCapacity();
    }
    this.writeUint32(length, endianness);

    const strBytes = encoder.encode(str);
    this.writeUnsignedBytes(strBytes, endianness);

    return 4 + strBytes.length;
  }

  /**
   * Writes the provided string to the current offset.
   * @param {string} str the string to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  writeString(str: string, endianness: boolean = true): number {
    const length = str.length;
    if (this.remaining() <= length) {
      this.expandCapacity();
    }

    const strBytes = encoder.encode(str);
    this.writeUnsignedBytes(strBytes, endianness);

    return strBytes.length;
  }

  /**
   * Writes the provided string to the current offset, followed by a 0x00 byte
   * @param {string} str the string to write
   * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
   * @returns the number of bytes written
   */
  write00PaddedString(str: string, endianness: boolean = true): number {
    const strBytes = encoder.encode(str);
    if (this.remaining() <= strBytes.length) {
      this.expandCapacity();
    }
    this.writeUnsignedBytes(strBytes, endianness);

    this.writeUint8(0x00, endianness);

    return strBytes.length + 1;
  }
}
