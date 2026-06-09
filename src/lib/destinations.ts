// Top Philippine destinations surfaced on the homepage. Single source of truth
// for both the homepage carousel (TopDestinations) and the per-destination
// pages at /destinations/<slug>. Keeping the content here means the cards and
// the pages can never drift apart, and the sitemap reads the same list.

export interface DestinationSection {
  heading: string;
  body: string[];
}

export interface Destination {
  slug: string;
  title: string;
  /** Province / region shown as the card subtitle. */
  subtitle: string;
  img: string;
  /** SEO meta description (~150–160 chars). */
  description: string;
  /** Intro paragraph under the H1. */
  lead: string;
  sections: DestinationSection[];
}

export const DESTINATIONS: Destination[] = [
  {
    slug: "boracay-island",
    title: "Boracay Island",
    subtitle: "Aklan",
    img: "/destinations/Boracay.png",
    description:
      "Discover Boracay Island in Aklan — White Beach, sunsets, water sports, and the nearby Ati-Atihan Festival. Your guide to the Philippines' top island escape.",
    lead: "Boracay is the Philippines' most celebrated island escape — a four-kilometre stretch of powdery White Beach, turquoise water, and sunsets that draw travellers and Filipino families from every corner of the world.",
    sections: [
      {
        heading: "Why Visit Boracay",
        body: [
          "Boracay's fame begins with White Beach, regularly ranked among the finest in the world for its fine, talcum-soft sand and calm, swimmable shallows. The island is compact and walkable, divided into Stations 1, 2, and 3, each with its own mix of resorts, cafés, and beachfront bars. Beyond the main strip, Puka Shell Beach offers a quieter, more natural shoreline, while Bulabog Beach on the other side is the country's premier spot for kiteboarding and windsurfing.",
        ],
      },
      {
        heading: "Festivals & Filipino Community",
        body: [
          "Boracay sits within easy reach of Kalibo, home to the world-famous Ati-Atihan Festival each January — one of the grandest celebrations of faith, music, and tribal dance in the Philippines, and the festival that inspired Sinulog and Dinagyang. On the island itself, beachside gatherings, fiestas, and community events keep the warm Filipino spirit of bayanihan alive year-round for both locals and the overseas Filipinos who return to celebrate.",
        ],
      },
      {
        heading: "Food & Experiences",
        body: [
          "Cap the day with the island's signature sunset sail aboard a traditional paraw, then dine on fresh seafood, grilled specialties, and the famous calamansi muffins. Island-hopping tours, diving, and paddleboarding fill the days, while the lively evening scene makes Boracay a favourite for both relaxed family holidays and celebratory getaways.",
        ],
      },
    ],
  },
  {
    slug: "el-nido",
    title: "El Nido",
    subtitle: "Palawan",
    img: "/destinations/elnido.jpg",
    description:
      "Explore El Nido, Palawan — towering limestone cliffs, hidden lagoons, and island-hopping across Bacuit Bay. A complete guide to the Philippines' eco-tourism gem.",
    lead: "El Nido is Palawan's crown jewel — a seascape of dramatic limestone karsts, hidden lagoons, and powder-white beaches scattered across the emerald waters of Bacuit Bay.",
    sections: [
      {
        heading: "Lagoons & Island Hopping",
        body: [
          "El Nido's island-hopping tours, labelled A through D, are the heart of any visit. The Big Lagoon and Small Lagoon reward kayakers with glassy, cliff-ringed water; Secret Lagoon hides behind a narrow rock opening; and Shimizu and Snake Island offer pristine snorkelling and sandbars. Towering above it all are the ancient karst formations that make Bacuit Bay one of the most photographed seascapes in Southeast Asia.",
        ],
      },
      {
        heading: "Culture & Community",
        body: [
          "Once a quiet fishing town, El Nido has grown into a model of community-based, eco-conscious tourism, with local operators and indigenous communities helping protect its reefs and forests. Visiting supports Palaweño families directly — a living example of how travel done well can sustain both culture and the environment.",
        ],
      },
      {
        heading: "Food & Experiences",
        body: [
          "Beyond the boats, El Nido offers cliffside dining, fresh-caught seafood, and sunset views from Las Cabanas Beach. Adventurous travellers hike to viewpoints like Taraw Cliff, while divers explore reefs and WWII wrecks — making El Nido equally rewarding for relaxation and exploration.",
        ],
      },
    ],
  },
  {
    slug: "chocolate-hills",
    title: "Chocolate Hills",
    subtitle: "Bohol",
    img: "/destinations/chocolatehills.jpg",
    description:
      "Visit the Chocolate Hills of Bohol — over 1,200 symmetrical hills that turn chocolate-brown in the dry season. A guide to Bohol's iconic natural wonder.",
    lead: "The Chocolate Hills are Bohol's most iconic sight — more than 1,200 near-symmetrical mounds spread across the countryside that turn a rich chocolate-brown during the dry season, giving the wonder its name.",
    sections: [
      {
        heading: "A Geological Wonder",
        body: [
          "Formed over millennia from weathered marine limestone, the Chocolate Hills rise in uncanny, dome-like uniformity across central Bohol. The main viewing complex near Carmen offers a sweeping panorama of hundreds of hills at once — a landscape unlike anywhere else in the Philippines and a designated National Geological Monument.",
        ],
      },
      {
        heading: "Bohol Festivals & Heritage",
        body: [
          "Bohol celebrates the Sandugo Festival each July, commemorating the historic blood compact (sandugo) between Datu Sikatuna and Spanish explorer Miguel López de Legazpi — one of the first treaties of friendship between Filipinos and the West. The province's deep faith and history also shine in its centuries-old stone churches and the heritage town of Loboc along its scenic river.",
        ],
      },
      {
        heading: "What to Experience",
        body: [
          "A visit pairs naturally with Bohol's other treasures: meeting the tiny, wide-eyed tarsiers at the sanctuary, cruising the Loboc River with lunch and live music, and exploring man-made forests and hanging bridges. Together they make Bohol one of the country's most well-rounded destinations.",
        ],
      },
    ],
  },
  {
    slug: "kawasan-falls",
    title: "Kawasan Falls",
    subtitle: "Cebu",
    img: "/destinations/kawasan.webp",
    description:
      "Discover Kawasan Falls in Badian, Cebu — turquoise three-tiered waterfalls and the famous canyoneering adventure. Your guide to Cebu's natural icon.",
    lead: "Kawasan Falls in Badian, southern Cebu, is one of the Philippines' most striking waterfalls — a series of turquoise, spring-fed cascades tumbling through lush jungle into inviting natural pools.",
    sections: [
      {
        heading: "The Falls & Canyoneering",
        body: [
          "Kawasan's vivid blue water comes from mineral-rich springs, and its multiple tiers can be reached by an easy riverside walk. The falls are also the dramatic finish to Cebu's world-famous canyoneering adventure from Kanlaob River — a half-day of cliff jumps, natural slides, and swims through limestone gorges that ends beneath the falls themselves.",
        ],
      },
      {
        heading: "Cebu's Festivals & Spirit",
        body: [
          "Cebu is the beating heart of Filipino festivity, home to the Sinulog Festival every January — one of the largest and most colourful celebrations in the country, honouring the Santo Niño with grand street dancing. For overseas Filipinos, Sinulog and Cebu's warm, devout culture are a powerful reminder of home.",
        ],
      },
      {
        heading: "Food & Experiences",
        body: [
          "No trip to Cebu is complete without its legendary lechon, widely considered the best in the Philippines. Combine Kawasan with nearby Moalboal's sardine run and turtle sightings, or the whale sharks of Oslob, for an unforgettable southern Cebu itinerary.",
        ],
      },
    ],
  },
  {
    slug: "siargao-island",
    title: "Siargao Island",
    subtitle: "Surigao del Norte",
    img: "/destinations/siargao.jpg",
    description:
      "Explore Siargao Island, the surfing capital of the Philippines — Cloud 9, palm-fringed lagoons, and laid-back island life. Your complete Siargao travel guide.",
    lead: "Siargao is the surfing capital of the Philippines — a teardrop-shaped island of swaying coconut palms, glassy lagoons, and the legendary Cloud 9 wave that put it on the world map.",
    sections: [
      {
        heading: "Surf & Sea",
        body: [
          "Cloud 9 is Siargao's most famous break, drawing surfers from across the globe, but the island offers waves for every level around General Luna. Between sessions, travellers explore the Magpupungko rock pools at low tide, island-hop to Naked, Daku, and Guyam islands, and paddle through the mirror-still Sugba Lagoon.",
        ],
      },
      {
        heading: "Island Life & Community",
        body: [
          "Siargao's charm is its unhurried, barefoot rhythm and the warmth of its tight-knit community. Despite its rise as a global surf destination, the island has held onto its Filipino soul — a place where fiestas, shared meals, and the bayanihan spirit still shape daily life and welcome returning overseas Filipinos like family.",
        ],
      },
      {
        heading: "Food & Experiences",
        body: [
          "Coconut groves, motorbike rides down palm-lined roads, fresh seafood, and sunset gatherings define the Siargao experience. It's a destination that balances adventure and stillness — equally suited to surfers, couples, and anyone seeking the quieter side of the islands.",
        ],
      },
    ],
  },
  {
    slug: "mayon-volcano",
    title: "Mayon Volcano",
    subtitle: "Albay",
    img: "/destinations/mayon.jpg",
    description:
      "Marvel at Mayon Volcano in Albay — the Philippines' near-perfect cone. A guide to Bicol's icon, its festivals, and the region's famously spicy cuisine.",
    lead: "Mayon Volcano in Albay is renowned worldwide for its near-perfect symmetrical cone — an active volcano that towers majestically over the Bicol Region and ranks among the most beautiful in the world.",
    sections: [
      {
        heading: "The Perfect Cone",
        body: [
          "Rising more than 2,400 metres, Mayon's flawless conical shape is best admired from the ruins of the Cagsawa Church, where a centuries-old bell tower frames the volcano against the sky. ATV rides across its lava-strewn foothills bring adventurers close to the mountain, while the surrounding plains and the city of Legazpi offer ever-changing views.",
        ],
      },
      {
        heading: "Bicol Culture & Festivals",
        body: [
          "Albay celebrates the Magayon Festival throughout May — a month-long showcase of Bicolano arts, culture, and heritage named for the legend of the beautiful Daragang Magayon. The region's pride in its identity, faith, and folklore makes it one of the most culturally rich corners of the Philippines.",
        ],
      },
      {
        heading: "Food & Experiences",
        body: [
          "Bicol is famous for its bold, coconut-and-chili cuisine — Bicol Express, laing, and the chili ice cream of Legazpi are must-tries. Pair the food with side trips to Daraga Church, the Quitinday hills, and whale-shark interactions in nearby Donsol for a full Bicol adventure.",
        ],
      },
    ],
  },
  {
    slug: "vigan-city",
    title: "Vigan City",
    subtitle: "Ilocos Sur",
    img: "/destinations/vigan.jpeg",
    description:
      "Step into Vigan City, Ilocos Sur — a UNESCO World Heritage town of cobblestone streets and Spanish-colonial houses. A guide to its heritage, festivals, and food.",
    lead: "Vigan is the best-preserved Spanish colonial town in Asia — a UNESCO World Heritage Site where cobblestone streets, ancestral mansions, and horse-drawn calesas transport visitors centuries back in time.",
    sections: [
      {
        heading: "Calle Crisologo & Heritage",
        body: [
          "The heart of Vigan is Calle Crisologo, a cobblestone street lined with centuries-old bahay-na-bato houses that glow under lanterns at night. The city blends Filipino, Chinese, and Spanish influences in its architecture, from Vigan Cathedral to the Syquia Mansion, making it one of the country's most evocative living-history experiences.",
        ],
      },
      {
        heading: "Festivals & Traditions",
        body: [
          "Vigan comes alive during the Viva Vigan Binatbatan Festival of the Arts each May and the Vigan Longganisa Festival in January, celebrating the city's crafts, cuisine, and heritage with street dancing and parades. These festivals showcase the enduring pride Ilocanos take in their culture — a heritage carried proudly by Ilocano communities abroad.",
        ],
      },
      {
        heading: "Food & Experiences",
        body: [
          "Vigan is a food lover's pilgrimage: the crisp Vigan empanada, garlicky Vigan longganisa, and golden bagnet are local legends. Visit the pottery workshops of Pagburnayan, ride a calesa through the old town, and watch the dancing fountain at Plaza Salcedo to complete the journey.",
        ],
      },
    ],
  },
  {
    slug: "banaue-rice-terraces",
    title: "Banaue Rice Terraces",
    subtitle: "Ifugao",
    img: "/destinations/banaue.webp",
    description:
      "Discover the Banaue Rice Terraces in Ifugao — 2,000-year-old terraces carved by hand and called the Eighth Wonder of the World. A guide to Ifugao heritage.",
    lead: "Carved into the mountains of Ifugao more than 2,000 years ago by the ancestors of the indigenous people, the Banaue Rice Terraces are often called the Eighth Wonder of the World — a breathtaking testament to Filipino ingenuity and harmony with the land.",
    sections: [
      {
        heading: "The Terraces & Ifugao Heritage",
        body: [
          "Hand-built without modern tools and fed by an ancient irrigation system from the rainforests above, the terraces climb the mountainsides like giant stairways to the sky. The nearby Batad terraces form a stunning amphitheatre and reward those who trek in with one of the most spectacular views in the country. Together they embody the deep connection between the Ifugao people and their land.",
        ],
      },
      {
        heading: "Festivals & Traditions",
        body: [
          "Ifugao culture is celebrated in festivals like the Imbayah Festival, where ancestral rituals, native games, and traditional gong music honour a heritage that predates Spanish colonisation. The terraces themselves are a UNESCO World Heritage Site, recognised as a living cultural landscape sustained by community effort across generations.",
        ],
      },
      {
        heading: "What to Experience",
        body: [
          "Beyond the viewpoints, visitors can trek between villages, stay in local guesthouses, and learn about Ifugao weaving, wood carving, and farming traditions. It's a destination that rewards curiosity and respect — a powerful reminder of the bayanihan spirit that built it, one terrace at a time.",
        ],
      },
    ],
  },
];

export function destinationUrl(slug: string): string {
  return `/destinations/${slug}`;
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}
