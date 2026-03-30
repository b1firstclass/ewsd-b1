/**
 * Faculty-specific banner image mapping for ContributionCard decorative footers.
 * 
 * Each faculty maps to a set of banner images. A deterministic hash of the
 * contribution ID selects one banner from the set, ensuring visual variety
 * without randomness on re-render.
 * 
 * Faculties without dedicated banners fall back to a default set.
 */

import bannerArt1 from "@/assets/banner_art_1.jpg";
import bannerArt2 from "@/assets/banner_art_2.jpg";
import bannerArt3 from "@/assets/banner_art_3.jpg";
import bannerArt4 from "@/assets/banner_art_4.jpg";
import bannerArt5 from "@/assets/banner_art_5.jpg";
import bannerEng1 from "@/assets/banner_engineering_1.jpg";
import bannerEng2 from "@/assets/banner_engineering_2.jpg";
import bannerEng3 from "@/assets/banner_engineering_3.jpg";

const FACULTY_BANNERS: Record<string, string[]> = {
  "Arts & Humanities": [bannerArt1, bannerArt2, bannerArt3, bannerArt4, bannerArt5],
  "Engineering": [bannerEng1, bannerEng2, bannerEng3],
};

// Fallback: mix of all available banners for faculties without dedicated sets
const DEFAULT_BANNERS = [bannerArt1, bannerEng1, bannerArt2, bannerEng2, bannerArt3, bannerEng3];


/**
 * Get a banner image using index-based round-robin distribution.
 *
 * @param index - The index of the item in the rendered list
 * @param facultyName - Optional faculty name
 * @returns Banner image path
 */
export const getFacultyBanner = (
  index: number,
  facultyName?: string
): string => {
  const banners =
    (facultyName && FACULTY_BANNERS[facultyName]) || DEFAULT_BANNERS;

  return banners[index % banners.length];
};