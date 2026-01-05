# 82 - Code Generation Templates

**Scaffolding scripts to accelerate development with your 2-dev team**

---

## âš ï¸ CLAUDE CODE: Use These Templates

1. **Don't build CRUD from scratch** - Use generators
2. **Templates follow all standards** - API, DB, Frontend patterns
3. **Customize after generation** - Templates are starting points
4. **Keep templates updated** - When standards change

---

## Why Code Generation?

With a 2-developer team working 30 hours/week each, efficiency is critical:

- **324 screens** to build across 34 services
- **~648 API endpoints** to implement
- Standard CRUD operations are repetitive
- Consistency is easier with templates

**Time savings estimate:** 2-4 hours per entity with generators vs manual

---

## Generator CLI

### Installation

```bash
# Create scripts directory
mkdir -p scripts/generators

# Add to package.json
{
  "scripts": {
    "generate": "ts-node scripts/generators/index.ts",
    "g:module": "ts-node scripts/generators/module.ts",
    "g:screen": "ts-node scripts/generators/screen.ts",
    "g:crud": "ts-node scripts/generators/crud.ts"
  }
}
```

### Usage

```bash
# Generate full CRUD module (backend + frontend)
npm run g:crud -- --name Carrier --plural Carriers

# Generate backend module only
npm run g:module -- --name Carrier

# Generate frontend screens only
npm run g:screen -- --name Carrier --type list
npm run g:screen -- --name Carrier --type detail
npm run g:screen -- --name Carrier --type form
```

---

## Backend Module Generator

### Generator Script

```typescript
// scripts/generators/module.ts

import * as fs from 'fs';
import * as path from 'path';

interface ModuleConfig {
  name: string; // e.g., "Carrier"
  plural: string; // e.g., "Carriers"
  apiPath: string; // e.g., "carriers"
  fields: FieldConfig[];
}

interface FieldConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'relation';
  required: boolean;
  unique?: boolean;
  enumValues?: string[];
  relationTo?: string;
}

const defaultFields: FieldConfig[] = [
  { name: 'name', type: 'string', required: true },
  {
    name: 'status',
    type: 'enum',
    required: true,
    enumValues: ['ACTIVE', 'INACTIVE'],
  },
];

function generateModule(config: ModuleConfig) {
  const { name, plural, apiPath } = config;
  const nameLower = name.toLowerCase();
  const modulePath = `apps/api/src/modules/${nameLower}`;

  // Create directory
  fs.mkdirSync(modulePath, { recursive: true });
  fs.mkdirSync(`${modulePath}/dto`, { recursive: true });

  // Generate files
  generateModuleFile(modulePath, config);
  generateControllerFile(modulePath, config);
  generateServiceFile(modulePath, config);
  generateDtoFiles(modulePath, config);

  console.log(`âœ… Generated module: ${name}`);
  console.log(`   Location: ${modulePath}`);
  console.log(`   Files created:`);
  console.log(`   - ${nameLower}.module.ts`);
  console.log(`   - ${nameLower}.controller.ts`);
  console.log(`   - ${nameLower}.service.ts`);
  console.log(`   - dto/create-${nameLower}.dto.ts`);
  console.log(`   - dto/update-${nameLower}.dto.ts`);
  console.log(`   - dto/query-${nameLower}.dto.ts`);
}

function generateModuleFile(modulePath: string, config: ModuleConfig) {
  const { name } = config;
  const content = `import { Module } from '@nestjs/common';
import { ${name}Controller } from './${name.toLowerCase()}.controller';
import { ${name}Service } from './${name.toLowerCase()}.service';

@Module({
  controllers: [${name}Controller],
  providers: [${name}Service],
  exports: [${name}Service],
})
export class ${name}Module {}
`;

  fs.writeFileSync(`${modulePath}/${name.toLowerCase()}.module.ts`, content);
}

function generateControllerFile(modulePath: string, config: ModuleConfig) {
  const { name, plural, apiPath } = config;
  const nameLower = name.toLowerCase();

  const content = `import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ${name}Service } from './${nameLower}.service';
import { Create${name}Dto } from './dto/create-${nameLower}.dto';
import { Update${name}Dto } from './dto/update-${nameLower}.dto';
import { Query${name}Dto } from './dto/query-${nameLower}.dto';

