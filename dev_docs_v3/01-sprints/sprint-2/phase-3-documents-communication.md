# Sprint 2 — Phase 3: Documents + Communication (Weeks 17-18)
> 6 tasks | 36-52h estimated | Prereq: Sprint 1 complete, app deployed

---

## SVC-DOC-001: Documents Backend Completion [P0]
**Effort:** L (8-12h)

### Current State
- **Built:** 3 controllers (documents, folders, templates), 3 services, 6 Prisma models, storage abstraction
- **In .bak (ready to wire):** `generation.controller.ts` (2.1K), `generation.service.ts` (11K), `shares.controller.ts` (1.9K), `shares.service.ts` (7.5K)
- **Missing:** Bulk upload, OCR search, version management, virus scanning

### Sub-tasks

#### DOC-001a: Integrate generation & sharing from .bak (2-3h)
**Source:** `apps/api/src/modules/documents.bak/`
**Target:** `apps/api/src/modules/documents/`

Steps:
1. Move `generation.controller.ts` → `controllers/document-generation.controller.ts`
2. Move `generation.service.ts` → `services/document-generation.service.ts`
3. Move `shares.controller.ts` → `controllers/document-shares.controller.ts`
4. Move `shares.service.ts` → `services/document-shares.service.ts`
5. Register all 4 in `documents.module.ts` providers and controllers arrays
6. Update imports to use current storage service (not .bak's version)
7. Update Prisma client imports to match current project structure
8. Test all new endpoints via Swagger/curl

**New endpoints after integration:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/documents/generate` | Generate document from template |
| POST | `/documents/generate/batch` | Batch generation |
| GET | `/documents/generate/:id/status` | Check generation status |
| POST | `/documents/:id/share` | Create share link |
| GET | `/documents/shared/:token` | Access shared document (public) |
| DELETE | `/documents/shares/:id` | Revoke share |
| GET | `/documents/:id/shares` | List shares for document |

#### DOC-001b: Add bulk upload endpoint (1-2h)
**File:** `apps/api/src/modules/documents/controllers/documents.controller.ts`

```typescript
@Post('bulk')
@UseInterceptors(FilesInterceptor('files', 20)) // max 20 files
async bulkUpload(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: BulkUploadDto,
  @CurrentTenant() tenantId: string,
  @CurrentUser() user: RequestUser,
) {
  return this.documentsService.bulkUpload(files, dto, tenantId, user.id);
}
```

BulkUploadDto:
```typescript
class BulkUploadDto {
  @IsOptional() @IsString() folderId?: string;
  @IsOptional() @IsString() entityType?: string; // 'load' | 'carrier' | 'customer'
  @IsOptional() @IsString() entityId?: string;
}
```

#### DOC-001c: Add document version management (1-2h)
**File:** `apps/api/src/modules/documents/services/documents.service.ts`

```typescript
async createVersion(documentId: string, file: Express.Multer.File, tenantId: string, userId: string) {
  const document = await this.prisma.document.findFirst({
    where: { id: documentId, tenantId },
  });
  if (!document) throw new NotFoundException();

  // Archive current version
  await this.prisma.documentVersion.create({
    data: {
      documentId,
      tenantId,
      versionNumber: document.currentVersion,
      fileUrl: document.fileUrl,
      fileSize: document.fileSize,
      uploadedById: userId,
    },
  });

  // Upload new file and update document
  const fileUrl = await this.storage.upload(file, `documents/${tenantId}/${documentId}`);
  return this.prisma.document.update({
    where: { id: documentId },
    data: {
      fileUrl,
      fileSize: file.size,
      currentVersion: document.currentVersion + 1,
      updatedById: userId,
    },
  });
}

async getVersions(documentId: string, tenantId: string) {
  return this.prisma.documentVersion.findMany({
    where: { documentId, tenantId },
    orderBy: { versionNumber: 'desc' },
  });
}
```

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/documents/:id/version` | Upload new version |
| GET | `/documents/:id/versions` | List version history |

#### DOC-001d: Add document search endpoint (2-3h)
**File:** `apps/api/src/modules/documents/services/documents.service.ts`

```typescript
async search(query: string, tenantId: string, filters?: DocumentSearchFilters) {
  const where: Prisma.DocumentWhereInput = {
    tenantId,
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
      // OCR text search if available
      { ocrText: { contains: query, mode: 'insensitive' } },
    ],
  };

  if (filters?.type) where.type = filters.type;
  if (filters?.entityType) where.entityType = filters.entityType;
  if (filters?.entityId) where.entityId = filters.entityId;
  if (filters?.folderId) where.folderId = filters.folderId;
  if (filters?.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) };

  return this.prisma.document.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
    include: { folder: true, tags: true, uploadedBy: { select: { id: true, name: true } } },
  });
}
```

**Endpoint:** `GET /documents/search?q=invoice&type=pdf&entityType=load`

#### DOC-001e: Add event emission (1h)
**File:** `apps/api/src/modules/documents/services/documents.service.ts`

```typescript
// After upload
this.eventEmitter.emit('document.uploaded', { documentId, tenantId, entityType, entityId });

// After generation
this.eventEmitter.emit('document.generated', { documentId, tenantId, templateId });

// After sharing
this.eventEmitter.emit('document.shared', { documentId, tenantId, shareToken });

// After POD upload
this.eventEmitter.emit('pod.uploaded', { documentId, tenantId, loadId });
```

Subscribe to:
```typescript
@OnEvent('load.created')
async handleLoadCreated(payload: { loadId: string, tenantId: string }) {
  // Auto-create document folder for load
  await this.foldersService.create({
    name: `Load ${payload.loadId}`,
    entityType: 'load',
    entityId: payload.loadId,
    tenantId: payload.tenantId,
  });
}
```

#### DOC-001f: Write tests (1-2h)
Test files:
- `documents.service.spec.ts` — upload, download, search, bulk upload
- `document-generation.service.spec.ts` — template rendering, batch
- `document-shares.service.spec.ts` — token generation, access control, expiry
- `document-versions.service.spec.ts` — version creation, history

### Acceptance Criteria
- [ ] Generation endpoints working (PDF from template)
- [ ] Sharing with access tokens working
- [ ] Bulk upload working (up to 20 files)
- [ ] Version management working
- [ ] Document search returns results by name, tag, OCR text
- [ ] Events published on upload/generate/share
- [ ] 15+ tests passing

---

## SVC-DOC-002: Documents UI Pages [P1]
**Effort:** L (8-12h) | 8 pages

### Current State
- **Hooks:** 4 basic (useDocuments, useUploadDocument, useDeleteDocument, useDocumentDownloadUrl)
- **Components:** 5 (document-list, document-actions, upload-zone, permit-list, rate-con-preview)
- **Pages:** 0

### Sub-tasks

#### DOC-002a: Create document hooks for new endpoints (2h)
**Create:** `apps/web/lib/hooks/documents/use-document-folders.ts`
```typescript
export function useDocumentFolders(parentId?: string) {
  return useQuery({ queryKey: ['document-folders', parentId], queryFn: ... });
}
export function useCreateFolder() { return useMutation(...); }
export function useDeleteFolder() { return useMutation(...); }
```

**Create:** `apps/web/lib/hooks/documents/use-document-templates.ts`
```typescript
export function useDocumentTemplates() { ... }
export function useGenerateDocument() { return useMutation(...); }
export function useGenerationStatus(generationId: string) { ... }
```

**Create:** `apps/web/lib/hooks/documents/use-document-shares.ts`
```typescript
export function useDocumentShares(documentId: string) { ... }
export function useCreateShare() { return useMutation(...); }
export function useRevokeShare() { return useMutation(...); }
```

**Create:** `apps/web/lib/hooks/documents/use-document-search.ts`
```typescript
export function useDocumentSearch(query: string, filters?: DocumentSearchFilters) { ... }
```

**Update:** `apps/web/lib/hooks/documents/use-documents.ts`
- Add `useBulkUpload()` mutation
- Add `useDocumentVersions(documentId)` query
- Add `useCreateVersion()` mutation
- Ensure all hooks use shared `unwrap()` pattern

#### DOC-002b: Document Library Page (2-3h)
**Create:** `apps/web/app/(dashboard)/documents/page.tsx`

Layout:
```
┌─────────────────────────────────────────────┐
│ Documents                    [Upload] [Search]│
├──────────┬──────────────────────────────────┤
│ Folders  │ Name | Type | Size | Date | Actions│
│ ┌──────┐ │ ────────────────────────────────── │
│ │ Root │ │ invoice.pdf | PDF | 2.1MB | ...    │
│ │ ├Load │ │ bol-12345.pdf | PDF | 1.3MB | ... │
│ │ ├Carr │ │ pod-photo.jpg | IMG | 4.5MB | ... │
│ │ └Cust │ │ contract.docx | DOC | 890KB | ... │
│ └──────┘ │                                    │
│          │ [< 1 2 3 ... >]                    │
├──────────┴──────────────────────────────────┤
│ Filters: [Type ▼] [Entity ▼] [Date Range]   │
└─────────────────────────────────────────────┘
```

Features:
- Folder tree sidebar with hierarchical navigation
- Data table: name, type icon, size (human-readable), date, entity link, actions
- Upload button → opens drag-and-drop modal
- Search bar with full-text search (debounced)
- Filters: document type, entity type, date range
- Bulk actions: download selected, move to folder, delete
- 4-state: loading skeleton, error with retry, empty "No documents yet", data table

#### DOC-002c: Document Detail/Viewer Page (2h)
**Create:** `apps/web/app/(dashboard)/documents/[id]/page.tsx`

Layout:
```
┌─────────────────────────────────────────────┐
│ ← Back to Documents         [Download] [Share]│
├─────────────────────────────┬───────────────┤
│                             │ Details        │
│    Document Preview         │ Name: ...      │
│    (PDF embed / image /     │ Type: PDF      │
│     text preview)           │ Size: 2.1MB    │
│                             │ Uploaded: ...  │
│                             │ By: John       │
│                             │ Entity: Load 12│
│                             ├───────────────┤
│                             │ Versions (3)   │
│                             │ v3 (current)   │
│                             │ v2 - Feb 20    │
│                             │ v1 - Feb 18    │
│                             ├───────────────┤
│                             │ Shares         │
│                             │ Link 1 (exp.)  │
│                             │ [+ Create]     │
└─────────────────────────────┴───────────────┘
```

Features:
- PDF viewer (embed or pdf.js), image display, text preview
- Metadata panel: name, type, size, uploader, date, linked entity
- Version history with download links for each version
- Upload new version button
- Share management: create/revoke share links
- Tags display and edit

#### DOC-002d: Template Manager Page (1-2h)
**Create:** `apps/web/app/(dashboard)/documents/templates/page.tsx`

Features:
- Template list with name, type (BOL, Invoice, Rate Con, etc.), last modified
- Create template: name, type, Handlebars content editor
- Preview with sample data
- Variable reference sidebar (available merge fields)
- Generate document from template button

#### DOC-002e: Upload Modal Component (1h)
**Create:** `apps/web/components/documents/upload-modal.tsx`

Features:
- Drag-and-drop zone (uses existing UploadZone component)
- Multiple file selection
- Progress bar per file
- Entity association selector (load, carrier, customer)
- Folder selection
- Tags input

#### DOC-002f: Folder Management Component (1h)
**Create:** `apps/web/components/documents/folder-tree.tsx`

Features:
- Hierarchical tree with expand/collapse
- Right-click context menu: create subfolder, rename, delete
- Drag documents into folders
- Folder icon with document count badge

#### DOC-002g: Share Dialog Component (1h)
**Create:** `apps/web/components/documents/share-dialog.tsx`

Features:
- Generate share link button
- Set expiry (1 day, 7 days, 30 days, never)
- Set max access count (optional)
- Copy link to clipboard
- List existing shares with revoke action

#### DOC-002h: Add loading.tsx and error.tsx (30min)
**Create:** `apps/web/app/(dashboard)/documents/loading.tsx`
**Create:** `apps/web/app/(dashboard)/documents/error.tsx`

### Acceptance Criteria
- [ ] Document library page with search, filters, pagination
- [ ] Upload → view → share → download flow works end-to-end
- [ ] Folder organization works (create, navigate, move documents)
- [ ] Template management works (create, preview, generate)
- [ ] Version history visible with download per version
- [ ] 4-state on all pages (loading/error/empty/data)

---

## SVC-DOC-003: Documents Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks

#### DOC-003a: Backend tests — generation service
- Template rendering with Handlebars variables
- Batch generation with status tracking
- Invalid template handling

#### DOC-003b: Backend tests — sharing service
- Token generation is unique
- Access with valid token returns document
- Access with expired token returns 403
- Access with revoked token returns 403
- Max access count enforcement

#### DOC-003c: Backend tests — bulk upload
- Upload 5 files → 5 document records created
- Upload with folder assignment
- Upload with entity association
- Upload exceeding limit (21 files) → error

#### DOC-003d: Backend tests — version management
- Create version → old version archived
- Get versions → ordered by version number desc
- Download specific version

#### DOC-003e: Frontend tests — document list
- Renders document table with data
- Search filters results
- Empty state shows message
- Loading state shows skeleton

#### DOC-003f: E2E test — document lifecycle
- Upload document → appears in list
- View document → preview renders
- Share document → copy link → access via link
- Download document → file received

### Acceptance Criteria
- [ ] 15+ tests passing
- [ ] Generation and sharing tested thoroughly
- [ ] Bulk upload tested with limits
- [ ] E2E flow tested

---

## SVC-COMM-001: Communication Backend Extension [P0]
**Effort:** L (6-8h)

### Current State
- **Built:** 5 controllers, 5 services, SendGrid + Twilio providers, 8 Prisma models
- **Missing:** WebSocket real-time, Firebase push, opt-out enforcement, quiet hours

### Sub-tasks

#### COMM-001a: Wire WebSocket for real-time notifications (2-3h)
**Create or extend:** `apps/api/src/modules/communication/communication.gateway.ts`

```typescript
@WebSocketGateway({ namespace: '/notifications', cors: true })
export class CommunicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (!userId) { client.disconnect(); return; }

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    client.join(`user:${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }
}
```

**Update:** `apps/api/src/modules/communication/notifications.service.ts`
```typescript
// After creating notification in DB:
this.gateway.emitToUser(notification.userId, 'notification:new', notification);
```

#### COMM-001b: Add push notification stub (1-2h)
**Create:** `apps/api/src/modules/communication/providers/firebase.provider.ts`

```typescript
@Injectable()
export class FirebaseProvider {
  async sendPush(token: string, title: string, body: string, data?: Record<string, string>) {
    // STUB — logs for now, full Firebase integration in Sprint 6 (Mobile)
    console.log(`[PUSH STUB] To: ${token}, Title: ${title}, Body: ${body}`);
    return { sent: false, reason: 'stub — Firebase not configured' };
  }
}
```

**Add endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/communication/push/tokens` | Register device token |
| DELETE | `/communication/push/tokens/:id` | Unregister device token |
| POST | `/communication/push/send` | Send push (stub logs) |

