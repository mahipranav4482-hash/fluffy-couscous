export interface BeforeAfterImageryRecord {
  id: string;
  disasterId: string;
  disasterName: string;
  location: string;
  country: string;
  year: number;
  hazardType: string;
  coordinates: [number, number]; // [lat, lon]
  before: {
    label: string;
    satelliteSensor: string;
    spectralSignature: string;
    description: string;
    groundTruthPoints: string[];
    accentColor: string;
  };
  after: {
    label: string;
    satelliteSensor: string;
    spectralSignature: string;
    description: string;
    groundTruthPoints: string[];
    accentColor: string;
  };
  changeDetectionMetrics: {
    metricLabel: string;
    metricValue: string;
    spectralMethod: string;
    secondaryMetric: string;
    secondaryValue: string;
  };
}

export const BEFORE_AFTER_DATA: BeforeAfterImageryRecord[] = [
  {
    id: "BA-001",
    disasterId: "HIST-EQ-2004-001",
    disasterName: "2004 Indian Ocean Megathrust Tsunami",
    location: "Banda Aceh, Sumatra",
    country: "Indonesia",
    year: 2004,
    hazardType: "TSUNAMI",
    coordinates: [5.55, 95.32],
    before: {
      label: "BEFORE THE DISASTER (Pre-Event Optical Satellite)",
      satelliteSensor: "Landsat-7 ETM+ & QuickBird (0.6m Optical)",
      spectralSignature: "High NDVI (0.78), Emerald Vegetation Canopy, Clean Coastal Sand",
      description: "A dense, vibrant coastal city framed by lush tropical palm forests and emerald green agricultural plains right up to the shoreline. Pristine sandy beaches, active fishing ports, and interconnected coastal highways.",
      groundTruthPoints: [
        "Vibrant urban grid and bustling harbor in Banda Aceh",
        "Continuous coastal palm buffer shielding inland hamlets",
        "Pristine white sand shoreline with calm Indian Ocean swell",
        "Lush green rice paddies and estuarine mangrove vegetation"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (Post-Tsunami Satellite Ground Truth)",
      satelliteSensor: "SPOT-5 & Terra MODIS Multi-Spectral",
      spectralSignature: "Negative NDVI (-0.42), 100% SAR Radar Coherence Loss, High Saline Scour",
      description: "Total stripping of the landscape. A 3-kilometer-wide dead zone where all trees, soil, and buildings were scoured down to bare brown earth and bedrock. The shoreline permanently receded, leaving saltwater lagoons and foundations standing empty like gravestones. Only the reinforced dome of the Baiturrahman Grand Mosque remained standing amidst hundreds of square blocks of leveled rubble.",
      groundTruthPoints: [
        "3-kilometer-wide complete scour zone stripped to bedrock",
        "Permanent coastline erosion with new saltwater lagoons",
        "Leveled residential blocks; empty concrete foundations",
        "Baiturrahman Mosque standing alone surrounded by apocalyptic mud"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Coastal Scour Inundation Width",
      metricValue: "3.2 Kilometers Inland",
      spectralMethod: "Optical Spectral Difference (NDVI / NDWI) & SAR Radar Coherence Loss",
      secondaryMetric: "Vegetation & Canopy Destruction",
      secondaryValue: "88% Stripped to Bedrock"
    }
  },
  {
    id: "BA-002",
    disasterId: "HIST-EQ-2011-001",
    disasterName: "2011 Great East Japan Earthquake & Megatsunami",
    location: "Sendai Plains & Rikuzentakata",
    country: "Japan",
    year: 2011,
    hazardType: "TSUNAMI",
    coordinates: [38.30, 141.02],
    before: {
      label: "BEFORE THE DISASTER (Pre-Tsunami Satellite Signature)",
      satelliteSensor: "ALOS AVNIR-2 & GeoEye-1 High-Resolution",
      spectralSignature: "Geometric Ortho-Paddies, Intact 10m Reinforced Concrete Seawall",
      description: "A meticulously planned coastal landscape featuring protective seawalls (10m high), the historic coastal pine forest (Takata-Matsubara with 70,000 trees), geometric rice paddies, and orderly fishing ports.",
      groundTruthPoints: [
        "Massive 10-meter coastal seawall shielding coastal towns",
        "Historic Takata-Matsubara coastal pine belt (70,000 trees)",
        "Orderly coastal fishing harbors, canals, and breakwaters",
        "Dry fertile Sendai agricultural plain with grid roadways"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (Post-Tsunami Inundation & Subsidence)",
      satelliteSensor: "ASTER & TerraSAR-X X-Band Radar",
      spectralSignature: "560 km² Saline Inundation (NDWI > 0.65), 1.2m Coastal Tectonic Subsidence",
      description: "Seawalls shattered and overtopped. Over 560 square kilometers turned into an inky black ocean of seawater, mud, and floating debris. Farmlands were completely inundated by saline water; 69,999 of the 70,000 pine trees were snapped like matchsticks, leaving only the solitary 'Miracle Pine.' Coastal land dropped by 1.2 meters due to tectonic subsidence, keeping coastal neighborhoods permanently underwater for months.",
      groundTruthPoints: [
        "560 square kilometers inundated by inky black seawater and debris",
        "Seawalls pulverized; tsunami run-up exceeded 40 meters",
        "69,999 of 70,000 coastal pine trees snapped like toothpicks",
        "1.2-meter tectonic ground subsidence leaving land below sea level"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Total Seawater Inundation Area",
      metricValue: "561 km² Submerged",
      spectralMethod: "Normalized Difference Water Index (NDWI) & GPS Tectonic Subsidence",
      secondaryMetric: "Coastal Land Tectonic Drop",
      secondaryValue: "-1.2 Meters Subsidence"
    }
  },
  {
    id: "BA-003",
    disasterId: "HIST-FL-2013-001",
    disasterName: "2013 Kedarnath Himalayan Cloudburst & Chorabari GLOF",
    location: "Kedarnath & Rambara, Uttarakhand",
    country: "India",
    year: 2013,
    hazardType: "CLOUDBURST",
    coordinates: [30.73, 79.06],
    before: {
      label: "BEFORE THE DISASTER (Pre-Event High-Altitude Satellite)",
      satelliteSensor: "ISRO Cartosat-2 & Landsat-8 OLI",
      spectralSignature: "Intact Chorabari Glacial Moraine Lake, Alpine Green Valley",
      description: "High-altitude Chorabari glacial lake nestled behind a natural moraine wall above Kedarnath. A green alpine valley with pilgrim trails, hotels, and the settlement of Rambara lining the Mandakini River.",
      groundTruthPoints: [
        "Full Chorabari glacial tarn held by natural boulder moraine dam",
        "Historic Kedarnath temple town with surrounding guest houses",
        "Vibrant riverside town of Rambara with multi-tier stone lodges",
        "Intact pedestrian pilgrim trekking footpath along Mandakini River"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (Post-GLOF Debris Scar & Lake Breach)",
      satelliteSensor: "ISRO RISAT-1 Radar & Cartosat High-Res",
      spectralSignature: "100% Moraine Lake Drainage, Massive 15m Deep Debris Scour Scar",
      description: "The glacial moraine dam completely burst open, leaving an empty, gouged crater where the lake once stood. A 15-meter-deep grey boulder scar bifurcated around the 8th-century Kedarnath temple. Downstream, the entire settlement of Rambara was erased from satellite imagery—not a single building or foundation survived the debris torrent.",
      groundTruthPoints: [
        "Glacial moraine ruptured; Chorabari Lake completely drained",
        "15-meter-high slurry boulder scar bifurcating around temple",
        "Settlement of Rambara completely erased from satellite view",
        "Entire river valley scoured down to bare bedrock and gravel"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Glacial Lake Volume Discharged",
      metricValue: "2.5 Million m³ Water & Slurry",
      spectralMethod: "SAR Coherence Loss & Digital Elevation Model (DEM) Differential",
      secondaryMetric: "Downstream Settlement Eradication",
      secondaryValue: "100% of Rambara Leveled"
    }
  },
  {
    id: "BA-004",
    disasterId: "HIST-LS-2024-001",
    disasterName: "2024 Wayanad Catastrophic Monsoon Debris Flows",
    location: "Chooralmala & Mundakkai, Kerala",
    country: "India",
    year: 2024,
    hazardType: "LANDSLIDE",
    coordinates: [11.52, 76.15],
    before: {
      label: "BEFORE THE DISASTER (Pre-Monsoon High-Resolution Canopy)",
      satelliteSensor: "Copernicus Sentinel-2 & PlanetScope (3m)",
      spectralSignature: "High NDVI (0.84), Manicured Tea Estates, Narrow 15m Riverbed",
      description: "Dense green rainforest canopy on the upper Western Ghats ridge transitioning into manicured, terraced tea and cardamom plantations with winding village streets.",
      groundTruthPoints: [
        "Unbroken evergreen tropical montane rainforest on Vellarmala peak",
        "Lush geometric tea estate terraces with worker settlements",
        "Historic Chooralmala road bridge crossing narrow 15m stream",
        "Stable agricultural hillsides with dense canopy cover"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (Post-Debris Flow Sentinel-2 Scar)",
      satelliteSensor: "Copernicus Sentinel-2 & ISRO Cartosat-3",
      spectralSignature: "8-km Raw Red-Mud Debris Runout, River Width 15m -> 150m (10x Widened)",
      description: "A massive 8-kilometer-long raw red-mud scar visible from Copernicus Sentinel-2. The riverbed widened from 15 meters to over 150 meters, filled with thousands of multiton boulders. The bridge connecting Chooralmala and Mundakkai was sheared away, with entire neighborhood blocks replaced by a continuous carpet of wet debris and mud.",
      groundTruthPoints: [
        "8-kilometer continuous red-earth debris runout scar visible from space",
        "Riverbed violently widened from 15 meters to over 150 meters",
        "Chooralmala bridge completely washed away; villages severed",
        "Hundreds of residential buildings buried under multi-meter sediment"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Landslide Runout Scar Length",
      metricValue: "8.0 Kilometers Continuous Scar",
      spectralMethod: "Optical Spectral Difference (NDVI) & Copernicus Multi-Temporal RGB",
      secondaryMetric: "River Channel Width Expansion",
      secondaryValue: "15m -> 150m (10x Expansion)"
    }
  },
  {
    id: "BA-005",
    disasterId: "HIST-VO-1980-001",
    disasterName: "1980 Mount St. Helens Lateral Blast & Debris Avalanche",
    location: "Skamania County, Washington",
    country: "United States",
    year: 1980,
    hazardType: "VOLCANO",
    coordinates: [46.20, -122.19],
    before: {
      label: "BEFORE THE DISASTER (Pre-Eruption Symmetrical Peak)",
      satelliteSensor: "Landsat-3 MSS & Aerial Photogrammetry",
      spectralSignature: "Glacial Ice Cap, High Symmetrical Elevation (2,950m), Deep Lake",
      description: "A snow-capped, conical volcano known as the 'Mount Fuji of America' (elevation 2,950m), encircled by old-growth Douglas fir forests and crystal-clear Spirit Lake.",
      groundTruthPoints: [
        "Perfect symmetrical conical peak standing at 2,950 meters",
        "Glacial ice pack covering upper mountain summit",
        "Ancient old-growth Douglas fir pine forest covering slopes",
        "Crystal-clear deep blue waters of recreational Spirit Lake"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (Post-Lateral Blast Horseshoe Caldera)",
      satelliteSensor: "Landsat-3 MSS & NASA Airborne Radar",
      spectralSignature: "400m Summit Missing, 600 km² Blast Blowdown, Floating Log Mat",
      description: "The entire northern flank was missing, leaving a giant horseshoe-shaped caldera and reducing the summit by 400 meters. Over 600 square kilometers of ancient forest was flattened in a radial blast pattern with trees laid down like toothpicks. Spirit Lake rose by 60 meters and was blanketed by millions of floating, stripped tree trunks.",
      groundTruthPoints: [
        "Entire north summit collapsed; 400 meters of elevation gone",
        "Giant 2-kilometer-wide horseshoe amphitheater caldera",
        "600 square kilometers of ancient forest flattened like matchsticks",
        "Spirit Lake surface choked with millions of stripped tree trunks"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Summit Elevation Lost",
      metricValue: "400 Vertical Meters Gone",
      spectralMethod: "Photogrammetric DEM Differential & Thermal IR Hotspot Mapping",
      secondaryMetric: "Forest Blowdown Zone",
      secondaryValue: "600 km² Timber Flattened"
    }
  },
  {
    id: "BA-006",
    disasterId: "HIST-FL-2022-001",
    disasterName: "2022 Pakistan Indus Super Flood ('Monsoon on Steroids')",
    location: "Sindh & Balochistan Provinces",
    country: "Pakistan",
    year: 2022,
    hazardType: "FLOOD",
    coordinates: [27.55, 68.35],
    before: {
      label: "BEFORE THE DISASTER (June 2022 Dry Season Satellite)",
      satelliteSensor: "NASA MODIS Terra/Aqua & Copernicus Sentinel-2",
      spectralSignature: "Arid Tan Soil, Narrow Meandering Indus Ribbon, Low NDWI",
      description: "Dry, tan desert soils with narrow, meandering blue ribbons representing the Indus River and its irrigation canals.",
      groundTruthPoints: [
        "Arid light-brown desert soils and agricultural fields",
        "Indus River flowing within its narrow engineered levees",
        "Dry rural highway network connecting agricultural market towns",
        "Standard seasonal reservoir levels across upstream barrages"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (August 2022 100km Inland Sea)",
      satelliteSensor: "Copernicus Sentinel-1 SAR & MODIS 250m",
      spectralSignature: "100-km Wide Inland Sea (NDWI > 0.8), 1/3 of Nation Submerged",
      description: "A gigantic inland sea over 100 kilometers wide formed in Sindh province. What was dry farmland turned into a continuous sheet of dark standing water covering one-third of the nation, with isolated towns appearing as tiny brown islands connected only by partially submerged national highways.",
      groundTruthPoints: [
        "Colossal 100-kilometer-wide inland sea created in Sindh province",
        "One-third of Pakistan inundated by continuous standing floodwater",
        "Thousands of villages appearing as isolated islands in dark water",
        "National highway arteries completely severed and submerged"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Inland Flood Sea Width",
      metricValue: "Over 100 Kilometers Wide",
      spectralMethod: "Synthetic Aperture Radar (SAR) Cloud-Penetrating Water Inundation",
      secondaryMetric: "National Land Area Submerged",
      secondaryValue: "33% of Nation Underwater"
    }
  },
  {
    id: "BA-007",
    disasterId: "DIS-TR-001",
    disasterName: "2023 Kahramanmaraş Earthquake Fault Rupture",
    location: "East Anatolian Fault, Kahramanmaraş",
    country: "Turkey",
    year: 2023,
    hazardType: "EARTHQUAKE",
    coordinates: [37.17, 37.04],
    before: {
      label: "BEFORE THE DISASTER (Pre-Quake High-Resolution Imagery)",
      satelliteSensor: "Maxar WorldView-3 & PlanetScope (0.3m)",
      spectralSignature: "Unbroken Grid Lines, Straight Roadways, Intact Rebar Buildings",
      description: "Continuous agricultural fields, straight olive-tree orchard rows, unbroken asphalt highways, and high-speed railway tracks crossing the East Anatolian Fault.",
      groundTruthPoints: [
        "Unbroken straight roads and high-speed railway tracks across fault",
        "Orderly rows of olive orchards and agricultural fence boundaries",
        "Modern multi-story residential apartment blocks across 11 cities",
        "Continuous zero-offset surface topography"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (Post-Rupture Surface Offset & Collapse)",
      satelliteSensor: "Maxar High-Res (30cm) & Sentinel-1 InSAR Interferogram",
      spectralSignature: "3-4 Meter Lateral Ground Shear, 500 km Surface Rupture",
      description: "A visible 3-to-4-meter lateral offset slicing cleanly through the Earth's surface. Roads and railways were shifted sideways by up to 4 meters, and entire blocks of modern 10-story apartment towers collapsed into flat pancake rubble layers.",
      groundTruthPoints: [
        "Visible 3-to-4 meter lateral left-lateral strike-slip offset",
        "Roads, tree lines, and railway tracks sheared sideways by 4m",
        "Pancake structural collapse of thousands of concrete buildings",
        "Continuous 500-kilometer tectonic surface fault rupture trace"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Surface Lateral Slip Offset",
      metricValue: "3.5 to 4.2 Meters Lateral Offset",
      spectralMethod: "InSAR Phase Interferometry & Sub-Pixel Optical Cross-Correlation",
      secondaryMetric: "Fault Rupture Trace Length",
      secondaryValue: "500 km Continuous Ground Rupture"
    }
  },
  {
    id: "BA-008",
    disasterId: "HIST-WF-2019-001",
    disasterName: "2019–20 Australian 'Black Summer' Wildfires",
    location: "New South Wales & Victoria",
    country: "Australia",
    year: 2019,
    hazardType: "WILDFIRE",
    coordinates: [-35.30, 149.90],
    before: {
      label: "BEFORE THE DISASTER (Pre-Fire High-Moisture Forest)",
      satelliteSensor: "Sentinel-2 Multi-Spectral & Landsat-8",
      spectralSignature: "Dense Eucalyptus Canopy (NDVI 0.72), Normal Soil Moisture",
      description: "Solid dark green canopy across the Great Dividing Range eucalyptus forests, indicating dense, moisture-rich vegetation.",
      groundTruthPoints: [
        "Deep green eucalyptus canopy spanning Great Dividing Range",
        "Normal soil moisture reserves and clean blue coastal skies",
        "Intact biodiversity habitats across national parks",
        "Rural settlements framed by native bushland"
      ],
      accentColor: "#10b981"
    },
    after: {
      label: "AFTER THE DISASTER (Post-Burn Scar & Stratospheric Smoke)",
      satelliteSensor: "Himawari-8 Geo-Sat & Sentinel-2 Burn Scar (NBR)",
      spectralSignature: "Negative NDVI (-0.35), 24M Hectares Burned, Stratospheric Plume",
      description: "Over 24 million hectares showed negative NDVI (normalized difference vegetation index), appearing as scorched, charcoal-black and rust-brown burn scars spanning thousands of kilometers, accompanied by towering pyrocumulonimbus cloud plumes that rose into the stratosphere.",
      groundTruthPoints: [
        "24 million hectares scorched into charcoal-black burn scars",
        "Towering pyrocumulonimbus smoke clouds reaching stratosphere",
        "Complete incinerated canopy loss across coastal mountain ranges",
        "Apocalyptic orange skies spanning from Sydney to New Zealand"
      ],
      accentColor: "#ef4444"
    },
    changeDetectionMetrics: {
      metricLabel: "Total Burn Footprint Area",
      metricValue: "24.3 Million Hectares Burned",
      spectralMethod: "Normalized Burn Ratio (NBR) & Short-Wave Infrared (SWIR)",
      secondaryMetric: "Carbon Dioxide Emissions",
      secondaryValue: "715 Million Tons Released"
    }
  }
];

export const getBeforeAfterRecord = (disasterId?: string): BeforeAfterImageryRecord | undefined => {
  if (!disasterId) return undefined;
  return BEFORE_AFTER_DATA.find((r) => r.disasterId === disasterId || r.id === disasterId);
};

export const hasBeforeAfterImagery = (disasterId?: string): boolean => {
  if (!disasterId) return false;
  return BEFORE_AFTER_DATA.some((r) => r.disasterId === disasterId || r.id === disasterId);
};
