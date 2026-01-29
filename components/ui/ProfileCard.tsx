import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileCardProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  contactsCount?: number;
  onQRPress?: () => void;
  onContactsPress?: () => void;
}

export function ProfileCard({
  name,
  subtitle,
  avatar,
  contactsCount = 0,
  onQRPress,
  onContactsPress,
}: ProfileCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-white">
      {/* Profile Info */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center gap-4">
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              className="h-14 w-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-full bg-gray4">
              <Ionicons name="person" size={24} color="#131313" />
            </View>
          )}
          <View>
            <Text className="font-sans-semibold text-[14px] capitalize leading-5 text-dark">
              {name}
            </Text>
            {subtitle && (
              <Text className="font-sans text-[12px] leading-[15px] tracking-tight text-gray">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <Pressable onPress={onQRPress} className="active:opacity-70">
          <Ionicons name="qr-code" size={24} color="#131313" />
        </Pressable>
      </View>

      {/* Divider */}
      <View className="h-px bg-border" />

      {/* Contacts */}
      <Pressable
        onPress={onContactsPress}
        className="flex-row items-center gap-2 p-4 active:bg-light"
      >
        <Ionicons name="people" size={24} color="#131313" />
        <Text className="flex-1 font-sans text-[13px] leading-[17px] text-dark">
          {contactsCount} Contacts
        </Text>
        <Ionicons name="chevron-forward" size={12} color="#A8A8A8" />
      </Pressable>
    </View>
  );
}
