---
title: Profile
---

Authentication providers always return a `profile` after the user has been authenticated. This profile is in a normalized form so that you can handle it in a consistent way within your application. It is loosely based on the [Google+ People](https://developers.google.com/+/web/api/rest/latest/people#resource) format.

If you are using TypeScript you can import the `Profile` interface as:

```typescript
import {Profile} from '@authentication/types';
```

## Fields

* `provider` (required, `string`) - a string identifying the provider used to authenticate the user. e.g. `'google'` or `'facebook'`.
* `id` (required, `string | number`) - combined with the `provider`, this represents a unique identifier you can use to identify the user.
* `displayName` (required, `string`) - a string you can use as a sensible default display name. This will generally be the user's full name if possible, or a username. There is no guarantee it is unique.
* `emails` (required, `Array<{value: string, type?: string}>`) - an array of emails associated with the user, along with a `type`, which can indicate whether the e-mail is personal, work, etc.
* `userName` (optional, `string`) - if the user has a username on the service used to authenticate you, it will be provided here.
* `images` (required, `Image[]`) - an array containing one or more profile image for the user.
* `image` (optional, `Image`) - the first image in `images`. If you don't care about size, this is generally the best default image.
* `name` (required, `Name`) - the user's name. Although the `name` object is required, all the fields within are optional.
* `nickname` (optional, `string`)
* `occupation` (optional, `string`)
* `birthday` (optional, `string`) - the user's birthday in ISO8601 form (i.e. `yyyy-mm-dd`).
* `gender` (optional, `string`) - N.B. this can be any arbitrary string

## Image

An image has a `url` for the original image, and may also have either a `size` or a `sizeParameter`.

* `url` (required, `string`) - the fully qualified URL of the image.
* `size` (optional, `numnber`) - the width/height of the image in pixels. This can be used tos elect an appropriate image from the `images` array. If possible, a `sizeParameter` gives greater control, but not all providers offer this feature.
* `sizeParameter` (optional, `string`) - If there is a size parameter, it can be provided as a query string argument to request the image at a specific size.

Example Usage:

```typescript
import {URL} from 'url';
import {Image} from '@authentication/types';

export function getImageSize(images: Image[], size: number): URL | null {
  if (images.length === 0) {
    return null;
  }
  for (const image of images) {
    if (image.sizeParameter) {
      const url = new URL(image.url);
      url.searchParams.set(image.sizeParameter, '' + size);
      return url;
    }
  }
  let bestImage = images[0];
  for (const image of images.slice(1)) {
    if (!bestImage.size && image.size) {
      bestImage = image;
    }
    if (
      bestImage.size &&
      image.size &&
      Math.abs(size - bestImage.size) > Math.abs(size - image.size)
    ) {
      bestImage = image;
    }
  }
  return new URL(bestImage.url);
}
```

```javascript
import {URL} from 'url';

export function getImageSize(images, size) {
  if (images.length === 0) {
    return null;
  }
  for (const image of images) {
    if (image.sizeParameter) {
      const url = new URL(image.url);
      url.searchParams.set(image.sizeParameter, '' + size);
      return url;
    }
  }
  let bestImage = images[0];
  for (const image of images.slice(1)) {
    if (!bestImage.size && image.size) {
      bestImage = image;
    }
    if (
      bestImage.size &&
      image.size &&
      Math.abs(size - bestImage.size) > Math.abs(size - image.size)
    ) {
      bestImage = image;
    }
  }
  return new URL(bestImage.url);
}
```

## Name

An object representing the user's name.

* `formatted` (optional, `string`) - The user's name as it should generally be displayed.
* `familyName` (optional, `string`) - The user's family name/surname/last name.
* `givenName` (optional, `string`) - The user's given name/first name.
* `middleName` (optional, `string`) - The user's middle name/middle names. If there are multiple middle names, they will be separated by a space.
* `honorificPrefix` (optional, `string`)
* `honorificSuffix` (optional, `string`)