#### COMM-001c: Enforce opt-out before sending (1h)
**File:** `apps/api/src/modules/communication/email.service.ts`

```typescript
async sendEmail(to: string, subject: string, body: string, tenantId: string) {
  // Check opt-out BEFORE sending
  const optedOut = await this.prisma.emailOptOut.findFirst({
    where: { email: to, tenantId },
  });
  if (optedOut) {
    return { sent: false, reason: 'opted-out', optedOutAt: optedOut.createdAt };
  }

  // Proceed with SendGrid send...
}
```

**File:** `apps/api/src/modules/communication/sms.service.ts`
```typescript
async sendSms(to: string, body: string, tenantId: string) {
  const optedOut = await this.prisma.smsOptOut.findFirst({
    where: { phoneNumber: to, tenantId },
  });
  if (optedOut) {
    return { sent: false, reason: 'opted-out' };
  }

  // Proceed with Twilio send...
}
```

#### COMM-001d: Implement quiet hours (1h)
**File:** `apps/api/src/modules/communication/notifications.service.ts`

```typescript
async createNotification(data: CreateNotificationDto, tenantId: string) {
  const notification = await this.prisma.notification.create({ data: { ...data, tenantId } });

  // Check quiet hours before real-time delivery
  const prefs = await this.prisma.notificationPreference.findFirst({
    where: { userId: data.userId, tenantId },
  });

  if (prefs?.quietHoursEnabled && this.isDuringQuietHours(prefs)) {
    // Queue for delivery after quiet hours end
    await this.queueForLaterDelivery(notification, prefs.quietHoursEnd);
    return notification;
  }

  // Deliver immediately
  this.gateway.emitToUser(data.userId, 'notification:new', notification);

  // Also send push/email/SMS based on preferences
  if (prefs?.emailEnabled && data.priority !== 'LOW') {
    await this.emailService.sendNotificationEmail(data.userId, notification);
  }

  return notification;
}

private isDuringQuietHours(prefs: NotificationPreference): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const start = prefs.quietHoursStart; // e.g., 22
  const end = prefs.quietHoursEnd;     // e.g., 7

  if (start < end) return currentHour >= start && currentHour < end;
  return currentHour >= start || currentHour < end; // Wraps midnight
}
```

