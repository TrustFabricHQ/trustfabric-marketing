/*
 * TrustFabric events: the ONLY file you need to edit to add or change an event.
 * The Events page (/events) and every event page (/events/<slug>) are built from this list.
 *
 * To ADD an event: copy one block below, change the fields, keep the commas.
 * To MARK an event as past or upcoming: just fill in startDate (and endDate). The page works it out from today's date.
 * To ADD PHOTOS: put the files in /assets/events/ and list them in `gallery` (see the example at the bottom).
 *
 * Fields
 *   name           Event name, without the year.                           (required)
 *   slug           URL ending: /events/<slug>. Lowercase, hyphens only.    (required, unique)
 *   year           Event year.                                             (required)
 *   startDate      'YYYY-MM-DD'. Leave null until the date is confirmed.   (optional)
 *   endDate        'YYYY-MM-DD'. Leave null for single-day events.         (optional)
 *   location       City or venue, only when confirmed.                     (optional)
 *   country        Country, shown after the location.                      (optional)
 *   category       e.g. 'Technology Summit', 'Industry Conference'.        (optional)
 *   description    One or two sentences about our participation.           (optional)
 *   participation  'participating' | 'attending' | 'exhibiting' | 'speaking'.
 *   booth          Booth or stand details, only when confirmed.            (optional)
 *   url            The event's own website.                                (optional)
 *   banner         '/assets/events/your-banner.jpg'. Without one, a designed
 *                  graphic is shown automatically.                         (optional)
 *   theme          Graphic used when there is no banner: 'grid' | 'arcs' | 'lines' | 'dots'.
 *   gallery        Photos: [{ src: '/assets/events/x.jpg', alt: 'What the photo shows', caption: 'Optional' }].
 *   featured       true for the event highlighted at the top. Use it on one event.
 *   published      false hides an event everywhere without deleting it.
 *
 * Nothing here is invented: dates, venues and websites come from each organiser's own site (noted beside the event).
 * Booth details stay empty until TrustFabric confirms them. Re-check dates against the organiser's site before each event.
 */
window.TF_EVENTS = [
    {
        // Dates, venue and website confirmed on the organiser's site: https://www.bengalurutechsummit.com/
        name: 'Bengaluru Tech Summit',
        slug: 'bengaluru-tech-summit-2026',
        year: 2026,
        startDate: '2026-11-17',
        endDate: '2026-11-19',
        location: 'Bangalore International Exhibition Centre (BIEC), Bengaluru',
        country: 'India',
        category: 'Technology Summit',
        description: 'TrustFabric is participating in Bengaluru Tech Summit 2026, the 29th edition, themed AI & Beyond. Meet our team to talk about data privacy, DPDP Act readiness and the security of AI systems.',
        participation: 'participating',
        booth: null,
        url: 'https://www.bengalurutechsummit.com/',
        banner: null,
        theme: 'grid',
        gallery: [],
        featured: true,
        published: true
    },
    {
        // Dates and venue confirmed on the organiser's site: https://www.techexpogujarat.com/
        name: 'Tech Expo Gujarat',
        slug: 'tech-expo-gujarat-2026',
        year: 2026,
        startDate: '2026-11-27',
        endDate: '2026-11-29',
        location: 'GUCEC (GMDC Ground), Ahmedabad',
        country: 'India',
        category: 'Technology Expo',
        description: 'TrustFabric is participating in Tech Expo Gujarat 2026 in Ahmedabad, themed Beacon of Rising Innovation & AI. Come and talk to our team about consent management, data discovery and DPDP compliance.',
        participation: 'participating',
        booth: null,
        url: 'https://www.techexpogujarat.com/',
        banner: null,
        theme: 'arcs',
        gallery: [],
        featured: false,
        published: true
    },
    {
        // Dates and venue confirmed on DSCI's own page: https://www.dsci.in/event/aiss-2026/
        name: 'DSCI Annual Information Security Summit',
        slug: 'dsci-aiss-2026',
        year: 2026,
        startDate: '2026-12-09',
        endDate: '2026-12-11',
        location: 'Pullman Aerocity, New Delhi',
        country: 'India',
        category: 'Cybersecurity Summit',
        description: 'TrustFabric is participating in the DSCI Annual Information Security Summit (AISS) 2026, the 21st edition, in New Delhi. We look forward to exchanging ideas with security and privacy professionals.',
        participation: 'participating',
        booth: null,
        url: 'https://www.dsci.in/event/aiss-2026/',
        banner: null,
        theme: 'lines',
        gallery: [],
        featured: false,
        published: true
    },
    {
        // Dates and venue confirmed on RSA Conference's site: https://www.rsaconference.com/usa
        name: 'RSA Conference',
        slug: 'rsa-conference-2027',
        year: 2027,
        startDate: '2027-04-05',
        endDate: '2027-04-08',
        location: 'Moscone Center, San Francisco',
        country: 'United States',
        category: 'Cybersecurity Conference',
        description: 'TrustFabric is participating in RSA Conference 2027 at the Moscone Center in San Francisco, connecting with the global cybersecurity community.',
        participation: 'participating',
        booth: null,
        url: 'https://www.rsaconference.com/usa',
        banner: null,
        theme: 'dots',
        gallery: [],
        featured: false,
        published: true
    }

    /* Example of a finished event, with a confirmed date and photos (copy and edit):
    ,{
        name: 'Example Security Summit',
        slug: 'example-security-summit-2027',
        year: 2027,
        startDate: '2027-03-18',
        endDate: '2027-03-19',
        location: 'Mumbai',
        country: 'India',
        category: 'Technology Summit',
        description: 'A short line about what TrustFabric is doing at the event.',
        participation: 'exhibiting',
        booth: 'Booth details here',
        url: 'https://example.com',
        banner: '/assets/events/example-banner.jpg',
        theme: 'grid',
        gallery: [
            { src: '/assets/events/example-1.jpg', alt: 'The TrustFabric team at the stand', caption: 'Day one' }
        ],
        featured: false,
        published: true
    }
    */
];
