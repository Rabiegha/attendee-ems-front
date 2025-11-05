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

// Badge Designer specific types (from original badge generator)
export interface BadgeElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  properties: Record<string, any>;
}

export interface BadgeDesignDimensions {
  width: number;
  height: number;
}

export interface BadgeDesignData {
  dimensions: BadgeDesignDimensions;
  elements: BadgeElement[];
  variables: string[];
}