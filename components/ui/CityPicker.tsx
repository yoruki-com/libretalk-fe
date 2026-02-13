import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
const DEBOUNCE_MS = 400;

interface GeocodingFeature {
  id: string;
  properties: {
    name: string;
    full_address?: string;
    context?: {
      region?: { name: string };
      country?: { name: string };
    };
  };
}

interface CityPickerProps {
  value: string;
  onSelect: (city: string) => void;
  placeholder?: string;
}

export function CityPicker({ value, onSelect, placeholder }: CityPickerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCities = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: text.trim(),
        types: "place",
        limit: "5",
        language: "en",
        access_token: MAPBOX_TOKEN ?? "",
      });
      const res = await fetch(
        `https://api.mapbox.com/search/geocode/v6/forward?${params}`,
      );
      const data = await res.json();
      setSuggestions(data.features ?? []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(text), DEBOUNCE_MS);
  };

  const handleSelect = (feature: GeocodingFeature) => {
    const city = feature.properties.name;
    const country = feature.properties.context?.country?.name;
    const display = country ? `${city}, ${country}` : city;
    setQuery(display);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(display);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect("");
  };

  const getSubtitle = (feature: GeocodingFeature) => {
    const parts: string[] = [];
    if (feature.properties.context?.region?.name) {
      parts.push(feature.properties.context.region.name);
    }
    if (feature.properties.context?.country?.name) {
      parts.push(feature.properties.context.country.name);
    }
    return parts.join(", ");
  };

  return (
    <View>
      <View
        className="flex-row items-center rounded-2xl px-4 py-3"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.textTertiary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder ?? t("onboarding.citySearchPlaceholder")}
          placeholderTextColor={theme.textTertiary}
          className="flex-1 font-sans text-[16px]"
          style={{ color: theme.text, padding: 0 }}
          maxLength={100}
          autoCorrect={false}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={theme.textTertiary} />
        )}
        {!isLoading && query.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
          </Pressable>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View
          className="mt-1 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          {suggestions.map((feature, index) => {
            const subtitle = getSubtitle(feature);
            return (
              <Pressable
                key={feature.id}
                onPress={() => handleSelect(feature)}
                className="flex-row items-center px-4 py-3 active:opacity-70"
                style={{
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: theme.border,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={theme.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <View className="flex-1">
                  <Text
                    className="font-sans-semibold text-[15px]"
                    style={{ color: theme.text }}
                  >
                    {feature.properties.name}
                  </Text>
                  {subtitle ? (
                    <Text
                      className="font-sans text-[13px]"
                      style={{ color: theme.textSecondary }}
                    >
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && query.trim().length >= 2 && (
        <View
          className="mt-1 items-center rounded-2xl px-4 py-3"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            className="font-sans text-[14px]"
            style={{ color: theme.textSecondary }}
          >
            {t("onboarding.noCity")}
          </Text>
        </View>
      )}
    </View>
  );
}
