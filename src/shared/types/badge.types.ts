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
  pagination: {
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
  LARGE: { width: 96, height: 268, name: '96x268mm' },
  SMALL: { width: 96, height: 164, name: '96x164mm' }
};

export type BadgeFormat = {
  width: number;
  height: number;
  name: string;
};

// Badge element (from original badge generator)
export interface BadgeElement {
  id: string;
  type: 'text' | 'qrcode' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
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