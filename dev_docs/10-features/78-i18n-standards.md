# 73 - Internationalization (i18n) Standards

**Multi-language support for the 3PL Platform with Spanish priority**

---

## âš ï¸ CLAUDE CODE: i18n Requirements

1. **NEVER hardcode user-facing strings** - Always use translation keys
2. **Spanish is priority #1** - Required for Hispanic driver population
3. **All dates, times, currencies, numbers must be locale-aware**
4. **Driver mobile app MUST support Spanish from day one**

---

## Why This Matters

The US trucking industry has a significant Hispanic driver population. Many owner-operators and drivers prefer Spanish interfaces. Supporting Spanish from day one:

- Expands addressable market significantly
- Reduces support calls from language confusion
- Differentiates from competitors who only support English
- Required for Driver Portal/Mobile (doc 72, screens 14.01-14.10)

---

## Supported Locales (Phase A)

| Locale  | Language         | Priority | Notes                         |
| ------- | ---------------- | -------- | ----------------------------- |
| `en-US` | English (US)     | Default  | All portals                   |
| `es-MX` | Spanish (Mexico) | High     | Driver portal, Carrier portal |
| `es-US` | Spanish (US)     | High     | Fallback for es-MX            |

### Future Phases

- `fr-CA` - French Canadian (Phase D: Cross-border)
- `pt-BR` - Portuguese Brazil (Phase E: Expansion)

---

## Tech Stack

```
Frontend: next-intl (or react-i18next)
Backend: nestjs-i18n
Storage: JSON files (can migrate to DB later)
```

---

## Project Structure

```
apps/
â”œâ”€â”€ web/
â”‚   â”œâ”€â”€ messages/
â”‚   â”‚   â”œâ”€â”€ en/
â”‚   â”‚   â”‚   â”œâ”€â”€ common.json
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.json
â”‚   â”‚   â”‚   â”œâ”€â”€ carriers.json
â”‚   â”‚   â”‚   â”œâ”€â”€ loads.json
â”‚   â”‚   â”‚   â”œâ”€â”€ driver.json
â”‚   â”‚   â”‚   â””â”€â”€ errors.json
â”‚   â”‚   â”œâ”€â”€ es/
â”‚   â”‚   â”‚   â”œâ”€â”€ common.json
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.json
â”‚   â”‚   â”‚   â”œâ”€â”€ carriers.json
â”‚   â”‚   â”‚   â”œâ”€â”€ loads.json
â”‚   â”‚   â”‚   â”œâ”€â”€ driver.json
â”‚   â”‚   â”‚   â””â”€â”€ errors.json
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â””â”€â”€ lib/
â”‚       â””â”€â”€ i18n.ts
â”‚
â”œâ”€â”€ api/
â”‚   â””â”€â”€ src/
â”‚       â””â”€â”€ i18n/
â”‚           â”œâ”€â”€ en/
â”‚           â”‚   â””â”€â”€ messages.json
â”‚           â””â”€â”€ es/
â”‚               â””â”€â”€ messages.json
```

---

## Translation File Structure

### Namespace Organization

```typescript
// messages/en/common.json
{
  "app": {
    "name": "FreightFlow",
    "tagline": "Modern Freight Management"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "loads": "Loads",
    "carriers": "Carriers",
    "settings": "Settings",
    "logout": "Log Out"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "import": "Import",
    "refresh": "Refresh",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "confirm": "Confirm"
  },
  "status": {
    "loading": "Loading...",
    "saving": "Saving...",
    "deleting": "Deleting...",
    "success": "Success",
    "error": "Error",
    "noData": "No data available"
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email",
    "minLength": "Must be at least {min} characters",
    "maxLength": "Must be no more than {max} characters"
  },
  "confirmation": {
    "delete": "Are you sure you want to delete this?",
    "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?"
  },
  "pagination": {
    "showing": "Showing {from} to {to} of {total}",
    "previous": "Previous",
    "next": "Next",
    "page": "Page {page} of {pages}"
  }
}
```

