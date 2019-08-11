export class AppGuid {
  // constructor() {
  // }

  private static s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  static generate() {
    const str =
      `${AppGuid.s4()}${AppGuid.s4()}-${AppGuid.s4()}-${AppGuid.s4()}-${AppGuid.s4()}-${AppGuid.s4()}${AppGuid.s4()}${AppGuid.s4()}`
    ;
    return str;
  }
}
