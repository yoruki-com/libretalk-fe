import { useTheme } from "@/contexts/ThemeContext";
import { searchCities, type CitySuggestion } from "@/services/mapbox";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const DEBOUNCE_MS = 400;

interface CityPickerProps {
  value: string;
  onSelect: (city: string) => void;
  placeholder?: string;
}

export function CityPicker({ value, onSelect, placeholder }: CityPickerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCities = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchCities(text);
      setSuggestions(results);
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
    debounceRef.current = setTimeout(() => fetchCities(text), DEBOUNCE_MS);
  };

  const handleSelect = (suggestion: CitySuggestion) => {
    const display = suggestion.country
      ? `${suggestion.name}, ${suggestion.country}`
      : suggestion.name;
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

  const getSubtitle = (suggestion: CitySuggestion) => {
    const parts: string[] = [];
    if (suggestion.region) parts.push(suggestion.region);
    if (suggestion.country) parts.push(suggestion.country);
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
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.textTertiary}
            />
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
          {suggestions.map((suggestion, index) => {
            const subtitle = getSubtitle(suggestion);
            return (
              <Pressable
                key={suggestion.id}
                onPress={() => handleSelect(suggestion)}
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
                    {suggestion.name}
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

      {showSuggestions &&
        suggestions.length === 0 &&
        !isLoading &&
        query.trim().length >= 2 && (
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
