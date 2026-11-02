/* ===== DATA (Sample Egyptian real estate listings) ===== */
const props = [
  {
    t: 'Administrative Office',
    t_ar: 'مكتب إداري',
    n: 'Administrative Office - KE1F3A10',
    n_ar: 'مكتب إداري - KE1F3A10',
    a: 'New Administrative Capital',
    a_ar: 'العاصمة الادارية الجديدة',
    p: 3059000,
    old_p: 3634091.62,
    b: 3,
    h: 2,
    s: 135,
    floor_ar: 'الطابق 3',
    floor: 'Floor 3',
    project_ar: 'مشروع كينترو',
    project: 'Kintro Project',
    disc_ar: '15% خصم',
    disc: '15% OFF',
    status_ar: 'قيد التنفيذ',
    status: 'In Progress',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80'
  },
  {
    t: 'Administrative Office',
    t_ar: 'مكتب إداري',
    n: 'Administrative Office - KE1F8A23',
    n_ar: 'مكتب إداري - KE1F8A23',
    a: 'New Administrative Capital',
    a_ar: 'العاصمة الادارية الجديدة',
    p: 3139500,
    old_p: 3729726,
    b: 3,
    h: 2,
    s: 140,
    floor_ar: 'الطابق 8',
    floor: 'Floor 8',
    project_ar: 'مشروع كينترو',
    project: 'Kintro Project',
    disc_ar: '15% خصم',
    disc: '15% OFF',
    status_ar: 'قيد التنفيذ',
    status: 'In Progress',
    img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=700&q=80'
  },
  {
    t: 'Administrative Office',
    t_ar: 'مكتب إداري',
    n: 'Administrative Office - KE1F5A15',
    n_ar: 'مكتب إداري - KE1F5A15',
    a: 'New Administrative Capital',
    a_ar: 'العاصمة الادارية الجديدة',
    p: 4680000,
    old_p: 5559040,
    b: 4,
    h: 3,
    s: 195,
    floor_ar: 'الطابق 5',
    floor: 'Floor 5',
    project_ar: 'مشروع كينترو',
    project: 'Kintro Project',
    disc_ar: '15% خصم',
    disc: '15% OFF',
    status_ar: 'قيد التنفيذ',
    status: 'In Progress',
    img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=80'
  },
  {
    t: 'Commercial Store',
    t_ar: 'محل تجاري',
    n: 'Commercial Retail - 06',
    n_ar: 'محل تجاري - 06',
    a: 'New Damietta',
    a_ar: 'دمياط الجديدة',
    p: 2475000,
    old_p: null,
    b: 1,
    h: 1,
    s: 95,
    floor_ar: 'ميزانين',
    floor: 'Mezzanine',
    project_ar: 'مشروع كينترو',
    project: 'Kintro Project',
    disc_ar: '15% خصم',
    disc: '15% OFF',
    status_ar: null,
    status: null,
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80'
  },
  {
    t: 'Apartment',
    t_ar: 'شقة',
    n: 'Modern Apartment in New Cairo',
    n_ar: 'شقة عصرية في القاهرة الجديدة',
    a: 'New Cairo, Cairo',
    a_ar: 'القاهرة الجديدة، القاهرة',
    p: 3200000,
    old_p: 3850000,
    b: 3,
    h: 2,
    s: 160,
    floor_ar: 'الطابق 2',
    floor: 'Floor 2',
    project_ar: 'مشروع إعمار',
    project: 'Emaar Project',
    disc_ar: '10% خصم',
    disc: '10% OFF',
    status_ar: 'قيد التنفيذ',
    status: 'In Progress',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80'
  },
  {
    t: 'Villa',
    t_ar: 'فيلا',
    n: 'Luxury Villa in Sheikh Zayed',
    n_ar: 'فيلا فاخرة في الشيخ زايد',
    a: 'Sheikh Zayed, Giza',
    a_ar: 'الشيخ زايد، الجيزة',
    p: 8500000,
    old_p: 9800000,
    b: 4,
    h: 3,
    s: 350,
    floor_ar: 'أرضي + أول',
    floor: 'Ground + 1',
    project_ar: 'مشروع بالم هيلز',
    project: 'Palm Hills Project',
    disc_ar: '15% خصم',
    disc: '15% OFF',
    status_ar: 'قيد التنفيذ',
    status: 'In Progress',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=700&q=80'
  }
];

// Assign IDs to properties & initialize recommended and favorites
props.forEach((p, idx) => { p.id = idx; });

// Global Property Cache for real listings from parquet
const propertyCache = {};
const FAV_STORAGE_KEY = 'egy_real_user_favorites';
let favoritesSet = new Set();
try {
  const stored = localStorage.getItem(FAV_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      favoritesSet = new Set(parsed.map(x => parseInt(x, 10)).filter(x => !isNaN(x)));
    }
  }
} catch (e) {
  console.warn('Could not read favorites from localStorage:', e);
}

function saveFavoritesToStorage() {
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify([...favoritesSet]));
  } catch (e) {
    console.warn('Could not save favorites to localStorage:', e);
  }
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let ar = true;

const fmt = p => typeof p === 'number' ? ('EGP ' + (Number.isInteger(p) ? p.toLocaleString('en-US') : p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))) : p;

const PROP_TYPE_AR = {
  'Apartment': 'شقة',
  'Standalone Villa': 'فيلا مستقلة',
  'Villa': 'فيلا',
  'Townhouse': 'تاون هاوس',
  'Twin House': 'توين هاوس',
  'Chalet': 'شاليه',
  'Duplex': 'دوبلكس',
  'Penthouse': 'بنتهاوس',
  'Studio': 'استوديو',
  'iVilla': 'آي فيلا',
  'Office Space': 'مكتب إداري',
  'Shop': 'محل تجاري',
  'Clinic': 'عيادة',
  'Retail': 'تجاري تجزئة',
  'Warehouse': 'مستودع',
  'Factory': 'مصنع'
};

