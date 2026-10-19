export interface BlogSearchParams {
  q?: string | string[];
  tag?: string | string[];
  order?: string | string[];
  page?: string | string[];
}

export interface ParsedBlogFilters {
  q?: string;
  tag?: string;
  dateOrder: 'asc' | 'desc';
  pageNumber: number;
  errors: string[];
}

export function readBlogFilters(params: BlogSearchParams = {}): ParsedBlogFilters {
  const errors: string[] = [];

  const rawQ = Array.isArray(params.q) ? params.q[0] : params.q;
  const rawTag = Array.isArray(params.tag) ? params.tag[0] : params.tag;
  const rawOrder = Array.isArray(params.order) ? params.order[0] : params.order;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;

  let q: string | undefined;
  if (rawQ !== undefined && rawQ.trim() !== '') {
    if (rawQ.length > 200) {
      errors.push('Search query must be 200 characters or fewer.');
    } else {
      q = rawQ.trim();
    }
  }

  let tag: string | undefined;
  if (rawTag !== undefined && rawTag.trim() !== '') {
    if (rawTag.length > 60) {
      errors.push('Tag filter must be 60 characters or fewer.');
    } else {
      tag = rawTag.trim();
    }
  }

  let dateOrder: 'asc' | 'desc' = 'desc';
  if (rawOrder !== undefined && rawOrder.trim() !== '') {
    const normalized = rawOrder.trim().toLowerCase();
    if (normalized === 'asc' || normalized === 'desc') {
      dateOrder = normalized;
    } else {
      errors.push('Order must be either "asc" or "desc".');
    }
  }

  let pageNumber = 1;
  if (rawPage !== undefined && rawPage.trim() !== '') {
    const parsed = parseInt(rawPage.trim(), 10);
    if (isNaN(parsed) || parsed < 1) {
      errors.push('Page must be a positive integer.');
    } else {
      pageNumber = parsed;
    }
  }

  return {
    q,
    tag,
    dateOrder,
    pageNumber,
    errors,
  };
}
