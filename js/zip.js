/**
 * Minimal ZIP writer (method 0 = stored, no compression) — enough to package
 * a skill folder containing a SKILL.md. Zero dependency, ~100 lines.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xffff;
  const day = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;
  return { time, day };
}

class ByteWriter {
  constructor() { this.chunks = []; this.length = 0; }
  bytes(arr) { this.chunks.push(arr); this.length += arr.length; }
  u16(v) { this.bytes(new Uint8Array([v & 0xff, (v >> 8) & 0xff])); }
  u32(v) { this.bytes(new Uint8Array([v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff])); }
  concat() {
    const out = new Uint8Array(this.length);
    let offset = 0;
    for (const c of this.chunks) { out.set(c, offset); offset += c.length; }
    return out;
  }
}

/**
 * @param {Array<{name: string, content: string}>} files — name may contain "/" for folders
 * @returns {Blob} the zip archive
 */
export function createZip(files) {
  const encoder = new TextEncoder();
  const { time, day } = dosDateTime(new Date());
  const writer = new ByteWriter();
  const central = [];

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const offset = writer.length;

    // Local file header
    writer.u32(0x04034b50);
    writer.u16(20);          // version needed
    writer.u16(0x0800);      // flags: UTF-8 names
    writer.u16(0);           // method: stored
    writer.u16(time);
    writer.u16(day);
    writer.u32(crc);
    writer.u32(data.length); // compressed size (= raw, stored)
    writer.u32(data.length);
    writer.u16(nameBytes.length);
    writer.u16(0);           // extra length
    writer.bytes(nameBytes);
    writer.bytes(data);

    central.push({ nameBytes, crc, size: data.length, offset });
  }

  const centralStart = writer.length;
  for (const entry of central) {
    writer.u32(0x02014b50);
    writer.u16(20);          // version made by
    writer.u16(20);          // version needed
    writer.u16(0x0800);
    writer.u16(0);
    writer.u16(time);
    writer.u16(day);
    writer.u32(entry.crc);
    writer.u32(entry.size);
    writer.u32(entry.size);
    writer.u16(entry.nameBytes.length);
    writer.u16(0);           // extra
    writer.u16(0);           // comment
    writer.u16(0);           // disk number
    writer.u16(0);           // internal attrs
    writer.u32(0);           // external attrs
    writer.u32(entry.offset);
    writer.bytes(entry.nameBytes);
  }
  const centralSize = writer.length - centralStart;

  // End of central directory
  writer.u32(0x06054b50);
  writer.u16(0);
  writer.u16(0);
  writer.u16(central.length);
  writer.u16(central.length);
  writer.u32(centralSize);
  writer.u32(centralStart);
  writer.u16(0);

  return new Blob([writer.concat()], { type: 'application/zip' });
}
