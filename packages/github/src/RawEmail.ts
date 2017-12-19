export default interface RawEmail {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: 'public' | 'private';
};
