# Load Board Module API Spec

**Module:** `apps/api/src/modules/load-board/`
**Base path:** `/api/v1/`
**Controllers:** LoadPostingsController, LoadBidsController, LoadTendersController, AccountsController, AnalyticsController, CapacityController, LeadsController, PostingController, RulesController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P0 (MVP)

---

## LoadPostingsController

**Route prefix:** `load-postings`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/load-postings` | Create load posting | ADMIN, DISPATCHER, SALES_REP |
| GET | `/load-postings` | List load postings | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER |
| GET | `/load-postings/search/geo` | Search by geo radius | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER |
| GET | `/load-postings/search/lane` | Search by lane | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER |
| GET | `/load-postings/:id` | Get posting by ID | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER |
| PUT | `/load-postings/:id` | Update posting | ADMIN, DISPATCHER, SALES_REP |
| DELETE | `/load-postings/:id` | Delete posting | ADMIN, DISPATCHER, SALES_REP |
| PUT | `/load-postings/:id/expire` | Expire posting | ADMIN, DISPATCHER, SALES_REP |
| PUT | `/load-postings/:id/refresh` | Refresh posting | ADMIN, DISPATCHER, SALES_REP |
| POST | `/load-postings/:id/track-view` | Track posting view | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER |
| GET | `/load-postings/:id/metrics` | Get posting metrics | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER |

**DTOs:** CreateLoadPostingDto, UpdateLoadPostingDto, SearchLoadPostingDto, GeoSearchQueryDto, LaneSearchDto

---

## LoadBidsController

**Route prefix:** `load-bids`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/load-bids` | Create bid | ADMIN, DISPATCHER, CARRIER |
| GET | `/load-bids` | List bids (filter by postingId/carrierId) | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER |
| GET | `/load-bids/posting/:postingId` | List bids for posting | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER |
| GET | `/load-bids/carrier/:carrierId` | List bids for carrier | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER |
| GET | `/load-bids/:id` | Get bid by ID | ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER |
| PUT | `/load-bids/:id` | Update bid | ADMIN, DISPATCHER, SALES_REP |
| PUT | `/load-bids/:id/accept` | Accept bid | ADMIN, DISPATCHER, SALES_REP |
| PUT | `/load-bids/:id/reject` | Reject bid | ADMIN, DISPATCHER, SALES_REP |
| PUT | `/load-bids/:id/counter` | Counter bid | ADMIN, DISPATCHER, SALES_REP |
| PUT | `/load-bids/:id/withdraw` | Withdraw bid | ADMIN, DISPATCHER, CARRIER |

**DTOs:** CreateLoadBidDto, UpdateLoadBidDto, AcceptBidDto, RejectBidDto, CounterBidDto

---

## LoadTendersController

**Route prefix:** `load-tenders`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/load-tenders` | Create tender | ADMIN, DISPATCHER, OPERATIONS_MANAGER |
| GET | `/load-tenders` | List tenders (filter by loadId/status) | ADMIN, DISPATCHER, SALES_MANAGER, OPERATIONS_MANAGER, CARRIER_MANAGER |
| GET | `/load-tenders/carrier/:carrierId/active` | Get active tenders for carrier | ADMIN, DISPATCHER, SALES_MANAGER, OPERATIONS_MANAGER, CARRIER_MANAGER |
| GET | `/load-tenders/:id` | Get tender by ID | ADMIN, DISPATCHER, SALES_MANAGER, OPERATIONS_MANAGER, CARRIER_MANAGER |
| PUT | `/load-tenders/:id` | Update tender | ADMIN, DISPATCHER, OPERATIONS_MANAGER |
| PUT | `/load-tenders/:id/cancel` | Cancel tender | ADMIN, DISPATCHER, OPERATIONS_MANAGER |
| POST | `/load-tenders/respond` | Respond to tender | ADMIN, DISPATCHER, CARRIER_MANAGER |

**DTOs:** CreateLoadTenderDto, UpdateLoadTenderDto, RespondToTenderDto

---

## AccountsController

**Route prefix:** `load-board/accounts`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/load-board/accounts` | List load board accounts | JWT only |
| POST | `/load-board/accounts` | Create account | JWT only |
| GET | `/load-board/accounts/:id` | Get account by ID | JWT only |
| PUT | `/load-board/accounts/:id` | Update account | JWT only |
| DELETE | `/load-board/accounts/:id` | Delete account | JWT only |
| POST | `/load-board/accounts/:id/test` | Test connection | JWT only |

