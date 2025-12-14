// /src/common/Theme.js
import Colors from "./Colors";

const Theme = (mode = "light") => {
  const color = Colors[mode];

  return {
    mode,
    colors: color,

    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

    radius: { sm: 6, md: 10, lg: 16, pill: 50 },

    typography: {
      h1: {
        fontSize: 32,
        fontWeight: "700",
        fontFamily: "Montserrat_700Bold",
      },
      h2: {
        fontSize: 24,
        fontWeight: "700",
        fontFamily: "Montserrat_700Bold",
      },
      h3: {
        fontSize: 20,
        fontWeight: "600",
        fontFamily: "Montserrat_600SemiBold",
      },
      body: {
        fontSize: 16,
        fontWeight: "400",
        fontFamily: "Montserrat_400Regular",
      },
      caption: {
        fontSize: 13,
        fontWeight: "400",
        fontFamily: "Montserrat_400Regular",
      },
      bodyMedium: {
        fontSize: 16,
        fontWeight: "500",
        fontFamily: "Montserrat_500Medium",
      },
      bodySemiBold: {
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Montserrat_600SemiBold",
      },
    },

    iconSizes: { sm: 16, md: 20, lg: 26, xl: 32 },

    shadow: {
      card: {
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      floating: {
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
    },
  };
};

export default Theme;
