export default interface RawProfile {
  following: number;
  default_post_format: 'html' | 'markdown' | 'raw';
  name: string;
  likes: number;
  blogs: [
    {
      name: string;
      title: string;
      url: string;
      tweet?: 'auto' | 'Y' | 'N';
      facebook?: 'Y' | 'N';
      primary: true;
      followers: number;
      type?: 'public' | 'private';
    }
  ];
};