```typescript
// messages/es/common.json
{
  "app": {
    "name": "FreightFlow",
    "tagline": "GestiÃ³n de Carga Moderna"
  },
  "navigation": {
    "dashboard": "Panel",
    "loads": "Cargas",
    "carriers": "Transportistas",
    "settings": "ConfiguraciÃ³n",
    "logout": "Cerrar SesiÃ³n"
  },
  "actions": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear",
    "search": "Buscar",
    "filter": "Filtrar",
    "export": "Exportar",
    "import": "Importar",
    "refresh": "Actualizar",
    "back": "AtrÃ¡s",
    "next": "Siguiente",
    "submit": "Enviar",
    "confirm": "Confirmar"
  },
  "status": {
    "loading": "Cargando...",
    "saving": "Guardando...",
    "deleting": "Eliminando...",
    "success": "Ã‰xito",
    "error": "Error",
    "noData": "No hay datos disponibles"
  },
  "validation": {
    "required": "Este campo es obligatorio",
    "email": "Por favor ingrese un correo vÃ¡lido",
    "minLength": "Debe tener al menos {min} caracteres",
    "maxLength": "No debe exceder {max} caracteres"
  },
  "confirmation": {
    "delete": "Â¿EstÃ¡ seguro de que desea eliminar esto?",
    "unsavedChanges": "Tiene cambios sin guardar. Â¿EstÃ¡ seguro de que desea salir?"
  },
  "pagination": {
    "showing": "Mostrando {from} a {to} de {total}",
    "previous": "Anterior",
    "next": "Siguiente",
    "page": "PÃ¡gina {page} de {pages}"
  }
}
```

### Domain-Specific Namespaces

```typescript
// messages/en/loads.json
{
  "title": "Loads",
  "titleSingular": "Load",
  "fields": {
    "loadNumber": "Load #",
    "status": "Status",
    "origin": "Origin",
    "destination": "Destination",
    "pickupDate": "Pickup Date",
    "deliveryDate": "Delivery Date",
    "carrier": "Carrier",
    "driver": "Driver",
    "rate": "Rate",
    "equipment": "Equipment Type"
  },
  "status": {
    "PENDING": "Pending",
    "AVAILABLE": "Available",
    "COVERED": "Covered",
    "DISPATCHED": "Dispatched",
    "EN_ROUTE_PICKUP": "En Route to Pickup",
    "AT_PICKUP": "At Pickup",
    "LOADED": "Loaded",
    "EN_ROUTE_DELIVERY": "En Route to Delivery",
    "AT_DELIVERY": "At Delivery",
    "DELIVERED": "Delivered",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled"
  },
  "actions": {
    "createLoad": "Create Load",
    "dispatch": "Dispatch",
    "track": "Track",
    "updateStatus": "Update Status",
    "addStop": "Add Stop"
  },
  "messages": {
    "dispatched": "Load {loadNumber} has been dispatched",
    "statusUpdated": "Status updated to {status}",
    "noLoads": "No loads found"
  }
}

// messages/es/loads.json
{
  "title": "Cargas",
  "titleSingular": "Carga",
  "fields": {
    "loadNumber": "# de Carga",
    "status": "Estado",
    "origin": "Origen",
    "destination": "Destino",
    "pickupDate": "Fecha de Recogida",
    "deliveryDate": "Fecha de Entrega",
    "carrier": "Transportista",
    "driver": "Conductor",
    "rate": "Tarifa",
    "equipment": "Tipo de Equipo"
  },
  "status": {
    "PENDING": "Pendiente",
    "AVAILABLE": "Disponible",
    "COVERED": "Asignado",
    "DISPATCHED": "Despachado",
    "EN_ROUTE_PICKUP": "En Camino a Recogida",
    "AT_PICKUP": "En Punto de Recogida",
    "LOADED": "Cargado",
    "EN_ROUTE_DELIVERY": "En Camino a Entrega",
    "AT_DELIVERY": "En Punto de Entrega",
    "DELIVERED": "Entregado",
    "COMPLETED": "Completado",
    "CANCELLED": "Cancelado"
  },
  "actions": {
    "createLoad": "Crear Carga",
    "dispatch": "Despachar",
    "track": "Rastrear",
    "updateStatus": "Actualizar Estado",
    "addStop": "Agregar Parada"
  },
  "messages": {
    "dispatched": "La carga {loadNumber} ha sido despachada",
    "statusUpdated": "Estado actualizado a {status}",
    "noLoads": "No se encontraron cargas"
  }
}
```

### Driver-Specific (Mobile Priority)