#### COMM-001e: Add missing events (30min)
```typescript
// Emit after each action
this.eventEmitter.emit('email.sent', { to, subject, tenantId, logId });
this.eventEmitter.emit('email.delivered', { logId, tenantId });
this.eventEmitter.emit('email.bounced', { logId, tenantId, reason });
this.eventEmitter.emit('sms.sent', { to, tenantId, messageId });
this.eventEmitter.emit('sms.received', { from, tenantId, messageId });
this.eventEmitter.emit('notification.created', { userId, type, tenantId });
```

#### COMM-001f: Write tests (1-2h)
- WebSocket delivery: create notification → emitToUser called
- Opt-out enforcement: opted-out email → sendEmail returns `{ sent: false }`
- Quiet hours: notification during quiet hours → queued, not delivered
- Template rendering: EN template renders, ES template renders
- SMS conversation threading: send → reply → same conversation

### Acceptance Criteria
- [ ] Real-time notifications via WebSocket
- [ ] Push notification stub registered (logs only)
- [ ] Opt-out checked before every email/SMS send
- [ ] Quiet hours respected (notifications queued, not lost)
- [ ] Events emitted on all communication actions
- [ ] 15+ tests passing

---

## SVC-COMM-002: Communication UI Pages [P1]
**Effort:** L (8-12h) | 7 pages

