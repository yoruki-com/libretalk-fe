import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ImageItem {
  uri: string;
}

interface FileAttachment {
  name: string;
  size: string;
  type: string;
}

interface MessageBubbleProps {
  message?: string;
  time: string;
  isMe: boolean;
  isRead?: boolean;
  images?: ImageItem[];
  file?: FileAttachment;
}

export function MessageBubble({
  message,
  time,
  isMe,
  isRead = false,
  images,
  file,
}: MessageBubbleProps) {
  return (
    <View className={`flex-col ${isMe ? "items-end" : "items-start"}`}>
      <View
        className={`flex-col gap-2 ${isMe ? "items-end" : "items-start"} ${
          isMe ? "max-w-[222px]" : "max-w-[297px]"
        }`}
      >
        {/* Time and read status */}
        <View className="flex-row items-center gap-2">
          <Text className="font-sans text-[12px] leading-[15px] tracking-tight text-dark opacity-50">
            {time}
          </Text>
          {isMe && isRead && (
            <Ionicons name="checkmark-done" size={12} color="#53C92C" />
          )}
          {isMe && !isRead && (
            <Ionicons
              name="checkmark-done"
              size={12}
              color="#131313"
              style={{ opacity: 0.5 }}
            />
          )}
        </View>

        {/* Message content */}
        <View
          className={`p-3 shadow-sm ${
            isMe
              ? "rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl bg-primary-30"
              : "rounded-bl-2xl rounded-br-2xl rounded-tr-2xl bg-white"
          }`}
        >
          {/* Images grid */}
          {images && images.length > 0 && (
            <View className="mb-2 flex-row gap-2">
              <View className="h-[148px] flex-1 rounded-lg bg-gray4" />
              {images.length > 1 && (
                <View className="flex-1 gap-2">
                  <View className="flex-1 rounded-lg bg-gray4" />
                  {images.length > 2 && (
                    <View className="flex-1 rounded-lg bg-gray4" />
                  )}
                </View>
              )}
            </View>
          )}

          {/* File attachment */}
          {file && (
            <View className="mb-2">
              <View className="flex-row items-center gap-2.5 rounded-lg bg-primary p-3">
                <Ionicons name="document" size={12} color="#F5F5F5" />
                <Text className="flex-1 font-sans text-[12px] leading-[15px] tracking-tight text-light">
                  {file.name}
                </Text>
                <Ionicons name="download-outline" size={12} color="#F5F5F5" />
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="font-sans text-[11px] font-medium text-dark">
                  Document File
                </Text>
                <Text className="font-sans text-[12px] leading-[15px] tracking-tight text-dark opacity-50">
                  {file.size}
                </Text>
              </View>
            </View>
          )}

          {/* Text message */}
          {message && (
            <Text className="font-sans text-[12px] leading-[15px] tracking-tight text-dark">
              {message}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
