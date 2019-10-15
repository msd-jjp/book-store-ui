export function color(r: number, g: number, b: number, a: number) {
  let rtn = r;
  rtn = (rtn << 8) + g;
  rtn = (rtn << 8) + b;
  rtn = (rtn << 8) + a;
  return rtn;
}

export async function getFont(url: string): Promise<ArrayBuffer> {
  let r = await fetch(url);
  let byteArray = await r.arrayBuffer();
  return byteArray;
}

export function base64ToBuffer(base64: string): Uint8Array {
  let binstr = atob(base64);
  let buf = new Uint8Array(binstr.length);
  Array.prototype.forEach.call(binstr, function (ch: any, i: any) {
    buf[i] = ch.charCodeAt(0);
  });
  return buf;
}
