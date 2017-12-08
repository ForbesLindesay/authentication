// const map: {readonly [key: string]: void | string | ReadonlyArray<string>} = {
//   id: 'id',
//   username: 'username',
//   displayName: 'name',
//   name: ['last_name', 'first_name', 'middle_name'],
//   gender: 'gender',
//   birthday: 'birthday',
//   profileUrl: 'link',
//   emails: 'email',
//   photos: 'picture',
// };
export default function convertProfileFields(profileFields: Set<string>) {
  const fields: string[] = [];

  profileFields.forEach(f => fields.push(f));

  return fields.join(',');
}
