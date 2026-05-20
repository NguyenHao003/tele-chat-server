export class Metadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;

  constructor({
    page = 1,
    pageSize = 0,
    totalItems = 0,
    totalPages,
  }: Partial<Metadata> = {}) {
    this.page = page;
    this.pageSize = pageSize;
    this.totalItems = totalItems;
    this.totalPages =
      totalPages ?? (pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0);
  }
}

export class PaginationResponse<T> {
  metadata: Metadata;
  items: T[];

  constructor({
    items,
    metadata,
  }: {
    items: T[];
    metadata?: Partial<Metadata>;
  }) {
    this.metadata = new Metadata({
      page: metadata?.page ?? 1,
      pageSize: metadata?.pageSize ?? items.length,
      totalItems: metadata?.totalItems ?? items.length,
      totalPages: metadata?.totalPages,
    });

    this.items = items;
  }
}
