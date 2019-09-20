import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Image
} from "react-native";
import { Transition } from "react-navigation-fluid-transitions";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { useDimensions, Colors, isTablet, isIphoneXorAbove } from "common";

type DisplayProps = {
  onImagePress: () => void;
  imagePressDisabled: boolean;
  renderHeader: () => JSX.Element;
  imageSource: string;
  imageSmall?: boolean;
  transition?: boolean;
  cards: Card[];
};

type Card = {
  cardStyle?: ViewStyle;
  renderContent: () => JSX.Element;
};

function Display({
  onImagePress,
  imagePressDisabled,
  renderHeader,
  imageSource,
  imageSmall = false,
  transition = false,
  cards
}: DisplayProps) {
  const { dimensions, heightToDP } = useDimensions();

  const bottomTabPadding = isIphoneXorAbove() ? 80 : 48;

  const styles = StyleSheet.create({
    imageHeader: {
      width: dimensions.width,
      height: heightToDP("100%") - bottomTabPadding
    },
    imageHeaderSmall: {
      height: isTablet() ? dimensions.width / 1.5 : dimensions.width,
      width: dimensions.width
    },
    singleCardContainer: {
      position: "absolute",
      bottom: 0,
      padding: 15,
      width: "100%",
      backgroundColor: "transparent"
    },
    cardContainer: {
      position: "absolute",
      bottom: 0,
      paddingBottom: 15,
      width: dimensions.width,
      backgroundColor: "transparent"
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 25,
      width: cards.length > 1 ? dimensions.width - 50 : "100%",
      height: heightToDP("50%"),
      marginLeft: cards.length > 1 ? 15 : 0,
      borderWidth: 1,
      borderColor: Colors.gray
    }
  });

  function renderCards() {
    return cards.map((card, index) => {
      return (
        <View
          key={index}
          style={[
            styles.card,
            card.cardStyle,
            { marginRight: index === cards.length - 1 ? 15 : 0 }
          ]}
        >
          {card.renderContent()}
        </View>
      );
    });
  }

  function DisplayContainer({ children }) {
    if (transition) {
      return <Transition shared={imageSource}>{children}</Transition>;
    } else {
      return <View>{children}</View>;
    }
  }

  function renderImageHeader() {
    if (imageSource) {
      return (
        <CacheImage
          {...{
            preview: { uri: imageSource },
            uri: imageSource
          }}
          style={imageSmall ? styles.imageHeaderSmall : styles.imageHeader}
        />
      );
    } else {
      return (
        <Image
          style={imageSmall ? styles.imageHeaderSmall : styles.imageHeader}
          source={require("assets/images/potluck_default.png")}
        />
      );
    }
  }

  function renderCardSection() {
    if (transition) {
      return (
        <Transition anchor={imageSource} appear="bottom">
          {cards.length > 1 ? (
            <ScrollView
              horizontal
              pagingEnabled
              style={imageSmall ? { marginTop: -100 } : styles.cardContainer}
              showsHorizontalScrollIndicator={false}
            >
              {renderCards()}
            </ScrollView>
          ) : (
            <View style={styles.singleCardContainer}>{renderCards()}</View>
          )}
        </Transition>
      );
    } else {
      return cards.length > 1 ? (
        <ScrollView
          horizontal
          pagingEnabled
          style={imageSmall ? { marginTop: -100 } : styles.cardContainer}
          showsHorizontalScrollIndicator={false}
        >
          {renderCards()}
        </ScrollView>
      ) : (
        <View style={styles.singleCardContainer}>{renderCards()}</View>
      );
    }
  }

  function renderContent() {
    if (imageSmall) {
      return (
        <View style={{ backgroundColor: Colors.gray, paddingBottom: 10 }}>
          <TouchableOpacity
            onPress={onImagePress}
            activeOpacity={0.8}
            disabled={imagePressDisabled}
          >
            {renderImageHeader()}

            {renderHeader()}
          </TouchableOpacity>

          {renderCardSection()}
        </View>
      );
    } else {
      return (
        <View>
          <TouchableOpacity
            onPress={onImagePress}
            activeOpacity={0.8}
            disabled={imagePressDisabled}
          >
            {renderImageHeader()}
          </TouchableOpacity>

          {renderHeader()}

          {renderCardSection()}
        </View>
      );
    }
  }

  return <DisplayContainer>{renderContent()}</DisplayContainer>;
}

export default Display;
