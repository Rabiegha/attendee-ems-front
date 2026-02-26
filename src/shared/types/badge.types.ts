export interface BadgeTemplate {
  id: string;
  org_id: string;
  event_id?: string;
  code: string;
  name: string;
  description?: string;
  html?: string;
  css?: string;
  width: number;
  height: number;
  template_data?: any;
  variables?: string[];
  is_default: boolean;
  is_active: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BadgeTemplateListResponse {
  data: BadgeTemplate[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBadgeTemplateDto {
  code: string;
  name: string;
  description?: string;
  event_id?: string;
  html?: string;
  css?: string;
  width?: number;
  height?: number;
  template_data?: any;
  variables?: string[];
  is_default?: boolean;
  is_active?: boolean;
}

export interface UpdateBadgeTemplateDto {
  code?: string;
  name?: string;
  description?: string;
  html?: string;
  css?: string;
  width?: number;
  height?: number;
  template_data?: any;
  variables?: string[];
  is_default?: boolean;
  is_active?: boolean;
}

export interface DuplicateBadgeTemplateDto {
  code: string;
  name: string;
  description?: string;
}

export interface BadgeTemplatePreview {
  template: BadgeTemplate;
  attendeeData?: any;
  previewVariables: Record<string, string>;
}

// Badge formats in mm (from original badge generator)
export const BADGE_FORMATS = {
  // Badges événementiels
  LARGE: { width: 96, height: 268, name: 'Badge Large (96×268mm)', category: 'badge' },
  SMALL: { width: 96, height: 164, name: 'Badge Petit (96×164mm)', category: 'badge' },
  CR80: { width: 54, height: 86, name: 'Carte CR-80 (54×86mm)', category: 'badge' },
  // Formats papier standard
  A4: { width: 210, height: 297, name: 'A4 (210×297mm)', category: 'paper' },
  A5: { width: 148, height: 210, name: 'A5 (148×210mm)', category: 'paper' },
  A6: { width: 105, height: 148, name: 'A6 (105×148mm)', category: 'paper' },
  A7: { width: 74, height: 105, name: 'A7 (74×105mm)', category: 'paper' },
  LETTER: { width: 216, height: 279, name: 'Letter US (216×279mm)', category: 'paper' },
} as const;

export const BADGE_FORMAT_LIST = Object.entries(BADGE_FORMATS).map(([key, val]) => ({
  key,
  ...val,
}));

export type BadgeFormatKey = keyof typeof BADGE_FORMATS;

export type BadgeFormat = {
  width: number;
  height: number;
  name: string;
  category?: string;
};

// Badge element (from original badge generator)
export interface BadgeElement {
  id: string;
  type: 'text' | 'qrcode' | 'image' | 'qr' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  rotation?: number;
  properties?: any;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    fontWeight: string;
    fontStyle: string;
    textAlign: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    transform: string;
    rotation: number;
    textTransform?: 'uppercase' | 'none';
    textDecoration?: 'none' | 'underline' | 'line-through';
    opacity: number;
    zIndex: number;
    lineHeight?: number;
    letterSpacing?: number;
    alignItems?: 'flex-start' | 'center' | 'flex-end';
  };
  imageId?: string;
  aspectRatio?: number;
  maintainAspectRatio?: boolean;
}

export type UploadedImage = {
  data: string;
  filename: string;
};

export type HistoryState = {
  elements: BadgeElement[];
  background: string | null;
  symmetryPairs: [string, string][]; // Array of [parentId, cloneId] pairs
};

export interface BadgeDesignDimensions {
  width: number;
  height: number;
}

export interface BadgeDesignData {
  dimensions: BadgeDesignDimensions;
  elements: BadgeElement[];
  variables: string[];
}