/* ===== I18N DICTIONARY ===== */
const i18n = {
  en: {
    nav_home: 'Home',
    nav_props: 'User Preferences',
    lbl_saved_props: 'Saved Properties',
    pill_all: 'All',
    pill_apartments: 'Apartments',
    pill_villas: 'Villas',
    pill_chalets: 'Chalets',
    fav_search_ph: 'Search saved properties...',
    fav_sort_recent: 'Recently Saved',
    fav_sort_price_asc: 'Price: Low to High',
    fav_sort_price_desc: 'Price: High to Low',
    fav_sort_size_desc: 'Size: Largest First',
    btn_fav_compare: 'Compare Top Matches',
    fav_smart_label: 'Smart Summary:',
    fav_smart_default: 'Your saved properties are concentrated in North Coast and New Cairo. Compare top matches?',
    btn_explore_rec_text: 'Explore Recommendations & Add Favorites',
    btn_demo_fav: 'Add 3 demo properties to try the feature',
    btn_explore_rec: 'Explore Recommendations & Add Favorites',
    lbl_view_all_rec: 'View all properties in Recommendations',
    lbl_eval_low: 'Lower',
    lbl_eval_high: 'Higher',
    det_price_eval_title: 'Smart Price Analysis',
    sort_sim: 'Most Relevant (AI Similarity)',
    user_guest: 'Platform Guest',
    user_role: 'Active User',
    unit_sqm: 'sqm',
    chat_ph: 'Ask about any details or properties...',
    nav_rec: 'Recommendations',
    nav_pred: 'Price Prediction',
    nav_chat: 'AI Assistant',
    nav_about: 'About',
    sign_in: 'Sign In',

    h_title: 'Find Your Perfect Property in Egypt',
    h_sub: 'AI-powered recommendations, accurate price predictions, and thousands of real estate listings across Egypt.',
    search: 'Search',
    lbl_type: 'Property Type',
    lbl_loc: 'Location',
    lbl_budget: 'Budget (EGP)',
    lbl_beds: 'Bedrooms',
    opt_any: 'Any',
    opt_apt: 'Apartment',
    opt_villa: 'Villa',
    opt_town: 'Townhouse',
    opt_chalet: 'Chalet',
    opt_newcairo: 'New Cairo',
    opt_zayed: 'Sheikh Zayed',
    opt_ncoast: 'North Coast',
    opt_maadi: 'Maadi',
    opt_b1: 'Up to 3M',
    opt_b2: '3M – 6M',
    opt_b3: '6M+',

    tag_rec: 'Smart Match',
    tag_pred: 'ML Valuation',
    tag_chat: 'AI Assistant',
    tag_props: 'Live Database',

    feat_rec_t: 'AI Recommendations',
    feat_rec_d: 'Find properties that match your preferences',
    feat_pred_t: 'Price Prediction',
    feat_pred_d: 'Get AI-powered price estimates',
    feat_chat_t: 'Conversational Assistant',
    feat_chat_d: 'Ask anything about Egyptian real estate',
    feat_props_t: '60K+ Properties',
    feat_props_d: 'Explore listings across all governorates',

    how_title: 'How it works',
    how_1_t: '1. Share your preferences',
    how_1_d: 'Set budget, area, size and must-have amenities.',
    how_2_t: '2. Review matched homes',
    how_2_d: 'See each match with a similarity score and the reasons behind it.',
    how_3_t: '3. Contact the owner',
    how_3_d: 'Message the listing owner directly and arrange a viewing.',

    pop_title: 'Popular properties',
    rev_title: 'What clients say',
    rev_1: 'We compared 40 listings in a weekend. The match explanations saved us weeks.',
    rev_1_a: 'Mona & Karim, New Cairo',
    rev_2: 'The price estimate helped me negotiate EGP 400,000 off a Sheikh Zayed villa.',
    rev_2_a: 'Hossam A., buyer',
    rev_3: 'I listed my apartment at a realistic price and sold in three weeks.',
    rev_3_a: 'Nadine S., seller',

    filter_title: 'Search Properties',
    filter_type: 'Property Type',
    chk_apt: 'Apartment',
    chk_villa: 'Villa',
    chk_town: 'Townhouse',
    chk_chalet: 'Chalet',
    chk_duplex: 'Duplex',
    chk_land: 'Land',
    chk_comm: 'Commercial',
    filter_loc: 'Location',
    gov_cairo: 'Cairo',
    gov_giza: 'Giza',
    gov_matrouh: 'Matrouh',
    city_newcairo: 'New Cairo',
    city_zayed: 'Sheikh Zayed',
    area_any: 'Any area',
    filter_price: 'Price Range (EGP)',
    filter_beds: 'Bedrooms',
    pill_any: 'Any',
    filter_amenities: 'Amenities',
    chk_pool: 'Swimming Pool',
    chk_parking: 'Parking',
    chk_security: 'Security',
    chk_garden: 'Garden',
    cat_all: 'All Categories',
    cat_buy: 'Residential - Buy',
    cat_rent: 'Residential - Rent',
    cat_comm_buy: 'Commercial - Buy',
    cat_comm_rent: 'Commercial - Rent',

    lbl_prop_type: 'Property Type',
    sub_prop_type: 'Select property classification for best recommendations',
    sub_loc: 'Select city or area in Egypt',
    lbl_specs_cond: 'Specifications & Conditions',
    sub_specs_cond: 'Specify property size, bedrooms, bathrooms and amenities',

    lbl_budget_egp: 'Budget (EGP)',
    ph_min_price: 'Min Price',
    ph_max_price: 'Max Price',
    lbl_size_m2: 'Size (m²)',
    ph_min_size: 'Min Size',
    ph_max_size: 'Max Size',
    lbl_baths: 'Bathrooms',
    opt_all: 'All',

    lbl_amenities: 'Amenities & Features (Multi-select):',
    amenity_balcony: 'Balcony',
    amenity_security: 'Security 24/7',
    amenity_ac: 'Central A/C',
    amenity_parking: 'Covered Parking',
    amenity_pool: 'Private Pool',
    amenity_gym: 'Shared Gym',
    amenity_elevator: 'Elevator',
    amenity_garden: 'Private Garden',
    amenity_kitchen: 'Kitchen Appliances',

    btn_recommend_search: 'Search Top Recommendations',
    sort_similarity: 'Top Match (AI Similarity)',
    load_more: 'Load More Recommendations',
    rec_no_results_t: 'No matching properties found for these filters',
    rec_no_results_d: 'Try broadening your budget range or selecting a different location.',

    search_ph: 'Search by area, compound, or keyword...',
    search_compounds_ph: 'Search by compound, location, developer...',
    badge_new: 'New',
    btn_units: 'Switch to Units',
    btn_map: 'Show Map',
    sort_label: 'Sort',
    filter_areas: 'Areas',
    filter_devs: 'Developers',
    filter_saletype: 'Sale Type',
    filter_clear: 'Clear',
    show_more: 'Show more',
    dev_sodic: 'SODIC',
    dev_hydepark: 'Hyde Park',
    dev_mountainview: 'Mountain View',
    dev_orascom: 'Orascom',
    sale_dev: 'Developer',
    sale_resale: 'Resale',
    sale_nawy: 'Nawy Now',
    loc_newcapital: 'New Administrative Capital',
    props_found: 'compounds and properties found',
    sort_rel: 'Sort by: Most Relevant',
    sort_low: 'Price: low to high',
    sort_high: 'Price: high to low',

    props_main_title: 'Your Properties & Smart Matches',
    props_main_sub: 'Explore AI-recommended properties matched to your preferences, track your favorites, or search thousands of listings.',
    rec_search_sub: 'Explore thousands of recommended properties and compounds across Egypt, search by compound, location, or developer.',
    props_badge: 'AI Property Experience',
    tab_props_rec: 'Recommended for You',
    tab_props_fav: 'Favorite Properties',
    tab_props_all: 'All Properties & Compounds',
    tag_ai: 'AI Match',
    rec_ai_active: '98% Active Match',
    rec_section_title: 'Top Properties Recommended for You',
    rec_heart_hint: 'Automatically saved to your favorites with a heart badge',
    fav_section_title: 'Saved Favorite Properties',
    fav_section_sub: 'Properties you favorited to compare and contact owners.',
    fav_empty_t: 'No favorite properties yet',
    fav_empty_d: 'Click the heart ❤️ icon on any property to save it to your favorites.',
    fav_empty_btn: 'Browse Recommended Properties',

    crumb_home: 'Home',
    crumb_props: 'Properties',
    det_photo_main: 'Main photo',
    det_tag_sale: 'For Sale',
    det_contact: 'Contact Owner',
    det_save: 'Save',
    tab_overview: 'Overview',
    tab_amenities: 'Amenities',
    tab_location: 'Location',
    tab_similar: 'Similar Properties',
    det_desc_t: 'Description',
    det_desc_p: 'A modern apartment in a prime location in New Cairo with high-end finishing and access to all essential services. Open kitchen, large windows, and a quiet street.',
    map_ph: 'Map placeholder',
    amen_pool: 'Pool',
    amen_gym: 'Gym',
    amen_parking: 'Parking',
    amen_sec: '24/7 Security',
    amen_garden: 'Garden',
    amen_ac: 'Central AC',

    rec_title: 'Recommended Properties',
    rec_sub: 'Properties similar to your preferences',
    rec_pref_t: 'Your Preferences',
    rec_pref_1: 'Apartment',
    rec_pref_2: 'New Cairo',
    rec_pref_3: 'Up to 3,000,000 EGP',
    rec_pref_4: '3 bedrooms',
    rec_edit: 'Edit Preferences',
    rec_why_t: 'Why these homes?',
    rec_why_p: 'They are within 8% of your budget, in your preferred area, and have the three bedrooms you asked for.',

    pred_title: 'Property Price Prediction',
    pred_main_title: 'Property Price Prediction',
    pred_main_sub: 'Smart real estate market valuation in Egypt',
    pred_ai_badge: 'AI Powered',
    pred_specs_title: 'Property Specifications',
    pred_specs_sub: 'Set specifications for accurate valuation',
    lbl_prop_type: 'Property Type',
    hint_prop_type: 'Select property classification for best accuracy',
    hint_loc: 'Select city or district in Egypt',
    btn_calc_price: 'Calculate Estimated Price',
    btn_calc_another: 'Calculate Another Property',
    pred_awaiting_title: 'Awaiting Property Details',
    pred_awaiting_desc: 'Set the property specifications in the sidebar form, then click "Calculate Estimated Price" to run instant AI valuation, charts, and factor impact.',
    ph_chip_instant: 'Instant AI Valuation',
    ph_chip_shap: 'SHAP Factor Impact',
    ph_chip_sim: 'Compare with 62k+ Properties',
    stat_area_comp: 'Area Comparison',
    stat_meter_price: 'Price per m²',
    stat_pred_price: 'Estimated Price',
    lbl_likely_range: 'Likely Range',
    title_feat_imp: 'Feature Importance',
    title_shap: 'Factor Impact on Price (SHAP)',
    unit_egp: 'EGP',
    card_market_dist: 'Market Comparison',
    lbl_market_area: 'Area Avg',
    lbl_market_mine: 'Your Property',
    lbl_market_top: 'Top Price',
    card_scenario: 'Try Different Scenario',
    badge_live_update: 'Live Update',
    lbl_extra_rooms: 'Extra Rooms',
    card_similar_props: 'Similar Properties',

    pred_sub: 'Get an AI-powered estimated price for any property in Egypt.',
    pred_step_1_t: 'Transaction Type & Purpose',
    pred_step_1_sub: 'Select the desired real estate operation',
    cat_buy: 'Residential - Buy',
    cat_rent: 'Residential - Rent',
    cat_comm_buy: 'Commercial - Buy',
    cat_comm_rent: 'Commercial - Rent',

    pred_step_2_t: 'Property Type',
    pred_step_2_sub: 'Choose property classification for accurate estimation',
    pred_step_loc_sub: 'Choose city or district in Egypt',

    pred_step_3_t: 'Specifications & Details',
    pred_step_3_sub: 'Specify area, rooms, and bathrooms',
    lbl_size: 'Size (m²)',
    ph_size: 'e.g. 150',
    unit_m2: 'm²',
    hint_size: 'Between 20 and 10,000 m²',
    lbl_beds: 'Bedrooms',
    lbl_beds_office: 'Number of Rooms / Offices',
    lbl_baths: 'Bathrooms',
    lbl_restrooms: 'Restrooms',
    lbl_loc: 'Location',
    btn_toggle_map: 'Locate on Map',
    map_pin_hint: 'Click on the map to position coordinates precisely',

    btn_predict_ai: 'Predict Price with AI',
    btn_predict_loading: 'Calculating estimate with AI...',

    pred_res_badge: 'Estimated Market Price',
    pred_conf_high: 'High Confidence Estimate (94%)',
    currency_egp: 'EGP',
    pred_range_lbl: 'Expected Price Range:',
    unit_egp_total: 'EGP (Total Value)',
    unit_egp_month: 'EGP / month',
    factor_loc: 'Location Valuation',
    factor_area: 'Size & Layout',
    factor_demand: 'Market Demand',
    pred_disclaimer: 'This is an estimated price based on Egyptian real estate ML analysis.',

    chat_new: 'New Chat',
    chat_history_btn: 'History',
    chat_new_chat_btn: 'New chat',
    chat_grp_today: 'TODAY',
    chat_grp_7days: 'PREVIOUS 7 DAYS',
    chat_grp_earlier: 'EARLIER',

    chat_h1: 'Apartment in New Cairo',
    chat_h2: 'Villa prices in Sheikh Zayed',
    chat_h3: 'Best compounds for families',
    chat_h4: 'Compare two properties',
    chat_h5: 'Is this property overpriced?',
    chat_h6: 'Chalets in North Coast',
    chat_h7: 'Investment opportunities',
    chat_title: 'AI Real Estate Assistant',
    chat_subtitle: 'Online · AI Powered Egyptian Property Advisor',
    chat_bot_intro: "Hello! I'm the EGY DEVELOPMENT AI Assistant. I can help you find properties, recommend similar listings, predict prices, compare properties, and answer any questions about the Egyptian real estate market. How can I help you today?",
    chat_user_demo: "I'm looking for an apartment in New Cairo under 3 million with 3 bedrooms.",
    chat_bot_demo: "Here are some great options for you:",
    prompt_1: 'Find villas in Sheikh Zayed',
    prompt_2: 'Is 3.2M fair for 160 m²?',
    prompt_3: 'Best areas for families',
    chat_input_ph: 'Ask anything about properties...',

    about_title: 'About EGY DEVELOPMENT',
    about_p: 'EGY DEVELOPMENT is a graduation project exploring how machine learning can make Egyptian property search clearer: matching buyers to homes, estimating fair prices, and answering questions in plain language.',
    foot_sub: 'Cairo, Egypt · hello@egydevelopment.example',
    foot_copy: '© 2026 EGY DEVELOPMENT.',
    foot_desc: 'Next-generation AI real estate platform in Egypt. Smart property recommendations, machine learning valuation, and conversational search.',
    foot_badge: 'AI Real Estate Platform 2026',
    foot_quick: 'Quick Links',
    foot_locs: 'Top Areas',
    foot_contact: 'Contact Us',
    lbl_location: 'Location',
    lbl_email: 'Email',
    lbl_phone: 'Phone',
    foot_city: 'Cairo, Egypt',
    foot_rights: '© 2026 EGY DEVELOPMENT. All rights reserved.',
    foot_privacy: 'Privacy Policy',
    foot_terms: 'Terms of Service',
    loc_october: '6th of October',
    view_more: 'View More',

    cat_all: 'All',
    cat_buy: 'Residential - Buy',
    cat_rent: 'Residential - Rent',
    cat_comm_buy: 'Commercial - Buy',
    cat_comm_rent: 'Commercial - Rent',
    lbl_prop_type: 'Property Type',
    sub_prop_type: 'Select property classification for best recommendations',
    sub_loc: 'Choose city or region in Egypt',
    lbl_specs_cond: 'Specifications & Conditions',
    sub_specs_cond: 'Specify property size, rooms, and must-have amenities',
    lbl_budget_egp: 'Budget (EGP)',
    ph_min_price: 'Min Price',
    ph_max_price: 'Max Price',
    lbl_size_m2: 'Size (m²)',
    ph_min_size: 'Min size',
    ph_max_size: 'Max size',
    lbl_baths: 'Bathrooms',
    opt_all: 'All',
    lbl_amenities: 'Amenities & Services (Multi-select):',
    amenity_balcony: 'Balcony',
    amenity_security: '24/7 Security',
    amenity_ac: 'Central A/C',
    amenity_parking: 'Covered Parking',
    amenity_pool: 'Private Pool',
    amenity_gym: 'Gym',
    amenity_elevator: 'Elevator',
    amenity_garden: 'Private Garden',
    amenity_kitchen: 'Kitchen Appliances',
    btn_recommend_search: 'Search Best Recommendations',
    sort_similarity: 'Most Relevant (AI Similarity)',
    load_more: 'Load More',
    rec_no_results_t: 'No matching properties found for these filters',
    rec_no_results_d: 'Try widening your budget range or selecting another city for better recommendations.'
  },
  ar: {
    nav_home: 'الرئيسية',
    nav_props: 'تفضيلات المستخدم',
    lbl_saved_props: 'عقارات محفوظة',
pill_all: 'الكل',
    pill_apartments: 'شقق',
    pill_villas: 'فيلات',
    pill_chalets: 'شاليهات',
    fav_search_ph: 'ابحث في العقارات المحفوظة...',
    fav_sort_recent: 'الأحدث حفظاً',
    fav_sort_price_asc: 'السعر: من الأقل للأعلى',
    fav_sort_price_desc: 'السعر: من الأعلى للأقل',
    fav_sort_size_desc: 'المساحة: الأكبر أولاً',
    btn_fav_compare: 'مقارنة أفضل الوحدات',
    fav_smart_label: 'رؤية ذكية:',
    fav_smart_default: 'عقاراتك المحفوظة تتركز في الساحل الشمالي والقاهرة الجديدة. هل ترغب بمقارنتها؟',
    btn_demo_fav: 'أضف 3 عقارات تجريبية لتجربة الميزة',
    btn_explore_rec: 'استكشاف التوصيات وإضافة عقارات',
    lbl_view_all_rec: 'عرض كل العقارات في التوصيات',
    lbl_eval_low: 'أقل',
    lbl_eval_high: 'أعلى',
    det_price_eval_title: 'تحليل السعر الذكي',
    sort_sim: 'الأكثر صلة (AI Similarity)',
    user_guest: 'ضيف المنصة',
    user_role: 'مستخدم نشط',
    unit_sqm: 'م²',
    chat_ph: 'اسأل عن أي تفاصيل...',
    btn_explore_rec_text: 'استكشاف التوصيات وإضافة عقارات',
    nav_rec: 'التوصيات',
    nav_pred: 'توقع السعر',
    nav_chat: 'المساعد الذكي',
    nav_about: 'عن المشروع',
    sign_in: 'تسجيل الدخول',

    h_title: 'اعثر على عقارك المثالي في مصر',
    h_sub: 'توصيات مدعومة بالذكاء الاصطناعي، وتوقعات دقيقة للأسعار، وآلاف الإعلانات العقارية في جميع أنحاء مصر.',
    search: 'بحث',
    lbl_type: 'نوع العقار',
    lbl_loc: 'الموقع',
    lbl_budget: 'الميزانية (ج.م)',
    lbl_beds: 'غرف النوم',
    opt_any: 'الكل',
    opt_apt: 'شقة',
    opt_villa: 'فيلا',
    opt_town: 'تاون هاوس',
    opt_chalet: 'شاليه',
    opt_newcairo: 'القاهرة الجديدة',
    opt_zayed: 'الشيخ زايد',
    opt_ncoast: 'الساحل الشمالي',
    opt_maadi: 'المعادي',
    opt_b1: 'حتى 3 مليون',
    opt_b2: '3 – 6 مليون',
    opt_b3: 'أكثر من 6 مليون',

    tag_rec: 'ترشيحات ذكية',
    tag_pred: 'تقدير سعر بالذكاء الاصطناعي',
    tag_chat: 'مساعد حواري ذكي',
    tag_props: 'داتاسيت حية ومحدثة',

    feat_rec_t: 'توصيات الذكاء الاصطناعي',
    feat_rec_d: 'اعثر على عقارات تناسب تفضيلاتك بدقة',
    feat_pred_t: 'توقع الأسعار',
    feat_pred_d: 'احصل على تقديرات سعرية ذكية ومدروسة',
    feat_chat_t: 'المساعد الحواري الذكي',
    feat_chat_d: 'اسأل عن أي شيء يخص العقارات في مصر',
    feat_props_t: '+60 ألف عقار',
    feat_props_d: 'استكشف آلاف العقارات في جميع المحافظات',

    how_title: 'كيف يعمل الموقع',
    how_1_t: '1. حدد تفضيلاتك',
    how_1_d: 'اختر الميزانية، المنطقة، المساحة، والخدمات الأساسية.',
    how_2_t: '2. استعرض العقارات المطابقة',
    how_2_d: 'شاهد نسبة التطابق وأسباب ترشيح كل عقار بالتفصيل.',
    how_3_t: '3. تواصل مع المالك مباشرة',
    how_3_d: 'تواصل مع صاحب الإعلان ورتّب لميعاد المعاينة بسهولة.',

    pop_title: 'عقارات مميزة وشائعة',
    rev_title: 'ماذا يقول عملاؤنا',
    rev_1: 'قارنا بين 40 عقار في عطلة نهاية أسبوع واحدة. أسباب وتفاصيل الترشيح وفرت علينا أسابيع من البحث.',
    rev_1_a: 'منى وكريم، القاهرة الجديدة',
    rev_2: 'تقدير السعر بالذكاء الاصطناعي ساعدني في التفاوض ووفرت 400,000 ج.م في فيلا بالشيخ زايد.',
    rev_2_a: 'حسام أ.، مشتري',
    rev_3: 'عرضت شقتي بسعر واقعي مبني على تقييم المنصة وتم البيع خلال 3 أسابيع فقط.',
    rev_3_a: 'نادين س.، بائعة',

    filter_title: 'البحث في العقارات',
    filter_type: 'نوع العقار',
    chk_apt: 'شقة',
    chk_villa: 'فيلا',
    chk_town: 'تاون هاوس',
    chk_chalet: 'شاليه',
    chk_duplex: 'دوبلكس',
    chk_land: 'أرض',
    chk_comm: 'تجاري',
    filter_loc: 'الموقع',
    gov_cairo: 'القاهرة',
    gov_giza: 'الجيزة',
    gov_matrouh: 'مطروح',
    city_newcairo: 'القاهرة الجديدة',
    city_zayed: 'الشيخ زايد',
    area_any: 'كل المناطق',
    filter_price: 'نطاق السعر (جنيه)',
    filter_beds: 'غرف النوم',
    pill_any: 'الكل',
    filter_amenities: 'المرافق والخدمات',
    chk_pool: 'حمام سباحة',
    chk_parking: 'موقف سيارات',
    chk_security: 'أمن وحراسة',
    chk_garden: 'حديقة',
    search_ph: 'ابحث بالمنطقة، الكمبوند، أو كلمة مفتاحية...',
    search_compounds_ph: 'البحث بالكمبوند، الموقع، المطور العقاري...',
    badge_new: 'جديد',
    btn_units: 'تغيير إلى وحدات',
    btn_map: 'إظهار الخريطة',
    sort_label: 'الترتيب',
    filter_areas: 'مناطق',
    filter_devs: 'مطورين',
    filter_saletype: 'نوع البيع',
    filter_clear: 'إلغاء',
    show_more: 'عرض المزيد',
    dev_sodic: 'سوديك',
    dev_hydepark: 'هايد بارك',
    dev_mountainview: 'ماونتن فيو',
    dev_orascom: 'أوراسكوم',
    sale_dev: 'المطور',
    sale_resale: 'إعادة البيع',
    sale_nawy: 'ناوي ناو',
    loc_newcapital: 'العاصمة الإدارية الجديدة',
    props_found: 'عقار وكمبوند متاح',
    sort_rel: 'ترتيب حسب: الأكثر صلة',
    sort_low: 'السعر: من الأقل للأعلى',
    sort_high: 'السعر: من الأعلى للأقل',

    props_main_title: 'عقاراتك وتفضيلاتك الذكية',
    props_main_sub: 'استعرض العقارات المقترحة خصيصاً لك بناءً على تفضيلاتك، وتابع قائمتك المفضلة، أو تصفح قاعدة البيانات العقارية الكاملة.',
    rec_search_sub: 'استكشف آلاف العقارات والكمبوندات الموصى بها في جميع المحافظات، وابحث بالكمبوند، الموقع، أو المطور العقاري.',
    props_badge: 'تجربة عقارية ذكية ومخصصة',
    tab_props_rec: 'عقارات تم اقتراحها',
    tab_props_fav: 'العقارات المفضلة',
    tab_props_all: 'جميع العقارات والكمبوندات',
    tag_ai: 'ترشيح ذكي',
    rec_ai_active: 'تطابق نشط 98%',
    rec_section_title: 'أفضل العقارات المقترحة لك',
    rec_heart_hint: 'تم تمييزها برمز القلب تلقائياً لحفظها في مفضلتك',
    fav_section_title: 'العقارات المحفوظة في المفضلة',
    fav_section_sub: 'العقارات التي قمت بتمييزها برمز القلب للرجوع إليها ومقارنتها والتواصل مع الملاك.',
    fav_empty_t: 'لا توجد عقارات في المفضلة حالياً',
    fav_empty_d: 'انقر على أيقونة القلب ❤️ على أي عقار لإضافته إلى مفضلتك والرجوع إليه في أي وقت.',
    fav_empty_btn: 'استعراض العقارات المقترحة',

    crumb_home: 'الرئيسية',
    crumb_props: 'العقارات',
    det_photo_main: 'الصورة الرئيسية',
    det_tag_sale: 'للبيع',
    det_contact: 'تواصل مع المالك',
    det_save: 'حفظ العقار',
    tab_overview: 'نظرة عامة',
    tab_amenities: 'المرافق',
    tab_location: 'الموقع',
    tab_similar: 'عقارات مشابهة',
    det_desc_t: 'الوصف',
    det_desc_p: 'شقة عصرية بموقع استراتيجي متميز في القاهرة الجديدة بتشطيب سوبر لوكس وقريبة من كافة الخدمات الحيوية. مطبخ أمريكان مفتوح، نوافذ واسعة، وشارع هادئ.',
    map_ph: 'خريطة الموقع',
    amen_pool: 'حمام سباحة',
    amen_gym: 'صالة رياضية (جيم)',
    amen_parking: 'موقف سيارات',
    amen_sec: 'أمن وحراسة 24/7',
    amen_garden: 'حديقة خاصة',
    amen_ac: 'تكييف مركزي',

    rec_title: 'العقارات الموصى بها',
    rec_sub: 'عقارات مطابقة ومخصصة لتفضيلاتك واحتياجاتك',
    rec_pref_t: 'تفضيلاتك المحددة',
    rec_pref_1: 'شقة',
    rec_pref_2: 'القاهرة الجديدة',
    rec_pref_3: 'حتى 3,000,000 ج.م',
    rec_pref_4: '3 غرف نوم',
    rec_edit: 'تعديل التفضيلات',
    rec_why_t: 'لماذا هذه العقارات؟',
    rec_why_p: 'تقع هذه العقارات ضمن نطاق 8% من ميزانيتك المحددة، وفي منطقتك المفضلة، وتحتوي على 3 غرف نوم تماماً كما طلبت.',

    pred_title: 'توقع أسعار العقارات',
    pred_main_title: 'تقدير أسعار العقارات',
    pred_main_sub: 'تحليل ذكي لسعر العقار في السوق المصري',
    pred_ai_badge: 'مدعوم بالذكاء الاصطناعي',
    pred_specs_title: 'مواصفات العقار',
    pred_specs_sub: 'حدد البيانات للحصول على تقدير دقيق',
    lbl_prop_type: 'نوع العقار',
    hint_prop_type: 'اختر تصنيف العقار بدقة لتقدير أفضل',
    hint_loc: 'اختر المدينة أو المنطقة في مصر',
    btn_calc_price: 'احسب السعر المتوقع',
    btn_calc_another: 'احسب سعر عقار آخر',
    pred_awaiting_title: 'في انتظار إدخال البيانات',
    pred_awaiting_desc: 'حدد مواصفات العقار في النموذج الجانبي، ثم اضغط على زر «احسب السعر المتوقع» لبدء التحليل الفوري بالذكاء الاصطناعي وعرض التقييم المالي وتأثير العوامل.',
    ph_chip_instant: 'تسعير ذكي فوري',
    ph_chip_shap: 'تحليل تفصيلي SHAP',
    ph_chip_sim: 'مقارنة بأكثر من 62 ألف عقار',
    stat_area_comp: 'مقارنة بالمنطقة',
    stat_meter_price: 'سعر المتر',
    stat_pred_price: 'السعر المتوقع',
    lbl_likely_range: 'النطاق المحتمل',
    title_feat_imp: 'أهمية العوامل',
    title_shap: 'تأثير العوامل على السعر (SHAP)',
    unit_egp: 'جنيه مصري',
    card_market_dist: 'مقارنة بالسوق',
    lbl_market_area: 'المنطقة',
    lbl_market_mine: 'عقارك',
    lbl_market_top: 'الأعلى',
    card_scenario: 'جرّب سيناريو مختلف',
    badge_live_update: 'السعر يتحدث لحظياً',
    lbl_extra_rooms: 'غرف إضافية',
    card_similar_props: 'عقارات مشابهة',

    pred_sub: 'احصل على سعر تقديري دقيق مدعوم بنماذج الذكاء الاصطناعي لأي عقار في مصر.',
    pred_step_1_t: 'نوع المعاملة / الغرض',
    pred_step_1_sub: 'اختر نوع العملية العقارية المطلوبة',
    cat_buy: 'سكني - شراء',
    cat_rent: 'سكني - إيجار',
    cat_comm_buy: 'تجاري - شراء',
    cat_comm_rent: 'تجاري - إيجار',

    pred_step_2_t: 'نوع العقار',
    pred_step_2_sub: 'اختر تصنيف العقار بدقة لتقدير أفضل',
    pred_step_loc_sub: 'اختر المدينة أو المنطقة في مصر',

    pred_step_3_t: 'المواصفات والحقول المشروطة',
    pred_step_3_sub: 'حدد مساحة العقار والغرف والحمامات',
    lbl_size: 'المساحة (م²)',
    ph_size: 'مثال: 150',
    unit_m2: 'م²',
    hint_size: 'بين 20 و 10,000 م²',
    lbl_beds: 'عدد غرف النوم',
    lbl_beds_office: 'عدد الغرف / المكاتب المغلقة',
    lbl_baths: 'عدد الحمامات',
    lbl_restrooms: 'دورات المياه',
    lbl_loc: 'الموقع الجغرافي',
    btn_toggle_map: 'تحديد على الخريطة',
    map_pin_hint: 'انقر على الخريطة لتحريك المؤشر وتحديد خطوط الطول والعرض بدقة',

    btn_predict_ai: 'توقع السعر بالذكاء الاصطناعي',
    btn_predict_loading: 'جاري التقدير بالذكاء الاصطناعي...',

    pred_res_badge: 'السعر التقديري المتوقع',
    pred_conf_high: 'دقة التقدير عالية (94%)',
    currency_egp: 'ج.م',
    pred_range_lbl: 'النطاق السعري المتوقع:',
    unit_egp_total: 'جنيه مصري (إجمالي القيمة)',
    unit_egp_month: 'جنيه مصري / شهرياً',
    factor_loc: 'تقييم الموقع',
    factor_area: 'المساحة والتقسيم',
    factor_demand: 'الطلب في السوق',
    pred_disclaimer: 'هذا السعر تقديري بناءً على تحليل بيانات السوق العقاري المصري باستخدام نماذج التعلم الآلي.',

    chat_new: 'محادثة جديدة',
    chat_history_btn: 'المحادثات',
    chat_new_chat_btn: 'محادثة جديدة',
    chat_grp_today: 'اليوم',
    chat_grp_7days: 'آخر 7 أيام',
    chat_grp_earlier: 'الأقدم',

    chat_h1: 'شقة في القاهرة الجديدة',
    chat_h2: 'أسعار الفلل في الشيخ زايد',
    chat_h3: 'أفضل كمبوندات للعائلات',
    chat_h4: 'مقارنة بين عقارين',
    chat_h5: 'هل هذا العقار مسعر بأعلى من قيمته؟',
    chat_h6: 'شاليهات في الساحل الشمالي',
    chat_h7: 'فرص استثمارية واعدة',
    chat_title: 'المساعد العقاري الذكي',
    chat_subtitle: 'نشط الآن · مستشارك العقاري الذكي في مصر',
    chat_bot_intro: 'أهلاً بك! أنا المساعد العقاري الذكي لمنصة EGY DEVELOPMENT. يمكنني مساعدتك في العثور على العقارات، واقتراح ترشيحات مناسبة، وتوقع الأسعار، ومقارنة العقارات والإجابة على أي استفسار يخص السوق العقاري المصري. كيف يمكنني مساعدتك اليوم؟',
    chat_user_demo: 'أبحث عن شقة في القاهرة الجديدة بسعر أقل من 3 مليون وبها 3 غرف نوم.',
    chat_bot_demo: 'إليك أفضل الخيارات المتاحة التي تطابق طلبك:',
    prompt_1: 'ابحث عن فلل في الشيخ زايد',
    prompt_2: 'هل 3.2 مليون سعر عادل لـ 160 م²؟',
    prompt_3: 'أفضل المناطق المناسبة للعائلات',
    chat_input_ph: 'اسأل عن أي شيء يخص العقارات...',

    about_title: 'عن منصة EGY DEVELOPMENT',
    about_p: 'مشروع EGY DEVELOPMENT هو مشروع تخرج يهدف إلى توظيف تقنيات تعلم الآلة (Machine Learning) لجعل البحث العقاري في مصر أكثر ذكاءً ووضوحاً: من خلال مطابقة المشترين بالعقارات المناسبة، وتقدير الأسعار العادلة بدقة، والمساعد الحواري الذكي.',
    foot_sub: 'القاهرة، مصر · hello@egydevelopment.example',
    foot_copy: '© 2026 EGY DEVELOPMENT.',
    foot_desc: 'منصة عقارية ذكية مدعومة بالذكاء الاصطناعي في مصر. توصيات عقارية دقيقة، وتثمين بالذكاء الاصطناعي، وبحث حواري متطور.',
    foot_badge: 'منصة عقارية بالذكاء الاصطناعي 2026',
    foot_quick: 'روابط سريعة',
    foot_locs: 'أشهر المناطق',
    foot_contact: 'تواصل معنا',
    lbl_location: 'الموقع',
    lbl_email: 'البريد الإلكتروني',
    lbl_phone: 'الهاتف',
    foot_city: 'القاهرة، مصر',
    foot_rights: '© 2026 EGY DEVELOPMENT. جميع الحقوق محفوظة.',
    foot_privacy: 'سياسة الخصوصية',
    foot_terms: 'الشروط والأحكام',
    loc_october: 'السادس من أكتوبر',
    view_more: 'عرض المزيد',

    cat_all: 'الكل',
    cat_buy: 'سكني - شراء',
    cat_rent: 'سكني - إيجار',
    cat_comm_buy: 'تجاري - شراء',
    cat_comm_rent: 'تجاري - إيجار',
    lbl_prop_type: 'نوع العقار',
    sub_prop_type: 'اختر تصنيف العقار بدقة لتقديم أفضل التوصيات',
    sub_loc: 'اختر المدينة أو المنطقة في مصر',
    lbl_specs_cond: 'المواصفات والحقول المشروطة',
    sub_specs_cond: 'حدد مساحة العقار والغرف والموقع الجغرافي والمرافق المطلوبة',
    lbl_budget_egp: 'الميزانية (جنيه مصري)',
    ph_min_price: 'الحد الأدنى',
    ph_max_price: 'الحد الأقصى',
    lbl_size_m2: 'المساحة (م²)',
    ph_min_size: 'أقل مساحة',
    ph_max_size: 'أكبر مساحة',
    lbl_baths: 'عدد الحمامات',
    opt_all: 'الكل',
    lbl_amenities: 'المرافق والخدمات (اختيار متعدد):',
    amenity_balcony: 'شرفة',
    amenity_security: 'أمن 24/7',
    amenity_ac: 'تكييف مركزي',
    amenity_parking: 'موقف مغطى',
    amenity_pool: 'حمام سباحة خاص',
    amenity_gym: 'جيم',
    amenity_elevator: 'مصعد',
    amenity_garden: 'حديقة خاصة',
    amenity_kitchen: 'أجهزة مطبخ',
    btn_recommend_search: 'البحث عن أفضل التوصيات',
    sort_similarity: 'الأكثر صلة (AI Similarity)',
    load_more: 'عرض المزيد (Load More)',
    rec_no_results_t: 'لم نجد عقارات مطابقة تماماً لهذه الفلاتر',
    rec_no_results_d: 'جرب توسيع نطاق الميزانية أو اختيار مدينة أخرى للحصول على أفضل التوصيات.'
  }
};