@Controller('api/v1/${apiPath}')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ${name}Controller {
  constructor(private readonly ${nameLower}Service: ${name}Service) {}

  @Get()
  @Roles('ADMIN', 'USER')
  async findAll(
    @Query() query: Query${name}Dto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.${nameLower}Service.findAll(query, user.tenantId);
    return {
      data: result.data,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (query.limit || 20)),
      },
    };
  }

  @Get(':id')
  @Roles('ADMIN', 'USER')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const ${nameLower} = await this.${nameLower}Service.findOne(id, user.tenantId);
    return { data: ${nameLower} };
  }

  @Post()
  @Roles('ADMIN')
  async create(
    @Body() dto: Create${name}Dto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const ${nameLower} = await this.${nameLower}Service.create(dto, user.tenantId, user.id);
    return { data: ${nameLower}, message: '${name} created successfully' };
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: Update${name}Dto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const ${nameLower} = await this.${nameLower}Service.update(id, dto, user.tenantId, user.id);
    return { data: ${nameLower}, message: '${name} updated successfully' };
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.${nameLower}Service.remove(id, user.tenantId);
    return { data: { deleted: true }, message: '${name} deleted successfully' };
  }
}
`;

  fs.writeFileSync(`${modulePath}/${nameLower}.controller.ts`, content);
}

function generateServiceFile(modulePath: string, config: ModuleConfig) {
  const { name } = config;
  const nameLower = name.toLowerCase();

  const content = `import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Create${name}Dto } from './dto/create-${nameLower}.dto';
import { Update${name}Dto } from './dto/update-${nameLower}.dto';
import { Query${name}Dto } from './dto/query-${nameLower}.dto';

@Injectable()
export class ${name}Service {
  constructor(private prisma: PrismaService) {}

  async findAll(query: Query${name}Dto, tenantId: string) {
    const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.${nameLower}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.${nameLower}.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string, tenantId: string) {
    const ${nameLower} = await this.prisma.${nameLower}.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!${nameLower}) {
      throw new NotFoundException('${name} not found');
    }

