const SIGNS: [number, number, string][] = [
  [1, 20, "capricorn"],
  [2, 19, "aquarius"],
  [3, 20, "pisces"],
  [4, 20, "aries"],
  [5, 21, "taurus"],
  [6, 21, "gemini"],
  [7, 22, "cancer"],
  [8, 23, "leo"],
  [9, 23, "virgo"],
  [10, 23, "libra"],
  [11, 22, "scorpio"],
  [12, 22, "sagittarius"],
];

export function getZodiacSign(dateStr: string, t: (key: string) => string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (let i = 0; i < SIGNS.length; i++) {
    const [m, d] = SIGNS[i];
    if (month === m && day <= d) return t(`editProfile.zodiac_${SIGNS[i][2]}`);
    if (month === m && day > d)
      return t(`editProfile.zodiac_${SIGNS[(i + 1) % 12][2]}`);
  }
  return t("editProfile.zodiac_capricorn");
}
