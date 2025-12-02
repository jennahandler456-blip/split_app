import { ColumnData, ProcessingStats } from '../types';

// Regex to identify IPv4 addresses
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

/**
 * Extracts unique, valid IPv4s from a string.
 */
export const extractIPs = (text: string): Set<string> => {
  const matches = text.match(IP_REGEX);
  if (!matches) return new Set();
  return new Set(matches);
};

/**
 * Gets the first 3 octets of an IP (e.g., 192.168.1.50 -> 192.168.1)
 */
const getGroupKey = (ip: string): string => {
  const parts = ip.split('.');
  return parts.slice(0, 3).join('.');
};

/**
 * Identifies the Class of an IPv4 address.
 * Class A: 0-127
 * Class B: 128-191
 * Class C: 192-223
 */
const getClass = (ip: string): string => {
  const firstOctet = parseInt(ip.split('.')[0], 10);
  if (isNaN(firstOctet)) return 'Other';
  
  if (firstOctet >= 0 && firstOctet <= 127) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  
  return 'Other'; // D, E, Loopback, etc.
};

/**
 * Fisher-Yates Shuffle Algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Main processing function
 * Strategy:
 * 1. Clean & Filter IPs.
 * 2. Group by 3-octets.
 * 3. Classify Groups (A, B, C).
 * 4. Interleave Groups to mix Classes (A, B, C, A, B, C...).
 * 5. Distribute IPs STRICTLY round-robin to ensure perfect numerical balance.
 */
export const processIPs = (
  rawInput: string,
  spamInput: string,
  columnCount: number
): { columns: ColumnData[]; stats: ProcessingStats } => {
  
  // 1. Parse Inputs
  const rawSet = extractIPs(rawInput);
  const spamSet = extractIPs(spamInput);
  
  const totalInput = rawSet.size;
  let validUniqueCount = 0;
  let spamRemovedCount = 0;

  // 2. Filter Spam & Create Groups
  const groupsMap = new Map<string, string[]>();

  rawSet.forEach((ip) => {
    if (spamSet.has(ip)) {
      spamRemovedCount++;
    } else {
      validUniqueCount++;
      const key = getGroupKey(ip);
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(ip);
    }
  });

  // 3. Classify Groups into Buckets
  const classBuckets: Record<string, string[][]> = {
    'A': [], 'B': [], 'C': [], 'Other': []
  };

  groupsMap.forEach((ips) => {
    if (ips.length > 0) {
      const ipClass = getClass(ips[0]);
      if (classBuckets[ipClass]) {
        classBuckets[ipClass].push(ips);
      } else {
        classBuckets['Other'].push(ips);
      }
    }
  });

  // 4. Interleave Groups (Mix Classes)
  // We take turns pulling from A, B, C, Other to ensure maximizing diversity in the stream
  const interleavedGroups: string[][] = [];
  const keys = ['A', 'B', 'C', 'Other'];
  
  // Shuffle groups within their specific class bucket first to avoid pattern repetition
  keys.forEach(k => {
    classBuckets[k] = shuffleArray(classBuckets[k]);
  });

  const maxLen = Math.max(...keys.map(k => classBuckets[k].length));

  for (let i = 0; i < maxLen; i++) {
    keys.forEach(k => {
      if (classBuckets[k][i]) {
        interleavedGroups.push(classBuckets[k][i]);
      }
    });
  }

  // 5. Distribute Groups (Strict Round Robin)
  const tempColumns: string[][] = Array.from({ length: columnCount }, () => []);
  
  // Start at a random column to prevent the first column from always getting the extra IP 
  // (though the count will always be balanced within +/- 1)
  let colIndex = Math.floor(Math.random() * columnCount);

  interleavedGroups.forEach((groupIps) => {
    // Shuffle IPs within the group
    const shuffledIps = shuffleArray(groupIps);
    
    // Distribute IPs one by one, incrementing the global column index.
    // This ensures STRICT balance. If we have 12 IPs and 2 columns, both get 6.
    shuffledIps.forEach((ip) => {
      tempColumns[colIndex].push(ip);
      colIndex = (colIndex + 1) % columnCount;
    });
  });

  // 6. Final Shuffle & Format
  // We shuffle the final columns because the round-robin distribution creates a striped pattern.
  // Shuffling vertically inside the column hides the pattern while maintaining the count.
  const columns: ColumnData[] = tempColumns.map((ips, index) => ({
    id: index + 1,
    ips: shuffleArray(ips),
    totalIps: ips.length,
  }));

  return {
    columns,
    stats: {
      totalInput,
      validUnique: validUniqueCount,
      spamRemoved: spamRemovedCount,
      totalGroups: groupsMap.size,
    },
  };
};