import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  TouchableWithoutFeedback,
  type LayoutRectangle,
} from "react-native";

export interface DropdownMenuItem {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  triggerSize?: number;
  triggerIcon?: keyof typeof Ionicons.glyphMap;
  triggerColor?: string;
}

export function DropdownMenu({
  items,
  triggerSize = 20,
  triggerIcon = "ellipsis-horizontal",
  triggerColor,
}: DropdownMenuProps) {
  const { theme, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<View>(null);

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        top: y + height + 4,
        right: 16,
      });
      setVisible(true);
    });
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleItemPress = (item: DropdownMenuItem) => {
    handleClose();
    item.onPress();
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={handleOpen}
        className="p-2 active:opacity-70"
      >
        <Ionicons
          name={triggerIcon}
          size={triggerSize}
          color={triggerColor ?? theme.iconSecondary}
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1">
            <View
              className="absolute min-w-[160px] overflow-hidden rounded-xl"
              style={{
                top: menuPosition.top,
                right: menuPosition.right,
                backgroundColor: theme.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 12,
                elevation: 8,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              {items.map((item, index) => (
                <Pressable
                  key={item.key}
                  onPress={() => handleItemPress(item)}
                  className="flex-row items-center gap-3 px-4 py-3 active:opacity-70"
                  style={{
                    backgroundColor: theme.card,
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: theme.border,
                  }}
                >
                  {item.icon && (
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.destructive ? theme.error : theme.text}
                    />
                  )}
                  <Text
                    className="font-sans text-[14px]"
                    style={{
                      color: item.destructive ? theme.error : theme.text,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
