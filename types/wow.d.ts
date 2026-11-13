declare module "wow.js" {
  export interface WowOptions {
    boxClass?: string;
    animateClass?: string;
    offset?: number;
    mobile?: boolean;
    live?: boolean;
    resetAnimation?: boolean;
    scrollContainer?: string | HTMLElement | null;
    callback?: (box: HTMLElement) => void;
  }

  export default class WOW {
    constructor(options?: WowOptions);
    init(): void;
    sync(): void;
    applyStyle(box: HTMLElement, hidden: boolean): void;
  }
}
