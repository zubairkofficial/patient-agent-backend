# Database Models & API Update Summary

## Overview
Updated all database models, DTOs, services, and controllers to match the new specifications with proper field names, primary keys, and relationships.

---

## Model Changes

### 1. **Symptoms Model**
**Before:**
```typescript
@PrimaryKey code: string (unique)
label: string
description?: string
```

**After:**
```typescript
@PrimaryKey id: number (auto-increment)
code: string (unique)
name: string
description?: string | null
```

**Impact:** 
- Changed primary key from `code` to `id`
- Renamed `label` to `name`
- Updated relationship with SeverityScale (now uses `symptomId` instead of `symptomCode`)

---

### 2. **Diagnosis Model**
**Before:**
```typescript
@PrimaryKey code: string (unique)
label: string
clusterId?: number (FK)
gradingMode: GradingMode (ENUM)
description?: string
```

**After:**
```typescript
@PrimaryKey id: number (auto-increment)
code: string (unique)
name: string
clusterId?: number (FK, optional)
description?: string | null
```

**Impact:**
- Changed primary key from `code` to `id`
- Renamed `label` to `name`
- Removed `gradingMode` field (can be added later when enum values are defined)
- Now uses auto-increment ID for queries

---

### 3. **Cluster Model**
**Before:**
```typescript
@PrimaryKey id: number
name: string
description?: string | null
```

**After:**
```typescript
@PrimaryKey id: number
name: string
```

**Impact:**
- Removed `description` field (simplified model)
- Kept auto-increment ID and name

---

### 4. **Treatments Model**
**Before:**
```typescript
@PrimaryKey code: string (unique)
label: string
type: TreatmentType (ENUM)
description?: string | null
```

**After:**
```typescript
@PrimaryKey id: number (auto-increment)
code: string (unique)
name: string
description?: string | null
diagnosisId?: number (FK, optional)
clusterId?: number (FK, optional)
```

**Impact:**
- Changed primary key from `code` to `id`
- Renamed `label` to `name`
- Removed `type` field (TreatmentType enum)
- Added `diagnosisId` foreign key (optional, can link to specific diagnosis)
- Added `clusterId` foreign key (optional, can link to disease cluster)
- Now uses auto-increment ID for queries

---

### 5. **SeverityScale Model**
**Before:**
```typescript
@PrimaryKey id: number
name: string
symptomCode: string (FK to Symptoms.code)
```

**After:**
```typescript
@PrimaryKey id: number
name: string
symptomId: number (FK to Symptoms.id)
```

**Impact:**
- Updated foreign key from `symptomCode` to `symptomId`
- References new Symptoms.id primary key

---

## DTO Changes

### Create DTOs Updated:
| Entity | Changes |
|--------|---------|
| **Symptoms** | `label` → `name` |
| **Diagnosis** | `label` → `name`, Removed `gradingMode` |
| **Treatments** | `label` → `name`, Removed `type`, Added `diagnosisId`, Added `clusterId` |
| **Cluster** | Removed `description` |
| **SeverityScale** | `symptomCode` → `symptomId` |

### Update DTOs Updated:
Same changes as Create DTOs (optional fields)

---

## Service Response Format

All services now return standardized response objects:

```typescript
{
  success: boolean;
  message: string;
  data?: any;
}
```

### Example Responses:

**Create Success:**
```json
{
  "success": true,
  "message": "Cluster created successfully",
  "data": {
    "id": 1,
    "name": "Respiratory Diseases"
  }
}
```

**Fetch All:**
```json
{
  "success": true,
  "message": "Clusters fetched successfully",
  "data": [
    { "id": 1, "name": "Respiratory Diseases" },
    { "id": 2, "name": "Cardiovascular" }
  ]
}
```

**Delete:**
```json
{
  "success": true,
  "message": "Cluster deleted successfully"
}
```

---

## Controller Route Changes

### Diagnosis Routes:
- `GET /diagnoses/:code` → `GET /diagnoses/:id`
- `PATCH /diagnoses/:code` → `PATCH /diagnoses/:id`
- `DELETE /diagnoses/:code` → `DELETE /diagnoses/:id`
- Added `ParseIntPipe` for ID validation

### Symptoms Routes:
- `GET /symptoms/:code` → `GET /symptoms/:id`
- `PATCH /symptoms/:code` → `PATCH /symptoms/:id`
- `DELETE /symptoms/:code` → `DELETE /symptoms/:id`
- Added `ParseIntPipe` for ID validation

### Treatments Routes:
- `GET /treatments/:code` → `GET /treatments/:id`
- `PATCH /treatments/:code` → `PATCH /treatments/:id`
- `DELETE /treatments/:code` → `DELETE /treatments/:id`
- Added `ParseIntPipe` for ID validation

### Cluster Routes:
- Already used ID-based routing (no changes)

### SeverityScale Routes:
- Already used ID-based routing (no changes)

---

