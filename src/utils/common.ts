export const shortenAddress = (address: string) => {
  if (!address) {
    return '-';
  }
  return address.slice(0, 7) + '...' + address.slice(-10);
};
