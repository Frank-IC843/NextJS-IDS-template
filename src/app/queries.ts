import { gql } from "@apollo/client";

const BUSINESS_IMAGE_FRAGMENT = gql`
  fragment BusinessImageFragment on Image {
    url
    templateUrl
    altText
  }
`;

export const BUSINESS_LAYOUT_QUERY = gql`
  query BusinessLayout($category: String, $isReferral: Boolean) {
    viewLayout {
      business(category: $category, isReferral: $isReferral) {
        auth {
          landingAuthVariant
        }
        head {
          titleString
          descriptionString
        }
        businessOffer {
          ctaString
          ctaStartShoppingString
          offerDetailString
          offerImage {
            ...BusinessImageFragment
          }
          offerTitleString
          offerDetailTermsString
        }
        businessInfo {
          ctaString
          descriptionString
          headlineString
        }
        businessFeatures {
          businessFeatures {
            id
            titleString
            descriptionString
            businessFeatureImage {
              ...BusinessImageFragment
            }
          }
          ctaTextString
          ctaFollowString
          disclaimerString
          disclaimerRestrictionsString
          disclaimerAppleString
          disclaimerV2Line2String
          headlineString
          subheadlineString
          headlineAvailableNowString
          headlineComingSoonString
          promo200HeadlineString
          promo200DetailsStringFormatted {
            id
            sections {
              content
              name
              id
            }
          }
          promo250HeadlineString
          promo250DetailsStringFormatted {
            id
            sections {
              content
              name
              id
            }
          }
        }
        retailersList {
          headerString
          subheaderString
        }
        localFavorites {
          headerString
        }
        heroContent {
          heroTitleString
          logoAltTextString
          businessLogoImage {
            ...BusinessImageFragment
          }
        }
        testimonials {
          headlineString
          testimonials {
            id
            headlineString
            contentString
            attributionString
            organizationString
            testimonialSourceVariant
            logoImage {
              ...BusinessImageFragment
            }
          }
        }
        valueProps {
          titleString
          subtitleString
          restaurantVoiceOfCustomerUrlString
          valueProps {
            ctaString
            titleString
            descriptionString
            valuePropVariant
            valuePropImage {
              ...BusinessImageFragment
            }
          }
        }
        partners {
          partners {
            titleString
            descriptionString
            linkTextString
            linkUrlString
            logoImage {
              url
              templateUrl
              altText
            }
          }
        }
        faqs {
          id
          headerString
          faqLists {
            id
            questionString
            answerStringFormatted {
              id
              sections {
                id
                content
                name
              }
            }
          }
        }
        contactSupport {
          headlineString
          taglineString
          ctaString
          ctaContactUsString
          ctaContactUsUrlString
        }
        businessUpsell {
          titleString
          descriptionString
          primaryCtaString
          secondaryCtaString
          primaryCtaUrlString
          secondaryCtaUrlString
          upsellImage {
            ...BusinessImageFragment
          }
        }
        businessComparison {
          titleString
          subtitleString
          desktopImage {
            ...BusinessImageFragment
          }
          mobileImage {
            ...BusinessImageFragment
          }
        }
        orderedList {
          titleString
          subtitleString
          listItems {
            id
            titleString
            descriptionString
          }
        }
      }
    }
  }
  ${BUSINESS_IMAGE_FRAGMENT}
`;
