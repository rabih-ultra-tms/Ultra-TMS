# P2S-017: Global Search Enhancement

**Priority:** P2
**Service:** Search
**Scope:** Enhanced global search across all entities with Elasticsearch

## Current State
Individual list pages have their own search. No global search across all entity types. Elasticsearch is available in the stack.

## Requirements
- Command palette (Cmd/Ctrl+K) for global search
- Search across loads, carriers, orders, invoices, customers, contacts
- Result grouping by entity type
- Recent searches
- Keyboard navigation through results
- Quick actions from search results (view, edit)

## Acceptance Criteria
- [ ] Command palette opens with Cmd/Ctrl+K
- [ ] Search returns results from all entity types
- [ ] Results grouped by type with counts
- [ ] Recent searches shown
- [ ] Keyboard navigation (up/down/enter)
- [ ] Quick actions available
- [ ] Sub-200ms search response time

## Dependencies
- Elasticsearch integration
- Search indexing for all entities

## Estimated Effort
L
