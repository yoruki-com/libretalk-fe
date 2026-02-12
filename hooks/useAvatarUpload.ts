import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { uploadsApi } from "@/services/api/uploads";
import { usersApi } from "@/services/api/users";
import { setAvatarCropCallback } from "@/lib/avatar-crop-callback";

interface UseAvatarUploadOptions {
  onSuccess?: (publicUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useAvatarUpload(options?: UseAvatarUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const pickAndUpload = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      options?.onError?.(new Error("Permission to access photos was denied"));
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]) return;

    const sourceUri = pickerResult.assets[0].uri;

    setAvatarCropCallback(async (croppedUri: string) => {
      setIsUploading(true);
      try {
        const contentType = "image/jpeg" as const;
        const { data } = await uploadsApi.getPresignedUrl({
          folder: "avatars",
          contentType,
        });

        await uploadsApi.uploadToS3(data.uploadUrl, croppedUri, contentType);

        await usersApi.updateMe({ avatarUrl: data.publicUrl });

        options?.onSuccess?.(data.publicUrl);
      } catch (error) {
        options?.onError?.(
          error instanceof Error ? error : new Error("Upload failed")
        );
      } finally {
        setIsUploading(false);
      }
    });

    router.push({
      pathname: "/profile/crop-avatar",
      params: { uri: sourceUri },
    } as never);
  }, [router, options]);

  return { pickAndUpload, isUploading };
}
