# Service 21: Search

## Service Overview
The Search service provides full-text search capabilities across all system entities, enabling users to quickly find loads, customers, carriers, drivers, and any other data within Ultra TMS. It includes advanced query building, saved search management, and configurable search settings.

## Screens

| # | Screen | Type | Priority | Status |
|---|--------|------|----------|--------|
| 1 | Global Search | tool | P1 | Not Started |
| 2 | Advanced Search | form | P2 | Not Started |
| 3 | Saved Searches | list | P2 | Not Started |
| 4 | Search Settings | config | P2 | Not Started |

## Wave Assignment
**Wave:** Future

## Dependencies
- All entity services (loads, customers, carriers, etc.) for indexing
- Authentication & Authorization (Service 02) for role-based search filtering
- Config service for search configuration storage

## Notes
- Search indexing strategy (Elasticsearch, Meilisearch, etc.) TBD
- Must support real-time indexing for newly created/updated records
- Consider search result ranking and relevance scoring
