export default interface RawProfile {
  contributors_enabled: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  email?: string;
  entities: {
    url: {
      urls: [
        {
          url: string;
          expanded_url: string;
          display_url: string;
          indices: [number, number];
        }
      ];
    };
    description: {
      urls: [
        {
          url: string;
          expanded_url: string;
          display_url: string;
          indices: [number, number];
        },
        {
          url: string;
          expanded_url: string;
          display_url: string;
          indices: [number, number];
        }
      ];
    };
  };
  favourites_count: number;
  follow_request_sent: any;
  followers_count: number;
  following: any;
  friends_count: number;
  geo_enabled: true;
  id: number;
  id_str: string;
  is_translator: boolean;
  lang: string;
  listed_count: number;
  location: string;
  name: string;
  notifications: any;
  profile_background_color: string;
  profile_background_image_url: string;
  profile_background_image_url_https: string;
  profile_background_tile: true;
  profile_image_url: string;
  profile_image_url_https: string;
  profile_link_color: string;
  profile_sidebar_border_color: string;
  profile_sidebar_fill_color: string;
  profile_text_color: string;
  profile_use_background_image: true;
  protected: boolean;
  screen_name: string;
  show_all_inline_media: true;
  status: {
    contributors: any;
    coordinates: {
      coordinates: [number, number];
      type: string;
    };
    created_at: string;
    favorited: boolean;
    geo: {
      coordinates: [number, number];
      type: string;
    };
    id: number;
    id_str: string;
    in_reply_to_screen_name: string;
    in_reply_to_status_id: number;
    in_reply_to_status_id_str: string;
    in_reply_to_user_id: number;
    in_reply_to_user_id_str: string;
    place: {
      attributes: {};
      bounding_box: {
        coordinates: [
          [
            [number, number],
            [number, number],
            [number, number],
            [number, number]
          ]
        ];
        type: string;
      };
      country: string;
      country_code: string;
      full_name: string;
      id: string;
      name: string;
      place_type: string;
      url: string;
    };
    retweet_count: number;
    retweeted: boolean;
    source: string;
    text: string;
    truncated: boolean;
  };
  statuses_count: number;
  time_zone: string;
  url: any;
  utc_offset: number;
  verified: boolean;
};
