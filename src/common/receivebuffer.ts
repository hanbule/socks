class ReceiveBuffer {
  private _buffer: Buffer;
  private _offset: number;
  private _originalSize: number;

  constructor(size: number = 4096) {
    this._buffer = Buffer.allocUnsafe(size);
    this._offset = 0;
    this._originalSize = size;
  }

  get length() {
    return this._offset;
  }

  append(data: Buffer): number {
    if (!Buffer.isBuffer(data)) {
      throw new Error(
        'Attempted to append a non-buffer instance to ReceiveBuffer.'
      );
    }

    if (this._offset + data.length >= this._buffer.length) {
      const tmp = this._buffer;
      this._buffer = Buffer.allocUnsafe(
        Math.max(
          this._buffer.length + this._originalSize,
          this._buffer.length + data.length
        )
      );
      tmp.copy(this._buffer);
    }

    data.copy(this._buffer, this._offset);
    return (this._offset += data.length);
  }

  peek(length: number) {
    if (length > this._offset) {
      throw new Error(
        'Attempted to read beyond the bounds of the managed internal data.'
      );
    }
    return this._buffer.slice(0, length);
  }

  get(length: number): Buffer {
    if (length > this._offset) {
      throw new Error(
        'Attempted to read beyond the bounds of the managed internal data.'
      );
    }

    const value = Buffer.allocUnsafe(length);
    this._buffer.slice(0, length).copy(value);
    this._buffer.copyWithin(0, length, length + this._offset - length);
    this._offset -= length;

    return value;
  }
}

export { ReceiveBuffer };
