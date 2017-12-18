export interface Image {
  url: string;
  /**
   * If the image does not accept a `sizeParameter`, this represents the size of
   * the image.
   */
  size?: number;
  /**
   * If there is a size parameter, it can be provided as a query string argument
   * to request the image at a specific size.
   */
  sizeParameter?: string;
}
export interface Name {
  formatted?: string;
  familyName?: string;
  givenName?: string;
  middleName?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
}

/**
 * Adapted from https://developers.google.com/+/web/api/rest/latest/people#resource
 */
export default interface Profile {
  provider: string;
  id: string | number;
  displayName: string;
  userName?: string;
  emails: {
    value: string;
    type?: string;
  }[];
  images: Image[];
  image?: Image;
  name?: {
    formatted?: string;
    familyName?: string;
    givenName?: string;
    middleName?: string;
    honorificPrefix?: string;
    honorificSuffix?: string;
  };
  nickname?: string;
  occupation?: string;
  skills?: string;
  birthday?: string;
  gender?: string;
  urls?: {
    value?: string;
    type?: string;
    label?: string;
  }[];
  objectType?: string;
  tagline?: string;
  braggingRights?: string;
  aboutMe?: string;
  relationshipStatus?: string;
  url?: string;
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
