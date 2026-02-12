type CropCallback = (uri: string) => void;

let callback: CropCallback | null = null;

export function setAvatarCropCallback(cb: CropCallback) {
  callback = cb;
}

export function callAvatarCropCallback(uri: string) {
  callback?.(uri);
  callback = null;
}

export function clearAvatarCropCallback() {
  callback = null;
}