```typescript
// messages/en/driver.json
{
  "home": {
    "welcome": "Welcome, {name}",
    "currentLoad": "Current Load",
    "nextStop": "Next Stop",
    "noActiveLoad": "No active load assigned"
  },
  "navigation": {
    "startNavigation": "Start Navigation",
    "eta": "ETA: {time}",
    "miles": "{miles} miles",
    "kilometers": "{km} km"
  },
  "status": {
    "updateStatus": "Update Status",
    "arrivedPickup": "Arrived at Pickup",
    "departedPickup": "Departed Pickup",
    "arrivedDelivery": "Arrived at Delivery",
    "delivered": "Delivered"
  },
  "pod": {
    "capturePOD": "Capture POD",
    "takePhoto": "Take Photo",
    "getSignature": "Get Signature",
    "uploadDocument": "Upload Document",
    "podSubmitted": "POD submitted successfully"
  },
  "messages": {
    "newMessage": "New message from dispatch",
    "reply": "Reply",
    "viewAll": "View All Messages"
  }
}

// messages/es/driver.json
{
  "home": {
    "welcome": "Bienvenido, {name}",
    "currentLoad": "Carga Actual",
    "nextStop": "PrÃ³xima Parada",
    "noActiveLoad": "No hay carga activa asignada"
  },
  "navigation": {
    "startNavigation": "Iniciar NavegaciÃ³n",
    "eta": "Llegada: {time}",
    "miles": "{miles} millas",
    "kilometers": "{km} km"
  },
  "status": {
    "updateStatus": "Actualizar Estado",
    "arrivedPickup": "LleguÃ© a Recogida",
    "departedPickup": "SalÃ­ de Recogida",
    "arrivedDelivery": "LleguÃ© a Entrega",
    "delivered": "Entregado"
  },
  "pod": {
    "capturePOD": "Capturar POD",
    "takePhoto": "Tomar Foto",
    "getSignature": "Obtener Firma",
    "uploadDocument": "Subir Documento",
    "podSubmitted": "POD enviado exitosamente"
  },
  "messages": {
    "newMessage": "Nuevo mensaje de despacho",
    "reply": "Responder",
    "viewAll": "Ver Todos los Mensajes"
  }
}
```

---

## Frontend Implementation

### Setup (next-intl)

```typescript
// lib/i18n.ts
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}`)).default,
}));
```

### Middleware

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true, // Auto-detect from browser
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### Using Translations in Components

```typescript
// âœ… CORRECT - Always use translation hook
'use client';

import { useTranslations } from 'next-intl';

export function LoadsPage() {
  const t = useTranslations('loads');
  const tCommon = useTranslations('common');

  return (
    <div>
      <h1>{t('title')}</h1>

      <Button onClick={handleCreate}>
        {t('actions.createLoad')}
      </Button>

      {loads.length === 0 && (
        <EmptyState message={t('messages.noLoads')} />
      )}

      <Button onClick={handleSave}>
        {tCommon('actions.save')}
      </Button>
    </div>
  );
}

// âŒ WRONG - Hardcoded strings
export function LoadsPageBad() {
  return (
    <div>
      <h1>Loads</h1>  {/* NEVER DO THIS */}
      <Button>Create Load</Button>  {/* NEVER DO THIS */}
    </div>
  );
}
```

### Interpolation & Pluralization

```typescript
// Translation file
{
  "items": {
    "count": "{count, plural, =0 {No items} =1 {1 item} other {# items}}",
    "selected": "{count} {count, plural, =1 {item} other {items}} selected"
  },
  "greeting": "Hello, {name}!",
  "lastUpdated": "Last updated {date, date, medium} at {date, time, short}"
}

// Usage
const t = useTranslations('items');

t('count', { count: 0 });  // "No items"
t('count', { count: 1 });  // "1 item"
t('count', { count: 5 });  // "5 items"

t('selected', { count: 3 });  // "3 items selected"

t('greeting', { name: 'Carlos' });  // "Hello, Carlos!"

t('lastUpdated', { date: new Date() });  // "Last updated Jan 5, 2026 at 2:30 PM"
```

---

## Date, Time, Currency, Number Formatting

### Formatter Utilities

```typescript
// lib/formatters.ts
import { useLocale } from 'next-intl';

export function useFormatters() {
  const locale = useLocale();

  return {
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        ...options,
      }).format(d);
    },

    formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, {
        timeStyle: 'short',
        ...options,
      }).format(d);
    },

    formatDateTime: (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    },

    formatCurrency: (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    },

    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale, options).format(num);
    },

    formatDistance: (miles: number) => {
      // US uses miles, others use km
      if (locale.startsWith('en-US')) {
        return `${new Intl.NumberFormat(locale).format(miles)} mi`;
      }
      const km = miles * 1.60934;
      return `${new Intl.NumberFormat(locale).format(Math.round(km))} km`;
    },

    formatWeight: (pounds: number) => {
      if (locale.startsWith('en-US')) {
        return `${new Intl.NumberFormat(locale).format(pounds)} lbs`;
      }
      const kg = pounds * 0.453592;
      return `${new Intl.NumberFormat(locale).format(Math.round(kg))} kg`;
    },
  };
}
```

### Usage in Components

```typescript
function LoadCard({ load }: { load: Load }) {
  const { formatDate, formatCurrency, formatDistance } = useFormatters();

  return (
    <Card>
      <p>Pickup: {formatDate(load.pickupDate)}</p>
      <p>Rate: {formatCurrency(load.rate)}</p>
      <p>Distance: {formatDistance(load.miles)}</p>
    </Card>
  );
}

