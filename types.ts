export interface IpGroup {
  key: string; // The 3-octet prefix (e.g., "192.168.1")
  ips: string[];
}

export interface ColumnData {
  id: number;
  ips: string[]; // Changed from groups[] to flat string[] for shuffled output
  totalIps: number;
}

export interface ProcessingStats {
  totalInput: number;
  validUnique: number;
  spamRemoved: number;
  totalGroups: number; // Still useful to know internal group count
}