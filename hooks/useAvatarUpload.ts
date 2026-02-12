import { useState, useCallback } from "react";
import ImageCropPicker from "react-native-image-crop-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { uploadsApi } from "@/services/api/uploads";

const OUTPUT_SIZE = 512;

export function useAvatarUpload() {
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /** Opens the gallery with circular crop. Returns the local URI for preview. */
  const pickAvatar = useCallback(async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: OUTPUT_SIZE,
        height: OUTPUT_SIZE,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: "photo",
        compressImageQuality: 1,
      });

      const manipulated = await manipulateAsync(
        image.path,
        [{ resize: { width: OUTPUT_SIZE, height: OUTPUT_SIZE } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      setPendingAvatarUri(manipulated.uri);
      return manipulated.uri;
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "E_PICKER_CANCELLED") return null;
      throw error;
    }
  }, []);

  /** Uploads the pending avatar to S3. Returns the public CloudFront URL. */
  const uploadAvatar = useCallback(async (): Promise<string | null> => {
    if (!pendingAvatarUri) return null;

    setIsUploading(true);
    try {
      const contentType = "image/jpeg" as const;
      const { data } = await uploadsApi.getPresignedUrl({
        folder: "avatars",
        contentType,
      });

      await uploadsApi.uploadToS3(data.uploadUrl, pendingAvatarUri, contentType);

      setPendingAvatarUri(null);
      return data.publicUrl;
    } finally {
      setIsUploading(false);
    }
  }, [pendingAvatarUri]);

  const clearPendingAvatar = useCallback(() => {
    setPendingAvatarUri(null);
  }, []);

  return {
    pendingAvatarUri,
    isUploading,
    pickAvatar,
    uploadAvatar,
    clearPendingAvatar,
  };
}