// English: "Pickup: Jan 5, 2026 | Rate: $2,500.00 | Distance: 450 mi"
// Spanish: "Pickup: 5 ene 2026 | Rate: $2,500.00 | Distance: 724 km"
```

---

## Backend Implementation (NestJS)

### Setup

```typescript
// app.module.ts
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
})
export class AppModule {}
```

### Using in Services/Controllers

```typescript
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class LoadService {
  constructor(private readonly i18n: I18nService) {}

  async dispatch(loadId: string, lang: string) {
    // ... dispatch logic

    return {
      message: this.i18n.t('loads.messages.dispatched', {
        args: { loadNumber: load.loadNumber },
        lang,
      }),
    };
  }
}

@Controller('api/v1/loads')
export class LoadController {
  @Post(':id/dispatch')
  async dispatch(
    @Param('id') id: string,
    @I18nLang() lang: string // Auto-resolved from request
  ) {
    return this.loadService.dispatch(id, lang);
  }
}
```

### Error Messages

```typescript
// i18n/en/errors.json
{
  "notFound": "{entity} not found",
  "unauthorized": "You are not authorized to perform this action",
  "validationFailed": "Validation failed",
  "duplicateEntry": "{field} already exists",
  "loadAlreadyDispatched": "Load {loadNumber} is already dispatched"
}

// i18n/es/errors.json
{
  "notFound": "{entity} no encontrado",
  "unauthorized": "No estÃ¡ autorizado para realizar esta acciÃ³n",
  "validationFailed": "Error de validaciÃ³n",
  "duplicateEntry": "{field} ya existe",
  "loadAlreadyDispatched": "La carga {loadNumber} ya estÃ¡ despachada"
}

// Usage
throw new NotFoundException(
  this.i18n.t('errors.notFound', { args: { entity: 'Carrier' }, lang })
);
```

---

## User Language Preference

### Store in User Profile

```prisma
// schema.prisma
model User {
  id              String   @id @default(cuid())
  // ... other fields
  preferredLocale String   @default("en")  // 'en' | 'es'
  timezone        String   @default("America/Chicago")
}
```

### API Endpoint

```typescript
// Update user preference
PUT /api/v1/users/me/preferences
{
  "preferredLocale": "es",
  "timezone": "America/Mexico_City"
}
```

### Frontend: Language Switcher

```typescript
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const switchLocale = async (newLocale: string) => {
    // Update user preference in database
    await fetch('/api/v1/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferredLocale: newLocale }),
    });

    // Update URL
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Select value={locale} onValueChange={switchLocale}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">EspaÃ±ol</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

---

## Translation Workflow

### Adding New Strings

1. Add key to English file first
2. Add same key to Spanish file with translation
3. Use key in code with `t('key')`
4. Never commit code with missing translations

### Translation Audit Command

```bash
# Find hardcoded strings in TSX files
grep -rn ">[A-Z][a-z].*</" --include="*.tsx" | grep -v "className\|{t("

# Compare translation keys between locales
node scripts/check-translations.js
```

```typescript
// scripts/check-translations.js
const en = require('../messages/en/common.json');
const es = require('../messages/es/common.json');

function getKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object') return getKeys(value, fullKey);
    return fullKey;
  });
}

const enKeys = new Set(getKeys(en));
const esKeys = new Set(getKeys(es));

const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));

if (missingInEs.length) {
  console.log('Missing in Spanish:', missingInEs);
}
if (missingInEn.length) {
  console.log('Missing in English:', missingInEn);
}
```

---

## i18n Checklist

### Before Committing Any UI Code

- [ ] All user-facing strings use translation keys
- [ ] New keys added to BOTH en and es files
- [ ] Dates use `formatDate()` not `toLocaleDateString()`
- [ ] Currency uses `formatCurrency()` not template literals
- [ ] Numbers use `formatNumber()` for large numbers
- [ ] Pluralization handled correctly

### Before Release

- [ ] All translation files complete
- [ ] Run translation audit script
- [ ] Test UI in both English and Spanish
- [ ] Test date/currency formats in both locales
- [ ] Driver mobile app fully tested in Spanish

---

## Cross-References

- **Screen-API Registry (doc 72)**: Driver Portal screens 14.01-14.10 MUST support Spanish
- **UI Component Standards (doc 65)**: All button/label text must use translation keys
- **Frontend Architecture (doc 64)**: Page templates should show translation usage
- **Testing Strategy (doc 68)**: Add i18n tests for critical flows

---

## Navigation

- **Previous:** [Screen-API Contract Registry Part 2](./72-screen-api-contract-registry-part2.md)
- **Next:** [Real-Time & WebSocket Standards](./74-real-time-websocket-standards.md)
