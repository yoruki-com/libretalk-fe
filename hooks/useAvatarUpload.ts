import { useState, useCallback } from "react";
import ImageCropPicker from "react-native-image-crop-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { uploadsApi } from "@/services/api/uploads";
import { usersApi } from "@/services/api/users";

const OUTPUT_SIZE = 512;

interface UseAvatarUploadOptions {
  onSuccess?: (publicUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useAvatarUpload(options?: UseAvatarUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUpload = useCallback(async () => {
    try {
      // Open gallery with circular crop overlay (saves as square 1:1)
      const image = await ImageCropPicker.openPicker({
        width: OUTPUT_SIZE,
        height: OUTPUT_SIZE,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: "photo",
        compressImageQuality: 1,
      });

      setIsUploading(true);

      // Resize and compress
      const manipulated = await manipulateAsync(
        image.path,
        [{ resize: { width: OUTPUT_SIZE, height: OUTPUT_SIZE } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // Get presigned URL from backend
      const contentType = "image/jpeg" as const;
      const { data } = await uploadsApi.getPresignedUrl({
        folder: "avatars",
        contentType,
      });

      // Upload directly to S3
      await uploadsApi.uploadToS3(data.uploadUrl, manipulated.uri, contentType);

      // Update user profile with the new avatar URL
      await usersApi.updateMe({ avatarUrl: data.publicUrl });

      options?.onSuccess?.(data.publicUrl);
    } catch (error: unknown) {
      // User cancelled the picker
      const err = error as { code?: string };
      if (err.code === "E_PICKER_CANCELLED") return;

      options?.onError?.(
        error instanceof Error ? error : new Error("Upload failed")
      );
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  return { pickAndUpload, isUploading };
}