/* ===== PROPERTY CARDS (Matching Kintro Luxury Cards) ===== */
function card(x, i, score, forceFav) {
  const propId = x.id !== undefined ? x.id : i;
  const isFavorited = forceFav !== undefined ? forceFav : favoritesSet.has(propId);
  const name = ar ? (x.n_ar || x.n) : x.n;
  const loc = ar ? (x.a_ar || x.a) : x.a;
  const type = ar ? (x.t_ar || x.t) : x.t;
  const price = fmt(x.p);
  const oldPrice = x.old_p ? fmt(x.old_p) : '';
  const project = ar ? (x.project_ar || 'مشروع كينترو') : (x.project || 'Kintro Project');
  const discount = ar ? (x.disc_ar || '15% خصم') : (x.disc || '15% OFF');
  const status = ar ? (x.status_ar || '') : (x.status || '');
  const floor = ar ? (x.floor_ar || `الطابق ${(i % 8) + 1}`) : (x.floor || `Floor ${(i % 8) + 1}`);
  const imgUrl = x.img || `https://images.unsplash.com/photo-${[
    '1497366216548-37526070297c',
    '1497366811353-6870744d04b2',
    '1524758631624-e2822e304c36',
    '1600585154340-be6161a56a0c'
  ][i % 4]}?auto=format&fit=crop&w=700&q=80`;

  const matchBadge = score ? `<b class="score">${score}% ${ar ? 'تطابق' : 'match'}</b>` : '';
  const statusHtml = status ? `<span class="prop-status-btn">${status}</span>` : `<span></span>`;
  const oldPriceHtml = oldPrice ? `<span class="prop-old-price">${oldPrice}</span>` : '';
  const favClass = isFavorited ? 'fav on' : 'fav';
  const favIcon = isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  const favTitle = isFavorited ? (ar ? 'في المفضلة' : 'Saved to Favorites') : (ar ? 'إضافة إلى المفضلة' : 'Add to Favorites');

  return `<article class="card prop" data-prop-id="${propId}">
    <div class="prop-img-box" style="--img:url('${imgUrl}')">
      <div class="prop-badges">
        <span class="badge-project">${project}</span>
        <span class="badge-disc">${discount}</span>
      </div>
      <button class="prop-nav-arrow" aria-label="Previous"><i class="fa-solid fa-angle-left"></i></button>
      ${matchBadge}
      <button class="${favClass}" aria-label="Favorite" title="${favTitle}" data-prop-id="${propId}"><i class="${favIcon}"></i></button>
    </div>
    <div class="prop-body">
      <div class="prop-title-row">
        <h3 class="prop-title"><a href="#details">${name}</a></h3>
        <div class="prop-icon-circle" title="${type}"><i class="fa-regular fa-building"></i></div>
      </div>
      <p class="prop-loc"><i class="fa-solid fa-location-dot"></i> <span>${loc}</span></p>
      <div class="prop-specs">
        <span>• ${floor}</span>
      </div>
      <div class="prop-bottom-row">
        ${statusHtml}
        <div class="prop-pricing">
          ${oldPriceHtml}
          <strong class="prop-current-price">${price}</strong>
        </div>
      </div>
    </div>
  </article>`;
}

/* ===== COMPOUNDS DATA (Nawy-Style Projects) ===== */
const compounds = [
  {
    name_ar: 'مكادي هايتس',
    name: 'Makadi Heights',
    loc_ar: 'مكادي، الغردقة',
    loc: 'Makadi, Hurghada',
    desc_ar: 'اكتشف عقارات أوراسكوم مصر للتطوير العقاري في مكادي - مع أقساط تصل إلى 7 سنوات',
    desc: 'Discover Orascom properties in Makadi - with installments up to 7 years',
    types_ar: ['شقة', 'شاليه', 'تاون هاوس', 'توين هاوس', 'فيلا', '+3 أخرى'],
    types: ['Apartment', 'Chalet', 'Townhouse', 'Twinhouse', 'Villa', '+3 more'],
    dev_price: 11800000,
    resale_price: 3200000,
    dev_ar: 'أوراسكوم',
    dev: 'ORASCOM',
    img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
  },
  {
    name_ar: 'كولاج إيفوري',
    name: 'Collage Ivory',
    loc_ar: 'القاهرة الجديدة',
    loc: 'New Cairo',
    desc_ar: 'اكتشف عقارات بي آر إي للتطوير العقاري في القاهرة الجديدة - مع أقساط تصل إلى 8 سنوات',
    desc: 'Discover PRE Group properties in New Cairo - with installments up to 8 years',
    types_ar: ['شقة', 'دوبلكس', 'بنتهاوس'],
    types: ['Apartment', 'Duplex', 'Penthouse'],
    dev_price: 6740000,
    resale_price: null,
    dev_ar: 'بي آر إي',
    dev: 'PRE Group',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  },
  {
    name_ar: 'بيفت ليفنج',
    name: 'Beavitt Living',
    loc_ar: 'مدينة المستقبل، القاهرة الجديدة',
    loc: 'Mostakbal City, New Cairo',
    desc_ar: 'اكتشف عقارات باراجون، آدر في مدينة المستقبل - مع أقساط تصل إلى 10 سنوات',
    desc: 'Discover Paragon properties in Mostakbal City - with installments up to 10 years',
    types_ar: ['شقة', 'تاون هاوس', 'فيلا مستقلة'],
    types: ['Apartment', 'Townhouse', 'Standalone Villa'],
    dev_price: 8450000,
    resale_price: 4100000,
    dev_ar: 'باراجون',
    dev: 'PARAGON',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name_ar: 'فيليت سوديك',
    name: 'Villette SODIC',
    loc_ar: 'التجمع الخامس، القاهرة الجديدة',
    loc: '5th Settlement, New Cairo',
    desc_ar: 'كمبوند متكامل الخدمات من شركة سوديك مع مساحات خضراء شاسعة وأقساط تصل إلى 7 سنوات',
    desc: 'Integrated luxury compound by SODIC with vast green areas and up to 7-year payment plans',
    types_ar: ['شقة فاخرة', 'تاون هاوس', 'توين هاوس', 'فيلا'],
    types: ['Luxury Apt', 'Townhouse', 'Twinhouse', 'Villa'],
    dev_price: 14200000,
    resale_price: 5800000,
    dev_ar: 'سوديك',
    dev: 'SODIC',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  },
  {
    name_ar: 'هايد بارك',
    name: 'Hyde Park',
    loc_ar: 'القاهرة الجديدة',
    loc: 'New Cairo',
    desc_ar: 'مجتمع سكني راقٍ يمتد على 6 ملايين متر مربع مع أكبر حديقة مركزية في مصر',
    desc: 'Master-planned community spanning 6M sqm with the largest central park in Egypt',
    types_ar: ['شقة', 'دوبلكس', 'تاون هاوس', 'فيلا'],
    types: ['Apartment', 'Duplex', 'Townhouse', 'Villa'],
    dev_price: 9900000,
    resale_price: 4500000,
    dev_ar: 'هايد بارك',
    dev: 'Hyde Park',
    img: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name_ar: 'ماونتن فيو آي سيتي',
    name: 'Mountain View iCity',
    loc_ar: 'التجمع الخامس، القاهرة الجديدة',
    loc: 'New Cairo',
    desc_ar: 'تصميم أوروبي مبتكر يفصل حركة السيارات عن الحدائق والممرات السكنية بأقساط حتى 8 سنوات',
    desc: 'Innovative European architecture separating vehicles from green walkways with 8-year plans',
    types_ar: ['آي فيلا', 'شقة', 'تاون هاوس', 'فيلا مستقلة'],
    types: ['iVilla', 'Apartment', 'Townhouse', 'Villa'],
    dev_price: 7600000,
    resale_price: 3800000,
    dev_ar: 'ماونتن فيو',
    dev: 'Mountain View',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
  }
];

/* ===== COMPOUND CARD COMPONENT (Matching Nawy Image) ===== */
function compoundCard(x, i) {
  const name = ar ? (x.name_ar || x.n_ar || x.n) : (x.name || x.n);
  const loc = ar ? (x.loc_ar || x.a_ar || x.a) : (x.loc || x.a);
  const desc = ar ? (x.desc_ar || `اكتشف عقارات ${x.dev_ar || 'المطور'} - مع أقساط تصل إلى 7 سنوات`) : (x.desc || 'Discover premier properties with flexible payment plans');
  const devPrice = x.dev_price ? fmt(x.dev_price) : fmt(x.p);
  const resalePrice = x.resale_price ? fmt(x.resale_price) : (ar ? 'غير متوفر' : 'Not Available');
  const typesList = ar ? (x.types_ar || ['شقة', 'شاليه', 'تاون هاوس', 'فيلا']) : (x.types || ['Apartment', 'Chalet', 'Townhouse', 'Villa']);
  const devName = ar ? (x.dev_ar || 'مطور عقاري') : (x.dev || 'Developer');
  const imgUrl = x.img || `https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80`;

  return `<article class="compound-card">
    <div class="comp-img-wrap" style="--comp-img:url('${imgUrl}')">
      <div class="comp-img-actions">
        <button class="comp-act-btn fav" aria-label="Favorite" title="${ar ? 'حفظ' : 'Favorite'}"><i class="fa-regular fa-heart"></i></button>
      </div>
    </div>

    <div class="comp-details-wrap">
      <span class="comp-loc-sub">${loc}</span>
      <h3 class="comp-title"><a href="#details">${name}</a></h3>
      <p class="comp-desc">${desc}</p>
      <div class="comp-types-chips">
        ${typesList.map(t => `<span class="comp-chip">${t}</span>`).join('')}
      </div>
      <div class="comp-pricing-row">
        <div class="comp-price-col">
          <span class="comp-price-lbl">${ar ? 'مطور السعر الابتدائي' : 'Developer Starting Price'}</span>
          <b class="comp-price-val">${devPrice}</b>
        </div>
        <div class="comp-price-col">
          <span class="comp-price-lbl">${ar ? 'إعادة البيع السعر الابتدائي' : 'Resale Starting Price'}</span>
          <b class="comp-price-val ${resalePrice === 'غير متوفر' || resalePrice === 'Not Available' ? 'comp-price-na' : ''}">${resalePrice}</b>
        </div>
      </div>
    </div>
  </article>`;
}

const render = (el, l, off = 0, sc = 0) => {
  el.innerHTML = l.map((x, i) => card(x, i + off, sc)).join('');
};

function renderAllCards() {
  $$('[data-cards]').forEach(el => {
    const o = +(el.dataset.off || 0);
    render(el, props.slice(o % 6, o % 6 + +el.dataset.cards), o, el.hasAttribute('data-score') ? 97 : 0);
  });
}

const results = $('#results');
let viewMode = 'compounds'; // 'compounds' or 'units'
let compList = [...compounds];

const draw = () => {
  if (results) {
    if (viewMode === 'compounds') {
      results.className = 'compound-list';
      results.innerHTML = compList.map((x, i) => compoundCard(x, i)).join('');
    } else {
      results.className = 'grid g3';
      results.innerHTML = props.map((x, i) => card(x, i)).join('');
    }
  }
  const total = viewMode === 'compounds' ? (compList === compounds ? '62,977' : compList.length) : props.length;
  if ($('#count')) $('#count').textContent = `${total} ${ar ? (viewMode === 'compounds' ? 'عقار وكمبوند متاح' : 'عقار متاح') : (viewMode === 'compounds' ? 'compounds and properties found' : 'properties found')}`;
};

// Switch between compounds and units
const toggleViewBtn = $('#btn-toggle-view');
if (toggleViewBtn) {
  toggleViewBtn.onclick = () => {
    viewMode = viewMode === 'compounds' ? 'units' : 'compounds';
    toggleViewBtn.querySelector('span:last-child').textContent = viewMode === 'compounds'
      ? (ar ? 'تغيير إلى وحدات' : 'Switch to Units')
      : (ar ? 'تغيير إلى كمبوندات' : 'Switch to Compounds');
    draw();
  };
}

if ($('#sort')) {
  $('#sort').onchange = e => {
    compList = [...compounds];
    if (e.target.value == 1) compList.sort((a, b) => a.dev_price - b.dev_price);
    if (e.target.value == 2) compList.sort((a, b) => b.dev_price - a.dev_price);
    draw();
  };
}

if ($('#q')) {
  $('#q').oninput = e => {
    const q = e.target.value.toLowerCase();
    compList = compounds.filter(x => (x.name_ar + x.name + x.loc_ar + x.loc + (x.dev_ar || '') + (x.dev || '')).toLowerCase().includes(q));
    draw();
  };
}

// Sidebar clear buttons & pills
$$('.filter-clear').forEach(btn => {
  btn.onclick = () => {
    const sec = btn.closest('.filter-section');
    if (sec) {
      sec.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
      sec.querySelectorAll('.bed-pill').forEach(p => p.classList.remove('on'));
      const allPill = sec.querySelector('.bed-pill:last-child');
      if (allPill) allPill.classList.add('on');
    }
  };
});

$$('.bed-pill').forEach(btn => {
  btn.onclick = () => {
    btn.closest('.bed-pills').querySelectorAll('.bed-pill').forEach(p => p.classList.remove('on'));
    btn.classList.add('on');
  };
});

// Share action
document.addEventListener('click', e => {
  const shareBtn = e.target.closest('.comp-act-btn[aria-label="Share"]');
  if (shareBtn) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(location.href);
      alert(ar ? 'تم نسخ رابط الكمبوند بنجاح!' : 'Compound link copied to clipboard!');
    }
  }
});

/* ===== RECOMMENDED & FAVORITES SYSTEM ===== */
let favFilterCategory = 'all';
let favSearchQuery = '';
let favSortOrder = 'recent';

function updateFavCounter() {
  const count = favoritesSet.size;
  const favCountPill = $('#fav-count-pill');
  if (favCountPill) favCountPill.textContent = count;
  const allCountSpan = $('#fav-type-all-count');
  if (allCountSpan) allCountSpan.textContent = count;

  // Remove any navbar number badge next to navigation link
  $$('.nav-fav-badge').forEach(b => b.remove());
}

function getFavPastelClass(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('chalet') || t.includes('شاليه')) return 'grad-chalet';
  if (t.includes('apt') || t.includes('apartment') || t.includes('شقة')) return 'grad-apartment';
  if (t.includes('twin') || t.includes('town') || t.includes('تاون') || t.includes('توين')) return 'grad-twinhouse';
  if (t.includes('villa') || t.includes('فيلا')) return 'grad-villa';
  return 'grad-default';
}

function renderFavPropertyCard(p, idx) {
  return renderRecPropertyCard(p, idx);
}