### Current State
- **Hooks:** 3 (useSendEmail, useEmailLogs, useAutoEmail — 370 LOC)
- **Pages:** 0

### Sub-tasks

#### COMM-002a: Create Communication hooks (2h)

**Create:** `apps/web/lib/hooks/communication/use-notifications.ts`
```typescript
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({ queryKey: ['notifications', filters], queryFn: ... });
}
export function useUnreadCount() {
  return useQuery({ queryKey: ['notifications', 'unread-count'], queryFn: ..., refetchInterval: 30_000 });
}
export function useMarkAsRead() { return useMutation(...); }
export function useMarkAllAsRead() { return useMutation(...); }
// WebSocket subscription hook
export function useNotificationSocket() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const socket = io('/notifications', { auth: { userId } });
    socket.on('notification:new', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Toast notification
      toast({ title: notification.title, description: notification.message });
    });
    return () => { socket.disconnect(); };
  }, [userId]);
}
```

**Create:** `apps/web/lib/hooks/communication/use-sms.ts`
```typescript
export function useSmsConversations() { ... }
export function useSmsMessages(conversationId: string) { ... }
export function useSendSms() { return useMutation(...); }
```

**Create:** `apps/web/lib/hooks/communication/use-templates.ts`
```typescript
export function useCommunicationTemplates(type?: 'email' | 'sms') { ... }
export function useTemplatePreview(templateId: string, variables: Record<string, string>) { ... }
export function useCreateTemplate() { return useMutation(...); }
export function useUpdateTemplate() { return useMutation(...); }
```

