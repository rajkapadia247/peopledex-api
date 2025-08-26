export const filterContacts = (contacts, searchTerm, filterFavoritesOnly) => {
  if (!searchTerm || searchTerm.trim() === "") {
    return filterFavoritesOnly
      ? contacts.filter((contact) => contact.favorite)
      : contacts;
  }

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  return contacts.filter((contact) => {
    const matchesSearchTerm =
      contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      contact.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      contact.phone.toLowerCase().includes(lowerCaseSearchTerm) ||
      contact.company.toLowerCase().includes(lowerCaseSearchTerm);

    return filterFavoritesOnly
      ? matchesSearchTerm && contact.favorite
      : matchesSearchTerm;
  });
};

export const getColorByName = (name) => {
  const colors = [
    "avatar-blue",
    "avatar-violet",
    "avatar-red",
    "avatar-teal",
    "avatar-cyan",
    "avatar-green",
    "avatar-orange",
    "avatar-grape",
    "avatar-indigo",
    "avatar-pink",
  ];
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % colors.length;
  return colors[index];
};
