export type DeviceType = 'web' | 'medium' | 'mobile';

export type GenericEventTarget = {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
};

export type FullscreenEventName =
  | 'fullscreenchange'
  | 'webkitfullscreenchange'
  | 'mozfullscreenchange'
  | 'MSFullscreenChange';
