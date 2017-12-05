/**
 * See https://developers.google.com/+/web/api/rest/latest/people#resource
 */
export default interface RawGoogleProfile {
  // kind?: 'plus#person';
  // etag?: string;
  nickname?: string;
  occupation?: string;
  skills?: string;
  birthday?: string;
  gender?: string;
  emails?: {
    value: string;
    type?: string;
  }[];
  urls?: {
    value?: string;
    type?: string;
    label?: string;
  }[];
  objectType?: string;
  id: string;
  displayName: string;
  name?: {
    formatted?: string;
    familyName?: string;
    givenName?: string;
    middleName?: string;
    honorificPrefix?: string;
    honorificSuffix?: string;
  };
  tagline?: string;
  braggingRights?: string;
  aboutMe?: string;
  relationshipStatus?: string;
  url?: string;
  image?: {
    /**
     * The URL of the person's profile photo. To resize the image and crop it to a square, append the query string ?sz=x, where x is the dimension in pixels of each side.
     */
    url?: string;
  };
  organizations?: {
    name?: string;
    department?: string;
    title?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    description?: string;
    primary?: boolean;
  }[];
  placesLived?: {
    value?: string;
    primary?: boolean;
  }[];
  isPlusUser?: boolean;
  language?: string;
  ageRange?: {
    min?: number;
    max?: number;
  };
  plusOneCount?: number;
  circledByCount?: number;
  verified?: boolean;
  cover?: {
    layout?: string;
    coverPhoto?: {
      url?: string;
      height?: number;
      width?: number;
    };
    coverInfo?: {
      topImageOffset?: number;
      leftImageOffset?: number;
    };
  };
  domain?: string;
};