    return ${nameLower};
  }

  async create(dto: Create${name}Dto, tenantId: string, userId: string) {
    // Check for duplicates if needed
    // const existing = await this.prisma.${nameLower}.findFirst({
    //   where: { name: dto.name, tenantId, deletedAt: null },
    // });
    // if (existing) {
    //   throw new ConflictException('${name} with this name already exists');
    // }

    return this.prisma.${nameLower}.create({
      data: {
        ...dto,
        tenantId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async update(id: string, dto: Update${name}Dto, tenantId: string, userId: string) {
    await this.findOne(id, tenantId); // Verify exists

    return this.prisma.${nameLower}.update({
      where: { id },
      data: {
        ...dto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Verify exists

    // Soft delete
    await this.prisma.${nameLower}.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
`;

  fs.writeFileSync(`${modulePath}/${nameLower}.service.ts`, content);
}

function generateDtoFiles(modulePath: string, config: ModuleConfig) {
  const { name, fields } = config;
  const nameLower = name.toLowerCase();

  // Create DTO
  const createDto = `import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

export class Create${name}Dto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: string = 'ACTIVE';

  // Add more fields as needed
}
`;

  // Update DTO
  const updateDto = `import { PartialType } from '@nestjs/mapped-types';
import { Create${name}Dto } from './create-${nameLower}.dto';

export class Update${name}Dto extends PartialType(Create${name}Dto) {}
`;

  // Query DTO
  const queryDto = `import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class Query${name}Dto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
`;

  fs.writeFileSync(`${modulePath}/dto/create-${nameLower}.dto.ts`, createDto);
  fs.writeFileSync(`${modulePath}/dto/update-${nameLower}.dto.ts`, updateDto);
  fs.writeFileSync(`${modulePath}/dto/query-${nameLower}.dto.ts`, queryDto);
}

// CLI entry point
const args = process.argv.slice(2);
const nameArg = args.find((a) => a.startsWith('--name='));
const pluralArg = args.find((a) => a.startsWith('--plural='));

if (!nameArg) {
  console.error('Usage: npm run g:module -- --name=Carrier --plural=Carriers');
  process.exit(1);
}

const name = nameArg.split('=')[1];
const plural = pluralArg ? pluralArg.split('=')[1] : name + 's';
const apiPath = plural.toLowerCase();

generateModule({ name, plural, apiPath, fields: defaultFields });
```

---

## Frontend Screen Generator

### List Screen Template

```typescript
// scripts/generators/templates/list-page.template.ts

export function generateListPage(config: {
  name: string;
  plural: string;
  apiPath: string;
}) {
  const { name, plural, apiPath } = config;
  const nameLower = name.toLowerCase();

  return `'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { useToast } from '@/hooks/use-toast';
import { ${name} } from '@/types/${nameLower}';

export default function ${plural}Page() {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [${nameLower}s, set${plural}] = useState<${name}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      });

      const response = await fetch(\`/api/v1/${apiPath}?\${params}\`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ${nameLower}s');
      }

      const result = await response.json();
      set${plural}(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ${nameLower}?')) return;

    try {
      const response = await fetch(\`/api/v1/${apiPath}/\${id}\`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({ title: '${name} deleted successfully' });
      fetchData();
    } catch (err) {
      toast({ title: 'Failed to delete ${nameLower}', variant: 'destructive' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  // Render states
  if (loading && ${nameLower}s.length === 0) {
    return <LoadingState message="Loading ${nameLower}s..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="${plural}"
        description="Manage your ${nameLower}s"
        action={
          <Button onClick={() => router.push('/${apiPath}/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add ${name}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ${nameLower}s..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {${nameLower}s.length === 0 ? (
        <EmptyState
          title="No ${nameLower}s found"
          description="Get started by creating your first ${nameLower}."
          action={
            <Button onClick={() => router.push('/${apiPath}/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add ${name}
            </Button>
          }
        />
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {${nameLower}s.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(\`/${apiPath}/\${item.id}\`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(\`/${apiPath}/\${item.id}/edit\`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
`;
}
```

### Form Screen Template

```typescript
// scripts/generators/templates/form-page.template.ts

export function generateFormPage(config: { name: string; apiPath: string }) {
  const { name, apiPath } = config;
  const nameLower = name.toLowerCase();

  return `'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { useToast } from '@/hooks/use-toast';

const ${nameLower}Schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  // Add more fields as needed
});

type ${name}FormValues = z.infer<typeof ${nameLower}Schema>;

interface ${name}FormPageProps {
  mode: 'create' | 'edit';
}

export default function ${name}FormPage({ mode }: ${name}FormPageProps) {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);

  const id = params?.id as string;
  const isEdit = mode === 'edit';

  const form = useForm<${name}FormValues>({
    resolver: zodResolver(${nameLower}Schema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
    },
  });

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && id) {
      fetch(\`/api/v1/${apiPath}/\${id}\`)
        .then((res) => res.json())
        .then((result) => {
          form.reset(result.data);
        })
        .catch((err) => {
          toast({ title: 'Failed to load ${nameLower}', variant: 'destructive' });
          router.push('/${apiPath}');
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, id, form, router, toast]);

  const onSubmit = async (values: ${name}FormValues) => {
    try {
      setSubmitting(true);

      const url = isEdit ? \`/api/v1/${apiPath}/\${id}\` : '/api/v1/${apiPath}';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      const result = await response.json();
      toast({ title: result.message || '${name} saved successfully' });
      router.push(\`/${apiPath}/\${result.data.id}\`);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Failed to save ${nameLower}',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading ${nameLower}..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit ${name}' : 'New ${name}'}
        description={isEdit ? 'Update ${nameLower} details' : 'Create a new ${nameLower}'}
        backHref="/${apiPath}"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Add more fields here */}

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update ${name}' : 'Create ${name}'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/${apiPath}')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
`;
}
```

---

## Prisma Schema Generator

```typescript
// scripts/generators/prisma-model.ts

export function generatePrismaModel(config: {
  name: string;
  fields: Array<{ name: string; type: string; required: boolean }>;
}) {
  const { name, fields } = config;

  return `model ${name} {
  id            String    @id @default(cuid())
  
  // Core fields
${fields.map((f) => `  ${f.name.padEnd(14)} ${f.type}${f.required ? '' : '?'}`).join('\n')}
  
  // Status
  status        String    @default("ACTIVE")
  
  // Migration support (REQUIRED - see doc 63)
  externalId    String?
  sourceSystem  String?
  customFields  Json?
  
  // Audit fields (REQUIRED - see doc 63)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  createdById   String?
  updatedById   String?
  
  // Multi-tenancy (REQUIRED - see doc 63)
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
  @@index([status])
  @@index([deletedAt])
}
`;
}
```

---

## Full CRUD Generator

```bash
# Usage: npm run g:crud -- --name=Carrier --plural=Carriers

# This generates:
# 1. Prisma model (print to console, manual add)
# 2. Backend module (controller, service, DTOs)
# 3. Frontend pages (list, detail, form)
# 4. Types file
```

```typescript
// scripts/generators/crud.ts

import { generateModule } from './module';
import { generateListPage } from './templates/list-page.template';
import { generateFormPage } from './templates/form-page.template';
import { generatePrismaModel } from './prisma-model';
import * as fs from 'fs';

function generateCrud(name: string, plural: string) {
  const apiPath = plural.toLowerCase();
  const nameLower = name.toLowerCase();

  console.log(`\nðŸš€ Generating CRUD for ${name}...\n`);

  // 1. Generate backend
  generateModule({ name, plural, apiPath, fields: [] });

  // 2. Generate frontend
  const frontendPath = `apps/web/app/(dashboard)/${apiPath}`;
  fs.mkdirSync(frontendPath, { recursive: true });
  fs.mkdirSync(`${frontendPath}/[id]`, { recursive: true });
  fs.mkdirSync(`${frontendPath}/[id]/edit`, { recursive: true });
  fs.mkdirSync(`${frontendPath}/new`, { recursive: true });

  // List page
  fs.writeFileSync(
    `${frontendPath}/page.tsx`,
    generateListPage({ name, plural, apiPath })
  );

  // New page
  fs.writeFileSync(
    `${frontendPath}/new/page.tsx`,
    `import ${name}FormPage from '@/components/${nameLower}/${nameLower}-form';\n\nexport default function New${name}Page() {\n  return <${name}FormPage mode="create" />;\n}\n`
  );

  // Edit page
  fs.writeFileSync(
    `${frontendPath}/[id]/edit/page.tsx`,
    `import ${name}FormPage from '@/components/${nameLower}/${nameLower}-form';\n\nexport default function Edit${name}Page() {\n  return <${name}FormPage mode="edit" />;\n}\n`
  );

  // 3. Generate types
  fs.mkdirSync('apps/web/types', { recursive: true });
  fs.writeFileSync(
    `apps/web/types/${nameLower}.ts`,
    `export interface ${name} {\n  id: string;\n  name: string;\n  status: 'ACTIVE' | 'INACTIVE';\n  createdAt: string;\n  updatedAt: string;\n}\n`
  );

  // 4. Print Prisma model
  console.log('\nðŸ“‹ Add this to your Prisma schema:\n');
  console.log(
    generatePrismaModel({
      name,
      fields: [{ name: 'name', type: 'String', required: true }],
    })
  );

  console.log('\nâœ… CRUD generation complete!\n');
  console.log('Next steps:');
  console.log('1. Add the Prisma model above to schema.prisma');
  console.log('2. Run: npx prisma migrate dev --name add_${nameLower}');
  console.log(`3. Add ${name}Module to app.module.ts imports`);
  console.log(`4. Test the API: GET /api/v1/${apiPath}`);
}

// CLI
const args = process.argv.slice(2);
const nameArg = args.find((a) => a.startsWith('--name='));
const pluralArg = args.find((a) => a.startsWith('--plural='));

if (!nameArg) {
  console.error('Usage: npm run g:crud -- --name=Carrier --plural=Carriers');
  process.exit(1);
}

const name = nameArg.split('=')[1];
const plural = pluralArg ? pluralArg.split('=')[1] : name + 's';

generateCrud(name, plural);
```

---

## Quick Reference

### Generate Common Entities

```bash
# Core entities
npm run g:crud -- --name=Carrier --plural=Carriers
npm run g:crud -- --name=Load --plural=Loads
npm run g:crud -- --name=Customer --plural=Customers
npm run g:crud -- --name=Driver --plural=Drivers

# Accounting
npm run g:crud -- --name=Invoice --plural=Invoices
npm run g:crud -- --name=Payment --plural=Payments

# CRM
npm run g:crud -- --name=Lead --plural=Leads
npm run g:crud -- --name=Company --plural=Companies
npm run g:crud -- --name=Contact --plural=Contacts
```

---

## Cross-References

- **API Standards (doc 62)**: Generated controllers follow these patterns
- **Database Standards (doc 63)**: Generated models include required fields
- **Frontend Standards (doc 64)**: Generated pages follow templates
- **UI Standards (doc 65)**: All buttons have working actions
- **Screen-API Registry (doc 72)**: Update status after generation

---

## Navigation

- **Previous:** [Background Jobs & Queue Standards](./81-background-jobs-standards.md)
- **Next:** [Environment & Secrets Management](./83-environment-secrets-management.md)
