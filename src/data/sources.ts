// Every public source the page cites, fetched or read on 2026-10-20.
// Labels are what a reader sees; urls go to the original.

export const SRC = {
  coatepecPost: {
    label: 'Permalution on LinkedIn: Coatepec, Veracruz with Nestlé México (Oct 2026)',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7511726737005686784/',
  },
  waterCanadaPost: {
    label: 'Permalution on LinkedIn: 2026 Water Canada Awards finalist, New Tech (Aug 2026)',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7486359541664600065/',
  },
  nexterrePost: {
    label: 'Permalution on LinkedIn: selected for Nexterre phase 1 (Sep 2026)',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7503391831418761216/',
  },
  wfesPost: {
    label: 'Permalution on LinkedIn: World Future Energy Summit, Abu Dhabi (Jan 2026)',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7417296012798750721/',
  },
  products: {
    label: 'permalution.com, Products and services',
    url: 'https://www.permalution.com/pages/products-and-services',
  },
  orchids: {
    label: 'permalution.com: fog project to save endangered orchids',
    url: 'https://www.permalution.com/blogs/news/fog-tech-project-to-save-endangered-orchids-becomes-a-great-success',
  },
  fogWaterMass: {
    label: 'permalution.com: building a fog water mass for wildfire mitigation',
    url: 'https://www.permalution.com/blogs/news/building-a-fog-water-mass-for-wildfire-mitigation',
  },
  mars: {
    label: 'MaRS, "Tapping an alternate water source" (Sep 2025)',
    url: 'https://www.marsdd.com/our-story/tapping-an-alternate-water-source/',
  },
  asu2026: {
    label: 'ASU Knowledge Enterprise, "From vapor to value" (Jan 2026)',
    url: 'https://ke.news.prod.rtd.asu.edu/2026/01/22/from-vapor-to-value-harnessing-fog-for-global-water-security/',
  },
  asu2024: {
    label: 'ASU Knowledge Enterprise, profile of Tatiana Estevez (Sep 2024)',
    url: 'https://ke.news.prod.rtd.asu.edu/2024/09/03/tatiana-estevez-innovator-and-entrepreneur-in-water-technology/',
  },
  cp2025: {
    label: 'Canadian Press via Times Colonist (Mar 2025)',
    url: 'https://www.timescolonist.com/national-business/canadian-startups-focus-on-homegrown-funding-with-us-relations-strained-10407297',
  },
  macleans: {
    label: "Maclean's, \"Fight Canada's water shortage with fog\" (Jun 2025)",
    url: 'https://macleans.ca/society/environment/fight-canadas-water-shortage-with-fog/',
  },
  betakitRbc: {
    label: 'BetaKit: RBC Women in Cleantech Accelerator cohort (Sep 2024)',
    url: 'https://betakit.com/xatoms-permalution-among-10-startup-rbc-women-in-cleantech-accelerator-cohort/',
  },
  betakitStartupfest: {
    label: 'BetaKit: Startupfest 2022 winners (Jul 2022)',
    url: 'https://betakit.com/permalution-magnestar-ohh-foods-among-winners-of-startupfest-2022-pitch-competitions/',
  },
  nrc: {
    label: 'Government of Canada grants record: NRC IRAP, 2024 to 2025',
    url: 'https://rechercher.ouvert.canada.ca/subventions/record/nrc-cnrc%2C172-2024-2025-Q2-1021371%2Ccurrent',
  },
  riipen: {
    label: "Permalution's company description on Riipen (Oct 2026)",
    url: 'https://levelup.riipen.com/matches/8ODx1jOW',
  },
} as const;

export type SourceKey = keyof typeof SRC;
