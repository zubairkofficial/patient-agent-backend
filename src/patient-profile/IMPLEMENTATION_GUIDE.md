# Patient Profile AI Generation - Implementation Guide

## Overview
This document describes the LangChain + OpenAI integration for generating comprehensive patient psychiatric profiles.

## Architecture

### Files Created

1. **schemas/patient-profile.schema.ts** - Zod schemas for validation
2. **patient-profile-ai.service.ts** - Core AI generation service
3. **dto/generate-patient-profile.dto.ts** - Request DTO
4. **Updated patient-profile.service.ts** - Added `generateProfile()` method
5. **Updated patient-profile.controller.ts** - Added `/generate` endpoint
6. **Updated patient-profile.module.ts** - Added necessary imports and providers

## Installation Required

Before using the AI generation feature, install the required dependencies:

```bash
npm install langchain @langchain/openai zod
npm install --save-dev @types/node
```

## Configuration

Add your OpenAI API key to your environment variables:

```env
OPENAI_API_KEY=your_api_key_here
```

## Usage

### API Endpoint

**POST** `/patient-profiles/generate`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "diagnosis_id": 8,
  "chief_complaint": "I just feel down all the time and can't get myself to care about things anymore."
}
```

**Response:**
```json
{
  "schema_version": "1.0",
  "case_metadata": { ... },
  "primary_diagnosis": { ... },
  "rule_out_diagnoses": [ ... ],
  "symptoms": [ ... ],
  "pertinent_negatives": [ ... ],
  "risk_assessment": { ... },
  "mental_status_audio_only": { ... },
  "interaction_style": { ... },
  "disclosure_policy": { ... },
  "treatment_options": { ... },
  "red_flag_triggers": [ ... ],
  "scoring_blueprint": { ... }
}
```

## Implementation Details

### PatientProfileAiService

#### Key Methods

1. **generatePatientProfile(input)**
   - Fetches diagnosis details from database
   - Retrieves all symptoms, treatments, and diagnoses
   - Builds a detailed prompt for OpenAI
   - Calls OpenAI API via LangChain
   - Validates response against Zod schema
   - Enriches response with `db_present` flags

2. **buildPrompt()**
   - Constructs comprehensive prompt with available database items
   - Includes instructions for JSON generation
   - Specifies severity constraints (0-3)
   - Provides structured output format

3. **enrichWithDbPresenceFlags()**
   - Marks symptoms as `db_present: true/false`
   - Marks diagnoses as `db_present: true/false`
   - Marks treatments as `db_present: true/false`
   - Only checks database presence, doesn't filter

### Data Model

#### db_present Property

The system adds a `db_present` property to:
- **Symptoms** - `true` if symptom ID exists in database
- **Diagnoses** (primary and rule-out) - `true` if diagnosis ID exists in database
- **Treatments** - `true` if treatment ID exists in database

This allows tracking which items are database-sourced vs AI-generated.

#### Severity Scale

All symptoms use a 0-3 severity scale:
- **0** - Not present or minimal
- **1** - Mild
- **2** - Moderate
- **3** - Severe

### Role-Based Access

The `/generate` endpoint requires:
- **Authentication**: JWT token (JwtAuthGuard)
- **Authorization**: ADMIN role (RolesGuard)

## Completing the Implementation

### Step 1: Implement callOpenAI() Method

In `patient-profile-ai.service.ts`, replace the `callOpenAI()` method:

```typescript
private async callOpenAI(prompt: string): Promise<string> {
  import { ChatOpenAI } from '@langchain/openai';
  import { HumanMessage } from '@langchain/core/messages';

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4',
    temperature: 0.7,
  });

  const message = new HumanMessage(prompt);
  const response = await model.invoke([message]);
  
  return response.content as string;
}
```

### Step 2: Configure Environment

Add to your `.env` file:

```env
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Test

```bash
curl -X POST http://localhost:3000/patient-profiles/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosis_id": 8,
    "chief_complaint": "I just feel down all the time and cannot care about things anymore."
  }'
```

## Error Handling

The service handles:
- Missing diagnosis ID
- Invalid JSON responses from OpenAI
- Schema validation failures
- Database connection errors

## Performance Considerations

1. **Caching**: Consider caching database queries for frequently accessed symptoms/treatments
2. **Timeouts**: OpenAI calls may take 10-30 seconds; set appropriate timeouts
3. **Rate Limiting**: Implement rate limiting to avoid OpenAI API quotas

## Security Considerations

1. Only ADMIN users can generate profiles
2. JWT token required for all requests
3. API key stored in environment variables (never in code)
4. Input validation via DTOs and class-validator
5. Output validation via Zod schemas

## Future Enhancements

1. Add streaming responses for real-time feedback
2. Implement caching for repeated diagnoses
3. Add batch generation for multiple profiles
4. Support for different OpenAI models
5. Add cost tracking for API calls
6. Implement profile versioning
7. Add audit logging for generated profiles