## API Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **POST** | `/clusters` | Create cluster | ADMIN |
| **GET** | `/clusters` | List all clusters | ADMIN, USER |
| **GET** | `/clusters/:id` | Get cluster by ID | ADMIN, USER |
| **PATCH** | `/clusters/:id` | Update cluster | ADMIN |
| **DELETE** | `/clusters/:id` | Delete cluster | ADMIN |
| **POST** | `/diagnoses` | Create diagnosis | ADMIN |
| **GET** | `/diagnoses` | List all diagnoses | ADMIN, USER |
| **GET** | `/diagnoses/:id` | Get diagnosis by ID | ADMIN, USER |
| **PATCH** | `/diagnoses/:id` | Update diagnosis | ADMIN |
| **DELETE** | `/diagnoses/:id` | Delete diagnosis | ADMIN |
| **POST** | `/symptoms` | Create symptom | ADMIN |
| **GET** | `/symptoms` | List all symptoms | ADMIN |
| **GET** | `/symptoms/:id` | Get symptom by ID | ADMIN |
| **PATCH** | `/symptoms/:id` | Update symptom | ADMIN |
| **DELETE** | `/symptoms/:id` | Delete symptom | ADMIN |
| **POST** | `/treatments` | Create treatment | ADMIN |
| **GET** | `/treatments` | List all treatments | ADMIN |
| **GET** | `/treatments/:id` | Get treatment by ID | ADMIN |
| **PATCH** | `/treatments/:id` | Update treatment | ADMIN |
| **DELETE** | `/treatments/:id` | Delete treatment | ADMIN |
| **POST** | `/severity-scales` | Create severity scale | ADMIN |
| **GET** | `/severity-scales` | List all severity scales | ADMIN |
| **GET** | `/severity-scales/:id` | Get severity scale by ID | ADMIN |
| **PATCH** | `/severity-scales/:id` | Update severity scale | ADMIN |
| **DELETE** | `/severity-scales/:id` | Delete severity scale | ADMIN |

---

## Request/Response Examples

### Create Diagnosis
**Request:**
```json
{
  "code": "RESP001",
  "name": "Acute Bronchitis",
  "clusterId": 1,
  "description": "Inflammation of the bronchial tubes..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagnosis created successfully",
  "data": {
    "id": 1,
    "code": "RESP001",
    "name": "Acute Bronchitis",
    "clusterId": 1,
    "description": "Inflammation of the bronchial tubes..."
  }
}
```

### Create Treatment
**Request:**
```json
{
  "code": "TREAT001",
  "name": "Amoxicillin",
  "description": "Broad-spectrum antibiotic...",
  "diagnosisId": 1,
  "clusterId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Treatment created successfully",
  "data": {
    "id": 1,
    "code": "TREAT001",
    "name": "Amoxicillin",
    "description": "Broad-spectrum antibiotic...",
    "diagnosisId": 1,
    "clusterId": 1
  }
}
```

### Create Symptom
**Request:**
```json
{
  "code": "SYM001",
  "name": "Cough",
  "description": "Persistent dry cough..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Symptom created successfully",
  "data": {
    "id": 1,
    "code": "SYM001",
    "name": "Cough",
    "description": "Persistent dry cough..."
  }
}
```

---

## Files Modified

### Models (5 files):
- `src/models/symptoms.model.ts`
- `src/models/diagnosis.model.ts`
- `src/models/cluster.model.ts`
- `src/models/treatments.model.ts`
- `src/models/severity-scale.model.ts`

### DTOs (10 files):
- `src/symptoms/dto/create-symptoms.dto.ts`
- `src/symptoms/dto/update-symptoms.dto.ts`
- `src/diagnosis/dto/create-diagnosis.dto.ts`
- `src/diagnosis/dto/update-diagnosis.dto.ts`
- `src/treatments/dto/create-treatments.dto.ts`
- `src/treatments/dto/update-treatments.dto.ts`
- `src/cluster/dto/create-cluster.dto.ts`
- `src/cluster/dto/update-cluster.dto.ts`
- `src/severity-scale/dto/create-severity-scale.dto.ts`
- `src/severity-scale/dto/update-severity-scale.dto.ts`

### Services (5 files):
- `src/cluster/cluster.service.ts`
- `src/diagnosis/diagnosis.service.ts`
- `src/symptoms/symptoms.service.ts`
- `src/treatments/treatments.service.ts`
- `src/severity-scale/severity-scale.service.ts`

### Controllers (5 files):
- `src/cluster/cluster.controller.ts` (no route changes, but already using ID)
- `src/diagnosis/diagnosis.controller.ts`
- `src/symptoms/symptoms.controller.ts`
- `src/treatments/treatments.controller.ts`
- `src/severity-scale/severity-scale.controller.ts` (no route changes, already using ID)

**Total Files Modified: 20**

---

## Next Steps

1. **Database Migration**: Run Sequelize migrations to update tables
2. **Testing**: Test all CRUD endpoints with new ID-based routing
3. **Frontend Update**: Update frontend code to use new field names (`name` instead of `label`)
4. **Documentation**: Update API documentation with new endpoints

---

## Notes

- All primary keys are now auto-increment integers for better performance
- `code` fields remain unique for business logic (diagnosis codes, treatment codes, symptom codes)
- Relationships now use ID-based foreign keys
- Standard response format ensures consistent API behavior
- All services now include success flag and message in responses
- Removed unused `TreatmentType` enum from treatments
- Can add back `gradingMode` to Diagnosis when enum values are finalized