async function renderFavorites() {
  const favGrid = $('#fav-props-grid');
  const emptyState = $('#fav-empty-state');
  const toolbar = $('.fav-toolbar-row');
  updateFavCounter();

  if (!favGrid) return;
  if (favoritesSet.size === 0) {
    favGrid.innerHTML = '';
    favGrid.style.display = 'none';
      if (toolbar) toolbar.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (toolbar) toolbar.style.display = 'flex';
  favGrid.style.display = '';

  // Check if any favorite property needs to be fetched from backend
  const missingIds = [...favoritesSet].filter(id => !propertyCache[id]);
  if (missingIds.length > 0) {
    try {
      const resp = await fetch('/api/recommendations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_ids: missingIds })
      });
      if (resp.ok) {
        const fetchedProps = await resp.json();
        fetchedProps.forEach(p => { propertyCache[p.id] = p; });
        // Prune any non-existent property IDs
        missingIds.forEach(id => {
          if (!propertyCache[id]) {
            favoritesSet.delete(id);
          }
        });
        saveFavoritesToStorage();
        updateFavCounter();
      }
    } catch (err) {
      console.warn('Batch fetch error for favorites:', err);
    }
  }

  let items = [...favoritesSet].map(id => propertyCache[id]).filter(Boolean);

  if (items.length === 0) {
    favGrid.innerHTML = '';
    favGrid.style.display = 'none';
      if (toolbar) toolbar.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  // 1. Filter by category pill
  if (favFilterCategory && favFilterCategory !== 'all') {
    const f = favFilterCategory.toLowerCase();
    items = items.filter(p => {
      const t = (p.property_type || '').toLowerCase();
      if (f.includes('chalet') || f.includes('شاليه')) {
        return t.includes('chalet') || t.includes('شاليه');
      }
      if (f.includes('apartment') || f.includes('شقة')) {
        return t.includes('apartment') || t.includes('شقة') || t.includes('apt') || t.includes('دوبلكس') || t.includes('duplex');
      }
      if (f.includes('villa') || f.includes('فيلا')) {
        return t.includes('villa') || t.includes('فيلا') || t.includes('twin') || t.includes('town');
      }
      return t.includes(f);
    });
  }

  // 2. Filter by search input
  if (favSearchQuery && favSearchQuery.trim()) {
    const q = favSearchQuery.trim().toLowerCase();
    items = items.filter(p => {
      const title = (p.title || '').toLowerCase();
      const loc = (p.location || p.city || '').toLowerCase();
      const type = (p.property_type || '').toLowerCase();
      const priceStr = String(p.price || '');
      return title.includes(q) || loc.includes(q) || type.includes(q) || priceStr.includes(q);
    });
  }

  // 3. Sort items
  if (favSortOrder === 'price_asc') {
    items.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (favSortOrder === 'price_desc') {
    items.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (favSortOrder === 'size_desc') {
    items.sort((a, b) => (b.size || b.area_sqm || 0) - (a.size || a.area_sqm || 0));
  }

  if (items.length === 0) {
    favGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: #64748b;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
        <p style="font-size: 1.05rem; font-weight: 700;">${ar ? 'لا توجد عقارات مطابقة لخيارات البحث أو التصفية' : 'No properties match your filter/search criteria'}</p>
      </div>
    `;
  } else {
    favGrid.innerHTML = items.map((p, idx) => renderRecPropertyCard(p, idx)).join('');
  }
}

async function initRealFavorites() {
  if (favoritesSet.size > 0) {
    const missingIds = [...favoritesSet].filter(id => !propertyCache[id]);
    if (missingIds.length > 0) {
      try {
        const resp = await fetch('/api/recommendations/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property_ids: missingIds })
        });
        if (resp.ok) {
          const fetchedProps = await resp.json();
          fetchedProps.forEach(p => { propertyCache[p.id] = p; });
        }
      } catch (err) {
        console.warn('Batch fetch error for initial favorites:', err);
      }
    }
  }
  updateFavCounter();
  renderFavorites();
}

// Initialize Preferences Filter Pills, Search, Sort & Compare
function initFavEventListeners() {
  // Category Filter Pills
  const pillBtns = $$('#fav-type-filters .fav-pill-btn');
  pillBtns.forEach(btn => {
    btn.onclick = () => {
      pillBtns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      favFilterCategory = btn.dataset.filter || 'all';
      renderFavorites();
    };
  });

  // Search Input
  const searchInput = $('#fav-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      favSearchQuery = e.target.value || '';
      renderFavorites();
    };
  }

  // Sort Select
  const sortSelect = $('#fav-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      favSortOrder = e.target.value || 'recent';
      renderFavorites();
    };
  }

  // Smart Compare Button
  const compareBtn = $('#btn-fav-compare');
  if (compareBtn) {
    compareBtn.onclick = () => {
      const items = [...favoritesSet].map(id => propertyCache[id]).filter(Boolean);
      if (items.length < 2) {
        alert(ar ? 'يرجى حفظ عقارين على الأقل للمقارنة بينهما.' : 'Please save at least 2 properties to compare.');
        return;
      }
      // Top 2 items comparison
      const p1 = items[0];
      const p2 = items[1];
      const msg = ar
        ? `مقارنة ذكية لأعلى عقارين تطابقاً:

1. ${p1.title} (${p1.property_type})
   • السعر: ${Number(p1.price).toLocaleString()} جنيه
   • المساحة: ${p1.size || p1.area_sqm} م²
   • الغرف: ${p1.bedrooms} غرف | ${p1.bathrooms} حمام
   • الموقع: ${p1.location}

2. ${p2.title} (${p2.property_type})
   • السعر: ${Number(p2.price).toLocaleString()} جنيه
   • المساحة: ${p2.size || p2.area_sqm} م²
   • الغرف: ${p2.bedrooms} غرف | ${p2.bathrooms} حمام
   • الموقع: ${p2.location}`
        : `Smart Comparison for Top 2 Matches:

1. ${p1.title} (${p1.property_type})
   Price: ${Number(p1.price).toLocaleString()} EGP | Size: ${p1.size} m² | Beds: ${p1.bedrooms}

2. ${p2.title} (${p2.property_type})
   Price: ${Number(p2.price).toLocaleString()} EGP | Size: ${p2.size} m² | Beds: ${p2.bedrooms}`;
      alert(msg);
    };
  }
}


/* ===== FAVORITES, PILLS, TABS, RANGE ===== */
document.addEventListener('click', e => {
  const f = e.target.closest('.fav, .fav-card-heart-btn');
  if (f) {
    e.preventDefault();
    e.stopPropagation();
    const propIdAttr = f.dataset.propId;
    let propId = propIdAttr !== undefined ? parseInt(propIdAttr, 10) : null;
    if (propId === null || isNaN(propId)) {
      const cardEl = f.closest('.card.prop, .rec-card-item');
      if (cardEl && cardEl.dataset.propId) {
        propId = parseInt(cardEl.dataset.propId, 10);
      }
    }

    if (propId !== null && !isNaN(propId)) {
      toggleFavorite(propId);
    } else {
      f.classList.toggle('on');
      if (f.firstElementChild) {
        f.firstElementChild.className = f.classList.contains('on') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      }
    }
    return;
  }
});

if ($('#pr')) {
  $('#pr').oninput = e => {
    if ($('#pv')) $('#pv').textContent = e.target.value + (ar ? ' مليون' : 'M');
  };
}

$$('.pills button').forEach(b => b.onclick = () => {
  $$('.pills button').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
});

$$('.sq').forEach(b => b.onclick = () => {
  $$('.sq').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
});

$$('.tabs button').forEach(b => b.onclick = () => {
  $$('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  $$('.tp').forEach(p => p.classList.toggle('show', p.id === b.dataset.tab));
});

let lastSourceHash = '#recommend';

/* ===== ROUTER ===== */
function route() {
  const hash = location.hash || '#home';
  if (hash !== '#details') {
    lastSourceHash = hash;
  }
  const valid = $$('.view').some(v => '#' + v.id === hash);
  const id = (valid ? hash : '#home').slice(1);
  $$('.view').forEach(v => v.classList.toggle('show', v.id === id));
  $$('#menu a').forEach(a => {
    const isDirect = a.hash === '#' + id;
    const isDetailsSource = id === 'details' && a.hash === lastSourceHash;
    a.classList.toggle('on', isDirect || isDetailsSource);
  });
  const foot = $('.foot');
  if (foot) foot.style.display = id === 'chat' ? 'none' : '';
  if (id === 'properties') renderFavorites();
  if (id === 'chat') {
    const msgs = $('#msgs');
    if (msgs && msgs.children.length === 0) {
      showChatGreeting();
    }
    const ci = $('#ci');
    if (ci) setTimeout(() => ci.focus(), 150);
  }
  const menu = $('#menu');
  if (menu) menu.classList.remove('open');
  if (id === 'recommend') {
    if (!window._skipRouteRecSearch && window._recHasSearched) {
      executeRecommendationSearch(false);
    }
    window._skipRouteRecSearch = false;
  }
  if (id === 'properties') {
    renderFavorites();
    updateFavCounter();
  }
  if (id === 'details') {
    const backLink = $('#crumb-back-link');
    if (backLink) {
      backLink.href = lastSourceHash;
      backLink.textContent = ar 
        ? (lastSourceHash === '#properties' ? 'العقارات' : 'التوصيات')
        : (lastSourceHash === '#properties' ? 'Properties' : 'Recommendations');
    }
  }
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();

if ($('#burger')) {
  $('#burger').onclick = () => {
    const menu = $('#menu');
    if (menu) menu.classList.toggle('open');
  };
}

/* ===== THEME ===== */
const root = document.documentElement;
if ($('#theme')) {
  $('#theme').onclick = () => root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
}

/* ===== DETAILS VIEW UPDATE (Matching Design Mockup) ===== */
let currentDetailProp = null;
let currentGalleryImages = [];
let currentGalleryIdx = 0;

function updateDetailsUI(targetProp) {
  if (targetProp) currentDetailProp = targetProp;
  const p1 = currentDetailProp || (typeof props !== 'undefined' ? props[0] : null);
  if (!p1) return;

  if (p1.id) {
    propertyCache[p1.id] = p1;
  }

  const isFav = p1.id ? favoritesSet.has(p1.id) : false;
  const title = ar 
    ? (p1.title_ar || p1.title || p1.n_ar || p1.n || 'Ready to move garden apt 140 sqm, 8 years plan') 
    : (p1.title || p1.n || 'Ready to move garden apt 140 sqm, 8 years plan');
  const loc = ar 
    ? (p1.location_ar || p1.location || p1.city_ar || p1.city || 'Mountain View iCity, 5th Settlement Compounds, New Cairo City, Cairo') 
    : (p1.location || p1.city || 'Mountain View iCity, 5th Settlement Compounds, New Cairo City, Cairo');
    const typeVal = p1.property_type || p1.t || 'Apartment';
  const typeDisplay = ar ? (PROP_TYPE_AR[typeVal] || typeVal) : typeVal;
  const rawPrice = p1.price ? Number(p1.price) : 800000;
  const formattedPrice = Math.round(rawPrice).toLocaleString('en-US');
  const bedCount = p1.bedrooms !== undefined ? p1.bedrooms : (p1.b !== undefined ? p1.b : 2);
  const bathCount = p1.bathrooms !== undefined ? p1.bathrooms : (p1.h !== undefined ? p1.h : 2);
  const sizeVal = Math.round(p1.size || p1.area_sqm || 160);
  const simPct = Math.round((p1.similarity !== undefined ? p1.similarity : 0.94) * 100);

  // 1. Breadcrumb
  if ($('#crumb-prop')) $('#crumb-prop').textContent = title;
  const crumbBack = $('#crumb-back-link');
  if (crumbBack) {
    if (lastSourceHash === '#chat') {
      crumbBack.href = '#chat';
      crumbBack.textContent = ar ? 'المساعد الذكي' : 'AI Assistant';
    } else {
      crumbBack.href = '#recommend';
      crumbBack.textContent = ar ? 'التوصيات' : 'Recommendations';
    }
  }

  // 2. Badges Row
  const isRent = p1.category === 'rent' || p1.category === 'commercial_rent';
  const catBadge = $('#det-cat-badge');
  if (catBadge) {
    catBadge.textContent = isRent ? (ar ? 'للإيجار' : 'For Rent') : (ar ? 'للبيع' : 'For Sale');
    catBadge.className = `det-badge ${isRent ? 'det-badge-rent' : 'det-badge-sale'}`;
  }
  const typeBadge = $('#det-type-badge');
  if (typeBadge) typeBadge.textContent = typeDisplay;
  const statusBadge = $('#det-status-badge');
  if (statusBadge) statusBadge.textContent = ar ? 'جاهز للاستلام' : 'Ready to Move';

  // 3. Title & Location
  if ($('#det-title')) $('#det-title').textContent = title;
  if ($('#det-loc')) $('#det-loc').textContent = loc;

  // 4. Price & Payment Plan
  if ($('#det-price')) $('#det-price').textContent = formattedPrice;
  if ($('#det-curr')) $('#det-curr').textContent = ar ? 'جنيه' : 'EGP';
  const planEl = $('#det-plan');
  if (planEl) {
    planEl.textContent = isRent 
      ? (ar ? 'شهرياً' : 'Monthly') 
      : (ar ? 'خطة سداد 8 سنوات' : '8 Years Payment Plan');
  }

  // 5. 4 Spec Boxes
  if ($('#det-spec-beds')) $('#det-spec-beds').textContent = bedCount;
  if ($('#det-spec-baths')) $('#det-spec-baths').textContent = bathCount;
  if ($('#det-spec-size')) $('#det-spec-size').textContent = sizeVal;
  if ($('#det-spec-type')) $('#det-spec-type').textContent = typeDisplay;

  if ($('#det-lbl-beds')) $('#det-lbl-beds').textContent = ar ? 'غرف نوم' : 'Bedrooms';
  if ($('#det-lbl-baths')) $('#det-lbl-baths').textContent = ar ? 'حمام' : 'Baths';
  if ($('#det-lbl-type')) $('#det-lbl-type').textContent = ar ? 'النوع' : 'Type';
  if ($('#det-lbl-size')) $('#det-lbl-size').textContent = ar ? 'م²' : 'sqm';

  // 6. Match Box
  if ($('#det-match-title')) {
    $('#det-match-title').textContent = ar ? `ملاءمة لك ${simPct}%` : `${simPct}% Match for you`;
  }
  if ($('#det-match-desc')) {
    $('#det-match-desc').textContent = ar 
      ? 'السعر أقل من العقارات المشابهة، وقريب من المدارس.' 
      : 'Priced below similar units, close to schools and key services.';
  }

  // 7. Actions (Contact & Favorite)
  const contactBtn = $('#det-contact-btn');
  if (contactBtn) {
    contactBtn.onclick = () => {
      alert(ar 
        ? 'تم إرسال طلب التواصل بنجاح! سيتواصل معك أحد مستشارينا قريباً.' 
        : 'Contact request sent successfully! Customer service will reach out shortly.');
    };
  }

  const favBtn = $('#det-fav-btn');
  if (favBtn && p1.id) {
    favBtn.dataset.propId = p1.id;
    favBtn.classList.toggle('active', isFav);
    const icon = favBtn.querySelector('i');
    if (icon) icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const span = favBtn.querySelector('span');
    if (span) span.textContent = isFav ? (ar ? 'تم الحفظ' : 'Saved') : (ar ? 'في المفضلة' : 'Favorite');

    favBtn.onclick = () => {
      const isFavNow = toggleFavorite(p1.id);
      favBtn.classList.toggle('active', isFavNow);
      if (icon) icon.className = isFavNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      if (span) span.textContent = isFavNow ? (ar ? 'تم الحفظ' : 'Saved') : (ar ? 'في المفضلة' : 'Favorite');
    };
  }

  // 8. Gallery Carousel & Thumbnails - ONLY REAL DATASET IMAGES
  let imgs = [];
  if (p1.images && Array.isArray(p1.images) && p1.images.length > 0) {
    imgs = p1.images.filter(x => typeof x === 'string' && x.trim().length > 0);
  }
  if (imgs.length === 0 && p1.image_url) {
    imgs = [p1.image_url];
  }
  if (imgs.length === 0 && p1.img) {
    imgs = [p1.img];
  }

  // Deduplicate URLs while preserving order
  imgs = imgs.filter((url, idx, self) => self.indexOf(url) === idx);

  if (imgs.length === 0) {
    imgs = ['assets/properties/p1.jpg'];
  }

  currentGalleryImages = imgs;
  currentGalleryIdx = 0;

  function renderGallery(idx) {
    currentGalleryIdx = idx;
    const mainImg = $('#det-main-img');
    if (mainImg) {
      mainImg.src = imgs[idx];
      mainImg.setAttribute('referrerpolicy', 'no-referrer');
      mainImg.onerror = () => { mainImg.onerror = null; };
    }
    const counter = $('#det-counter');
    if (counter) {
      if (imgs.length > 1) {
        counter.style.display = 'block';
        counter.textContent = `${idx + 1}/${imgs.length}`;
      } else {
        counter.style.display = 'none';
      }
    }

    const prevBtn = $('#det-prev-btn');
    const nextBtn = $('#det-next-btn');
    if (prevBtn) prevBtn.style.display = imgs.length > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = imgs.length > 1 ? 'flex' : 'none';

    const thumbsContainer = $('#det-thumbs-container');
    const mainFrame = $('.det-main-frame');
    if (thumbsContainer) {
      if (imgs.length <= 1) {
        thumbsContainer.style.display = 'none';
        thumbsContainer.innerHTML = '';
        if (mainFrame) mainFrame.classList.remove('has-thumbs');
      } else {
        thumbsContainer.style.display = 'flex';
        if (mainFrame) mainFrame.classList.add('has-thumbs');
        const maxSlots = 5;
        const visibleImgs = imgs.slice(0, maxSlots);
        const extraCount = imgs.length - maxSlots;

        const thumbsHtml = visibleImgs.map((thumbSrc, i) => {
          const isFifth = (i === maxSlots - 1 && extraCount > 0);
          const isActive = (i === idx) || (idx >= maxSlots - 1 && isFifth);
          const nextTargetIdx = isFifth ? ((idx + 1) % imgs.length) : i;
          return `
            <div class="det-thumb-item ${isActive ? 'active' : ''}" onclick="window._setDetailsGalleryIdx(${nextTargetIdx})">
              <img src="${thumbSrc}" alt="thumb ${i + 1}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;">
              ${isFifth ? `<div class="det-thumb-overlay">${extraCount + 1}+</div>` : ''}
            </div>
          `;
        }).join('');
        thumbsContainer.innerHTML = thumbsHtml;
      }
    }
  }
  window._setDetailsGalleryIdx = renderGallery;
  renderGallery(0);

  const prevBtn = $('#det-prev-btn');
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      const prevIdx = (currentGalleryIdx - 1 + imgs.length) % imgs.length;
      renderGallery(prevIdx);
    };
  }
  const nextBtn = $('#det-next-btn');
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      const nextIdx = (currentGalleryIdx + 1) % imgs.length;
      renderGallery(nextIdx);
    };
  }

  // 9. Tab 1: Overview
  const fullDesc = $('#det-full-desc');
  if (fullDesc) {
    fullDesc.textContent = ar 
      ? `${typeDisplay} جاهزة للاستلام بحديقة خاصة داخل كمبوند متميز بالتجمع الخامس، بمساحة ${sizeVal} م²، بخطة سداد على 8 سنوات.` 
      : `${typeDisplay} ready to move with private garden in prime 5th Settlement compound, ${sizeVal} sqm, with 8 years payment plan.`;
  }
  const evalSummary = $('#det-eval-summary');
  if (evalSummary) {
    evalSummary.textContent = ar ? 'سعر عادل • ثقة 82%' : 'Fair Price • 82% confidence';
  }

  // 10. Tab 2: Amenities
  const amenChips = $('#det-amenities-chips');
  if (amenChips) {
    const amens = (p1.amenities && Array.isArray(p1.amenities) && p1.amenities.length > 0)
      ? p1.amenities
      : ['حديقة خاصة', 'أمن وحراسة', 'جراج سيارات', 'تكييف مركزي', 'شرفة واسعة', 'أجهزة مطبخ'];
    amenChips.innerHTML = amens.map(a => `
      <li><i class="fa-solid fa-check"></i><span>${a}</span></li>
    `).join('');
  }

  // 11. Tab 3: Similar Properties
  if (p1.id) {
    loadSimilarProperties(p1.id);
  }

  // Ensure first tab (Overview) is active by default
  $$('.det-tabs-nav button').forEach((x, i) => x.classList.toggle('on', i === 0));
  $$('.tp').forEach(p => p.classList.toggle('show', p.id === 't1'));
}

async function loadSimilarProperties(propertyId) {
  const t4Grid = $('#det-similar-grid') || $('#t4 .grid');
  if (!t4Grid) return;
  t4Grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 25px; color: var(--mut);">
    <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--pri); margin-bottom: 8px;"></i>
    <p>${ar ? 'جاري جلب عقارات مشابهة بناءً على الموديل الهجين (AI Hybrid)...' : 'Computing hybrid similar recommendations...'}</p>
  </div>`;
  try {
    const res = await fetch(`/api/recommendations/similar/${propertyId}?top_n=3`);
    if (!res.ok) throw new Error('Similar request failed');
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) {
      t4Grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--mut);">${ar ? 'لا توجد عقارات مشابهة حالياً' : 'No similar properties found'}</p>`;
      return;
    }
    items.forEach(it => { propertyCache[it.id] = it; });
    t4Grid.innerHTML = items.map((p, idx) => renderRecPropertyCard(p, idx)).join('');
  } catch (err) {
    console.error('Failed to load similar properties:', err);
    t4Grid.innerHTML = '';
  }
}

// Click to view property details from any card (title or image)
function handleOpenPropertyDetails(cardEl) {
  if (location.hash && location.hash !== '#details') {
    lastSourceHash = location.hash;
  }
  const propIdAttr = cardEl.dataset.propId;
  let pid = propIdAttr !== undefined ? parseInt(propIdAttr, 10) : null;
  let found = null;
  if (pid !== null && !isNaN(pid)) {
    if (propertyCache[pid]) {
      found = propertyCache[pid];
    } else if (props[pid]) {
      found = props[pid];
    }
  }
  if (!found) {
    const titleText = cardEl.querySelector('.prop-title a, .comp-title a')?.textContent?.trim();
    if (titleText) {
      found = Object.values(propertyCache).find(p => p.title && p.title.includes(titleText));
      if (!found) found = props.find(p => (p.n || p.n_ar) === titleText);
    }
  }
  if (found) {
    updateDetailsUI(found);
  } else if (pid) {
    fetch(`/api/recommendations/${pid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          propertyCache[pid] = data;
          updateDetailsUI(data);
        }
      })
      .catch(err => console.error('Details fetch failed:', err));
  }
  location.hash = '#details';
}

document.addEventListener('click', e => {
  // If clicked favorite button or its children, don't open details
  if (e.target.closest('.fav, .fav-card-heart-btn')) return;

  // If clicked property status button (توصية مميزة)
  const statusBtn = e.target.closest('.prop-status-btn');
  if (statusBtn) {
    const cardEl = statusBtn.closest('.card.prop, .compound-card, .rec-card-item');
    if (cardEl) {
      handleOpenPropertyDetails(cardEl);
      return;
    }
  }

  // If clicked a link with #details
  const link = e.target.closest('a[href="#details"]');
  if (link) {
    const cardEl = link.closest('.card.prop, .compound-card, .rec-card-item');
    if (cardEl) {
      handleOpenPropertyDetails(cardEl);
      return;
    }
  }

  // If clicked property image
  const imgBox = e.target.closest('.prop-img-box, .comp-img-wrap');
  if (imgBox) {
    const cardEl = imgBox.closest('.card.prop, .compound-card, .rec-card-item');
    if (cardEl) {
      handleOpenPropertyDetails(cardEl);
    }
  }
});

/* ===== 4. RECOMMENDATION SEARCH ENGINE (Curated Dataset & Dynamic Filters) ===== */
const REC_CITIES = [
  { id: 'all', en: 'All Cities & Regions', ar: 'جميع المدن والمناطق' },
  { id: 'New Cairo City', en: 'New Cairo', ar: 'القاهرة الجديدة' },
  { id: 'Sheikh Zayed', en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
  { id: '6th of October', en: '6th of October', ar: '6 أكتوبر' },
  { id: 'Maadi', en: 'Maadi', ar: 'المعادي' },
  { id: 'Nasr City', en: 'Nasr City', ar: 'مدينة نصر' },
  { id: 'Madinaty', en: 'Madinaty', ar: 'مدينتي' },
  { id: 'New Capital City', en: 'New Capital', ar: 'العاصمة الإدارية' },
  { id: 'El Shorouk City', en: 'El Shorouk', ar: 'الشروق' },
  { id: 'Heliopolis', en: 'Heliopolis', ar: 'مصر الجديدة' },
  { id: 'Alexandria', en: 'Alexandria', ar: 'الإسكندرية' },
  { id: 'North Coast', en: 'North Coast', ar: 'الساحل الشمالي' }
];

const REC_RESIDENTIAL_TYPES = [
  { id: 'all', en: 'All Residential Types', ar: 'جميع أنواع السكني' },
  { id: 'Apartment', en: 'Apartment', ar: 'شقة' },
  { id: 'Villa', en: 'Villa', ar: 'فيلا' },
  { id: 'Townhouse', en: 'Townhouse', ar: 'تاون هاوس' },
  { id: 'Twin House', en: 'Twin House', ar: 'توين هاوس' },
  { id: 'Chalet', en: 'Chalet', ar: 'شاليه' },
  { id: 'Duplex', en: 'Duplex', ar: 'دوبلكس' },
  { id: 'Penthouse', en: 'Penthouse', ar: 'بنتهاوس' },
  { id: 'iVilla', en: 'iVilla', ar: 'آي فيلا' }
];

const REC_COMMERCIAL_TYPES = [
  { id: 'all', en: 'All Commercial Types', ar: 'جميع أنواع التجاري' },
  { id: 'Office Space', en: 'Office Space', ar: 'مكتب' },
  { id: 'Clinic', en: 'Clinic', ar: 'عيادة' },
  { id: 'Shop', en: 'Shop', ar: 'محل' },
  { id: 'Retail', en: 'Retail', ar: 'مساحة تجارية' },
  { id: 'Warehouse', en: 'Warehouse', ar: 'مخزن' }
];

// Data-calibrated Budget Options (Top to bottom: Least to Greatest)
const REC_BUY_BUDGET_RANGES = [
  { id: 'all', ar: 'الكل (أي ميزانية)', en: 'Any Budget', min: null, max: null },
  { id: '0-1m', ar: 'أقل من 1 مليون ج.م', en: 'Under 1M EGP', min: 0, max: 1000000 },
  { id: '1m-2m', ar: 'من 1 إلى 2 مليون ج.م', en: '1M – 2M EGP', min: 1000000, max: 2000000 },
  { id: '2m-3m', ar: 'من 2 إلى 3 مليون ج.م', en: '2M – 3M EGP', min: 2000000, max: 3000000 },
  { id: '3m-5m', ar: 'من 3 إلى 5 مليون ج.م', en: '3M – 5M EGP', min: 3000000, max: 5000000 },
  { id: '5m-8m', ar: 'من 5 إلى 8 مليون ج.م', en: '5M – 8M EGP', min: 5000000, max: 8000000 },
  { id: '8m-12m', ar: 'من 8 إلى 12 مليون ج.م', en: '8M – 12M EGP', min: 8000000, max: 12000000 },
  { id: '12m-20m', ar: 'من 12 إلى 20 مليون ج.م', en: '12M – 20M EGP', min: 12000000, max: 20000000 },
  { id: '20m+', ar: 'أكثر من 20 مليون ج.م', en: 'Above 20M EGP', min: 20000000, max: null },
];

const REC_RENT_BUDGET_RANGES = [
  { id: 'all', ar: 'الكل (أي ميزانية)', en: 'Any Budget', min: null, max: null },
  { id: '0-20k', ar: 'أقل من 20 ألف ج.م / شهر', en: 'Under 20k EGP / month', min: 0, max: 20000 },
  { id: '20k-35k', ar: 'من 20 إلى 35 ألف ج.م / شهر', en: '20k – 35k EGP / month', min: 20000, max: 35000 },
  { id: '35k-50k', ar: 'من 35 إلى 50 ألف ج.م / شهر', en: '35k – 50k EGP / month', min: 35000, max: 50000 },
  { id: '50k-75k', ar: 'من 50 إلى 75 ألف ج.م / شهر', en: '50k – 75k EGP / month', min: 50000, max: 75000 },
  { id: '75k-100k', ar: 'من 75 إلى 100 ألف ج.م / شهر', en: '75k – 100k EGP / month', min: 75000, max: 100000 },
  { id: '100k-150k', ar: 'من 100 إلى 150 ألف ج.م / شهر', en: '100k – 150k EGP / month', min: 100000, max: 150000 },
  { id: '150k+', ar: 'أكثر من 150 ألف ج.م / شهر', en: 'Above 150k EGP / month', min: 150000, max: null },
];

// Data-calibrated Size Options (Top to bottom: Least to Greatest)
const REC_SIZE_RANGES = [
  { id: 'all', ar: 'الكل (أي مساحة)', en: 'Any Size', min: null, max: null },
  { id: '0-75', ar: 'أقل من 75 م²', en: 'Under 75 m²', min: 0, max: 75 },
  { id: '75-100', ar: 'من 75 إلى 100 م²', en: '75 – 100 m²', min: 75, max: 100 },
  { id: '100-150', ar: 'من 100 إلى 150 م²', en: '100 – 150 m²', min: 100, max: 150 },
  { id: '150-200', ar: 'من 150 إلى 200 م²', en: '150 – 200 m²', min: 150, max: 200 },
  { id: '200-300', ar: 'من 200 إلى 300 م²', en: '200 – 300 m²', min: 200, max: 300 },
  { id: '300+', ar: 'أكثر من 300 م²', en: 'Above 300 m²', min: 300, max: null },
];

const PRED_SIZE_OPTIONS = [
  { id: '60', ar: 'أقل من 75 م²', en: 'Under 75 m²', val: 60.0 },
  { id: '85', ar: 'من 75 إلى 100 م²', en: '75 – 100 m²', val: 85.0 },
  { id: '130', ar: 'من 100 إلى 150 م²', en: '100 – 150 m²', val: 130.0 },
  { id: '175', ar: 'من 150 إلى 200 م²', en: '150 – 200 m²', val: 175.0 },
  { id: '250', ar: 'من 200 إلى 300 م²', en: '200 – 300 m²', val: 250.0 },
  { id: '350', ar: 'أكثر من 300 م²', en: 'Above 300 m²', val: 350.0 }
];

const recState = {
  category: 'all',
  property_type: 'all',
  city: 'all',
  budget_range: 'all',
  min_price: null,
  max_price: null,
  size_range: 'all',
  min_size: null,
  max_size: null,
  bedrooms: 'all',
  bathrooms: 'all',
  amenities: []
};

let recVisibleCount = 6;
let recCurrentMatches = [];
let recSortMode = 'similarity';

function renderRecPropertyCard(p, idx) {
  if (p && p.id) {
    propertyCache[p.id] = p;
  }
  const isFav = favoritesSet.has(p.id);
  const simPct = Math.round((p.similarity !== undefined ? p.similarity : (0.96 - (idx || 0) * 0.04)) * 100);
  const formattedPrice = Math.round(Number(p.price || 0)).toLocaleString('en-US');
  
  let priceLabel = ar ? 'جنيه' : 'EGP';
  if (p.price_label_ar) {
    priceLabel = ar ? p.price_label_ar : (p.price_label_en || 'EGP');
  } else if (p.price_label === 'EGP / month' || p.category === 'rent' || p.category === 'commercial_rent') {
    priceLabel = ar ? 'جنيه / شهرياً' : 'EGP / month';
  } else if (p.price_label === 'EGP' || p.price_label_en === 'EGP') {
    priceLabel = ar ? 'جنيه' : 'EGP';
  } else if (p.price_label) {
    priceLabel = p.price_label;
  }
  
  const priceDisplay = `${formattedPrice} ${priceLabel}`;
  const bedsText = ar ? `${p.bedrooms || 0} غرف` : `${p.bedrooms || 0} Beds`;
  const bathsText = ar ? `${p.bathrooms || 0} حمام` : `${p.bathrooms || 0} Baths`;
  const sizeVal = Math.round(p.size || p.area_sqm || 0);
  const sizeText = ar ? `${sizeVal} م²` : `${sizeVal} sqm`;
  const defaultImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80';
  const img = p.image_url || (p.images && p.images[0]) || p.img || defaultImg;
  const title = p.title || (ar ? 'عقار متميز في موقع استراتيجي' : 'Prime Property');
  const location = p.location || (ar ? (p.city_ar || p.city) : p.city) || (ar ? 'مصر' : 'Egypt');

  const typeDisplay = ar ? (PROP_TYPE_AR[p.property_type] || p.property_type || "شقة") : (p.property_type || "Apartment");

  return `<article class="card prop rec-card-item chat-prop-card" data-prop-id="${p.id}">
    <div class="prop-img-box" style="--img:url('${img}'); cursor: pointer;" onclick="showPropertyDetails(${p.id})">
      <img src="${img}" alt="${title}" style="display:none" onerror="this.parentElement.style.setProperty('--img','url(${defaultImg})')">
      <div class="prop-badges">
        <span class="badge-project">${typeDisplay}</span>
      </div>
      <span class="score"><i class="fa-solid fa-sparkles"></i> ${simPct}% ${ar ? 'تطابق ذكي' : 'AI Match'}</span>
      <button class="fav ${isFav ? 'on' : ''}" aria-label="Favorite" title="${isFav ? (ar ? 'في المفضلة' : 'Saved') : (ar ? 'إضافة للمفضلة' : 'Save')}" data-prop-id="${p.id}">
        <i class="${isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
      </button>
    </div>
    <div class="prop-body">
      <div class="prop-title-row">
        <h3 class="prop-title" title="${title}"><a href="#details" onclick="event.preventDefault(); showPropertyDetails(${p.id})">${title}</a></h3>
        <div class="prop-icon-circle" title="${typeDisplay}"><i class="fa-regular fa-building"></i></div>
      </div>
      <p class="prop-loc"><i class="fa-solid fa-location-dot"></i> <span>${location}</span></p>
      <div class="prop-specs">
        <span><i class="fa-solid fa-bed"></i> ${bedsText}</span>
        <span>•</span>
        <span><i class="fa-solid fa-bath"></i> ${bathsText}</span>
        <span>•</span>
        <span><i class="fa-solid fa-ruler-combined"></i> ${sizeText}</span>
      </div>
      <div class="prop-bottom-row">
        <button type="button" class="rec-card-details-btn" onclick="event.stopPropagation(); showPropertyDetails(${p.id})" title="${ar ? 'عرض تفاصيل العقار' : 'View details'}">
          <i class="fa-regular fa-eye"></i>
          <span>${ar ? 'عرض التفاصيل' : 'View details'}</span>
        </button>
        <div class="prop-pricing">
          <strong class="prop-current-price">${priceDisplay}</strong>
        </div>
      </div>
    </div>
  </article>`;
}

function populateRecSelects() {
  const propTypeSelect = $('#rec-prop-type');
  const citySelect = $('#rec-city-select');
  const budgetSelect = $('#rec-budget-select');
  const sizeSelect = $('#rec-size-select');

  if (propTypeSelect) {
    const isCommercial = recState.category === 'commercial_buy' || recState.category === 'commercial_rent';
    const typeList = isCommercial ? REC_COMMERCIAL_TYPES : REC_RESIDENTIAL_TYPES;
    
    const validCurrent = typeList.some(t => t.id === recState.property_type);
    if (!validCurrent) recState.property_type = 'all';

    propTypeSelect.innerHTML = typeList.map(t => 
      `<option value="${t.id}" ${t.id === recState.property_type ? 'selected' : ''}>${ar ? t.ar : t.en}</option>`
    ).join('');
  }

  if (citySelect) {
    citySelect.innerHTML = REC_CITIES.map(c => 
      `<option value="${c.id}" ${c.id === recState.city ? 'selected' : ''}>${ar ? c.ar : c.en}</option>`
    ).join('');
  }

  // Populate Budget Select (Dynamic based on Buy vs Rent)
  if (budgetSelect) {
    const isRent = recState.category === 'rent' || recState.category === 'commercial_rent';
    const budgetList = isRent ? REC_RENT_BUDGET_RANGES : REC_BUY_BUDGET_RANGES;
    
    // Check if current selection is valid
    const validBudget = budgetList.some(b => b.id === recState.budget_range);
    if (!validBudget) {
      recState.budget_range = 'all';
      recState.min_price = null;
      recState.max_price = null;
    }

    budgetSelect.innerHTML = budgetList.map(b =>
      `<option value="${b.id}" data-min="${b.min !== null ? b.min : ''}" data-max="${b.max !== null ? b.max : ''}" ${b.id === recState.budget_range ? 'selected' : ''}>${ar ? b.ar : b.en}</option>`
    ).join('');
  }

  // Populate Size Select
  if (sizeSelect) {
    const validSize = REC_SIZE_RANGES.some(s => s.id === recState.size_range);
    if (!validSize) {
      recState.size_range = 'all';
      recState.min_size = null;
      recState.max_size = null;
    }

    sizeSelect.innerHTML = REC_SIZE_RANGES.map(s =>
      `<option value="${s.id}" data-min="${s.min !== null ? s.min : ''}" data-max="${s.max !== null ? s.max : ''}" ${s.id === recState.size_range ? 'selected' : ''}>${ar ? s.ar : s.en}</option>`
    ).join('');
  }
  // Populate Beds Select
  const bedsSelect = $('#rec-beds-select');
  if (bedsSelect) {
    const bedOpts = [
      { val: 'all', ar: 'الكل', en: 'All' },
      { val: '1', ar: '1 غرفة', en: '1 Bedroom' },
      { val: '2', ar: '2 غرف', en: '2 Bedrooms' },
      { val: '3', ar: '3 غرف', en: '3 Bedrooms' },
      { val: '4', ar: '4 غرف', en: '4 Bedrooms' },
      { val: '5', ar: '+5 غرف', en: '5+ Bedrooms' }
    ];
    bedsSelect.innerHTML = bedOpts.map(o =>
      `<option value="${o.val}" ${String(o.val) === String(recState.bedrooms) ? 'selected' : ''}>${ar ? o.ar : o.en}</option>`
    ).join('');
  }

  // Populate Baths Select
  const bathsSelect = $('#rec-baths-select');
  if (bathsSelect) {
    const bathOpts = [
      { val: 'all', ar: 'الكل', en: 'All' },
      { val: '1', ar: '1 حمام', en: '1 Bath' },
      { val: '2', ar: '2 حمام', en: '2 Baths' },
      { val: '3', ar: '3 حمامات', en: '3 Baths' },
      { val: '4', ar: '4 حمامات', en: '4 Baths' },
      { val: '5', ar: '+5 حمامات', en: '5+ Baths' }
    ];
    bathsSelect.innerHTML = bathOpts.map(o =>
      `<option value="${o.val}" ${String(o.val) === String(recState.bathrooms) ? 'selected' : ''}>${ar ? o.ar : o.en}</option>`
    ).join('');
  }

}

function getRecPayload() {
  return {
    filters: {
      category: recState.category === 'all' ? 'buy' : recState.category,
      property_type: recState.property_type === 'all' ? 'Apartment' : recState.property_type,
      city: recState.city === 'all' ? 'New Cairo City' : recState.city,
      min_price: (recState.min_price !== null && !isNaN(recState.min_price)) ? recState.min_price : 2000000,
      max_price: (recState.max_price !== null && !isNaN(recState.max_price)) ? recState.max_price : 6000000,
      bedrooms: recState.bedrooms === 'all' ? 3 : parseInt(recState.bedrooms, 10),
      amenities: recState.amenities.length > 0 ? recState.amenities : ['Balcony', 'Security', 'Central A/C']
    },
    limit: 6
  };
}

let recCurrentItems = [];
let recTotalMatches = 0;
let recIsLoading = false;
let recHasSearched = false;
window._recHasSearched = false;

function renderRecInitialPlaceholder() {
  const grid = $('#rec-results-grid');
  const countEl = $('#rec-results-count');
  const emptyState = $('#rec-empty-state');
  const loadMoreWrap = $('#rec-load-more-wrap');

  if (emptyState) emptyState.style.display = 'none';
  if (loadMoreWrap) loadMoreWrap.style.display = 'none';

  if (countEl) {
    countEl.textContent = ar 
      ? 'في انتظار البحث — اضغط على زر البحث لعرض أفضل التوصيات' 
      : 'Awaiting search — click search to view top recommendations';
  }

  if (grid) {
    grid.style.display = '';
    grid.innerHTML = `
      <div class="rec-awaiting-placeholder">
        <div class="rec-awaiting-icon">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <h3 class="rec-awaiting-title">
          ${ar ? 'في انتظار تحديد المواصفات والبحث' : 'Awaiting Specifications & Search'}
        </h3>
        <p class="rec-awaiting-desc">
          ${ar 
            ? 'حدد نوع العقار، المدينة، الميزانية والمواصفات من الفلاتر بالأعلى، ثم اضغط على زر <strong>«البحث عن أفضل التوصيات»</strong> لعرض أفضل المقترحات العقارية.' 
            : 'Select property type, location, budget and preferences from the filters above, then click <strong>"Search Top Recommendations"</strong> to display matching properties.'
          }
        </p>
      </div>
    `;
  }
}

async function executeRecommendationSearch(resetPagination = true) {
  if (recIsLoading) return;

  if (resetPagination) {
    recVisibleCount = 6;
    recCurrentItems = [];
  }

  const budgetSelect = $('#rec-budget-select');
  const sizeSelect = $('#rec-size-select');
  const bedsSelect = $('#rec-beds-select');
  const bathsSelect = $('#rec-baths-select');

  if (budgetSelect && budgetSelect.options.length > 0) {
    const sel = budgetSelect.options[budgetSelect.selectedIndex];
    if (sel) {
      recState.budget_range = sel.value;
      const minVal = sel.getAttribute('data-min');
      const maxVal = sel.getAttribute('data-max');
      recState.min_price = (minVal && minVal !== '') ? parseFloat(minVal) : null;
      recState.max_price = (maxVal && maxVal !== '') ? parseFloat(maxVal) : null;
    }
  }

  if (sizeSelect && sizeSelect.options.length > 0) {
    const sel = sizeSelect.options[sizeSelect.selectedIndex];
    if (sel) {
      recState.size_range = sel.value;
      const minVal = sel.getAttribute('data-min');
      const maxVal = sel.getAttribute('data-max');
      recState.min_size = (minVal && minVal !== '') ? parseFloat(minVal) : null;
      recState.max_size = (maxVal && maxVal !== '') ? parseFloat(maxVal) : null;
    }
  }

  recState.bedrooms = bedsSelect ? bedsSelect.value : 'all';
  recState.bathrooms = bathsSelect ? bathsSelect.value : 'all';

  const grid = $('#rec-results-grid');
  const countEl = $('#rec-results-count');
  const emptyState = $('#rec-empty-state');
  const loadMoreWrap = $('#rec-load-more-wrap');
  const loadMoreBtn = $('#rec-load-more-btn');
  const submitBtn = $('#rec-submit-btn');

  const offset = resetPagination ? 0 : recCurrentItems.length;
  const limit = 6;

  const payload = {
    category: recState.category,
    property_type: recState.property_type,
    city: recState.city,
    price_range_id: recState.budget_range,
    min_price: recState.min_price,
    max_price: recState.max_price,
    size_range_id: recState.size_range,
    min_size: recState.min_size,
    max_size: recState.max_size,
    bedrooms: recState.bedrooms,
    bathrooms: recState.bathrooms,
    amenities: recState.amenities,
    sort: recSortMode,
    limit: limit,
    offset: offset
  };

  recIsLoading = true;
  if (resetPagination) {
    recHasSearched = true;
    window._recHasSearched = true;
  }

  if (submitBtn && resetPagination) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>${ar ? 'جارٍ تحليل وبحث أفضل التوصيات...' : 'Analyzing & searching recommendations...'}</span>`;
  }

  if (resetPagination && grid) {
    grid.style.display = '';
    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--mut);">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: var(--pri); margin-bottom: 14px;"></i>
      <p style="font-size: 1rem; font-weight: 600;">${ar ? 'جاري جلب أفضل التوصيات العقارية بالذكاء الاصطناعي...' : 'Fetching top AI property recommendations...'}</p>
    </div>`;
  }
  if (loadMoreBtn && !resetPagination) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${ar ? 'جاري التحميل...' : 'Loading...'}`;
  }

  try {
    // Delay of 3 to 8 seconds upon clicking recommendation search
    const delayMs = resetPagination
      ? Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000
      : 0;

    const [res] = await Promise.all([
      fetch('/api/recommendations/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      delayMs > 0 ? new Promise(resolve => setTimeout(resolve, delayMs)) : Promise.resolve()
    ]);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    recTotalMatches = data.total || 0;
    const newItems = data.items || [];

    if (resetPagination) {
      recCurrentItems = newItems;
    } else {
      recCurrentItems = recCurrentItems.concat(newItems);
    }

    newItems.forEach(item => {
      propertyCache[item.id] = item;
    });

    if (recTotalMatches === 0) {
      if (grid) {
        grid.innerHTML = '';
        grid.style.display = 'none';
      }
      if (emptyState) emptyState.style.display = 'block';
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
      if (countEl) {
        countEl.textContent = ar 
          ? 'تم العثور على 0 عقار — جرب تغيير الفلاتر' 
          : 'Found 0 properties — try adjusting your filters';
      }
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (grid) {
      grid.style.display = '';
      if (resetPagination) {
        grid.innerHTML = recCurrentItems.map((p, idx) => renderRecPropertyCard(p, idx)).join('');
      } else {
        const appendedHtml = newItems.map((p, idx) => renderRecPropertyCard(p, offset + idx)).join('');
        grid.insertAdjacentHTML('beforeend', appendedHtml);
      }
    }

    if (countEl) {
      const shownCount = recCurrentItems.length;
      countEl.textContent = ar 
        ? `تم العثور على ${recTotalMatches.toLocaleString('en-US')} عقار — إليك أفضل ${shownCount} مقترحات`
        : `Found ${recTotalMatches.toLocaleString('en-US')} properties — showing top ${shownCount} recommendations`;
    }

    if (loadMoreWrap) {
      if (recCurrentItems.length < recTotalMatches) {
        loadMoreWrap.style.display = 'flex';
      } else {
        loadMoreWrap.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Failed to fetch recommendations:', err);
    if (grid && resetPagination) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ef4444;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 12px;"></i>
        <p>${ar ? 'تعذر جلب التوصيات حالياً، يرجى المحاولة مرة أخرى.' : 'Failed to fetch recommendations, please try again.'}</p>
      </div>`;
    }
  } finally {
    recIsLoading = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass rec-search-icon"></i> <span data-i18n="btn_recommend_search">${ar ? (i18n.ar.btn_recommend_search || 'البحث عن أفضل التوصيات') : (i18n.en.btn_recommend_search || 'Search Top Recommendations')}</span>`;
    }
    if (loadMoreBtn) {
      loadMoreBtn.disabled = false;
      loadMoreBtn.innerHTML = `<i class="fa-solid fa-arrow-down"></i> <span data-i18n="rec_load_more">${ar ? 'تحميل المزيد من العقارات' : 'Load More Properties'}</span>`;
    }
  }
}

function initRecommendationListeners() {
  const catGroup = $('#rec-cat-group');
  if (catGroup) {
    catGroup.onclick = e => {
      const btn = e.target.closest('.rec-cat-btn');
      if (!btn) return;
      $$('.rec-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      recState.category = btn.dataset.cat;
      populateRecSelects();
    };
  }

  const propTypeSelect = $('#rec-prop-type');
  if (propTypeSelect) {
    propTypeSelect.onchange = e => {
      recState.property_type = e.target.value;
    };
  }

  const budgetSelect = $('#rec-budget-select');
  if (budgetSelect) {
    budgetSelect.onchange = e => {
      const sel = budgetSelect.options[budgetSelect.selectedIndex];
      if (sel) {
        recState.budget_range = sel.value;
        const minVal = sel.getAttribute('data-min');
        const maxVal = sel.getAttribute('data-max');
        recState.min_price = (minVal && minVal !== '') ? parseFloat(minVal) : null;
        recState.max_price = (maxVal && maxVal !== '') ? parseFloat(maxVal) : null;
      }
    };
  }

  const sizeSelect = $('#rec-size-select');
  if (sizeSelect) {
    sizeSelect.onchange = e => {
      const sel = sizeSelect.options[sizeSelect.selectedIndex];
      if (sel) {
        recState.size_range = sel.value;
        const minVal = sel.getAttribute('data-min');
        const maxVal = sel.getAttribute('data-max');
        recState.min_size = (minVal && minVal !== '') ? parseFloat(minVal) : null;
        recState.max_size = (maxVal && maxVal !== '') ? parseFloat(maxVal) : null;
      }
    };
  }

  const citySelect = $('#rec-city-select');
  if (citySelect) {
    citySelect.onchange = e => {
      recState.city = e.target.value;
    };
  }

  const bedsSelect = $('#rec-beds-select');
  if (bedsSelect) {
    bedsSelect.onchange = () => {
      recState.bedrooms = bedsSelect.value;
    };
  }

  const bathsSelect = $('#rec-baths-select');
  if (bathsSelect) {
    bathsSelect.onchange = () => {
      recState.bathrooms = bathsSelect.value;
    };
  }

  const amensGroup = $('#rec-amenities-group');
  if (amensGroup) {
    amensGroup.onclick = e => {
      const pill = e.target.closest('.rec-amenity-pill');
      if (!pill) return;
      const amenity = pill.dataset.amenity;
      pill.classList.toggle('active');
      if (pill.classList.contains('active')) {
        if (!recState.amenities.includes(amenity)) recState.amenities.push(amenity);
      } else {
        recState.amenities = recState.amenities.filter(a => a !== amenity);
      }
    };
  }

  // Custom Sort Dropdown Handler
  const sortContainer = $('#rec-sort-container');
  const sortBtn = $('#rec-sort-btn');
  const sortMenu = $('#rec-sort-menu');
  const sortCurrentText = $('#rec-sort-current-text');
  const sortSelect = $('#rec-sort-select');

  if (sortBtn && sortContainer) {
    sortBtn.onclick = e => {
      e.stopPropagation();
      sortContainer.classList.toggle('open');
      sortBtn.setAttribute('aria-expanded', sortContainer.classList.contains('open'));
    };

    if (sortMenu) {
      sortMenu.onclick = e => {
        const item = e.target.closest('.rec-sort-item');
        if (!item) return;
        e.stopPropagation();
        const mode = item.dataset.sort;
        recSortMode = mode;
        if (sortSelect) sortSelect.value = mode;
        $$('.rec-sort-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        if (sortCurrentText) {
          sortCurrentText.textContent = item.querySelector('span')?.textContent || item.textContent.trim();
        }
        sortContainer.classList.remove('open');
        sortBtn.setAttribute('aria-expanded', 'false');
        if (window._recHasSearched) {
          executeRecommendationSearch(true);
        }
      };
    }

    document.addEventListener('click', e => {
      if (!sortContainer.contains(e.target)) {
        sortContainer.classList.remove('open');
        sortBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const loadMoreBtn = $('#rec-load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      executeRecommendationSearch(false);
    };
  }

  const filterForm = $('#rec-filter-form');
  if (filterForm) {
    filterForm.onsubmit = e => {
      e.preventDefault();
      executeRecommendationSearch(true);
    };
  }

  const submitBtn = $('#rec-submit-btn');
  if (submitBtn) {
    submitBtn.onclick = e => {
      e.preventDefault();
      executeRecommendationSearch(true);
    };
  }
}

/* ===== 5. REAL ESTATE AI PRICE PREDICTOR ENGINE ===== */
const CITIES_DATA = [
  { id: 'new_cairo', ar: 'القاهرة الجديدة', en: 'New Cairo', lat: 30.022596, lng: 31.470938, baseM2: 36000, mapX: 54, mapY: 48 },
  { id: 'sheikh_zayed', ar: 'الشيخ زايد', en: 'Sheikh Zayed', lat: 30.053500, lng: 30.963200, baseM2: 38000, mapX: 42, mapY: 45 },
  { id: 'october', ar: '6 أكتوبر', en: '6th of October', lat: 29.972200, lng: 30.941600, baseM2: 24000, mapX: 40, mapY: 52 },
  { id: 'maadi', ar: 'المعادي', en: 'Maadi', lat: 29.960200, lng: 31.256900, baseM2: 30000, mapX: 48, mapY: 53 },
  { id: 'capital', ar: 'العاصمة الإدارية الجديدة', en: 'New Administrative Capital', lat: 30.013100, lng: 31.745400, baseM2: 32000, mapX: 62, mapY: 49 },
  { id: 'north_coast', ar: 'الساحل الشمالي', en: 'North Coast', lat: 30.932800, lng: 28.986300, baseM2: 48000, mapX: 20, mapY: 28 },
  { id: 'alexandria', ar: 'الإسكندرية', en: 'Alexandria', lat: 31.200100, lng: 29.918700, baseM2: 23000, mapX: 28, mapY: 22 },
  { id: 'nasr_city', ar: 'مدينة نصر', en: 'Nasr City', lat: 30.056600, lng: 31.341800, baseM2: 26000, mapX: 50, mapY: 46 },
  { id: 'el_shorouk', ar: 'الشروق', en: 'El Shorouk', lat: 30.141900, lng: 31.608300, baseM2: 22000, mapX: 58, mapY: 42 },
  { id: 'mostakbal', ar: 'مدينة المستقبل', en: 'Mostakbal City', lat: 30.083300, lng: 31.650000, baseM2: 28000, mapX: 60, mapY: 44 }
];

const RESIDENTIAL_TYPES = [
  { id: 'Apartment', ar: 'شقة', en: 'Apartment', icon: 'fa-regular fa-building', mult: 1.0, quick: true },
  { id: 'Villa', ar: 'فيلا مستقلة', en: 'Standalone Villa', icon: 'fa-solid fa-house-chimney', mult: 1.8, quick: true },
  { id: 'Townhouse', ar: 'تاون هاوس', en: 'Townhouse', icon: 'fa-solid fa-house', mult: 1.35, quick: true },
  { id: 'Twin House', ar: 'توين هاوس', en: 'Twin House', icon: 'fa-solid fa-people-roof', mult: 1.5, quick: false },
  { id: 'Chalet', ar: 'شاليه', en: 'Chalet', icon: 'fa-solid fa-umbrella-beach', mult: 1.25, quick: true },
  { id: 'Duplex', ar: 'دوبلكس', en: 'Duplex', icon: 'fa-solid fa-layer-group', mult: 1.2, quick: true },
  { id: 'Penthouse', ar: 'بنتهاوس', en: 'Penthouse', icon: 'fa-solid fa-city', mult: 1.3, quick: true },
  { id: 'iVilla', ar: 'آي فيلا', en: 'iVilla', icon: 'fa-solid fa-landmark', mult: 1.25, quick: false },
  { id: 'Hotel Apartment', ar: 'شقة فندقية', en: 'Hotel Apartment', icon: 'fa-solid fa-hotel', mult: 1.4, quick: false },
  { id: 'Roof', ar: 'روف', en: 'Roof', icon: 'fa-solid fa-mountain-sun', mult: 0.85, quick: false },
  { id: 'Palace', ar: 'قصر', en: 'Palace', icon: 'fa-solid fa-crown', mult: 2.5, quick: false },
  { id: 'Cabin', ar: 'كابينة', en: 'Cabin', icon: 'fa-solid fa-campground', mult: 0.95, quick: false }
];

const COMMERCIAL_TYPES = [
  { id: 'Office Space', ar: 'مكتب إداري', en: 'Office Space', icon: 'fa-solid fa-briefcase', mult: 1.5, quick: true },
  { id: 'Clinic', ar: 'عيادة طبية', en: 'Clinic', icon: 'fa-solid fa-stethoscope', mult: 1.8, quick: true },
  { id: 'Shop', ar: 'محل تجاري', en: 'Shop / Retail Store', icon: 'fa-solid fa-shop', mult: 2.2, quick: true },
  { id: 'Retail', ar: 'مساحة تجارية', en: 'Retail', icon: 'fa-solid fa-store', mult: 2.1, quick: true },
  { id: 'Co-Working Space', ar: 'مساحة عمل مشتركة', en: 'Co-Working Space', icon: 'fa-solid fa-users-gear', mult: 1.5, quick: false },
  { id: 'Whole Building', ar: 'مبنى كامل', en: 'Whole Building', icon: 'fa-solid fa-building', mult: 1.4, quick: false },
  { id: 'Medical Facility', ar: 'منشأة طبية', en: 'Medical Facility', icon: 'fa-solid fa-hospital', mult: 1.9, quick: false },
  { id: 'Restaurant', ar: 'مطعم / كافيه', en: 'Restaurant / Cafe', icon: 'fa-solid fa-utensils', mult: 2.0, quick: false },
  { id: 'Warehouse', ar: 'مخزن / مستودع', en: 'Warehouse', icon: 'fa-solid fa-warehouse', mult: 0.7, quick: true },
  { id: 'Factory', ar: 'مصنع', en: 'Factory', icon: 'fa-solid fa-industry', mult: 0.75, quick: false },
  { id: 'Land', ar: 'أرض', en: 'Land', icon: 'fa-solid fa-vector-square', mult: 0.8, quick: false },
  { id: 'Full Floor', ar: 'دور كامل', en: 'Full Floor', icon: 'fa-solid fa-cubes', mult: 1.3, quick: false },
  { id: 'Half Floor', ar: 'نصف دور', en: 'Half Floor', icon: 'fa-solid fa-cube', mult: 1.25, quick: false }
];

const predState = {
  category: 'buy',
  property_type: 'Apartment',
  size: 130.0,
  bedrooms: 3.0,
  bathrooms: 2.0,
  cityId: 'new_cairo',
  latitude: 30.022596,
  longitude: 31.470938,
  lastData: null,
  scenarioRooms: 1,
  scenarioDelta: 525000
};
window.predState = predState;

function getBedroomsRule(cat, pType) {
  if (cat === 'buy' || cat === 'rent') {
    return {
      visible: true,
      labelKey: 'lbl_beds',
      options: ['1', '2', '3', '4', '5', '6', '7+'],
      defaultVal: 3
    };
  }
  if (pType === 'Office Space' || pType === 'Clinic') {
    return {
      visible: true,
      labelKey: 'lbl_beds_office',
      options: ['1', '2', '3', '4', '5+'],
      defaultVal: 2
    };
  }
  return {
    visible: false,
    labelKey: 'lbl_beds',
    options: [],
    defaultVal: 1
  };
}

function getBathroomsRule(cat, pType) {
  if (cat === 'buy' || cat === 'rent' || pType === 'Office Space' || pType === 'Clinic') {
    return {
      visible: true,
      labelKey: 'lbl_baths',
      options: ['1', '2', '3', '4', '5+'],
      defaultVal: 2
    };
  }
  if (pType === 'Shop' || pType === 'Retail') {
    return {
      visible: true,
      labelKey: 'lbl_restrooms',
      options: ['0', '1', '2'],
      defaultVal: 1
    };
  }
  if (pType === 'Warehouse' || pType === 'Factory' || pType === 'Land') {
    return {
      visible: false,
      labelKey: 'lbl_baths',
      options: [],
      defaultVal: 1
    };
  }
  return {
    visible: true,
    labelKey: 'lbl_baths',
    options: ['1', '2', '3', '4', '5+'],
    defaultVal: 2
  };
}

function getPredictionPayload() {
  const sizeNum = parseFloat(predState.size) || 130.0;
  const bedRule = getBedroomsRule(predState.category, predState.property_type);
  const bathRule = getBathroomsRule(predState.category, predState.property_type);

  const bedroomsVal = bedRule.visible ? (parseFloat(predState.bedrooms) || bedRule.defaultVal) : 1.0;
  const bathroomsVal = bathRule.visible ? (parseFloat(predState.bathrooms) || bathRule.defaultVal) : 1.0;

  return {
    category: predState.category,
    property_type: predState.property_type,
    size: Math.max(20.0, Math.min(10000.0, sizeNum)),
    bedrooms: Number(bedroomsVal),
    bathrooms: Number(bathroomsVal),
    latitude: Number(predState.latitude.toFixed(6)),
    longitude: Number(predState.longitude.toFixed(6)),
    city_id: predState.cityId
  };
}

function fmtCompactNum(val) {
  if (!val || isNaN(val)) return '0';
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(0) + 'K';
  }
  return Math.round(val).toLocaleString('en-US');
}

function renderPredictionDashboard(data) {
  const placeholder = $('#pred-placeholder');
  const resultsWrap = $('#pred-results-wrap');

  if (!data) {
    if (placeholder) placeholder.style.display = 'flex';
    if (resultsWrap) resultsWrap.style.display = 'none';
    return;
  }
  predState.lastData = data;

  if (placeholder) placeholder.style.display = 'none';
  if (resultsWrap) resultsWrap.style.display = 'flex';

  // 1. Top Metrics Banner
  const compEl = $('#pred-stat-comp');
  if (compEl) {
    const diff = data.area_comparison_pct || 0;
    compEl.textContent = (diff >= 0 ? '+' : '') + diff + '%';
    compEl.classList.toggle('pred-stat-green', diff >= 0);
  }

  const m2El = $('#pred-stat-m2');
  if (m2El) {
    m2El.textContent = Math.round(data.meter_price || 0).toLocaleString('en-US');
  }

  const priceEl = $('#pred-display-price');
  if (priceEl) {
    priceEl.textContent = Math.round(data.predicted_price || 0).toLocaleString('en-US');
  }

  const currTag = $('#pred-curr-tag');
  if (currTag) {
    const isRent = data.currency && data.currency.includes('month');
    currTag.textContent = isRent ? (ar ? 'جنيه / شهر' : 'EGP / mo') : (ar ? 'جنيه' : 'EGP');
  }

  const confBadge = $('#pred-conf-text');
  if (confBadge) {
    const score = data.confidence_pct || 87;
    confBadge.textContent = ar ? `ثقة مرتفعة • %${score}` : `High Confidence • ${score}%`;
  }

  const minRangeEl = $('#pred-range-min');
  const maxRangeEl = $('#pred-range-max');
  if (minRangeEl) minRangeEl.textContent = fmtCompactNum(data.range_low);
  if (maxRangeEl) maxRangeEl.textContent = fmtCompactNum(data.range_high);

  const unitSub = $('.pred-unit-sub');
  if (unitSub) {
    const isRent = data.currency && data.currency.includes('month');
    unitSub.textContent = isRent ? (ar ? 'جنيه مصري / شهرياً' : 'EGP / mo') : (ar ? 'جنيه مصري' : 'EGP');
  }

  // 2. Feature Importance Horizontal Bars
  const featContainer = $('#pred-feat-bars');
  if (featContainer && data.feature_importance) {
    featContainer.innerHTML = data.feature_importance.map(item => `
      <div class="pred-feat-row">
        <span class="pred-feat-label">${ar ? item.feature : item.feature_en}</span>
        <div class="pred-feat-track">
          <div class="pred-feat-fill" style="width: ${item.pct}%;"></div>
        </div>
        <span class="pred-feat-pct">${item.pct}%</span>
      </div>
    `).join('');
  }

  // 3. SHAP Waterfall Breakdown
  const shapContainer = $('#pred-shap-container');
  if (shapContainer && data.shap_breakdown) {
    const total = data.predicted_price || 1;
    let runningVal = 0;

    shapContainer.innerHTML = data.shap_breakdown.map((item, idx) => {
      const isBase = item.type === 'base';
      const isTotal = item.type === 'total';
      const isNeg = item.type === 'negative';
      const isPos = item.type === 'positive';

      let leftPct = 0;
      let widthPct = 0;

      if (isBase) {
        leftPct = 0;
        widthPct = Math.min(100, Math.max(10, (item.amount / total) * 100));
        runningVal = item.amount;
      } else if (isTotal) {
        leftPct = 0;
        widthPct = 100;
      } else {
        const itemVal = item.amount;
        const prevRunning = runningVal;
        runningVal += itemVal;

        if (isNeg) {
          leftPct = Math.max(0, (runningVal / total) * 100);
          widthPct = Math.max(4, (Math.abs(itemVal) / total) * 100);
        } else {
          leftPct = Math.max(0, (prevRunning / total) * 100);
          widthPct = Math.max(4, (itemVal / total) * 100);
        }
      }

      // Format amount
      let valText = '';
      if (isBase || isTotal) {
        valText = Math.round(item.amount).toLocaleString('en-US');
      } else {
        const sign = item.amount >= 0 ? '+' : '-';
        valText = `${sign}${fmtCompactNum(Math.abs(item.amount))}`;
      }

      const barClass = isBase ? 'base' : (isTotal ? 'total' : (isNeg ? 'negative' : 'positive'));
      const valClass = isNeg ? 'neg' : (isPos ? 'pos' : '');

      return `
        <div class="pred-shap-row">
          <span class="pred-shap-name">${ar ? item.feature : item.feature_en}</span>
          <div class="pred-shap-bar-track">
            <div class="pred-shap-bar ${barClass}" style="left: ${leftPct.toFixed(1)}%; width: ${widthPct.toFixed(1)}%;"></div>
          </div>
          <span class="pred-shap-val ${valClass}">${valText}</span>
        </div>
      `;
    }).join('');

    // Axis Ticks
    const axisEl = $('#pred-shap-axis');
    if (axisEl) {
      const t1 = total * 0.4;
      const t2 = total * 0.6;
      const t3 = total * 0.8;
      const t4 = total * 1.0;
      const t5 = total * 1.2;
      axisEl.innerHTML = `
        <span>${fmtCompactNum(t1)}</span>
        <span>${fmtCompactNum(t2)}</span>
        <span>${fmtCompactNum(t3)}</span>
        <span>${fmtCompactNum(t4)}</span>
        <span>${fmtCompactNum(t5)}</span>
      `;
    }
  }

  // 4. Similar Properties (3 Real Listings rendered in 3-col grid)
  const simList = $('#pred-sim-list');
  if (simList && data.similar_properties) {
    const isRent = data.currency && data.currency.includes('month');
    const currStr = isRent ? (ar ? 'جنيه / شهرياً' : 'EGP / mo') : (ar ? 'جنيه' : 'EGP');

    simList.innerHTML = data.similar_properties.map(p => `
      <div class="pred-sim-tile" data-id="${p.id}" tabindex="0" role="button" title="${ar ? 'انقر لعرض تفاصيل العقار' : 'Click to view property details'}">
        <div class="pred-sim-tile-top">
          <span class="pred-sim-loc"><i class="fa-solid fa-location-dot"></i> ${p.city || ''}</span>
          <span class="pred-sim-tag">${p.size ? Math.round(p.size) + ' م²' : ''}</span>
        </div>
        <div class="pred-sim-tile-price">
          <span class="pred-sim-price-num">${p.price_formatted}</span>
          <span class="pred-sim-curr">${currStr}</span>
        </div>
        <div class="pred-sim-tile-meta">
          <span><i class="fa-solid fa-bed"></i> ${p.bedrooms} ${ar ? 'غرف' : 'beds'}</span>
          <span><i class="fa-solid fa-bath"></i> ${p.bathrooms} ${ar ? 'حمام' : 'baths'}</span>
        </div>
      </div>
    `).join('');

    // Clicking a similar listing jumps to recommendation details modal
    simList.querySelectorAll('.pred-sim-tile').forEach(tile => {
      tile.onclick = () => {
        const id = parseInt(tile.dataset.id, 10);
        if (id) {
          openRecDetailsModal(id);
        }
      };
      tile.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = parseInt(tile.dataset.id, 10);
          if (id) openRecDetailsModal(id);
        }
      };
    });
  }
}

async function fetchPredictionData(silent = false) {
  const btn = $('#pred-submit-btn');
  const spinner = btn ? btn.querySelector('.pred-btn-spinner') : null;
  const btnText = btn ? btn.querySelector('.pred-btn-text') : null;

  if (!silent && btn) {
    btn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    if (btnText) btnText.textContent = ar ? 'جارٍ التحليل بالذكاء الاصطناعي...' : 'Analyzing with AI...';
  }

  const payload = getPredictionPayload();

  try {
    // Delay of 3 to 8 seconds upon clicking calculate price
    const delayMs = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
    const [resp] = await Promise.all([
      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      new Promise(resolve => setTimeout(resolve, delayMs))
    ]);

    if (!resp.ok) {
      throw new Error(`Server returned HTTP ${resp.status}`);
    }

    const data = await resp.json();
    renderPredictionDashboard(data);
  } catch (err) {
    console.error('Prediction API failed:', err);
    if (!silent) {
      alert(ar ? 'حدث خطأ أثناء الاتصال بموديل التنبؤ. يرجى المحاولة لاحقاً.' : 'Error contacting prediction model. Please try again.');
    }
  } finally {
    if (!silent && btn) {
      btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = ar ? 'احسب السعر المتوقع' : 'Calculate Estimated Price';
    }
  }
}

function updatePredictionUI() {
  // 1. Sync Category Tiles
  $$('.pred-cat-tile').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === predState.category);
  });

  // 2. Populate Property Types Select
  const isRes = predState.category === 'buy' || predState.category === 'rent';
  const typeList = isRes ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES;

  if (!typeList.some(t => t.id === predState.property_type)) {
    predState.property_type = isRes ? 'Apartment' : 'Office Space';
  }

  const select = $('#pred-prop-type');
  if (select) {
    select.innerHTML = typeList.map(t => 
      `<option value="${t.id}" ${t.id === predState.property_type ? 'selected' : ''}>${ar ? t.ar : t.en}</option>`
    ).join('');
  }

  // 3. Populate Cities Select
  const citySelect = $('#pred-city-select');
  if (citySelect) {
    citySelect.innerHTML = CITIES_DATA.map(c => 
      `<option value="${c.id}" ${c.id === predState.cityId ? 'selected' : ''}>${ar ? c.ar : c.en}</option>`
    ).join('');
  }

  // 4. Populate Size Dropdown
  const sizeSelect = $('#pred-size');
  if (sizeSelect) {
    sizeSelect.innerHTML = PRED_SIZE_OPTIONS.map(opt =>
      `<option value="${opt.val}" ${Math.abs(opt.val - predState.size) < 1 ? 'selected' : ''}>${ar ? opt.ar : opt.en}</option>`
    ).join('');
  }

  // 5. Dynamic Rule for Bedrooms Field
  const bedRule = getBedroomsRule(predState.category, predState.property_type);
  const bedBox = $('#pred-beds-box');
  const bedLabel = $('#pred-beds-label');
  const bedSelect = $('#pred-beds-select');

  if (bedBox) {
    bedBox.style.display = bedRule.visible ? 'flex' : 'none';
  }
  if (!bedRule.visible) {
    predState.bedrooms = 1.0;
  } else if (!bedRule.options.some(opt => parseInt(opt, 10) === Math.round(predState.bedrooms))) {
    predState.bedrooms = bedRule.defaultVal;
  }
  if (bedLabel && bedRule.visible) {
    const lblSpan = bedLabel.querySelector('span') || bedLabel;
    lblSpan.textContent = ar ? (i18n.ar[bedRule.labelKey] || 'عدد غرف النوم') : (i18n.en[bedRule.labelKey] || 'Bedrooms');
  }
  if (bedSelect && bedRule.visible) {
    bedSelect.innerHTML = bedRule.options.map(opt => {
      const numVal = parseInt(opt, 10);
      const isSelected = Math.round(predState.bedrooms) === numVal || (opt.includes('+') && predState.bedrooms >= numVal);
      let text = opt;
      if (predState.property_type === 'Office Space' || predState.property_type === 'Clinic') {
        text = ar 
          ? `${opt} ${opt === '1' ? 'مكتب' : 'مكاتب / غرف'}`
          : (opt === '1' ? '1 Office / Room' : `${opt} Offices / Rooms`);
      } else {
        text = ar 
          ? `${opt} غرف`
          : (opt === '1' ? '1 Bedroom' : `${opt} Bedrooms`);
      }
      return `<option value="${numVal}" ${isSelected ? 'selected' : ''}>${text}</option>`;
    }).join('');
  }

  // 6. Dynamic Rule for Bathrooms Field
  const bathRule = getBathroomsRule(predState.category, predState.property_type);
  const bathBox = $('#pred-baths-box');
  const bathLabel = $('#pred-baths-label');
  const bathSelect = $('#pred-baths-select');

  if (bathBox) {
    bathBox.style.display = bathRule.visible ? 'flex' : 'none';
  }
  if (!bathRule.visible) {
    predState.bathrooms = 1.0;
  } else if (!bathRule.options.some(opt => parseInt(opt, 10) === Math.round(predState.bathrooms))) {
    predState.bathrooms = bathRule.defaultVal;
  }
  if (bathLabel && bathRule.visible) {
    const lblSpan = bathLabel.querySelector('span') || bathLabel;
    lblSpan.textContent = ar ? (i18n.ar[bathRule.labelKey] || 'عدد الحمامات') : (i18n.en[bathRule.labelKey] || 'Bathrooms');
  }
  if (bathSelect && bathRule.visible) {
    bathSelect.innerHTML = bathRule.options.map(opt => {
      const numVal = parseInt(opt, 10);
      const isSelected = Math.round(predState.bathrooms) === numVal || (opt.includes('+') && predState.bathrooms >= numVal);
      let text = opt;
      if (predState.property_type === 'Shop' || predState.property_type === 'Retail') {
        text = ar 
          ? (opt === '0' ? '0 دورة مياه' : `${opt} دورات مياه`)
          : (opt === '0' ? 'No Restrooms' : opt === '1' ? '1 Restroom' : `${opt} Restrooms`);
      } else {
        text = ar 
          ? `${opt} حمامات`
          : (opt === '1' ? '1 Bathroom' : `${opt} Bathrooms`);
      }
      return `<option value="${numVal}" ${isSelected ? 'selected' : ''}>${text}</option>`;
    }).join('');
  }
}

function resetPredictionForm() {
  predState.category = 'buy';
  predState.property_type = 'Apartment';
  predState.cityId = 'new_cairo';
  const c = CITIES_DATA.find(x => x.id === 'new_cairo');
  if (c) {
    predState.latitude = c.lat;
    predState.longitude = c.lng;
  }
  predState.size = 130.0;
  predState.bedrooms = 3.0;
  predState.bathrooms = 2.0;
  predState.lastData = null;

  const sizeSelect = $('#pred-size');
  if (sizeSelect) sizeSelect.value = '130';

  const citySelect = $('#pred-city-select');
  if (citySelect) citySelect.value = 'new_cairo';

  const bedSelect = $('#pred-beds-select');
  if (bedSelect) bedSelect.value = '3';

  const bathSelect = $('#pred-baths-select');
  if (bathSelect) bathSelect.value = '2';

  updatePredictionUI();

  const placeholder = $('#pred-placeholder');
  if (placeholder) placeholder.style.display = 'flex';

  const resultsWrap = $('#pred-results-wrap');
  if (resultsWrap) resultsWrap.style.display = 'none';

  const btn = $('#pred-submit-btn');
  const spinner = btn ? btn.querySelector('.pred-btn-spinner') : null;
  const btnText = btn ? btn.querySelector('.pred-btn-text') : null;
  if (btn) btn.disabled = false;
  if (spinner) spinner.style.display = 'none';
  if (btnText) btnText.textContent = ar ? (i18n.ar.btn_calc_price || 'احسب السعر المتوقع') : (i18n.en.btn_calc_price || 'Calculate Estimated Price');
}

function initPredictorListeners() {
  // Category Selection
  const catGroup = $('#pred-cat-group');
  if (catGroup) {
    catGroup.onclick = e => {
      const btn = e.target.closest('.pred-cat-tile');
      if (!btn) return;
      predState.category = btn.dataset.cat;
      const isRes = predState.category === 'buy' || predState.category === 'rent';
      predState.property_type = isRes ? 'Apartment' : 'Office Space';
      updatePredictionUI();
    };
  }

  // Property Type Select
  const typeSelect = $('#pred-prop-type');
  if (typeSelect) {
    typeSelect.onchange = e => {
      predState.property_type = e.target.value;
      updatePredictionUI();
    };
  }

  // City Select
  const citySelect = $('#pred-city-select');
  if (citySelect) {
    citySelect.onchange = e => {
      predState.cityId = e.target.value;
      const c = CITIES_DATA.find(x => x.id === predState.cityId);
      if (c) {
        predState.latitude = c.lat;
        predState.longitude = c.lng;
      }
      updatePredictionUI();
    };
  }

  // Size Select
  const sizeSelect = $('#pred-size');
  if (sizeSelect) {
    sizeSelect.onchange = e => {
      predState.size = parseFloat(e.target.value) || 130.0;
    };
  }

  // Bedrooms Select
  const bedSelect = $('#pred-beds-select');
  if (bedSelect) {
    bedSelect.onchange = e => {
      predState.bedrooms = parseFloat(e.target.value) || 1.0;
    };
  }

  // Bathrooms Select
  const bathSelect = $('#pred-baths-select');
  if (bathSelect) {
    bathSelect.onchange = e => {
      predState.bathrooms = parseFloat(e.target.value) || 1.0;
    };
  }

  // Explore in Recommendations Button (Transfer inputs + predicted price to Recommendations)
  const exploreBtn = $('#pred-explore-similar-btn');
  if (exploreBtn) {
    exploreBtn.onclick = () => {
      // 1. Map Category
      recState.category = predState.category || 'buy';
      $$('.rec-cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === recState.category);
      });

      // 2. Map Property Type
      recState.property_type = predState.property_type || 'Apartment';

      // 3. Map City
      const cityMap = {
        'new_cairo': 'New Cairo City',
        'sheikh_zayed': 'Sheikh Zayed',
        'october': '6th of October',
        'maadi': 'Maadi',
        'capital': 'New Capital City',
        'nasr_city': 'Nasr City',
        'heliopolis': 'Heliopolis',
        'alexandria': 'Alexandria',
        'north_coast': 'North Coast',
        'el_shorouk': 'El Shorouk City',
        'madinaty': 'Madinaty',
        'mostakbal': 'New Cairo City'
      };
      recState.city = cityMap[predState.cityId] || 'New Cairo City';

      // 4. Map Size
      const sVal = parseFloat(predState.size) || 130;
      if (sVal <= 75) recState.size_range = '0-75';
      else if (sVal <= 100) recState.size_range = '75-100';
      else if (sVal <= 150) recState.size_range = '100-150';
      else if (sVal <= 200) recState.size_range = '150-200';
      else if (sVal <= 300) recState.size_range = '200-300';
      else recState.size_range = '300+';

      const matchedSize = REC_SIZE_RANGES.find(s => s.id === recState.size_range);
      recState.min_size = matchedSize ? matchedSize.min : null;
      recState.max_size = matchedSize ? matchedSize.max : null;

      // 5. Map Bedrooms & Bathrooms
      const isComm = recState.category === 'commercial_buy' || recState.category === 'commercial_rent';
      const isShopOrWh = isComm && (predState.property_type === 'Shop' || predState.property_type === 'Warehouse' || predState.property_type === 'Retail');

      if (isShopOrWh) {
        recState.bedrooms = 'all';
        recState.bathrooms = 'all';
      } else {
        const bedVal = Math.round(parseFloat(predState.bedrooms) || 2);
        recState.bedrooms = bedVal >= 5 ? '5' : String(Math.max(1, bedVal));

        const bathVal = Math.round(parseFloat(predState.bathrooms) || 1);
        recState.bathrooms = bathVal >= 5 ? '5' : String(Math.max(1, bathVal));
      }

      // 6. Map Budget from Predicted Price
      const isRent = recState.category === 'rent' || recState.category === 'commercial_rent';
      const budgetList = isRent ? REC_RENT_BUDGET_RANGES : REC_BUY_BUDGET_RANGES;
      const predPrice = (predState.lastData && predState.lastData.predicted_price) ? predState.lastData.predicted_price : 0;

      if (predPrice > 0) {
        const match = budgetList.find(b =>
          b.id !== 'all' &&
          (b.min === null || predPrice >= b.min) &&
          (b.max === null || predPrice <= b.max)
        );
        if (match) {
          recState.budget_range = match.id;
          recState.min_price = match.min;
          recState.max_price = match.max;
        } else {
          recState.budget_range = 'all';
          recState.min_price = null;
          recState.max_price = null;
        }
      } else {
        recState.budget_range = 'all';
        recState.min_price = null;
        recState.max_price = null;
      }

      // 7. Re-populate recommendation dropdown selects
      populateRecSelects();

      // 8. Explicitly synchronize DOM form select values
      const propTypeSelect = $('#rec-prop-type');
      if (propTypeSelect) propTypeSelect.value = recState.property_type;

      const citySelect = $('#rec-city-select');
      if (citySelect) citySelect.value = recState.city;

      const budgetSelect = $('#rec-budget-select');
      if (budgetSelect) {
        budgetSelect.value = recState.budget_range;
        const opt = budgetSelect.querySelector(`option[value="${recState.budget_range}"]`);
        if (opt) opt.selected = true;
      }

      const sizeSelect = $('#rec-size-select');
      if (sizeSelect) {
        sizeSelect.value = recState.size_range;
        const opt = sizeSelect.querySelector(`option[value="${recState.size_range}"]`);
        if (opt) opt.selected = true;
      }

      const bedsSelect = $('#rec-beds-select');
      if (bedsSelect) bedsSelect.value = recState.bedrooms;

      const bathsSelect = $('#rec-baths-select');
      if (bathsSelect) bathsSelect.value = recState.bathrooms;

      // 9. Navigate to #recommend smoothly
      window._skipRouteRecSearch = true;
      location.hash = '#recommend';

      // 10. Execute search with reset pagination
      executeRecommendationSearch(true);

      // 11. Smooth scroll to the results section
      setTimeout(() => {
        const resultsHeader = document.querySelector('.rec-results-section') || document.getElementById('rec-results-grid');
        if (resultsHeader) {
          resultsHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    };
  }

  // Submit Button (Execute calculation on explicit user click)
  const form = $('#pform');
  if (form) {
    form.onsubmit = e => {
      e.preventDefault();
      fetchPredictionData(false);
    };
  }

  // Reset / Calculate Another Property Button
  const resetBtn = $('#pred-reset-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      resetPredictionForm();
    };
  }

  // Initial form options setup only (NO automatic prediction until user clicks calculate)
  updatePredictionUI();
}

/* ===== TRANSLATION ENGINE ===== */
function applyLanguage() {
  const dict = ar ? i18n.ar : i18n.en;

  // Static text nodes
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  // Placeholders
  $$('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (dict[key]) el.placeholder = dict[key];
  });

  // Range slider label
  if ($('#pv') && $('#pr')) {
    $('#pv').textContent = $('#pr').value + (ar ? ' مليون' : 'M');
  }

  // Lang switch button
  if ($('#lang')) $('#lang').textContent = ar ? 'English' : 'عربي';

  // Dynamic sections
  renderAllCards();
  renderFavorites();
  updateFavCounter();
  draw();
  updateDetailsUI();
  updatePredictionUI();
  populateRecSelects();

  // Re-render prediction dashboard so ML charts, SHAP, and metrics translate immediately!
  if (predState.lastData) {
    renderPredictionDashboard(predState.lastData);
  }

  // Update recommendation placeholder or results cards
  if (!window._recHasSearched) {
    renderRecInitialPlaceholder();
  } else if (recCurrentItems && recCurrentItems.length > 0) {
    const grid = $('#rec-results-grid');
    if (grid) {
      grid.innerHTML = recCurrentItems.map((p, idx) => renderRecPropertyCard(p, idx)).join('');
    }
    const countEl = $('#rec-results-count');
    if (countEl) {
      countEl.textContent = ar 
        ? `تم العثور على ${recTotalMatches.toLocaleString('en-US')} عقار • عرض أفضل ${recCurrentItems.length} مقترحات`
        : `Found ${recTotalMatches.toLocaleString('en-US')} properties • showing top ${recCurrentItems.length} recommendations`;
    }
  }

  // Titles / tooltips
  $$('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (dict[key]) el.title = dict[key];
  });

  // Re-render chat initial greeting if no active conversation yet
  const msgs = $('#msgs');
  if (msgs && (msgs.children.length <= 1)) {
    showChatGreeting();
  }
}

if ($('#lang')) {
  $('#lang').onclick = () => {
    ar = !ar;
    root.lang = ar ? 'ar-EG-u-nu-latn' : 'en-US';
    root.dir = ar ? 'rtl' : 'ltr';
    applyLanguage();
  };
}

// Initial render
populateRecSelects();
renderRecInitialPlaceholder();
initRealFavorites();
initRecommendationListeners();
initPredictorListeners();
applyLanguage();

/* ===== CHAT (Assistant) ===== */
let isChatBusy = false; window.isChatBusy = false; window.isChatBusy = false; window.isChatBusy = false;
const CHAT_SESSION_KEY = 'egy_ai_session_id';

function formatChatReply(text) {
  if (!text) return "";

  // Detect if bot is asking about property types or locations and offer clickable quick-options
  const options = [];
  const hasLocationKeyword = text.includes("المكان") || text.includes("المنطقة") || text.includes("المناطق") || text.includes("القاهرة الجديدة") || text.includes("الشيخ زايد") || text.includes("فين") || text.includes("في أي منطقة") || text.includes("أكتوبر");

  if (hasLocationKeyword) {
    options.push("القاهرة الجديدة", "الشيخ زايد", "6 أكتوبر", "المعادي", "العاصمة الإدارية", "مدينة نصر", "مدينتي", "الشروق");
  } else if (window.chatCurrentCategory === 'residential' || text.includes("نوع العقار السكني") || (text.includes("سكني") && !text.includes("تجاري")) || (text.includes("شقة") && (text.includes("فيلا") || text.includes("دوبلكس")))) {
    options.push("شقة", "فيلا مستقلة", "تاون هاوس", "توين هاوس", "دوبلكس", "بنتهاوس", "شاليه", "iVilla");
  } else if (window.chatCurrentCategory === 'commercial' || text.includes("نوع العقار التجاري") || (text.includes("تجاري") && (text.includes("نوع") || text.includes("مكتب") || text.includes("محل")))) {
    options.push("مكتب إداري", "محل تجاري", "عيادة", "مساحة تجارية", "مخزن");
  }

  let cleanText = text;
  // When choice pills exist, strip out redundant bullet lists, list headers, and option lines completely
  if (options.length > 0) {
    cleanText = cleanText
      .split('\n')
      .filter(line => {
        const raw = line.trim();
        if (!raw) return false;
        // Unconditionally remove any bullet point lines or list numbers
        if (/^[\*\-•]/.test(raw) || /^\d+[\.\)]/.test(raw)) return false;
        const t = raw.replace(/^[\*\-•\d\.\s]+/, '').replace(/[\*\:：]+/g, '').trim();
        if (/^(الأنواع|المناطق|الأماكن|الخيارات)\s*(المتوفرة|المقترحة|المتاحة|الشائعة)?/i.test(t)) return false;
        if (/^(اكتب|اختر|حدد|يمكنك|برجاء|تفضل)/i.test(t)) return false;
        // If line is one of the options
        if (options.some(opt => t === opt || t.includes(opt) || opt.includes(t))) return false;
        return true;
      })
      .join('\n')
      .replace(/[\s\n]*[\*\-•]\s*.*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  let safe = cleanText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/^[\*\-•]\s+(.*)$/gm, "• $1");
  safe = safe.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");

  if (options.length > 0) {
    const pillsHtml = options.map(opt => 
      `<button type="button" class="chat-option-pill" onclick="handleQuickChatOption('${opt}')"><span>${opt}</span></button>`
    ).join("");
    safe += `<div class="chat-quick-options">${pillsHtml}</div>`;
  }

  return safe;
}

function say(html, cls) {
  const msgs = $('#msgs');
  if (!msgs) return null;
  const r = document.createElement('div');
  if (cls === 'bot') {
    r.className = 'row';
    r.innerHTML = `<div class="egy-avatar-badge">EGY</div><div class="m bot">${html}</div>`;
  } else {
    r.className = 'm user';
    r.innerHTML = html;
  }
  msgs.append(r);
  r.scrollIntoView({ behavior: 'smooth' });
  return r.querySelector('.m') || r;
}

// Helper functions for Property Card interactions
function isPropertyFavorited(id) {
  const pid = parseInt(id, 10);
  return !isNaN(pid) && favoritesSet.has(pid);
}

function toggleFavorite(id) {
  const propId = parseInt(id, 10);
  if (isNaN(propId)) return false;

  const wasFav = favoritesSet.has(propId);
  if (wasFav) {
    favoritesSet.delete(propId);
  } else {
    favoritesSet.add(propId);
  }
  const isNowFav = !wasFav;

  saveFavoritesToStorage();
  updateFavCounter();

  // 1. Sync all buttons across DOM with data-prop-id = propId
  $$(`button.fav[data-prop-id="${propId}"], .chat-card-fav-btn[data-prop-id="${propId}"], .fav-card-heart-btn[data-prop-id="${propId}"]`).forEach(btn => {
    btn.classList.toggle('active', isNowFav);
    btn.classList.toggle('on', isNowFav);
    btn.title = isNowFav ? (ar ? 'في المفضلة' : 'Saved') : (ar ? 'إضافة للمفضلة' : 'Save');
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isNowFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      icon.style.color = isNowFav ? '#ef4444' : '';
    }
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', isNowFav ? '#ef4444' : 'none');
      svg.setAttribute('stroke', isNowFav ? '#ef4444' : '#64748b');
    }
  });

  // 2. Sync details view button if current property is this one
  if (currentDetailProp && currentDetailProp.id === propId) {
    const saveBtn = $('#det-fav-btn') || $('#details .btn.ghost');
    if (saveBtn) {
      saveBtn.classList.toggle('on', isNowFav);
      saveBtn.classList.toggle('active', isNowFav);
      const icon = saveBtn.querySelector('i');
      if (icon) {
        icon.className = isNowFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        icon.style.color = isNowFav ? '#ef4444' : '';
      }
      const label = saveBtn.querySelector('span');
      if (label) {
        label.textContent = isNowFav ? (ar ? 'في المفضلة' : 'Saved') : (ar ? 'حفظ العقار' : 'Save');
      }
    }
  }

  // 3. If preferences view is active or visible, immediately update favorites display
  const propsView = $('#properties');
  if (propsView && (propsView.classList.contains('show') || location.hash === '#properties')) {
    renderFavorites();
  }

  return isNowFav;
}