**Create:** `apps/web/lib/hooks/communication/use-preferences.ts`
```typescript
export function useNotificationPreferences() { ... }
export function useUpdatePreferences() { return useMutation(...); }
```

#### COMM-002b: Notification Center Page (2-3h)
**Create:** `apps/web/app/(dashboard)/notifications/page.tsx`

Layout:
```
┌──────────────────────────────────────────────┐
│ Notifications              [Mark All Read]    │
├──────────────────────────────────────────────┤
│ Filters: [All] [Unread] [Load] [Carrier] ... │
├──────────────────────────────────────────────┤
│ ● Load #12345 dispatched to ABC Carriers     │
│   2 minutes ago                        [···] │
│ ○ Invoice #INV-001 payment received          │
│   1 hour ago                           [···] │
│ ○ Carrier ABC updated insurance               │
│   3 hours ago                          [···] │
├──────────────────────────────────────────────┤
│ [Load More]                                   │
└──────────────────────────────────────────────┘
```

- Unread = filled dot (●), read = empty dot (○)
- Click notification → navigate to related entity
- Actions menu: mark read/unread, delete, mute type
- Real-time: new notifications appear at top without refresh
- Filter by type (load, carrier, invoice, system, etc.)

**Create:** `apps/web/components/notifications/notification-bell.tsx`
- Bell icon in header/navbar
- Unread count badge (red circle with number)
- Click → dropdown showing last 5 notifications
- "View all" link → `/notifications` page

