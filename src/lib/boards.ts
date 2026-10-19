/** Real job-board SEARCH pages for a title and place. These are search results pages, not specific postings. */
export function boardLinks(title: string, location: string, india = /india|delhi|noida|gurgaon|gurugram|mumbai|bengaluru|bangalore|hyderabad|chennai|pune|kolkata|ghaziabad|faridabad/i.test(location || '')) {
  const q = encodeURIComponent(title);
  const l = encodeURIComponent(location || '');
  return [
    { label: 'Search on LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${q}${l ? `&location=${l}` : ''}` },
    { label: 'Search on Indeed', url: `https://${india ? 'in.indeed.com' : 'www.indeed.com'}/jobs?q=${q}${l ? `&l=${l}` : ''}` },
    { label: 'Search on Google Jobs', url: `https://www.google.com/search?q=${encodeURIComponent(`${title} jobs ${location || ''}`.trim())}&ibp=htl;jobs` },
  ];
}

/** Official Indian government portals. Home pages, checked reachable. Not postings. */
export const GOVT_PORTALS = [
  { label: 'National Career Service (NCS)', url: 'https://www.ncs.gov.in/job-listing' },
  { label: 'DSSSB (Delhi)', url: 'https://dsssb.delhi.gov.in/' },
  { label: 'SSC', url: 'https://ssc.gov.in/' },
  { label: 'Delhi Police', url: 'https://delhipolice.gov.in/' },
  { label: 'Indian Railways', url: 'https://indianrailways.gov.in/' },
  { label: 'UPSC', url: 'https://www.upsc.gov.in/' },
];