function toggleChatCardFav(id, btn) {
  const propId = parseInt(id, 10);
  if (isNaN(propId)) return;
  toggleFavorite(propId);
}

async function addDemoFavorites() {
  try {
    const resp = await fetch('/api/recommendations/featured/list?limit=3');
    if (resp.ok) {
      const featured = await resp.json();
      featured.forEach(p => {
        favoritesSet.add(p.id);
        propertyCache[p.id] = p;
      });
      saveFavoritesToStorage();
      updateFavCounter();
      renderFavorites();
    }
  } catch (e) {
    console.warn('Error adding demo favorites:', e);
  }
}

function showPropertyDetails(id) {
  const pid = parseInt(id, 10);
  if (isNaN(pid)) return;
  if (location.hash && location.hash !== '#details') {
    lastSourceHash = location.hash;
  }
  const showData = (data) => {
    propertyCache[pid] = data;
    updateDetailsUI(data);
    location.hash = '#details';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (propertyCache[pid]) {
    showData(propertyCache[pid]);
  } else {
    fetch(`/api/recommendations/${pid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          showData(data);
        } else {
          location.hash = '#details';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch(err => {
        console.error('Details fetch failed:', err);
        location.hash = '#details';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }
}

function addToComparison(id) {
  showPropertyDetails(id);
}

window.isPropertyFavorited = isPropertyFavorited;
window.toggleFavorite = toggleFavorite;
window.toggleChatCardFav = toggleChatCardFav;
window.addDemoFavorites = addDemoFavorites;
window.showPropertyDetails = showPropertyDetails;
window.addToComparison = addToComparison;



const CITY_NAMES_AR = {
  'New Cairo City': 'القاهرة الجديدة',
  'Sheikh Zayed': 'الشيخ زايد',
  '6th of October': '6 أكتوبر',
  'Maadi': 'المعادي',
  'Nasr City': 'مدينة نصر',
  'Madinaty': 'مدينتي',
  'New Capital City': 'العاصمة الإدارية',
  'El Shorouk City': 'الشروق',
  'Heliopolis': 'مصر الجديدة',
  'Alexandria': 'الإسكندرية',
  'North Coast': 'الساحل الشمالي'
};

function renderChatPropertyCard(p, idx) {
  return renderRecPropertyCard(p, idx);
}

window.renderChatPropertyCard = renderChatPropertyCard;
window.toggleChatCardFav = function(propId, btn) {
  const isFavNow = toggleFavorite(propId);
  if (btn) {
    btn.classList.toggle('active', isFavNow);
    btn.classList.toggle('on', isFavNow);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isFavNow ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }
  }
};


function renderMarketInsightCard(title, subtitle, confidence) {
  return `
    <div class="chat-insight-card">
      <div class="chat-insight-info">
        <span class="chat-insight-tag">MARKET INSIGHT</span>
        <span class="chat-insight-title">${title || 'Steady growth'}</span>
        <span class="chat-insight-conf-pill">${confidence || '80%'} confidence</span>
      </div>
      <svg class="chat-insight-sparkline" viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 34C30 32 60 28 85 18C105 10 120 6 126 4" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
  `;
}

function handleQuickChatOption(text) {
  if (isChatBusy) return;
  const ci = $("#ci");
  if (ci) ci.value = text;
  handleChatSubmit();
}
window.handleQuickChatOption = handleQuickChatOption;

function showChatGreeting() {
  const msgs = $("#msgs");
  if (!msgs) return;
  msgs.innerHTML = "";
  const greetingAr = `مرحبًا بك 👋<br><br>سأساعدك في العثور على العقار الأنسب لك من خلال <strong>3 خطوات بسيطة</strong>.<br><br>أولًا، ما نوع العقار والعملية التي تبحث عنها؟
    <div class="chat-quick-options">
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('سكني - شراء')">
        <i class="fa-solid fa-house"></i> <span>سكني - شراء</span>
      </button>
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('سكني - إيجار')">
        <i class="fa-solid fa-key"></i> <span>سكني - إيجار</span>
      </button>
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('تجاري - شراء')">
        <i class="fa-solid fa-briefcase"></i> <span>تجاري - شراء</span>
      </button>
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('تجاري - إيجار')">
        <i class="fa-solid fa-building"></i> <span>تجاري - إيجار</span>
      </button>
    </div>`;

  const greetingEn = `Welcome 👋<br><br>I will help you find the ideal property in <strong>3 simple steps</strong>.<br><br>First, what type of property and transaction are you looking for?
    <div class="chat-quick-options">
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('Residential - Buy')">
        <i class="fa-solid fa-house"></i> <span>Residential - Buy</span>
      </button>
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('Residential - Rent')">
        <i class="fa-solid fa-key"></i> <span>Residential - Rent</span>
      </button>
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('Commercial - Buy')">
        <i class="fa-solid fa-briefcase"></i> <span>Commercial - Buy</span>
      </button>
      <button type="button" class="chat-option-pill" onclick="handleQuickChatOption('Commercial - Rent')">
        <i class="fa-solid fa-building"></i> <span>Commercial - Rent</span>
      </button>
    </div>`;

  say(ar ? greetingAr : greetingEn, "bot");
}

async function ask(q) {
  const cleanQ = (q || '').trim();
  if (!cleanQ || isChatBusy) return;

  isChatBusy = true; window.isChatBusy = true; window.isChatBusy = true;
  const sendBtn = $('#chat-send-btn') || $('.chat-pill-send-btn') || $('#cform button[type="submit"]');
  if (sendBtn) sendBtn.disabled = true;

  say(cleanQ.replace(/</g, '&lt;'), 'user');
  const t = say('<span class="typing"><span></span><span></span><span></span></span>', 'bot');

  const sessionId = sessionStorage.getItem(CHAT_SESSION_KEY) || null;

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: cleanQ, session_id: sessionId }),
    });

    if (!resp.ok) {
      throw new Error(`Server returned HTTP ${resp.status}`);
    }

    const data = await resp.json();

    if (data.session_id) {
      sessionStorage.setItem(CHAT_SESSION_KEY, data.session_id);
    }

    if (t) {
      let contentHtml = formatChatReply(data.reply);

      // Check if price trend / market insight should be rendered
      if (cleanQ.includes('متوسط') || cleanQ.includes('سعر') || cleanQ.toLowerCase().includes('average') || cleanQ.toLowerCase().includes('trend')) {
        contentHtml += renderMarketInsightCard(ar ? 'نمو مستقر ومستمر' : 'Steady growth', '', '85%');
      }

      if (Array.isArray(data.properties) && data.properties.length > 0) {
        data.properties.forEach(p => {
          propertyCache[p.id] = p;
        });
        // Display 2 properties as requested
        const displayProps = data.properties.slice(0, 2);
        const cardsHtml = displayProps.map((p, idx) => renderChatPropertyCard(p, idx)).join("");
        contentHtml += `<div class="chat-prop-cards-grid">${cardsHtml}</div>`;

        // Transition CTA button to Recommendations
        const totalMatches = data.total_matches || data.properties.length;
        const filtersJson = encodeURIComponent(JSON.stringify(data.applied_filters || {}));
        const btnText = ar
          ? `عرض كل المقترحات (${totalMatches}) في التوصيات`
          : `View all (${totalMatches}) in Recommendations`;

        contentHtml += `
          <div class="chat-rec-transition-wrap">
            <button type="button" class="chat-explore-rec-btn" onclick="navigateToRecommendationsFromChat('${filtersJson}')" title="${btnText}">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>${btnText}</span>
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
          </div>
        `;
      }
      t.innerHTML = contentHtml;
      t.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error('Chat request failed:', err);
    if (t) {
      t.innerHTML = ar
        ? 'عذرًا، حدث خطأ أثناء الاتصال بالمساعد. يرجى المحاولة مرة أخرى.'
        : 'Sorry, an error occurred while connecting to the assistant. Please try again.';
      t.scrollIntoView({ behavior: 'smooth' });
    }
  } finally {
    isChatBusy = false; window.isChatBusy = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

function startNewChat() {
  sessionStorage.removeItem(CHAT_SESSION_KEY);
  isChatBusy = false; window.isChatBusy = false;
  const sendBtn = $('#chat-send-btn') || $('.chat-pill-send-btn') || $('#cform button[type="submit"]');
  if (sendBtn) sendBtn.disabled = false;
  showChatGreeting();
  const ci = $('#ci');
  if (ci) {
    ci.value = '';
    ci.focus();
  }
  const btn = $('#chat-new-btn') || $('#chat-drawer-toggle');
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.style.transition = 'transform 0.4s ease';
      icon.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        icon.style.transform = 'none';
      }, 400);
    }
  }
}
window.startNewChat = startNewChat;
window.ask = ask;

function initChatDrawer() {
  const btns = document.querySelectorAll('#chat-new-btn, #chat-drawer-toggle, .chat-drawer-toggle-btn');
  btns.forEach(btn => {
    btn.onclick = (e) => {
      if (e) e.preventDefault();
      startNewChat();
    };
  });
}

// Robust Chat Submission (Enter key, send button click, and form onsubmit)
function handleChatSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const ci = $('#ci');
  if (!ci) return false;
  const text = ci.value.trim();
  if (text) {
    ask(text);
    ci.value = '';
  }
  setTimeout(() => { if (ci) ci.focus(); }, 50);
  return false;
}

window.handleChatSubmit = handleChatSubmit;

const cformEl = $('#cform');
if (cformEl) {
  cformEl.onsubmit = handleChatSubmit;
  cformEl.addEventListener('submit', handleChatSubmit);
}

const ciInput = $('#ci');
if (ciInput) {
  ciInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleChatSubmit(e);
    }
  });
}

const sendBtnEl = $('#chat-send-btn') || $('.chat-pill-send-btn');
if (sendBtnEl) {
  sendBtnEl.onclick = handleChatSubmit;
  sendBtnEl.addEventListener('click', handleChatSubmit);
}

// Plus button in floating input triggers prompt idea
const chatPlusBtn = $('#chat-plus-btn');
if (chatPlusBtn) {
  chatPlusBtn.onclick = () => {
    const suggestions = [
      ar ? 'ما هي أفضل كمبوندات القاهرة الجديدة؟' : 'Best compounds in New Cairo?',
      ar ? 'هل 3.2M مناسب لشقة 160 م²؟' : 'Is 3.2M fair for 160 m²?',
      ar ? 'قارن لي بين الشيخ زايد والتجمع الخامس' : 'Compare Sheikh Zayed vs New Cairo'
    ];
    const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
    const ci = $('#ci');
    if (ci) {
      ci.value = pick;
      ci.focus();
    }
  };
}

// Initialize chat drawer & initial greeting
initFavEventListeners();
initChatDrawer();
const initialMsgs = $('#msgs');
if (initialMsgs && initialMsgs.children.length === 0) {
  showChatGreeting();
}

// Auth & User Account Dropdown (Opens downwards, exact width of button)
const userContainer = $('#nav-user-container');
const authBtn = $('#auth-btn');
const userMenuBtn = $('#user-menu-btn');
const dropdownAuthBtn = $('#nav-dropdown-auth-btn');

function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  if (userContainer) userContainer.classList.toggle('open');
}

if (authBtn) authBtn.onclick = toggleUserMenu;
if (userMenuBtn) userMenuBtn.onclick = toggleUserMenu;

if (dropdownAuthBtn) {
  dropdownAuthBtn.onclick = () => {
    if (userContainer) userContainer.classList.remove('open');
    alert(ar ? 'تم تسجيل الدخول بنجاح!' : 'Successfully signed in!');
  };
}

document.addEventListener('click', e => {
  if (userContainer && !userContainer.contains(e.target)) {
    userContainer.classList.remove('open');
  }
});

// Details Page Buttons (Contact & Save)
document.addEventListener('click', e => {
  const contactBtn = e.target.closest('#details .btn:not(.ghost)');
  if (contactBtn && !contactBtn.dataset.tab) {
    alert(ar ? 'تم إرسال طلب التواصل بنجاح! سيتواصل معك المالك قريباً.' : 'Contact request sent! The owner will reach out shortly.');
    return;
  }
  const saveBtn = e.target.closest('#details .btn.ghost, #det-fav-btn');
  if (saveBtn) {
    e.preventDefault();
    e.stopPropagation();
    if (currentDetailProp && currentDetailProp.id !== undefined) {
      toggleFavorite(currentDetailProp.id);
    }
  }
});

function navigateToRecommendationsFromChat(filtersJsonEncoded) {
  let filters = {};
  try {
    filters = JSON.parse(decodeURIComponent(filtersJsonEncoded));
  } catch (e) {
    console.error('Failed to parse chat filters:', e);
  }

  // 1. Map Category
  const cat = filters.category || 'buy';
  recState.category = cat;
  $$('.rec-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });

  // 2. Map Property Type (Handle string or array from tool)
  if (filters.property_type) {
    const rawType = Array.isArray(filters.property_type) ? filters.property_type[0] : filters.property_type;
    recState.property_type = rawType || 'Apartment';
  } else {
    recState.property_type = 'Apartment';
  }

  // 3. Map City (Handle string or array from tool)
  if (filters.city) {
    const rawCity = Array.isArray(filters.city) ? filters.city[0] : filters.city;
    recState.city = rawCity || 'New Cairo City';
  } else {
    recState.city = 'New Cairo City';
  }

  // 4. Reset budget and size filters to 'all' so all matching results appear
  recState.budget_range = 'all';
  recState.min_price = null;
  recState.max_price = null;
  recState.size_range = 'all';
  recState.min_size = null;
  recState.max_size = null;
  recState.bedrooms = filters.bedrooms ? String(filters.bedrooms) : 'all';
  recState.bathrooms = 'all';

  // 5. Re-populate selects and update DOM form controls
  populateRecSelects();

  const propTypeSelect = $('#rec-prop-type');
  if (propTypeSelect && recState.property_type) {
    propTypeSelect.value = recState.property_type;
  }

  const citySelect = $('#rec-city-select');
  if (citySelect && recState.city) {
    citySelect.value = recState.city;
  }

  // 6. Navigate to #recommend smoothly
  window._skipRouteRecSearch = true;
  location.hash = '#recommend';

  // 7. Execute search with reset pagination
  executeRecommendationSearch(true);

  // 8. Smooth scroll to the results section
  setTimeout(() => {
    const resultsHeader = document.querySelector('.rec-results-section') || document.getElementById('rec-results-grid');
    if (resultsHeader) {
      resultsHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 250);
}
window.navigateToRecommendationsFromChat = navigateToRecommendationsFromChat;
