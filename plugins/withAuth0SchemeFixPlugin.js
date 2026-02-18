const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Removes the "libretalk" scheme from MainActivity's intent-filter
 * to avoid the Android chooser dialog when Auth0 redirects back.
 * The Auth0 RedirectActivity will be the only handler for "libretalk://" URLs.
 */
function withAuth0SchemeFix(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    if (!application?.activity) return config;

    const mainActivity = application.activity.find(
      (activity) =>
        activity.$?.["android:name"] === ".MainActivity"
    );
    if (!mainActivity?.["intent-filter"]) return config;

    for (const intentFilter of mainActivity["intent-filter"]) {
      const categories = intentFilter.category ?? [];
      const isBrowsable = categories.some(
        (cat) => cat.$?.["android:name"] === "android.intent.category.BROWSABLE"
      );
      if (!isBrowsable || !intentFilter.data) continue;

      intentFilter.data = intentFilter.data.filter(
        (data) => data.$?.["android:scheme"] !== "libretalk"
      );
    }

    return config;
  });
}

module.exports = withAuth0SchemeFix;
