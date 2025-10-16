/**
 * Get the champion icon URL from Data Dragon
 * Uses the latest version and handles special champion name cases
 */

const LATEST_VERSION = '14.24.1'; // Update this regularly or fetch from API

// Map of champion names that have different internal names
const CHAMPION_NAME_MAP: Record<string, string> = {
  'FiddleSticks': 'Fiddlesticks',
  'Wukong': 'MonkeyKing',
  'Renata': 'RenataGlasc',
  'BelVeth': "Bel'Veth",
  'KSante': "K'Sante",
  'Smolder': 'Smolder', // Smolder should work but verify
};

/**
 * Normalize champion name for Data Dragon
 */
export function normalizeChampionName(championName: string): string {
  return CHAMPION_NAME_MAP[championName] || championName;
}

/**
 * Get champion icon URL
 * @param championName - The champion name from match data
 * @param version - Data Dragon version (optional, defaults to latest)
 * @returns URL to the champion icon
 */
export function getChampionIconUrl(championName: string, version: string = LATEST_VERSION): string {
  const normalizedName = normalizeChampionName(championName);
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${normalizedName}.png`;
}

/**
 * Get champion icon URL with fallback to champion ID
 * @param championName - The champion name
 * @param championId - The champion ID as fallback
 * @returns URL to the champion icon
 */
export function getChampionIconUrlWithFallback(championName: string, championId?: number): string {
  // Try with champion name first
  return getChampionIconUrl(championName);
}

/**
 * Handle champion icon error by trying fallback URLs
 */
export function handleChampionIconError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  championName: string,
  championId?: number
): void {
  const img = event.currentTarget;
  const currentSrc = img.src;

  // If we haven't tried the normalized name yet, try it
  if (!currentSrc.includes('fallback')) {
    const normalizedName = normalizeChampionName(championName);
    if (normalizedName !== championName) {
      img.src = getChampionIconUrl(normalizedName);
      return;
    }

    // Try with an older version
    img.src = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${championName}.png`;
    img.setAttribute('data-fallback', 'true');
    return;
  }

  // If all else fails, hide the image and show the champion ID
  img.style.display = 'none';

  // Create a fallback div with the champion initial
  const parent = img.parentElement;
  if (parent && !parent.querySelector('.champion-fallback')) {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'champion-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-base-medium to-base-dark text-white font-bold text-lg';
    fallbackDiv.textContent = championName.charAt(0).toUpperCase();
    parent.appendChild(fallbackDiv);
  }
}
