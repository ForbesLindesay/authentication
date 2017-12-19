export default function convertProfileFields(profileFields: Set<string>) {
  const fields: string[] = [];

  profileFields.forEach(f => fields.push(f));

  return fields.join(',');
}
