import { callAvatarCropCallback, clearAvatarCropCallback } from "@/lib/avatar-crop-callback";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Defs, Mask, Rect, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CROP_SIZE = SCREEN_WIDTH - 64;
const OUTPUT_SIZE = 512;

export default function CropAvatarScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Gesture values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Get original image dimensions
  useEffect(() => {
    if (!uri) return;
    RNImage.getSize(
      uri,
      (width, height) => setImageSize({ width, height }),
      () => console.error("Failed to get image size")
    );
  }, [uri]);

  // Calculate display size (fit image so the shortest side fills the crop circle)
  const aspectRatio = imageSize.width / (imageSize.height || 1);
  let displayWidth: number;
  let displayHeight: number;

  if (aspectRatio >= 1) {
    // Landscape or square: height fills crop size
    displayHeight = CROP_SIZE;
    displayWidth = CROP_SIZE * aspectRatio;
  } else {
    // Portrait: width fills crop size
    displayWidth = CROP_SIZE;
    displayHeight = CROP_SIZE / aspectRatio;
  }

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 5) {
        scale.value = withSpring(5);
        savedScale.value = 5;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Circle center is at the center of the screen content area
  const headerHeight = insets.top + 56;
  const footerHeight = 80 + insets.bottom;
  const contentHeight = Dimensions.get("window").height - headerHeight - footerHeight;
  const circleCenterY = contentHeight / 2;

  const handleCancel = () => {
    clearAvatarCropCallback();
    router.back();
  };

  const processCrop = async (
    tx: number,
    ty: number,
    s: number
  ) => {
    if (!uri || isProcessing) return;
    setIsProcessing(true);
    try {
      // The image is displayed at displayWidth x displayHeight, scaled by `s`
      // The crop circle (CROP_SIZE) is centered on screen.
      // We need to find which region of the original image is visible in the crop circle.

      const scaledDisplayWidth = displayWidth * s;
      const scaledDisplayHeight = displayHeight * s;

      // The image center is at the circle center + translation offsets
      // Crop circle top-left in image-display coords (relative to scaled image center):
      const cropLeftInDisplay = -tx - CROP_SIZE / 2;
      const cropTopInDisplay = -ty - CROP_SIZE / 2;

      // Convert to fraction of scaled display image
      const imgLeft = (scaledDisplayWidth / 2 + cropLeftInDisplay) / scaledDisplayWidth;
      const imgTop = (scaledDisplayHeight / 2 + cropTopInDisplay) / scaledDisplayHeight;
      const cropFraction = CROP_SIZE / scaledDisplayWidth;
      const cropFractionH = CROP_SIZE / scaledDisplayHeight;

      // Convert to original image pixels
      const originX = Math.max(0, Math.round(imgLeft * imageSize.width));
      const originY = Math.max(0, Math.round(imgTop * imageSize.height));
      const cropWidth = Math.min(
        Math.round(cropFraction * imageSize.width),
        imageSize.width - originX
      );
      const cropHeight = Math.min(
        Math.round(cropFractionH * imageSize.height),
        imageSize.height - originY
      );

      // Use the smallest dimension to make a square crop
      const squareSize = Math.min(cropWidth, cropHeight);

      const result = await manipulateAsync(
        uri,
        [
          {
            crop: {
              originX,
              originY,
              width: squareSize,
              height: squareSize,
            },
          },
          { resize: { width: OUTPUT_SIZE, height: OUTPUT_SIZE } },
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      callAvatarCropCallback(result.uri);
      router.back();
    } catch (error) {
      console.error("Image crop failed:", error);
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    "worklet";
    runOnJS(processCrop)(translateX.value, translateY.value, scale.value);
  };

  if (!uri) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <Text style={{ color: theme.textSecondary }}>No image provided</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 8, height: headerHeight }}
      >
        <Pressable onPress={handleCancel} className="active:opacity-70">
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <Text className="font-sans-semibold text-[17px] text-white">
          Crop Photo
        </Text>
        <Pressable
          onPress={handleDone}
          disabled={isProcessing}
          className="active:opacity-70"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark" size={28} color={theme.primary} />
          )}
        </Pressable>
      </View>

      {/* Image + Crop Area */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[{ width: displayWidth, height: displayHeight }, animatedStyle]}>
            <RNImage
              source={{ uri }}
              style={{ width: displayWidth, height: displayHeight }}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>

        {/* Circular mask overlay */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <Mask id="circleMask">
                <Rect width="100%" height="100%" fill="white" />
                <Circle
                  cx={SCREEN_WIDTH / 2}
                  cy={circleCenterY}
                  r={CROP_SIZE / 2}
                  fill="black"
                />
              </Mask>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.65)"
              mask="url(#circleMask)"
            />
            <Circle
              cx={SCREEN_WIDTH / 2}
              cy={circleCenterY}
              r={CROP_SIZE / 2}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
            />
          </Svg>
        </View>
      </View>

      {/* Footer */}
      <View
        className="items-center justify-center"
        style={{ height: footerHeight, paddingBottom: insets.bottom }}
      >
        <Text className="font-sans text-[13px] text-white/60">
          Pinch to zoom, drag to position
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}