#### COMM-002c: SMS Inbox Page (2-3h)
**Create:** `apps/web/app/(dashboard)/communication/sms/page.tsx`

Layout:
```
┌──────────────┬───────────────────────────────┐
│ Conversations│ John Doe — ABC Carriers        │
│ ┌──────────┐ │ ──────────────────────────     │
│ │ John D.  │ │ Hey, load #123 is running late │
│ │ Last: 2m │ │                    [You, 3:14p]│
│ ├──────────┤ │                                │
│ │ Jane S.  │ │ Thanks for letting us know     │
│ │ Last: 1h │ │               [John, 3:16p]    │
│ ├──────────┤ │                                │
│ │ Mike T.  │ │ ┌────────────────────────────┐ │
│ │ Last: 3h │ │ │ Type a message...    [Send]│ │
│ └──────────┘ │ └────────────────────────────┘ │
└──────────────┴───────────────────────────────┘
```

- Conversation list sidebar sorted by last message
- Message thread view with timestamps
- Compose/reply input with send button
- Contact info panel (name, phone, entity)
- Search conversations by name or content

#### COMM-002d: Email Log Page (1-2h)
**Create:** `apps/web/app/(dashboard)/communication/email/page.tsx`

Data table columns: To, Subject, Status (sent/delivered/opened/bounced), Template, Date, Actions
- Click row → view email details + tracking event timeline
- Resend button on each row
- Filters: status, date range, template
- Compose button → email compose dialog

#### COMM-002e: Template Manager Page (1-2h)
**Create:** `apps/web/app/(dashboard)/communication/templates/page.tsx`

