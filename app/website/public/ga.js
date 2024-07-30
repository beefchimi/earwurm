function analytics() {
  const validAddressTerms = ['github', 'beefchimi', 'earwurm'];
  const address = window.location.href.toLowerCase();
  const validAddress = validAddressTerms.every((term) =>
    address.includes(term),
  );

  if (!validAddress) return;

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    // eslint-disable-next-line no-undef, prefer-rest-params
    dataLayer.push(arguments);
  }

  gtag('js', new Date());
  gtag('config', 'G-4CCVV95VKM');

  // eslint-disable-next-line no-console
  console.log('Google Analytics initialized for:', address);
}

analytics();