**DTOs:** AccountQueryDto, CreateAccountDto, UpdateAccountDto

---

## AnalyticsController

**Route prefix:** `load-board/analytics`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/load-board/analytics/posts` | Get post metrics | JWT only |
| GET | `/load-board/analytics/leads` | Get lead metrics | JWT only |
| GET | `/load-board/analytics/boards` | Compare load boards | JWT only |

---

## CapacityController

**Route prefix:** (uses full paths in decorators)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/load-board/capacity/search` | Search capacity | JWT only |
| GET | `/api/v1/load-board/capacity/searches` | List capacity searches | JWT only |
| GET | `/api/v1/load-board/capacity/searches/:id` | Get search by ID | JWT only |
| POST | `/api/v1/load-board/capacity/results/:id/contact` | Contact result | JWT only |

**DTOs:** CapacitySearchDto, ContactResultDto, SearchQueryDto

**Note:** This controller uses full path decorators (`@Controller()` with no prefix) instead of the standard route prefix pattern. This is inconsistent with the rest of the module.

---

## LeadsController

**Route prefix:** (uses full paths in decorators)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/load-board/leads` | List leads | JWT only |
| GET | `/api/v1/load-board/leads/:id` | Get lead by ID | JWT only |
| PUT | `/api/v1/load-board/leads/:id` | Update lead | JWT only |
| POST | `/api/v1/load-board/leads/:id/assign` | Assign lead | JWT only |
| POST | `/api/v1/load-board/leads/:id/contact` | Contact lead | JWT only |
| POST | `/api/v1/load-board/leads/:id/qualify` | Qualify lead | JWT only |
| POST | `/api/v1/load-board/leads/:id/convert` | Convert lead | JWT only |

**DTOs:** LeadQueryDto, UpdateLeadDto, AssignLeadDto, ContactLeadDto, QualifyLeadDto, ConvertLeadDto

---

## PostingController

**Route prefix:** (uses full paths in decorators)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/load-board/posts` | List posts | JWT only |
| POST | `/api/v1/load-board/posts` | Create post | JWT only |
| GET | `/api/v1/load-board/posts/:id` | Get post by ID | JWT only |
| PUT | `/api/v1/load-board/posts/:id` | Update post | JWT only |
| POST | `/api/v1/load-board/posts/:id/refresh` | Refresh post | JWT only |
| DELETE | `/api/v1/load-board/posts/:id` | Delete post | JWT only |
| POST | `/api/v1/load-board/posts/bulk` | Bulk post loads | JWT only |
| DELETE | `/api/v1/load-board/posts/bulk` | Bulk remove posts | JWT only |
| GET | `/api/v1/loads/:loadId/posts` | List posts for load | JWT only |

**DTOs:** PostLoadDto, UpdatePostDto, PostQueryDto, BulkPostDto, BulkRemoveDto

---

## RulesController

**Route prefix:** `load-board/rules`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/load-board/rules` | List posting rules | JWT only |
| POST | `/load-board/rules` | Create posting rule | JWT only |
| GET | `/load-board/rules/:id` | Get rule by ID | JWT only |
| PUT | `/load-board/rules/:id` | Update rule | JWT only |
| DELETE | `/load-board/rules/:id` | Delete rule | JWT only |

**DTOs:** CreatePostingRuleDto, UpdatePostingRuleDto, RuleQueryDto

---

## Architecture Notes

- **9 controllers** with 59 endpoints total -- the largest module in the API
- Mixed routing patterns: some controllers use standard `@Controller('prefix')`, others use full path decorators with `@Controller()` and embed `/api/v1/` in the route
- Accounts represent external load board integrations (DAT, Truckstop, etc.)
- Capacity search enables finding available carriers on lanes
- Leads track carrier interest from load board postings through to conversion
- Rules automate posting behavior (auto-post, auto-refresh, auto-expire)
