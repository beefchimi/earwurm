/* eslint-disable */

function analytics() {
  const validAddressTerms = ['github', 'beefchimi', 'earwurm'];
  const address = window.location.href.toLowerCase();
  const validAddress = validAddressTerms.every((term) =>
    address.includes(term),
  );

  if (!validAddress) return;

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  gtag('js', new Date());
  gtag('config', 'G-4CCVV95VKM');

  console.log('Google Analytics initialized for:', address);
}

analytics();