- Template list: name, type (email/SMS), language (EN/ES), last modified
- Create/edit template with code editor (Handlebars syntax)
- Variable reference sidebar: `{{customer.name}}`, `{{load.number}}`, etc.
- Preview tab with sample data rendering
- Duplicate template button (for EN→ES translation)

#### COMM-002f: Preferences Page (1h)
**Create:** `apps/web/app/(dashboard)/communication/preferences/page.tsx`

Settings:
- Toggle by channel: Email, SMS, Push, In-App
- Toggle by category: Load updates, Carrier updates, Invoice updates, System
- Quiet hours: enable/disable, start time, end time
- Email frequency: Instant / Daily digest / Weekly digest

#### COMM-002g: Communication History Page (1h)
**Create:** `apps/web/app/(dashboard)/communication/history/page.tsx`

- Unified timeline: all emails, SMS, notifications for an entity
- Filter by entity (load, carrier, customer)
- Filter by channel
- Export communication history

#### COMM-002h: Add navigation, loading, error states (30min)
- Add "Communication" and "Notifications" to sidebar navigation
- **Create:** `apps/web/app/(dashboard)/communication/loading.tsx`
- **Create:** `apps/web/app/(dashboard)/communication/error.tsx`
- **Create:** `apps/web/app/(dashboard)/notifications/loading.tsx`
- **Create:** `apps/web/app/(dashboard)/notifications/error.tsx`

### Acceptance Criteria
- [ ] Notification center shows real-time notifications
- [ ] Bell icon in header shows unread count badge
- [ ] SMS inbox with conversation threading works
- [ ] Email log with delivery/tracking status visible
- [ ] Template CRUD with EN/ES preview works
- [ ] Preferences page with quiet hours
- [ ] Communication history timeline works
- [ ] All 7 pages show 4 states

---

## SVC-COMM-003: Communication Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks

#### COMM-003a: Backend — WebSocket notification delivery
- Create notification → `emitToUser` called with correct event
- Create notification during quiet hours → NOT emitted, queued

#### COMM-003b: Backend — opt-out enforcement
- Opted-out email → `sendEmail` returns `{ sent: false, reason: 'opted-out' }`
- Not opted-out → email sent normally
- Opted-out SMS → `sendSms` returns `{ sent: false }`

#### COMM-003c: Backend — quiet hours logic
- Current time 23:00, quiet hours 22:00-07:00 → quiet = true
- Current time 15:00, quiet hours 22:00-07:00 → quiet = false
- Current time 03:00, quiet hours 22:00-07:00 → quiet = true (wraps midnight)

#### COMM-003d: Backend — template rendering
- English template renders with variables
- Spanish template renders with variables
- Missing variable → renders empty string (not crash)

#### COMM-003e: Frontend — notification bell
- Renders unread count from API
- Clicking notification navigates to entity
- Mark as read updates count

#### COMM-003f: E2E — send email flow
- Send email → appears in email log → status "sent"
- Send to opted-out address → status "blocked"

### Acceptance Criteria
- [ ] 15+ tests passing
- [ ] WebSocket delivery tested
- [ ] Opt-out and quiet hours tested
- [ ] Template rendering in EN/ES tested

---

## Phase 3 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| SVC-DOC-001 | P0 | L (8-12h) | Documents backend |
| SVC-DOC-002 | P1 | L (8-12h) | 8 document pages |
| SVC-DOC-003 | P1 | M (3-4h) | 15+ tests |
| SVC-COMM-001 | P0 | L (6-8h) | Communication backend |
| SVC-COMM-002 | P1 | L (8-12h) | 7 communication pages |
| SVC-COMM-003 | P1 | M (3-4h) | 15+ tests |
| **TOTAL** | | **36-52h** | |

### Execution Order
1. DOC-001a (wire .bak code) + COMM-001a (WebSocket) — parallel, independent
2. DOC-001b-e (remaining backend) + COMM-001b-e (remaining backend) — parallel
3. DOC-002 + COMM-002 (UI pages — parallel after backends done)
4. DOC-003 + COMM-003 (tests — after pages stabilize)
