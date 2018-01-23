import Stripe = require('stripe');
import {Profile, Image} from '@authentication/types';

export default function parseProfile(
  id: string,
  json: Stripe.accounts.IAccount,
): Profile {
  const emails: {
    value: string;
    type?: string;
  }[] = [];
  if (json.email) {
    emails.push({value: json.email, type: 'primary'});
  }
  if (json.support_email) {
    emails.push({value: json.support_email, type: 'support'});
  }
  const images: Image[] = [];
  if (json.business_logo) {
    images.push({
      url: json.business_logo,
    });
  }
  return {
    provider: 'stripe',
    id,
    displayName: json.display_name,
    emails,
    images,
    image: images[0],
  };
}
