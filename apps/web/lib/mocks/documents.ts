export interface MockDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'docx' | 'xlsx';
  folderId: string;
  size: number;
  uploadedAt: Date;
  createdBy: string;
  deletedAt: null | Date;
  versions: Array<{ id: string; uploadedAt: Date }>;
}

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'doc-1',
    name: 'BOL-2024-001.pdf',
    type: 'pdf',
    folderId: 'folder-1',
    size: 245000,
    uploadedAt: new Date('2024-01-15'),
    createdBy: 'John Doe',
    deletedAt: null,
    versions: [
      { id: 'v1', uploadedAt: new Date('2024-01-15') },
      { id: 'v2', uploadedAt: new Date('2024-01-16') },
    ],
  },
  {
    id: 'doc-2',
    name: 'Invoice-2024-500.pdf',
    type: 'pdf',
    folderId: 'folder-3',
    size: 180000,
    uploadedAt: new Date('2024-01-14'),
    createdBy: 'Jane Smith',
    deletedAt: null,
    versions: [{ id: 'v1', uploadedAt: new Date('2024-01-14') }],
  },
  {
    id: 'doc-3',
    name: 'Manifest.xlsx',
    type: 'xlsx',
    folderId: 'folder-2',
    size: 95000,
    uploadedAt: new Date('2024-01-13'),
    createdBy: 'Bob Wilson',
    deletedAt: null,
    versions: [{ id: 'v1', uploadedAt: new Date('2024-01-13') }],
  },
];

export const MOCK_FOLDERS = [
  { id: 'folder-1', name: 'BOLs', parentId: null, createdAt: new Date() },
  { id: 'folder-2', name: 'PODs', parentId: null, createdAt: new Date() },
  { id: 'folder-3', name: 'Invoices', parentId: null, createdAt: new Date() },
];
